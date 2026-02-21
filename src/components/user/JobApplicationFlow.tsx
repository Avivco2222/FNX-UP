'use client';

import { useState } from 'react';
import { applyForJob } from '@/actions/apply';
import {
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ChevronLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export interface FlowJob {
  readonly id: string;
  readonly title: string;
  readonly xp_reward: number;
  readonly required_skills?: readonly string[];
}

interface JobApplicationFlowProps {
  readonly job: FlowJob;
  readonly onClose: () => void;
}

const DEMO_USER = {
  display_name: 'עובד לדוגמה',
  role_title: 'מפתח Full Stack',
  department: 'הנדסה',
};

export default function JobApplicationFlow({ job, onClose }: JobApplicationFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await applyForJob(job.id, job.title, job.xp_reward);

      if (result.alreadyApplied) {
        toast.info('כבר הגשת מועמדות למשרה זו');
        onClose();
        return;
      }

      setEarnedXp(result.reward);
      setStep(4);
      toast.success('המועמדות נשלחה בהצלחה!');
    } catch {
      toast.error('משהו השתבש בהגשה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      {/* Backdrop close (only on steps 1-3) */}
      {step < 4 && (
        <div className="absolute inset-0" aria-hidden="true">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-full cursor-default"
            tabIndex={-1}
            aria-label="סגור"
          />
        </div>
      )}

      <div className="bg-white w-full max-w-lg rounded-t-[40px] min-h-[70vh] p-8 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        {step < 4 && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={18} />
          </button>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= i ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Personal Confirmation */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              בדיקת פרטים לפני יציאה לדרך
            </h2>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-4 border-b border-blue-200 pb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {DEMO_USER.display_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-blue-900">{DEMO_USER.display_name}</p>
                  <p className="text-sm text-blue-700">
                    {DEMO_USER.role_title} | {DEMO_USER.department}
                  </p>
                </div>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                הפרטים שלך ימשכו אוטומטית ממערכת ה-HR. וודא שהכל מעודכן כדי להגדיל
                את סיכויי הקבלה ל<strong>{job.title}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
            >
              הכל תקין, המשך <ChevronLeft size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Skills & Manager Notification */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-gray-900">שקיפות ומיומנויות</h2>
            <div className="space-y-4">
              <div className="p-4 border-2 border-blue-100 rounded-2xl bg-white flex items-start gap-3">
                <UserCheck className="text-blue-600 shrink-0 mt-0.5" size={22} />
                <div>
                  <p className="font-bold text-gray-900">דיווח למנהל ישיר</p>
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    &quot;אני מבין כי הגשת מועמדות לניוד פנימי תדווח למנהל הישיר שלי
                    כחלק מתרבות השקיפות בפניקס.&quot;
                  </p>
                </div>
              </div>

              {job.required_skills && job.required_skills.length > 0 && (
                <div className="p-4 border border-gray-100 rounded-2xl space-y-3">
                  <p className="font-bold text-sm">התאמת מיומנויות (AI check):</p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-5 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition"
              >
                חזור
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                אני מאשר, המשך <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payout Preview & Final Submit */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-gray-900">רגע לפני השליחה...</h2>
            <div className="bg-orange-50 p-8 rounded-[32px] border-2 border-orange-100 text-center relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 text-orange-300 opacity-50" size={24} />
              <p className="text-orange-700 font-bold mb-2">בונוס הגשה מיידי</p>
              <div className="text-5xl font-black text-orange-600 mb-2">
                +{job.xp_reward || 50}{' '}
                <span className="text-2xl italic">XP</span>
              </div>
              <p className="text-xs text-orange-500">
                הניקוד יתווסף לפרופיל המוג&apos;ו שלך ברגע הלחיצה
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-5 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition"
              >
                חזור
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-[2] bg-gray-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  'שולח מועמדות...'
                ) : (
                  <>
                    <Send size={18} /> שלח מועמדות וקבל XP
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900">יצאנו לדרך!</h2>
              <p className="text-gray-500 px-8">
                המועמדות שלך למשרת <strong>{job.title}</strong> התקבלה. המנהל הישיר
                וצוות הגיוס קיבלו עדכון.
              </p>
            </div>
            {earnedXp > 0 && (
              <div className="bg-green-50 py-3 px-6 rounded-full inline-flex items-center gap-2 text-green-700 font-bold border border-green-100">
                <CheckCircle2 size={18} /> +{earnedXp} XP התווסף בהצלחה
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition"
            >
              מעולה, תודה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
