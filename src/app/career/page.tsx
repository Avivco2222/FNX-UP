'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, Brain, Zap, Target, Users, Map, 
  CheckCircle2, TrendingUp, Clock, Compass, Sparkles, Briefcase, ArrowLeft, Flame, Lock, Mail, ChevronDown, X, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- MOCK DATA ---
const COMPASS_LABELS = ['חשיבה אסטרטגית', 'ניהול נתונים', 'תקשורת בין-אישית', 'יכולת טכנית', 'הובלת צוות'];

const AVAILABLE_ROLES = [
  'Product Manager', 'Data Analyst', 'מנהל/ת מחלקה', 'HR Business Partner', 
  'ארכיטקט סייבר', 'מפתח/ת Fullstack', 'מנהל/ת קשרי לקוחות', 'רכז/ת גיוס', 'מנתח/ת מערכות', 'מנהל/ת פרויקטים'
];

const INITIAL_ROLES = [
  {
    id: '1',
    title: 'Product Manager',
    department: 'חדשנות',
    match: 85,
    tag: 'גילוי AI',
    mySkills: [70, 60, 90, 50, 80],
    skillsData: [90, 85, 80, 70, 85],
    aiSummary: "הרקע שלך בניהול פרויקטים ויחסי אנוש מעולים מהווים בסיס מצוין לתפקיד זה. הפער הוא ביכולות הניתוח הטכניות.",
    estimatedTime: '3-6 חודשים',
    totalXpToGain: 450,
    recommendations: [
      { id: 'c1', type: 'course', title: 'אסטרטגיית מוצר מקיפה', provider: 'FNX Academy', duration: '3 שעות', icon: Brain, xp: 150 },
      { id: 'g1', type: 'gig', title: 'אפיון מסע לקוח - אגף פיננסים', provider: 'משימה פנימית', duration: '5 שעות שבועי', icon: Zap, xp: 300 }
    ]
  },
  {
    id: '2',
    title: 'מנהל/ת מחלקה',
    department: 'שירות ומכירה',
    match: 92,
    tag: 'קידום טבעי',
    mySkills: [70, 60, 90, 50, 80],
    skillsData: [80, 70, 95, 40, 90],
    aiSummary: "הפרופיל שלך כמעט מושלם לתפקיד! החוזקות שלך בהובלת צוות בולטות במיוחד. נדרש רק חידוד קל בחשיבה האסטרטגית.",
    estimatedTime: '1-2 חודשים',
    totalXpToGain: 200,
    recommendations: [
      { id: 'm1', type: 'mentor', title: 'פגישת מנטורינג עם סמנכ"ל שירות', provider: 'Mentoring Hub', duration: '45 דק', icon: Users, xp: 200 }
    ]
  },
  {
    id: '3',
    title: 'Data Analyst',
    department: 'כספים',
    match: 65,
    tag: 'הסבה מקצועית',
    mySkills: [70, 60, 90, 50, 80],
    skillsData: [85, 95, 60, 80, 60],
    aiSummary: "שינוי כיוון מרתק. הפער המרכזי הוא טכני ואנליטי, אך היכולות הבין-אישיות שלך יסייעו מאוד בהצגת נתונים להנהלה.",
    estimatedTime: '6-12 חודשים',
    totalXpToGain: 800,
    recommendations: [
      { id: 'c2', type: 'course', title: 'SQL ויסודות דאטה', provider: 'Udemy', duration: '12 שעות', icon: Target, xp: 400 },
      { id: 'c3', type: 'course', title: 'Data Visualization', provider: 'FNXLearn', duration: '8 שעות', icon: TrendingUp, xp: 400 }
    ]
  }
];

const QUICK_WINS = [
  { id: 'qw1', title: 'מנהל/ת לקוחות VIP', match: 94, dept: 'שירות ומכירה' },
  { id: 'qw2', title: 'רכז/ת גיוס בכיר/ה', match: 88, dept: 'משאבי אנוש' }
];

const MOTIVATIONS = [
  "הקריירה שלך היא ריצת מרתון, לא ספרינט. כל מיומנות שתלמד היא צעד קדימה.",
  "ההשקעה הכי טובה שלך היא בעצמך. סמן יעד, וצא לדרך.",
  "מי שלומד היום, מוביל מחר. אנחנו כאן כדי להראות לך את הדרך.",
  "אין תקרת זכוכית, יש רק פערי ידע שאפשר להשלים."
];

