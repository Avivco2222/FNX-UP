'use client';

import { useEffect, useState } from 'react';
import {
  getCourses,
  getAdminPosts,
  getRewardQuests,
  deleteCourse,
  updateCourse,
  deleteAdminPost,
  updateRewardQuest,
  type AdminCourse,
  type AdminPost,
  type RewardQuest,
} from '@/actions/content';
import AddCourseModal from '@/components/admin/AddCourseModal';
import Image from 'next/image';
import {
  GraduationCap,
  MessageSquare,
  Coins,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Clock,
  Heart,
  MessageCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'content' | 'social' | 'rewards';

export default function MasterHubPage() {
  const [tab, setTab] = useState<Tab>('content');
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [quests, setQuests] = useState<RewardQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([getCourses(), getAdminPosts(), getRewardQuests()])
      .then(([cData, pData, qData]) => {
        setCourses(cData);
        setPosts(pData);
        setQuests(qData);
      })
      .catch(() => toast.error('שגיאה בטעינת הנתונים'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('האם למחוק את הקורס?')) return;
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success('הקורס נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('האם למחוק את הפוסט?')) return;
    try {
      await deleteAdminPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('הפוסט נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> טוען מרכז תוכן...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">מרכז תוכן וכלכלה (Hub)</h1>
        <p className="text-gray-500 font-medium">שליטה בתוכן, תגמולים ותכני עובדים</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border w-fit">
        <TabButton active={tab === 'content'} onClick={() => setTab('content')} label="ניהול קורסים" icon={<GraduationCap size={18} />} />
        <TabButton active={tab === 'social'} onClick={() => setTab('social')} label="פיד חברתי" icon={<MessageSquare size={18} />} />
        <TabButton active={tab === 'rewards'} onClick={() => setTab('rewards')} label="הגדרות תגמול" icon={<Coins size={18} />} />
      </div>

      {/* Tab Content */}
      {tab === 'content' && (
        <CoursesManager
          courses={courses}
          onDelete={handleDeleteCourse}
          onAdd={() => setIsModalOpen(true)}
        />
      )}

      {tab === 'social' && (
        <PostsTable posts={posts} onDelete={handleDeletePost} />
      )}

      {tab === 'rewards' && (
        <RewardSettings quests={quests} setQuests={setQuests} />
      )}

      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Tab Button
   ═══════════════════════════════════════════════ */

function TabButton({
  active, onClick, label, icon,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly label: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all text-sm ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Courses Manager (inline edit)
   ═══════════════════════════════════════════════ */

function CoursesManager({
  courses, onDelete, onAdd,
}: {
  readonly courses: readonly AdminCourse[];
  readonly onDelete: (id: string) => void;
  readonly onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Add button */}
      <button
        type="button"
        onClick={onAdd}
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50 transition group"
      >
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
          <Plus size={20} />
        </div>
        <span className="font-bold text-gray-700">הוסף קורס או פלייליסט חדש</span>
      </button>

      {/* Course rows */}
      {courses.map((course) => (
        <CourseRow key={course.id} course={course} onDelete={onDelete} />
      ))}
    </div>
  );
}

function CourseRow({
  course, onDelete,
}: {
  readonly course: AdminCourse;
  readonly onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [provider, setProvider] = useState(course.provider);
  const [xpReward, setXpReward] = useState(course.xp_reward ?? 0);
  const [saving, setSaving] = useState(false);

  const isDirty = title !== course.title || provider !== course.provider || xpReward !== (course.xp_reward ?? 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCourse(course.id, { title, provider, xp_reward: xpReward });
      toast.success('הקורס עודכן');
    } catch {
      toast.error('שגיאה בעדכון');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
      {/* Image */}
      <div className="w-full md:w-44 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
        {course.image_url ? (
          <Image src={course.image_url} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Layers size={32} />
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor={`title-${course.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">שם הקורס</label>
            <input
              id={`title-${course.id}`}
              type="text"
              className="w-full font-bold text-base border-b border-transparent focus:border-blue-600 outline-none pb-1 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="w-40">
            <label htmlFor={`provider-${course.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ספק</label>
            <input
              id={`provider-${course.id}`}
              type="text"
              className="w-full text-sm border-b border-transparent focus:border-blue-600 outline-none pb-1 transition text-blue-600 font-bold"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
            <label htmlFor={`xp-${course.id}`} className="block text-[10px] text-orange-600 font-bold uppercase">XP</label>
            <input
              id={`xp-${course.id}`}
              type="number"
              min={0}
              className="bg-transparent font-black w-16 outline-none text-orange-700"
              value={xpReward}
              onChange={(e) => setXpReward(Number.parseInt(e.target.value) || 0)}
            />
          </div>
          {course.duration_hours && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} /> {course.duration_hours} שעות
            </div>
          )}
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition p-1"
              title="פתח קורס"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 justify-center shrink-0">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`p-3 rounded-xl transition shadow-sm ${
            isDirty
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          title="שמור שינויים"
        >
          <Save size={18} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(course.id)}
          className="bg-gray-50 text-red-400 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition"
          title="מחק קורס"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Posts Table
   ═══════════════════════════════════════════════ */

function PostsTable({
  posts, onDelete,
}: {
  readonly posts: readonly AdminPost[];
  readonly onDelete: (id: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="bg-white border rounded-2xl text-center py-12 text-slate-400">
        <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
        <p className="font-bold text-slate-600">אין פוסטים בפיד</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-right text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-bold text-gray-700">עובד</th>
            <th className="px-6 py-4 font-bold text-gray-700">תוכן הפוסט</th>
            <th className="px-6 py-4 font-bold text-gray-700 text-center">אינטראקציות</th>
            <th className="px-6 py-4 font-bold text-gray-700 text-center">תאריך</th>
            <th className="px-6 py-4 font-bold text-gray-700 text-center">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold text-blue-600">{post.author_name ?? 'משתמש'}</td>
              <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{post.content}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-0.5"><Heart size={12} /> {post.likes_count}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle size={12} /> {post.comments_count}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-gray-500 text-xs">
                {post.created_at ? new Date(post.created_at).toLocaleDateString('he-IL') : '—'}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <button type="button" className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 p-1.5 rounded transition" title="סמן כבעייתי">
                    <ShieldAlert size={16} />
                  </button>
                  <button type="button" onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition" title="מחק פוסט">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Reward Settings (quests-based)
   ═══════════════════════════════════════════════ */

function RewardSettings({
  quests, setQuests,
}: {
  readonly quests: RewardQuest[];
  readonly setQuests: (q: RewardQuest[]) => void;
}) {
  const [savingId, setSavingId] = useState<string | null>(null);

  const updateLocal = (id: string, field: keyof RewardQuest, value: number | boolean) => {
    setQuests(quests.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const handleSaveRow = async (quest: RewardQuest) => {
    setSavingId(quest.id);
    try {
      await updateRewardQuest(quest.id, {
        xp_reward: quest.xp_reward ?? 0,
        coin_reward: quest.coin_reward ?? 0,
        is_active: quest.is_active ?? true,
      });
      toast.success(`"${quest.title}" עודכן בהצלחה`);
    } catch {
      toast.error('שגיאה בשמירה');
    } finally {
      setSavingId(null);
    }
  };

  if (quests.length === 0) {
    return (
      <div className="bg-white border rounded-2xl text-center py-12 text-slate-400">
        <Coins size={32} className="mx-auto mb-3 text-slate-300" />
        <p className="font-bold text-slate-600">אין הגדרות תגמול (Quests)</p>
        <p className="text-sm">הוסף רשומות לטבלת quests ב-Supabase</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-[24px] overflow-hidden shadow-sm">
      <table className="w-full text-right">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest">פעילות</th>
            <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest">XP</th>
            <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest">Coins</th>
            <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">פעיל</th>
            <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">שמירה</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quests.map((q) => (
            <tr key={q.id} className="hover:bg-gray-50 transition">
              <td className="px-8 py-5">
                <p className="font-bold text-gray-900">{q.title}</p>
                {q.description && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{q.description}</p>}
                {q.quest_type && <p className="text-[10px] text-gray-400 font-mono uppercase">{q.quest_type}</p>}
              </td>
              <td className="px-8 py-5">
                <input
                  type="number"
                  min={0}
                  className="w-20 p-2 bg-orange-50 text-orange-700 font-black rounded-lg border border-orange-100 focus:ring-2 ring-orange-200 outline-none transition"
                  value={q.xp_reward ?? 0}
                  onChange={(e) => updateLocal(q.id, 'xp_reward', Number.parseInt(e.target.value) || 0)}
                />
              </td>
              <td className="px-8 py-5">
                <input
                  type="number"
                  min={0}
                  className="w-20 p-2 bg-emerald-50 text-emerald-700 font-black rounded-lg border border-emerald-100 focus:ring-2 ring-emerald-200 outline-none transition"
                  value={q.coin_reward ?? 0}
                  onChange={(e) => updateLocal(q.id, 'coin_reward', Number.parseInt(e.target.value) || 0)}
                />
              </td>
              <td className="px-8 py-5 text-center">
                <button
                  type="button"
                  onClick={() => updateLocal(q.id, 'is_active', !(q.is_active ?? true))}
                  className={`w-12 h-6 rounded-full relative transition ${q.is_active ? 'bg-blue-600' : 'bg-gray-200'}`}
                  aria-label={q.is_active ? 'פעיל' : 'לא פעיל'}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${q.is_active ? 'right-1' : 'left-1'}`} />
                </button>
              </td>
              <td className="px-8 py-5 text-center">
                <button
                  type="button"
                  onClick={() => handleSaveRow(q)}
                  disabled={savingId === q.id}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {savingId === q.id ? '...' : 'שמור'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
