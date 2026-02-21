/**
 * FnxLevelUp – Demo Seed Script
 * ===============================
 * Populates the database with realistic "The Phoenix" (Insurance/Tech) data.
 *
 * Usage: npm run seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ================================================================
// Configuration
// ================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure .env.local exists with valid credentials.');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ================================================================
// Helper: slugify (mirrors DB function)
// ================================================================
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-') // keep Hebrew chars
    .replace(/^-|-$/g, '');
}

// Helper: pick random items from array
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ================================================================
// 1. SKILLS DATA (50+ skills)
// ================================================================

interface SkillSeed {
  name: string;
  category: string;
  skill_type: string;
  description?: string;
}

const SKILLS: SkillSeed[] = [
  // ---- Tech ----
  { name: 'React', category: 'Frontend', skill_type: 'technical', description: 'React.js library for building user interfaces' },
  { name: 'Next.js', category: 'Frontend', skill_type: 'technical', description: 'React framework for production-grade applications' },
  { name: 'TypeScript', category: 'Frontend', skill_type: 'technical', description: 'Typed superset of JavaScript' },
  { name: 'Node.js', category: 'Backend', skill_type: 'technical', description: 'JavaScript runtime for server-side development' },
  { name: 'Python', category: 'Backend', skill_type: 'technical', description: 'General-purpose programming language' },
  { name: 'SQL', category: 'Data', skill_type: 'technical', description: 'Structured Query Language for databases' },
  { name: 'PostgreSQL', category: 'Data', skill_type: 'technical', description: 'Advanced open-source relational database' },
  { name: 'Power BI', category: 'Analytics', skill_type: 'tool', description: 'Business intelligence and data visualization' },
  { name: 'Tableau', category: 'Analytics', skill_type: 'tool', description: 'Interactive data visualization software' },
  { name: 'Docker', category: 'DevOps', skill_type: 'technical', description: 'Container platform for application deployment' },
  { name: 'Kubernetes', category: 'DevOps', skill_type: 'technical', description: 'Container orchestration platform' },
  { name: 'AWS', category: 'Cloud', skill_type: 'technical', description: 'Amazon Web Services cloud platform' },
  { name: 'Azure', category: 'Cloud', skill_type: 'technical', description: 'Microsoft Azure cloud platform' },
  { name: 'Git', category: 'DevOps', skill_type: 'tool', description: 'Version control system' },
  { name: 'CI/CD', category: 'DevOps', skill_type: 'process', description: 'Continuous Integration and Continuous Delivery' },
  { name: 'REST API', category: 'Backend', skill_type: 'technical', description: 'RESTful API design and implementation' },
  { name: 'GraphQL', category: 'Backend', skill_type: 'technical', description: 'Query language for APIs' },
  { name: 'Machine Learning', category: 'AI/ML', skill_type: 'technical', description: 'Building predictive models and AI systems' },
  { name: 'Data Engineering', category: 'Data', skill_type: 'technical', description: 'Building data pipelines and infrastructure' },
  { name: 'Cybersecurity', category: 'Security', skill_type: 'technical', description: 'Information security and threat prevention' },
  { name: 'Tailwind CSS', category: 'Frontend', skill_type: 'technical', description: 'Utility-first CSS framework' },
  { name: 'Figma', category: 'Design', skill_type: 'tool', description: 'Collaborative design tool' },
  { name: 'Jira', category: 'Project Management', skill_type: 'tool', description: 'Agile project management tool' },
  { name: 'Selenium', category: 'QA', skill_type: 'tool', description: 'Automated browser testing framework' },
  { name: 'Java', category: 'Backend', skill_type: 'technical', description: 'Enterprise programming language' },

  // ---- Insurance / Domain ----
  { name: 'חיתום', category: 'ביטוח', skill_type: 'domain', description: 'Underwriting – הערכת סיכונים וקביעת פרמיות' },
  { name: 'ניהול תביעות', category: 'ביטוח', skill_type: 'domain', description: 'Claims Management – טיפול וניהול תביעות ביטוח' },
  { name: 'אקטואריה', category: 'ביטוח', skill_type: 'domain', description: 'Actuarial Science – מודלים סטטיסטיים וניהול סיכונים' },
  { name: 'ניהול סיכונים', category: 'ביטוח', skill_type: 'domain', description: 'Risk Management – זיהוי והפחתת סיכונים ארגוניים' },
  { name: 'ביטוח חיים', category: 'ביטוח', skill_type: 'domain', description: 'Life Insurance – מוצרי ביטוח חיים ופנסיה' },
  { name: 'ביטוח רכב', category: 'ביטוח', skill_type: 'domain', description: 'Auto Insurance – ביטוח רכב וצד שלישי' },
  { name: 'ביטוח בריאות', category: 'ביטוח', skill_type: 'domain', description: 'Health Insurance – ביטוח בריאות ומשלים' },
  { name: 'רגולציה', category: 'ביטוח', skill_type: 'domain', description: 'Regulation & Compliance – עמידה ברגולציה ביטוחית' },
  { name: 'IFRS 17', category: 'פיננסים', skill_type: 'domain', description: 'International Financial Reporting Standard for insurance' },
  { name: 'ניתוח נתונים', category: 'Data', skill_type: 'technical', description: 'Data Analysis – ניתוח נתונים עסקיים' },
  { name: 'Salesforce', category: 'CRM', skill_type: 'tool', description: 'Customer Relationship Management platform' },

  // ---- Soft Skills ----
  { name: 'מנהיגות', category: 'כישורים רכים', skill_type: 'soft', description: 'Leadership – הובלת צוותים ופרויקטים' },
  { name: 'עמידה מול קהל', category: 'כישורים רכים', skill_type: 'soft', description: 'Public Speaking – מצגות והרצאות' },
  { name: 'ניהול זמן', category: 'כישורים רכים', skill_type: 'soft', description: 'Time Management – סדר עדיפויות וניהול משימות' },
  { name: 'עבודת צוות', category: 'כישורים רכים', skill_type: 'soft', description: 'Teamwork – שיתוף פעולה ותקשורת בצוות' },
  { name: 'חשיבה אנליטית', category: 'כישורים רכים', skill_type: 'soft', description: 'Analytical Thinking – פתרון בעיות מורכבות' },
  { name: 'תקשורת בינאישית', category: 'כישורים רכים', skill_type: 'soft', description: 'Interpersonal Communication – יחסים בין אישיים' },
  { name: 'ניהול פרויקטים', category: 'כישורים רכים', skill_type: 'soft', description: 'Project Management – תכנון וביצוע פרויקטים' },
  { name: 'גמישות מחשבתית', category: 'כישורים רכים', skill_type: 'soft', description: 'Adaptability – יכולת הסתגלות לשינויים' },
  { name: 'פתרון בעיות', category: 'כישורים רכים', skill_type: 'soft', description: 'Problem Solving – גישה מערכתית לפתרון בעיות' },
  { name: 'חדשנות', category: 'כישורים רכים', skill_type: 'soft', description: 'Innovation – יצירתיות וחשיבה מחוץ לקופסה' },

  // ---- Certifications / Language ----
  { name: 'English', category: 'שפות', skill_type: 'language', description: 'English language proficiency' },
  { name: 'Hebrew', category: 'שפות', skill_type: 'language', description: 'שליטה בשפה העברית' },
  { name: 'Arabic', category: 'שפות', skill_type: 'language', description: 'ערבית – שפה נוספת' },
  { name: 'PMP', category: 'הסמכות', skill_type: 'certification', description: 'Project Management Professional certification' },
  { name: 'Scrum Master', category: 'הסמכות', skill_type: 'certification', description: 'Certified Scrum Master methodology' },
  { name: 'CISA', category: 'הסמכות', skill_type: 'certification', description: 'Certified Information Systems Auditor' },
];

// ================================================================
// 2. USERS DATA (20 Israeli employees)
// ================================================================

interface UserSeed {
  email: string;
  display_name: string;
  role_title: string;
  headline: string;
  location: string;
  is_manager: boolean;
}

const USERS: UserSeed[] = [
  // Managers (5)
  { email: 'noa.levi@phoenix.co.il', display_name: 'נועה לוי', role_title: 'VP Engineering', headline: 'מובילה טכנולוגיה ואנשים', location: 'תל אביב', is_manager: true },
  { email: 'david.cohen@phoenix.co.il', display_name: 'דוד כהן', role_title: 'ראש אגף תביעות', headline: 'מנהל תביעות עם 15 שנות ניסיון', location: 'חיפה', is_manager: true },
  { email: 'maya.peretz@phoenix.co.il', display_name: 'מאיה פרץ', role_title: 'Chief Data Officer', headline: 'מובילה טרנספורמציה דיגיטלית', location: 'תל אביב', is_manager: true },
  { email: 'avi.mizrahi@phoenix.co.il', display_name: 'אבי מזרחי', role_title: 'ראש מחלקת חיתום', headline: 'חיתום מסחרי ואישי', location: 'נתניה', is_manager: true },
  { email: 'shira.ben-david@phoenix.co.il', display_name: 'שירה בן דוד', role_title: 'מנהלת HR', headline: 'בונה תרבות ארגונית', location: 'תל אביב', is_manager: true },

  // Employees (15)
  { email: 'yonatan.katz@phoenix.co.il', display_name: 'יונתן כץ', role_title: 'Senior Full-Stack Developer', headline: 'React, Node.js, TypeScript enthusiast', location: 'תל אביב', is_manager: false },
  { email: 'tal.sharon@phoenix.co.il', display_name: 'טל שרון', role_title: 'Frontend Developer', headline: 'מפתח React ו-Next.js', location: 'הרצליה', is_manager: false },
  { email: 'rotem.avital@phoenix.co.il', display_name: 'רותם אביטל', role_title: 'Data Analyst', headline: 'הופכת נתונים לתובנות', location: 'תל אביב', is_manager: false },
  { email: 'omer.goldman@phoenix.co.il', display_name: 'עומר גולדמן', role_title: 'DevOps Engineer', headline: 'Cloud infrastructure & CI/CD', location: 'רעננה', is_manager: false },
  { email: 'lior.arad@phoenix.co.il', display_name: 'ליאור ארד', role_title: 'מנתח תביעות', headline: 'ניהול תביעות רכב ובריאות', location: 'חיפה', is_manager: false },
  { email: 'dana.shapira@phoenix.co.il', display_name: 'דנה שפירא', role_title: 'אקטוארית', headline: 'מודלים סטטיסטיים וניתוח סיכונים', location: 'תל אביב', is_manager: false },
  { email: 'eitan.navon@phoenix.co.il', display_name: 'איתן נבון', role_title: 'Backend Developer', headline: 'Node.js & Python developer', location: 'באר שבע', is_manager: false },
  { email: 'hila.weiss@phoenix.co.il', display_name: 'הילה וייס', role_title: 'QA Engineer', headline: 'Automation & manual testing', location: 'תל אביב', is_manager: false },
  { email: 'amir.hadad@phoenix.co.il', display_name: 'אמיר חדד', role_title: 'חיתם בכיר', headline: 'חיתום מסחרי עם 10 שנות ניסיון', location: 'נתניה', is_manager: false },
  { email: 'michal.oz@phoenix.co.il', display_name: 'מיכל עוז', role_title: 'Product Manager', headline: 'בין טכנולוגיה לעסק', location: 'הרצליה', is_manager: false },
  { email: 'itay.peled@phoenix.co.il', display_name: 'איתי פלד', role_title: 'ML Engineer', headline: 'Machine Learning & NLP', location: 'תל אביב', is_manager: false },
  { email: 'sapir.levy@phoenix.co.il', display_name: 'ספיר לוי', role_title: 'UX/UI Designer', headline: 'עיצוב חוויית משתמש', location: 'תל אביב', is_manager: false },
  { email: 'oren.bar@phoenix.co.il', display_name: 'אורן בר', role_title: 'Security Engineer', headline: 'אבטחת מידע וסייבר', location: 'רמת גן', is_manager: false },
  { email: 'neta.regev@phoenix.co.il', display_name: 'נטע רגב', role_title: 'Business Analyst', headline: 'גשר בין ביטוח לטכנולוגיה', location: 'תל אביב', is_manager: false },
  { email: 'gal.zohar@phoenix.co.il', display_name: 'גל זוהר', role_title: 'Junior Developer', headline: 'בתחילת דרכי בפיתוח', location: 'ראשון לציון', is_manager: false },
];

// ================================================================
// 3. USER → SKILL assignments
//    Each user gets a curated set of skills with realistic levels
// ================================================================

// Map of user email → array of [skill_name, level]
const USER_SKILLS: Record<string, Array<[string, number]>> = {
  // Managers (broader, higher-level skills)
  'noa.levi@phoenix.co.il': [
    ['React', 5], ['TypeScript', 5], ['Node.js', 4], ['מנהיגות', 5], ['ניהול פרויקטים', 5],
    ['Git', 4], ['AWS', 3], ['עבודת צוות', 5], ['עמידה מול קהל', 5], ['English', 5],
  ],
  'david.cohen@phoenix.co.il': [
    ['ניהול תביעות', 5], ['ביטוח רכב', 5], ['ביטוח בריאות', 4], ['מנהיגות', 5],
    ['ניהול סיכונים', 4], ['רגולציה', 4], ['ניהול פרויקטים', 4], ['עמידה מול קהל', 4],
    ['SQL', 3], ['Power BI', 3],
  ],
  'maya.peretz@phoenix.co.il': [
    ['Python', 5], ['SQL', 5], ['Machine Learning', 4], ['Power BI', 5], ['Data Engineering', 4],
    ['ניתוח נתונים', 5], ['מנהיגות', 4], ['עמידה מול קהל', 4], ['חשיבה אנליטית', 5], ['English', 4],
  ],
  'avi.mizrahi@phoenix.co.il': [
    ['חיתום', 5], ['ביטוח חיים', 5], ['ניהול סיכונים', 5], ['אקטואריה', 3],
    ['מנהיגות', 4], ['רגולציה', 4], ['IFRS 17', 3], ['ניהול זמן', 4], ['Hebrew', 5], ['English', 3],
  ],
  'shira.ben-david@phoenix.co.il': [
    ['מנהיגות', 5], ['תקשורת בינאישית', 5], ['עמידה מול קהל', 5], ['ניהול פרויקטים', 4],
    ['גמישות מחשבתית', 4], ['חדשנות', 4], ['Jira', 3], ['English', 4], ['Hebrew', 5], ['ניהול זמן', 5],
  ],

  // Senior Developers (Experts in specific tech stacks)
  'yonatan.katz@phoenix.co.il': [
    ['React', 5], ['TypeScript', 5], ['Next.js', 5], ['Node.js', 4], ['Tailwind CSS', 5],
    ['GraphQL', 4], ['PostgreSQL', 4], ['Git', 5], ['Docker', 3], ['REST API', 4],
    ['English', 4], ['עבודת צוות', 4],
  ],
  'tal.sharon@phoenix.co.il': [
    ['React', 4], ['TypeScript', 4], ['Next.js', 3], ['Tailwind CSS', 4], ['Figma', 3],
    ['Git', 4], ['REST API', 3], ['English', 3], ['עבודת צוות', 4], ['חדשנות', 3],
  ],
  'rotem.avital@phoenix.co.il': [
    ['SQL', 5], ['Python', 4], ['Power BI', 5], ['Tableau', 4], ['ניתוח נתונים', 5],
    ['Data Engineering', 3], ['חשיבה אנליטית', 5], ['English', 3], ['ניהול תביעות', 2], ['IFRS 17', 2],
  ],
  'omer.goldman@phoenix.co.il': [
    ['Docker', 5], ['Kubernetes', 5], ['AWS', 5], ['Azure', 3], ['CI/CD', 5],
    ['Git', 5], ['Python', 3], ['Cybersecurity', 3], ['Node.js', 2], ['English', 4],
  ],

  // Insurance domain experts
  'lior.arad@phoenix.co.il': [
    ['ניהול תביעות', 4], ['ביטוח רכב', 4], ['ביטוח בריאות', 3], ['ניהול סיכונים', 3],
    ['רגולציה', 3], ['SQL', 2], ['Power BI', 2], ['חשיבה אנליטית', 4], ['עבודת צוות', 4], ['Hebrew', 5],
  ],
  'dana.shapira@phoenix.co.il': [
    ['אקטואריה', 5], ['ניהול סיכונים', 4], ['Python', 4], ['SQL', 4], ['IFRS 17', 4],
    ['ביטוח חיים', 4], ['חשיבה אנליטית', 5], ['ניתוח נתונים', 4], ['English', 4], ['עמידה מול קהל', 3],
  ],
  'amir.hadad@phoenix.co.il': [
    ['חיתום', 5], ['ביטוח רכב', 5], ['ביטוח חיים', 4], ['ניהול סיכונים', 4],
    ['רגולציה', 5], ['Salesforce', 3], ['מנהיגות', 3], ['ניהול זמן', 4], ['Hebrew', 5], ['English', 2],
  ],

  // Tech specialists
  'eitan.navon@phoenix.co.il': [
    ['Node.js', 5], ['Python', 5], ['PostgreSQL', 5], ['REST API', 5], ['Docker', 3],
    ['TypeScript', 3], ['SQL', 4], ['Git', 4], ['CI/CD', 3], ['English', 3],
  ],
  'hila.weiss@phoenix.co.il': [
    ['Selenium', 5], ['TypeScript', 3], ['Python', 3], ['Jira', 4], ['Git', 3],
    ['REST API', 3], ['SQL', 2], ['ניהול זמן', 4], ['חשיבה אנליטית', 4], ['עבודת צוות', 5],
  ],
  'michal.oz@phoenix.co.il': [
    ['ניהול פרויקטים', 5], ['Jira', 5], ['Figma', 4], ['חדשנות', 5], ['מנהיגות', 3],
    ['עמידה מול קהל', 4], ['ניתוח נתונים', 3], ['Scrum Master', 4], ['English', 4], ['גמישות מחשבתית', 4],
  ],
  'itay.peled@phoenix.co.il': [
    ['Machine Learning', 5], ['Python', 5], ['SQL', 4], ['Data Engineering', 4], ['Docker', 3],
    ['AWS', 3], ['ניתוח נתונים', 4], ['חשיבה אנליטית', 5], ['Git', 4], ['English', 5],
  ],
  'sapir.levy@phoenix.co.il': [
    ['Figma', 5], ['Tailwind CSS', 4], ['React', 3], ['חדשנות', 5], ['עבודת צוות', 4],
    ['תקשורת בינאישית', 5], ['English', 3], ['Hebrew', 5], ['ניהול זמן', 3], ['גמישות מחשבתית', 4],
  ],
  'oren.bar@phoenix.co.il': [
    ['Cybersecurity', 5], ['AWS', 4], ['Docker', 4], ['Kubernetes', 3], ['Python', 3],
    ['CISA', 4], ['ניהול סיכונים', 3], ['English', 4], ['חשיבה אנליטית', 4], ['Git', 4],
  ],
  'neta.regev@phoenix.co.il': [
    ['ניתוח נתונים', 4], ['SQL', 3], ['Power BI', 4], ['ניהול תביעות', 3], ['חיתום', 2],
    ['רגולציה', 3], ['ניהול פרויקטים', 3], ['English', 3], ['חשיבה אנליטית', 4], ['Salesforce', 3],
  ],

  // Junior
  'gal.zohar@phoenix.co.il': [
    ['React', 2], ['TypeScript', 2], ['Git', 2], ['Tailwind CSS', 2], ['Node.js', 1],
    ['SQL', 1], ['English', 3], ['עבודת צוות', 3], ['חדשנות', 3], ['גמישות מחשבתית', 3],
  ],
};

// ================================================================
// 4. JOBS DATA (10 jobs)
// ================================================================

interface JobSeed {
  code: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  level_band: string;
  status: string;
  xp_reward: number;
  coin_reward: number;
  referral_bonus_coins: number;
  skills: Array<{ name: string; level: number; is_mandatory: boolean }>;
}

const JOBS: JobSeed[] = [
  {
    code: 'JOB-001',
    title: 'ראש צוות פיתוח Frontend',
    description: 'ניהול צוות פיתוח Frontend, הובלת ארכיטקטורה ופיתוח בטכנולוגיות React ו-Next.js. כולל mentoring למפתחים צעירים.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Senior',
    status: 'published',
    xp_reward: 1000,
    coin_reward: 200,
    referral_bonus_coins: 500,
    skills: [
      { name: 'React', level: 5, is_mandatory: true },
      { name: 'TypeScript', level: 4, is_mandatory: true },
      { name: 'Next.js', level: 4, is_mandatory: true },
      { name: 'מנהיגות', level: 3, is_mandatory: true },
      { name: 'Git', level: 4, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-002',
    title: 'אנליסט תביעות בכיר',
    description: 'ניתוח וטיפול בתביעות ביטוח מורכבות, עבודה מול גורמים פנימיים וחיצוניים, ושיפור תהליכים.',
    location: 'חיפה',
    job_type: 'full_time',
    level_band: 'Senior',
    status: 'published',
    xp_reward: 800,
    coin_reward: 150,
    referral_bonus_coins: 300,
    skills: [
      { name: 'ניהול תביעות', level: 4, is_mandatory: true },
      { name: 'ביטוח רכב', level: 3, is_mandatory: true },
      { name: 'ביטוח בריאות', level: 3, is_mandatory: false },
      { name: 'ניהול סיכונים', level: 3, is_mandatory: true },
      { name: 'SQL', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-003',
    title: 'Data Scientist',
    description: 'בנייה ותחזוקה של מודלים סטטיסטיים לחיזוי סיכונים ותמחור. עבודה צמודה עם צוות האקטואריה.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Mid-Senior',
    status: 'published',
    xp_reward: 900,
    coin_reward: 180,
    referral_bonus_coins: 400,
    skills: [
      { name: 'Python', level: 4, is_mandatory: true },
      { name: 'Machine Learning', level: 4, is_mandatory: true },
      { name: 'SQL', level: 3, is_mandatory: true },
      { name: 'ניתוח נתונים', level: 4, is_mandatory: true },
      { name: 'אקטואריה', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-004',
    title: 'מפתח Backend בכיר',
    description: 'פיתוח ותחזוקה של מערכות Backend בארכיטקטורת Microservices. עבודה עם Node.js, PostgreSQL, ו-Docker.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Senior',
    status: 'published',
    xp_reward: 850,
    coin_reward: 170,
    referral_bonus_coins: 350,
    skills: [
      { name: 'Node.js', level: 4, is_mandatory: true },
      { name: 'PostgreSQL', level: 4, is_mandatory: true },
      { name: 'TypeScript', level: 3, is_mandatory: true },
      { name: 'Docker', level: 3, is_mandatory: true },
      { name: 'REST API', level: 4, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-005',
    title: 'חיתם מסחרי',
    description: 'ביצוע חיתום לפוליסות מסחריות, הערכת סיכונים, ועמידה מול מבוטחים וסוכנים.',
    location: 'נתניה',
    job_type: 'full_time',
    level_band: 'Mid',
    status: 'published',
    xp_reward: 700,
    coin_reward: 130,
    referral_bonus_coins: 250,
    skills: [
      { name: 'חיתום', level: 3, is_mandatory: true },
      { name: 'ניהול סיכונים', level: 3, is_mandatory: true },
      { name: 'ביטוח חיים', level: 2, is_mandatory: false },
      { name: 'רגולציה', level: 2, is_mandatory: true },
      { name: 'English', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-006',
    title: 'DevOps Engineer',
    description: 'ניהול תשתיות ענן, אוטומציה של pipelines, ושיפור תהליכי CI/CD.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Mid-Senior',
    status: 'published',
    xp_reward: 850,
    coin_reward: 160,
    referral_bonus_coins: 350,
    skills: [
      { name: 'Docker', level: 4, is_mandatory: true },
      { name: 'Kubernetes', level: 3, is_mandatory: true },
      { name: 'AWS', level: 4, is_mandatory: true },
      { name: 'CI/CD', level: 4, is_mandatory: true },
      { name: 'Python', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-007',
    title: 'Product Manager – דיגיטל',
    description: 'הובלת מוצרים דיגיטליים חדשניים עבור לקוחות הביטוח. עבודה חוצה ארגון.',
    location: 'הרצליה',
    job_type: 'full_time',
    level_band: 'Senior',
    status: 'published',
    xp_reward: 800,
    coin_reward: 150,
    referral_bonus_coins: 300,
    skills: [
      { name: 'ניהול פרויקטים', level: 4, is_mandatory: true },
      { name: 'חדשנות', level: 4, is_mandatory: true },
      { name: 'ניתוח נתונים', level: 3, is_mandatory: true },
      { name: 'Figma', level: 3, is_mandatory: false },
      { name: 'מנהיגות', level: 3, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-008',
    title: 'Junior Frontend Developer',
    description: 'הצטרפות לצוות פיתוח Frontend. עבודה עם React, TypeScript, ו-Tailwind CSS.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Junior',
    status: 'published',
    xp_reward: 500,
    coin_reward: 100,
    referral_bonus_coins: 200,
    skills: [
      { name: 'React', level: 2, is_mandatory: true },
      { name: 'TypeScript', level: 2, is_mandatory: true },
      { name: 'Git', level: 2, is_mandatory: true },
      { name: 'Tailwind CSS', level: 1, is_mandatory: false },
      { name: 'English', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'JOB-009',
    title: 'Security Analyst',
    description: 'ניטור אבטחת מידע, תחקור אירועים, ויישום מדיניות אבטחה.',
    location: 'רמת גן',
    job_type: 'full_time',
    level_band: 'Mid',
    status: 'published',
    xp_reward: 750,
    coin_reward: 140,
    referral_bonus_coins: 300,
    skills: [
      { name: 'Cybersecurity', level: 3, is_mandatory: true },
      { name: 'AWS', level: 2, is_mandatory: false },
      { name: 'Python', level: 2, is_mandatory: false },
      { name: 'CISA', level: 2, is_mandatory: true },
      { name: 'חשיבה אנליטית', level: 3, is_mandatory: true },
    ],
  },
  {
    code: 'JOB-010',
    title: 'BI Analyst',
    description: 'יצירה ותחזוקה של דשבורדים עסקיים, ניתוח נתונים, ותמיכה בהנהלה.',
    location: 'תל אביב',
    job_type: 'full_time',
    level_band: 'Mid',
    status: 'published',
    xp_reward: 600,
    coin_reward: 120,
    referral_bonus_coins: 200,
    skills: [
      { name: 'Power BI', level: 4, is_mandatory: true },
      { name: 'SQL', level: 3, is_mandatory: true },
      { name: 'ניתוח נתונים', level: 3, is_mandatory: true },
      { name: 'Tableau', level: 2, is_mandatory: false },
      { name: 'English', level: 2, is_mandatory: false },
    ],
  },
];

// ================================================================
// 5. GIGS DATA (10 gigs)
// ================================================================

interface GigSeed {
  code: string;
  title: string;
  description: string;
  location: string;
  status: string;
  commitment_hours_per_week: number;
  xp_reward: number;
  coin_reward: number;
  start_date: string;
  end_date: string;
  skills: Array<{ name: string; level: number; is_mandatory: boolean }>;
}

const GIGS: GigSeed[] = [
  {
    code: 'GIG-001',
    title: 'עזרה בפרויקט דאטה – ניקוי נתונים',
    description: 'צוות הדאטה צריך עזרה בניקוי וארגון מאגר נתוני תביעות. Python ו-SQL נדרשים.',
    location: 'תל אביב',
    status: 'open',
    commitment_hours_per_week: 5,
    xp_reward: 500,
    coin_reward: 75,
    start_date: '2026-02-15',
    end_date: '2026-03-15',
    skills: [
      { name: 'Python', level: 2, is_mandatory: true },
      { name: 'SQL', level: 2, is_mandatory: true },
    ],
  },
  {
    code: 'GIG-002',
    title: 'ארגון האקאתון פנים-ארגוני',
    description: 'עזרה בתכנון וארגון האקאתון חדשנות השנתי של פניקס. דורש כישורי ניהול פרויקט.',
    location: 'תל אביב',
    status: 'open',
    commitment_hours_per_week: 8,
    xp_reward: 800,
    coin_reward: 150,
    start_date: '2026-03-01',
    end_date: '2026-03-20',
    skills: [
      { name: 'ניהול פרויקטים', level: 2, is_mandatory: true },
      { name: 'חדשנות', level: 3, is_mandatory: true },
      { name: 'עמידה מול קהל', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'GIG-003',
    title: 'סדנת React למתחילים',
    description: 'העברת סדנת React בסיסית לעובדים מחטיבת הביטוח. 3 מפגשים של שעתיים.',
    location: 'תל אביב',
    status: 'open',
    commitment_hours_per_week: 6,
    xp_reward: 600,
    coin_reward: 100,
    start_date: '2026-02-20',
    end_date: '2026-03-10',
    skills: [
      { name: 'React', level: 4, is_mandatory: true },
      { name: 'עמידה מול קהל', level: 3, is_mandatory: true },
    ],
  },
  {
    code: 'GIG-004',
    title: 'בדיקת חדירה – אפליקציית מובייל',
    description: 'ביצוע בדיקת חדירה לאפליקציית המובייל החדשה. דורש רקע באבטחת מידע.',
    location: 'רמת גן',
    status: 'open',
    commitment_hours_per_week: 10,
    xp_reward: 900,
    coin_reward: 180,
    start_date: '2026-02-10',
    end_date: '2026-02-28',
    skills: [
      { name: 'Cybersecurity', level: 4, is_mandatory: true },
      { name: 'Python', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'GIG-005',
    title: 'עיצוב UI למערכת פנימית',
    description: 'עיצוב ממשק משתמש למערכת ניהול תביעות חדשה. עבודה עם Figma.',
    location: 'הרצליה',
    status: 'open',
    commitment_hours_per_week: 6,
    xp_reward: 500,
    coin_reward: 80,
    start_date: '2026-02-15',
    end_date: '2026-03-15',
    skills: [
      { name: 'Figma', level: 3, is_mandatory: true },
      { name: 'Tailwind CSS', level: 2, is_mandatory: false },
    ],
  },
  {
    code: 'GIG-006',
    title: 'כתיבת תיעוד API',
    description: 'כתיבת תיעוד טכני ל-REST API של מערכת ליבת הביטוח.',
    location: 'תל אביב',
    status: 'open',
    commitment_hours_per_week: 4,
    xp_reward: 400,
    coin_reward: 60,
    start_date: '2026-02-12',
    end_date: '2026-03-01',
    skills: [
      { name: 'REST API', level: 3, is_mandatory: true },
      { name: 'English', level: 3, is_mandatory: true },
    ],
  },
  {
    code: 'GIG-007',
    title: 'ליווי תהליך IFRS 17',
    description: 'עזרה בהתאמת דוחות כספיים לתקן IFRS 17. דורש רקע אקטוארי.',
    location: 'תל אביב',
    status: 'open',
    commitment_hours_per_week: 8,
    xp_reward: 700,
    coin_reward: 120,
    start_date: '2026-02-20',
    end_date: '2026-04-30',
    skills: [
      { name: 'IFRS 17', level: 3, is_mandatory: true },
      { name: 'אקטואריה', level: 3, is_mandatory: true },
    ],
  },
  {
    code: 'GIG-008',
    title: 'Mentoring מפתחים ג׳וניור',
    description: 'ליווי 2-3 מפתחים חדשים. מפגש שבועי + Code Review.',
    location: 'Remote',
    status: 'open',
    commitment_hours_per_week: 3,
    xp_reward: 600,
    coin_reward: 90,
    start_date: '2026-02-10',
    end_date: '2026-05-10',
    skills: [
      { name: 'TypeScript', level: 4, is_mandatory: true },
      { name: 'React', level: 4, is_mandatory: false },
      { name: 'מנהיגות', level: 3, is_mandatory: true },
    ],
  },
  {
    code: 'GIG-009',
    title: 'בניית דשבורד BI – מנהלים',
    description: 'יצירת דשבורד Power BI עבור הנהלת אגף התביעות.',
    location: 'חיפה',
    status: 'open',
    commitment_hours_per_week: 6,
    xp_reward: 550,
    coin_reward: 85,
    start_date: '2026-03-01',
    end_date: '2026-03-31',
    skills: [
      { name: 'Power BI', level: 4, is_mandatory: true },
      { name: 'SQL', level: 3, is_mandatory: true },
      { name: 'ניתוח נתונים', level: 3, is_mandatory: false },
    ],
  },
  {
    code: 'GIG-010',
    title: 'סקירת קוד – מעבר ל-TypeScript',
    description: 'עזרה בהמרת קוד JavaScript ל-TypeScript במערכת Legacy.',
    location: 'Remote',
    status: 'open',
    commitment_hours_per_week: 5,
    xp_reward: 450,
    coin_reward: 70,
    start_date: '2026-02-15',
    end_date: '2026-03-31',
    skills: [
      { name: 'TypeScript', level: 4, is_mandatory: true },
      { name: 'Node.js', level: 3, is_mandatory: false },
    ],
  },
];

// ================================================================
// 6. BADGES DATA
// ================================================================

interface BadgeSeed {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xp_bonus: number;
  coin_bonus: number;
}

const BADGES: BadgeSeed[] = [
  { slug: 'fast-learner', name: 'Fast Learner', description: 'השלמת 3 קורסים בשבוע אחד', icon: '⚡', rarity: 'uncommon', xp_bonus: 100, coin_bonus: 25 },
  { slug: 'first-steps', name: 'First Steps', description: 'השלמת תהליך ה-Onboarding', icon: '👣', rarity: 'common', xp_bonus: 50, coin_bonus: 10 },
  { slug: 'team-player', name: 'Team Player', description: 'קיבלת 5 Endorsements מעמיתים', icon: '🤝', rarity: 'uncommon', xp_bonus: 100, coin_bonus: 30 },
  { slug: 'gig-master', name: 'Gig Master', description: 'השלמת 10 גיגים בהצלחה', icon: '🎯', rarity: 'rare', xp_bonus: 200, coin_bonus: 50 },
  { slug: 'mentor-phoenix', name: 'Mentor Phoenix', description: 'ליוויתי 3 עובדים חדשים', icon: '🔥', rarity: 'rare', xp_bonus: 250, coin_bonus: 75 },
  { slug: 'innovation-spark', name: 'Innovation Spark', description: 'הצגת רעיון באקאתון', icon: '💡', rarity: 'uncommon', xp_bonus: 150, coin_bonus: 40 },
  { slug: 'data-wizard', name: 'Data Wizard', description: 'יצרת 5 דשבורדים מוצלחים', icon: '📊', rarity: 'rare', xp_bonus: 200, coin_bonus: 50 },
  { slug: 'security-shield', name: 'Security Shield', description: 'זיהית 3 פרצות אבטחה', icon: '🛡️', rarity: 'epic', xp_bonus: 300, coin_bonus: 100 },
  { slug: 'phoenix-legend', name: 'Phoenix Legend', description: 'הגעת לרמה 10', icon: '🏆', rarity: 'legendary', xp_bonus: 500, coin_bonus: 200 },
  { slug: 'skill-collector', name: 'Skill Collector', description: 'רכשת 10 כישורות שונים', icon: '🎒', rarity: 'common', xp_bonus: 75, coin_bonus: 20 },
];

// ================================================================
// 7. ORG UNITS DATA
// ================================================================

interface OrgUnitSeed {
  code: string;
  name: string;
  unit_type: string;
  parent_code?: string;
}

const ORG_UNITS: OrgUnitSeed[] = [
  { code: 'PHX', name: 'The Phoenix – הפניקס', unit_type: 'company' },
  { code: 'PHX-TECH', name: 'חטיבת טכנולוגיה', unit_type: 'division', parent_code: 'PHX' },
  { code: 'PHX-INS', name: 'חטיבת ביטוח', unit_type: 'division', parent_code: 'PHX' },
  { code: 'PHX-HR', name: 'משאבי אנוש', unit_type: 'department', parent_code: 'PHX' },
  { code: 'PHX-TECH-FE', name: 'צוות Frontend', unit_type: 'team', parent_code: 'PHX-TECH' },
  { code: 'PHX-TECH-BE', name: 'צוות Backend', unit_type: 'team', parent_code: 'PHX-TECH' },
  { code: 'PHX-TECH-DATA', name: 'צוות Data & AI', unit_type: 'team', parent_code: 'PHX-TECH' },
  { code: 'PHX-TECH-DEVOPS', name: 'צוות DevOps', unit_type: 'team', parent_code: 'PHX-TECH' },
  { code: 'PHX-TECH-SEC', name: 'צוות אבטחת מידע', unit_type: 'team', parent_code: 'PHX-TECH' },
  { code: 'PHX-INS-CLAIMS', name: 'אגף תביעות', unit_type: 'department', parent_code: 'PHX-INS' },
  { code: 'PHX-INS-UW', name: 'אגף חיתום', unit_type: 'department', parent_code: 'PHX-INS' },
  { code: 'PHX-INS-ACT', name: 'אגף אקטואריה', unit_type: 'department', parent_code: 'PHX-INS' },
];

// User → org unit mapping
const USER_ORG_MAP: Record<string, string> = {
  'noa.levi@phoenix.co.il': 'PHX-TECH',
  'david.cohen@phoenix.co.il': 'PHX-INS-CLAIMS',
  'maya.peretz@phoenix.co.il': 'PHX-TECH-DATA',
  'avi.mizrahi@phoenix.co.il': 'PHX-INS-UW',
  'shira.ben-david@phoenix.co.il': 'PHX-HR',
  'yonatan.katz@phoenix.co.il': 'PHX-TECH-FE',
  'tal.sharon@phoenix.co.il': 'PHX-TECH-FE',
  'rotem.avital@phoenix.co.il': 'PHX-TECH-DATA',
  'omer.goldman@phoenix.co.il': 'PHX-TECH-DEVOPS',
  'lior.arad@phoenix.co.il': 'PHX-INS-CLAIMS',
  'dana.shapira@phoenix.co.il': 'PHX-INS-ACT',
  'eitan.navon@phoenix.co.il': 'PHX-TECH-BE',
  'hila.weiss@phoenix.co.il': 'PHX-TECH-FE',
  'amir.hadad@phoenix.co.il': 'PHX-INS-UW',
  'michal.oz@phoenix.co.il': 'PHX-TECH',
  'itay.peled@phoenix.co.il': 'PHX-TECH-DATA',
  'sapir.levy@phoenix.co.il': 'PHX-TECH-FE',
  'oren.bar@phoenix.co.il': 'PHX-TECH-SEC',
  'neta.regev@phoenix.co.il': 'PHX-INS-CLAIMS',
  'gal.zohar@phoenix.co.il': 'PHX-TECH-FE',
};

// ================================================================
// SEEDING FUNCTIONS
// ================================================================

// Keep references for later linking
const skillIdMap = new Map<string, string>(); // skill name → uuid
const userIdMap = new Map<string, string>();   // email → uuid
const orgUnitIdMap = new Map<string, string>(); // code → uuid
const badgeIdMap = new Map<string, string>();   // slug → uuid

async function cleanDatabase() {
  console.log('🧹 Cleaning existing seed data...');

  // Delete in reverse-dependency order
  const tables = [
    'xp_transactions',
    'feed_events',
    'job_applications',
    'gig_participants',
    'user_badges',
    'skill_endorsements',
    'user_skills',
    'gig_skills',
    'job_skills',
    'gigs',
    'jobs',
    'skill_relations',
    'skill_aliases',
    'skills',
    'badges',
    'org_memberships',
    'user_roles',
    // Don't delete roles or level_definitions (seeded by schema.sql)
  ];

  // Tables with composite PKs (no 'id' column) need a different delete strategy.
  // Map table → a column that always exists and can be used for "delete all".
  const deleteColumn: Record<string, string> = {
    user_badges: 'awarded_at',
    user_skills: 'created_at',
    job_skills: 'created_at',
    gig_skills: 'created_at',
  };

  for (const table of tables) {
    const col = deleteColumn[table];
    if (col) {
      // Composite-PK table: use a known timestamp column to match all rows
      const { error } = await supabase.from(table).delete().gte(col, '1970-01-01');
      if (error) {
        console.warn(`  ⚠️  Could not clean ${table}: ${error.message}`);
      }
    } else {
      // Standard table with 'id' UUID column
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn(`  ⚠️  Could not clean ${table}: ${error.message}`);
      }
    }
  }

  // Clean users (they reference auth.users, so we need to handle carefully)
  // We'll only delete users we created (by known emails)
  for (const user of USERS) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existingUser) {
      // Delete from auth.users will cascade to public.users
      await supabase.auth.admin.deleteUser(existingUser.id);
    }
  }

  // Clean org_units (delete children first via status)
  const { error: orgError } = await supabase
    .from('org_units')
    .delete()
    .in('code', ORG_UNITS.map(o => o.code));
  if (orgError) {
    console.warn(`  ⚠️  Could not clean org_units: ${orgError.message}`);
  }

  console.log('  ✅ Database cleaned.\n');
}

async function seedOrgUnits() {
  console.log('🏢 Seeding Org Units...');

  // Insert parents first (no parent_code), then children
  const roots = ORG_UNITS.filter(o => !o.parent_code);
  const children = ORG_UNITS.filter(o => o.parent_code);

  for (const unit of roots) {
    const { data, error } = await supabase
      .from('org_units')
      .upsert({
        code: unit.code,
        name: unit.name,
        unit_type: unit.unit_type,
        status: 'active',
      }, { onConflict: 'code' })
      .select('id, code')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert org unit ${unit.code}: ${error.message}`);
    } else if (data) {
      orgUnitIdMap.set(data.code, data.id);
    }
  }

  for (const unit of children) {
    const parentId = orgUnitIdMap.get(unit.parent_code!);
    const { data, error } = await supabase
      .from('org_units')
      .upsert({
        code: unit.code,
        name: unit.name,
        unit_type: unit.unit_type,
        parent_org_unit_id: parentId || null,
        status: 'active',
      }, { onConflict: 'code' })
      .select('id, code')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert org unit ${unit.code}: ${error.message}`);
    } else if (data) {
      orgUnitIdMap.set(data.code, data.id);
    }
  }

  console.log(`  ✅ ${orgUnitIdMap.size} org units seeded.\n`);
}

async function seedSkills() {
  console.log('🧠 Seeding Skills Taxonomy...');

  for (const skill of SKILLS) {
    const slug = slugify(skill.name);
    const { data, error } = await supabase
      .from('skills')
      .upsert({
        slug,
        name: skill.name,
        category: skill.category,
        description: skill.description || null,
        skill_type: skill.skill_type,
        status: 'active',
        is_verified: true,
        source: 'admin',
      }, { onConflict: 'slug' })
      .select('id, name')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert skill "${skill.name}": ${error.message}`);
    } else if (data) {
      skillIdMap.set(data.name, data.id);
    }
  }

  console.log(`  ✅ ${skillIdMap.size} skills seeded.\n`);
}

async function seedBadges() {
  console.log('🏅 Seeding Badges...');

  for (const badge of BADGES) {
    const { data, error } = await supabase
      .from('badges')
      .upsert({
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        status: 'active',
        xp_bonus: badge.xp_bonus,
        coin_bonus: badge.coin_bonus,
      }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert badge "${badge.name}": ${error.message}`);
    } else if (data) {
      badgeIdMap.set(data.slug, data.id);
    }
  }

  console.log(`  ✅ ${badgeIdMap.size} badges seeded.\n`);
}

async function seedUsers() {
  console.log('👥 Seeding Users...');

  // Get admin role id
  const { data: adminRole } = await supabase
    .from('roles')
    .select('id')
    .eq('code', 'admin')
    .single();

  for (const user of USERS) {
    // Create auth user (this triggers the handle_new_auth_user function)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'Phoenix2026!', // Demo password
      email_confirm: true,
      user_metadata: { full_name: user.display_name },
    });

    if (authError) {
      console.error(`  ❌ Failed to create auth user ${user.email}: ${authError.message}`);
      continue;
    }

    const userId = authData.user.id;
    userIdMap.set(user.email, userId);

    // Update the public.users profile
    const { error: profileError } = await supabase
      .from('users')
      .update({
        email: user.email,
        display_name: user.display_name,
        role_title: user.role_title,
        headline: user.headline,
        location: user.location,
        is_active: true,
        avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.display_name)}&backgroundColor=f97316`,
        hire_date: `${2020 + randomBetween(0, 5)}-${String(randomBetween(1, 12)).padStart(2, '0')}-${String(randomBetween(1, 28)).padStart(2, '0')}`,
        avatar_config: {
          evolution_stage: randomBetween(1, 3),
          mood: 'happy',
          accessories: [],
          color_scheme: 'phoenix_red',
        },
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`  ❌ Failed to update profile for ${user.email}: ${profileError.message}`);
    }

    // Assign admin role to the first manager (noa.levi)
    if (user.email === 'noa.levi@phoenix.co.il' && adminRole) {
      await supabase.from('user_roles').upsert({
        user_id: userId,
        role_id: adminRole.id,
        assigned_by: userId,
      }, { onConflict: 'user_id,role_id' });
    }
  }

  // Set manager relationships (managers report to first manager, employees report to relevant managers)
  const noaId = userIdMap.get('noa.levi@phoenix.co.il');
  const davidId = userIdMap.get('david.cohen@phoenix.co.il');
  const aviId = userIdMap.get('avi.mizrahi@phoenix.co.il');

  const managerMap: Record<string, string | undefined> = {
    'david.cohen@phoenix.co.il': noaId,
    'maya.peretz@phoenix.co.il': noaId,
    'avi.mizrahi@phoenix.co.il': noaId,
    'shira.ben-david@phoenix.co.il': noaId,
    // Tech employees → noa
    'yonatan.katz@phoenix.co.il': noaId,
    'tal.sharon@phoenix.co.il': noaId,
    'eitan.navon@phoenix.co.il': noaId,
    'omer.goldman@phoenix.co.il': noaId,
    'hila.weiss@phoenix.co.il': noaId,
    'michal.oz@phoenix.co.il': noaId,
    'itay.peled@phoenix.co.il': noaId,
    'sapir.levy@phoenix.co.il': noaId,
    'oren.bar@phoenix.co.il': noaId,
    'gal.zohar@phoenix.co.il': noaId,
    // Insurance employees → david / avi
    'lior.arad@phoenix.co.il': davidId,
    'neta.regev@phoenix.co.il': davidId,
    'dana.shapira@phoenix.co.il': noaId,
    'rotem.avital@phoenix.co.il': noaId,
    'amir.hadad@phoenix.co.il': aviId,
  };

  for (const [email, managerId] of Object.entries(managerMap)) {
    if (managerId) {
      const userId = userIdMap.get(email);
      if (userId) {
        await supabase.from('users').update({ manager_user_id: managerId }).eq('id', userId);
      }
    }
  }

  console.log(`  ✅ ${userIdMap.size} users seeded.\n`);
}

async function seedOrgMemberships() {
  console.log('🔗 Seeding Org Memberships...');
  let count = 0;

  for (const [email, orgCode] of Object.entries(USER_ORG_MAP)) {
    const userId = userIdMap.get(email);
    const orgUnitId = orgUnitIdMap.get(orgCode);

    if (userId && orgUnitId) {
      const { error } = await supabase
        .from('org_memberships')
        .upsert({
          user_id: userId,
          org_unit_id: orgUnitId,
          is_primary: true,
          start_date: '2024-01-01',
        }, { onConflict: 'user_id,org_unit_id' });

      if (error) {
        console.warn(`  ⚠️  Membership ${email} → ${orgCode}: ${error.message}`);
      } else {
        count++;
      }
    }
  }

  console.log(`  ✅ ${count} org memberships seeded.\n`);
}

async function seedUserSkills() {
  console.log('🎯 Seeding User Skills...');
  let count = 0;

  for (const [email, skills] of Object.entries(USER_SKILLS)) {
    const userId = userIdMap.get(email);
    if (!userId) continue;

    for (const [skillName, level] of skills) {
      const skillId = skillIdMap.get(skillName);
      if (!skillId) {
        console.warn(`  ⚠️  Skill not found: "${skillName}" for user ${email}`);
        continue;
      }

      const { error } = await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          skill_level: level,
          skill_xp: level * randomBetween(50, 150),
          endorsement_count: randomBetween(0, level * 2),
          is_verified: level >= 4,
          source: 'admin',
        }, { onConflict: 'user_id,skill_id' });

      if (error) {
        console.warn(`  ⚠️  User skill ${email} → ${skillName}: ${error.message}`);
      } else {
        count++;
      }
    }
  }

  console.log(`  ✅ ${count} user-skills seeded.\n`);
}

async function seedJobs() {
  console.log('💼 Seeding Jobs...');
  const creatorId = userIdMap.get('noa.levi@phoenix.co.il') || null;

  for (const job of JOBS) {
    const orgUnitId = orgUnitIdMap.get('PHX-TECH') || null;

    const { data, error } = await supabase
      .from('jobs')
      .upsert({
        code: job.code,
        title: job.title,
        description: job.description,
        location: job.location,
        job_type: job.job_type,
        level_band: job.level_band,
        status: job.status,
        xp_reward: job.xp_reward,
        coin_reward: job.coin_reward,
        referral_bonus_coins: job.referral_bonus_coins,
        created_by: creatorId,
        org_unit_id: orgUnitId,
      }, { onConflict: 'code' })
      .select('id, code')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert job ${job.code}: ${error.message}`);
      continue;
    }

    if (data) {
      // Insert job_skills
      for (const skill of job.skills) {
        const skillId = skillIdMap.get(skill.name);
        if (!skillId) {
          console.warn(`  ⚠️  Skill not found for job: "${skill.name}"`);
          continue;
        }

        const { error: jsError } = await supabase
          .from('job_skills')
          .upsert({
            job_id: data.id,
            skill_id: skillId,
            required_level: skill.level,
            is_mandatory: skill.is_mandatory,
            weight: skill.is_mandatory ? 0.8 : 0.5,
          }, { onConflict: 'job_id,skill_id' });

        if (jsError) {
          console.warn(`  ⚠️  Job skill ${job.code} → ${skill.name}: ${jsError.message}`);
        }
      }
    }
  }

  console.log(`  ✅ ${JOBS.length} jobs seeded.\n`);
}

async function seedGigs() {
  console.log('⚡ Seeding Gigs...');
  const ownerId = userIdMap.get('noa.levi@phoenix.co.il') || null;

  for (const gig of GIGS) {
    const orgUnitId = orgUnitIdMap.get('PHX-TECH') || null;

    const { data, error } = await supabase
      .from('gigs')
      .upsert({
        code: gig.code,
        title: gig.title,
        description: gig.description,
        location: gig.location,
        status: gig.status,
        start_date: gig.start_date,
        end_date: gig.end_date,
        commitment_hours_per_week: gig.commitment_hours_per_week,
        xp_reward: gig.xp_reward,
        coin_reward: gig.coin_reward,
        owner_user_id: ownerId,
        created_by: ownerId,
        org_unit_id: orgUnitId,
      }, { onConflict: 'code' })
      .select('id, code')
      .single();

    if (error) {
      console.error(`  ❌ Failed to insert gig ${gig.code}: ${error.message}`);
      continue;
    }

    if (data) {
      // Insert gig_skills
      for (const skill of gig.skills) {
        const skillId = skillIdMap.get(skill.name);
        if (!skillId) {
          console.warn(`  ⚠️  Skill not found for gig: "${skill.name}"`);
          continue;
        }

        const { error: gsError } = await supabase
          .from('gig_skills')
          .upsert({
            gig_id: data.id,
            skill_id: skillId,
            required_level: skill.level,
            is_mandatory: skill.is_mandatory,
            weight: skill.is_mandatory ? 0.8 : 0.5,
          }, { onConflict: 'gig_id,skill_id' });

        if (gsError) {
          console.warn(`  ⚠️  Gig skill ${gig.code} → ${skill.name}: ${gsError.message}`);
        }
      }
    }
  }

  console.log(`  ✅ ${GIGS.length} gigs seeded.\n`);
}

async function seedGamification() {
  console.log('🎮 Seeding Gamification (XP, Coins, Badges)...');

  // Award random XP to users via xp_transactions
  // (the trigger will auto-update current_xp, current_level, coins_balance)
  const xpRewards: Array<{ email: string; xp: number; coins: number; label: string }> = [
    { email: 'noa.levi@phoenix.co.il', xp: 2500, coins: 450, label: 'Leadership Contributions' },
    { email: 'david.cohen@phoenix.co.il', xp: 2000, coins: 350, label: 'Claims Excellence' },
    { email: 'maya.peretz@phoenix.co.il', xp: 2200, coins: 400, label: 'Data Innovation' },
    { email: 'yonatan.katz@phoenix.co.il', xp: 1800, coins: 300, label: 'Frontend Excellence' },
    { email: 'omer.goldman@phoenix.co.il', xp: 1500, coins: 250, label: 'Infrastructure Hero' },
    { email: 'dana.shapira@phoenix.co.il', xp: 1200, coins: 200, label: 'Actuarial Analysis' },
    { email: 'eitan.navon@phoenix.co.il', xp: 1400, coins: 230, label: 'Backend Mastery' },
    { email: 'michal.oz@phoenix.co.il', xp: 1300, coins: 220, label: 'Product Vision' },
    { email: 'itay.peled@phoenix.co.il', xp: 1600, coins: 270, label: 'ML Breakthroughs' },
    { email: 'oren.bar@phoenix.co.il', xp: 1100, coins: 180, label: 'Security Champion' },
    { email: 'tal.sharon@phoenix.co.il', xp: 800, coins: 140, label: 'UI Contributions' },
    { email: 'rotem.avital@phoenix.co.il', xp: 900, coins: 160, label: 'Data Insights' },
    { email: 'hila.weiss@phoenix.co.il', xp: 700, coins: 120, label: 'QA Excellence' },
    { email: 'lior.arad@phoenix.co.il', xp: 600, coins: 100, label: 'Claims Processing' },
    { email: 'amir.hadad@phoenix.co.il', xp: 1000, coins: 170, label: 'Underwriting Expert' },
    { email: 'sapir.levy@phoenix.co.il', xp: 750, coins: 130, label: 'Design Impact' },
    { email: 'neta.regev@phoenix.co.il', xp: 550, coins: 90, label: 'Business Analysis' },
    { email: 'avi.mizrahi@phoenix.co.il', xp: 1900, coins: 320, label: 'Underwriting Leadership' },
    { email: 'shira.ben-david@phoenix.co.il', xp: 1700, coins: 280, label: 'Culture Building' },
    { email: 'gal.zohar@phoenix.co.il', xp: 300, coins: 50, label: 'First Steps' },
  ];

  let xpCount = 0;
  for (const reward of xpRewards) {
    const userId = userIdMap.get(reward.email);
    if (!userId) continue;

    const { error } = await supabase.from('xp_transactions').insert({
      user_id: userId,
      source_type: 'admin',
      source_label: reward.label,
      xp_amount: reward.xp,
      coin_amount: reward.coins,
      created_by: userId,
    });

    if (error) {
      console.warn(`  ⚠️  XP award for ${reward.email}: ${error.message}`);
    } else {
      xpCount++;
    }
  }

  console.log(`  ✅ ${xpCount} XP transactions seeded.`);

  // Award badges to select users
  const badgeAwards: Array<{ email: string; badgeSlug: string; reason: string }> = [
    { email: 'noa.levi@phoenix.co.il', badgeSlug: 'mentor-phoenix', reason: 'ליוותה 5 מפתחים חדשים' },
    { email: 'noa.levi@phoenix.co.il', badgeSlug: 'team-player', reason: '20+ endorsements' },
    { email: 'yonatan.katz@phoenix.co.il', badgeSlug: 'fast-learner', reason: 'למד 3 טכנולוגיות בשבוע' },
    { email: 'yonatan.katz@phoenix.co.il', badgeSlug: 'skill-collector', reason: '12 כישורות פעילים' },
    { email: 'omer.goldman@phoenix.co.il', badgeSlug: 'gig-master', reason: 'השלים 10 גיגים' },
    { email: 'dana.shapira@phoenix.co.il', badgeSlug: 'data-wizard', reason: '5 דשבורדים אקטואריים' },
    { email: 'itay.peled@phoenix.co.il', badgeSlug: 'innovation-spark', reason: 'זכה בהאקאתון 2025' },
    { email: 'oren.bar@phoenix.co.il', badgeSlug: 'security-shield', reason: 'זיהה 3 פרצות קריטיות' },
    { email: 'michal.oz@phoenix.co.il', badgeSlug: 'innovation-spark', reason: 'הובילה פרויקט חדשנות' },
    { email: 'gal.zohar@phoenix.co.il', badgeSlug: 'first-steps', reason: 'השלים Onboarding' },
    { email: 'david.cohen@phoenix.co.il', badgeSlug: 'mentor-phoenix', reason: 'ליווה 4 מנתחי תביעות' },
    { email: 'rotem.avital@phoenix.co.il', badgeSlug: 'data-wizard', reason: 'יצרה דשבורד תביעות' },
    { email: 'hila.weiss@phoenix.co.il', badgeSlug: 'team-player', reason: '10+ endorsements' },
    { email: 'maya.peretz@phoenix.co.il', badgeSlug: 'innovation-spark', reason: 'הובילה מהפכת נתונים' },
    { email: 'amir.hadad@phoenix.co.il', badgeSlug: 'skill-collector', reason: '10 כישורות ביטוחיים' },
  ];

  let badgeCount = 0;
  for (const award of badgeAwards) {
    const userId = userIdMap.get(award.email);
    const badgeId = badgeIdMap.get(award.badgeSlug);
    if (!userId || !badgeId) continue;

    const awarderId = userIdMap.get('noa.levi@phoenix.co.il') || userId;

    const { error } = await supabase.from('user_badges').upsert({
      user_id: userId,
      badge_id: badgeId,
      awarded_by: awarderId,
      reason: award.reason,
    }, { onConflict: 'user_id,badge_id' });

    if (error) {
      console.warn(`  ⚠️  Badge ${award.badgeSlug} → ${award.email}: ${error.message}`);
    } else {
      badgeCount++;
    }
  }

  console.log(`  ✅ ${badgeCount} badges awarded.\n`);
}

async function seedEndorsements() {
  console.log('🤝 Seeding Skill Endorsements...');
  let count = 0;

  // Create realistic endorsement patterns
  const endorsements: Array<{ from: string; to: string; skill: string }> = [
    // Tech endorsements
    { from: 'noa.levi@phoenix.co.il', to: 'yonatan.katz@phoenix.co.il', skill: 'React' },
    { from: 'noa.levi@phoenix.co.il', to: 'yonatan.katz@phoenix.co.il', skill: 'TypeScript' },
    { from: 'tal.sharon@phoenix.co.il', to: 'yonatan.katz@phoenix.co.il', skill: 'Next.js' },
    { from: 'yonatan.katz@phoenix.co.il', to: 'tal.sharon@phoenix.co.il', skill: 'React' },
    { from: 'yonatan.katz@phoenix.co.il', to: 'eitan.navon@phoenix.co.il', skill: 'Node.js' },
    { from: 'eitan.navon@phoenix.co.il', to: 'omer.goldman@phoenix.co.il', skill: 'Docker' },
    { from: 'omer.goldman@phoenix.co.il', to: 'eitan.navon@phoenix.co.il', skill: 'PostgreSQL' },
    { from: 'itay.peled@phoenix.co.il', to: 'maya.peretz@phoenix.co.il', skill: 'Python' },
    { from: 'maya.peretz@phoenix.co.il', to: 'itay.peled@phoenix.co.il', skill: 'Machine Learning' },
    { from: 'oren.bar@phoenix.co.il', to: 'omer.goldman@phoenix.co.il', skill: 'AWS' },

    // Insurance endorsements
    { from: 'david.cohen@phoenix.co.il', to: 'lior.arad@phoenix.co.il', skill: 'ניהול תביעות' },
    { from: 'david.cohen@phoenix.co.il', to: 'amir.hadad@phoenix.co.il', skill: 'חיתום' },
    { from: 'avi.mizrahi@phoenix.co.il', to: 'amir.hadad@phoenix.co.il', skill: 'ביטוח רכב' },
    { from: 'avi.mizrahi@phoenix.co.il', to: 'dana.shapira@phoenix.co.il', skill: 'אקטואריה' },
    { from: 'dana.shapira@phoenix.co.il', to: 'avi.mizrahi@phoenix.co.il', skill: 'ניהול סיכונים' },
    { from: 'neta.regev@phoenix.co.il', to: 'david.cohen@phoenix.co.il', skill: 'ניהול תביעות' },

    // Soft skills endorsements
    { from: 'shira.ben-david@phoenix.co.il', to: 'noa.levi@phoenix.co.il', skill: 'מנהיגות' },
    { from: 'michal.oz@phoenix.co.il', to: 'shira.ben-david@phoenix.co.il', skill: 'תקשורת בינאישית' },
    { from: 'sapir.levy@phoenix.co.il', to: 'michal.oz@phoenix.co.il', skill: 'ניהול פרויקטים' },
    { from: 'hila.weiss@phoenix.co.il', to: 'yonatan.katz@phoenix.co.il', skill: 'עבודת צוות' },
  ];

  for (const e of endorsements) {
    const endorserId = userIdMap.get(e.from);
    const recipientId = userIdMap.get(e.to);
    const skillId = skillIdMap.get(e.skill);

    if (!endorserId || !recipientId || !skillId) continue;

    const { error } = await supabase.from('skill_endorsements').insert({
      user_id: recipientId,
      skill_id: skillId,
      endorser_user_id: endorserId,
      message: `${e.skill} – מאושר!`,
    });

    if (error) {
      // Likely duplicate or self-endorsement constraint
      if (!error.message.includes('duplicate') && !error.message.includes('check')) {
        console.warn(`  ⚠️  Endorsement ${e.from} → ${e.to} (${e.skill}): ${error.message}`);
      }
    } else {
      count++;
    }
  }

  console.log(`  ✅ ${count} endorsements seeded.\n`);
}

// ================================================================
// MAIN
// ================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🔥 FnxLevelUp – Database Seed Script 🔥   ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  const startTime = Date.now();

  try {
    await cleanDatabase();
    await seedOrgUnits();
    await seedSkills();
    await seedBadges();
    await seedUsers();
    await seedOrgMemberships();
    await seedUserSkills();
    await seedJobs();
    await seedGigs();
    await seedGamification();
    await seedEndorsements();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║          ✅ SEED COMPLETE!                   ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   🏢 Org Units:    ${orgUnitIdMap.size}`);
    console.log(`   🧠 Skills:       ${skillIdMap.size}`);
    console.log(`   🏅 Badges:       ${badgeIdMap.size}`);
    console.log(`   👥 Users:        ${userIdMap.size}`);
    console.log(`   💼 Jobs:         ${JOBS.length}`);
    console.log(`   ⚡ Gigs:         ${GIGS.length}`);
    console.log(`   ⏱️  Time:         ${elapsed}s`);
    console.log('');
    console.log('🔑 Demo login: any user email with password "Phoenix2026!"');
    console.log('   Admin: noa.levi@phoenix.co.il');
    console.log('');
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();
