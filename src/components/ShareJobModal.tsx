'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Linkedin, Facebook, MessageCircle, Mail } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export function ShareJobModal({ isOpen, onClose, jobId, jobTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // יצירת הלינק הייחודי ברגע שהמודל נפתח
  useEffect(() => {
    async function generateLink() {
      if (!isOpen) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const uniqueLink = `${window.location.origin}/careers/${jobId}?ref=${user.id}`;
        setLink(uniqueLink);
      }
    }
    generateLink();
  }, [isOpen, jobId, supabase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    const text = `היי! ראיתי משרה מעולה בפניקס שנראית בול עליך: ${jobTitle}. שווה לבדוק:`;
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('משרה מעניינת בפניקס')}&body=${encodeURIComponent(text + '\n\n' + link)}`;
        break;
    }
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>שתף את המשרה: {jobTitle}</DialogTitle>
          <DialogDescription>
            שתף את הלינק הייחודי שלך. כל מועמד שיגיע דרכו יזכה אותך בבונוס!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
          <div className="grid flex-1 gap-2">
            <Input readOnly value={link} className="bg-slate-50 font-mono text-xs" />
          </div>
          <Button size="sm" className="px-3" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-6">
          <Button variant="outline" className="flex flex-col h-20 gap-2 border-green-100 hover:bg-green-50 hover:text-green-600" onClick={() => shareToSocial('whatsapp')}>
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-2 border-blue-100 hover:bg-blue-50 hover:text-blue-600" onClick={() => shareToSocial('linkedin')}>
            <Linkedin className="h-6 w-6" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-2 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => shareToSocial('facebook')}>
            <Facebook className="h-6 w-6" />
            <span className="text-xs">Facebook</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-20 gap-2 border-slate-100 hover:bg-slate-50" onClick={() => shareToSocial('email')}>
            <Mail className="h-6 w-6" />
            <span className="text-xs">Email</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
