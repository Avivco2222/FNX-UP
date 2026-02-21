'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  LayoutDashboard, Briefcase, Map, GraduationCap, Store, 
  Eye, EyeOff, Flame, User, Wallet, Settings, LogOut, Sparkles, Users,
  Coins
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { href: '/', label: 'ראשי', icon: LayoutDashboard },
  { href: '/opportunities', label: 'הזדמנויות', icon: Briefcase },
  { href: '/career', label: 'קריירה', icon: Map },
  { href: '/learning', label: 'למידה', icon: GraduationCap },
  { href: '/store', label: 'חנות', icon: Store },
  { href: '/referrals', label: 'חבר מביא חבר', icon: Users, highlight: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { coins, name, role, loading: userLoading } = useUser();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [loading, setLoading] = useState(true);

  // טעינת הסטטוס ההתחלתי מה-DB
  useEffect(() => {
    async function loadStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('is_open_to_opportunities')
          .eq('id', user.id)
          .single();
        if (data) setIsOpenToWork(data.is_open_to_opportunities);
      }
      setLoading(false);
    }
    loadStatus();
  }, [supabase]);

  // עדכון הסטטוס בלחיצה
  const toggleOpenToWork = async (checked: boolean) => {
    setIsOpenToWork(checked);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({ is_open_to_opportunities: checked })
        .eq('id', user.id);
      
      if (checked) {
        console.log("User is now open to opportunities");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* RIGHT: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl shadow-lg transition-transform group-hover:scale-105">
               <div className="absolute w-5 h-5 border-t-4 border-r-4 border-orange-500 rounded-tr-lg transform rotate-12 translate-y-0.5"></div>
               <div className="absolute w-3 h-3 border-b-4 border-l-4 border-white/20 rounded-bl-lg transform -rotate-12 -translate-y-0.5"></div>
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                Fnx<span className="text-orange-600">LevelUp</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">The Phoenix Group</p>
            </div>
          </Link>

          {/* CENTER: Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHighlight = (item as any).highlight && !isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200/50" 
                      : isHighlight
                        ? "text-orange-600 font-bold bg-orange-50 hover:bg-orange-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={16} className={cn(isActive ? "text-orange-600" : isHighlight ? "text-orange-600" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LEFT: Actions */}
        <div className="flex items-center gap-4">
          
          <TooltipProvider>
            {/* Headhunter Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 mr-2">
                  <Switch 
                    id="headhunter-mode" 
                    checked={isOpenToWork}
                    onCheckedChange={toggleOpenToWork}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <label htmlFor="headhunter-mode" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1">
                    {isOpenToWork ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} />}
                    {isOpenToWork ? 'פתוח להצעות' : 'דיסקרטי'}
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>סימון זה יקפיץ אותך במאגר המגייסות של הפניקס</p>
              </TooltipContent>
            </Tooltip>

            {/* Streak Tooltip */}
            <Tooltip>
              <TooltipTrigger>
                <div className="flex flex-col items-center mx-3 group cursor-help">
                  <div className="flex items-center gap-1 text-orange-600 font-black text-lg group-hover:scale-110 transition-transform">
                    <Flame fill="currentColor" className="animate-pulse" size={20} /> 
                    <span>12</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ימי רצף</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-none">
                <p className="font-bold mb-1">🔥 ימי רצף (Streak)</p>
                <p className="text-xs">התחבר כל יום כדי לשמור על האש!</p>
                <p className="text-xs text-orange-400 mt-1">הפרס הבא: בעוד 3 ימים</p>
              </TooltipContent>
            </Tooltip>

            {/* Coins Tooltip - מסונכרן מ-UserContext */}
            <Tooltip>
              <TooltipTrigger>
                <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 cursor-help">
                  <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full">
                    <Coins size={14} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {userLoading ? '...' : coins.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-none max-w-xs">
                <p className="font-bold mb-1 flex items-center gap-1"><Coins size={14} className="text-yellow-400" /> מטבעות הפניקס</p>
                <p className="text-xs">המטבע הוירטואלי שלך. צוברים אותו בלמידה, משימות ופרגונים.</p>
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-xs">
                  <span>ניתן למימוש בחנות:</span>
                  <span className="text-green-400 font-bold">כן</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          {/* Avatar Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform">
                <Avatar className="h-full w-full">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Noa" />
                  <AvatarFallback>NL</AvatarFallback>
                </Avatar>
                {/* אינדיקטור אונליין קטן */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{name || 'אורח'}</p>
                  <p className="text-xs leading-none text-slate-500">{role || 'עובד הפניקס'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="ml-2 h-4 w-4 text-slate-500" />
                    <span>הפרופיל שלי</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/wallet">
                  <DropdownMenuItem className="cursor-pointer">
                    <Wallet className="ml-2 h-4 w-4 text-slate-500" />
                    <span>הארנק שלי</span>
                    <span className="mr-auto text-xs font-bold text-yellow-600 flex items-center gap-1">
                      <Coins size={12} /> {userLoading ? '...' : coins.toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/referrals">
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="ml-2 h-4 w-4 text-slate-500" />
                    <div className="flex flex-col">
                      <span>חבר מביא חבר</span>
                      <span className="text-[10px] text-slate-400">מעקב סטטוס ובונוסים</span>
                    </div>
                  </DropdownMenuItem>
                </Link>

                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="ml-2 h-4 w-4 text-slate-500" />
                    <span>הגדרות ופרטים אישיים</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer bg-gradient-to-r from-orange-50 to-white">
                <Sparkles className="ml-2 h-4 w-4 text-orange-500" />
                <span className="text-orange-700 font-bold text-xs">שדרג ל-Premium (סתם, זה חינם)</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                <span>התנתק</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
