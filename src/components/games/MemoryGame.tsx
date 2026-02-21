'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function MemoryGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // הגריד של הכפתורים (3x3)
  const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const startGame = () => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    addToSequence([]);
  };

  const addToSequence = (currentSeq: number[]) => {
    const nextNum = Math.floor(Math.random() * 9);
    const newSeq = [...currentSeq, nextNum];
    setSequence(newSeq);
    setUserSequence([]);
    setIsShowingSequence(true);

    // ניגון הרצף למשתמש
    let i = 0;
    const interval = setInterval(() => {
      highlightButton(newSeq[i]);
      i++;
      if (i >= newSeq.length) {
        clearInterval(interval);
        setTimeout(() => setIsShowingSequence(false), 500);
      }
    }, 800); // מהירות הצגה
  };

  const highlightButton = (index: number) => {
    const btn = document.getElementById(`btn-${index}`);
    if (btn) {
      btn.classList.add('bg-indigo-500', 'scale-110', 'shadow-lg', 'shadow-indigo-500/50');
      setTimeout(() => {
        btn.classList.remove('bg-indigo-500', 'scale-110', 'shadow-lg', 'shadow-indigo-500/50');
      }, 400);
    }
  };

  const handleUserClick = (index: number) => {
    if (!isPlaying || isShowingSequence) return;

    highlightButton(index);
    const newUserSeq = [...userSequence, index];
    setUserSequence(newUserSeq);

    // בדיקה אם המשתמש צדק עד כה
    const currentIndex = newUserSeq.length - 1;
    if (newUserSeq[currentIndex] !== sequence[currentIndex]) {
      // טעות!
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) setHighScore(score);
      toast.error('אוי! טעות ברצף');
      return;
    }

    // אם המשתמש סיים את הרצף הנוכחי בהצלחה
    if (newUserSeq.length === sequence.length) {
      setScore(score + 1);
      toast.success('יפה מאוד! השלב הבא...');
      setTimeout(() => addToSequence(sequence), 1000);
      
      // בונוס קונפטי כל 5 שלבים
      if ((score + 1) % 5 === 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white border border-slate-200 shadow-xl">
      <div className="p-6 text-center bg-slate-50 border-b border-slate-100">
        <div className="flex justify-center mb-2">
           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Brain size={32} />
           </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Neural Focus</h2>
        <p className="text-slate-500 text-sm">חזור על הרצף כדי לשפר את הזיכרון</p>
        
        <div className="flex justify-center gap-8 mt-4">
           <div>
              <div className="text-xs text-slate-400 font-bold uppercase">ניקוד</div>
              <div className="text-2xl font-black text-indigo-600">{score}</div>
           </div>
           <div>
              <div className="text-xs text-slate-400 font-bold uppercase">שיא</div>
              <div className="text-2xl font-black text-slate-700">{highScore}</div>
           </div>
        </div>
      </div>

      <div className="p-8 bg-[#F8F9FC]">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {grid.map((i) => (
            <button
              key={i}
              id={`btn-${i}`}
              type="button"
              onClick={() => handleUserClick(i)}
              disabled={!isPlaying || isShowingSequence}
              className={`
                aspect-square rounded-2xl transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                ${!isPlaying && !gameOver ? 'bg-slate-200 border-slate-300 cursor-not-allowed' : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'}
              `}
            ></button>
          ))}
        </div>

        {!isPlaying && (
          <div className="text-center">
             {gameOver && (
                <div className="mb-4 text-red-500 font-bold animate-pulse">
                   המשחק נגמר! הגעת לשלב {score}
                </div>
             )}
             <Button 
               size="lg" 
               className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
               onClick={startGame}
             >
               {gameOver ? <><RotateCcw className="mr-2"/> נסה שוב</> : <><Play className="mr-2"/> התחל אימון</>}
             </Button>
          </div>
        )}
        
        {isPlaying && isShowingSequence && (
           <div className="text-center text-sm text-indigo-500 font-bold animate-pulse">
              צפה ברצף... 👀
           </div>
        )}
        {isPlaying && !isShowingSequence && (
           <div className="text-center text-sm text-green-600 font-bold">
              תורך! 🫵
           </div>
        )}
      </div>
    </Card>
  );
}
