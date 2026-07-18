'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP, PROFESSION_ICONS } from '@/lib/constants';

interface Job { _id: string; title: string; skill: string; status: string; createdAt: string; customer?: { name: string }; }

const TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function ArtisanJobsPage() {
  const [tab, setTab]     = useState('all');
  const [jobs, setJobs]   = useState<Job[]>([]);
  const [loading, set]    = useState(true);

  useEffect(() => {
    api.get('/api/jobs', { params: { limit: '100' } })
      .then((r) => setJobs(r.data.data ?? r.data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => set(false));
  }, []);

  const filtered = tab === 'all' ? jobs
    : tab === 'active'    ? jobs.filter((j) => ['pending', 'accepted', 'in-progress'].includes(j.status))
    : jobs.filter((j) => j.status === tab);

  return (
    <div className="py-8 px-4 md:px-8">
      <h1 className="text-[28px] font-black text-on-surface mb-6">My Jobs</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline-variant overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-all ${tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">work_off</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">No {tab === 'all' ? '' : tab} jobs</p>
          <p className="text-[14px] text-on-surface-variant">Jobs assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => {
            const map  = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
            const icon = PROFESSION_ICONS[j.skill] ?? PROFESSION_ICONS.default;
            return (
              <Link key={j._id} href={`/artisan/jobs/${j._id}`} className="flex items-center gap-4 bg-white border border-outline-variant/20 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all group" style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.04)' }}>
                <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-[16px] font-bold text-on-surface truncate">{j.title}</h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 capitalize" style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}>{map.label}</span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">{j.customer?.name ?? 'Customer'} · {j.skill}</p>
                  <p className="text-[12px] text-outline mt-0.5">{formatDate(j.createdAt)}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors flex-shrink-0" style={{ fontSize: '20px' }}>chevron_right</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
