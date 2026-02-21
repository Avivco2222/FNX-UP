'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Search, MessageCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function MentoringPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchMentors() {
      // שאילתה מתוחכמת: שולפים משתמשים שיש להם סקילים ברמה גבוהה
      const { data } = await supabase
        .from('users')
        .select('*')
        .gte('current_level', 3) // מנטורים הם מרמה 3 ומעלה
        .limit(10);
      
      // נעשיר אותם בסקילים החזקים שלהם
      if (data) {
        const enrichedMentors = await Promise.all(data.map(async (m) => {
           const { data: skills } = await supabase
             .from('user_skills')
             .select('*, skills(name)')
             .eq('user_id', m.id)
             .gte('skill_level', 4) // רק סקילים שהם מומחים בהם
             .limit(3);
           return { ...m, expertSkills: skills || [] };
        }));
        setMentors(enrichedMentors);
      }
      setLoading(false);
    }
    fetchMentors();
  }, [supabase]);

  const handleRequest = (mentorName: string) => {
    alert(`בקשת מנטורינג נשלחה ל-${mentorName}! הם יקבלו מייל ויחזרו אליך.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">מצא את המנטור שלך 🧭</h1>
        <p className="text-slate-500 text-lg">
          רוצה להתפתח מקצועית? המומחים של הפניקס כאן בשבילך.
          <br/>חפש לפי תחום, תפקיד או שם.
        </p>
        
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-3 top-3 text-slate-400" />
          <Input placeholder="במה תרצה להתמקצע? (למשל: ניהול, Python...)" className="pr-10 h-12 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <div className="col-span-3 text-center py-10">מחפש מנטורים...</div>}
        
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-all border-slate-100 overflow-hidden group">
            <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
               <div className="absolute -bottom-8 right-6 w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                 <Avatar className="w-full h-full">
                   <AvatarImage src={mentor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.display_name}`} />
                   <AvatarFallback>{mentor.display_name?.[0]}</AvatarFallback>
                 </Avatar>
               </div>
            </div>
            <CardContent className="pt-10 pb-6 px-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <h3 className="font-bold text-lg text-slate-900">{mentor.display_name}</h3>
                   <p className="text-sm text-slate-500">{mentor.role_title}</p>
                </div>
                <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Mentor
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">יכול/ה ללמד אותך:</div>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertSkills && mentor.expertSkills.length > 0 ? (
                      mentor.expertSkills.map((s: any) => (
                        <Badge key={s.id} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                          {s.skills.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">ניהול כללי, התמצאות בארגון</span>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all" onClick={() => handleRequest(mentor.display_name)}>
                  <MessageCircle size={16} />
                  בקש מנטורינג
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
