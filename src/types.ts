import type { LucideIcon } from 'lucide-react';

// ============================================================
// FnxLevelUp – Phase 0 Type Definitions
// ============================================================
// Generated from schema.sql. Keep in sync with DB enums/tables.
// Convention: snake_case column names preserved for Supabase SDK compat.
// ============================================================

// ------------------------------------------------------------
// Branded UUID type (prevents mixing plain strings with IDs)
// ------------------------------------------------------------
export type UUID = string & { readonly כ__brand: unique symbol };

// Helper: ISO-8601 timestamp string returned by Supabase
export type ISOTimestamp = string;

// Helper: ISO date string (YYYY-MM-DD)
export type ISODate = string;

// ============================================================
// 1. ENUMS (mirror DB enums exactly)
// ============================================================

export enum RecordStatus {
  Draft = 'draft',
  Active = 'active',
  Deprecated = 'deprecated',
  Archived = 'archived',
}

export enum OrgUnitType {
  Company = 'company',
  Division = 'division',
  Department = 'department',
  Team = 'team',
  Chapter = 'chapter',
  Guild = 'guild',
  Other = 'other',
}

export enum SkillType {
  Technical = 'technical',
  Soft = 'soft',
  Domain = 'domain',
  Tool = 'tool',
  Certification = 'certification',
  Language = 'language',
  Process = 'process',
  Other = 'other',
}

export enum RelationType {
  Related = 'related',
  Prerequisite = 'prerequisite',
  Broader = 'broader',
  Narrower = 'narrower',
  Synonym = 'synonym',
  Complements = 'complements',
}

export enum JobType {
  FullTime = 'full_time',
  PartTime = 'part_time',
  Contract = 'contract',
  Internship = 'internship',
  Temporary = 'temporary',
  Other = 'other',
}

export enum JobStatus {
  Draft = 'draft',
  Published = 'published',
  Closed = 'closed',
  Archived = 'archived',
}

export enum GigStatus {
  Draft = 'draft',
  Open = 'open',
  InProgress = 'in_progress',
  Closed = 'closed',
  Archived = 'archived',
}

export enum ApplicationStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Withdrawn = 'withdrawn',
  Rejected = 'rejected',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export enum BadgeRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

export enum FeedVisibility {
  Private = 'private',
  Team = 'team',
  Org = 'org',
  Public = 'public',
}

export enum FeedEventType {
  ProfileUpdated = 'profile_updated',
  SkillAdded = 'skill_added',
  SkillLeveledUp = 'skill_leveled_up',
  SkillVerified = 'skill_verified',
  EndorsementReceived = 'endorsement_received',
  BadgeEarned = 'badge_earned',
  GigApplied = 'gig_applied',
  GigAccepted = 'gig_accepted',
  GigCompleted = 'gig_completed',
  JobApplied = 'job_applied',
  NewJobPosted = 'new_job_posted',
  LevelUp = 'level_up',
  CoinsEarned = 'coins_earned',
  AdminAdjustment = 'admin_adjustment',
}

export enum XpSourceType {
  Gig = 'gig',
  Job = 'job',
  Learning = 'learning',
  Badge = 'badge',
  Endorsement = 'endorsement',
  Admin = 'admin',
  Import = 'import',
  Other = 'other',
}

// Skill proficiency level: 1 (Novice) through 5 (Expert)
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

// ============================================================
// 2. JSONB STRICT TYPES (no `any` anywhere)
// ============================================================

/** Tamagotchi / Phoenix avatar visual state stored in users.avatar_config */
export interface AvatarConfig {
  evolution_stage: number; // 1–5+, grows with level
  mood: 'happy' | 'neutral' | 'tired' | 'energized' | 'legendary';
  accessories: string[];   // e.g. ["hat_v1", "cape_gold"]
  color_scheme?: string;   // e.g. "phoenix_red"
  custom?: Record<string, unknown>;
}

/** Perks unlocked at each level (level_definitions.perks) */
export interface LevelPerks {
  coin_multiplier?: number;   // e.g. 1.5x coin earnings
  badge_slots?: number;       // max badges displayed on profile
  gig_priority?: boolean;     // prioritized in gig matching
  custom?: Record<string, unknown>;
}

