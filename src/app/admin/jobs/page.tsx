'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP } from '@/lib/constants';

interface Job {
  _id: string;
  title: string;
  skill: string;
  status: string;
  createdAt: string;
  customer?: { name: string };
  artisan?: { userId?: { name: string }; name?: string };
}

const STATUSES = ['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'];

export default function AdminJobsPage() {
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('all');
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (status !== 'all') params.status = status;

    api.get('/api/admin/jobs', { params })
      .then((r) => { setJobs(r.data.data ?? r.data.jobs ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => { setJobs([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Jobs</h1>
          <p className="text-[14px] text-on-surface-variant">{total} total jobs on platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search jobs…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border whitespace-nowrap transition-all capitalize ${status === s ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
            {s === 'all' ? 'All' : s.replace('-', '‑')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2 block">work_off</span>
            <p className="text-[16px] font-bold text-on-surface">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Job</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Customer</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Artisan</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {jobs.map((j) => {
                  const map = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
                  const artisanName = j.artisan?.name ?? j.artisan?.userId?.name;
                  return (
                    <tr key={j._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-on-surface">{j.title}</p>
                        <p className="text-[12px] text-outline">{j.skill}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-on-surface-variant">{j.customer?.name ?? '—'}</td>
                      <td className="px-5 py-4 hidden lg:table-cell text-on-surface-variant">{artisanName ?? <span className="text-outline">Unassigned</span>}</td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-[12px] text-outline">{formatDate(j.createdAt)}</td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/jobs/${j._id}`} className="text-primary text-[13px] font-medium hover:underline whitespace-nowrap">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-[13px] text-on-surface-variant">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-outline-variant text-[13px] font-medium disabled:opacity-40 hover:bg-surface-container transition-all">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-outline-variant text-[13px] font-medium disabled:opacity-40 hover:bg-surface-container transition-all">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
