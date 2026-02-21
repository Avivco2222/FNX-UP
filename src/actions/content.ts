'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ─── types ─── */

export interface AdminCourse {
  id: string
  title: string
  provider: string
  url: string | null
  image_url: string | null
  duration_hours: number | null
  xp_reward: number | null
  created_at: string | null
}

export interface AdminPost {
  id: string
  content: string
  post_type: string
  likes_count: number
  comments_count: number
  created_at: string | null
  author_name: string | null
}

export interface RewardQuest {
  id: string
  title: string
  description: string | null
  quest_type: string | null
  xp_reward: number | null
  coin_reward: number | null
  is_active: boolean | null
}

export interface CreateCourseData {
  title: string
  provider: string
  url: string
  image_url: string
  xp_reward: number
  duration_hours: number
}

/* ─── courses ─── */

export async function createCourse(courseData: CreateCourseData): Promise<AdminCourse> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: courseData.title,
      provider: courseData.provider,
      url: courseData.url || null,
      image_url: courseData.image_url || null,
      xp_reward: courseData.xp_reward || 50,
      duration_hours: courseData.duration_hours || null,
    })
    .select('id, title, provider, url, image_url, duration_hours, xp_reward, created_at')
    .single()

  if (error || !data) {
    console.error('Error creating course:', error)
    throw new Error('Failed to create course')
  }

  revalidatePath('/admin/content')
  revalidatePath('/learning')
  return data
}

export async function getCourses(): Promise<AdminCourse[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('courses')
    .select('id, title, provider, url, image_url, duration_hours, xp_reward, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data ?? []
}

export async function deleteCourse(courseId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    console.error('Error deleting course:', error)
    throw new Error('Failed to delete course')
  }

  revalidatePath('/admin/content')
}

/* ─── social posts ─── */

export async function getAdminPosts(): Promise<AdminPost[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('id, content, post_type, likes_count, comments_count, created_at, users ( display_name )')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const users = row.users as unknown as Record<string, unknown> | null
    return {
      id: row.id,
      content: row.content,
      post_type: row.post_type,
      likes_count: row.likes_count ?? 0,
      comments_count: row.comments_count ?? 0,
      created_at: row.created_at,
      author_name: (users?.display_name as string) ?? null,
    }
  })
}

export async function deleteAdminPost(postId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error('Failed to delete post')
  }

  revalidatePath('/admin/content')
}

/* ─── course inline update ─── */

export async function updateCourse(courseId: string, updates: Partial<CreateCourseData>) {
  const supabase = createClient()

  const { error } = await supabase
    .from('courses')
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.provider !== undefined && { provider: updates.provider }),
      ...(updates.url !== undefined && { url: updates.url || null }),
      ...(updates.image_url !== undefined && { image_url: updates.image_url || null }),
      ...(updates.xp_reward !== undefined && { xp_reward: updates.xp_reward }),
      ...(updates.duration_hours !== undefined && { duration_hours: updates.duration_hours || null }),
    })
    .eq('id', courseId)

  if (error) {
    console.error('Error updating course:', error)
    throw new Error('Failed to update course')
  }

  revalidatePath('/admin/content')
  revalidatePath('/learning')
}

/* ─── reward quests (global reward settings) ─── */

export async function getRewardQuests(): Promise<RewardQuest[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, coin_reward, is_active')
    .order('title')

  if (error) {
    console.error('Error fetching quests:', error)
    return []
  }

  return data ?? []
}

export async function updateRewardQuest(
  questId: string,
  updates: { xp_reward?: number; coin_reward?: number; is_active?: boolean },
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('quests')
    .update(updates)
    .eq('id', questId)

  if (error) {
    console.error('Error updating quest:', error)
    throw new Error('Failed to update quest')
  }

  revalidatePath('/admin/content')
}