/** Generic metadata bag (for tables with a `metadata jsonb` column) */
export type Metadata = Record<string, unknown>;

// ============================================================
// 3. FEED PAYLOAD TYPES (discriminated union building blocks)
// ============================================================

export interface FeedPayloadProfileUpdated {
  fields_changed: string[]; // e.g. ["headline", "bio"]
}

export interface FeedPayloadSkillAdded {
  skill_id: UUID;
  skill_name: string;
  initial_level: SkillLevel;
}

export interface FeedPayloadSkillLeveledUp {
  skill_id: UUID;
  skill_name: string;
  from_level: SkillLevel;
  to_level: SkillLevel;
}

export interface FeedPayloadSkillVerified {
  skill_id: UUID;
  skill_name: string;
  verified_by: UUID;
}

export interface FeedPayloadEndorsementReceived {
  skill_id: UUID;
  skill_name: string;
  endorser_user_id: UUID;
  endorser_name?: string;
}

export interface FeedPayloadBadgeEarned {
  badge_id: UUID;
  badge_name: string;
  rarity: BadgeRarity;
}

export interface FeedPayloadGigApplied {
  gig_id: UUID;
  gig_title: string;
}

export interface FeedPayloadGigAccepted {
  gig_id: UUID;
  gig_title: string;
}

export interface FeedPayloadGigCompleted {
  gig_id: UUID;
  gig_title: string;
  xp_reward: number;
  coin_reward: number;
}

export interface FeedPayloadJobApplied {
  job_id: UUID;
  job_title: string;
}

export interface FeedPayloadNewJobPosted {
  job_id: UUID;
  title: string;
  org_unit_id: UUID | null;
  location: string | null;
  level_band: string | null;
  referral_bonus: number;
}

export interface FeedPayloadLevelUp {
  from_level: number;
  to_level: number;
  total_xp: number;
}

export interface FeedPayloadCoinsEarned {
  xp_amount: number;
  coin_amount: number;
  source_type: XpSourceType;
  source_id: UUID | null;
  source_label: string | null;
}

export interface FeedPayloadAdminAdjustment {
  xp_amount: number;
  coin_amount: number;
  source_type: XpSourceType;
  source_id: UUID | null;
  source_label: string | null;
}

/** Map from event_type → payload shape (single source of truth) */
export interface FeedPayloadMap {
  [FeedEventType.ProfileUpdated]: FeedPayloadProfileUpdated;
  [FeedEventType.SkillAdded]: FeedPayloadSkillAdded;
  [FeedEventType.SkillLeveledUp]: FeedPayloadSkillLeveledUp;
  [FeedEventType.SkillVerified]: FeedPayloadSkillVerified;
  [FeedEventType.EndorsementReceived]: FeedPayloadEndorsementReceived;
  [FeedEventType.BadgeEarned]: FeedPayloadBadgeEarned;
  [FeedEventType.GigApplied]: FeedPayloadGigApplied;
  [FeedEventType.GigAccepted]: FeedPayloadGigAccepted;
  [FeedEventType.GigCompleted]: FeedPayloadGigCompleted;
  [FeedEventType.JobApplied]: FeedPayloadJobApplied;
  [FeedEventType.NewJobPosted]: FeedPayloadNewJobPosted;
  [FeedEventType.LevelUp]: FeedPayloadLevelUp;
  [FeedEventType.CoinsEarned]: FeedPayloadCoinsEarned;
  [FeedEventType.AdminAdjustment]: FeedPayloadAdminAdjustment;
}

// ============================================================
// 4. DATABASE ENTITY INTERFACES
// ============================================================

// ----- Org Structure -----