function getPointsArray(stats: number[], scale = 1) {
  const total = stats.length;
  const r = 160 * scale; 
  const center = 200;
  return stats.map((val, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const radius = (val / 100) * r;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
}

function getLabelCoords(i: number) {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  const x = 200 + 195 * Math.cos(angle); 
  const y = 200 + 195 * Math.sin(angle);
  return { x, y };
}

export default function FluidCompass() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState(INITIAL_ROLES[0]);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [motivation, setMotivation] = useState(MOTIVATIONS[0]);

  useEffect(() => {
    setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSearchRoles = AVAILABLE_ROLES.filter(r => r.includes(searchQuery) && !roles.some(existing => existing.title === r));

  const handleSelectRole = (roleName: string) => {
    if (roles.length >= 5) return;
    setSearchQuery('');
    setIsDropdownOpen(false);
    
    const newRole = {
      id: `custom-${Date.now()}`,
      title: roleName,
      department: 'מסלול מותאם',
      match: Math.floor(Math.random() * 30) + 50, 
      tag: 'יעד אישי',
      mySkills: [70, 60, 90, 50, 80],
      skillsData: [Math.floor(Math.random()*40)+60, Math.floor(Math.random()*40)+60, Math.floor(Math.random()*40)+60, Math.floor(Math.random()*40)+60, Math.floor(Math.random()*40)+60],
      aiSummary: `מנוע ה-AI מיפה את הדרישות עבור ${roleName}. בנינו עבורך מפת דרכים כדי לסגור את פערי הידע.`,
      estimatedTime: '8-14 חודשים',
      totalXpToGain: 1200,
      recommendations: [
        { id: `c_${Date.now()}`, type: 'course', title: `יסודות ב${roleName}`, provider: 'FNX Academy', duration: '20 שעות', icon: Brain, xp: 500 },
        { id: `g_${Date.now()}`, type: 'gig', title: 'פרויקט צד ללמידה מעשית', provider: 'משימה פנימית', duration: 'חודשיים', icon: Zap, xp: 400 }
      ]
    };
    setRoles([newRole, ...roles]);
    setSelectedRole(newRole);
  };

  const removeRole = (idToRemove: string) => {
    if (roles.length === 1) return;
    const updatedRoles = roles.filter(r => r.id !== idToRemove);
    setRoles(updatedRoles);
    if (selectedRole.id === idToRemove) {
      setSelectedRole(updatedRoles[0]);
    }
  };

  const isEligibleToApply = selectedRole.match >= 80;

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden" dir="rtl">
      
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      <style jsx global>{`
        body { font-family: 'Heebo', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER - FIXED HEIGHT */}
      <header className="h-[64px] shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-xl text-white shadow-sm">
               <Compass size={20}/>
            </div>
            <div>
               <h1 className="font-black text-slate-900 text-xl tracking-tighter leading-none">מצפן<span className="text-blue-600">הקריירה</span></h1>
            </div>
         </div>
         
         <div className="flex-1 flex justify-center max-w-xl mx-8 relative" ref={dropdownRef}>
            <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={roles.length >= 5}
                  placeholder={roles.length >= 5 ? "הגעת למקסימום יעדים. הסר יעד כדי להוסיף." : "בחר תפקיד יעד מתוך מאגר התפקידים בחברה..."} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pr-10 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed" 
                />
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            
            <AnimatePresence>
               {isDropdownOpen && roles.length < 5 && (
                 <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-[110%] w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[250px] overflow-y-auto"
                 >
                    {filteredSearchRoles.length > 0 ? (
                      filteredSearchRoles.map(role => (
                        <div key={role} onClick={() => handleSelectRole(role)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 transition-colors border-b border-slate-50 text-sm">
                           <Briefcase size={14} className="text-slate-400"/>
                           <span className="font-bold text-slate-700">{role}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-slate-400 text-sm font-medium">לא נמצאו תפקידים זמינים</div>
                    )}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </header>

      {/* MAIN LAYOUT - FIXED HEIGHT GRID */}
      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_320px]">
        
        {/* --- COL 1: ROLES & QUICK WINS (Right) --- */}
        <div className="bg-white border-l border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full flex flex-col">
           
           <div className="p-4 pb-2 shrink-0">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Target size={14}/> אפשרויות פיתוח
                 </h3>
                 <span className="text-[10px] font-bold text-slate-300">{roles.length}/5</span>
              </div>
           </div>
           
           {/* Fixed 5 Slots Container */}
           <div className="px-3 pb-2 flex-1 flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((index) => {
                 const role = roles[index];
                 if (role) {
                    const isSelected = selectedRole.id === role.id;
                    return (
                       <div key={role.id} className="relative group h-[72px] shrink-0">
                          <button 
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`w-full h-full text-right p-3 rounded-xl cursor-pointer transition-all duration-300 block border ${isSelected ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}
                          >
                             <div className="flex justify-between items-start mb-1 pr-4">
                                <span className={`font-black text-sm leading-tight line-clamp-1 ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>{role.title}</span>
                             </div>
                             <div className="flex justify-between items-center mt-1 pr-4">
                                <Badge variant="secondary" className="bg-slate-100/80 border border-slate-200 text-slate-500 text-[9px] px-1.5 py-0">{role.tag}</Badge>
                                <div className={`font-black text-xs ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>{role.match}%</div>
                             </div>
                          </button>
                          {roles.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); removeRole(role.id); }} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-full p-0.5 transition-all z-10" title="הסר יעד פיתוח">
                               <X size={10} />
                            </button>
                          )}
                       </div>
                    );
                 } else {
                    return (
                       <div key={`empty-${index}`} className="h-[72px] shrink-0 w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 opacity-50">
                          <Plus size={20} />
                       </div>
                    );
                 }
              })}
           </div>

           {/* Fixed Bottom Section */}
           <div className="shrink-0 p-4 pt-3 bg-slate-50 border-t border-slate-200 h-[210px]">
              <h3 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
                 <Flame className="text-orange-500" size={14}/> הזדמנויות קרובות
              </h3>
              <div className="space-y-2">
                 {QUICK_WINS.map(qw => (
                    <Card key={qw.id} className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 transition-all bg-white group shadow-sm">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-400">{qw.dept}</span>
                          <Badge className="bg-green-50 text-green-600 border-none text-[9px] px-1 py-0">{qw.match}%</Badge>
                       </div>
                       <div className="font-black text-xs text-slate-800 mb-2 truncate">{qw.title}</div>
                       <Link href="/opportunities">
                          <Button size="sm" variant="outline" className="w-full h-6 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50 py-0">לפרטים והגשה</Button>
                       </Link>
                    </Card>
                 ))}
              </div>
           </div>
        </div>

        {/* --- COL 2: RADAR & INSIGHTS (Center) --- */}
        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] px-6 py-4 h-full flex flex-col items-center justify-between">
           
           <div className="text-center shrink-0 mt-2">
              <h2 className="text-2xl font-black text-slate-800 mb-0.5">ניתוח פער מיומנויות: {selectedRole.title}</h2>
              <p className="text-slate-500 font-medium text-sm">השוואת הפרופיל שלך מול דרישות הליבה</p>
           </div>

           {/* Fixed Chart Area */}
           <div className="flex-1 w-full flex items-center justify-center relative">
              <div className="relative w-[450px] h-[450px]">
                 <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
                    {[100, 75, 50, 25].map((level) => (
                       <polygon key={level} points={getPointsArray([level, level, level, level, level])} fill="transparent" stroke="#E2E8F0" strokeWidth="1" strokeDasharray={level === 100 ? "0" : "4 4"} />
                    ))}
                    {[0, 1, 2, 3, 4].map(i => {
                       const coords = getLabelCoords(i);
                       return <line key={`axis-${COMPASS_LABELS[i]}`} x1="200" y1="200" x2={coords.x} y2={coords.y} stroke="#CBD5E1" strokeWidth="1" />;
                    })}

                    <motion.polygon animate={{ points: getPointsArray(selectedRole.skillsData) }} transition={{ type: "spring", stiffness: 60, damping: 15 }} fill="rgba(59, 130, 246, 0.05)" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 6" />
                    <motion.polygon animate={{ points: getPointsArray(selectedRole.mySkills) }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.1 }} fill="rgba(59, 130, 246, 0.25)" stroke="#2563EB" strokeWidth="3" />

                    {[0, 1, 2, 3, 4].map(i => {
                       const roleR = (selectedRole.skillsData[i] / 100) * 160;
                       const myR = (selectedRole.mySkills[i] / 100) * 160;
                       const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                       const roleX = 200 + roleR * Math.cos(angle); const roleY = 200 + roleR * Math.sin(angle);
                       const myX = 200 + myR * Math.cos(angle); const myY = 200 + myR * Math.sin(angle);
                       const isHovered = hoveredSkill === i;
                       return (
                         <g key={`dots-${i}`}>
                           <motion.circle animate={{ cx: roleX, cy: roleY }} transition={{ type: "spring", stiffness: 60, damping: 15 }} r="4" fill={isHovered ? "#94A3B8" : "white"} stroke="#94A3B8" strokeWidth="2" />
                           <motion.circle animate={{ cx: myX, cy: myY }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.1 }} r="5" fill="#2563EB" />
                         </g>
                       );
                    })}

                    {COMPASS_LABELS.map((label, i) => {
                       const coords = getLabelCoords(i);
                       const isHovered = hoveredSkill === i;
                       return (
                          <foreignObject x={coords.x - 60} y={coords.y - 12} width="120" height="30" key={label} className="overflow-visible">
                             <div className={`text-center transition-all duration-300 cursor-default ${isHovered ? 'scale-110 z-10' : ''}`} onMouseEnter={() => setHoveredSkill(i)} onMouseLeave={() => setHoveredSkill(null)}>
                                <div className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-sm border transition-colors whitespace-nowrap ${isHovered ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                   {label}
                                </div>
                             </div>
                          </foreignObject>
                       );
                    })}
                 </svg>

                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                       <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> הפרופיל הנוכחי
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                       <span className="w-2.5 h-2.5 rounded-full border border-slate-400 border-dashed"></span> דרישות המשרה
                    </div>
                 </div>
              </div>
           </div>

           <Card className="w-full max-w-[550px] p-5 rounded-2xl border border-slate-100 shadow-md bg-white shrink-0 mb-4">
              <div className="flex items-center gap-1.5 mb-2 text-blue-600 font-black text-sm">
                 <Brain size={18}/> תובנת מנהל קריירה AI
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                 {selectedRole.aiSummary}
              </p>
           </Card>
        </div>

        {/* --- COL 3: THE ROADMAP & HR (Left Sidebar) --- */}
        <div className="bg-white border-r border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] h-full flex flex-col">
           
           <div className="p-4 pb-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-1.5 mb-1">
                 <Map className="text-blue-600" size={18}/> מפת הדרכים שלך
              </h2>
              <div className="flex gap-2 mt-3">
                 <div className="bg-white p-2 rounded-xl border border-slate-200 flex-1 text-center shadow-sm">
                    <Clock size={14} className="mx-auto text-slate-400 mb-0.5"/>
                    <div className="text-xs font-black text-slate-800">{selectedRole.estimatedTime}</div>
                 </div>
                 <div className="bg-white p-2 rounded-xl border border-slate-200 flex-1 text-center shadow-sm">
                    <Zap size={14} className="mx-auto text-purple-500 mb-0.5"/>
                    <div className="text-xs font-black text-slate-800">+{selectedRole.totalXpToGain} XP</div>
                 </div>
              </div>
           </div>

           {/* Scrollable Timeline Area */}
           <div className="flex-1 overflow-y-auto no-scrollbar p-4 relative">
              <div className="absolute right-[27px] top-6 bottom-4 w-[2px] bg-slate-100 rounded-full" />
              <div className="space-y-4 relative">
                 <AnimatePresence mode="popLayout">
                    {selectedRole.recommendations.map((item, index) => {
                       const Icon = item.icon;
                       return (
                          <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.1 }} className="flex gap-3 relative">
                             <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10 text-blue-600 mt-1">
                                <Icon size={12} />
                             </div>
                             <Card className="flex-1 p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-white">
                                <div className="flex justify-between items-start mb-1.5">
                                   <Badge variant="outline" className="bg-slate-50 text-slate-500 text-[9px] border-none px-1.5">{item.type === 'course' ? 'קורס' : item.type === 'gig' ? 'גיג' : 'מנטורינג'}</Badge>
                                   <div className="flex items-center gap-1 text-purple-600 font-black text-[9px] bg-purple-50 px-1.5 py-0.5 rounded">
                                      <Zap size={8} fill="currentColor"/> {item.xp}
                                   </div>
                                </div>
                                <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">{item.title}</h4>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                   <span className="flex items-center gap-0.5"><Target size={10}/> {item.provider}</span>
                                   <span className="flex items-center gap-0.5"><Clock size={10}/> {item.duration}</span>
                                </div>
                             </Card>
                          </motion.div>
                       );
                    })}
                 </AnimatePresence>
              </div>
           </div>

           {/* Fixed Bottom Action Area */}
           <div className="shrink-0 bg-white border-t border-slate-100">
              <div className="p-4 pb-2">
                 {isEligibleToApply ? (
                   <Link href="/opportunities" className="block w-full">
                     <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-sm shadow-md shadow-blue-200 flex items-center justify-between px-4">
                       <span>הגשת מועמדות</span>
                       <ArrowLeft size={16} />
                     </Button>
                   </Link>
                 ) : (
                   <Button disabled className="w-full h-11 rounded-xl bg-slate-100 text-slate-500 font-black text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200">
                     <Lock size={14} /> השלם פערים להגשה ({selectedRole.match}%)
                   </Button>
                 )}
              </div>

              <div className="px-5 pb-3 text-center">
                 <p className="text-[10px] font-bold text-slate-500 leading-snug italic">"{motivation}"</p>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                       <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                          <img src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150" alt="HR" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <div className="text-xs font-black text-slate-800 leading-none">מיכל מור</div>
                          <div className="text-[9px] font-bold text-slate-500 mt-0.5">יועצת קריירה ארגונית</div>
                       </div>
                    </div>
                    <Button size="icon" variant="outline" className="rounded-full bg-white border-blue-200 text-blue-600 hover:bg-blue-50 w-7 h-7" title="שלח הודעה למיכל">
                       <Mail size={12} />
                    </Button>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}