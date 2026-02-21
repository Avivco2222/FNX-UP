'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

export type DbCourse = Database['public']['Tables']['courses']['Row']

export async function getCourses(): Promise<DbCourse[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data || []
}
