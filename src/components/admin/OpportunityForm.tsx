'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, Target, Coins, Tag, Mail, Flame, X, Briefcase, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveOpportunity, getSkillsList, type OpportunityFormData } from '@/actions/opportunity-form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface OpportunityFormProps {
  readonly initialData?: Partial<OpportunityFormData>
  readonly type?: 'job' | 'gig'
  readonly onSuccess?: () => void
}

export default function OpportunityForm({ initialData, type = 'job', onSuccess }: OpportunityFormProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    department: '',
    recruiter_email: '',
    is_hot: false,
    internal_xp: 50,
    referral_coins: 20,
    tags: [],
    skills: [],
    ...initialData,
  });

  useEffect(() => {
    getSkillsList().then(setAvailableSkills);
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('יש להזין כותרת למשרה');
      return;
    }
    setSaving(true);
    try {
      await saveOpportunity(formData, type);
      toast.success('ההזדמנות עודכנה בהצלחה במערכת');
      onSuccess?.();
    } catch {
      toast.error('שגיאה בשמירה - בדוק חיבור ל-DB');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tagToRemove) });
  };

  return (
    <div className="bg-white h-full flex flex-col" dir="rtl">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
        {(['general', 'rewards', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-black transition-all rounded-xl ${
              activeTab === tab 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'general' && 'פרטי משרה'}
            {tab === 'rewards' && 'תגמולים'}
            {tab === 'skills' && 'מיומנויות'}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* TAB: General (Netflix Content Style) */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg text-white">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="font-bold text-orange-900 text-sm">משרה חמה (Urgent)</p>
                  <p className="text-xs text-orange-700">הדגשה בפיד המרכזי עם אייקון להבה</p>
                </div>
              </div>
              <Switch 
                checked={formData.is_hot} 
                onCheckedChange={(val) => setFormData({...formData, is_hot: val})}
              />
            </div>

            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1">כותרת המשרה</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="למשל: Senior Fullstack Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase mr-1">מחלקה / אתר</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="R&D, Tel Aviv"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase mr-1 flex items-center gap-1">
                    <Mail size={12} /> מייל מגייסת
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="hr@fnx.co.il"
                    value={formData.recruiter_email}
                    onChange={(e) => setFormData({ ...formData, recruiter_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1 flex items-center gap-1">
                  <Tag size={12} /> טאגים שיווקיים (Netflix Style)
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 pr-1 py-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="mr-1 hover:text-red-500"><X size={12} /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="הוסף טאג (למשל: עבודה היברידית, ללא קהל...)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} type="button" variant="outline" className="rounded-xl">הוסף</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Rewards (Split Economy) */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="p-5 bg-purple-50 rounded-[24px] border border-purple-100 relative overflow-hidden">
               <Zap className="absolute -right-4 -bottom-4 text-purple-200 size-24 opacity-20 rotate-12" />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-purple-700">
                    <Target size={20} />
                    <span className="font-black">תגמול ניוד פנימי (Internal XP)</span>
                  </div>
                  <input
                    type="number"
                    className="w-full p-4 bg-white border-none rounded-2xl shadow-inner text-2xl font-black text-purple-600 focus:ring-2 focus:ring-purple-500"
                    value={formData.internal_xp}
                    onChange={(e) => setFormData({ ...formData, internal_xp: Number(e.target.value) })}
                  />
                  <p className="text-xs text-purple-500 mt-3 font-medium">כמות הניסיון שהעובד יצבור עבור הגשת מועמדות/קבלה</p>
               </div>
            </div>

            <div className="p-5 bg-yellow-50 rounded-[24px] border border-yellow-100 relative overflow-hidden">
               <Coins className="absolute -right-4 -bottom-4 text-yellow-200 size-24 opacity-20 -rotate-12" />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-yellow-700">
                    <Coins size={20} />
                    <span className="font-black">בונוס &quot;חבר מביא חבר&quot; (FNX Coins)</span>
                  </div>
                  <input
                    type="number"
                    className="w-full p-4 bg-white border-none rounded-2xl shadow-inner text-2xl font-black text-yellow-600 focus:ring-2 focus:ring-yellow-500"
                    value={formData.referral_coins}
                    onChange={(e) => setFormData({ ...formData, referral_coins: Number(e.target.value) })}
                  />
                  <p className="text-xs text-yellow-500 mt-3 font-medium">בונוס במטבעות שיוענק לממליץ במקרה של גיוס מוצלח</p>
               </div>
            </div>
          </div>
        )}

        {/* TAB: Skills (Real Taxonomy) */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
               <Sparkles className="text-blue-400 animate-pulse" />
               <p className="text-xs font-bold leading-tight">בחר את המיומנויות הנדרשות. ה-AI ישתמש בזה לחישוב אחוזי התאמה עבור העובדים.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => {
                    const exists = formData.skills.includes(skill.id);
                    setFormData({
                      ...formData,
                      skills: exists ? formData.skills.filter((s:any) => s !== skill.id) : [...formData.skills, skill.id]
                    });
                  }}
                  className={`p-3 text-right text-xs font-bold rounded-xl border transition-all ${
                    formData.skills.includes(skill.id)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-slate-50/80 backdrop-blur-sm flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400">
           <Briefcase size={16} />
           <span className="text-xs font-bold uppercase tracking-wider">משרת {type === 'job' ? 'קבע' : 'גיג'}</span>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-blue-600 text-white font-black shadow-xl px-10 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          {saving ? 'מעדכן DB...' : 'פרסם משרה עכשיו'}
          <Save size={18} className="mr-2" />
        </Button>
      </div>
    </div>
  );
}