'use client';

import { useState } from 'react';
import { createCourse, type CreateCourseData } from '@/actions/content';
import { X, Save, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AddCourseModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

const INITIAL_FORM: CreateCourseData = {
  title: '',
  provider: '',
  url: '',
  image_url: '',
  xp_reward: 50,
  duration_hours: 0,
};

export default function AddCourseModal({ isOpen, onClose, onCreated }: AddCourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.provider.trim()) {
      toast.error('יש למלא שם קורס וספק');
      return;
    }
    setSaving(true);
    try {
      await createCourse(formData);
      toast.success('הקורס נוסף בהצלחה!');
      setFormData(INITIAL_FORM);
      onCreated();
      onClose();
    } catch {
      toast.error('שגיאה בהוספת הקורס');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof CreateCourseData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Backdrop close layer */}
      <div className="absolute inset-0" aria-hidden="true">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-full cursor-default"
          tabIndex={-1}
          aria-label="סגור"
        />
      </div>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">הוספת קורס / פלייליסט חדש</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="course-title" className="block text-sm font-bold mb-1">שם הקורס</label>
              <input
                id="course-title"
                required
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                placeholder="למשל: React Advanced Patterns"
                value={formData.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="course-provider" className="block text-sm font-bold mb-1">ספק</label>
              <input
                id="course-provider"
                required
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                placeholder="למשל: Coursera"
                value={formData.provider}
                onChange={(e) => update('provider', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="course-xp" className="block text-sm font-bold mb-1">תגמול XP</label>
              <input
                id="course-xp"
                type="number"
                min={0}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                value={formData.xp_reward}
                onChange={(e) => update('xp_reward', Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-duration" className="block text-sm font-bold mb-1">משך (שעות)</label>
            <input
              id="course-duration"
              type="number"
              min={0}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              value={formData.duration_hours}
              onChange={(e) => update('duration_hours', Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <label htmlFor="course-url" className="block text-sm font-bold mb-1 flex items-center gap-1">
              <LinkIcon size={14} /> קישור לקורס
            </label>
            <input
              id="course-url"
              type="url"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              dir="ltr"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => update('url', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="course-image" className="block text-sm font-bold mb-1 flex items-center gap-1">
              <ImageIcon size={14} /> קישור לתמונה (URL)
            </label>
            <input
              id="course-image"
              type="url"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              dir="ltr"
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => update('image_url', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'שומר...' : 'שמור ופרסם'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
