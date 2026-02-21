'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Brain, Users, Gamepad2, PenTool, CheckSquare, 
  Play, Trophy, X, Target, Lightbulb, Rocket, 
  TrendingUp, Star, ChevronLeft, Search, Filter,
  Book, Mic, MessageSquare, Flame, Loader2, Compass
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// --- DATA DEFINITIONS ---
const WORLDS = [
  { id: 'all', label: 'הכל', icon: Compass },
  { id: 'Mojo', label: 'Mojo (סימולציות)', icon: Brain },
  { id: 'Gig', label: 'גיגים (משימות)', icon: Rocket },
  { id: 'Course', label: 'קורסים', icon: Play },
  { id: 'Mentoring', label: 'מנטורינג', icon: Users },
  { id: 'Games', label: 'משחקים', icon: Gamepad2 },
];

const INITIAL_ITEMS = [
  {
    id: 'm1',
    type: 'Mojo',
    title: 'סימולציית AI: יום בחיי אנליסט',
    description: 'התנסה בניתוח דאטה בזמן אמת מול לקוח קצה.',
    xp: 1200,
    icon: Brain,
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    span: 'md:col-span-2 md:row-span-2',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['AI', 'Simulation']
  },
  {
    id: 'g1',
    type: 'Gig',
    title: 'דרוש: עזרה באנליזה - אגף גמל',
    description: 'משימה אד-הוקית של 4 שעות באגף פיננסי.',
    xp: 800,
    icon: Rocket,
    color: 'bg-emerald-500',
    span: 'md:col-span-1 md:row-span-1',
    tags: ['Hands-on', 'Internal']
  },
  {
    id: 'c1',
    type: 'Course',
    title: 'Python & Cursor: עתיד הפיתוח',
    description: 'איך לכתוב קוד פי 10 מהר יותר עם עוזר AI.',
    xp: 500,
    icon: Play,
    color: 'bg-indigo-600',
    span: 'md:col-span-1 md:row-span-1',
    isPlayable: true,
    tags: ['Tech', 'Hot']
  },
  {
    id: 'art1',
    type: 'Article',
    title: '3 טריקים ב-Power Automate',
    description: 'איך לחסוך שעתיים עבודה בשבוע בעזרת אוטומציה.',
    xp: 150,
    icon: Book,
    color: 'bg-orange-500',
    span: 'md:col-span-1 md:row-span-1',
    tags: ['Productivity', 'Read']
  },
  {
    id: 'mn1',
    type: 'Mentoring',
    title: 'ליווי אישי עם מנהל השקעות',
    description: 'פתיחת דלתות והכוונה מקצועית 1-על-1.',
    xp: 600,
    icon: Target,
    color: 'bg-amber-500',
    span: 'md:col-span-1 md:row-span-2',
    tags: ['Soft Skills', 'Expert']
  },
  {
    id: 'f1',
    type: 'Workshop',
    title: 'סדנת סטוריטלינג פרונטלית',
    description: 'ללמוד איך להעביר מסר מנצח מול קהל.',
    xp: 1000,
    icon: Users,
    color: 'bg-blue-600',
    span: 'md:col-span-2 md:row-span-1',
    tags: ['Frontal', 'Office']
  }
];

