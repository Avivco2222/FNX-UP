'use client';

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShieldCheck, MessageSquare, Send, Sparkles, 
  CheckCircle2, Copy, FileText, BrainCircuit 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface InternalApplyProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobId: string;
  managerName: string; // המגייסת
}

export function InternalApplyModal({ isOpen, onClose, jobTitle, managerName }: InternalApplyProps) {
  const [step, setStep] = useState(1); // 1=Manager Check, 2=Form, 3=Success/Tips
  const [managerInformed, setManagerInformed] = useState(false);
  const [loading, setLoading] = useState(false);

  // טקסט גנרי להודעה למנהל הישיר
  const draftMessage = `היי, רציתי לעדכן אותך בשקיפות שאני בודק/ת אפשרות לניוד פנימי לתפקיד ${jobTitle}. חשוב לי שתדע/י ממני ושנעשה את זה בצורה מסודרת. אשמח לשוחח על זה.`;

  const copyDraft = () => {
    navigator.clipboard.writeText(draftMessage);
    toast.success('ההודעה הועתקה! שלח אותה ב-Teams/WhatsApp');
  };

  const handleSubmit = async () => {
    setLoading(true);
    // סימולציה של שליחה לשרת
    setTimeout(() => {
      setLoading(false);
      setStep(3); // מעבר למסך הטיפים וההצלחה
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-50 p-0 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              🚀 הגשת מועמדות פנימית: {jobTitle}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {step === 1 ? 'שלב 1: שקיפות והוגנות' : step === 2 ? 'שלב 2: פרטים והגשה' : 'בהצלחה! המועמדות הוגשה'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Steps */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
          </div>
        </div>

        {/* --- STEP 1: MANAGER UPDATE (THE GATEKEEPER) --- */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4">
              <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">נוהל ניוד פנימי</h4>
                <p className="text-sm text-blue-700 mt-1">
                  על פי נהלי הפניקס, חובה לעדכן את המנהל הישיר לפני תחילת תהליך מיון.
                  זה מבטיח שקיפות ושמירה על יחסים טובים.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 bg-white space-y-3">
                <Label className="text-xs text-slate-500">מתלבט/ת איך לכתוב את זה? הנה טיוטה מוכנה:</Label>
                <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700 font-mono relative">
                   {draftMessage}
                   <Button size="icon" variant="ghost" className="absolute top-1 left-1 h-6 w-6" onClick={copyDraft} title="העתק טקסט">
                     <Copy size={12} />
                   </Button>
                </div>
                <div className="flex justify-end">
                   <Button variant="outline" size="sm" onClick={() => window.open(`https://teams.microsoft.com/l/chat/0/0?users=manager@phoenix.co.il&message=${encodeURIComponent(draftMessage)}`, '_blank')}>
                      <MessageSquare size={14} className="mr-2"/> פתח צ&apos;אט ב-Teams
                   </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
              <Checkbox id="terms" checked={managerInformed} onCheckedChange={(c) => setManagerInformed(!!c)} />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                אני מאשר/ת שעדכנתי את המנהל/ת הישיר/ה שלי בדבר הגשת המועמדות.
              </label>
            </div>

            <DialogFooter>
              <Button disabled={!managerInformed} onClick={() => setStep(2)} className="w-full bg-slate-900">
                המשך לשלב הבא
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* --- STEP 2: THE FORM --- */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>שם מלא</Label>
                 <Input defaultValue="ישראל ישראלי" disabled className="bg-slate-100" />
               </div>
               <div className="space-y-2">
                 <Label>מחלקה נוכחית</Label>
                 <Input defaultValue="שירות לקוחות" disabled className="bg-slate-100" />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="flex justify-between">
                 <span>למה דווקא את/ה? (Pitch)</span>
                 <span className="text-xs text-purple-600 flex items-center gap-1 cursor-pointer hover:underline">
                   <Sparkles size={12}/> עזור לי לנסח עם AI
                 </span>
               </Label>
               <Textarea placeholder="ספר/י בקצרה למה את/ה מתאימ/ה לתפקיד..." className="min-h-[100px]" />
            </div>

            <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
               <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-white p-2 rounded border border-slate-200 text-red-500">
                       <FileText size={20} />
                     </div>
                     <div>
                       <div className="text-sm font-bold">קורות חיים (קיים במערכת)</div>
                       <div className="text-xs text-slate-500">עודכן לפני: 3 חודשים</div>
                     </div>
                  </div>
                  <Button variant="outline" size="sm">החלף קובץ</Button>
               </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep(1)}>חזור</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-slate-900 text-white w-full md:w-auto">
                {loading ? 'שולח...' : <><Send size={16} className="ml-2"/> הגש מועמדות</>}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* --- STEP 3: SUCCESS & VALUE ADD --- */}
        {step === 3 && (
          <div className="p-6">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <CheckCircle2 size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900">המועמדות נשלחה בהצלחה!</h3>
               <p className="text-slate-500">המגייס/ת קיבל/ה את הפרטים. מה עושים עכשיו?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* 1. RECRUITER CONTACT */}
               <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex items-center gap-4">
                     <Avatar>
                       <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter" />
                     </Avatar>
                     <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">המגייסת שלך</div>
                        <div className="font-bold text-slate-900">{managerName}</div>
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                           <MessageSquare size={12}/> שלח הודעה ב-Teams
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* 2. AI DOJO PREP */}
               <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500 group">
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                       <BrainCircuit size={24} />
                     </div>
                     <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">התכונן לראיון</div>
                        <div className="font-bold text-slate-900">סימולציית ראיון AI</div>
                        <div className="text-xs text-purple-600 mt-1">
                           תרגל שאלות ספציפיות למשרה זו
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
            
            {/* 3. TIPS SECTION */}
            <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
               <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                 💡 טיפים לראיון פנימי
               </h4>
               <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                  <li>הכינו דוגמאות לפרויקטים מוצלחים מהתפקיד הנוכחי.</li>
                  <li>הסבירו את המוטיבציה למעבר (למה דווקא עכשיו?).</li>
                  <li>אל תשכחו להזכיר את הפידבק החיובי מהמנהל הנוכחי.</li>
               </ul>
            </div>

            {/* 4. RELATED JOBS */}
            <div className="mt-6">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">אולי יעניין אותך גם</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                 {['ראש צוות', 'מנהל מוצר'].map(job => (
                   <div key={job} className="bg-white border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-bold text-slate-700 hover:border-slate-400 cursor-pointer">
                      {job}
                   </div>
                 ))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={onClose} className="w-full">סגור ובהצלחה 🍀</Button>
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
