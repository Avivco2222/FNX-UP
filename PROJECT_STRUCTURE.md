# FNXup - מבנה הפרויקט המורחב

> **Phoenix (FNXup)** – פלטפורמת HR-Tech פנים-ארגונית לפיתוח קריירה, למידה וניהול כישרונות.
> בנוי עם **Next.js 14** | **TypeScript** | **Tailwind CSS** | **shadcn/ui** | **Supabase**

---

## עץ מבנה מלא

```
FNXup/
│
├── .eslintrc.json                  # הגדרות ESLint
├── .gitignore                      # קבצים מוחרגים מ-Git
├── components.json                 # הגדרות shadcn/ui
├── next.config.mjs                 # הגדרות Next.js (remote images: dicebear, unsplash)
├── package.json                    # תלויות ו-scripts
├── package-lock.json               # נעילת גרסאות
├── postcss.config.mjs              # PostCSS (Tailwind)
├── tailwind.config.ts              # הגדרות Tailwind CSS
├── tsconfig.json                   # הגדרות TypeScript
├── vitest.config.ts                # הגדרות Vitest (טסטים)
├── schema.sql                      # סכמת בסיס הנתונים (Supabase)
├── README.md                       # תיעוד כללי
│
├── scripts/
│   └── seed.ts                     # סקריפט לאכלוס נתוני דמו
│
└── src/
    │
    ├── middleware.ts                # Next.js Middleware (auth, routing)
    ├── types.ts                     # טיפוסים גלובליים (TypeScript)
    │
    ├── types/
    │   └── supabase.ts              # טיפוסי Database מלאים (auto-generated + ידני)
    │
    ├── actions/                     # ── Server Actions ──────────────
    │   ├── admin-generic.ts         #   CRUD גנרי לאדמין
    │   ├── admin-generic.test.ts    #   טסטים ל-admin-generic
    │   ├── admin-jobs.ts            #   פעולות אדמין על משרות (כולל skills)
    │   ├── ai-job-parser.ts         #   פענוח משרות עם AI
    │   ├── ai-job-parser.test.ts    #   טסטים לפענוח משרות
    │   ├── ai-learning.ts           #   המלצות למידה (AI)
    │   ├── ai-resume-parser.ts      #   פענוח קורות חיים (AI)
    │   ├── applications.ts          #   ניהול מועמדויות אדמין (אישור/דחייה, referrals)
    │   ├── apply.ts                 #   הגשת מועמדות + הענקת XP מיידי
    │   ├── content.ts               #   ★ ניהול תוכן: קורסים (CRUD + inline update),
    │   │                            #     פוסטים חברתיים, הגדרות תגמול (quests)
    │   ├── experience.ts            #   מעצב החוויה: widgets, סדר, פיד חברתי
    │   ├── home.ts                  #   שליפת נתוני דף הבית הדינמי
    │   ├── jobs.ts                  #   פעולות על משרות (get/create)
    │   ├── learning.ts              #   שליפת קורסים מ-Supabase
    │   ├── matching.ts              #   התאמת מועמדים-משרות
    │   ├── mentors.ts               #   ניהול מנטורים
    │   ├── opportunities.ts         #   שליפת הזדמנויות (jobs+gigs) לאדמין
    │   ├── opportunity-form.ts      #   שמירת הזדמנות + skills + reward rules
    │   ├── talent.ts                #   כרטיס עובד 360, XP/coins, תנועות
    │   └── user-onboarding.ts       #   תהליך הצטרפות משתמש
    │
    ├── app/                         # ── App Router (Pages) ─────────
    │   ├── layout.tsx               #   Root Layout
    │   ├── page.tsx                 #   ★ דף הבית הדינמי (widgets מ-DB)
    │   ├── globals.css              #   סגנונות גלובליים
    │   ├── favicon.ico              #   אייקון האתר
    │   ├── fonts/                   #   פונטים מקומיים
    │   │   ├── GeistVF.woff         #     Geist Variable Font
    │   │   └── GeistMonoVF.woff     #     Geist Mono Variable Font
    │   │
    │   ├── (user)/                  #   Route Group: User Layout
    │   │   └── layout.tsx           #     Layout עם Header + Sidebar
    │   │
    │   ├── login/
    │   │   └── page.tsx             #   דף התחברות
    │   │
    │   ├── compass/
    │   │   └── page.tsx             #   ★ המצפן המקצועי (Scientific Flow)
    │   │                            #     רדאר דינמי + מסוע המלצות
    │   │
    │   ├── learning/
    │   │   └── page.tsx             #   ★ מרכז הלמידה (Academy + Brain Gym)
    │   │                            #     קורסים חיים מ-DB + משחקי חשיבה
    │   │
    │   ├── opportunities/
    │   │   ├── page.tsx             #   ★ לוח הזדמנויות (Live מ-Supabase)
    │   │   │                        #     כולל Flow הגשה 3-שלבי
    │   │   └── [id]/
    │   │       └── page.tsx         #     דף פרטי הזדמנות
    │   │
    │   ├── career/
    │   │   └── page.tsx             #   תכנון קריירה
    │   │
    │   ├── careers/
    │   │   └── [jobId]/
    │   │       └── page.tsx         #   דף משרה פומבי
    │   │
    │   ├── mentoring/
    │   │   └── page.tsx             #   מערכת מנטורינג
    │   │
    │   ├── profile/
    │   │   └── page.tsx             #   פרופיל משתמש
    │   │
    │   ├── wallet/
    │   │   └── page.tsx             #   ארנק נקודות / XP
    │   │
    │   ├── store/
    │   │   └── page.tsx             #   חנות פנימית (פרסים)
    │   │
    │   ├── referrals/
    │   │   └── page.tsx             #   מערכת הפניות (Referrals)
    │   │
    │   ├── settings/
    │   │   └── page.tsx             #   הגדרות משתמש
    │   │
    │   └── admin/                   #   ── פאנל ניהול (RTL) ──
    │       ├── layout.tsx           #     Admin Layout (RTL + Sidebar + Header)
    │       ├── page.tsx             #     דשבורד אדמין
    │       ├── jobs/
    │       │   └── page.tsx         #     ניהול משרות
    │       ├── applications/
    │       │   └── page.tsx         #     ★ ניהול מועמדויות + הפניות (טאבים)
    │       ├── content/
    │       │   └── page.tsx         #     ★ מרכז תוכן וכלכלה (Hub)
    │       │                        #       3 טאבים: קורסים, פיד, תגמולים
    │       ├── experience/
    │       │   └── page.tsx         #     ★ מעצב החוויה (סדר widgets + מודרציה)
    │       ├── opportunities/
    │       │   └── page.tsx         #     ★ ניהול הזדמנויות (Jobs + Gigs)
    │       │                        #       כולל טופס יצירה/עריכה slide-out
    │       ├── skills/
    │       │   └── page.tsx         #     ניהול כישורים
    │       └── users/
    │           ├── page.tsx         #     ★ רשימת עובדים (חיפוש + טבלה)
    │           └── [id]/
    │               └── page.tsx     #     ★ כרטיס עובד 360 (פרופיל מלא)
    │
    ├── components/                  # ── קומפוננטות ─────────────────
    │   │
    │   ├── Header.tsx               #   Header ראשי (XP/Coins מ-UserContext)
    │   ├── Sidebar.tsx              #   Sidebar ראשי (תפריט צד)
    │   ├── AICareerAgent.tsx        #   סוכן AI לייעוץ קריירה
    │   ├── SocialFeed.tsx           #   פיד חברתי פנים-ארגוני
    │   ├── CourseCompletionModal.tsx #   מודאל סיום קורס
    │   ├── InternalApplyModal.tsx   #   מודאל הגשת מועמדות פנימית
    │   ├── ManualSubmitModal.tsx    #   מודאל הגשה ידנית
    │   ├── ShareJobModal.tsx        #   מודאל שיתוף משרה
    │   ├── UnifiedReferralModal.tsx  #  מודאל הפניות אחוד
    │   │
    │   ├── admin/                   #   ── קומפוננטות אדמין ──
    │   │   ├── AdminSidebar.tsx     #     ★ Sidebar אדמין (ניווט מלא, RTL)
    │   │   ├── AdminHeader.tsx      #     Header אדמין
    │   │   ├── admin-sidebar.tsx    #     Sidebar ישן (legacy)
    │   │   ├── AddCourseModal.tsx   #     ★ מודאל הוספת קורס חדש
    │   │   ├── Employee360Card.tsx  #     ★ כרטיס עובד 360 (skills, XP, היסטוריה)
    │   │   ├── OpportunityForm.tsx  #     ★ טופס יצירת/עריכת הזדמנות (tabs)
    │   │   ├── job-wizard.tsx       #     אשף יצירת משרה
    │   │   └── universal-table.tsx  #     טבלה אוניברסלית (CRUD)
    │   │
    │   ├── games/                   #   ── משחקי חשיבה ──
    │   │   └── MemoryGame.tsx       #     ★ Neural Focus (זיכרון רצפים)
    │   │
    │   ├── layout/
    │   │   └── user-header.tsx      #   Header למשתמש רגיל
    │   │
    │   ├── learning/
    │   │   └── gap-modal.tsx        #   מודאל פערי כישורים
    │   │
    │   ├── onboarding/
    │   │   └── resume-wizard.tsx    #   אשף העלאת קורות חיים
    │   │
    │   ├── opportunities/
    │   │   ├── ApplyButton.tsx      #   ★ כפתור הגשה (פותח את ה-Flow)
    │   │   ├── gig-swiper.tsx       #   Swiper להצעות גיגים
    │   │   └── job-card.tsx         #   כרטיס משרה
    │   │
    │   ├── user/                    #   ── קומפוננטות משתמש ──
    │   │   ├── JobApplicationFlow.tsx #  ★ Flow הגשת מועמדות 3-שלבי
    │   │   │                        #    (פרטים → שקיפות → בונוס → הצלחה)
    │   │   └── ApplyDrawer.tsx      #   Drawer הגשה (גרסה קודמת)
    │   │
    │   ├── ui/                      #   ── shadcn/ui Primitives ──
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── progress.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── switch.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   └── tooltip.tsx
    │   │
    │   └── widgets/                 #   ── וידג'טים לדשבורד ──
    │       ├── CleanHomeSidebar.tsx  #     סיידבר דף הבית
    │       ├── DailyPoll.tsx        #     סקר יומי
    │       └── KnowledgeArena.tsx   #     זירת ידע
    │
    ├── context/
    │   └── UserContext.tsx           # Context גלובלי (XP, coins, addXp, deductCoins)
    │
    ├── hooks/
    │   └── use-toast.ts             # Hook להתראות Toast
    │
    ├── lib/                         # ── ספריות עזר ────────────────
    │   ├── utils.ts                 #   פונקציות עזר (cn, formatters)
    │   ├── gamification.ts          #   לוגיקת גיימיפיקציה (XP, levels)
    │   ├── gamification.test.ts     #   טסטים לגיימיפיקציה
    │   ├── admin-columns.ts         #   הגדרות עמודות לטבלאות אדמין
    │   ├── mock-db.ts               #   ★ נתוני דמו מרכזיים (Single Source of Truth)
    │   └── supabase/
    │       ├── client.ts            #   Supabase Client (browser, typed)
    │       └── server.ts            #   Supabase Client (server, cookies)
    │
    └── tests/
        └── supabase-mock.ts         # Mock של Supabase לטסטים
```