export default function InfiniteLearningMarketplace() {
  const [activeWorld, setActiveWorld] = useState('all');
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [activeCourseModal, setActiveCourseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // סינון הפריטים לפי העולם הנבחר
  const filteredItems = activeWorld === 'all' 
    ? items 
    : items.filter(item => item.type === activeWorld);

  // סימולציה של Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items, isLoading]);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newItems = [
        { id: `new-${Date.now()}-1`, type: 'Podcast', title: 'שיחה על עתיד ה-AI', xp: 200, icon: Mic, color: 'bg-purple-400', span: 'col-span-1', tags: ['Listen'] },
        { id: `new-${Date.now()}-2`, type: 'Game', title: 'אתגר אבטחת מידע', xp: 300, icon: Gamepad2, color: 'bg-red-400', span: 'col-span-1', tags: ['Play'] },
      ];
      setItems(prev => [...prev, ...newItems]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Heebo'] pb-20 selection:bg-blue-200" dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      
      {/* --- HEADER --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3">
              <Lightbulb size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">גן משחקי הלמידה</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-3 bg-slate-100 p-1 rounded-full border border-slate-200">
                <div className="px-4 py-1.5 rounded-full bg-white shadow-sm flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-sm font-black text-slate-800">2,450 XP</span>
                </div>
             </div>
             <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aviv" alt="Avatar" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-8">
        
        {/* --- STATS DASHBOARD --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'דירוג אגפי', val: '#4', icon: Trophy, color: 'text-yellow-500' },
              { label: 'מיומנויות', val: '12', icon: Star, color: 'text-blue-500' },
              { label: 'סטריק', val: '5 ימים', icon: Flame, color: 'text-orange-500' },
              { label: 'יעד למידה', val: '80%', icon: Target, color: 'text-emerald-500' },
            ].map((stat, i) => (
              <Card key={i} className="p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{stat.label}</p>
                  <p className="text-sm font-black text-slate-800">{stat.val}</p>
                </div>
              </Card>
            ))}
        </div>

        {/* --- WORLDS NAVIGATOR (The "Organized Areas") --- */}
        <div className="mb-10">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">עולמות תוכן</h3>
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input placeholder="חיפוש מהיר..." className="w-full bg-white border border-slate-200 rounded-full py-1.5 pr-9 pl-4 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
           </div>
           <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {WORLDS.map(world => {
                 const Icon = world.icon;
                 const isActive = activeWorld === world.id;
                 return (
                    <button
                      key={world.id}
                      onClick={() => setActiveWorld(world.id)}
                      className={`
                        shrink-0 px-5 py-3 rounded-2xl flex items-center gap-3 border transition-all duration-300
                        ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}
                      `}
                    >
                       <Icon size={18} />
                       <span className="font-bold text-sm">{world.label}</span>
                    </button>
                 );
              })}
           </div>
        </div>

        {/* --- THE BENTO MARKETPLACE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-6">
            <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ 
                                y: -8, 
                                scale: 1.02,
                                rotateZ: index % 2 === 0 ? 1.5 : -1.5, // אפקט ה-Tilt השובבי שאהבת
                                transition: { type: 'spring', stiffness: 400, damping: 12 }
                            }}
                            onClick={() => item.isPlayable ? setActiveCourseModal(true) : null}
                            className={`
                              ${item.span || 'col-span-1'} ${item.color || 'bg-white'} 
                              rounded-[36px] p-8 relative overflow-hidden group cursor-pointer shadow-xl flex flex-col justify-between text-white
                            `}
                        >
                            {/* Background Image Overlay */}
                            {item.image && (
                                <div className="absolute inset-0 z-0">
                                    <img src={item.image} className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" alt="bg" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-white/20 text-white backdrop-blur-md border-none font-black text-[9px] px-2.5 py-1">
                                        {item.type}
                                    </Badge>
                                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                      <Icon size={20} />
                                    </div>
                                </div>
                                <h3 className={`font-black leading-tight mb-2 ${item.span?.includes('row-span-2') ? 'text-4xl' : 'text-xl'}`}>
                                    {item.title}
                                </h3>
                                <p className="text-white/80 text-sm font-medium line-clamp-2 max-w-[220px]">
                                    {item.description}
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <Zap size={14} className="text-yellow-400" fill="currentColor" />
                                    <span className="font-black text-xs">{item.xp} XP</span>
                                </div>
                                
                                {/* כפתור חקור עולם - חזר למסך */}
                                <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-[-4px] transition-transform">
                                    חקור עולם <ChevronLeft size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>

        {/* --- LOADING INDICATOR --- */}
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           {isLoading ? (
             <>
               <Loader2 className="animate-spin text-blue-600" size={32} />
               <p className="text-slate-500 font-bold text-sm animate-pulse">מג'נרט תכנים חדשים...</p>
             </>
           ) : (
             <div className="h-1 w-12 bg-slate-200 rounded-full" />
           )}
        </div>
      </main>

      {/* --- COURSE MODAL --- */}
      <AnimatePresence>
         {activeCourseModal && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
               onClick={() => setActiveCourseModal(false)}
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                  className="w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="bg-black aspect-video relative">
                     <iframe 
                        width="100%" height="100%" 
                        src="https://www.youtube.com/embed/S7xTBa93TX8?si=e2TigN_h-RzM2ZlU&controls=1" 
                        title="Course" frameBorder="0" allowFullScreen
                        className="absolute inset-0"
                     ></iframe>
                  </div>
                  <div className="p-8 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900">Python & AI Masterclass</h2>
                        <p className="text-slate-500 font-bold mt-1 italic">"מי שלומד היום, מוביל מחר"</p>
                     </div>
                     <Button className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-700 font-black text-md shadow-lg" onClick={() => setActiveCourseModal(false)}>
                        סימון כהושלם
                     </Button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}