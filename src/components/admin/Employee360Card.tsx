'use client';

import { useEffect, useState } from 'react';
import {
  getUserFullProfile,
  manualRewardUpdate,
  type UserFullProfile,
  type SkillEntry,
  type XpTransaction,
  type JobAppEntry,
} from '@/actions/talent';
import {
  ShieldCheck,
  TrendingUp,
  History,
  Briefcase,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Clock,
  Award,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Employee360Props {
  readonly userId: string;
}

export default function Employee360Card({ userId }: Employee360Props) {
  const [user, setUser] = useState<UserFullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual adjustment state
  const [adjustType, setAdjustType] = useState<'xp' | 'coins'>('xp');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUserFullProfile(userId).then((data) => {
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [userId]);

  async function refreshProfile() {
    setLoading(true);
    const data = await getUserFullProfile(userId);
    setUser(data);
    setLoading(false);
  }

  const handleAdjust = async () => {
    if (adjustAmount === 0) {
      toast.error('יש להזין סכום שונה מ-0');
      return;
    }
    if (!adjustReason.trim()) {
      toast.error('יש להזין סיבה לעדכון');
      return;
    }
    setAdjusting(true);
    try {
      await manualRewardUpdate(userId, adjustAmount, adjustType, adjustReason);
      toast.success('היתרה עודכנה בהצלחה ותועדה ביומן');
      setAdjustAmount(0);
      setAdjustReason('');
      refreshProfile();
    } catch {
      toast.error('שגיאה בעדכון היתרה');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> טוען נתוני עובד...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <AlertCircle size={32} />
        <p className="font-bold text-slate-600">לא נמצא עובד עם מזהה זה</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ─── RIGHT COLUMN: Profile + Skills ─── */}
      <div className="lg:col-span-1 space-y-6">
        <ProfileCard user={user} />
        <SkillsPanel strengths={user.strengths} improvements={user.improvements} />
        <AdjustmentPanel
          adjustType={adjustType}
          adjustAmount={adjustAmount}
          adjustReason={adjustReason}
          adjusting={adjusting}
          onTypeChange={setAdjustType}
          onAmountChange={setAdjustAmount}
          onReasonChange={setAdjustReason}
          onSubmit={handleAdjust}
        />
      </div>

      {/* ─── CENTER + LEFT: History ─── */}
      <div className="lg:col-span-2 space-y-6">
        <XpLog transactions={user.xp_transactions} />
        <ApplicationsHistory applications={user.job_applications} />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ProfileCard({ user }: { readonly user: UserFullProfile }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600 text-3xl font-bold relative overflow-hidden">
        {user.avatar_url ? (
          <Image src={user.avatar_url} alt="" fill className="object-cover" />
        ) : (
          user.display_name?.charAt(0) ?? '?'
        )}
      </div>
      <h2 className="text-xl font-bold text-slate-900">{user.display_name ?? 'ללא שם'}</h2>
      <p className="text-gray-500 text-sm flex items-center justify-center gap-2 mt-1">
        {user.role_title && <span>{user.role_title}</span>}
        {user.location && (
          <>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-0.5"><MapPin size={12} /> {user.location}</span>
          </>
        )}
      </p>
      {user.department && (
        <p className="text-xs text-slate-400 mt-1">מחלקה: {user.department}</p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-700">
          <p className="text-[10px] uppercase font-bold tracking-wider">XP</p>
          <p className="text-xl font-black">{user.current_xp.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-700">
          <p className="text-[10px] uppercase font-bold tracking-wider">מטבעות</p>
          <p className="text-xl font-black">{user.coins_balance.toLocaleString()}</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-700">
          <p className="text-[10px] uppercase font-bold tracking-wider">רמה</p>
          <p className="text-xl font-black">{user.current_level}</p>
        </div>
      </div>

      {user.current_streak != null && user.current_streak > 0 && (
        <div className="mt-4 flex items-center justify-center gap-1 text-sm text-amber-600">
          <Award size={14} /> רצף פעילות: {user.current_streak} ימים
        </div>
      )}
    </div>
  );
}

function SkillsPanel({
  strengths,
  improvements,
}: {
  readonly strengths: readonly SkillEntry[];
  readonly improvements: readonly SkillEntry[];
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
        <TrendingUp size={18} className="text-blue-600" /> מיפוי מיומנויות
      </h3>
      <div className="space-y-4">
        {strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-green-600 mb-2 uppercase tracking-wider">חוזקות מובילות</p>
            {strengths.map((s) => (
              <SkillRow key={s.skill_name} skill={s} variant="strength" />
            ))}
          </div>
        )}
        {improvements.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-wider">מוקדים לשיפור</p>
            {improvements.map((s) => (
              <SkillRow key={s.skill_name} skill={s} variant="improvement" />
            ))}
          </div>
        )}
        {strengths.length === 0 && improvements.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">אין מיומנויות מוגדרות עדיין</p>
        )}
      </div>
    </div>
  );
}

function SkillRow({
  skill,
  variant,
}: {
  readonly skill: SkillEntry;
  readonly variant: 'strength' | 'improvement';
}) {
  const badgeCls = variant === 'strength'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm">{skill.skill_name}</span>
        {skill.is_verified && <ShieldCheck size={12} className="text-blue-500" />}
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeCls}`}>
        Lvl {skill.skill_level}
      </span>
    </div>
  );
}

function AdjustmentPanel({
  adjustType,
  adjustAmount,
  adjustReason,
  adjusting,
  onTypeChange,
  onAmountChange,
  onReasonChange,
  onSubmit,
}: {
  readonly adjustType: 'xp' | 'coins';
  readonly adjustAmount: number;
  readonly adjustReason: string;
  readonly adjusting: boolean;
  readonly onTypeChange: (t: 'xp' | 'coins') => void;
  readonly onAmountChange: (n: number) => void;
  readonly onReasonChange: (s: string) => void;
  readonly onSubmit: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
        <AlertCircle size={18} className="text-amber-500" /> עדכון ידני (בקרה)
      </h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTypeChange('xp')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              adjustType === 'xp' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-50 text-gray-500'
            }`}
          >
            XP
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('coins')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              adjustType === 'coins' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-50 text-gray-500'
            }`}
          >
            מטבעות
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAmountChange(Math.abs(adjustAmount || 50))}
            className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
          >
            <Plus size={16} />
          </button>
          <input
            type="number"
            value={adjustAmount}
            onChange={(e) => onAmountChange(Number.parseInt(e.target.value) || 0)}
            className="flex-1 p-2 border rounded-lg text-center font-bold"
          />
          <button
            type="button"
            onClick={() => onAmountChange(-Math.abs(adjustAmount || 50))}
            className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
          >
            <Minus size={16} />
          </button>
        </div>
        <input
          type="text"
          placeholder="סיבה לעדכון (חובה)..."
          value={adjustReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        />
        <Button
          onClick={onSubmit}
          disabled={adjusting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
        >
          {adjusting ? 'מעדכן...' : 'עדכן ותעד'}
        </Button>
      </div>
    </div>
  );
}

function amountColor(val: number, positive: string, negative: string): string {
  if (val > 0) return positive;
  if (val < 0) return negative;
  return 'text-gray-300';
}

function formatAmount(val: number): string {
  if (val === 0) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val}`;
}