---

## סיכום מספרי

| קטגוריה | כמות |
|---|---|
| **דפים (Routes)** | 22 עמודים |
| **קומפוננטות** | 35 קומפוננטות |
| **UI Primitives (shadcn)** | 20 רכיבי בסיס |
| **Server Actions** | 20 מודולים |
| **טסטים** | 4 קבצי טסט |
| **קבצי הגדרות (root)** | 10 קבצים |

---

## מודולים מרכזיים

### צד משתמש (Employee)
| מודול | נתיב | חיבור ל-DB |
|---|---|---|
| דף הבית הדינמי | `/` | `app_widgets`, `jobs`, `gigs`, `posts` |
| המצפן המקצועי | `/compass` | Mock (radar + המלצות) |
| מרכז למידה | `/learning` | `courses` (Live) |
| לוח הזדמנויות | `/opportunities` | `jobs` (Live) |
| Flow הגשה 3-שלבי | `ApplyButton` → `JobApplicationFlow` | `job_applications`, `xp_transactions`, `users` |
| חנות פנימית | `/store` | Mock |
| הפניות | `/referrals` | Mock |

### פאנל ניהול (Admin)
| מודול | נתיב | יכולות |
|---|---|---|
| מרכז תוכן וכלכלה | `/admin/content` | CRUD קורסים (inline), פיד, הגדרות תגמול (quests) |
| ניהול הזדמנויות | `/admin/opportunities` | Jobs + Gigs, מחיקה, טופס יצירה |
| ניהול מועמדויות | `/admin/applications` | אישור/דחייה, הפניות, payouts |
| כרטיס עובד 360 | `/admin/users/[id]` | Skills, XP/Coins, היסטוריה, התאמה ידנית |
| מעצב החוויה | `/admin/experience` | סדר widgets, מודרציית פוסטים |
| ניהול משרות | `/admin/jobs` | הוספה/צפייה |

---

## טכנולוגיות מרכזיות

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (Radix primitives)
- **Database**: Supabase (PostgreSQL) – typed with `Database` interface
- **AI**: פענוח משרות וקורות חיים, המלצות למידה
- **Testing**: Vitest
- **Animations**: CSS Transitions, canvas-confetti
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **Localization**: RTL (Hebrew) – כל ממשקי האדמין
