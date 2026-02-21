'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import type { ParsedResume } from './ai-resume-parser';

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

const ONBOARDING_XP_REWARD = 500;
const ONBOARDING_COIN_REWARD = 100;

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface OnboardingResult {
  success: boolean;
  error: string | null;
  skillsAdded: number;
  xpAwarded: number;
  coinsAwarded: number;
}

// ----------------------------------------------------------------
// Server Action
// ----------------------------------------------------------------

/**
 * Save the parsed resume data to the user's profile.
 *
 * Steps:
 *   1. Upsert each skill into the global `skills` table.
 *   2. Upsert `user_skills` rows with proficiency levels.
 *   3. Update user's profile (display_name, headline).
 *   4. Award onboarding XP & coins via `xp_transactions`.
 *   5. Create a feed event.
 *   6. Revalidate cache.
 */
export async function completeOnboarding(
  userId: string,
  data: ParsedResume,
): Promise<OnboardingResult> {
  const supabase = createAdminClient();

  try {
    // ---- 1. Upsert global skills ----
    // We insert skills with a generated slug for the unique constraint
    const skillRows = data.skills.map((s) => ({
      name: s.name,
      slug: slugify(s.name),
      category: 'General',
      skill_type: 'technical',
      status: 'active',
      is_verified: false,
    }));

    const { data: upsertedSkills, error: skillsError } = await supabase
      .from('skills')
      .upsert(skillRows, { onConflict: 'slug' })
      .select('id, slug, name');

    if (skillsError) {
      console.error('Skills upsert error:', skillsError);
      return {
        success: false,
        error: `Failed to save skills: ${skillsError.message}`,
        skillsAdded: 0,
        xpAwarded: 0,
        coinsAwarded: 0,
      };
    }

    // ---- 2. Build skill-level map and upsert user_skills ----
    const skillLevelMap = new Map<string, number>();
    for (const s of data.skills) {
      skillLevelMap.set(slugify(s.name), s.level);
    }

    if (upsertedSkills && upsertedSkills.length > 0) {
      const userSkillRows = upsertedSkills.map((skill) => ({
        user_id: userId,
        skill_id: skill.id,
        skill_level: skillLevelMap.get(skill.slug as string) ?? 1,
        is_verified: false,
      }));

      const { error: userSkillsError } = await supabase
        .from('user_skills')
        .upsert(userSkillRows, { onConflict: 'user_id,skill_id' });

      if (userSkillsError) {
        console.error('User skills upsert error:', userSkillsError);
        // Non-fatal: continue with other steps
      }
    }

    // ---- 3. Update user profile ----
    const profileUpdates: Record<string, unknown> = {};

    if (data.fullName && data.fullName !== 'Unknown Candidate') {
      profileUpdates.display_name = data.fullName;
    }
    if (data.summary) {
      profileUpdates.headline = data.summary.slice(0, 200);
      profileUpdates.bio = data.summary;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    }

    // ---- 4. Award onboarding XP & coins ----
    const { error: xpError } = await supabase.from('xp_transactions').insert({
      user_id: userId,
      source_type: 'other',
      source_label: 'Onboarding — Resume Upload',
      xp_amount: ONBOARDING_XP_REWARD,
      coin_amount: ONBOARDING_COIN_REWARD,
    });

    if (xpError) {
      console.error('XP transaction error:', xpError);
      // Non-fatal: the DB trigger (apply_xp_transaction) updates user totals
    }

    // ---- 5. Create feed event ----
    const { error: feedError } = await supabase.from('feed_events').insert({
      actor_user_id: userId,
      event_type: 'profile_updated',
      visibility: 'public',
      entity_table: 'users',
      entity_id: userId,
      payload: {
        action: 'onboarding_complete',
        skills_count: data.skills.length,
        xp_earned: ONBOARDING_XP_REWARD,
      },
    });

    if (feedError) {
      console.error('Feed event error:', feedError);
    }

    // ---- 6. Revalidate ----
    revalidatePath('/');
    revalidatePath('/career');

    return {
      success: true,
      error: null,
      skillsAdded: upsertedSkills?.length ?? 0,
      xpAwarded: ONBOARDING_XP_REWARD,
      coinsAwarded: ONBOARDING_COIN_REWARD,
    };
  } catch (err) {
    console.error('Onboarding error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      skillsAdded: 0,
      xpAwarded: 0,
      coinsAwarded: 0,
    };
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
}