function XpLog({ transactions }: { readonly transactions: readonly XpTransaction[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-slate-800">
          <History size={18} /> יומן תנועות XP ומטבעות
        </h3>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">בקרה און-ליין</span>
      </div>
      {transactions.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-400">אין תנועות עדיין</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 bg-white shadow-sm">
              <tr>
                <th className="p-3 text-gray-600 font-semibold">תאריך</th>
                <th className="p-3 text-gray-600 font-semibold">פעולה / מקור</th>
                <th className="p-3 text-gray-600 font-semibold">XP</th>
                <th className="p-3 text-gray-600 font-semibold">מטבעות</th>
                <th className="p-3 text-gray-600 font-semibold text-center">אימות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(tx.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    {tx.source_label ?? tx.source_type}
                    {tx.source_type === 'admin_adjustment' && (
                      <span className="mr-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ידני</span>
                    )}
                  </td>
                  <td className={`p-3 font-bold ${amountColor(tx.xp_amount, 'text-green-600', 'text-red-600')}`}>
                    {formatAmount(tx.xp_amount)}
                  </td>
                  <td className={`p-3 font-bold ${amountColor(tx.coin_amount, 'text-emerald-600', 'text-red-600')}`}>
                    {formatAmount(tx.coin_amount)}
                  </td>
                  <td className="p-3 text-center">
                    <ShieldCheck size={15} className="text-blue-500 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplicationsHistory({ applications }: { readonly applications: readonly JobAppEntry[] }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    submitted: { label: 'הוגש', cls: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'בטיפול', cls: 'bg-yellow-100 text-yellow-700' },
    accepted: { label: 'התקבל', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'נדחה', cls: 'bg-red-100 text-red-600' },
    hired: { label: 'גויס', cls: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-bold flex items-center gap-2 text-slate-800">
          <Briefcase size={18} /> היסטוריית מועמדויות וניוד
        </h3>
      </div>
      {applications.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-400 italic">לא הוגשו מועמדויות עדיין.</p>
      ) : (
        <div className="divide-y">
          {applications.map((app) => {
            const badge = statusMap[app.status] ?? { label: app.status, cls: 'bg-gray-100 text-gray-600' };
            return (
              <div key={app.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-gray-900">{app.job_title ?? 'משרה לא ידועה'}</p>
                  <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('he-IL')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
