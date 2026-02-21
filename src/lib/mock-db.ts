// ============================================================
// Mock Database — Single Source of Truth for prototyping data
// ============================================================
// In production, replace these with real API / Supabase calls.
// ============================================================

import {
  Award, Brain, Briefcase, GraduationCap,
  Search, Target, Users, Zap,
} from 'lucide-react';

import type {
  CompassRole,
  Course,
  BrainGame,
  StoreProduct,
  MockJob,
  JobCollection,
} from '@/types';

// ---- COMPASS PAGE DATA ------------------------------------------------

export const COMPASS_LABELS = ['אסטרטגיה', 'טכנולוגיה', 'דאטה', 'תקשורת', 'UX/UI'];

export const COMPASS_ROLES: CompassRole[] = [
  {
    id: 'pm',
    title: 'Product Manager',
    department: 'Technology',
    match: 65,
    skillsData: [85, 90, 60, 45, 80],
    mySkills: [70, 40, 50, 80, 40],
    recommendations: [
      { id: 1, type: 'course', title: 'Product Strategy Masterclass', provider: 'Udemy', duration: '5h', imageColor: 'from-purple-500 to-indigo-500', icon: GraduationCap },
      { id: 2, type: 'gig', title: 'אפיון מסך כניסה ללקוח', provider: 'Mobile Team', duration: 'Project', imageColor: 'from-orange-400 to-red-500', icon: Zap },
      { id: 3, type: 'mentor', title: 'מנטורינג עם נועה (VP)', provider: 'Executive', duration: '1:1', imageColor: 'from-blue-400 to-cyan-500', icon: Users },
      { id: 4, type: 'course', title: 'Data Driven Decisions', provider: 'Coursera', duration: '12h', imageColor: 'from-emerald-400 to-green-500', icon: Briefcase },
      { id: 5, type: 'badge', title: 'הסמכת ניהול ג׳וניור', provider: 'Phoenix Academy', duration: 'Exam', imageColor: 'from-yellow-400 to-orange-500', icon: Award },
    ],
  },
  {
    id: 'fe',
    title: 'Senior Frontend Dev',
    department: 'R&D',
    match: 40,
    skillsData: [40, 95, 30, 60, 50],
    mySkills: [40, 60, 30, 60, 20],
    recommendations: [
      { id: 6, type: 'course', title: 'Advanced React Patterns', provider: 'Frontend Masters', duration: '8h', imageColor: 'from-cyan-500 to-blue-600', icon: GraduationCap },
      { id: 7, type: 'gig', title: 'Refactor Legacy Components', provider: 'Infra Team', duration: 'Sprint', imageColor: 'from-slate-600 to-slate-800', icon: Zap },
    ],
  },
  {
    id: 'ds',
    title: 'Data Scientist',
    department: 'Data',
    match: 30,
    skillsData: [95, 80, 95, 50, 60],
    mySkills: [40, 50, 30, 70, 40],
    recommendations: [
      { id: 8, type: 'course', title: 'Python for ML', provider: 'DataCamp', duration: '20h', imageColor: 'from-yellow-500 to-amber-600', icon: GraduationCap },
    ],
  },
];

// ---- LEARNING PAGE DATA -----------------------------------------------

export const COURSES: Course[] = [
  { id: 1, title: 'יסודות ניהול מוצר', author: 'רונית כהן, VP Product', progress: 45, duration: '4h 20m', image: '🎨', color: 'bg-purple-100 text-purple-600' },
  { id: 2, title: 'SQL למתחילים', author: 'צוות הדאטה', progress: 0, duration: '2h 15m', image: '📊', color: 'bg-blue-100 text-blue-600' },
  { id: 3, title: 'תקשורת בין-אישית', author: 'HR הדרכה', progress: 90, duration: '1h 30m', image: '🗣️', color: 'bg-orange-100 text-orange-600' },
];

