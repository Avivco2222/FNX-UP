-- חלק 1: תשתית וטבלאות
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

-- Enums
do $$ begin create type record_status as enum ('draft','active','deprecated','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type org_unit_type as enum ('company','division','department','team','chapter','guild','other'); exception when duplicate_object then null; end $$;
do $$ begin create type skill_type as enum ('technical','soft','domain','tool','certification','language','process','other'); exception when duplicate_object then null; end $$;
do $$ begin create type relation_type as enum ('related','prerequisite','broader','narrower','synonym','complements'); exception when duplicate_object then null; end $$;
do $$ begin create type job_type as enum ('full_time','part_time','contract','internship','temporary','other'); exception when duplicate_object then null; end $$;
do $$ begin create type job_status as enum ('draft','published','closed','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type gig_status as enum ('draft','open','in_progress','closed','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type application_status as enum ('draft','submitted','withdrawn','rejected','accepted','in_progress','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type badge_rarity as enum ('common','uncommon','rare','epic','legendary'); exception when duplicate_object then null; end $$;
do $$ begin create type feed_visibility as enum ('private','team','org','public'); exception when duplicate_object then null; end $$;
do $$ begin create type feed_event_type as enum ('profile_updated','skill_added','skill_leveled_up','skill_verified','endorsement_received','badge_earned','gig_applied','gig_accepted','gig_completed','job_applied','new_job_posted','level_up','coins_earned','admin_adjustment'); exception when duplicate_object then null; end $$;
do $$ begin create type xp_source_type as enum ('gig','job','learning','badge','endorsement','admin','import','other'); exception when duplicate_object then null; end $$;

-- Utility Functions
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create or replace function public.slugify(input text) returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input,'')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Tables
create table if not exists public.org_units (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  unit_type org_unit_type not null default 'team',
  parent_org_unit_id uuid references public.org_units(id) on delete set null,
  status record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_org_units_updated_at on public.org_units;
create trigger trg_org_units_updated_at before update on public.org_units for each row execute function public.set_updated_at();

create table if not exists public.level_definitions (
  level int primary key check (level >= 1),
  min_total_xp int not null unique check (min_total_xp >= 0),
  title text not null,
  perks jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_level_definitions_updated_at on public.level_definitions;
create trigger trg_level_definitions_updated_at before update on public.level_definitions for each row execute function public.set_updated_at();

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id citext unique,
  email citext,
  display_name text,
  headline text,
  bio text,
  location text,
  role_title text,
  avatar_url text,
  hire_date date,
  is_active boolean not null default true,
  manager_user_id uuid references public.users(id) on delete set null,
  current_level int not null default 1 check (current_level >= 1),
  current_xp int not null default 0 check (current_xp >= 0),
  coins_balance bigint not null default 0,
  avatar_config jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();

create table if not exists public.org_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  org_unit_id uuid not null references public.org_units(id) on delete cascade,
  is_primary boolean not null default false,
  start_date date,
  end_date date,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
drop trigger if exists trg_org_memberships_updated_at on public.org_memberships;
create trigger trg_org_memberships_updated_at before update on public.org_memberships for each row execute function public.set_updated_at();
create unique index if not exists uq_org_memberships_user_unit on public.org_memberships(user_id, org_unit_id);
create unique index if not exists uq_org_memberships_primary_active on public.org_memberships(user_id) where is_primary = true and end_date is null;

create or replace function public.handle_new_auth_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name) values (new.id, new.email, split_part(coalesce(new.email,''),'@',1)) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_roles_updated_at on public.roles;
create trigger trg_roles_updated_at before update on public.roles for each row execute function public.set_updated_at();

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create or replace function public.has_role(role_code citext) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id where ur.user_id = auth.uid() and r.code = $1);
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('admin'::citext);
$$;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  category text not null default 'General',
  description text,
  skill_type skill_type not null default 'other',
  status record_status not null default 'active',
  is_verified boolean not null default false,
  parent_skill_id uuid references public.skills(id) on delete set null,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_skills_updated_at on public.skills;
create trigger trg_skills_updated_at before update on public.skills for each row execute function public.set_updated_at();
create unique index if not exists uq_skills_name_lower on public.skills (lower(name));

create table if not exists public.skill_aliases (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  alias citext not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_relations (
  id uuid primary key default gen_random_uuid(),
  from_skill_id uuid not null references public.skills(id) on delete cascade,
  to_skill_id uuid not null references public.skills(id) on delete cascade,
  relation relation_type not null,
  weight numeric(4,3) not null default 0.500 check (weight >= 0 and weight <= 1),
  notes text,
  created_at timestamptz not null default now(),
  unique(from_skill_id, to_skill_id, relation)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  title text not null,
  description text,
  org_unit_id uuid references public.org_units(id) on delete set null,
  location text,
  job_type job_type not null default 'other',
  level_band text,
  status job_status not null default 'draft',
  xp_reward int not null default 0 check (xp_reward >= 0),
  coin_reward int not null default 0 check (coin_reward >= 0),
  referral_bonus_coins int not null default 0 check (referral_bonus_coins >= 0),
  created_by uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();

create table if not exists public.job_skills (
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  required_level smallint not null default 1 check (required_level between 1 and 5),
  weight numeric(4,3) not null default 0.500,
  is_mandatory boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  primary key (job_id, skill_id)
);

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  title text not null,
  description text,
  org_unit_id uuid references public.org_units(id) on delete set null,
  location text,
  status gig_status not null default 'draft',
  start_date date,
  end_date date,
  commitment_hours_per_week numeric(5,2),
  owner_user_id uuid references public.users(id) on delete set null,
  xp_reward int not null default 0,
  coin_reward int not null default 0,
  created_by uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
drop trigger if exists trg_gigs_updated_at on public.gigs;
create trigger trg_gigs_updated_at before update on public.gigs for each row execute function public.set_updated_at();

create table if not exists public.gig_skills (
  gig_id uuid not null references public.gigs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  required_level smallint not null default 1 check (required_level between 1 and 5),
  weight numeric(4,3) not null default 0.500,
  is_mandatory boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  primary key (gig_id, skill_id)
);

create table if not exists public.user_skills (
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  skill_level smallint not null default 1 check (skill_level between 1 and 5),
  skill_xp int not null default 0,
  endorsement_count int not null default 0,
  last_endorsed_at timestamptz,
  is_verified boolean not null default false,
  verified_by uuid references public.users(id) on delete set null,
  verified_at timestamptz,
  source text,
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
drop trigger if exists trg_user_skills_updated_at on public.user_skills;
create trigger trg_user_skills_updated_at before update on public.user_skills for each row execute function public.set_updated_at();

create table if not exists public.skill_endorsements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  endorser_user_id uuid not null references public.users(id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  check (user_id <> endorser_user_id),
  unique (user_id, skill_id, endorser_user_id)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  description text,
  icon text,
  rarity badge_rarity not null default 'common',
  status record_status not null default 'active',
  xp_bonus int not null default 0,
  coin_bonus int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_badges_updated_at on public.badges;
create trigger trg_badges_updated_at before update on public.badges for each row execute function public.set_updated_at();

create table if not exists public.user_badges (
  user_id uuid not null references public.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references public.users(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, badge_id)
);

create table if not exists public.gig_participants (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status application_status not null default 'submitted',
  applied_at timestamptz not null default now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  unique (gig_id, user_id)
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status application_status not null default 'submitted',
  applied_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);
drop trigger if exists trg_job_applications_updated_at on public.job_applications;
create trigger trg_job_applications_updated_at before update on public.job_applications for each row execute function public.set_updated_at();

create table if not exists public.feed_events (
  id uuid primary key default gen_random_uuid(),
  event_type feed_event_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  subject_user_id uuid references public.users(id) on delete set null,
  org_unit_id uuid references public.org_units(id) on delete set null,
  entity_table text,
  entity_id uuid,
  visibility feed_visibility not null default 'org',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type xp_source_type not null default 'other',
  source_id uuid,
  source_label text,
  xp_amount int not null default 0,
  coin_amount int not null default 0,
  created_by uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (xp_amount <> 0 or coin_amount <> 0)
);
create unique index if not exists uq_xp_transactions_dedup on public.xp_transactions(user_id, source_type, source_id) where source_id is not null;

create table if not exists public.ai_taxonomy_suggestions (
  id uuid primary key default gen_random_uuid(),
  suggestion_type text not null,
  status text not null default 'pending',
  payload jsonb not null,
  created_by uuid references public.users(id) on delete set null,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_ai_taxonomy_suggestions_updated_at on public.ai_taxonomy_suggestions;
create trigger trg_ai_taxonomy_suggestions_updated_at before update on public.ai_taxonomy_suggestions for each row execute function public.set_updated_at();
-- חלק 2: פונקציות וטריגרים
-- =========================================================

-- Endorsements Sync
create or replace function public.sync_endorsement_count() returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.user_skills (user_id, skill_id, skill_level, endorsement_count, last_endorsed_at, source)
    values (new.user_id, new.skill_id, 1, 1, new.created_at, 'endorsement')
    on conflict (user_id, skill_id) do update
      set endorsement_count = public.user_skills.endorsement_count + 1,
          last_endorsed_at = greatest(coalesce(public.user_skills.last_endorsed_at, 'epoch'::timestamptz), excluded.last_endorsed_at);
    return new;
  elsif (tg_op = 'DELETE') then
    update public.user_skills set endorsement_count = greatest(0, endorsement_count - 1)
    where user_id = old.user_id and skill_id = old.skill_id;
    return old;
  end if;
  return null;
end $$;
drop trigger if exists trg_skill_endorsements_sync on public.skill_endorsements;
create trigger trg_skill_endorsements_sync after insert or delete on public.skill_endorsements for each row execute function public.sync_endorsement_count();

-- XP Ledger & Level Up
create or replace function public.apply_xp_transaction() returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_total_xp int;
  old_level int;
  new_level int;
begin
  select current_level into old_level from public.users where id = new.user_id for update;
  update public.users set current_xp = greatest(0, current_xp + new.xp_amount), coins_balance = coins_balance + new.coin_amount where id = new.user_id returning current_xp into new_total_xp;
  
  select ld.level into new_level from public.level_definitions ld where ld.min_total_xp <= new_total_xp order by ld.min_total_xp desc limit 1;
  if new_level is null then new_level := 1; end if;
  
  update public.users set current_level = greatest(1, new_level) where id = new.user_id;
  
  insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload)
  values (
    case when new.source_type = 'admin' then 'admin_adjustment'::feed_event_type else 'coins_earned'::feed_event_type end, 
    new.created_by, new.user_id, 'xp_transactions', new.id, 'org', jsonb_build_object('xp_amount', new.xp_amount, 'coin_amount', new.coin_amount)
  );
  
  if new_level > old_level then
    insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload)
    values ('level_up'::feed_event_type, new.user_id, new.user_id, 'users', new.user_id, 'org', jsonb_build_object('from_level', old_level, 'to_level', new_level, 'total_xp', new_total_xp));
  end if;
  return new;
end $$;
drop trigger if exists trg_xp_transactions_apply on public.xp_transactions;
create trigger trg_xp_transactions_apply after insert on public.xp_transactions for each row execute function public.apply_xp_transaction();

-- Badge Rewards
create or replace function public.award_badge_rewards() returns trigger language plpgsql security definer set search_path = public as $$
declare b public.badges%rowtype;
begin
  select * into b from public.badges where id = new.badge_id;
  if coalesce(b.xp_bonus,0) > 0 or coalesce(b.coin_bonus,0) > 0 then
    insert into public.xp_transactions (user_id, source_type, source_id, source_label, xp_amount, coin_amount, created_by, metadata)
    values (new.user_id, 'badge', new.badge_id, b.name, b.xp_bonus, b.coin_bonus, new.awarded_by, jsonb_build_object('reason', new.reason)) on conflict do nothing;
  end if;
  insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload)
  values ('badge_earned'::feed_event_type, new.user_id, new.user_id, 'badges', new.badge_id, 'org', jsonb_build_object('badge_id', new.badge_id, 'badge_name', b.name, 'rarity', b.rarity));
  return new;
end $$;
drop trigger if exists trg_user_badges_rewards on public.user_badges;
create trigger trg_user_badges_rewards after insert on public.user_badges for each row execute function public.award_badge_rewards();

-- Gig Logic (זו הפונקציה שנכשלה קודם)
create or replace function public.handle_gig_participant_events() returns trigger language plpgsql security definer set search_path = public as $$
declare g public.gigs%rowtype;
begin
  select * into g from public.gigs where id = coalesce(new.gig_id, old.gig_id);
  if (tg_op = 'INSERT') then
    insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload, org_unit_id)
    values ('gig_applied'::feed_event_type, new.user_id, new.user_id, 'gigs', new.gig_id, 'team', jsonb_build_object('gig_id', new.gig_id, 'gig_title', g.title), g.org_unit_id);
    return new;
  end if;
  if (tg_op = 'UPDATE') then
    if (old.status is distinct from new.status) and new.status = 'accepted' then
      insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload, org_unit_id)
      values ('gig_accepted'::feed_event_type, new.user_id, new.user_id, 'gigs', new.gig_id, 'team', jsonb_build_object('gig_id', new.gig_id, 'gig_title', g.title), g.org_unit_id);
    end if;
    if (old.status is distinct from new.status) and new.status = 'completed' then
      insert into public.xp_transactions (user_id, source_type, source_id, source_label, xp_amount, coin_amount, created_by)
      values (new.user_id, 'gig', new.gig_id, g.title, g.xp_reward, g.coin_reward, new.user_id) on conflict do nothing;
      
      insert into public.feed_events(event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload, org_unit_id)
      values ('gig_completed'::feed_event_type, new.user_id, new.user_id, 'gigs', new.gig_id, 'team', jsonb_build_object('gig_id', new.gig_id, 'gig_title', g.title), g.org_unit_id);
    end if;
    return new;
  end if;
  return null;
end $$;
drop trigger if exists trg_gig_participants_events on public.gig_participants;
create trigger trg_gig_participants_events after insert or update on public.gig_participants for each row execute function public.handle_gig_participant_events();

-- Job Logic
create or replace function public.handle_job_publication() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (old.status is distinct from 'published' and new.status = 'published') then
    insert into public.feed_events (event_type, actor_user_id, subject_user_id, entity_table, entity_id, visibility, payload, org_unit_id)
    values ('new_job_posted'::feed_event_type, new.created_by, new.created_by, 'jobs', new.id, 'org', jsonb_build_object('job_id', new.id, 'title', new.title, 'org_unit_id', new.org_unit_id, 'bonus', new.referral_bonus_coins), new.org_unit_id);
  end if;
  return new;
end $$;
drop trigger if exists trg_jobs_on_publish on public.jobs;
create trigger trg_jobs_on_publish after update on public.jobs for each row execute function public.handle_job_publication();
-- חלק 3: RLS Policies ו-Seeds
-- =========================================================

-- RLS Enable
alter table public.org_units enable row level security;
alter table public.org_memberships enable row level security;
alter table public.level_definitions enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.skills enable row level security;
alter table public.skill_aliases enable row level security;
alter table public.skill_relations enable row level security;
alter table public.jobs enable row level security;
alter table public.job_skills enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.skill_endorsements enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.gig_participants enable row level security;
alter table public.job_applications enable row level security;
alter table public.feed_events enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.ai_taxonomy_suggestions enable row level security;

-- Policies
do $$ begin
  execute 'drop policy if exists org_units_read_authenticated on public.org_units';
  execute 'drop policy if exists org_units_admin_write on public.org_units';
  execute 'drop policy if exists org_memberships_read_authenticated on public.org_memberships';
  execute 'drop policy if exists org_memberships_admin_write on public.org_memberships';
  execute 'drop policy if exists users_read_authenticated on public.users';
  execute 'drop policy if exists users_update_self_or_admin on public.users';
  execute 'drop policy if exists roles_admin_all on public.roles';
  execute 'drop policy if exists user_roles_admin_all on public.user_roles';
  execute 'drop policy if exists level_definitions_read_authenticated on public.level_definitions';
  execute 'drop policy if exists level_definitions_admin_write on public.level_definitions';
  execute 'drop policy if exists skills_read_authenticated on public.skills';
  execute 'drop policy if exists skills_admin_write on public.skills';
  execute 'drop policy if exists skill_aliases_read_authenticated on public.skill_aliases';
  execute 'drop policy if exists skill_aliases_admin_write on public.skill_aliases';
  execute 'drop policy if exists skill_relations_read_authenticated on public.skill_relations';
  execute 'drop policy if exists skill_relations_admin_write on public.skill_relations';
  execute 'drop policy if exists jobs_read_authenticated on public.jobs';
  execute 'drop policy if exists jobs_admin_write on public.jobs';
  execute 'drop policy if exists job_skills_read_authenticated on public.job_skills';
  execute 'drop policy if exists job_skills_admin_write on public.job_skills';
  execute 'drop policy if exists gigs_read_authenticated on public.gigs';
  execute 'drop policy if exists gigs_admin_write on public.gigs';
  execute 'drop policy if exists gig_skills_read_authenticated on public.gig_skills';
  execute 'drop policy if exists gig_skills_admin_write on public.gig_skills';
  execute 'drop policy if exists badges_read_authenticated on public.badges';
  execute 'drop policy if exists badges_admin_write on public.badges';
  execute 'drop policy if exists user_skills_read_authenticated on public.user_skills';
  execute 'drop policy if exists user_skills_write_self_or_admin on public.user_skills';
  execute 'drop policy if exists endorsements_read_authenticated on public.skill_endorsements';
  execute 'drop policy if exists endorsements_insert_authenticated on public.skill_endorsements';
  execute 'drop policy if exists endorsements_delete_self_or_admin on public.skill_endorsements';
  execute 'drop policy if exists user_badges_read_authenticated on public.user_badges';
  execute 'drop policy if exists user_badges_admin_write on public.user_badges';
  execute 'drop policy if exists gig_participants_select_self_owner_or_admin on public.gig_participants';
  execute 'drop policy if exists gig_participants_write_self_owner_or_admin on public.gig_participants';
  execute 'drop policy if exists job_applications_select_self_or_admin on public.job_applications';
  execute 'drop policy if exists job_applications_write_self_or_admin on public.job_applications';
  execute 'drop policy if exists feed_events_read_scoped on public.feed_events';
  execute 'drop policy if exists feed_events_insert_admin_or_self on public.feed_events';
  execute 'drop policy if exists xp_transactions_select_self_or_admin on public.xp_transactions';
  execute 'drop policy if exists xp_transactions_insert_admin_only on public.xp_transactions';
  execute 'drop policy if exists ai_taxonomy_suggestions_admin_all on public.ai_taxonomy_suggestions';
  execute 'drop policy if exists ai_taxonomy_suggestions_insert_admin on public.ai_taxonomy_suggestions';
exception when others then null; end $$;

create policy org_units_read_authenticated on public.org_units for select using (auth.role() = 'authenticated');
create policy org_units_admin_write on public.org_units for all using (public.is_admin()) with check (public.is_admin());

create policy org_memberships_read_authenticated on public.org_memberships for select using (auth.role() = 'authenticated');
create policy org_memberships_admin_write on public.org_memberships for all using (public.is_admin()) with check (public.is_admin());

create policy users_read_authenticated on public.users for select using (auth.role() = 'authenticated');
create policy users_update_self_or_admin on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy roles_admin_all on public.roles for all using (public.is_admin()) with check (public.is_admin());
create policy user_roles_admin_all on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

create policy level_definitions_read_authenticated on public.level_definitions for select using (auth.role() = 'authenticated');
create policy level_definitions_admin_write on public.level_definitions for all using (public.is_admin()) with check (public.is_admin());

create policy skills_read_authenticated on public.skills for select using (auth.role() = 'authenticated');
create policy skills_admin_write on public.skills for all using (public.is_admin()) with check (public.is_admin());

create policy skill_aliases_read_authenticated on public.skill_aliases for select using (auth.role() = 'authenticated');
create policy skill_aliases_admin_write on public.skill_aliases for all using (public.is_admin()) with check (public.is_admin());

create policy skill_relations_read_authenticated on public.skill_relations for select using (auth.role() = 'authenticated');
create policy skill_relations_admin_write on public.skill_relations for all using (public.is_admin()) with check (public.is_admin());

create policy jobs_read_authenticated on public.jobs for select using (auth.role() = 'authenticated');
create policy jobs_admin_write on public.jobs for all using (public.is_admin()) with check (public.is_admin());

create policy job_skills_read_authenticated on public.job_skills for select using (auth.role() = 'authenticated');
create policy job_skills_admin_write on public.job_skills for all using (public.is_admin()) with check (public.is_admin());

create policy gigs_read_authenticated on public.gigs for select using (auth.role() = 'authenticated');
create policy gigs_admin_write on public.gigs for all using (public.is_admin()) with check (public.is_admin());

create policy gig_skills_read_authenticated on public.gig_skills for select using (auth.role() = 'authenticated');
create policy gig_skills_admin_write on public.gig_skills for all using (public.is_admin()) with check (public.is_admin());

create policy badges_read_authenticated on public.badges for select using (auth.role() = 'authenticated');
create policy badges_admin_write on public.badges for all using (public.is_admin()) with check (public.is_admin());

create policy user_skills_read_authenticated on public.user_skills for select using (auth.role() = 'authenticated');
create policy user_skills_write_self_or_admin on public.user_skills for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy endorsements_read_authenticated on public.skill_endorsements for select using (auth.role() = 'authenticated');
create policy endorsements_insert_authenticated on public.skill_endorsements for insert with check (auth.role() = 'authenticated' and endorser_user_id = auth.uid() and user_id <> auth.uid());
create policy endorsements_delete_self_or_admin on public.skill_endorsements for delete using (endorser_user_id = auth.uid() or public.is_admin());

create policy user_badges_read_authenticated on public.user_badges for select using (auth.role() = 'authenticated');
create policy user_badges_admin_write on public.user_badges for all using (public.is_admin()) with check (public.is_admin());

create policy gig_participants_select_self_owner_or_admin on public.gig_participants for select using (user_id = auth.uid() or public.is_admin() or exists (select 1 from public.gigs g where g.id = gig_participants.gig_id and g.owner_user_id = auth.uid()));
create policy gig_participants_write_self_owner_or_admin on public.gig_participants for all using (user_id = auth.uid() or public.is_admin() or exists (select 1 from public.gigs g where g.id = gig_participants.gig_id and g.owner_user_id = auth.uid())) with check (user_id = auth.uid() or public.is_admin() or exists (select 1 from public.gigs g where g.id = gig_participants.gig_id and g.owner_user_id = auth.uid()));

create policy job_applications_select_self_or_admin on public.job_applications for select using (user_id = auth.uid() or public.is_admin());
create policy job_applications_write_self_or_admin on public.job_applications for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy feed_events_read_scoped on public.feed_events for select using (public.is_admin() or visibility in ('org','public') or (visibility = 'private' and (actor_user_id = auth.uid() or subject_user_id = auth.uid())) or (visibility = 'team' and org_unit_id is not null and exists (select 1 from public.org_memberships m where m.user_id = auth.uid() and m.org_unit_id = feed_events.org_unit_id and (m.end_date is null or m.end_date >= now()::date))));
create policy feed_events_insert_admin_or_self on public.feed_events for insert with check (public.is_admin() or actor_user_id = auth.uid());

create policy xp_transactions_select_self_or_admin on public.xp_transactions for select using (user_id = auth.uid() or public.is_admin());
create policy xp_transactions_insert_admin_only on public.xp_transactions for insert with check (public.is_admin());

create policy ai_taxonomy_suggestions_admin_all on public.ai_taxonomy_suggestions for all using (public.is_admin()) with check (public.is_admin());
create policy ai_taxonomy_suggestions_insert_admin on public.ai_taxonomy_suggestions for insert with check (public.is_admin());

-- Seeds
insert into public.roles(code, name, description) values ('admin', 'Admin', 'Full admin access') on conflict (code) do nothing;
insert into public.level_definitions(level, min_total_xp, title) values (1,0,'Initiate'),(2,100,'Apprentice'),(3,250,'Contributor'),(4,450,'Specialist'),(5,700,'Advanced'),(6,1000,'Expert'),(7,1350,'Veteran'),(8,1750,'Master'),(9,2200,'Elite'),(10,2700,'Legend') on conflict (level) do nothing;