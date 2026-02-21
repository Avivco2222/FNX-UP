import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------
// Mock the Google Generative AI SDK
// ----------------------------------------------------------------

const mockText = vi.fn<() => string>();
const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => {
  // Must use a regular function (not arrow) so `new` works as a constructor
  const MockGoogleGenerativeAI = vi.fn(function () {
    return {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    };
  });
  return { GoogleGenerativeAI: MockGoogleGenerativeAI };
});

// Import after mocking
import { parseJobDescription, type ParsedJob } from './ai-job-parser';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/** Wire the mock to return a specific text response from Gemini */
function mockGeminiResponse(text: string) {
  mockText.mockReturnValue(text);
  mockGenerateContent.mockResolvedValue({
    response: { text: mockText },
  });
}

/** Wire the mock to throw an error (API failure) */
function mockGeminiError(message: string) {
  mockGenerateContent.mockRejectedValue(new Error(message));
}

/** A valid ParsedJob fixture matching our expected schema */
const VALID_RESPONSE: ParsedJob = {
  title: 'Senior Frontend Engineer',
  department: 'Engineering',
  description_summary:
    'Build and maintain the company web applications using React and TypeScript. Collaborate with designers and backend engineers.',
  skills: [
    { name: 'React', level: 4, is_mandatory: true, is_new: false },
    { name: 'TypeScript', level: 3, is_mandatory: true, is_new: false },
    { name: 'GraphQL', level: 2, is_mandatory: false, is_new: false },
    { name: 'Tailwind CSS', level: 3, is_mandatory: false, is_new: false },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure GOOGLE_API_KEY is set for tests
  vi.stubEnv('GOOGLE_API_KEY', 'test-api-key-12345');
});

// ================================================================
// parseJobDescription
// ================================================================

describe('parseJobDescription', () => {
  // ------------------------------------------------------------
  // Success cases
  // ------------------------------------------------------------

  it('returns a correctly parsed job on valid Gemini JSON response', async () => {
    mockGeminiResponse(JSON.stringify(VALID_RESPONSE));

    const result = await parseJobDescription(
      'We are hiring a Senior Frontend Engineer for our Engineering team...',
    );

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();

    const data = result.data!;
    expect(data.title).toBe('Senior Frontend Engineer');
    expect(data.department).toBe('Engineering');
    expect(data.description_summary).toContain('web applications');
    expect(data.skills).toHaveLength(4);

    // Verify first skill structure
    expect(data.skills[0]).toEqual({
      name: 'React',
      level: 4,
      is_mandatory: true,
      is_new: false,
    });
  });

  it('normalizes skill levels to 1–5 range', async () => {
    const responseWithEdgeLevels = {
      ...VALID_RESPONSE,
      skills: [
        { name: 'SkillA', level: 0, is_mandatory: true, is_new: false },
        { name: 'SkillB', level: 7, is_mandatory: true, is_new: false },
        { name: 'SkillC', level: 3.6, is_mandatory: true, is_new: false },
      ],
    };
    mockGeminiResponse(JSON.stringify(responseWithEdgeLevels));

    const result = await parseJobDescription('Some job description');

    expect(result.success).toBe(true);
    // Level 0 → clamped to 1
    expect(result.data!.skills[0].level).toBe(1);
    // Level 7 → clamped to 5
    expect(result.data!.skills[1].level).toBe(5);
    // Level 3.6 → rounded to 4
    expect(result.data!.skills[2].level).toBe(4);
  });

  it('defaults department to "General" when not provided', async () => {
    const noDept = { ...VALID_RESPONSE, department: '' };
    mockGeminiResponse(JSON.stringify(noDept));

    const result = await parseJobDescription('A job posting');

    expect(result.success).toBe(true);
    expect(result.data!.department).toBe('General');
  });

  it('defaults is_new to false when missing from response', async () => {
    const noIsNew = {
      ...VALID_RESPONSE,
      skills: [{ name: 'Go', level: 3, is_mandatory: true }], // is_new omitted
    };
    mockGeminiResponse(JSON.stringify(noIsNew));

    const result = await parseJobDescription('Go developer needed');

    expect(result.success).toBe(true);
    expect(result.data!.skills[0].is_new).toBe(false);
  });

  // ------------------------------------------------------------
  // Validation failures
  // ------------------------------------------------------------

  it('returns error for empty input text', async () => {
    const result = await parseJobDescription('   ');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Job description text is empty.');
    expect(result.data).toBeNull();
    // Should never call the API
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('returns error when GOOGLE_API_KEY is missing', async () => {
    vi.stubEnv('GOOGLE_API_KEY', '');

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Missing GOOGLE_API_KEY environment variable.');
    expect(result.data).toBeNull();
  });

  it('returns error when Gemini returns invalid JSON (not an object)', async () => {
    mockGeminiResponse('"just a string"');

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not match the expected schema');
  });

  it('returns error when Gemini returns JSON missing required fields', async () => {
    mockGeminiResponse(JSON.stringify({ title: 'Dev' }));
    // Missing description_summary and skills

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not match the expected schema');
  });

  it('returns error when skills array contains invalid skill objects', async () => {
    const badSkills = {
      ...VALID_RESPONSE,
      skills: [{ name: '', level: 3, is_mandatory: true }], // empty name
    };
    mockGeminiResponse(JSON.stringify(badSkills));

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not match the expected schema');
  });

  // ------------------------------------------------------------
  // Error handling
  // ------------------------------------------------------------

  it('handles malformed JSON from Gemini gracefully', async () => {
    mockGeminiResponse('{ bad json !!!');

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse Gemini response as JSON');
    expect(result.data).toBeNull();
  });

  it('handles Gemini API network/rate-limit errors gracefully', async () => {
    mockGeminiError('429 Resource has been exhausted');

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toBe('429 Resource has been exhausted');
    expect(result.data).toBeNull();
  });

  it('handles unexpected thrown values gracefully', async () => {
    mockGenerateContent.mockRejectedValue('string error');

    const result = await parseJobDescription('Some text');

    expect(result.success).toBe(false);
    expect(result.error).toContain('unexpected error');
    expect(result.data).toBeNull();
  });
});
