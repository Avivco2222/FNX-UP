'use client';

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, Copy, Check, MessageCircle, Linkedin, Mail, FileText, Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export function UnifiedReferralModal({ isOpen, onClose, jobId, jobTitle }: UnifiedModalProps) {
  // --- STATE FOR SHARE ---
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // --- STATE FOR MANUAL SUBMIT ---
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // יצירת הלינק הייחודי
  useEffect(() => {
    async function generateLink() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setShareLink(`${window.location.origin}/careers/${jobId}?ref=${user.id}`);
      }
    }
    if (isOpen) generateLink();
  }, [isOpen, jobId, supabase]);

  // --- HANDLERS ---

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const text = `משרה מעולה בפניקס: ${jobTitle}`;
    let url = '';
    switch (platform) {
      case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareLink)}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`; break;
      case 'email': url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareLink)}`; break;
    }
    window.open(url, '_blank');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('חובה לצרף קובץ');
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // 1. Upload CV
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('cvs').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(fileName);

      // 2. Insert DB
      const { error: dbError } = await supabase.from('referrals').insert({
        referrer_id: user.id,
        job_id: jobId,
        candidate_name: formData.get('fullName'),
        candidate_phone: formData.get('phone'),
        candidate_email: 'manual@upload.com',
        cv_url: publicUrl,
        status: 'new',
        bonus_amount: 2000
      });

      if (dbError) throw dbError;

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      alert('המועמדות הוגשה בהצלחה! 🎉');
      setFile(null);
      onClose();

    } catch (err) {
      console.error(err);
      alert('שגיאה בהגשה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-white">
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>חבר מביא חבר - {jobTitle}</DialogTitle>
          <DialogDescription>הרווח ₪2,000 על כל גיוס מוצלח</DialogDescription>
        </DialogHeader>

        {/* --- PART 1: MANUAL SUBMIT (TOP) --- */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-slate-900 text-white p-1.5 rounded-md"><Upload size={16}/></div>
             <h3 className="font-bold text-slate-800 text-sm">יש לי קו&quot;ח ביד (הגשה מהירה)</h3>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input name="fullName" placeholder="שם מלא של המועמד" required className="bg-white" />
              <Input name="phone" placeholder="טלפון נייד" required className="bg-white" />
            </div>
            
            <div className="flex gap-2">
               {/* File Input */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`flex-1 border border-dashed rounded-md flex items-center justify-center cursor-pointer transition-colors bg-white h-10
                   ${file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-orange-400'}
                 `}
               >
                 <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                 {file ? (
                   <span className="text-xs font-bold text-green-700 truncate max-w-[150px]">{file.name}</span>
                 ) : (
                   <span className="text-xs text-slate-400 flex items-center gap-2"><FileText size={14}/> בחר קובץ...</span>
                 )}
               </div>

               <Button type="submit" disabled={loading} className="bg-slate-900 text-white whitespace-nowrap">
                 {loading ? <Loader2 className="animate-spin" size={16} /> : 'שלח'}
               </Button>
            </div>
          </form>
        </div>

        {/* Separator with "OR" */}
        <div className="relative h-1 bg-slate-100">
           <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             או
           </div>
        </div>

        {/* --- PART 2: SHARE (BOTTOM) --- */}
        <div className="p-6">
           <div className="flex items-center gap-2 mb-4">
             <div className="bg-orange-100 text-orange-600 p-1.5 rounded-md"><Copy size={16}/></div>
             <h3 className="font-bold text-slate-800 text-sm">שתף לינק אישי</h3>
          </div>

          <div className="flex gap-2 mb-4">
            <Input readOnly value={shareLink} className="bg-slate-50 font-mono text-xs text-slate-600" />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </Button>
          </div>

          <div className="flex justify-center gap-4">
             <SocialIcon icon={MessageCircle} color="text-green-600 bg-green-50" onClick={() => handleSocialShare('whatsapp')} label="WhatsApp" />
             <SocialIcon icon={Linkedin} color="text-blue-700 bg-blue-50" onClick={() => handleSocialShare('linkedin')} label="LinkedIn" />
             <SocialIcon icon={Mail} color="text-slate-600 bg-slate-100" onClick={() => handleSocialShare('email')} label="Email" />
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

function SocialIcon({ icon: Icon, color, onClick, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onClick}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}
