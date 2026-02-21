'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Opportunity {
  id: string
  title: string
  department: string
  type: 'job' | 'gig'
  status: string
  created_at: string
  application_count: number
  xp_reward: number
}

/**
 * משיכת כל המשרות והגיגים במקביל
 */
export async function getAllOpportunities(): Promise<Opportunity[]> {
  const supabase = createClient()

  const [jobsRes, gigsRes] = await Promise.all([
    supabase.from('jobs').select('*'),
    supabase.from('gigs').select('*'),
  ])

  if (jobsRes.error) {
    console.error('Error fetching jobs:', jobsRes.error)
  }
  if (gigsRes.error) {
    console.error('Error fetching gigs:', gigsRes.error)
  }

  const jobs: Opportunity[] = (jobsRes.data || []).map((j) => ({
    id: j.id,
    title: j.title,
    department: j.location || 'כללי',
    type: 'job',
    status: j.status === 'published' ? 'פעיל' : 'טיוטה',
    created_at: j.created_at,
    application_count: 0,
    xp_reward: j.xp_reward || 0,
  }))

  const gigs: Opportunity[] = (gigsRes.data || []).map((g) => ({
    id: g.id,
    title: g.title,
    department: g.department || 'כללי',
    type: 'gig',
    status: g.status === 'open' ? 'פעיל' : 'סגור',
    created_at: g.created_at || '',
    application_count: 0,
    xp_reward: g.xp_reward || 0,
  }))

  return [...jobs, ...gigs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * מחיקת הזדמנות (משרה או גיג)
 */
export async function deleteOpportunity(id: string, type: 'job' | 'gig') {
  const supabase = createClient()

  if (type === 'job') {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) {
      console.error('Error deleting job:', error)
      throw new Error('Failed to delete job')
    }
  } else {
    const { error } = await supabase.from('gigs').delete().eq('id', id)
    if (error) {
      console.error('Error deleting gig:', error)
      throw new Error('Failed to delete gig')
    }
  }

  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')
}
