'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface OpportunityFormData {
  id?: string
  title: string
  description: string
  department: string
  xp_reward: number
  referralBonus: number
  skills: string[]
}

/* ─── internal helpers ─── */

async function upsertJob(formData: OpportunityFormData) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .upsert({
      ...(formData.id ? { id: formData.id } : {}),
      title: formData.title,
      description: formData.description,
      code: `JOB-${Date.now().toString(36)}`,
      location: formData.department,
      job_type: 'full_time',
      status: 'published',
      xp_reward: formData.xp_reward,
      coin_reward: 100,
      referral_bonus_coins: formData.referralBonus,
      metadata: {},
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Error saving job:', error)
    throw new Error('Failed to save job')
  }
  return data.id
}

async function upsertGig(formData: OpportunityFormData) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gigs')
    .upsert({
      ...(formData.id ? { id: formData.id } : {}),
      title: formData.title,
      description: formData.description,
      department: formData.department,
      status: 'open',
      xp_reward: formData.xp_reward,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Error saving gig:', error)
    throw new Error('Failed to save gig')
  }
  return data.id
}

async function syncSkills(opportunityId: string, type: 'job' | 'gig', skills: string[]) {
  const supabase = createClient()

  if (type === 'job') {
    await supabase.from('job_skills').delete().eq('job_id', opportunityId)
    if (skills.length > 0) {
      const rows = skills.map((skillId) => ({
        job_id: opportunityId,
        skill_id: skillId,
        is_mandatory: true,
        required_level: 3,
        weight: 1,
      }))
      const { error } = await supabase.from('job_skills').insert(rows)
      if (error) console.error('Error linking job skills:', error)
    }
  } else {
    await supabase.from('gig_skills').delete().eq('gig_id', opportunityId)
    if (skills.length > 0) {
      const rows = skills.map((skillId) => ({
        gig_id: opportunityId,
        skill_id: skillId,
        is_mandatory: true,
        required_level: 3,
        weight: 1,
      }))
      const { error } = await supabase.from('gig_skills').insert(rows)
      if (error) console.error('Error linking gig skills:', error)
    }
  }
}

async function syncReferralBonus(opportunityId: string, title: string, bonus: number) {
  if (bonus <= 0) return
  const supabase = createClient()
  await supabase.from('reward_rules').upsert({
    job_id: opportunityId,
    title: `בונוס עבור ${title}`,
    trigger_status: 'accepted',
    cash_reward: bonus,
    is_active: true,
  })
}

/* ─── public actions ─── */

/**
 * יצירת/עדכון הזדמנות (משרה או גיג) כולל שיוך מיומנויות וחוקי תגמול
 */
export async function saveOpportunity(formData: OpportunityFormData, type: 'job' | 'gig') {
  const opportunityId = type === 'job'
    ? await upsertJob(formData)
    : await upsertGig(formData)

  await syncSkills(opportunityId, type, formData.skills)

  if (type === 'job') {
    await syncReferralBonus(opportunityId, formData.title, formData.referralBonus)
  }

  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')

  return { id: opportunityId }
}

/**
 * טעינת כל המיומנויות מה-Taxonomy
 */
export async function getSkillsList() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('skills')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Error fetching skills:', error)
    return []
  }

  return data ?? []
}
