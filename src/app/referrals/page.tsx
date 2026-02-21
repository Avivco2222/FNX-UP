'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Users, Gift, Copy, Sparkles, Trophy, ArrowUpRight, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<string, { label: string; color: string; progress: number }> = {
  new: { label: 'התקבל קו"ח', color: 'bg-slate-500', progress: 10 },
  reviewing: { label: 'בסינון', color: 'bg-blue-500', progress: 30 },
  interview: { label: 'ראיונות', color: 'bg-orange-500', progress: 60 },
  offer: { label: 'הצעת שכר', color: 'bg-purple-500', progress: 85 },
  hired: { label: 'התקבל! 🎉', color: 'bg-green-500', progress: 100 },
  rejected: { label: 'לא נמצאה התאמה', color: 'bg-red-200', progress: 100 },
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [potentialCoins, setPotentialCoins] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('referrals')
        .select('*, jobs(title)')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setReferrals(data);
        
        // לוגיקה מעודכנת: הכל מטבעות
        const activeRefs = data.filter(r => r.status !== 'rejected' && r.status !== 'hired');
        setPotentialCoins(activeRefs.length * 5000);

        const hiredRefs = data.filter(r => r.status === 'hired');
        setEarnedCoins(hiredRefs.length * 5000);
      }
    }
    loadData();
  }, [supabase]);

  const copyLink = () => {
    navigator.clipboard.writeText("https://phoenix.careers/refer/u/demo");
    alert("הלינק הועתק!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
           חבר מביא חבר <span className="text-2xl">🤝</span>
        </h1>
        <p className="text-slate-500 text-lg">
          המשימה הכי רווחית במשחק. גייס חבר וקבל בונוס ענק לארנק ה-XP שלך.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* כרטיס המטבעות שהרווחנו (ההצלחות) */}
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6 relative z-10">
             <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1 opacity-80">
               <Trophy size={18} /> סה&quot;כ הרווחת
             </div>
             <div className="text-5xl font-black tracking-tight flex items-baseline gap-1">
               {earnedCoins.toLocaleString()}
               <span className="text-lg font-bold opacity-60">XP</span>
             </div>
             <div className="text-xs font-bold mt-2 bg-white/20 px-2 py-1 rounded-full inline-flex items-center gap-1">
               <Sparkles size={10} /> זמין לשימוש בחנות
             </div>
          </CardContent>
        </Card>

        {/* כרטיס הפוטנציאל (מה שבקנה) */}
        <Card className="bg-slate-900 text-white border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6 relative z-10">
             <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-1">
               <ArrowUpRight size={18} /> פוטנציאל בדרך
             </div>
             <div className="text-5xl font-black tracking-tight text-indigo-400 flex items-baseline gap-1">
               {potentialCoins.toLocaleString()}
               <span className="text-lg font-bold opacity-60">XP</span>
             </div>
             <div className="text-xs text-slate-400 mt-2">
               מותנה בקליטת המועמדים הפעילים
             </div>
          </CardContent>
        </Card>

        {/* כרטיס הלינק */}
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col justify-center">
           <CardContent className="p-6 text-center">
             <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-700">
                <Copy size={20} />
             </div>
             <div className="text-sm font-bold text-slate-600 mb-3">הלינק האישי שלך</div>
             <div className="flex gap-2">
               <Input value="https://phoenix.careers/..." readOnly className="bg-white text-xs h-10 font-mono text-center" />
               <Button onClick={copyLink} className="bg-slate-800 hover:bg-slate-700 h-10 px-4">
                 העתק
               </Button>
             </div>
           </CardContent>
        </Card>

      </div>

      <Separator />

      {/* Referrals List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
           <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Users size={20} className="text-slate-400" /> המועמדים שלי ({referrals.length})
           </h2>
           <Button variant="ghost" size="sm" className="text-xs text-slate-500">
             צפה בתקנון המבצע
           </Button>
        </div>

        <div className="divide-y divide-slate-50">
          {referrals.map((ref) => {
            const status = statusConfig[ref.status] || statusConfig['new'];
            const isHired = ref.status === 'hired';

            return (
              <div key={ref.id} className="p-6 hover:bg-slate-50/80 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-sm ${status.color}`}>
                        {ref.candidate_name.charAt(0)}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{ref.candidate_name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{ref.jobs?.title}</span>
                          <span>•</span>
                          <span>הוגש לפני 3 ימים</span>
                        </div>
                      </div>
                   </div>

                   {/* Reward Badge */}
                   <div className="text-right">
                      {isHired ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm gap-1 hover:bg-green-200">
                          <Trophy size={14} /> +5,000 XP התקבלו!
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 bg-white gap-1">
                          <Clock size={12} /> ממתין: 5,000 XP
                        </Badge>
                      )}
                   </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-2">
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                      <span className={status.progress >= 10 ? 'text-slate-800' : ''}>התקבל</span>
                      <span className={status.progress >= 30 ? 'text-slate-800' : ''}>סינון</span>
                      <span className={status.progress >= 60 ? 'text-slate-800' : ''}>ראיון</span>
                      <span className={status.progress >= 85 ? 'text-slate-800' : ''}>הצעה</span>
                      <span className={status.progress >= 100 ? 'text-green-600' : ''}>גיוס!</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${status.color}`} 
                        style={{ width: `${status.progress}%` }}
                      ></div>
                   </div>
                </div>
              </div>
            );
          })}

          {referrals.length === 0 && (
            <div className="text-center py-16">
               <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Gift size={40} className="text-slate-300" />
               </div>
               <h3 className="font-bold text-slate-600 text-lg">הארנק שלך רעב למטבעות...</h3>
               <p className="text-slate-400 max-w-sm mx-auto mt-2">
                 זה הזמן להפנות חברים! על כל גיוס מוצלח תקבל 5,000 מטבעות לשימוש בחנות המתנות.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
