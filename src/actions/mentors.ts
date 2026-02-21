'use server';

import { createAdminClient } from '@/lib/supabase/server';

// ================================================================
// Types
// ================================================================

export interface MentorProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  roleTitle: string | null;
  skillLevel: number;
  email: string | null;
}

export interface FindMentorsResult {
  success: boolean;
  mentors: MentorProfile[];
  error: string | null;
}

// ================================================================
// Server Action
// ================================================================

/**
 * Find up to 3 internal mentors who are experts (level ≥ 4) in a
 * given skill, excluding the current user.
 */
export async function findMentors(
  skillId: string,
  currentUserId: string,
): Promise<FindMentorsResult> {
  // ---- Demo mode ----
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return getDemoMentors();
  }

  try {
    const supabase = createAdminClient();

    // Join user_skills → users to get profile data
    const { data, error } = await supabase
      .from('user_skills')
      .select(
        'skill_level, user_id, users(id, display_name, avatar_url, role_title, email)',
      )
      .eq('skill_id', skillId)
      .gte('skill_level', 4)
      .neq('user_id', currentUserId)
      .order('skill_level', { ascending: false })
      .limit(3);

    if (error) {
      return { success: false, mentors: [], error: error.message };
    }

    const mentors: MentorProfile[] = (data ?? [])
      .map((row) => {
        const user = row.users as unknown as {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role_title: string | null;
          email: string | null;
        } | null;

        if (!user) return null;

        return {
          id: user.id,
          displayName: user.display_name ?? 'Anonymous',
          avatarUrl: user.avatar_url,
          roleTitle: user.role_title,
          skillLevel: row.skill_level,
          email: user.email,
        };
      })
      .filter((m): m is MentorProfile => m !== null);

    return { success: true, mentors, error: null };
  } catch (err) {
    console.error('Mentor finder error:', err);
    return {
      success: false,
      mentors: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

// ================================================================
// Demo Data
// ================================================================

function getDemoMentors(): FindMentorsResult {
  return {
    success: true,
    error: null,
    mentors: [
      {
        id: 'mentor-1',
        displayName: 'Daniel Cohen',
        avatarUrl: null,
        roleTitle: 'Senior Software Engineer',
        skillLevel: 5,
        email: 'daniel.cohen@fnx.co.il',
      },
      {
        id: 'mentor-2',
        displayName: 'Maya Shapira',
        avatarUrl: null,
        roleTitle: 'Tech Lead — Platform',
        skillLevel: 5,
        email: 'maya.shapira@fnx.co.il',
      },
      {
        id: 'mentor-3',
        displayName: 'Oren Levi',
        avatarUrl: null,
        roleTitle: 'Full-Stack Developer',
        skillLevel: 4,
        email: 'oren.levi@fnx.co.il',
      },
    ],
  };
}
