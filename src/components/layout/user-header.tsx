'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame,
  Home,
  User,
  Briefcase,
  Coins,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  calculateLevel,
  getLevelBadge,
  formatXp,
  formatCoins,
} from '@/lib/gamification';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface UserHeaderProps {
  readonly displayName: string;
  readonly email: string;
  readonly avatarUrl?: string | null;
  readonly currentXp: number;
  readonly coinsBalance: number;
}

// ----------------------------------------------------------------
// Nav items
// ----------------------------------------------------------------

const NAV_ITEMS = [
  { href: '/', label: 'Feed', icon: Home, exact: true },
  { href: '/career', label: 'My Career', icon: User, exact: false },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase, exact: false },
] as const;

// ----------------------------------------------------------------
// XP Progress Bar (animated)
// ----------------------------------------------------------------

function XpProgressBar({ progress, level }: { readonly progress: number; readonly level: number }) {
  const badge = getLevelBadge(level);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm" title={badge.title}>
        {badge.emoji}
      </span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold tabular-nums">Lvl {level}</span>
          <span className="text-[10px] text-muted-foreground">{badge.title}</span>
        </div>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function UserHeader({
  displayName,
  email,
  avatarUrl,
  currentXp,
  coinsBalance,
}: UserHeaderProps) {
  const pathname = usePathname();
  const levelInfo = calculateLevel(currentXp);
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* ---- Mobile menu ---- */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                FnxLevelUp
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(href, exact)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* ---- Logo ---- */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-4 w-4" />
          </div>
          <span className="hidden text-sm font-bold tracking-tight sm:inline">
            FnxLevelUp
          </span>
        </Link>

        {/* ---- Desktop Nav ---- */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(href, exact)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* ---- Spacer on mobile ---- */}
        <div className="flex-1 md:hidden" />

        {/* ---- Gamification Stats ---- */}
        <div className="flex items-center gap-3">
          {/* Coins */}
          <motion.div
            className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold tabular-nums text-amber-700">
              {formatCoins(coinsBalance)}
            </span>
          </motion.div>

          {/* XP / Level Bar */}
          <div className="hidden sm:block">
            <XpProgressBar
              progress={levelInfo.progress}
              level={levelInfo.level}
            />
          </div>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Lvl {levelInfo.level} {getLevelBadge(levelInfo.level).title}</span>
                  <span>·</span>
                  <span>{formatXp(currentXp)} XP</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/career" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
