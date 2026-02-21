'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { getHomeData, type HomeData, type HomeJob, type HomeGig, type HomePost } from '@/actions/home';
import { CleanHomeSidebar } from '@/components/widgets/CleanHomeSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Coins, Zap, Flame, Briefcase, MessageSquare,
  GraduationCap, Loader2, Heart, MessageCircle,
} from 'lucide-react';

export default function HomePage() {
  const { name, role, coins, xp, level, loading: userLoading } = useUser();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 gap-6 grid grid-cols-1 lg:grid-cols-3">
      {/* ─── MAIN COLUMN (2/3) ─── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Hero Banner */}
        <HeroBanner
          name={name}
          role={role}
          coins={coins}
          xp={xp}
          level={level}
          loading={userLoading}
        />

        {/* Feed Input */}
        <FeedInput name={name} />

        {/* Dynamic Widgets */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> טוען תוכן מותאם...
          </div>
        ) : (
          <DynamicWidgets data={data} />
        )}
      </div>

      {/* ─── SIDEBAR (1/3) ─── */}
      <aside className="space-y-6">
        <CleanHomeSidebar />
      </aside>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Hero Banner
   ═══════════════════════════════════════════════ */

function HeroBanner({
  name, role, coins, xp, level, loading,
}: {
  readonly name: string;
  readonly role: string;
  readonly coins: number;
  readonly xp: number;
  readonly level: number;
  readonly loading: boolean;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">היי, {name}! 👋</h1>
          <p className="text-slate-400">{role}</p>

          <div className="flex gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
              <Coins className="text-yellow-400" size={18} />
              <span className="font-bold">{loading ? '...' : coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
              <Zap className="text-blue-400" fill="currentColor" size={18} />
              <span className="font-bold">{loading ? '...' : xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="w-16 h-16 rounded-full border-4 border-orange-500 flex items-center justify-center text-xl font-black bg-slate-800">
            {level}
          </div>
          <div className="text-[10px] font-bold text-orange-500 mt-1 text-center uppercase tracking-widest">LEVEL</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Feed Input
   ═══════════════════════════════════════════════ */

function FeedInput({ name }: { readonly name: string }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> הפיד של הפניקס
        </h3>
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Input
            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            placeholder="מה למדת היום? שתף תובנה..."
          />
          <Button className="bg-slate-900">פרסם</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   Dynamic Widgets — rendered by app_widgets order
   ═══════════════════════════════════════════════ */

const WIDGET_MAP: Record<string, (data: HomeData) => React.ReactNode> = {
  jobs_highlight: (d) => <JobsWidget items={d.jobs} />,
  gigs_highlight: (d) => <GigsWidget items={d.gigs} />,
  social_feed: (d) => <SocialWidget items={d.posts} />,
  learning_featured: () => <LearningPreview />,
};

function DynamicWidgets({ data }: { readonly data: HomeData | null }) {
  if (!data) return null;

  // If no widgets configured, show all in default order
  const widgetKeys = data.layout.length > 0
    ? data.layout.map((w) => w.key)
    : ['jobs_highlight', 'gigs_highlight', 'social_feed', 'learning_featured'];

  return (
    <div className="space-y-8">
      {widgetKeys.map((key) => {
        const renderer = WIDGET_MAP[key];
        if (!renderer) return null;
        return <div key={key}>{renderer(data)}</div>;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Widget: Jobs
   ═══════════════════════════════════════════════ */

function JobsWidget({ items }: { readonly items: readonly HomeJob[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Briefcase className="text-blue-600" size={20} /> משרות חמות עבורך
        </h3>
        <Link href="/opportunities" className="text-blue-600 text-sm font-bold hover:underline">
          הכל
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((job) => (
          <Link
            key={job.id}
            href="/opportunities"
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition block"
          >
            <div>
              <p className="font-bold text-gray-900">{job.title}</p>
              <p className="text-xs text-gray-500">{job.location ?? 'מיקום גמיש'}</p>
            </div>
            <div className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full">
              +{job.xp_reward} XP
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Widget: Gigs
   ═══════════════════════════════════════════════ */

function GigsWidget({ items }: { readonly items: readonly HomeGig[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-purple-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
      <Zap className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">פרויקטים קצרים (Gigs)</h3>
        <Link href="/opportunities" className="text-white/80 text-sm font-bold hover:text-white">
          הכל
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((gig) => (
          <div key={gig.id} className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <p className="font-bold">{gig.title}</p>
            <div className="flex justify-between mt-2 text-xs opacity-90">
              <span>{gig.estimated_hours ? `${gig.estimated_hours} שעות` : 'זמן גמיש'}</span>
              <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full font-bold">
                +{gig.xp_reward ?? 0} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Widget: Social Feed
   ═══════════════════════════════════════════════ */

function SocialWidget({ items }: { readonly items: readonly HomePost[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <MessageSquare className="text-purple-600" size={20} /> מה קורה בפניקס?
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.map((post) => (
          <div
            key={post.id}
            className="min-w-[280px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold relative overflow-hidden shrink-0">
                {post.author_avatar ? (
                  <Image src={post.author_avatar} alt="" fill className="object-cover" />
                ) : (
                  post.author_name?.charAt(0) ?? '?'
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">{post.author_name ?? 'משתמש'}</span>
                {post.created_at && (
                  <p className="text-[10px] text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
              <span className="flex items-center gap-0.5"><Heart size={10} /> {post.likes_count}</span>
              <span className="flex items-center gap-0.5"><MessageCircle size={10} /> {post.comments_count}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Widget: Learning Preview
   ═══════════════════════════════════════════════ */

function LearningPreview() {
  return (
    <Link
      href="/learning"
      className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex items-center justify-between hover:shadow-md transition block"
    >
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 p-3 rounded-xl">
          <GraduationCap className="text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800">המשך למידה</p>
          <p className="text-xs text-gray-500">התקדם בקורסים ושפר את הכישורים שלך</p>
        </div>
      </div>
      <div className="bg-gray-900 text-white p-2 rounded-lg">
        <Zap size={16} />
      </div>
    </Link>
  );
}
