'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface ParsedJobSkill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  is_mandatory: boolean;
  is_new: boolean;
}

export interface ParsedJob {
  title: string;
  department: string;
  description_summary: string;
  skills: ParsedJobSkill[];
}

export interface ParseJobResult {
  success: boolean;
  data: ParsedJob | null;
  error: string | null;
}

// ----------------------------------------------------------------
// Prompt
// ----------------------------------------------------------------

const SYSTEM_INSTRUCTION = `You are an expert HR Taxonomist and Job Description analyst.
Your task is to extract structured job details and a list of required skills from unstructured job description text.

For each skill:
- Estimate the required proficiency level on a scale of 1–5 (1 = Novice, 5 = Expert).
- Determine whether the skill is mandatory (true) or nice-to-have (false).
- Set is_new to false unless the skill is extremely niche or clearly a brand-new emerging technology.

Return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "title": "string — the job title",
  "department": "string — the department or team (use 'General' if unclear)",
  "description_summary": "string — a concise 2-3 sentence summary of the role",
  "skills": [
    {
      "name": "string — canonical skill name",
      "level": 1,
      "is_mandatory": true,
      "is_new": false
    }
  ]
}`;

// ----------------------------------------------------------------
// Server Action
// ----------------------------------------------------------------

/**
 * Parse unstructured job description text into a structured ParsedJob object
 * using Google Gemini (Flash model).
 */
export async function parseJobDescription(
  rawText: string,
): Promise<ParseJobResult> {
  if (!rawText.trim()) {
    return { success: false, data: null, error: 'Job description text is empty.' };
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
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(rawText);
    const responseText = result.response.text();

    // Parse and validate the JSON response
    const parsed: unknown = JSON.parse(responseText);

    if (!isValidParsedJob(parsed)) {
      return {
        success: false,
        data: null,
        error: 'Gemini returned JSON that does not match the expected schema.',
      };
    }

    // Normalize skill levels to 1–5 range and default is_new
    const normalized: ParsedJob = {
      title: parsed.title,
      department: parsed.department || 'General',
      description_summary: parsed.description_summary,
      skills: parsed.skills.map((s) => ({
        name: s.name,
        level: Math.max(1, Math.min(5, Math.round(s.level))) as 1 | 2 | 3 | 4 | 5,
        is_mandatory: Boolean(s.is_mandatory),
        is_new: Boolean(s.is_new ?? false),
      })),
    };

    return { success: true, data: normalized, error: null };
  } catch (err) {
    // Handle JSON parse errors, network errors, API errors gracefully
    const message =
      err instanceof SyntaxError
        ? `Failed to parse Gemini response as JSON: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'An unexpected error occurred while parsing the job description.';

    return { success: false, data: null, error: message };
  }
}

// ----------------------------------------------------------------
// Validation
// ----------------------------------------------------------------

/** Runtime type guard for the ParsedJob shape */
function isValidParsedJob(obj: unknown): obj is ParsedJob {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;

  if (typeof o.title !== 'string' || !o.title) return false;
  if (typeof o.description_summary !== 'string') return false;
  if (!Array.isArray(o.skills)) return false;

  for (const skill of o.skills) {
    if (typeof skill !== 'object' || skill === null) return false;
    const s = skill as Record<string, unknown>;
    if (typeof s.name !== 'string' || !s.name) return false;
    if (typeof s.level !== 'number') return false;
  }

  return true;
}
