'use client';

import { useState } from 'react';
import { 
  X, Users, UserCheck, 
  FileUp, Link as LinkIcon, AlertTriangle, 
  PartyPopper, ChevronLeft, Mail, Info, Sparkles, Zap,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type FlowJob = {
  id: string;
  title: string;
  xp_reward?: number;
  coin_reward?: number;
  recruiter_email?: string;
};

interface ApplyButtonProps {
  readonly job: FlowJob;
}

export default function ApplyButton({ job }: ApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 hover:bg-indigo-600 transition-colors"
      >
        הגש מועמדות <ArrowLeft size={14} className="mr-1" />
      </Button>

      {isOpen && (
        <JobApplicationFlow job={job} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Full Application Flow (internal)
   ═══════════════════════════════════════════════ */

interface FlowProps {
  readonly job: FlowJob;
  readonly onClose: () => void;
}

function JobApplicationFlow({ job, onClose }: FlowProps) {
  const [mode, setMode] = useState<'selection' | 'internal' | 'referral'>('selection');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States לשלב 1 פנימי
  const [notifiedManager, setNotifiedManager] = useState(false);
  const [twoYearsSeniority, setTwoYearsSeniority] = useState(false);
  
  // Mock AI Score (במציאות יגיע מה-Props או מה-Context)
  const aiScore = 65; 

  const handleSendToManager = () => {
    const subject = encodeURIComponent(`עדכון: התעניינות במשרת ${job.title}`);
    const body = encodeURIComponent(`היי, רציתי לעדכן שאני שוקל להגיש מועמדות למשרת ${job.title} שפורסמה ב-FNXup.\nאשמח לשוחח על כך בהמשך.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setNotifiedManager(true);
    toast.success("טיוטת המייל נפתחה");
  };

  const finishApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
      toast.success("המועמדות נשלחה!");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h2>
            <p className="text-sm text-slate-400 font-medium">הגשת מועמדות</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          
          {/* מסך בחירה ראשוני */}
          {mode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 animate-in slide-in-from-bottom-4">
              <button 
                onClick={() => setMode('internal')}
                className="p-8 border-2 border-slate-100 rounded-[32px] text-right hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck size={24} />
                </div>
                <h3 className="font-black text-lg text-slate-900">אני מעוניין במשרה</h3>
                <p className="text-sm text-slate-500 mt-2">הגשת מועמדות פנימית וצבירת XP</p>
              </button>

              <button 
                onClick={() => setMode('referral')}
                className="p-8 border-2 border-slate-100 rounded-[32px] text-right hover:border-yellow-500 hover:bg-yellow-50/50 transition-all group"
              >
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="font-black text-lg text-slate-900">חבר מביא חבר</h3>
                <p className="text-sm text-slate-500 mt-2">המלץ על חבר וזכה ב-Coins</p>
              </button>
            </div>
          )}

          {/* מסלול חבר מביא חבר */}
          {mode === 'referral' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-[32px] p-10 text-center space-y-4">
                <FileUp size={48} className="mx-auto text-yellow-600 opacity-50" />
                <div>
                  <h4 className="font-bold text-slate-900">גרור את קורות החיים של החבר</h4>
                  <p className="text-xs text-slate-500 mt-1">המערכת תסרוק ותשייך את המועמדות אליך אוטומטית</p>
                </div>
                <Button variant="outline" className="rounded-xl border-yellow-200 text-yellow-700 bg-white">בחר קובץ</Button>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><LinkIcon size={20}/></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400">לינק אישי להפצה:</p>
                  <p className="text-xs font-mono text-slate-600 truncate">fnxup.co.il/jobs/{job.id}?ref=emp123</p>
                </div>
                <Button size="sm" className="rounded-xl px-4 font-bold">העתק</Button>
              </div>
            </div>
          )}

          {/* מסלול פנימי - שלב 1: אתיקה וותק */}
          {mode === 'internal' && step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <h3 className="text-xl font-black text-slate-900">לפני שמתחילים, בוא נוודא שקיפות</h3>
              <div className="space-y-4">
                <div className={`p-5 rounded-3xl border-2 transition-all ${notifiedManager ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" checked={notifiedManager} onChange={(e) => setNotifiedManager(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg text-blue-600" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">יידעתי את המנהל/ת הישיר/ה שלי</p>
                      <p className="text-xs text-slate-500 mt-1">הפניקס מעודדת שקיפות ופתיחות בתוך הארגון.</p>
                      {!notifiedManager && (
                        <button onClick={handleSendToManager} className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                          <Mail size={14} /> שלח עדכון למנהל מהמערכת
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-3xl border-2 transition-all ${twoYearsSeniority ? 'border-blue-200 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" checked={twoYearsSeniority} onChange={(e) => setTwoYearsSeniority(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">אני בתפקידי הנוכחי לפחות שנתיים</p>
                      <p className="text-xs text-slate-500 mt-1 italic">ניתן להגיש גם אם התשובה היא לא, אך מומלץ לוודא זאת.</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                disabled={!notifiedManager || !twoYearsSeniority} 
                onClick={() => setStep(2)}
                className="w-full py-7 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all"
              >
                המשך לשלב הבא
              </Button>
            </div>
          )}

          {/* שלב 2: פרופיל ו-AI */}
          {mode === 'internal' && step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              {aiScore < 70 && (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-3xl flex gap-4">
                  <AlertTriangle className="text-orange-500 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-black text-orange-800">שים לב - התאמה של {aiScore}%</p>
                    <p className="text-xs text-orange-700 mt-1">התאמת המיומנויות שלך למשרה נמוכה מ-70%. כדאי לשקול השלמת קורס "אקסל מתקדם" כדי לשפר את סיכוייך.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase mb-2">פרטים אישיים</p>
                  <p className="text-sm font-bold text-slate-900 truncate">עובד פניקס | אגף טכנולוגיה | מזהה: 12345</p>
                </div>
                <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center space-y-2">
                  <FileUp size={24} className="mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">צרף קורות חיים מעודכנים (אופציונלי)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-7 rounded-2xl font-bold">חזור</Button>
                <Button onClick={() => setStep(3)} className="flex-[2] py-7 rounded-2xl font-black text-lg shadow-xl">בדיקה אחרונה</Button>
              </div>
            </div>
          )}

          {/* שלב 3: סיכום */}
          {mode === 'internal' && step === 3 && (
            <div className="space-y-8 py-4 animate-in zoom-in-95">
              <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-[28px] flex items-center justify-center mx-auto mb-4">
                   <Sparkles size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">מוכן לשגר?</h3>
                 <p className="text-slate-500">בלחיצה על "שלח", המועמדות שלך תעבור למגייסת.</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-[32px] border border-purple-100 flex items-center justify-between">
                 <div>
                   <p className="text-xs font-bold text-purple-400">תגמול על הגשה:</p>
                   <p className="text-xl font-black text-purple-700">+{job.xp_reward || 50} XP</p>
                 </div>
                 <Zap className="text-purple-400 fill-purple-400" size={32} />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} className="flex-1 py-7 rounded-2xl font-bold text-red-500 hover:bg-red-50">ביטול</Button>
                <Button 
                  onClick={finishApplication}
                  disabled={isSubmitting}
                  className="flex-[3] py-7 rounded-2xl font-black text-lg bg-slate-900 shadow-2xl hover:bg-blue-600"
                >
                  {isSubmitting ? "שולח..." : "שלח מועמדות!"}
                </Button>
              </div>
            </div>
          )}

          {/* שלב 4: הצלחה (קונפטי) */}
          {step === 4 && (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-90 duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <PartyPopper size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900">יצאנו לדרך!</h3>
                <p className="text-slate-500 px-8">המועמדות נשלחה בהצלחה. המנהל המגייס יחזור אליך בקרוב.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-[32px] mt-8 text-right">
                <p className="text-xs font-black text-slate-400 mb-4 flex items-center gap-1">
                  <Info size={14}/> אולי יעניין אותך גם:
                </p>
                <div className="space-y-2">
                   {['מנהל פרויקטים דיגיטליים', 'אנליסט נתונים בכיר'].map((jobTitle, i) => (
                     <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-blue-300 transition-colors">
                        <span className="text-sm font-bold text-slate-700">{jobTitle}</span>
                        <ChevronLeft size={16} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:-translate-x-1" />
                     </div>
                   ))}
                </div>
              </div>
              <Button onClick={onClose} className="w-full py-6 rounded-2xl font-black">סגור וחזרה ללוח</Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}