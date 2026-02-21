'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Users, BookOpen, Blocks,
  ClipboardList, Flame, LogOut, ChevronLeft, Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly exact?: boolean;
}

interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'ראשי',
    items: [
      { href: '/admin', label: 'לוח בקרה', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'גיוס וניוד',
    items: [
      { href: '/admin/opportunities', label: 'ניהול הזדמנויות', icon: Briefcase },
      { href: '/admin/jobs', label: 'משרות (טופס מהיר)', icon: ClipboardList },
      { href: '/admin/applications', label: 'מועמדויות', icon: ClipboardList },
    ],
  },
  {
    title: 'טאלנט',
    items: [
      { href: '/admin/users', label: 'ניהול עובדים', icon: Users },
      { href: '/admin/skills', label: 'מיומנויות', icon: Blocks },
    ],
  },
  {
    title: 'תוכן',
    items: [
      { href: '/admin/content', label: 'מרכז תוכן', icon: BookOpen },
      { href: '/admin/experience', label: 'מעצב החוויה', icon: Palette },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col h-full shadow-sm shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">FnxLevelUp</h1>
          <p className="text-[10px] font-medium text-slate-400">ממשק ניהול</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {active && <ChevronLeft className="h-3 w-3 mr-auto text-indigo-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      {/* Admin profile */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-100 text-xs font-bold text-indigo-600">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-slate-800">מנהל מערכת</p>
            <p className="text-[10px] text-slate-400">admin@fnx.co.il</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-slate-400">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
