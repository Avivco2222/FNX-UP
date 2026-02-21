'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Coins, ArrowUpRight, ArrowDownLeft, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. שליפת יתרה נוכחית
      const { data: userData } = await supabase.from('users').select('coins_balance').eq('id', user.id).single();
      if (userData) setBalance(userData.coins_balance);

      // 2. שליפת היסטוריה
      const { data: history } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .neq('coin_amount', 0)
        .order('created_at', { ascending: false });
      
      if (history) setTransactions(history);
    }
    loadData();
  }, [supabase]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex justify-between items-center shadow-xl">
        <div>
          <h1 className="text-2xl font-bold mb-1 opacity-90">הארנק שלי</h1>
          <p className="text-slate-400 text-sm">היסטוריית תנועות ויתרה</p>
        </div>
        <div className="text-right">
           <div className="text-4xl font-black text-yellow-400 flex items-center justify-end gap-2">
             <Coins size={32} /> {balance.toLocaleString()}
           </div>
           <div className="text-xs text-slate-400 mt-1">יתרה זמינה לשימוש בחנות</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="space-y-4">
           <Card>
             <CardContent className="p-6 flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-600 rounded-full"><ArrowUpRight /></div>
               <div>
                 <div className="text-sm text-slate-500">הכנסות החודש</div>
                 <div className="text-xl font-bold text-slate-900">+1,250</div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-6 flex items-center gap-4">
               <div className="p-3 bg-red-100 text-red-600 rounded-full"><ArrowDownLeft /></div>
               <div>
                 <div className="text-sm text-slate-500">הוצאות החודש</div>
                 <div className="text-xl font-bold text-slate-900">-450</div>
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Transactions Table */}
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg">פירוט תנועות</CardTitle>
             <Button variant="ghost" size="sm"><Filter size={16}/></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.coin_amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.coin_amount > 0 ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{tx.source_label || 'פעולה כללית'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(tx.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                   </div>
                   <div className={`font-mono font-bold ${tx.coin_amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                     {tx.coin_amount > 0 ? '+' : ''}{tx.coin_amount}
                   </div>
                </div>
              ))}
              {transactions.length === 0 && <div className="text-center py-10 text-slate-400">אין תנועות עדיין</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
