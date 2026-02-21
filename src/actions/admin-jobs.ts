'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * משיכת כל המשרות עם מיומנויות ומספר מועמדויות (JOIN)
 */
export async function getAllAdminJobs() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_skills (
        skill_id,
        skills ( name )
      ),
      job_applications ( count )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin jobs:', error)
    return []
  }

  return data || []
}

/**
 * עדכון סטטוס משרה (פרסום/הסרה)
 */
export async function updateJobStatus(jobId: string, status: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) {
    console.error('Error updating job status:', error)
    throw new Error('Failed to update job status')
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/opportunities')
}
