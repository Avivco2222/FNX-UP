'use client';

import { Swords, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function KnowledgeArena() {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative bg-white">
      {/* קישוט עדין ברקע */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-50 rounded-br-full -ml-6 -mt-6 transition-transform group-hover:scale-110"></div>
      
      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-3">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
                <Swords size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">הזירה המקצועית</h3>
                <p className="text-[11px] text-slate-500">בחן את הידע שלך מול חברים</p>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between mt-4">
           <div className="flex -space-x-2 rtl:space-x-reverse">
              <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                ?
              </div>
           </div>
           
           <Button size="sm" variant="outline" className="text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 gap-2">
             <Zap size={14} /> הזמן קולגה
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
