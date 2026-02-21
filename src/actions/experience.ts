'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ─── types ─── */

export interface AppWidget {
  key: string
  label: string
  is_visible: boolean
  order_index: number
}

export interface SocialPost {
  id: string
  user_id: string | null
  content: string
  post_type: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string | null
  author_name: string | null
  author_avatar: string | null
}

/* ─── layout queries ─── */

/** משיכת כל הווידג'טים לפי סדר */
export async function getWidgets(): Promise<AppWidget[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('app_widgets')
    .select('key, label, is_visible, order_index')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching widgets:', error)
    return []
  }

  return (data ?? []).map((w) => ({
    key: w.key,
    label: w.label ?? w.key,
    is_visible: w.is_visible ?? true,
    order_index: w.order_index ?? 0,
  }))
}

/** עדכון סדר ונראות – Bulk Upsert */
export async function updateLayout(widgets: AppWidget[]) {
  const supabase = createClient()

  const { error } = await supabase
    .from('app_widgets')
    .upsert(
      widgets.map((w) => ({
        key: w.key,
        label: w.label,
        is_visible: w.is_visible,
        order_index: w.order_index,
      })),
    )

  if (error) {
    console.error('Error updating layout:', error)
    throw new Error('Failed to save layout')
  }

  revalidatePath('/')
  revalidatePath('/admin/experience')
}

/* ─── social feed queries ─── */

/** משיכת כל הפוסטים כולל שם המחבר */
export async function getSocialFeed(): Promise<SocialPost[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('id, user_id, content, post_type, image_url, likes_count, comments_count, created_at, users ( display_name, avatar_url )')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching social feed:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const users = row.users as unknown as Record<string, unknown> | null
    return {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      post_type: row.post_type,
      image_url: row.image_url,
      likes_count: row.likes_count ?? 0,
      comments_count: row.comments_count ?? 0,
      created_at: row.created_at,
      author_name: (users?.display_name as string) ?? null,
      author_avatar: (users?.avatar_url as string) ?? null,
    }
  })
}

/** מחיקת פוסט */
export async function deletePost(postId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error('Failed to delete post')
  }

  revalidatePath('/admin/experience')
}
