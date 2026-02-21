'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  GraduationCap, 
  Users, 
  ShoppingBag, 
  Compass,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'ראשי', icon: Home },
  { href: '/opportunities', label: 'הזדמנויות וגיגים', icon: Briefcase },
  { href: '/learning', label: 'מרכז למידה', icon: GraduationCap },
  { href: '/career', label: 'מפת קריירה', icon: Compass },
  { href: '/mentoring', label: 'מנטורינג', icon: Users },
  { href: '/store', label: 'חנות מטבעות', icon: ShoppingBag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-l border-slate-200 h-screen fixed right-0 top-0 flex flex-col shadow-lg z-50">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-orange-500/20 shadow-lg">
          <Flame size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">FnxLevelUp</h1>
          <p className="text-xs text-slate-500">צמיחה. השפעה. קריירה.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-orange-50 text-orange-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-orange-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400">
        © 2026 The Phoenix
      </div>
    </aside>
  );
}
