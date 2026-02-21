'use client';

import { useEffect, useState } from 'react';
import {
  getInternalApplications,
  getReferrals,
  updateApplicationStatus,
  approveReferralSuccess,
  type InternalApplication,
  type Referral,
} from '@/actions/applications';
import {
  CheckCircle,
  ArrowLeftRight,
  Users,
  DollarSign,
  Loader2,
  Briefcase,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'internal' | 'referral';

export default function ApplicationsPage() {
  const [tab, setTab] = useState<Tab>('internal');
  const [internalData, setInternalData] = useState<InternalApplication[]>([]);
  const [referralData, setReferralData] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData(activeTab: Tab) {
    setLoading(true);
    try {
      if (activeTab === 'internal') {
        const result = await getInternalApplications();
        setInternalData(result);
      } else {
        const result = await getReferrals();
        setReferralData(result);
      }
    } catch {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(tab);
  }, [tab]);

  const handleApproveInternal = async (id: string) => {
    try {
      await updateApplicationStatus(id, 'accepted');
      toast.success('מועמד אושר בהצלחה!');
      loadData(tab);
    } catch {
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const handleRejectInternal = async (id: string) => {
    try {
      await updateApplicationStatus(id, 'rejected');
      toast.success('מועמדות נדחתה');
      loadData(tab);
    } catch {
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const handleApproveReferral = async (referral: Referral) => {
    if (!referral.referrer_id) {
      toast.error('לא ניתן לאשר – חסר מזהה ממליץ');
      return;
    }
    try {
      await approveReferralSuccess(referral.id, referral.referrer_id);
      toast.success('מועמד אושר בהצלחה! זכאות לתשלום נוצרה.');
      loadData(tab);
    } catch {
      toast.error('שגיאה בתהליך האישור');
    }
  };

  const data = tab === 'internal' ? internalData : referralData;
  const isEmpty = !loading && data.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול מועמדויות ובונוסים</h1>
          <p className="text-gray-500 text-sm">
            {tab === 'internal'
              ? `${internalData.length} מועמדויות פנימיות`
              : `${referralData.length} הפניות חבר מביא חבר`}
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTab('internal')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition ${
              tab === 'internal' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowLeftRight size={16} /> ניוד פנימי
          </button>
          <button
            type="button"
            onClick={() => setTab('referral')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition ${
              tab === 'referral' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} /> חבר מביא חבר
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> טוען נתונים...
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16 text-slate-400">
          <Briefcase size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-600">
            {tab === 'internal' ? 'אין מועמדויות פנימיות' : 'אין הפניות חבר מביא חבר'}
          </p>
          <p className="text-sm">ההפניות והמועמדויות החדשות יופיעו כאן</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">מועמד</th>
                <th className="px-6 py-4 font-bold text-gray-700">משרה מבוקשת</th>
                {tab === 'referral' && (
                  <th className="px-6 py-4 font-bold text-gray-700">ממליץ</th>
                )}
                {tab === 'internal' && (
                  <th className="px-6 py-4 font-bold text-gray-700">XP נוכחי</th>
                )}
                <th className="px-6 py-4 font-bold text-gray-700">תאריך</th>
                <th className="px-6 py-4 font-bold text-gray-700">סטטוס</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tab === 'internal' &&
                internalData.map((app) => (
                  <InternalRow
                    key={app.id}
                    app={app}
                    onApprove={handleApproveInternal}
                    onReject={handleRejectInternal}
                  />
                ))}
              {tab === 'referral' &&
                referralData.map((ref) => (
                  <ReferralRow
                    key={ref.id}
                    referral={ref}
                    onApprove={handleApproveReferral}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Internal Application Row ─── */

function InternalRow({
  app,
  onApprove,
  onReject,
}: {
  readonly app: InternalApplication;
  readonly onApprove: (id: string) => void;
  readonly onReject: (id: string) => void;
}) {
  const statusMap: Record<string, { label: string; className: string }> = {
    submitted: { label: 'הוגש', className: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'בטיפול', className: 'bg-yellow-100 text-yellow-700' },
    accepted: { label: 'אושר', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'נדחה', className: 'bg-red-100 text-red-600' },
  };
  const badge = statusMap[app.status] ?? { label: app.status, className: 'bg-gray-100 text-gray-600' };
  const isFinal = app.status === 'accepted' || app.status === 'rejected';

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{app.applicant_name ?? 'לא ידוע'}</div>
        <div className="text-xs text-gray-400">{app.applicant_email}</div>
      </td>
      <td className="px-6 py-4 text-gray-600">
        <div>{app.job_title ?? '—'}</div>
        {app.job_location && <div className="text-xs text-gray-400">{app.job_location}</div>}
      </td>
      <td className="px-6 py-4 text-center">
        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
          {app.applicant_xp} XP
        </span>
      </td>
      <td className="px-6 py-4 text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {new Date(app.applied_at).toLocaleDateString('he-IL')}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.className}`}>
          {badge.label}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {!isFinal && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onApprove(app.id)}
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-xs font-bold"
            >
              <CheckCircle size={13} /> אישור
            </button>
            <button
              type="button"
              onClick={() => onReject(app.id)}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition text-xs font-bold"
            >
              <XCircle size={13} /> דחייה
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

/* ─── Referral Row ─── */

function ReferralRow({
  referral,
  onApprove,
}: {
  readonly referral: Referral;
  readonly onApprove: (ref: Referral) => void;
}) {
  const isHired = referral.status === 'hired';

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{referral.candidate_name}</div>
        {referral.candidate_email && (
          <div className="text-xs text-gray-400">{referral.candidate_email}</div>
        )}
      </td>
      <td className="px-6 py-4 text-gray-600">
        <div>{referral.job_title ?? '—'}</div>
        {referral.job_location && <div className="text-xs text-gray-400">{referral.job_location}</div>}
      </td>
      <td className="px-6 py-4">
        <span className="font-bold text-blue-600">{referral.referrer_name ?? '—'}</span>
      </td>
      <td className="px-6 py-4 text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {referral.created_at
            ? new Date(referral.created_at).toLocaleDateString('he-IL')
            : '—'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            isHired ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isHired ? 'גויס בהצלחה' : 'בטיפול'}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {!isHired && (
          <button
            type="button"
            onClick={() => onApprove(referral)}
            className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-xs font-bold"
          >
            <CheckCircle size={13} />
            <DollarSign size={13} />
            אישור גיוס
          </button>
        )}
      </td>
    </tr>
  );
}
