'use client';

import Link from 'next/link';
import { 
  Store, Trophy, ChevronRight, 
  Target, Shield, Check, Compass, GraduationCap, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function CleanHomeSidebar() {
  return (
    <div className="space-y-6">
      
      {/* 0. QUICK LINKS */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/compass" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm font-bold text-slate-700 hover:text-indigo-700">
          <Compass size={16} className="text-indigo-500" /> המצפן
        </Link>
        <Link href="/learning" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm font-bold text-slate-700 hover:text-blue-700">
          <GraduationCap size={16} className="text-blue-500" /> למידה
        </Link>
        <Link href="/store" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all text-sm font-bold text-slate-700 hover:text-yellow-700">
          <Store size={16} className="text-yellow-500" /> חנות
        </Link>
        <Link href="/opportunities" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all text-sm font-bold text-slate-700 hover:text-green-700">
          <Briefcase size={16} className="text-green-500" /> הזדמנויות
        </Link>
      </div>

      {/* 1. STORE WIDGET (CLEAN) */}
      <Link href="/store">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">חנות ההטבות</h3>
                    <p className="text-xs text-slate-500 font-medium">2,730 מטבעות</p>
                  </div>
               </div>
               <div className="h-8 w-8 text-slate-400 flex items-center justify-center">
                 <ChevronRight size={16} />
               </div>
            </div>
            
            {/* Micro Teaser inside store */}
            <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
               {['☕ קפה', '🧢 כובע', '🚀 בוסט'].map((item) => (
                 <span key={item} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap shadow-sm">
                   {item}
                 </span>
               ))}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 2. SEASON PASS / QUESTS (CLEAN) */}
      <Card className="border-slate-200 shadow-sm bg-white relative overflow-hidden group">
         {/* פס קישוט עדין למעלה במקום רקע מלא */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
         
         <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Shield size={10} /> Season 1
                 </div>
                 <h3 className="font-bold text-slate-800">The Phoenix Rises</h3>
               </div>
               <div className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                 רמה 4
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs text-slate-500">
                  <span>התקדמות עונתית</span>
                  <span>450/1000 XP</span>
               </div>
               <Progress value={45} className="h-2 bg-slate-100" />
               <p className="text-[10px] text-slate-400 mt-2 text-right">
                 הפרס הבא: <span className="text-indigo-600 font-bold">תיבת אוצר 🎁</span>
               </p>
            </div>
            
            <Separator className="my-4" />

            <div className="space-y-3">
               <QuestItem title="התחברות יומית" xp={50} done />
               <QuestItem title="השלם יחידת לימוד" xp={150} />
               <QuestItem title="שלח פרגון (Kudos)" xp={100} />
            </div>
         </CardContent>
      </Card>

      {/* 3. LEADERBOARD (CLEAN) */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="p-5 pb-2 border-b border-slate-50">
           <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
             <Trophy size={16} className="text-orange-500" /> המובילים החודש
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-slate-50">
              <LeaderItem rank={1} name="דניאל כהן" role="DevOps" xp={4500} img="https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel" />
              <LeaderItem rank={2} name="מיכל לוי" role="Sales" xp={4200} img="https://api.dicebear.com/7.x/avataaars/svg?seed=Michal" />
              <LeaderItem rank={3} name="יוסי אבני" role="Product" xp={3950} img="https://api.dicebear.com/7.x/avataaars/svg?seed=Yossi" />
           </div>
           <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-orange-600 h-10 rounded-t-none">
             צפה בטבלה המלאה
           </Button>
        </CardContent>
      </Card>

      {/* 4. PROFESSIONAL AD (CLEAN) */}
      <Link href="/compass">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
             <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600">
               <Target size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 text-sm">הזירה המקצועית</h3>
               <p className="text-xs text-slate-500 mt-0.5">בחן את הידע שלך מול עמיתים</p>
             </div>
          </CardContent>
        </Card>
      </Link>

    </div>
  );
}

// --- Sub Components ---

function QuestItem({ title, xp, done }: { title: string; xp: number; done?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${done ? 'bg-green-50/50' : 'hover:bg-slate-50'}`}>
       <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center
             ${done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}
          `}>
            {done && <Check size={10} />}
          </div>
          <span className={`text-xs ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {title}
          </span>
       </div>
       <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-500 border-none">
         {xp} XP
       </Badge>
    </div>
  );
}

function LeaderItem({ rank, name, role, xp, img }: { rank: number; name: string; role: string; xp: number; img: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
       <div className="flex items-center gap-3">
          <div className={`text-xs font-bold w-4 text-center ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : 'text-orange-700'}`}>
            #{rank}
          </div>
          <Avatar className="w-8 h-8 border border-slate-100">
             <AvatarImage src={img} />
             <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div>
             <div className="text-xs font-bold text-slate-800">{name}</div>
             <div className="text-[10px] text-slate-400">{role}</div>
          </div>
       </div>
       <div className="text-xs font-bold text-slate-600">
         {xp.toLocaleString()}
       </div>
    </div>
  );
}