export const BRAIN_GAMES: BrainGame[] = [
  { id: 'memory', title: 'Neural Focus', subtitle: 'שיפור זיכרון עבודה', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50', score: 1250 },
  { id: 'logic', title: 'Pattern Hunter', subtitle: 'זיהוי דפוסים ואנליזה', icon: Search, color: 'text-emerald-600', bg: 'bg-emerald-50', score: 850 },
  { id: 'speed', title: 'Quick React', subtitle: 'קבלת החלטות מהירה', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', score: 0 },
];

// ---- STORE PAGE DATA --------------------------------------------------

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 1,
    name: 'יום חופש אקסטרה',
    category: 'experiences',
    price: 15000,
    image: '🏖️',
    description: 'שובר דיגיטלי ליום חופש נוסף על חשבון המערכת.',
    stock: 5,
    minLevel: 5,
  },
  {
    id: 2,
    name: 'AirPods Pro 2',
    category: 'gear',
    price: 8500,
    image: '🎧',
    description: 'האוזניות החדשות של אפל עם ביטול רעשים.',
    stock: 2,
    minLevel: 1,
  },
  {
    id: 3,
    name: 'ארוחת צהריים עם המנכ"ל',
    category: 'experiences',
    price: 25000,
    image: '🍽️',
    description: 'שעה וחצי של שיחה פתוחה ואוכל טוב במסעדת שף.',
    stock: 1,
    minLevel: 10,
  },
  {
    id: 4,
    name: "קפוצ'ון הפניקס (מהדורה מוגבלת)",
    category: 'swag',
    price: 2500,
    image: '👕',
    description: "הקפוצ'ון שכולם רוצים. 100% כותנה איכותית.",
    stock: 50,
    minLevel: 1,
  },
  {
    id: 5,
    name: 'תרומה ל"לתת"',
    category: 'donate',
    price: 500,
    image: '❤️',
    description: 'אנחנו נמיר את המטבעות שלך לתרומה כספית.',
    stock: 999,
    minLevel: 1,
  },
  {
    id: 6,
    name: 'קורס Udemy לבחירה',
    category: 'growth',
    price: 1200,
    image: '🎓',
    description: 'שובר לרכישת כל קורס לפיתוח מקצועי.',
    stock: 100,
    minLevel: 1,
  },
];

// ---- OPPORTUNITIES PAGE DATA ------------------------------------------

export const MOCK_JOBS: MockJob[] = [
  {
    id: '1',
    title: 'Senior Product Manager',
    department: 'Digital',
    location: 'תל אביב (היברידי)',
    type: 'משרה מלאה',
    bounty: 5000,
    isSurge: true,
    matchScore: 88,
    missingSkills: ['SQL', 'Figma'],
    teamFriends: [
      { name: 'דני', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dani' },
      { name: 'רונית', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ronit' },
    ],
    manager: { name: 'עומר', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omer' },
    tags: ['Strategic', 'Mobile'],
  },
  {
    id: '2',
    title: 'Data Analyst Junior',
    department: 'Data & BI',
    location: 'פתח תקווה',
    type: 'משרה מלאה',
    bounty: 2000,
    isSurge: false,
    matchScore: 65,
    missingSkills: ['Python', 'Tableau', 'PowerBI'],
    teamFriends: [],
    manager: { name: 'שירה', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shira' },
    tags: ['Entry Level'],
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    department: 'Technology',
    location: 'תל אביב',
    type: 'משרה מלאה',
    bounty: 8000,
    isSurge: true,
    matchScore: 95,
    missingSkills: [],
    teamFriends: [
      { name: 'יוסי', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yossi' },
      { name: 'מיכל', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michal' },
      { name: 'גל', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gal' },
    ],
    manager: { name: 'אבי', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avi' },
    tags: ['Cloud', 'K8s'],
  },
];

export const JOB_COLLECTIONS: JobCollection[] = [
  { id: 'all', label: 'כל המשרות', icon: Briefcase },
  { id: 'best_match', label: 'הכי מתאימים לי', icon: Target, color: 'text-green-600 bg-green-50' },
  { id: 'high_bounty', label: 'הכי רווחיים 🔥', icon: Zap, color: 'text-orange-600 bg-orange-50' },
  { id: 'skill_bridge', label: 'משלימי פער 🎓', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
  { id: 'social', label: 'חברים בצוות', icon: Users, color: 'text-purple-600 bg-purple-50' },
];
