'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type UserState = {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  coins: number;    // המטבעות לחנות
  xp: number;       // הניסיון לדרגות
  level: number;
  loading: boolean;
  refreshUser: () => Promise<void>; // פונקציה לרענון ידני (אחרי רכישה/פעולה)
  addXp: (amount: number) => void;        // הוספת XP (אופטימיסטי)
  deductCoins: (amount: number) => void;   // ניכוי מטבעות (אופטימיסטי)
};

const UserContext = createContext<UserState | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userState, setUserState] = useState<Omit<UserState, 'refreshUser'>>({
    id: '', name: 'אורח', role: '', avatar_url: '', 
    coins: 0, xp: 0, level: 1, loading: true
  });
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) {
        setUserState({
          id: user.id,
          name: data.display_name,
          role: data.role_title,
          avatar_url: data.avatar_url,
          coins: data.coins_balance || 0,
          xp: data.current_xp || 0,
          level: data.current_level || 1,
          loading: false
        });
      }
    } else {
      setUserState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXp = (amount: number) => {
    setUserState(prev => ({ ...prev, xp: prev.xp + amount }));
    // TODO: persist via API / Supabase in production
  };

  const deductCoins = (amount: number) => {
    setUserState(prev => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
    // TODO: persist via API / Supabase in production
  };

  return (
    <UserContext.Provider value={{ ...userState, refreshUser: fetchUserData, addXp, deductCoins }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
