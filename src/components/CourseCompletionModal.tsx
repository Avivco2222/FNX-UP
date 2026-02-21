'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { CheckCircle, Award, Loader2 } from 'lucide-react';
// הוספנו כאן את DialogTitle ו-DialogDescription שהיו חסרים
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import confetti from 'canvas-confetti';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (courseId: string, skillId: string, xpReward: number) => void;
  course: any;
  missingSkillName: string;
}

export function CourseCompletionModal({ isOpen, onClose, onSuccess, course, missingSkillName }: CourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!course) return null;

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('submit_course_completion', {
        p_course_id: course.id,
        p_skill_id: course.skill_id,
        p_xp_reward: course.xp_reward
      });

      if (error) throw error;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        zIndex: 9999
      });

      setTimeout(() => {
        onSuccess(course.id, course.skill_id, course.xp_reward);
        onClose();
      }, 800);

    } catch (err) {
      console.error(err);
      alert('שגיאה בדיווח');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl block">
        {/* הוספנו block ל-DialogContent כדי למנוע בעיות עימוד */}

        {/* Header Image Area */}
        <div className="relative h-32 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
          {course.image_url && <img src={course.image_url} alt={course.title || "Course image"} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />}
          
          <div className="absolute bottom-4 right-4 text-white">
            <div className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md inline-block mb-1">
              סגירת פער: {missingSkillName}
            </div>
            
            {/* תיקון השגיאה: שימוש ברכיב DialogTitle עבור הכותרת */}
            <DialogTitle className="text-xl font-bold leading-tight text-white">
              {course.title}
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>ספק: {course.provider}</span>
            <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
              <Award size={14} /> +{course.xp_reward} XP
            </span>
          </div>

          {/* תיקון השגיאה: עטיפת הטקסט ב-DialogDescription */}
          <DialogDescription className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100 block">
            השלמת הקורס תקנה לך את המיומנות <strong>&ldquo;{missingSkillName}&rdquo;</strong> ותקרב אותך למשרה.
          </DialogDescription>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(c) => setConfirmed(!!c)} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="confirm" className="text-sm font-medium leading-none cursor-pointer">
                אני מצהיר/ה שסיימתי את הקורס בהצלחה
              </Label>
              <p className="text-[11px] text-slate-500">דיווח אמת הוא ערך עליון בפניקס.</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 bg-slate-50/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>ביטול</Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white gap-2 transition-all active:scale-95" 
            disabled={!confirmed || loading}
            onClick={handleComplete}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            {loading ? 'מעדכן...' : 'דווח סיום'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
