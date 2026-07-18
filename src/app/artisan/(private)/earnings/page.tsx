'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface EarningsData {
  totalEarned?: number;
  thisMonth?: number;
  lastMonth?: number;
  pendingPayout?: number;
  completedJobs?: number;
  transactions?: Transaction[];
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  jobTitle?: string;
  createdAt: string;
}

export default function ArtisanEarningsPage() {
  const [data,    setData]    = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/artisans/me/earnings')
      .then((r) => setData(r.data.data ?? r.data))
      .catch(() => {
        // Fallback: derive from jobs
        api.get('/api/jobs', { params: { status: 'completed', limit: '100' } })
          .then((r) => {
            const jobs = r.data.data ?? r.data.jobs ?? [];
            const now = new Date();
            const thisMonth = jobs.filter((j: { completedAt?: string; createdAt: string }) => {
              const d = new Date(j.completedAt ?? j.createdAt);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            setData({ completedJobs: jobs.length, thisMonth: thisMonth.length * 0, transactions: [] });
          })
          .catch(() => setData({}));
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n?: number) => n !== undefined && n !== null ? `₦${n.toLocaleString('en-NG')}` : '—';

  const cards = [
    { label: 'Total Earned',    value: fmt(data?.totalEarned),    icon: 'payments',        color: 'text-primary'   },
    { label: 'This Month',      value: fmt(data?.thisMonth),       icon: 'calendar_month',  color: 'text-secondary' },
    { label: 'Last Month',      value: fmt(data?.lastMonth),       icon: 'history',         color: 'text-tertiary'  },
    { label: 'Pending Payout',  value: fmt(data?.pendingPayout),   icon: 'pending_actions', color: 'text-outline'   },
  ];

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      <h1 className="text-[28px] font-black text-on-surface mb-1">Earnings</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Your earnings overview and transaction history</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
            <span className={`material-symbols-outlined ${color} mb-2 block`} style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            <p className="text-[22px] font-black text-on-surface">{loading ? '—' : value}</p>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Completed jobs count */}
      {!loading && (data?.completedJobs ?? 0) > 0 && (
        <div className="bg-primary-container/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <div>
            <p className="text-[22px] font-black text-primary">{data?.completedJobs}</p>
            <p className="text-[13px] text-on-surface-variant font-semibold">Jobs Completed</p>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h2 className="text-[18px] font-bold text-on-surface mb-4">Transaction History</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>
        ) : !data?.transactions || data.transactions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant rounded-2xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">receipt_long</span>
            <p className="text-[16px] font-bold text-on-surface mb-1">No transactions yet</p>
            <p className="text-[13px] text-on-surface-variant">Complete jobs to start earning.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/20">
            {data.transactions.map((t) => (
              <div key={t._id} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'credit' ? 'bg-tertiary-container' : 'bg-error-container'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1", color: t.type === 'credit' ? 'var(--on-tertiary-container)' : 'var(--on-error-container)' }}>
                    {t.type === 'credit' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface truncate">{t.description ?? t.jobTitle ?? 'Transaction'}</p>
                  <p className="text-[12px] text-outline">{new Date(t.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[15px] font-black ${t.type === 'credit' ? 'text-tertiary' : 'text-error'}`}>
                    {t.type === 'credit' ? '+' : '-'}₦{t.amount.toLocaleString('en-NG')}
                  </p>
                  <p className="text-[11px] text-outline capitalize">{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about payouts */}
      <div className="mt-8 bg-surface-container rounded-2xl p-5 flex items-start gap-3">
        <span className="material-symbols-outlined text-outline flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }}>info</span>
        <p className="text-[13px] text-on-surface-variant leading-relaxed">Payouts are processed within 24–48 hours after job completion. Upgrade to Pro for priority payout scheduling.</p>
      </div>
    </div>
  );
}