export interface OrgUnit {
  id: UUID;
  code: string;
  name: string;
  unit_type: OrgUnitType;
  parent_org_unit_id: UUID | null;
  status: RecordStatus;
  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface OrgMembership {
  id: UUID;
  user_id: UUID;
  org_unit_id: UUID;
  is_primary: boolean;
  start_date: ISODate | null;
  end_date: ISODate | null;
  title: string | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ----- Level Curve -----

export interface LevelDefinition {
  level: number;
  min_total_xp: number;
  title: string;
  perks: LevelPerks;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ----- Users -----

export interface User {
  id: UUID;

  // Profile
  employee_id: string | null;
  email: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  role_title: string | null;
  avatar_url: string | null;
  hire_date: ISODate | null;
  is_active: boolean;

  // Org
  manager_user_id: UUID | null;

  // Gamification (cached)
  current_level: number;
  current_xp: number;
  coins_balance: number;

  // Tamagotchi
  avatar_config: AvatarConfig;

  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ----- RBAC -----

export interface Role {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface UserRole {
  id: UUID;
  user_id: UUID;
  role_id: UUID;
  assigned_by: UUID | null;
  assigned_at: ISOTimestamp;
}

// ----- Skills Taxonomy -----

export interface Skill {
  id: UUID;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  skill_type: SkillType;
  status: RecordStatus;
  is_verified: boolean;
  parent_skill_id: UUID | null;
  source: string | null;
  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface SkillAlias {
  id: UUID;
  skill_id: UUID;
  alias: string;
  source: string | null;
  created_at: ISOTimestamp;
}

export interface SkillRelation {
  id: UUID;
  from_skill_id: UUID;
  to_skill_id: UUID;
  relation: RelationType;
  weight: number; // 0.000–1.000
  notes: string | null;
  created_at: ISOTimestamp;
}

// ----- Jobs -----

// חפש את ה-Interface הזה ועדכן אותו כך:
export interface Job {
  id: UUID;
  code: string;
  title: string;
  description: string | null;
  org_unit_id: UUID | null;
  location: string | null;
  job_type: JobType;
  level_band: string | null;
  status: JobStatus;
  
  // שדות התגמול (מעדכן את הקיימים ותומך בחדשים)
  xp_reward: number;
  coin_reward: number;
  internal_xp?: number;        // שדה חדש
  referral_coins?: number;     // שדה חדש
  referral_bonus_coins: number; 

  // שדות חוויית משתמש וניהול (Netflix Style)
  tags?: string[];             // שדה חדש - חשוב שיהיה מערך!
  recruiter_email?: string;    // שדה חדש
  is_hot?: boolean;            // שדה חדש
  media_url?: string;          // שדה חדש לוידאו/תמונה
  day_in_life?: string;        // שדה חדש

  created_by: UUID | null;
  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ----- Gigs -----

export interface Gig {
  id: UUID;
  code: string;
  title: string;
  description: string | null;
  org_unit_id: UUID | null;
  location: string | null;
  status: GigStatus;
  start_date: ISODate | null;
  end_date: ISODate | null;
  commitment_hours_per_week: number | null;
  owner_user_id: UUID | null;
  xp_reward: number;
  coin_reward: number;
  created_by: UUID | null;
  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface GigSkill {
  gig_id: UUID;
  skill_id: UUID;
  required_level: SkillLevel;
  weight: number; // 0.000–1.000
  is_mandatory: boolean;
  notes: string | null;
  created_at: ISOTimestamp;
}

// ----- User Skills + Endorsements -----

export interface UserSkill {
  user_id: UUID;
  skill_id: UUID;
  skill_level: SkillLevel;
  skill_xp: number;
  endorsement_count: number;
  last_endorsed_at: ISOTimestamp | null;
  is_verified: boolean;
  verified_by: UUID | null;
  verified_at: ISOTimestamp | null;
  source: string | null;
  evidence_url: string | null;
  notes: string | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface SkillEndorsement {
  id: UUID;
  user_id: UUID;      // receiver
  skill_id: UUID;
  endorser_user_id: UUID;
  message: string | null;
  created_at: ISOTimestamp;
}

// ----- Badges -----

export interface Badge {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: BadgeRarity;
  status: RecordStatus;
  xp_bonus: number;
  coin_bonus: number;
  metadata: Metadata;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface UserBadge {
  user_id: UUID;
  badge_id: UUID;
  awarded_at: ISOTimestamp;
  awarded_by: UUID | null;
  reason: string | null;
  metadata: Metadata;
}

// ----- Applications / Participation -----

export interface GigParticipant {
  id: UUID;
  gig_id: UUID;
  user_id: UUID;
  status: ApplicationStatus;
  applied_at: ISOTimestamp;
  accepted_at: ISOTimestamp | null;
  started_at: ISOTimestamp | null;
  completed_at: ISOTimestamp | null;
  notes: string | null;
}

export interface JobApplication {
  id: UUID;
  job_id: UUID;
  user_id: UUID;
  status: ApplicationStatus;
  applied_at: ISOTimestamp;
  notes: string | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ----- Feed Events (discriminated union) -----

/** Base fields shared by every feed event row */
interface FeedEventBase {
  id: UUID;
  actor_user_id: UUID | null;
  subject_user_id: UUID | null;
  org_unit_id: UUID | null;
  entity_table: string | null;
  entity_id: UUID | null;
  visibility: FeedVisibility;
  created_at: ISOTimestamp;
}

/**
 * Discriminated union: the compiler narrows `payload` automatically
 * when you check `event.event_type`.
 *
 * @example
 * ```ts
 * if (event.event_type === FeedEventType.LevelUp) {
 *   console.log(event.payload.to_level); // ✅ inferred
 * }
 * if (event.event_type === FeedEventType.NewJobPosted) {
 *   console.log(event.payload.title);    // ✅ inferred
 *   console.log(event.payload.to_level); // ❌ compile error
 * }
 * ```
 */
export type FeedEvent = {
  [K in FeedEventType]: FeedEventBase & {
    event_type: K;
    payload: FeedPayloadMap[K];
  };
}[FeedEventType];

// ----- XP / Coins Ledger -----

export interface XpTransaction {
  id: UUID;
  user_id: UUID;
  source_type: XpSourceType;
  source_id: UUID | null;
  source_label: string | null;
  xp_amount: number;
  coin_amount: number;
  created_by: UUID | null;
  metadata: Metadata;
  created_at: ISOTimestamp;
}

// ----- AI Taxonomy Suggestions -----

export type AiSuggestionType = 'skill' | 'alias' | 'relation' | 'merge' | 'deprecate';
export type AiSuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface AiTaxonomySuggestion {
  id: UUID;
  suggestion_type: AiSuggestionType;
  status: AiSuggestionStatus;
  payload: Metadata; // structure varies by suggestion_type
  created_by: UUID | null;
  reviewed_by: UUID | null;
  reviewed_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

// ============================================================
// 5. INSERT / UPDATE HELPERS
// ============================================================
// These omit server-generated fields so callers only pass what
// they control. Use with Supabase .insert() / .update() calls.

/** Fields the DB auto-generates (never sent by client) */
type AutoFields = 'id' | 'created_at' | 'updated_at';

/** For creating a new row: omit auto fields, make everything else required */
export type InsertRow<T> = Omit<T, AutoFields>;

/** For updating a row: all writeable fields are optional */
export type UpdateRow<T> = Partial<Omit<T, AutoFields | 'id'>>;

// Convenient per-entity insert/update types

export type InsertOrgUnit = InsertRow<OrgUnit>;
export type UpdateOrgUnit = UpdateRow<OrgUnit>;

export type InsertUser = Omit<User, 'created_at' | 'updated_at'>; // id comes from auth
export type UpdateUser = UpdateRow<User>;

export type InsertSkill = InsertRow<Skill>;
export type UpdateSkill = UpdateRow<Skill>;

export type InsertJob = InsertRow<Job>;
export type UpdateJob = UpdateRow<Job>;

export type InsertGig = InsertRow<Gig>;
export type UpdateGig = UpdateRow<Gig>;

export type InsertBadge = InsertRow<Badge>;
export type UpdateBadge = UpdateRow<Badge>;

export type InsertUserSkill = Omit<UserSkill, 'created_at' | 'updated_at'>;
export type UpdateUserSkill = Partial<Omit<UserSkill, 'user_id' | 'skill_id' | 'created_at' | 'updated_at'>>;

export type InsertXpTransaction = InsertRow<XpTransaction>;

// ============================================================
// 6. SUPABASE TABLE NAME MAP (for generic admin components)
// ============================================================

/** All public table names that the admin panel can manage */
export const ADMIN_TABLES = [
  'org_units',
  'org_memberships',
  'level_definitions',
  'users',
  'roles',
  'user_roles',
  'skills',
  'skill_aliases',
  'skill_relations',
  'jobs',
  'job_skills',
  'gigs',
  'gig_skills',
  'user_skills',
  'skill_endorsements',
  'badges',
  'user_badges',
  'gig_participants',
  'job_applications',
  'feed_events',
  'xp_transactions',
  'ai_taxonomy_suggestions',
] as const;

export type AdminTableName = (typeof ADMIN_TABLES)[number];

/** Maps table name → its Row type (used by generic admin components) */
export interface TableRowMap {
  org_units: OrgUnit;
  org_memberships: OrgMembership;
  level_definitions: LevelDefinition;
  users: User;
  roles: Role;
  user_roles: UserRole;
  skills: Skill;
  skill_aliases: SkillAlias;
  skill_relations: SkillRelation;
  jobs: Job;
  job_skills: JobSkill;
  gigs: Gig;
  gig_skills: GigSkill;
  user_skills: UserSkill;
  skill_endorsements: SkillEndorsement;
  badges: Badge;
  user_badges: UserBadge;
  gig_participants: GigParticipant;
  job_applications: JobApplication;
  feed_events: FeedEvent;
  xp_transactions: XpTransaction;
  ai_taxonomy_suggestions: AiTaxonomySuggestion;
}

/** Natural keys used for bulk upsert per entity */
export const UPSERT_KEYS: Partial<Record<AdminTableName, string[]>> = {
  org_units: ['code'],
  skills: ['slug'],
  jobs: ['code'],
  gigs: ['code'],
  badges: ['slug'],
  roles: ['code'],
  user_skills: ['user_id', 'skill_id'],
  job_skills: ['job_id', 'skill_id'],
  gig_skills: ['gig_id', 'skill_id'],
  user_badges: ['user_id', 'badge_id'],
  org_memberships: ['user_id', 'org_unit_id'],
  skill_aliases: ['alias'],
  skill_relations: ['from_skill_id', 'to_skill_id', 'relation'],
  skill_endorsements: ['user_id', 'skill_id', 'endorser_user_id'],
  gig_participants: ['gig_id', 'user_id'],
  job_applications: ['job_id', 'user_id'],
  user_roles: ['user_id', 'role_id'],
};

// ============================================================
// 7. UI / MOCK DATA TYPES (for prototyping pages)
// ============================================================

/** Recommendation card in the compass conveyor belt */
export interface CompassRecommendation {
  id: number;
  type: string;
  title: string;
  provider: string;
  duration: string;
  imageColor: string;
  icon: LucideIcon;
}

/** Career role for the compass radar chart */
export interface CompassRole {
  id: string;
  title: string;
  department: string;
  match: number;
  skillsData: number[];
  mySkills: number[];
  recommendations: CompassRecommendation[];
}

/** Course in the learning hub */
export interface Course {
  id: number;
  title: string;
  author: string;
  progress: number;
  duration: string;
  image: string;
  color: string;
}

/** Brain gym game definition */
export interface BrainGame {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  score: number;
}

/** Product in the rewards store */
export interface StoreProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  minLevel: number;
}

/** Team member avatar in job cards */
export interface TeamFriend {
  name: string;
  img: string;
}

/** Manager info for job cards */
export interface JobManager {
  name: string;
  img: string;
}

/** Job listing on the opportunities page */
export interface MockJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  bounty: number;
  isSurge: boolean;
  matchScore: number;
  missingSkills: string[];
  teamFriends: TeamFriend[];
  manager: JobManager;
  tags: string[];
}

/** Smart collection filter on opportunities page */
export interface JobCollection {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}
