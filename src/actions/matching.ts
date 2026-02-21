'use server';

import { createAdminClient } from '@/lib/supabase/server';

// ================================================================
// Types
// ================================================================

export interface MatchedSkill {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  userLevel: number | null; // null = user doesn't have it
  isMandatory: boolean;
  status: 'match' | 'partial' | 'missing';
}

export interface MatchedOpportunity {
  id: string;
  type: 'job' | 'gig';
  title: string;
  description: string | null;
  location: string | null;
  department: string | null;
  // Job-specific
  jobType?: string;
  // Gig-specific
  xpReward?: number;
  coinReward?: number;
  commitmentHours?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  // Matching
  matchScore: number; // 0–100
  totalPoints: number;
  maxPoints: number;
  matchedSkills: MatchedSkill[];
  missingSkills: MatchedSkill[];
  gapSkills: MatchedSkill[];
  createdAt: string;
}

export interface MatchingResult {
  success: boolean;
  jobs: MatchedOpportunity[];
  gigs: MatchedOpportunity[];
  error: string | null;
}

// ================================================================
// Score constants
// ================================================================

const SCORE_FULL_MATCH = 100;
const SCORE_PARTIAL_MATCH = 50;

// ================================================================
// Server Action
// ================================================================

/**
 * Fetch published Jobs and open Gigs, score them against the user's
 * skills, and return sorted results with gap analysis.
 */
