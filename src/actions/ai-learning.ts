'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ================================================================
// Types
// ================================================================

export type LearningStepType = 'video' | 'article' | 'project' | 'exercise' | 'course';

export interface LearningStep {
  title: string;
  type: LearningStepType;
  duration: string; // e.g. "30 min", "2 hours"
  description: string;
}

export interface LearningPlan {
  skillName: string;
  steps: LearningStep[];
  estimatedTotal: string; // e.g. "4–5 hours"
}

export interface LearningPlanResult {
  success: boolean;
  data: LearningPlan | null;
  error: string | null;
}

// ================================================================
// Prompt
// ================================================================

const SYSTEM_INSTRUCTION = `You are an expert Learning & Development specialist.
Your task is to create a concise, practical micro-learning plan for a given skill.

Requirements:
- Provide exactly 3 actionable steps.
- Each step should be something the learner can start TODAY.
- Mix formats: e.g. video, article, hands-on project.
- Keep it focused and achievable (no 40-hour courses).
- Include a short, motivating description for each step.
- Estimate duration realistically.

Return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "steps": [
    {
      "title": "string — concise step title",
      "type": "video" | "article" | "project" | "exercise" | "course",
      "duration": "string — e.g. '30 min', '1 hour'",
      "description": "string — 1-2 sentence description of what to do"
    }
  ],
  "estimatedTotal": "string — total time estimate"
}`;

// ================================================================
// Server Action
// ================================================================

/**
 * Generate a 3-step micro-learning plan for a given skill using Gemini AI.
 */
export async function generateLearningPlan(
  skillName: string,
): Promise<LearningPlanResult> {
  if (!skillName.trim()) {
    return { success: false, data: null, error: 'Skill name is empty.' };
  }

  // ---- Demo mode ----
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return getDemoPlan(skillName);
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
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(
      `Create a micro-learning plan for the skill: "${skillName}". The learner currently has beginner-to-intermediate knowledge and wants to reach proficiency.`,
    );
    const responseText = result.response.text();

    const parsed: unknown = JSON.parse(responseText);

    if (!isValidLearningPlan(parsed)) {
      return {
        success: false,
        data: null,
        error: 'AI returned data that does not match the expected schema.',
      };
    }

    return {
      success: true,
      data: {
        skillName,
        steps: parsed.steps.slice(0, 3).map((s) => ({
          title: s.title,
          type: normalizeStepType(s.type),
          duration: s.duration,
          description: s.description ?? '',
        })),
        estimatedTotal: parsed.estimatedTotal ?? '3–5 hours',
      },
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? `Failed to parse AI response: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';

    console.error('Learning plan error:', err);
    return { success: false, data: null, error: message };
  }
}

// ================================================================
// Validation
// ================================================================

interface RawLearningPlan {
  steps: Array<{
    title: string;
    type: string;
    duration: string;
    description?: string;
  }>;
  estimatedTotal?: string;
}

function isValidLearningPlan(obj: unknown): obj is RawLearningPlan {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.steps) || o.steps.length === 0) return false;

  for (const step of o.steps) {
    if (typeof step !== 'object' || step === null) return false;
    const s = step as Record<string, unknown>;
    if (typeof s.title !== 'string' || !s.title) return false;
    if (typeof s.type !== 'string') return false;
    if (typeof s.duration !== 'string') return false;
  }

  return true;
}

const VALID_TYPES = new Set<LearningStepType>([
  'video',
  'article',
  'project',
  'exercise',
  'course',
]);

function normalizeStepType(raw: string): LearningStepType {
  const lower = raw.toLowerCase().trim() as LearningStepType;
  return VALID_TYPES.has(lower) ? lower : 'article';
}

// ================================================================
// Demo Data
// ================================================================

function getDemoPlan(skillName: string): LearningPlanResult {
  return {
    success: true,
    error: null,
    data: {
      skillName,
      estimatedTotal: '3–4 hours',
      steps: [
        {
          title: `${skillName} Crash Course`,
          type: 'video',
          duration: '45 min',
          description: `Watch an up-to-date beginner-to-intermediate crash course on ${skillName}. Focus on core concepts and practical examples.`,
        },
        {
          title: `Official ${skillName} Documentation Deep-Dive`,
          type: 'article',
          duration: '1 hour',
          description: `Read the official getting-started guide and key API references. Take notes on patterns you can apply to your current project.`,
        },
        {
          title: `Build a Mini-Project with ${skillName}`,
          type: 'project',
          duration: '2 hours',
          description: `Apply what you learned by building a small, focused project. This cements your understanding through hands-on practice.`,
        },
      ],
    },
  };
}
