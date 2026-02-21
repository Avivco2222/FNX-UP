'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface ParsedResumeSkill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface ParsedResume {
  fullName: string;
  summary: string;
  skills: ParsedResumeSkill[];
}

export interface ParseResumeResult {
  success: boolean;
  data: ParsedResume | null;
  error: string | null;
}

// ----------------------------------------------------------------
// Prompt
// ----------------------------------------------------------------

const SYSTEM_INSTRUCTION = `You are an expert Career Coach and Resume Analyst.
Your task is to analyze a resume text and extract:

1. The candidate's full name.
2. A professional summary (2–3 sentences describing their career profile).
3. A list of core skills (technical AND soft skills) with estimated proficiency levels.

For proficiency levels (1–5):
- 1 = Beginner (mentioned once, limited context)
- 2 = Elementary (some exposure, < 1 year)
- 3 = Intermediate (1–3 years practical experience)
- 4 = Advanced (3–5+ years, leadership/deep context)
- 5 = Expert (recognized authority, extensive track record)

Infer proficiency from:
- Years of experience with the skill
- Job titles and responsibilities
- Certifications or education
- Context of usage (production vs learning)

Return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "fullName": "string — the candidate's full name",
  "summary": "string — 2-3 sentence professional summary",
  "skills": [
    {
      "name": "string — canonical skill name (e.g., 'React', 'Project Management', 'Python')",
      "level": 3
    }
  ]
}

Important:
- Include BOTH technical skills (languages, frameworks, tools) AND soft skills (leadership, communication).
- Normalize skill names to their canonical form (e.g., "JS" → "JavaScript", "ML" → "Machine Learning").
- Aim for 8–20 skills. Prioritize the most relevant ones.
- If no name is found, use "Unknown Candidate".`;

// ----------------------------------------------------------------
// Server Action
// ----------------------------------------------------------------

/**
 * Parse a PDF resume file:
 *   FormData → pdf-parse (text extraction) → Gemini AI → ParsedResume
 */
export async function parseResume(
  formData: FormData,
): Promise<ParseResumeResult> {
  // 1. Extract file from FormData
  const file = formData.get('resume') as File | null;

  if (!file || file.size === 0) {
    return { success: false, data: null, error: 'No file was uploaded.' };
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
    return {
      success: false,
      data: null,
      error: 'Please upload a PDF or text file.',
    };
  }

  // Max 10 MB
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      data: null,
      error: 'File is too large. Maximum size is 10 MB.',
    };
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      data: null,
      error: 'Missing GOOGLE_API_KEY environment variable.',
    };
  }

  try {
    // 2. Convert File → Buffer → Text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText: string;

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      rawText = buffer.toString('utf-8');
    } else {
      // Use pdf-parse v2 (class-based API) for PDF files
      // Dynamic import to keep it server-only and avoid bundling issues
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      rawText = textResult.text;
      await parser.destroy();
    }

    if (!rawText || rawText.trim().length < 30) {
      return {
        success: false,
        data: null,
        error: 'Could not extract meaningful text from the file. Please ensure the PDF is not image-based.',
      };
    }

    // 3. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(
      `Analyze this resume and extract structured data:\n\n${rawText}`,
    );
    const responseText = result.response.text();

    // 4. Parse & Validate
    const parsed: unknown = JSON.parse(responseText);

    if (!isValidParsedResume(parsed)) {
      return {
        success: false,
        data: null,
        error: 'AI returned data that does not match the expected schema. Please try again.',
      };
    }

    // Normalize skill levels to 1–5 range
    const normalized: ParsedResume = {
      fullName: parsed.fullName || 'Unknown Candidate',
      summary: parsed.summary || '',
      skills: parsed.skills.map((s) => ({
        name: s.name.trim(),
        level: Math.max(1, Math.min(5, Math.round(s.level))) as 1 | 2 | 3 | 4 | 5,
      })),
    };

    return { success: true, data: normalized, error: null };
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? `Failed to parse AI response as JSON: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'An unexpected error occurred while parsing the resume.';

    console.error('Resume parsing error:', err);
    return { success: false, data: null, error: message };
  }
}

// ----------------------------------------------------------------
// Validation
// ----------------------------------------------------------------

function isValidParsedResume(obj: unknown): obj is ParsedResume {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;

  if (typeof o.fullName !== 'string') return false;
  if (typeof o.summary !== 'string') return false;
  if (!Array.isArray(o.skills) || o.skills.length === 0) return false;

  for (const skill of o.skills) {
    if (typeof skill !== 'object' || skill === null) return false;
    const s = skill as Record<string, unknown>;
    if (typeof s.name !== 'string' || !s.name.trim()) return false;
    if (typeof s.level !== 'number') return false;
  }

  return true;
}
