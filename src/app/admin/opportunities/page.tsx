'use client';

import { useEffect, useState } from 'react';
import { getAllOpportunities, deleteOpportunity, type Opportunity } from '@/actions/opportunities';
import type { OpportunityFormData } from '@/actions/opportunity-form';
import OpportunityForm from '@/components/admin/OpportunityForm';
import { Plus, Briefcase, Zap, Trash2, Eye, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type FormMode = null | { type: 'job' | 'gig'; data?: Partial<OpportunityFormData> };

export default function OpportunitiesAdmin() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAllOpportunities();
      setItems(data);
    } catch {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, type: 'job' | 'gig') => {
    if (!confirm('האם אתה בטוח שברצונך למחוק?')) return;
    try {
      await deleteOpportunity(id, type);
      setItems(items.filter(item => item.id !== id));
      toast.success('נמחק בהצלחה');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const handleFormSuccess = () => {
    setFormMode(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> טוען הזדמנויות...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול הזדמנויות</h1>
          <p className="text-gray-500 text-sm">ניהול משרות, גיגים ופרסומים בארגון ({items.length})</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFormMode({ type: 'job' })}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-bold"
          >
            <Plus size={18} />
            משרה חדשה
          </button>
          <button
            onClick={() => setFormMode({ type: 'gig' })}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-bold"
          >
            <Zap size={18} />
            גיג חדש
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${formMode ? 'flex-1' : 'w-full'}`}>
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Briefcase size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-600">אין הזדמנויות כרגע</p>
              <p className="text-sm">צור משרה או גיג חדש כדי להתחיל</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">הזדמנות</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">סוג</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">מחלקה</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">נרשמו</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">XP</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">סטטוס</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.type === 'job' ? (
                        <span className="flex items-center gap-1 text-blue-600"><Briefcase size={14} /> משרה</span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600"><Zap size={14} /> גיג</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.department}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{item.application_count}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-orange-600">+{item.xp_reward}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'פעיל' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><Eye size={16} /></button>
                        <button
                          onClick={() => handleDelete(item.id, item.type)}
                          className="p-2 hover:bg-red-50 rounded-md text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Slide-in Form Panel */}
        {formMode && (
          <div className="w-[480px] shrink-0 animate-in slide-in-from-left duration-300">
            <div className="relative">
              <button
                onClick={() => setFormMode(null)}
                className="absolute -left-3 top-3 z-10 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50 transition"
              >
                <X size={16} />
              </button>
              <OpportunityForm
                type={formMode.type}
                initialData={formMode.data}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
