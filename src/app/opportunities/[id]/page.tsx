'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, Clock, Users, Briefcase, ChevronRight, 
  CheckCircle2, Play, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UnifiedReferralModal } from '@/components/UnifiedReferralModal';
import { InternalApplyModal } from '@/components/InternalApplyModal';
import Link from 'next/link';

export default function JobDetailsPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null); // בפרודקשן תביא לפי params.id
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // --- MOCK DATA FOR DEMO ---
  // בפועל: תביא את המידע מה-DB לפי ה-ID
  useEffect(() => {
    // סימולציה של שליפה
    setJob({
      id: params.id,
      title: 'Senior Product Manager',
      department: 'Digital Division',
      location: 'תל אביב (מגדל עזריאלי)',
      type: 'משרה מלאה',
      description: `אנחנו מחפשים מנהל/ת מוצר מנוסה להוביל את תחום המובייל בפניקס. התפקיד כולל עבודה צמודה עם צוותי פיתוח, אפיון מסעות לקוח ובניית אסטרטגיה מוצרית.`,
      requirements: [
        '3+ שנות ניסיון בניהול מוצר (B2C)',
        'ניסיון בעבודה עם כלי אפיון (Figma/Sketch)',
        'יכולת אנליטית גבוהה (SQL - יתרון)',
        'תקשורת בין-אישית מעולה'
      ],
      bounty: 5000,
      isSurge: true,
      manager: { name: 'עומר לוי', role: 'VP Product', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omer' },
      skills: {
        match: ['Product Mgmt', 'UX/UI', 'Agile'],
        missing: ['SQL', 'Data Analysis']
      }
    });
  }, [params.id]);

  if (!job) return <div className="p-20 text-center">טוען משרה...</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/opportunities" className="hover:text-slate-900">שוק ההזדמנויות</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">{job.title}</span>
      </div>

      {/* --- HERO HEADER --- */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            
            <div className="flex gap-6">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                  <Briefcase className="text-slate-400" size={32} />
               </div>
               <div>
                 <h1 className="text-3xl font-black text-slate-900 mb-2">{job.title}</h1>
                 <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Briefcase size={14}/> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {job.type}</span>
                 </div>
               </div>
            </div>

            {/* Actions Block */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <Button size="lg" className="w-full md:w-48 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100" onClick={() => setIsApplyModalOpen(true)}>
                 הגש מועמדות
               </Button>
               <Button 
                 size="lg" 
                 variant="outline" 
                 className={`w-full md:w-48 font-bold border-2 ${job.isSurge ? 'border-orange-100 text-orange-600 hover:bg-orange-50' : ''}`}
                 onClick={() => setIsShareModalOpen(true)}
               >
                 <Share2 size={16} className="ml-2" /> 
                 שתף (₪{job.bounty})
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* --- MAIN CONTENT (LEFT) --- */}
        <div className="md:col-span-2 space-y-10">
          
          {/* תיאור משרה */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">על התפקיד</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {job.description}
            </p>
          </section>

          {/* דרישות */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">דרישות המשרה</h2>
            <ul className="space-y-3">
              {job.requirements.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* וידאו של המנהל (Manager's Pitch) */}
          <section>
             <h2 className="text-xl font-bold text-slate-900 mb-4">המנהל המגייס</h2>
             <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center gap-6 relative overflow-hidden group cursor-pointer">
                {/* רקע מטושטש */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0"></div>
                
                <div className="relative z-10 w-16 h-16 rounded-full border-2 border-white/20 p-1">
                   <Avatar className="w-full h-full">
                     <AvatarImage src={job.manager.img} />
                   </Avatar>
                </div>
                
                <div className="relative z-10 flex-1">
                   <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">המסר של {job.manager.name}</div>
                   <h3 className="font-bold text-xl">&quot;אנחנו בונים את הדבר הגדול הבא...&quot;</h3>
                </div>

                <div className="relative z-10 bg-white/10 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                   <Play size={20} fill="currentColor" />
                </div>
             </div>
          </section>

        </div>

        {/* --- SIDEBAR (RIGHT) --- */}
        <div className="space-y-6">
          
          {/* Skill Match Card */}
          <Card className="border-none shadow-lg bg-slate-50">
            <CardContent className="p-6">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <CheckCircle2 className="text-green-500" size={20}/> התאמה למשרה
               </h3>
               
               {/* Skills List */}
               <div className="space-y-3 mb-6">
                 {job.skills.match.map((s: string) => (
                   <div key={s} className="flex justify-between items-center text-sm">
                     <span className="text-slate-600">{s}</span>
                     <CheckCircle2 size={16} className="text-green-500" />
                   </div>
                 ))}
                 {job.skills.missing.map((s: string) => (
                   <div key={s} className="flex justify-between items-center text-sm">
                     <span className="text-slate-400 line-through decoration-slate-300">{s}</span>
                     <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 cursor-pointer hover:bg-blue-50">
                       השלם פער
                     </Badge>
                   </div>
                 ))}
               </div>
               
               <Separator className="mb-4" />
               <div className="text-center">
                  <span className="text-3xl font-black text-slate-900">85%</span>
                  <div className="text-xs text-slate-400">ציון התאמה משוקלל</div>
               </div>
            </CardContent>
          </Card>

          {/* Social Proof */}
          <Card className="border border-slate-100 shadow-sm">
            <CardContent className="p-6">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Users className="text-slate-400" size={20}/> החברים שלך כאן
               </h3>
               <div className="flex -space-x-2 rtl:space-x-reverse mb-3">
                  {[1,2,3].map(i => (
                    <Avatar key={i} className="border-2 border-white w-8 h-8">
                       <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                    </Avatar>
                  ))}
               </div>
               <p className="text-sm text-slate-500">
                 דני, רונית ו-3 אחרים עובדים במחלקה זו.
                 <br/>
                 <Link href="#" className="text-blue-600 font-bold hover:underline">התייעץ איתם</Link>
               </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Share Modal */}
      <UnifiedReferralModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
      />

      {/* Internal Apply Modal */}
      <InternalApplyModal 
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobTitle={job.title}
        jobId={job.id}
        managerName={job.manager.name}
      />

    </div>
  );
}
