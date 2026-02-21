'use client';

import { Search, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminHeader() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Right: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
          <input
            placeholder="חיפוש עובד, משרה, מיומנות..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      {/* Left: Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
          <Bell size={18} />
          <Badge className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-red-500 text-white border-2 border-white">
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
          <Settings size={18} />
        </Button>
        <Avatar className="h-8 w-8 border border-slate-200">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
