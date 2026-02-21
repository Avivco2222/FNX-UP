import type { AdminTableName } from '@/types';

/**
 * Priority columns to display per table in the admin UI.
 * If a table isn't listed, we fall back to auto-detecting the first 6 keys.
 */
export const TABLE_DISPLAY_COLUMNS: Partial<Record<AdminTableName, string[]>> = {
  org_units:          ['code', 'name', 'unit_type', 'status', 'created_at'],
  org_memberships:    ['user_id', 'org_unit_id', 'is_primary', 'title', 'start_date'],
  level_definitions:  ['level', 'min_total_xp', 'title'],
  users:              ['display_name', 'email', 'role_title', 'current_level', 'current_xp', 'is_active'],
  roles:              ['code', 'name', 'description'],
  user_roles:         ['user_id', 'role_id', 'assigned_at'],
  skills:             ['slug', 'name', 'category', 'skill_type', 'status', 'is_verified'],
  skill_aliases:      ['skill_id', 'alias', 'source'],
  skill_relations:    ['from_skill_id', 'to_skill_id', 'relation', 'weight'],
  jobs:               ['code', 'title', 'job_type', 'status', 'xp_reward', 'created_at'],
  job_skills:         ['job_id', 'skill_id', 'required_level', 'weight', 'is_mandatory'],
  gigs:               ['code', 'title', 'status', 'xp_reward', 'coin_reward', 'created_at'],
  gig_skills:         ['gig_id', 'skill_id', 'required_level', 'weight', 'is_mandatory'],
  user_skills:        ['user_id', 'skill_id', 'skill_level', 'endorsement_count', 'is_verified'],
  skill_endorsements: ['user_id', 'skill_id', 'endorser_user_id', 'created_at'],
  badges:             ['slug', 'name', 'rarity', 'xp_bonus', 'coin_bonus', 'status'],
  user_badges:        ['user_id', 'badge_id', 'awarded_at', 'reason'],
  gig_participants:   ['gig_id', 'user_id', 'status', 'applied_at', 'completed_at'],
  job_applications:   ['job_id', 'user_id', 'status', 'applied_at'],
  feed_events:        ['event_type', 'actor_user_id', 'visibility', 'entity_table', 'created_at'],
  xp_transactions:    ['user_id', 'source_type', 'source_label', 'xp_amount', 'coin_amount', 'created_at'],
  ai_taxonomy_suggestions: ['suggestion_type', 'status', 'created_at'],
};

/** Human-friendly labels for table names */
export const TABLE_LABELS: Record<AdminTableName, string> = {
  org_units:          'Org Units',
  org_memberships:    'Org Memberships',
  level_definitions:  'Level Definitions',
  users:              'Users',
  roles:              'Roles',
  user_roles:         'User Roles',
  skills:             'Skills',
  skill_aliases:      'Skill Aliases',
  skill_relations:    'Skill Relations',
  jobs:               'Jobs',
  job_skills:         'Job Skills',
  gigs:               'Gigs',
  gig_skills:         'Gig Skills',
  user_skills:        'User Skills',
  skill_endorsements: 'Skill Endorsements',
  badges:             'Badges',
  user_badges:        'User Badges',
  gig_participants:   'Gig Participants',
  job_applications:   'Job Applications',
  feed_events:        'Feed Events',
  xp_transactions:    'XP Transactions',
  ai_taxonomy_suggestions: 'AI Taxonomy Suggestions',
};

/** Columns that are searchable (text/citext) per table. Fallback: first text column. */
export const TABLE_SEARCH_COLUMNS: Partial<Record<AdminTableName, string>> = {
  org_units:     'name',
  users:         'display_name',
  skills:        'name',
  jobs:          'title',
  gigs:          'title',
  badges:        'name',
  roles:         'name',
};

/**
 * Auto-detect display columns from data when no config exists.
 * Returns the first 6 keys, excluding 'metadata' and 'payload' (too wide).
 */
export function autoDetectColumns(row: Record<string, unknown>): string[] {
  const skip = new Set(['metadata', 'payload', 'avatar_config', 'perks']);
  return Object.keys(row)
    .filter((k) => !skip.has(k))
    .slice(0, 6);
}
