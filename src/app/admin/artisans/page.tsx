'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Artisan {
  _id: string;
  userId?: { name: string; phone?: string };
  name?: string;
  phone?: string;
  skills?: string[];
  isPro?: boolean;
  badgeLevel?: string;
  isVerified?: boolean;
  stats?: { completedJobs?: number; averageRating?: number };
  createdAt?: string;
}

export default function AdminArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (filter === 'pro') params.isPro = 'true';
    if (filter === 'verified') params.isVerified = 'true';

    api.get('/api/admin/artisans', { params })
      .then((r) => { setArtisans(r.data.data ?? r.data.artisans ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => { setArtisans([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Artisans</h1>
          <p className="text-[14px] text-on-surface-variant">{total} registered artisans</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search artisans…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {['all', 'pro', 'verified'].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all capitalize ${filter === f ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
            {f === 'all' ? 'All' : f === 'pro' ? 'PRO Only' : 'Verified'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
        ) : artisans.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2 block">handyman</span>
            <p className="text-[16px] font-bold text-on-surface">No artisans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Artisan</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Skills</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Stats</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {artisans.map((a) => {
                  const name = a.name ?? a.userId?.name ?? 'Unknown';
                  return (
                    <tr key={a._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                            <span className="text-[13px] font-black text-primary">{name[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{name}</p>
                            <p className="text-[12px] text-outline">{a.userId?.phone ?? a.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(a.skills ?? []).slice(0, 2).map((s) => (
                            <span key={s} className="text-[11px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">{s}</span>
                          ))}
                          {(a.skills ?? []).length > 2 && <span className="text-[11px] text-outline">+{a.skills!.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-on-surface">{a.stats?.completedJobs ?? 0} jobs</p>
                        <p className="text-[12px] text-outline">{a.stats?.averageRating ? `★ ${a.stats.averageRating.toFixed(1)}` : 'No rating'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {a.isPro && <span className="text-[11px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">PRO</span>}
                          {a.isVerified && <span className="text-[11px] font-bold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">Verified</span>}
                          {!a.isPro && !a.isVerified && <span className="text-[11px] text-outline capitalize">{a.badgeLevel ?? 'new'}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-[12px] text-outline">{a.createdAt ? formatDate(a.createdAt) : '—'}</td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/artisans/${a._id}`} className="text-primary text-[13px] font-medium hover:underline whitespace-nowrap">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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
