'use client';

import { useState } from 'react';
import { applyForJob } from '@/actions/apply';
import { CheckCircle2, Sparkles, Send, X } from 'lucide-react';
import { toast } from 'sonner';

export interface ApplyDrawerJob {
  readonly id: string;
  readonly title: string;
  readonly xp_reward: number;
}

interface ApplyDrawerProps {
  readonly job: ApplyDrawerJob;
  readonly onClose: () => void;
}

export default function ApplyDrawer({ job, onClose }: ApplyDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      const result = await applyForJob(job.id, job.title, job.xp_reward);

      if (result.alreadyApplied) {
        toast.info('כבר הגשת מועמדות למשרה זו');
        onClose();
        return;
      }

      setEarnedXp(result.reward);
      setIsSuccess(true);
    } catch {
      toast.error('משהו השתבש בהגשה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full rounded-t-[32px] p-8 animate-in slide-in-from-bottom duration-300 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <X size={18} />
        </button>

        {!isSuccess ? (
          <ConfirmView
            job={job}
            isSubmitting={isSubmitting}
            onApply={handleApply}
            onCancel={onClose}
          />
        ) : (
          <SuccessView xpEarned={earnedXp} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

/* ─── Confirm View ─── */

function ConfirmView({
  job,
  isSubmitting,
  onApply,
  onCancel,
}: {
  readonly job: ApplyDrawerJob;
  readonly isSubmitting: boolean;
  readonly onApply: () => void;
  readonly onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">להגיש מועמדות?</h2>
        <p className="text-gray-500">
          אתה עומד להגיש מועמדות למשרת{' '}
          <span className="font-bold text-gray-800">{job.title}</span>.
        </p>
      </div>

      <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-between border border-orange-100">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-800">בונוס הגשה מיידי</p>
            <p className="text-xs text-orange-600">הניקוד יתווסף לפרופיל שלך</p>
          </div>
        </div>
        <span className="text-xl font-black text-orange-600">+{job.xp_reward} XP</span>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {isSubmitting ? 'שולח...' : (
            <>
              <Send size={18} /> בטח, שלח!
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Success View ─── */

function SuccessView({
  xpEarned,
  onClose,
}: {
  readonly xpEarned: number;
  readonly onClose: () => void;
}) {
  return (
    <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-2xl font-black text-gray-900">בהצלחה!</h2>
      <p className="text-gray-600">
        המועמדות נשלחה לרכזת הגיוס.
        <br />
        {xpEarned > 0 && (
          <>
            הרווחת <span className="font-bold text-orange-600">{xpEarned} XP</span> ברגע זה.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition"
      >
        מעולה, תודה
      </button>
    </div>
  );
}