export async function getMatchedOpportunities(
  userId: string,
): Promise<MatchingResult> {
  // ---- Demo mode ----
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return getDemoData();
  }

  try {
    const supabase = createAdminClient();

    // 1. Fetch user skills (with skill names)
    const { data: userSkillRows, error: userErr } = await supabase
      .from('user_skills')
      .select('skill_id, skill_level, skills(id, name)')
      .eq('user_id', userId);

    if (userErr) {
      return { success: false, jobs: [], gigs: [], error: userErr.message };
    }

    // Build a map: skill_id → { name, level }
    const userSkillMap = new Map<
      string,
      { name: string; level: number }
    >();

    for (const row of userSkillRows ?? []) {
      const skill = row.skills as unknown as { id: string; name: string } | null;
      if (skill) {
        userSkillMap.set(row.skill_id, {
          name: skill.name,
          level: row.skill_level,
        });
      }
    }

    // 2. Fetch published jobs with required skills
    const { data: jobRows, error: jobErr } = await supabase
      .from('jobs')
      .select(
        'id, code, title, description, location, job_type, status, xp_reward, coin_reward, org_unit_id, created_at, job_skills(skill_id, required_level, is_mandatory, weight, skills(id, name))',
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobErr) {
      return { success: false, jobs: [], gigs: [], error: jobErr.message };
    }

    // 3. Fetch open gigs with required skills
    const { data: gigRows, error: gigErr } = await supabase
      .from('gigs')
      .select(
        'id, code, title, description, location, status, xp_reward, coin_reward, commitment_hours_per_week, start_date, end_date, org_unit_id, created_at, gig_skills(skill_id, required_level, is_mandatory, weight, skills(id, name))',
      )
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);

    if (gigErr) {
      return { success: false, jobs: [], gigs: [], error: gigErr.message };
    }

    // 4. Score jobs
    const jobs: MatchedOpportunity[] = (jobRows ?? []).map((job) => {
      const requirements = (
        job.job_skills as unknown as Array<{
          skill_id: string;
          required_level: number;
          is_mandatory: boolean;
          weight: number;
          skills: { id: string; name: string } | null;
        }>
      ) ?? [];

      return scoreOpportunity(
        {
          id: job.id,
          type: 'job',
          title: job.title,
          description: job.description,
          location: job.location,
          department: null, // would need org_unit join for name
          jobType: job.job_type,
          createdAt: job.created_at,
        },
        requirements,
        userSkillMap,
      );
    });

    // 5. Score gigs
    const gigs: MatchedOpportunity[] = (gigRows ?? []).map((gig) => {
      const requirements = (
        gig.gig_skills as unknown as Array<{
          skill_id: string;
          required_level: number;
          is_mandatory: boolean;
          weight: number;
          skills: { id: string; name: string } | null;
        }>
      ) ?? [];

      return scoreOpportunity(
        {
          id: gig.id,
          type: 'gig',
          title: gig.title,
          description: gig.description,
          location: gig.location,
          department: null,
          xpReward: gig.xp_reward,
          coinReward: gig.coin_reward,
          commitmentHours: gig.commitment_hours_per_week,
          startDate: gig.start_date,
          endDate: gig.end_date,
          createdAt: gig.created_at,
        },
        requirements,
        userSkillMap,
      );
    });

    // 6. Sort by match score descending
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    gigs.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, jobs, gigs, error: null };
  } catch (err) {
    console.error('Matching error:', err);
    return {
      success: false,
      jobs: [],
      gigs: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

// ================================================================
// Scoring Logic
// ================================================================

interface OpportunityBase {
  id: string;
  type: 'job' | 'gig';
  title: string;
  description: string | null;
  location: string | null;
  department: string | null;
  jobType?: string;
  xpReward?: number;
  coinReward?: number;
  commitmentHours?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

interface RequiredSkillRow {
  skill_id: string;
  required_level: number;
  is_mandatory: boolean;
  weight: number;
  skills: { id: string; name: string } | null;
}

function scoreOpportunity(
  base: OpportunityBase,
  requirements: RequiredSkillRow[],
  userSkillMap: Map<string, { name: string; level: number }>,
): MatchedOpportunity {
  const matchedSkills: MatchedSkill[] = [];
  const missingSkills: MatchedSkill[] = [];
  const gapSkills: MatchedSkill[] = [];

  let totalPoints = 0;
  const maxPoints = requirements.length * SCORE_FULL_MATCH;

  for (const req of requirements) {
    const skillName = req.skills?.name ?? 'Unknown Skill';
    const userSkill = userSkillMap.get(req.skill_id);

    if (!userSkill) {
      // Missing: user doesn't have this skill at all
      const entry: MatchedSkill = {
        skillId: req.skill_id,
        skillName,
        requiredLevel: req.required_level,
        userLevel: null,
        isMandatory: req.is_mandatory,
        status: 'missing',
      };
      missingSkills.push(entry);
      matchedSkills.push(entry);
    } else if (userSkill.level >= req.required_level) {
      // Full match
      const entry: MatchedSkill = {
        skillId: req.skill_id,
        skillName,
        requiredLevel: req.required_level,
        userLevel: userSkill.level,
        isMandatory: req.is_mandatory,
        status: 'match',
      };
      totalPoints += SCORE_FULL_MATCH;
      matchedSkills.push(entry);
    } else {
      // Partial: has skill but level too low
      const entry: MatchedSkill = {
        skillId: req.skill_id,
        skillName,
        requiredLevel: req.required_level,
        userLevel: userSkill.level,
        isMandatory: req.is_mandatory,
        status: 'partial',
      };
      totalPoints += SCORE_PARTIAL_MATCH;
      gapSkills.push(entry);
      matchedSkills.push(entry);
    }
  }

  const matchScore =
    maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100;

  return {
    ...base,
    matchScore,
    totalPoints,
    maxPoints,
    matchedSkills,
    missingSkills,
    gapSkills,
  };
}

// ================================================================
// Demo Data
// ================================================================

function getDemoData(): MatchingResult {
  const demoJobs: MatchedOpportunity[] = [
    {
      id: 'job-1',
      type: 'job',
      title: 'Senior React Developer',
      description:
        'Build next-generation user interfaces for our insurance platform.',
      location: 'Tel Aviv, Israel',
      department: 'Engineering',
      jobType: 'full_time',
      matchScore: 92,
      totalPoints: 550,
      maxPoints: 600,
      matchedSkills: [
        { skillId: 's1', skillName: 'React', requiredLevel: 4, userLevel: 5, isMandatory: true, status: 'match' },
        { skillId: 's2', skillName: 'TypeScript', requiredLevel: 4, userLevel: 4, isMandatory: true, status: 'match' },
        { skillId: 's3', skillName: 'Node.js', requiredLevel: 3, userLevel: 3, isMandatory: false, status: 'match' },
        { skillId: 's4', skillName: 'GraphQL', requiredLevel: 3, userLevel: 2, isMandatory: false, status: 'partial' },
        { skillId: 's5', skillName: 'CSS', requiredLevel: 3, userLevel: 4, isMandatory: false, status: 'match' },
        { skillId: 's6', skillName: 'Testing', requiredLevel: 3, userLevel: 3, isMandatory: true, status: 'match' },
      ],
      missingSkills: [],
      gapSkills: [
        { skillId: 's4', skillName: 'GraphQL', requiredLevel: 3, userLevel: 2, isMandatory: false, status: 'partial' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'job-2',
      type: 'job',
      title: 'Full-Stack Engineer',
      description:
        'Work across the stack to deliver features for our digital claims platform.',
      location: 'Hybrid — Ramat Gan',
      department: 'Digital Products',
      jobType: 'full_time',
      matchScore: 75,
      totalPoints: 450,
      maxPoints: 600,
      matchedSkills: [
        { skillId: 's1', skillName: 'React', requiredLevel: 3, userLevel: 5, isMandatory: true, status: 'match' },
        { skillId: 's7', skillName: 'Python', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
        { skillId: 's8', skillName: 'PostgreSQL', requiredLevel: 3, userLevel: 3, isMandatory: true, status: 'match' },
        { skillId: 's2', skillName: 'TypeScript', requiredLevel: 3, userLevel: 4, isMandatory: false, status: 'match' },
        { skillId: 's9', skillName: 'Docker', requiredLevel: 2, userLevel: 2, isMandatory: false, status: 'match' },
        { skillId: 's10', skillName: 'AWS', requiredLevel: 3, userLevel: 1, isMandatory: false, status: 'partial' },
      ],
      missingSkills: [
        { skillId: 's7', skillName: 'Python', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
      ],
      gapSkills: [
        { skillId: 's10', skillName: 'AWS', requiredLevel: 3, userLevel: 1, isMandatory: false, status: 'partial' },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'job-3',
      type: 'job',
      title: 'DevOps Engineer',
      description: 'Manage cloud infrastructure and CI/CD pipelines.',
      location: 'Remote',
      department: 'Platform',
      jobType: 'full_time',
      matchScore: 40,
      totalPoints: 200,
      maxPoints: 500,
      matchedSkills: [
        { skillId: 's9', skillName: 'Docker', requiredLevel: 4, userLevel: 2, isMandatory: true, status: 'partial' },
        { skillId: 's10', skillName: 'AWS', requiredLevel: 4, userLevel: 1, isMandatory: true, status: 'partial' },
        { skillId: 's11', skillName: 'Kubernetes', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
        { skillId: 's12', skillName: 'Terraform', requiredLevel: 3, userLevel: null, isMandatory: false, status: 'missing' },
        { skillId: 's13', skillName: 'Linux', requiredLevel: 3, userLevel: 3, isMandatory: true, status: 'match' },
      ],
      missingSkills: [
        { skillId: 's11', skillName: 'Kubernetes', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
        { skillId: 's12', skillName: 'Terraform', requiredLevel: 3, userLevel: null, isMandatory: false, status: 'missing' },
      ],
      gapSkills: [
        { skillId: 's9', skillName: 'Docker', requiredLevel: 4, userLevel: 2, isMandatory: true, status: 'partial' },
        { skillId: 's10', skillName: 'AWS', requiredLevel: 4, userLevel: 1, isMandatory: true, status: 'partial' },
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const demoGigs: MatchedOpportunity[] = [
    {
      id: 'gig-1',
      type: 'gig',
      title: 'Build Onboarding Dashboard',
      description: 'Create an interactive dashboard for new employee onboarding metrics.',
      location: null,
      department: 'HR Tech',
      xpReward: 800,
      coinReward: 150,
      commitmentHours: 10,
      startDate: null,
      endDate: null,
      matchScore: 95,
      totalPoints: 300,
      maxPoints: 300,
      matchedSkills: [
        { skillId: 's1', skillName: 'React', requiredLevel: 3, userLevel: 5, isMandatory: true, status: 'match' },
        { skillId: 's2', skillName: 'TypeScript', requiredLevel: 3, userLevel: 4, isMandatory: true, status: 'match' },
        { skillId: 's5', skillName: 'CSS', requiredLevel: 2, userLevel: 4, isMandatory: false, status: 'match' },
      ],
      missingSkills: [],
      gapSkills: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gig-2',
      type: 'gig',
      title: 'API Documentation Sprint',
      description: 'Document REST APIs for the claims system using OpenAPI spec.',
      location: null,
      department: 'Engineering',
      xpReward: 500,
      coinReward: 80,
      commitmentHours: 5,
      startDate: null,
      endDate: null,
      matchScore: 83,
      totalPoints: 250,
      maxPoints: 300,
      matchedSkills: [
        { skillId: 's3', skillName: 'Node.js', requiredLevel: 2, userLevel: 3, isMandatory: true, status: 'match' },
        { skillId: 's14', skillName: 'Technical Writing', requiredLevel: 3, userLevel: 2, isMandatory: true, status: 'partial' },
        { skillId: 's8', skillName: 'REST APIs', requiredLevel: 3, userLevel: 3, isMandatory: false, status: 'match' },
      ],
      missingSkills: [],
      gapSkills: [
        { skillId: 's14', skillName: 'Technical Writing', requiredLevel: 3, userLevel: 2, isMandatory: true, status: 'partial' },
      ],
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'gig-3',
      type: 'gig',
      title: 'Design System Audit',
      description: 'Review and catalog existing UI components for the design system.',
      location: null,
      department: 'Design',
      xpReward: 600,
      coinReward: 100,
      commitmentHours: 8,
      startDate: null,
      endDate: null,
      matchScore: 67,
      totalPoints: 200,
      maxPoints: 300,
      matchedSkills: [
        { skillId: 's5', skillName: 'CSS', requiredLevel: 3, userLevel: 4, isMandatory: true, status: 'match' },
        { skillId: 's15', skillName: 'Figma', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
        { skillId: 's1', skillName: 'React', requiredLevel: 3, userLevel: 5, isMandatory: false, status: 'match' },
      ],
      missingSkills: [
        { skillId: 's15', skillName: 'Figma', requiredLevel: 3, userLevel: null, isMandatory: true, status: 'missing' },
      ],
      gapSkills: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'gig-4',
      type: 'gig',
      title: 'Chatbot Prototype',
      description: 'Build a proof-of-concept AI chatbot for customer support.',
      location: null,
      department: 'Innovation',
      xpReward: 1000,
      coinReward: 200,
      commitmentHours: 15,
      startDate: null,
      endDate: null,
      matchScore: 75,
      totalPoints: 300,
      maxPoints: 400,
      matchedSkills: [
        { skillId: 's2', skillName: 'TypeScript', requiredLevel: 3, userLevel: 4, isMandatory: true, status: 'match' },
        { skillId: 's3', skillName: 'Node.js', requiredLevel: 3, userLevel: 3, isMandatory: true, status: 'match' },
        { skillId: 's16', skillName: 'Machine Learning', requiredLevel: 2, userLevel: null, isMandatory: false, status: 'missing' },
        { skillId: 's1', skillName: 'React', requiredLevel: 2, userLevel: 5, isMandatory: false, status: 'match' },
      ],
      missingSkills: [
        { skillId: 's16', skillName: 'Machine Learning', requiredLevel: 2, userLevel: null, isMandatory: false, status: 'missing' },
      ],
      gapSkills: [],
      createdAt: new Date(Date.now() - 129600000).toISOString(),
    },
  ];

  return { success: true, jobs: demoJobs, gigs: demoGigs, error: null };
}
