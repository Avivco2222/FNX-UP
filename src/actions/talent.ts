'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ─── types ─── */

export interface UserListItem {
  id: string
  display_name: string | null
  email: string | null
  role_title: string | null
  department: string | null
  current_xp: number
  coins_balance: number
  current_level: number
  is_active: boolean
  avatar_url: string | null
}

export interface SkillEntry {
  skill_name: string
  skill_category: string
  skill_level: number
  skill_xp: number
  is_verified: boolean
}

export interface XpTransaction {
  id: string
  created_at: string
  source_type: string
  source_label: string | null
  xp_amount: number
  coin_amount: number
}

export interface JobAppEntry {
  id: string
  created_at: string
  status: string
  job_title: string | null
}

export interface UserFullProfile {
  id: string
  display_name: string | null
  email: string | null
  role_title: string | null
  location: string | null
  department: string | null
  headline: string | null
  avatar_url: string | null
  hire_date: string | null
  is_active: boolean
  current_level: number
  current_xp: number
  coins_balance: number
  current_streak: number | null
  is_open_to_opportunities: boolean | null
  strengths: SkillEntry[]
  improvements: SkillEntry[]
  xp_transactions: XpTransaction[]
  job_applications: JobAppEntry[]
}

/* ─── queries ─── */

/** רשימת כל העובדים לטבלת ניהול */
export async function getUsersList(): Promise<UserListItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, email, role_title, department, current_xp, coins_balance, current_level, is_active, avatar_url')
    .order('display_name')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data ?? []
}

/** פרופיל מלא של עובד כולל מיומנויות, תנועות XP ומועמדויות */
export async function getUserFullProfile(userId: string): Promise<UserFullProfile | null> {
  const supabase = createClient()

  // 1. פרטי המשתמש הבסיסיים
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, display_name, email, role_title, location, department, headline, avatar_url, hire_date, is_active, current_level, current_xp, coins_balance, current_streak, is_open_to_opportunities')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('Error fetching user:', userError)
    return null
  }

  // 2. מיומנויות + שם המיומנות מטבלת skills
  const { data: rawSkills } = await supabase
    .from('user_skills')
    .select('skill_level, skill_xp, is_verified, skills ( name, category )')
    .eq('user_id', userId)
    .order('skill_xp', { ascending: false })

  const skills: SkillEntry[] = (rawSkills ?? []).map((row) => {
    const s = row.skills as unknown as Record<string, unknown> | null
    return {
      skill_name: (s?.name as string) ?? 'Unknown',
      skill_category: (s?.category as string) ?? '',
      skill_level: row.skill_level,
      skill_xp: row.skill_xp,
      is_verified: row.is_verified,
    }
  })

  const strengths = skills.slice(0, 5)
  const improvements = skills.length > 5 ? skills.slice(-5).reverse() : []

  // 3. תנועות XP ומטבעות (50 אחרונות)
  const { data: transactions } = await supabase
    .from('xp_transactions')
    .select('id, created_at, source_type, source_label, xp_amount, coin_amount')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const xp_transactions: XpTransaction[] = (transactions ?? []).map((tx) => ({
    id: tx.id,
    created_at: tx.created_at,
    source_type: tx.source_type,
    source_label: tx.source_label,
    xp_amount: tx.xp_amount,
    coin_amount: tx.coin_amount,
  }))

  // 4. היסטוריית מועמדויות
  const { data: rawApps } = await supabase
    .from('job_applications')
    .select('id, created_at, status, jobs ( title )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const job_applications: JobAppEntry[] = (rawApps ?? []).map((app) => {
    const jobs = app.jobs as unknown as Record<string, unknown> | null
    return {
      id: app.id,
      created_at: app.created_at,
      status: app.status,
      job_title: (jobs?.title as string) ?? null,
    }
  })

  return {
    ...user,
    strengths,
    improvements,
    xp_transactions,
    job_applications,
  }
}

/* ─── mutations ─── */

/**
 * עדכון ידני של XP או מטבעות עם תיעוד מלא ביומן
 * (fetch-then-update כדי להימנע מתלות ב-RPC)
 */
export async function manualRewardUpdate(
  userId: string,
  amount: number,
  type: 'xp' | 'coins',
  reason: string,
) {
  const supabase = createClient()

  // 1. קריאת יתרה נוכחית
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('current_xp, coins_balance')
    .eq('id', userId)
    .single()

  if (fetchError || !user) {
    console.error('Error fetching user balance:', fetchError)
    throw new Error('Failed to fetch current balance')
  }

  // 2. חישוב יתרה חדשה (לא מאפשרים ירידה מתחת ל-0)
  const currentValue = type === 'xp' ? user.current_xp : user.coins_balance
  const newValue = Math.max(0, currentValue + amount)

  const updateField = type === 'xp' ? { current_xp: newValue } : { coins_balance: newValue }
  const { error: updateError } = await supabase
    .from('users')
    .update(updateField)
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating balance:', updateError)
    throw new Error('Failed to update balance')
  }

  // 3. תיעוד בלוג – שקיפות מלאה
  const { error: logError } = await supabase
    .from('xp_transactions')
    .insert({
      user_id: userId,
      source_type: 'admin_adjustment',
      source_label: `עדכון ידני: ${reason}`,
      xp_amount: type === 'xp' ? amount : 0,
      coin_amount: type === 'coins' ? amount : 0,
      metadata: { admin_reason: reason, adjustment_type: type },
    })

  if (logError) {
    console.error('Error logging transaction:', logError)
  }

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
}
