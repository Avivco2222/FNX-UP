'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ─── types ─── */

export interface InternalApplication {
  id: string
  job_id: string
  user_id: string
  status: string
  applied_at: string
  notes: string | null
  job_title: string | null
  job_location: string | null
  applicant_name: string | null
  applicant_email: string | null
  applicant_xp: number
}

export interface Referral {
  id: string
  referrer_id: string | null
  job_id: string | null
  candidate_name: string
  candidate_phone: string | null
  candidate_email: string | null
  status: string | null
  bonus_amount: number | null
  created_at: string | null
  job_title: string | null
  job_location: string | null
  referrer_name: string | null
}

/* ─── queries ─── */

/** משיכת מועמדויות לניוד פנימי (עובדים קיימים) */
export async function getInternalApplications(): Promise<InternalApplication[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      id, job_id, user_id, status, applied_at, notes,
      jobs ( title, location ),
      users ( display_name, email, current_xp )
    `)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching internal applications:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const jobs = row.jobs as unknown as Record<string, unknown> | null
    const users = row.users as unknown as Record<string, unknown> | null
    return {
      id: row.id,
      job_id: row.job_id,
      user_id: row.user_id,
      status: row.status,
      applied_at: row.applied_at,
      notes: row.notes,
      job_title: (jobs?.title as string) ?? null,
      job_location: (jobs?.location as string) ?? null,
      applicant_name: (users?.display_name as string) ?? null,
      applicant_email: (users?.email as string) ?? null,
      applicant_xp: (users?.current_xp as number) ?? 0,
    }
  })
}

/** משיכת הפניות "חבר מביא חבר" */
export async function getReferrals(): Promise<Referral[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('referrals')
    .select(`
      id, referrer_id, job_id, candidate_name, candidate_phone,
      candidate_email, status, bonus_amount, created_at,
      jobs ( title, location ),
      users!referrer_id ( display_name )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching referrals:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const jobs = row.jobs as unknown as Record<string, unknown> | null
    const users = row.users as unknown as Record<string, unknown> | null
    return {
      id: row.id,
      referrer_id: row.referrer_id,
      job_id: row.job_id,
      candidate_name: row.candidate_name,
      candidate_phone: row.candidate_phone,
      candidate_email: row.candidate_email,
      status: row.status,
      bonus_amount: row.bonus_amount,
      created_at: row.created_at,
      job_title: (jobs?.title as string) ?? null,
      job_location: (jobs?.location as string) ?? null,
      referrer_name: (users?.display_name as string) ?? null,
    }
  })
}

/* ─── mutations ─── */

/** עדכון סטטוס מועמדות פנימית */
export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application status:', error)
    throw new Error('Failed to update status')
  }

  revalidatePath('/admin/applications')
}

/**
 * אישור גיוס מוצלח של הפניה – מעדכן את הסטטוס ויוצר זכאות לתשלום
 * תאריך הבשלה ברירת מחדל: 90 יום מהיום
 */
export async function approveReferralSuccess(referralId: string, referrerId: string) {
  const supabase = createClient()

  // 1. עדכון סטטוס ההפניה ל-hired
  const { error: updateError } = await supabase
    .from('referrals')
    .update({ status: 'hired' })
    .eq('id', referralId)

  if (updateError) {
    console.error('Error updating referral status:', updateError)
    throw new Error('Failed to update referral')
  }

  // 2. יצירת רשומת זכאות לתשלום – תאריך הבשלה של 90 יום
  const maturityDate = new Date()
  maturityDate.setDate(maturityDate.getDate() + 90)

  const { error: payoutError } = await supabase
    .from('referral_payouts')
    .insert({
      referral_id: referralId,
      user_id: referrerId,
      status: 'pending_maturity',
      maturity_date: maturityDate.toISOString(),
      is_eligible: true,
    })

  if (payoutError) {
    console.error('Error creating referral payout:', payoutError)
    throw new Error('Failed to create payout record')
  }

  revalidatePath('/admin/applications')
}
