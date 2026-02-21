'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, Loader2, FileText, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ManualSubmitProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export function ManualSubmitModal({ isOpen, onClose, jobId, jobTitle }: ManualSubmitProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('חובה לצרף קובץ קו"ח');
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const candidateName = formData.get('fullName') as string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 1. העלאת הקובץ ל-Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // קבלת ה-URL הציבורי של הקובץ
      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(fileName);

      // 2. יצירת הרשומה בטבלת referrals
      const { error: dbError } = await supabase.from('referrals').insert({
        referrer_id: user.id,
        job_id: jobId,
        candidate_name: candidateName,
        candidate_email: formData.get('email'),
        candidate_phone: formData.get('phone'),
        cv_url: publicUrl,
        status: 'new', // מתחיל תהליך מיון
        bonus_amount: 2000 // (בפועל יחושב ע"י ה-Trigger שבנינו קודם)
      });

      if (dbError) throw dbError;

      // 3. הצלחה!
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert('המועמדות הוגשה בהצלחה! 🎉');
      onClose();

    } catch (error) {
      console.error(error);
      alert('אירעה שגיאה בהגשה. נסה שוב.');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>הגשת מועמד ידנית</DialogTitle>
          <DialogDescription>
            מעולה! העלה את פרטי המועמד למשרת <span className="font-bold text-slate-900">{jobTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">שם מלא</Label>
            <Input id="fullName" name="fullName" required placeholder="ישראל ישראלי" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required placeholder="israel@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" name="phone" type="tel" required placeholder="050-..." />
            </div>
          </div>

          {/* אזור העלאת קובץ מעוצב */}
          <div className="space-y-2">
            <Label>קורות חיים (PDF/Word)</Label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                ${file ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:bg-slate-50 hover:border-orange-200'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <FileText size={24} />
                  <div className="text-sm font-bold truncate max-w-[200px]">{file.name}</div>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-200 rounded-full" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">לחץ לבחירת קובץ</p>
                  <p className="text-[10px] opacity-70">מקסימום 5MB</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>ביטול</Button>
            <Button type="submit" className="bg-slate-900 text-white gap-2" disabled={loading || !file}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              הגש מועמדות
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
