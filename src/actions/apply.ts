'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// מזהה קבוע למשתמש הדמו שלנו
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * הגשת מועמדות למשרה + הענקת XP מיידי
 */
export async function applyForJob(jobId: string, jobTitle: string, xpReward: number) {
  const supabase = createClient()

  // 1. בדיקה/יצירה של משתמש הדמו
  await ensureDemoUser(supabase)

  // 2. בדיקה אם כבר הגיש מועמדות
  const { data: existing } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', DEMO_USER_ID)
    .single()

  if (existing) {
    return { success: true, alreadyApplied: true, reward: 0 }
  }

  // 3. יצירת רשומת מועמדות
  const { error: appError } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      user_id: DEMO_USER_ID,
      status: 'submitted',
      applied_at: new Date().toISOString(),
      notes: 'הגשה אוטומטית דרך המערכת',
    })

  if (appError) {
    if (appError.code === '23505') {
      return { success: true, alreadyApplied: true, reward: 0 }
    }
    console.error('Error applying:', appError)
    throw new Error('Failed to apply')
  }

  // 4. תיעוד תנועת XP
  if (xpReward > 0) {
    await supabase.from('xp_transactions').insert({
      user_id: DEMO_USER_ID,
      xp_amount: xpReward,
      coin_amount: 0,
      source_type: 'job_application',
      source_id: jobId,
      source_label: `הגשת מועמדות: ${jobTitle}`,
      metadata: { job_id: jobId },
    })

    // 5. עדכון יתרת XP של המשתמש
    await incrementUserXp(supabase, DEMO_USER_ID, xpReward)
  }

  revalidatePath('/opportunities')
  return { success: true, alreadyApplied: false, reward: xpReward }
}

/* ─── helpers ─── */

async function ensureDemoUser(supabase: ReturnType<typeof createClient>) {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', DEMO_USER_ID)
    .single()

  if (!existingUser) {
    const { error } = await supabase.from('users').insert({
      id: DEMO_USER_ID,
      email: 'demo@phoenix.com',
      display_name: 'עובד לדוגמה',
      is_active: true,
      current_level: 1,
      current_xp: 0,
      coins_balance: 0,
      avatar_config: {},
      metadata: {},
    })
    if (error) {
      console.error('Failed to create demo user:', error)
      throw new Error('Could not create demo user')
    }
  }
}

async function incrementUserXp(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  amount: number,
) {
  const { data } = await supabase
    .from('users')
    .select('current_xp')
    .eq('id', userId)
    .single()

  const newXp = (data?.current_xp ?? 0) + amount

  await supabase
    .from('users')
    .update({ current_xp: newXp })
    .eq('id', userId)
}
