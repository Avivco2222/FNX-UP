'use client';

import { useEffect, useState } from 'react';
import {
  getWidgets,
  updateLayout,
  getSocialFeed,
  deletePost,
  type AppWidget,
  type SocialPost,
} from '@/actions/experience';
import Image from 'next/image';
import {
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Save,
  MessageSquare,
  Trash2,
  Loader2,
  LayoutGrid,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExperienceBuilder() {
  const [widgets, setWidgets] = useState<AppWidget[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getWidgets(), getSocialFeed()])
      .then(([wData, pData]) => {
        setWidgets(wData);
        setPosts(pData);
      })
      .catch(() => toast.error('שגיאה בטעינת הנתונים'))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Widget actions ─── */

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const updated = [...widgets];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setWidgets(updated.map((w, i) => ({ ...w, order_index: i })));
  };

  const toggleVisibility = (key: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.key === key ? { ...w, is_visible: !w.is_visible } : w)),
    );
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      await updateLayout(widgets);
      toast.success('סדר העמוד נשמר בהצלחה!');
    } catch {
      toast.error('שגיאה בשמירת השינויים');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Post actions ─── */

  const handleDeletePost = async (postId: string) => {
    if (!confirm('האם למחוק את הפוסט הזה?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('הפוסט נמחק');
    } catch {
      toast.error('שגיאה במחיקת הפוסט');
    }
  };

  /* ─── Render ─── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> טוען מעצב חוויה...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ─── Section 1: Layout Orchestrator ─── */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutGrid size={22} className="text-blue-600" /> מעצב דף הבית
            </h2>
            <p className="text-gray-500 text-sm">קבע את סדר הופעת הרכיבים באפליקציה ואת הנראות שלהם</p>
          </div>
          <button
            type="button"
            onClick={saveLayout}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'שומר...' : 'שמור פריסה'}
          </button>
        </div>

        <WidgetList
          widgets={widgets}
          onMove={moveWidget}
          onToggle={toggleVisibility}
        />
      </section>

      {/* ─── Section 2: Social Feed Moderation ─── */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-purple-600" /> ניהול הפיד החברתי
          </h2>
          <p className="text-gray-500 text-sm">
            פיקוח על פוסטים ואינטראקציות של עובדים ({posts.length})
          </p>
        </div>

        <PostGrid posts={posts} onDelete={handleDeletePost} />
      </section>
    </div>
  );
}

/* ─── Widget List ─── */

function WidgetList({
  widgets,
  onMove,
  onToggle,
}: {
  readonly widgets: readonly AppWidget[];
  readonly onMove: (index: number, direction: 'up' | 'down') => void;
  readonly onToggle: (key: string) => void;
}) {
  if (widgets.length === 0) {
    return (
      <div className="bg-white border rounded-2xl text-center py-12 text-slate-400">
        <LayoutGrid size={32} className="mx-auto mb-3 text-slate-300" />
        <p className="font-bold text-slate-600">אין ווידג&apos;טים מוגדרים</p>
        <p className="text-sm">הוסף ווידג&apos;טים דרך מסד הנתונים</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      {widgets.map((widget, index) => (
        <div
          key={widget.key}
          className={`flex items-center justify-between p-4 border-b last:border-0 transition ${
            widget.is_visible ? 'hover:bg-gray-50' : 'bg-gray-50/50 opacity-60'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Reorder controls */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
                className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition"
              >
                <MoveUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 'down')}
                disabled={index === widgets.length - 1}
                className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition"
              >
                <MoveDown size={16} />
              </button>
            </div>

            {/* Widget info */}
            <div>
              <p className="font-bold text-gray-900">{widget.label}</p>
              <p className="text-[10px] text-gray-400 font-mono">ID: {widget.key}</p>
            </div>
          </div>

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => onToggle(widget.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              widget.is_visible
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {widget.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
            {widget.is_visible ? 'מוצג' : 'מוסתר'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Post Grid ─── */

function PostGrid({
  posts,
  onDelete,
}: {
  readonly posts: readonly SocialPost[];
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={onDelete} />
      ))}
    </div>
  );
}

/* ─── Single Post Card ─── */

function PostCard({
  post,
  onDelete,
}: {
  readonly post: SocialPost;
  readonly onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm space-y-3 hover:shadow-md transition">
      {/* Author row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold relative overflow-hidden shrink-0">
            {post.author_avatar ? (
              <Image src={post.author_avatar} alt="" fill className="object-cover" />
            ) : (
              post.author_name?.charAt(0) ?? '?'
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{post.author_name ?? 'משתמש'}</p>
            <p className="text-[10px] text-gray-400">
              {post.created_at ? new Date(post.created_at).toLocaleString('he-IL') : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(post.id)}
          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition"
          title="מחק פוסט"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="h-32 bg-gray-100 rounded-lg overflow-hidden relative">
          <Image src={post.image_url} alt="Post" fill className="object-cover" />
        </div>
      )}

      {/* Stats footer */}
      <div className="flex items-center gap-4 pt-2 border-t text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Heart size={12} /> {post.likes_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={12} /> {post.comments_count}
        </span>
        <span className="mr-auto text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium">
          {post.post_type}
        </span>
      </div>
    </div>
  );
}
