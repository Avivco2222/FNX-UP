'use client';

import { useState } from 'react';
import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DailyPoll() {
  const [votedOption, setVotedOption] = useState<number | null>(null);
  
  // נתונים מדומים (בפועל יגיעו מה-DB)
  const question = "איזה פיצ'ר הכי חסר לכם במשרד?";
  const options = [
    { text: 'מכונת גלידה 🍦', votes: 45 },
    { text: 'חדר מנוחה 😴', votes: 30 },
    { text: 'עמדות עמידה 🧍', votes: 15 },
    { text: 'Happy Hour שבועי 🍻', votes: 60 }
  ];

  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0) + (votedOption !== null ? 1 : 0);

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-slate-50 bg-slate-50/50">
        <CardTitle className="text-sm flex items-center gap-2 text-slate-700 font-bold">
          <PieChart size={16} className="text-orange-500" /> 
          הדילמה היומית
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-slate-900 text-sm mb-4 leading-relaxed">
          {question}
        </h3>
        
        <div className="space-y-2">
          {options.map((opt, index) => {
            const isSelected = votedOption === index;
            const percentage = Math.round(((opt.votes + (isSelected ? 1 : 0)) / totalVotes) * 100);

            return (
              <div 
                key={index}
                onClick={() => votedOption === null && setVotedOption(index)}
                className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all duration-300
                  ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200 bg-white'}
                `}
              >
                {/* Progress Bar Background */}
                {votedOption !== null && (
                  <div 
                    className="absolute top-0 right-0 h-full bg-orange-100/50 transition-all duration-1000" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                )}

                <div className="relative p-2.5 flex justify-between items-center z-10">
                  <span className={`text-xs ${isSelected ? 'font-bold text-orange-900' : 'text-slate-600'}`}>
                    {opt.text}
                  </span>
                  
                  {votedOption !== null ? (
                    <span className="text-xs font-bold text-orange-600">{percentage}%</span>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 group-hover:border-orange-400"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400">
          <span>נסגר בעוד 4 שעות</span>
          <span>{totalVotes} הצבעות</span>
        </div>
      </CardContent>
    </Card>
  );
}
