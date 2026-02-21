'use server'

import { createClient } from '@/lib/supabase/server'

/* ─── types ─── */

export interface HomeWidget {
  key: string
  label: string
  order_index: number
}

export interface HomeJob {
  id: string
  title: string
  location: string | null
  xp_reward: number
  job_type: string
}

export interface HomeGig {
  id: string
  title: string
  department: string | null
  estimated_hours: number | null
  xp_reward: number | null
}

export interface HomePost {
  id: string
  content: string
  post_type: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string | null
  author_name: string | null
  author_avatar: string | null
}

export interface HomeData {
  layout: HomeWidget[]
  jobs: HomeJob[]
  gigs: HomeGig[]
  posts: HomePost[]
}

/* ─── queries ─── */

/** טעינת כל נתוני דף הבית במקביל */
export async function getHomeData(): Promise<HomeData> {
  const supabase = createClient()

  const [layoutRes, jobsRes, gigsRes, postsRes] = await Promise.all([
    supabase
      .from('app_widgets')
      .select('key, label, order_index')
      .eq('is_visible', true)
      .order('order_index', { ascending: true }),

    supabase
      .from('jobs')
      .select('id, title, location, xp_reward, job_type')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('gigs')
      .select('id, title, department, estimated_hours, xp_reward')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('posts')
      .select('id, content, post_type, image_url, likes_count, comments_count, created_at, users ( display_name, avatar_url )')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const layout: HomeWidget[] = (layoutRes.data ?? []).map((w) => ({
    key: w.key,
    label: w.label ?? w.key,
    order_index: w.order_index ?? 0,
  }))

  const jobs: HomeJob[] = (jobsRes.data ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    xp_reward: j.xp_reward,
    job_type: j.job_type,
  }))

  const gigs: HomeGig[] = (gigsRes.data ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    department: g.department,
    estimated_hours: g.estimated_hours,
    xp_reward: g.xp_reward,
  }))

  const posts: HomePost[] = (postsRes.data ?? []).map((p) => {
    const users = p.users as unknown as Record<string, unknown> | null
    return {
      id: p.id,
      content: p.content,
      post_type: p.post_type,
      image_url: p.image_url,
      likes_count: p.likes_count ?? 0,
      comments_count: p.comments_count ?? 0,
      created_at: p.created_at,
      author_name: (users?.display_name as string) ?? null,
      author_avatar: (users?.avatar_url as string) ?? null,
    }
  })

  return { layout, jobs, gigs, posts }
}
