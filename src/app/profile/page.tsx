'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Trophy, Medal, Star, 
  Briefcase, TrendingUp, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. פרופיל
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(userData);

      // 2. מיומנויות
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*, skills(name, category)')
        .eq('user_id', user.id)
        .order('skill_level', { ascending: false });
      setSkills(skillsData || []);

      // 3. באדג'ים
      const { data: xpData } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_type', 'badge');
      setHistory(xpData || []);
    }
    loadProfile();
  }, [supabase]);

  if (!profile) return <div className="p-20 text-center">טוען פרופיל...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-500 to-red-600 opacity-10"></div>
        
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
             <Avatar className="w-full h-full">
                <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`} />
                <AvatarFallback>ME</AvatarFallback>
             </Avatar>
          </div>
          <Badge className="absolute -bottom-3 right-8 bg-slate-900 text-white border-2 border-white px-3 py-1">
            LVL {profile.current_level}
          </Badge>
        </div>

        <div className="flex-1 text-center md:text-right relative z-10 pt-4">
          <h1 className="text-3xl font-extrabold text-slate-900">{profile.display_name}</h1>
          <p className="text-lg text-slate-500 mb-4">{profile.role_title} • {profile.location || 'מטה החברה'}</p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
              <Trophy className="text-orange-600" size={20} />
              <div>
                <div className="text-xs text-orange-600/70 font-bold">Total XP</div>
                <div className="font-bold text-orange-900">{profile.current_xp.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
              <Medal className="text-blue-600" size={20} />
              <div>
                <div className="text-xs text-blue-600/70 font-bold">Badges</div>
                <div className="font-bold text-blue-900">{history.filter(x => x.source_type === 'badge').length || 3}</div>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
              <Star className="text-green-600" size={20} />
              <div>
                <div className="text-xs text-green-600/70 font-bold">Skills</div>
                <div className="font-bold text-green-900">{skills.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 pt-4">
           <Button variant="outline" className="gap-2">
             <Download size={16} /> הורד סיכום הישגים (PDF)
           </Button>
           <Button className="bg-slate-900 text-white">ערוך פרופיל</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Skills Matrix */}
        <Card className="md:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-blue-500" /> מטריצת מיומנויות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.length === 0 && <div className="text-slate-500 text-center py-10 col-span-2">עדיין לא צברת מיומנויות. התחל ללמוד!</div>}
              {skills.map((skill) => (
                <div key={skill.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${skill.skill_level >= 4 ? 'bg-purple-100 text-purple-700' : 
                      skill.skill_level >= 3 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}
                  `}>
                    {skill.skill_level}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-slate-800">{skill.skills.name}</span>
                      <span className="text-xs text-slate-400 uppercase">{skill.skills.category}</span>
                    </div>
                    <Progress value={skill.skill_level * 20} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Badges */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" /> היכל התהילה
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
               {/* Mock Badges visuals */}
               {[1,2,3].map((i) => (
                 <div key={i} className="aspect-square bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-2 text-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                    <div className="text-2xl mb-1">🚀</div>
                    <div className="text-[10px] font-bold text-slate-600">Early Adopter</div>
                 </div>
               ))}
               <div className="aspect-square bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                 + עוד
               </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">פעילות אחרונה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                 <div>
                   <div className="text-sm font-bold">סיימת קורס SQL</div>
                   <div className="text-xs text-slate-400">לפני יומיים • +400 XP</div>
                 </div>
              </div>
              <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                 <div>
                   <div className="text-sm font-bold">הגשת מועמדות למשרה</div>
                   <div className="text-xs text-slate-400">לפני 3 ימים • PMO</div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
