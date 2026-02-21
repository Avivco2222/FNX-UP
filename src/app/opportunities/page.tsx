'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, Flame, Zap, Coins, Sparkles, 
  Users, Target, Clock, Filter, Trophy, Star, Briefcase,
  ChevronRight, ChevronLeft, MapPin, Smile, Rocket, Coffee, 
  CheckCircle2, UserCheck, Upload, ChevronRight as ChevronRightSmall,
  Mail, AlertTriangle, Link as LinkIcon, PartyPopper, BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ==========================================
// 1. DATA GENERATION
// ==========================================
const DEPARTMENTS = ['טכנולוגיה', 'שירות ומכירה', 'כספים', 'משאבי אנוש', 'משפטי', 'חדשנות'];
const TITLES = [
  'ארכיטקט סייבר', 'מנהל לקוחות VIP', 'אנליסט השקעות', 'Product Manager', 'HR Business Partner',
  'מעצב חווית לקוח', 'מפתח Fullstack', 'מנהל קמפיינים', 'מומחה AI', 'רכז גיוס'
];

const HAPPY_IMAGES = [
  'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3762804/pexels-photo-3762804.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800'
];

const ALL_JOBS = Array.from({ length: 60 }).map((_, i) => {
  const score = 60 + (i % 41);
  return {
    id: `job-${i}`,
    title: TITLES[i % TITLES.length] + (i % 5 === 0 ? ' בכיר/ה' : ''),
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    is_hot: i % 7 === 0,
    is_favorite: i % 12 === 0,
    ai_match_score: score,
    matched_skills: ['תקשורת בין-אישית', 'ניהול פרויקטים', 'הכרת הארגון'].slice(0, score > 80 ? 3 : 1),
    missing_skills: score < 75 ? ['SQL מתקדם', 'אנגלית עסקית', 'Python'] : [],
    internal_xp: 150 + (i * 5 % 200),
    referral_coins: 50 + (i * 3 % 100),
    location: i % 3 === 0 ? 'ראשון לציון' : 'גבעתיים', 
    hours: 'משרה מלאה',
    hybrid: 'היברידית',
    perks: ['כרטיס הסעדה', 'טלפון נייד', 'ביטוח בריאות', 'שאטלים מהרכבת'],
    recruiter_email: 'hr-jobs@fnx.co.il',
    description: 'אנו מחפשים איש/אשת מקצוע שייקח בעלות מלאה על תהליכי הליבה באגף. התפקיד כולל בניית אסטרטגיה, ניהול ממשקים חוצי ארגון, הובלת פרויקטים טכנולוגיים ועסקיים, והטמעת תהליכי עבודה חדשניים שישפרו את השירות ואת שורת הרווח.',
    requirements: [
      'ניסיון של 3 שנים לפחות בתחום רלוונטי', 
      'הבנה עסקית עמוקה ויכולת ניתוח נתונים', 
      'יחסי אנוש מעולים ויכולת עבודה בצוות', 
      'אנגלית ברמה גבוהה'
    ],
    image: HAPPY_IMAGES[i % HAPPY_IMAGES.length],
    created_at: new Date(Date.now() - (i * 10000000)).toISOString()
  };
});

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function OpportunitiesPage() {
  const [viewMode, setViewMode] = useState<'binge' | 'classic'>('binge');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [currentHero, setCurrentHero] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('הכל');

  useEffect(() => {
    const timer = setInterval(() => setCurrentHero(prev => (prev + 1) % 4), 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredClassicJobs = useMemo(() => {
    return ALL_JOBS.filter(j => {
      const matchSearch = j.title.includes(search) || j.department.includes(search);
      const matchFilter = activeFilter === 'הכל' || j.department === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  const bingeCategories = [
    { title: "משרות ששמרת במועדפים", icon: <Heart className="text-red-500 fill-red-500" />, items: ALL_JOBS.filter(j => j.is_favorite) },
    { title: "המומלצות ביותר עבורך", icon: <Sparkles className="text-blue-500" />, items: ALL_JOBS.filter(j => j.ai_match_score > 92) },
    { title: "המשרות החדשות ביותר", icon: <Target className="text-green-500" />, items: ALL_JOBS.slice(0, 10) },
    { title: "משרות שמעלות חיוך", icon: <Smile className="text-pink-500" />, items: ALL_JOBS.slice(10, 20) },
    { title: "כישורי העתיד: טכנולוגיה וחדשנות", icon: <Rocket className="text-purple-500" />, items: ALL_JOBS.filter(j => j.department === 'טכנולוגיה' || j.department === 'חדשנות') },
    { title: "משרות לאנשים שאוהבים אנשים", icon: <Users className="text-orange-500" />, items: ALL_JOBS.filter(j => j.department === 'שירות ומכירה' || j.department === 'משאבי אנוש') },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans" dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      <style jsx global>{`
        body { font-family: 'Heebo', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 px-8 py-4 shadow-sm">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
               <button onClick={() => setViewMode('binge')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'binge' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>בינג' משרות</button>
               <button onClick={() => setViewMode('classic')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'classic' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>תצוגה קלאסית</button>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חפש משרה, מחלקה..." className="w-full pr-12 rounded-full bg-slate-50 border-slate-200 h-12 font-medium focus-visible:ring-blue-500" />
             </div>
          </div>
        </div>
      </header>

      {/* --- BINGE MODE --- */}
      {viewMode === 'binge' ? (
        <main className="space-y-16 py-10 overflow-hidden">
          {/* HERO BANNER */}
          <div className="px-8 max-w-[1500px] mx-auto">
            <div className="relative h-[500px] rounded-[40px] overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div key={currentHero} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0">
                  <img src={ALL_JOBS[currentHero].image} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10" />
                  <div className="absolute inset-y-0 right-0 w-full md:w-1/2 flex flex-col justify-center p-16 z-20 text-white">
                    <Badge className="w-fit mb-6 bg-blue-600 border-none font-bold px-4 py-1.5 text-sm uppercase tracking-widest shadow-lg">בחירת ה-AI עבורך</Badge>
                    <h2 className="text-6xl font-black mb-6 leading-tight drop-shadow-md">{ALL_JOBS[currentHero].title}</h2>
                    <div className="flex gap-6 items-center mt-6">
                      <Button onClick={() => setSelectedJob(ALL_JOBS[currentHero])} className="rounded-2xl h-14 px-10 bg-white text-slate-900 text-lg font-black hover:bg-slate-100 hover:scale-105 transition-all shadow-xl">פרטים מלאים</Button>
                      <div className="flex gap-2">
                        {[0,1,2,3].map(i => (
                          <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i === currentHero ? 'w-10 bg-blue-500' : 'w-2.5 bg-white/40'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* CATEGORY ROWS */}
          <div className="space-y-16">
            {bingeCategories.map((cat, idx) => (
              <CategoryRow key={idx} title={cat.title} icon={cat.icon} items={cat.items} onJobClick={(job: any) => setSelectedJob(job)} />
            ))}
          </div>
        </main>
      ) : (
        /* --- CLASSIC VIEW --- */
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar py-2">
             {['הכל', ...DEPARTMENTS].map(filter => (
               <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
               >
                 {filter}
               </button>
             ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredClassicJobs.map(job => (
              <ClassicJobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
            ))}
          </div>
        </div>
      )}

      {/* --- JOB DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 3. ROW COMPONENT
// ==========================================
function CategoryRow({ title, icon, items, onJobClick }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.7 : clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-6 relative group/row">
      <h3 className="px-12 text-2xl font-black text-slate-800 flex items-center gap-3">{icon} {title}</h3>
      
      <button onClick={() => scroll('right')} className="absolute right-2 top-[55%] -translate-y-1/2 z-40 p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover/row:opacity-100 transition-all hover:scale-125 drop-shadow-md bg-white/50 rounded-full backdrop-blur-sm">
        <ChevronRight size={32} strokeWidth={2.5} />
      </button>
      <button onClick={() => scroll('left')} className="absolute left-2 top-[55%] -translate-y-1/2 z-40 p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover/row:opacity-100 transition-all hover:scale-125 drop-shadow-md bg-white/50 rounded-full backdrop-blur-sm">
        <ChevronLeft size={32} strokeWidth={2.5} />
      </button>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar px-12 pb-8 snap-x" style={{ scrollBehavior: 'smooth' }}>
        {[...items, ...items].map((job, i) => (
          <BingeCard key={`${job.id}-${i}`} job={job} onJobClick={onJobClick} />
        ))}
      </div>
    </section>
  );
}

function BingeCard({ job, onJobClick }: { job: any, onJobClick: (job: any) => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.03 }}
      transition={{ type: "tween", duration: 0.3 }}
      onClick={() => onJobClick(job)}
      className="relative flex-shrink-0 w-[380px] aspect-[16/10] rounded-[32px] overflow-hidden shadow-md hover:shadow-xl cursor-pointer bg-slate-900 snap-start group border-4 border-white"
    >
      <img src={job.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={job.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-all duration-500 group-hover:bg-black/40" />
      
      {/* חיווי התאמה קבוע */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 ${job.ai_match_score >= 75 ? 'bg-green-500 text-white' : 'bg-white text-blue-600'}`}>
          {job.ai_match_score >= 75 && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>}
          {job.ai_match_score}% התאמה
        </div>
      </div>

      {/* תגמולים מופיעים בהובר */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <Badge className="bg-white/90 backdrop-blur-md text-purple-700 font-black border-none shadow-lg px-2 py-1 flex items-center gap-1">
           <Zap size={12} className="fill-purple-700" /> +{job.internal_xp} XP
         </Badge>
         <Badge className="bg-white/90 backdrop-blur-md text-yellow-700 font-black border-none shadow-lg px-2 py-1 flex items-center gap-1">
           <Coins size={12} className="fill-yellow-600" /> +{job.referral_coins}
         </Badge>
      </div>

      <div className="absolute bottom-6 right-6 left-6 z-10 pointer-events-none">
        <div className="text-[11px] font-black text-blue-300 uppercase tracking-widest mb-1 drop-shadow-md">{job.department}</div>
        <div className="text-2xl font-black text-white leading-tight drop-shadow-lg">{job.title}</div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 4. CLASSIC CARD COMPONENT
// ==========================================
function ClassicJobCard({ job, onClick }: { job: any, onClick: () => void }) {
  let matchColor = 'bg-orange-500';
  if (job.ai_match_score >= 90) matchColor = 'bg-green-500';
  else if (job.ai_match_score >= 75) matchColor = 'bg-blue-500';

  return (
    <Card className="group p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white flex flex-col justify-between h-full cursor-pointer" onClick={onClick}>
      <div className={`absolute top-0 right-0 w-2 h-full ${matchColor} opacity-80`} />
      <div>
        <div className="flex justify-between items-start mb-6 pr-2">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h3>
            <div className="flex gap-2">
               <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">{job.department}</Badge>
               {job.is_hot && <Badge className="bg-orange-500 text-white font-bold animate-pulse">HOT 🔥</Badge>}
            </div>
          </div>
          <div className={`text-center p-3 rounded-2xl border ${job.ai_match_score >= 75 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
            <div className="text-2xl font-black">{job.ai_match_score}%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Match</div>
          </div>
        </div>
        <p className="text-slate-500 font-medium line-clamp-2 text-lg mb-8 pr-2">{job.description}</p>
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-slate-50 pr-2">
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-sm font-black text-purple-700 bg-purple-50 px-4 py-2 rounded-xl"><Zap size={16}/> {job.internal_xp} XP</span>
          <span className="flex items-center gap-1.5 text-sm font-black text-yellow-700 bg-yellow-50 px-4 py-2 rounded-xl"><Coins size={16}/> {job.referral_coins}</span>
        </div>
        <Button className="rounded-2xl h-12 px-8 font-black bg-slate-900">לפרטים והגשה</Button>
      </div>
    </Card>
  );
}

// ==========================================
// 5. JOB DETAIL MODAL (Full Smart Flow)
// ==========================================
function JobDetailModal({ job, onClose }: { job: any, onClose: () => void }) {
  const [flowState, setFlowState] = useState<'idle' | 'internal_step1' | 'internal_step2' | 'referral_step1' | 'success'>('idle');
  const [notifiedManager, setNotifiedManager] = useState(false);
  const [seniorityCheck, setSeniorityCheck] = useState(false);
  
  const handleOpenEmail = () => {
    window.location.href = `mailto:${job.recruiter_email}?subject=שאלה לגבי משרת ${job.title}`;
  };

  const handleManagerEmail = () => {
    window.location.href = `mailto:?subject=עדכון לגבי מועמדות פנימית&body=היי, רציתי לעדכן שאני מתעניין במשרת ${job.title} בפורטל ההזדמנויות.`;
  };

  const submitFinal = () => {
    setFlowState('success');
    setTimeout(onClose, 3500); 
  };

  const isHighMatch = job.ai_match_score >= 75;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} transition={{ type: 'spring', damping: 25 }}
        className="bg-white w-full max-w-[1100px] h-[90vh] overflow-y-auto no-scrollbar rounded-[40px] shadow-2xl relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 left-6 bg-white/80 backdrop-blur text-slate-900 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg z-20">✕</button>
        
        {/* כפתור פנייה למגייסת */}
        <button onClick={handleOpenEmail} title="שאלות למגייסת?" className="absolute top-6 left-20 bg-blue-600/90 text-white backdrop-blur w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-600 hover:scale-110 transition-all shadow-lg z-20">
          <Mail size={18} />
        </button>
        
        <div className="h-[200px] shrink-0 relative">
          <img src={job.image} className="w-full h-full object-cover" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-transparent" />
        </div>
        
        <div className="flex-1 px-10 pb-12 pt-8 relative z-10 flex flex-col md:flex-row gap-12 bg-white">
          
          {/* צד ימין - פרטי המשרה */}
          <div className="flex-1 space-y-8">
             <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 mt-2">{job.title}</h2>
                {/* תעודת זהות של המשרה - ממוזגת לשורה אחת כפי שביקשת */}
                <div className="flex flex-wrap items-center gap-3 text-slate-600 font-bold text-lg mb-8">
                   <span className="flex items-center gap-1.5"><Briefcase size={18} className="text-blue-500"/> {job.department}</span>
                   <span className="text-slate-300">|</span>
                   <span className="flex items-center gap-1.5"><MapPin size={18} className="text-blue-500"/> {job.location}</span>
                   <span className="text-slate-300">|</span>
                   <span className="flex items-center gap-1.5"><Clock size={18} className="text-blue-500"/> {job.hours}, {job.hybrid}</span>
                </div>
             </div>

             <section>
               <h4 className="text-xl font-black mb-3 text-slate-800">תיאור התפקיד</h4>
               <p className="text-slate-600 leading-relaxed text-md font-medium">{job.description}</p>
             </section>

             <section>
               <h4 className="text-xl font-black mb-3 text-slate-800">דרישות סף</h4>
               <ul className="space-y-2 mb-6">
                 {job.requirements.map((req: string, i: number) => (
                   <li key={i} className="flex items-start gap-3 text-slate-600 text-md font-medium">
                     <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                     {req}
                   </li>
                 ))}
               </ul>
             </section>

             {/* תנאים נלווים */}
             <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <h4 className="text-lg font-black mb-4 text-slate-800">תנאים והטבות</h4>
               <ul className="grid grid-cols-2 gap-4">
                 {job.perks.map((perk: string, i: number) => (
                   <li key={i} className="flex items-center gap-2 text-slate-700 text-md font-bold">
                     <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                     {perk}
                   </li>
                 ))}
               </ul>
             </section>
          </div>
          
          {/* צד שמאל - תהליך ההגשה החכם (The Flow) וקופסת ה-AI */}
          <div className="w-full md:w-[400px] shrink-0 sticky top-0 h-fit space-y-6">
            
            {/* The Smart AI Match Box */}
            <div className={`p-6 rounded-[32px] border-2 shadow-sm ${isHighMatch ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl ${isHighMatch ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {job.ai_match_score}%
                    </div>
                    <div>
                        <div className="font-black text-slate-800 text-lg">התאמת מיומנויות AI</div>
                        <div className={`text-sm font-bold ${isHighMatch ? 'text-green-600' : 'text-orange-600'}`}>
                            {isHighMatch ? 'פרופיל מתאים מאוד' : 'נדרש חיזוק מיומנויות'}
                        </div>
                    </div>
                </div>

                {isHighMatch ? (
                    <div className="text-sm text-slate-700 font-medium">
                        <p className="mb-4">איזה יופי! הפרופיל שלך תואם לדרישות המשרה. יש לך יתרון משמעותי בתהליך המיון - יאללה להגשת מועמדות!</p>
                        <div className="space-y-2 bg-white/60 p-3 rounded-xl border border-green-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">מיומנויות תואמות:</span>
                            {job.matched_skills.map((skill: string) => (
                                <div key={skill} className="flex items-center gap-2 font-bold text-slate-800"><CheckCircle2 size={16} className="text-green-500"/> {skill}</div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-700 font-medium">
                        <p className="mb-4">לתשומת לבך, שיעור ההתאמה נמוך מ-75%, מה שעשוי להוריד את סיכויי הקבלה. מומלץ לחזק את המיומנויות הבאות:</p>
                        <div className="space-y-2">
                            {job.missing_skills.map((skill: string) => (
                                <div key={skill} className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                                    <span className="flex items-center gap-2 font-bold text-slate-800"><Target size={16} className="text-orange-500"/> {skill}</span>
                                    <button className="flex items-center gap-1 text-xs text-blue-600 font-black bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"><BookOpen size={12}/> למידה</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Flow */}
            <AnimatePresence mode="wait">
              {flowState === 'idle' && (
                <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, x: -20}} className="flex flex-col gap-4">
                  {/* Internal Apply */}
                  <button onClick={() => setFlowState('internal_step1')} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                         <UserCheck size={24} />
                       </div>
                       <div className="text-right">
                         <div className="font-black text-slate-900 text-lg">הגשת מועמדות פנימית</div>
                         <div className="text-xs font-bold text-slate-500">התקדמות בארגון לתפקיד הבא</div>
                       </div>
                    </div>
                    <div className="bg-purple-50 text-purple-700 font-black px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border border-purple-100">
                      <Zap size={14} fill="currentColor"/> {job.internal_xp}
                    </div>
                  </button>

                  {/* Referral Apply */}
                  <button onClick={() => setFlowState('referral_step1')} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-yellow-500 hover:bg-yellow-50/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                         <Users size={24} />
                       </div>
                       <div className="text-right">
                         <div className="font-black text-slate-900 text-lg">חבר מביא חבר</div>
                         <div className="text-xs font-bold text-slate-500">המלץ על חבר למשרה זו</div>
                       </div>
                    </div>
                    <div className="bg-yellow-50 text-yellow-700 font-black px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border border-yellow-100">
                      <Coins size={14} fill="currentColor"/> {job.referral_coins}
                    </div>
                  </button>
                </motion.div>
              )}

              {/* מסלול פנימי: שלב 1 - אתיקה */}
              {flowState === 'internal_step1' && (
                <motion.div key="internal1" initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} exit={{x:-20, opacity:0}} className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <button onClick={() => setFlowState('idle')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><ChevronRightSmall size={14}/> חזור לבחירה</button>
                  <h4 className="font-black text-slate-900 text-xl">לפני שמתחילים</h4>
                  
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl border-2 transition-all ${notifiedManager ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-5 h-5 rounded text-blue-600" checked={notifiedManager} onChange={(e) => setNotifiedManager(e.target.checked)} />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-slate-800">יידעתי את המנהל/ת הישיר/ה שלי.</span>
                          <p className="text-xs text-slate-500 mt-1">הפניקס מעודדת פתיחות ושקיפות.</p>
                          {!notifiedManager && (
                            <button onClick={(e) => { e.preventDefault(); handleManagerEmail(); }} className="mt-2 text-xs font-bold text-blue-600 hover:underline">שלח טיוטת מייל למנהל</button>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className={`p-4 rounded-2xl border-2 transition-all ${seniorityCheck ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-5 h-5 rounded text-blue-600" checked={seniorityCheck} onChange={(e) => setSeniorityCheck(e.target.checked)} />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-slate-800">אני בתפקידי הנוכחי לפחות שנתיים.</span>
                          <p className="text-xs text-slate-500 mt-1 italic">ניתן להגיש גם אם לא, אך זו ההמלצה.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button onClick={() => setFlowState('internal_step2')} disabled={!notifiedManager} className="w-full h-14 rounded-[20px] bg-slate-900 hover:bg-black font-black text-lg">המשך לשלב הבא</Button>
                </motion.div>
              )}

              {/* מסלול פנימי: שלב 2 - הגשה */}
              {flowState === 'internal_step2' && (
                <motion.div key="internal2" initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} exit={{x:-20, opacity:0}} className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <button onClick={() => setFlowState('internal_step1')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><ChevronRightSmall size={14}/> חזור אחורה</button>
                  
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-center">
                     <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                     <p className="font-bold text-slate-600 text-sm">קורות חיים מעודכנים (אופציונלי)</p>
                  </div>

                  <Button onClick={submitFinal} className="w-full h-16 rounded-[20px] bg-blue-600 hover:bg-blue-700 font-black text-xl shadow-lg shadow-blue-200 flex flex-col leading-none">
                    <span>שגר מועמדות</span>
                    <span className="text-xs font-medium text-blue-200 mt-1">ותרוויח {job.internal_xp} XP!</span>
                  </Button>
                </motion.div>
              )}

              {/* מסלול חבר: העלאה ולינק */}
              {flowState === 'referral_step1' && (
                <motion.div key="referral1" initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} exit={{x:-20, opacity:0}} className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <button onClick={() => setFlowState('idle')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-2"><ChevronRightSmall size={14}/> חזור</button>
                  <h4 className="font-black text-slate-900 text-xl">הפניית חבר</h4>
                  
                  <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-8 bg-yellow-50/50 hover:bg-yellow-50 cursor-pointer transition-colors">
                     <Upload size={32} className="mx-auto text-yellow-600 mb-3" />
                     <p className="font-bold text-slate-800">גרור לכאן קורות חיים של החבר</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold">או</span></div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                     <span className="text-xs font-mono text-slate-500 truncate text-left w-full" dir="ltr">fnxup.co.il/ref/a1b2</span>
                     <Button size="sm" variant="secondary" className="font-bold ml-2"><LinkIcon size={14} className="mr-1"/> העתק</Button>
                  </div>

                  <Button onClick={submitFinal} className="w-full h-14 rounded-[20px] bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black text-lg shadow-xl">שליחה למגייסת</Button>
                </motion.div>
              )}

              {/* מסך הצלחה סופי */}
              {flowState === 'success' && (
                <motion.div key="success" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="text-center py-10 bg-white rounded-3xl border-2 border-green-100 shadow-xl">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                     <PartyPopper size={48} />
                  </div>
                  <h3 className="font-black text-3xl text-slate-900 mb-2">יצאנו לדרך!</h3>
                  <p className="text-slate-500 font-medium px-6">הפרטים התקבלו בהצלחה. צוות הגיוס כבר עובד על זה.</p>
                  
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">אולי יעניין אותך גם</p>
                    <div className="space-y-2 px-6">
                       <div className="text-sm font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 text-right">מנהל פרויקטים טכנולוגיים</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}