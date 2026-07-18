'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP } from '@/lib/constants';

interface SearchResults {
  users?: { _id: string; name: string; phone?: string; role: string; createdAt: string }[];
  artisans?: { _id: string; name?: string; userId?: { name: string; phone?: string }; skills?: string[]; isPro?: boolean }[];
  jobs?: { _id: string; title: string; skill: string; status: string; createdAt: string; customer?: { name: string } }[];
}

export default function AdminSearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await api.get('/api/admin/search', { params: { q: query.trim() } });
      setResults(r.data.data ?? r.data);
    } catch {
      // Try separate endpoints
      const [uRes, aRes, jRes] = await Promise.allSettled([
        api.get('/api/admin/users', { params: { search: query, limit: '5' } }),
        api.get('/api/admin/artisans', { params: { search: query, limit: '5' } }),
        api.get('/api/admin/jobs', { params: { search: query, limit: '5' } }),
      ]);
      setResults({
        users:    uRes.status === 'fulfilled' ? (uRes.value.data.data ?? uRes.value.data.users ?? []) : [],
        artisans: aRes.status === 'fulfilled' ? (aRes.value.data.data ?? aRes.value.data.artisans ?? []) : [],
        jobs:     jRes.status === 'fulfilled' ? (jRes.value.data.data ?? jRes.value.data.jobs ?? []) : [],
      });
    } finally {
      setLoading(false);
    }
  };

  const total = (results?.users?.length ?? 0) + (results?.artisans?.length ?? 0) + (results?.jobs?.length ?? 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-[28px] font-black text-on-surface mb-1">Search</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Search across users, artisans, and jobs</p>

      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Search by name, phone, artisan code, job title…"
            className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          />
        </div>
        <button onClick={search} disabled={loading || !query.trim()}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          Search
        </button>
      </div>

      {results !== null && (
        <div className="space-y-6">
          {total === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-symbols-outlined text-[56px] text-outline-variant mb-3">search_off</span>
              <p className="text-[18px] font-bold text-on-surface mb-1">No results for "{query}"</p>
              <p className="text-[14px] text-on-surface-variant">Try a different name, phone number, or artisan code.</p>
            </div>
          ) : (
            <>
              {results.users && results.users.length > 0 && (
                <div>
                  <h2 className="text-[16px] font-bold text-on-surface mb-3">Users ({results.users.length})</h2>
                  <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/20">
                    {results.users.map((u) => (
                      <div key={u._id} className="flex items-center gap-3 px-5 py-4">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="text-[14px] font-black text-primary">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-on-surface">{u.name}</p>
                          <p className="text-[12px] text-outline">{u.phone ?? ''} · Joined {formatDate(u.createdAt)}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${u.role === 'artisan' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.artisans && results.artisans.length > 0 && (
                <div>
                  <h2 className="text-[16px] font-bold text-on-surface mb-3">Artisans ({results.artisans.length})</h2>
                  <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/20">
                    {results.artisans.map((a) => {
                      const name = a.name ?? a.userId?.name ?? 'Unknown';
                      return (
                        <Link key={a._id} href={`/admin/artisans/${a._id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                            <span className="text-[14px] font-black text-on-secondary-container">{name[0]?.toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-on-surface">{name}</p>
                            <p className="text-[12px] text-outline">{(a.skills ?? []).slice(0, 2).join(', ')}</p>
                          </div>
                          {a.isPro && <span className="text-[11px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full flex-shrink-0">PRO</span>}
                          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '18px' }}>chevron_right</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.jobs && results.jobs.length > 0 && (
                <div>
                  <h2 className="text-[16px] font-bold text-on-surface mb-3">Jobs ({results.jobs.length})</h2>
                  <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/20">
                    {results.jobs.map((j) => {
                      const map = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
                      return (
                        <Link key={j._id} href={`/admin/jobs/${j._id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-on-surface">{j.title}</p>
                            <p className="text-[12px] text-outline">{j.customer?.name ?? 'Customer'} · {j.skill} · {formatDate(j.createdAt)}</p>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '18px' }}>chevron_right</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {results === null && (
        <div className="flex flex-col items-center py-16 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">manage_search</span>
          <p className="text-[15px]">Enter a name, phone number, artisan code, or job title to search</p>
        </div>
      )}
    </div>
  );
}
