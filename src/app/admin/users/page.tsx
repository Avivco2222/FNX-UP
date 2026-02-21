'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsersList, type UserListItem } from '@/actions/talent';
import Image from 'next/image';
import { Users, Search, Loader2, Eye, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUsersList()
      .then(setUsers)
      .catch(() => toast.error('שגיאה בטעינת רשימת העובדים'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.display_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.role_title?.toLowerCase().includes(q)
        );
      })
    : users;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> טוען עובדים...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול עובדים</h1>
          <p className="text-gray-500 text-sm">{users.length} עובדים במערכת</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="חיפוש לפי שם, אימייל, מחלקה או תפקיד..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-600">
              {search ? 'לא נמצאו תוצאות' : 'אין עובדים במערכת'}
            </p>
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">עובד</th>
                <th className="px-6 py-4 font-semibold text-gray-600">תפקיד</th>
                <th className="px-6 py-4 font-semibold text-gray-600">מחלקה</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">XP</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">מטבעות</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">רמה</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">סטטוס</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">כרטיס 360</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0 relative overflow-hidden">
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt="" fill className="object-cover" />
                        ) : (
                          u.display_name?.charAt(0) ?? '?'
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.display_name ?? 'ללא שם'}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.role_title ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{u.department ?? '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-orange-600">{u.current_xp.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-emerald-600">{u.coins_balance.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {u.current_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold transition"
                    >
                      <Eye size={14} /> צפייה
                      <ChevronLeft size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
