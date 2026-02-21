'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ParsedJob } from './ai-job-parser';

// ----------------------------------------------------------------
// Public Read / Simple Write (cookie-based SSR client)
// ----------------------------------------------------------------

export async function getJobs() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return (data || []).map(job => ({
    ...job,
    tags: job.tags || [],
    internal_xp: job.internal_xp || job.xp_reward || 0,
    referral_coins: job.referral_coins || job.coin_reward || 0,
    is_hot: job.is_hot || false,
    recruiter_email: job.recruiter_email || 'hr@fnx.co.il',
  }))
}

export async function createJob(formData: FormData) {
  const supabase = createClient()

  const title = formData.get('title') as string
  const code = formData.get('code') as string
  const tagsString = formData.get('tags') as string

  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : [];

  const { error } = await supabase
    .from('jobs')
    .insert({
      title,
      code,
      status: 'published',
      job_type: 'full_time',
      xp_reward: 50,
      coin_reward: 20,
      referral_bonus_coins: 20,
      internal_xp: Number(formData.get('internal_xp')) || 50,
      referral_coins: Number(formData.get('referral_coins')) || 20,
      recruiter_email: (formData.get('recruiter_email') as string) || 'hr@fnx.co.il',
      is_hot: formData.get('is_hot') === 'true',
      tags,
      metadata: {},
    })

  if (error) {
    console.error('Create job error:', error)
    throw new Error('Failed to create job')
  }

  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')
}

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface CreateJobResult {
  success: boolean;
  jobId: string | null;
  skillsCreated: number;
  skillsLinked: number;
  errors: string[];
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function generateJobCode(title: string): string {
  const slug = title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')
    .slice(0, 30);
  const suffix = Date.now().toString(36).slice(-5);
  return `JOB-${slug}-${suffix}`;
}

function slugifySkillName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
}

// ----------------------------------------------------------------
// Server Action (AI Parser)
// ----------------------------------------------------------------

export async function createJobWithSkills(
  data: ParsedJob,
): Promise<CreateJobResult> {
  if (!data.title?.trim()) {
    return { success: false, jobId: null, skillsCreated: 0, skillsLinked: 0, errors: ['Job title is required.'] };
  }

  const supabase = createAdminClient();
  const errors: string[] = [];

  const jobId = await insertJob(supabase, data, errors);
  if (!jobId) {
    return { success: false, jobId: null, skillsCreated: 0, skillsLinked: 0, errors };
  }

  const { skillsCreated, skillsLinked } = await processSkills(supabase, jobId, data, errors);

  revalidatePath('/opportunities')
  return { success: true, jobId, skillsCreated, skillsLinked, errors };
}

async function insertJob(
  supabase: ReturnType<typeof createAdminClient>,
  data: ParsedJob,
  errors: string[],
): Promise<string | null> {
  const jobCode = generateJobCode(data.title);
  const { data: jobRow, error: jobError } = await supabase
    .from('jobs')
    .insert({
      code: jobCode,
      title: data.title.trim(),
      description: data.description_summary?.trim() || null,
      status: 'published',
      job_type: 'full_time',
      xp_reward: 50,
      coin_reward: 20,
      referral_bonus_coins: 20,
      internal_xp: 50,
      referral_coins: 20,
      is_hot: false,
      tags: [data.department || 'כללי'],
      recruiter_email: 'hr@fnx.co.il',
      metadata: {},
    })
    .select('id')
    .single();

  if (jobError || !jobRow) {
    errors.push(jobError?.message ?? 'Failed to insert job.');
    return null;
  }

  return jobRow.id;
}

async function processSkills(
  supabase: ReturnType<typeof createAdminClient>,
  jobId: string,
  data: ParsedJob,
  errors: string[],
) {
  let skillsCreated = 0;
  let skillsLinked = 0;

  for (const parsedSkill of data.skills) {
    try {
      const skillName = parsedSkill.name.trim();
      if (!skillName) continue;

      const result = await findOrCreateSkill(supabase, skillName, data.department, errors);
      if (!result) continue;
      if (result.created) skillsCreated++;

      parsedSkill.is_mandatory ??= false;

      const { error: linkError } = await supabase
        .from('job_skills')
        .upsert(
          {
            job_id: jobId,
            skill_id: result.id,
            required_level: parsedSkill.level,
            weight: parsedSkill.level,
            is_mandatory: parsedSkill.is_mandatory,
          },
          { onConflict: 'job_id,skill_id' },
        );

      if (linkError) {
        errors.push(`Link "${skillName}": ${linkError.message}`);
        continue;
      }
      skillsLinked++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Skill "${parsedSkill.name}": ${msg}`);
    }
  }

  return { skillsCreated, skillsLinked };
}

async function findOrCreateSkill(
  supabase: ReturnType<typeof createAdminClient>,
  skillName: string,
  department: string | undefined,
  errors: string[],
): Promise<{ id: string; created: boolean } | null> {
  const { data: existingSkill } = await supabase
    .from('skills')
    .select('id')
    .ilike('name', skillName)
    .limit(1)
    .single();

  if (existingSkill) return { id: existingSkill.id, created: false };

  const slug = slugifySkillName(skillName);
  const { data: newSkill, error: skillError } = await supabase
    .from('skills')
    .insert({
      slug,
      name: skillName,
      category: department || 'General',
      skill_type: 'hard',
      status: 'active',
      source: 'ai',
      is_verified: false,
      metadata: {},
    })
    .select('id')
    .single();

  if (skillError || !newSkill) {
    errors.push(`Skill "${skillName}": ${skillError?.message ?? 'insert failed'}`);
    return null;
  }

  return { id: newSkill.id, created: true };
}
