'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useSearchParams } from 'next/navigation';
import { Building2, MapPin, CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicJobPage() {
  const params = useParams();
  const searchParams = useSearchParams(); 
  const referrerId = searchParams.get('ref');

  const [job, setJob] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchJob() {
      const { data } = await supabase
        .from('jobs')
        .select('*, org_units(name)')
        .eq('id', params.jobId)
        .single();
      setJob(data);
    }
    fetchJob();
  }, [params.jobId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const { error } = await supabase.from('referrals').insert({
      job_id: job.id,
      referrer_id: referrerId,
      candidate_name: formData.get('fullName'),
      candidate_email: formData.get('email'),
      candidate_phone: formData.get('phone'),
      status: 'new',
      cv_url: 'demo_cv.pdf'
    });

    if (!error) setSubmitted(true);
  };

  if (!job) return <div className="p-20 text-center">טוען משרה...</div>;
  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">הפרטים התקבלו!</h2>
        <p className="text-slate-500">תודה שהגשת מועמדות לפניקס. ניצור קשר בהקדם.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - מיתוג מעסיק */}
      <div className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
            מגייסים ב-{job.org_units?.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{job.title}</h1>
          <div className="flex justify-center gap-6 text-slate-300">
            <span className="flex items-center gap-2"><MapPin size={18}/> {job.location}</span>
            <span className="flex items-center gap-2"><Building2 size={18}/> משרה מלאה</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Job Description */}
        <div className="md:col-span-2 prose prose-slate">
          <h3>תיאור התפקיד</h3>
          <p className="whitespace-pre-line">{job.description}</p>
          
          <h3>למה כדאי לעבוד בפניקס?</h3>
          <ul>
             <li>🚀 אפשרויות קידום ומוביליות פנימית</li>
             <li>🎓 תקציב למידה אישי לכל עובד</li>
             <li>🧘 גמישות ועבודה היברידית</li>
          </ul>
        </div>

        {/* Application Form */}
        <div className="relative">
          <Card className="sticky top-8 shadow-xl border-orange-100 overflow-hidden">
            <div className="h-2 bg-orange-500 w-full"></div>
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-4">הגש מועמדות עכשיו</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="fullName" placeholder="שם מלא" required />
                <Input name="email" type="email" placeholder="אימייל" required />
                <Input name="phone" type="tel" placeholder="טלפון" required />
                
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                  <Upload className="mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">העלה קורות חיים (PDF)</span>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold py-6">
                  שלח מועמדות 🚀
                </Button>
                <p className="text-xs text-center text-slate-400">
                  בלחיצה אני מסכים למדיניות הפרטיות של הפניקס
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
