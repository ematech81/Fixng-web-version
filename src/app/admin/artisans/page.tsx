'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

// The list API returns flat objects — userId is a string (user's _id), not a nested object
interface Artisan {
  artisanProfileId: string;   // ArtisanProfile document _id
  userId: string;              // User's _id — used as :artisanUserId in admin routes
  name?: string;
  phone?: string;
  email?: string;
  artisanCode?: string;
  skills?: string[];
  isPro?: boolean;
  badgeLevel?: string;
  verificationStatus?: string;
  isSuspended?: boolean;
  isBanned?: boolean;
  warningCount?: number;
  stats?: { completedJobs?: number; averageRating?: number };
  profilePhoto?: { url?: string } | string | null;
  joinedAt?: string;
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
    if (filter === 'pro')      params.isPro      = 'true';
    if (filter === 'verified') params.isVerified = 'true';

    api.get('/api/admin/artisans', { params })
      .then((r) => {
        setArtisans(r.data.data ?? r.data.artisans ?? []);
        setTotal(r.data.total ?? r.data.pagination?.total ?? 0);
      })
      .catch(() => { setArtisans([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  const getPhotoUrl = (photo: Artisan['profilePhoto']): string | null => {
    if (!photo) return null;
    if (typeof photo === 'string') return photo;
    return photo.url ?? null;
  };

  const getStatusBadges = (a: Artisan) => {
    const badges: { label: string; style: string }[] = [];
    if (a.isPro)                           badges.push({ label: 'PRO',       style: 'bg-amber-100 text-amber-700' });
    if (a.verificationStatus === 'verified') badges.push({ label: 'Verified', style: 'bg-tertiary-container text-on-tertiary-container' });
    if (a.isSuspended)                     badges.push({ label: 'Suspended', style: 'bg-error-container text-error' });
    if (a.isBanned)                        badges.push({ label: 'Banned',    style: 'bg-error text-white' });
    if (a.verificationStatus === 'pending') badges.push({ label: 'Pending',  style: 'bg-surface-container text-on-surface-variant' });
    return badges;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Artisans</h1>
          <p className="text-[14px] text-on-surface-variant">{total} registered artisans</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-primary text-[13px] font-semibold hover:bg-primary-container/30 px-3 py-1.5 rounded-xl transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {[
          { value: 'all',      label: 'All' },
          { value: 'pro',      label: 'PRO Only' },
          { value: 'verified', label: 'Verified' },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => { setFilter(value); setPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${filter === value ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}</div>
        ) : artisans.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2 block">handyman</span>
            <p className="text-[16px] font-bold text-on-surface">No artisans found</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {artisans.map((a) => {
              const name     = a.name ?? 'Unknown';
              const photoUrl = getPhotoUrl(a.profilePhoto);
              const badges   = getStatusBadges(a);

              return (
                <div key={a.artisanProfileId ?? a.userId} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors">
                  {/* Avatar / Photo */}
                  <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[15px] font-black text-primary">{name[0]?.toUpperCase()}</span>
                    )}
                  </div>

                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-on-surface">{name}</p>
                      {badges.map((b) => (
                        <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.style}`}>{b.label}</span>
                      ))}
                      {badges.length === 0 && (
                        <span className="text-[11px] text-outline capitalize">{a.badgeLevel ?? 'new'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-outline flex-wrap">
                      {a.phone && <span>{a.phone}</span>}
                      {a.artisanCode && <><span>·</span><span className="font-mono">{a.artisanCode}</span></>}
                      {a.joinedAt && <><span>·</span><span>{formatDate(a.joinedAt)}</span></>}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                    {(a.skills ?? []).slice(0, 2).map((s) => (
                      <span key={s} className="text-[11px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">{s}</span>
                    ))}
                    {(a.skills ?? []).length > 2 && <span className="text-[11px] text-outline">+{a.skills!.length - 2}</span>}
                  </div>

                  {/* Stats */}
                  <div className="hidden lg:block text-right flex-shrink-0 w-20">
                    <p className="text-[13px] font-semibold text-on-surface">{a.stats?.completedJobs ?? 0} jobs</p>
                    <p className="text-[12px] text-outline">
                      {a.stats?.averageRating ? `★ ${a.stats.averageRating.toFixed(1)}` : 'No rating'}
                    </p>
                  </div>

                  {/* View link — uses userId (user's _id) as the route param */}
                  <Link
                    href={`/admin/artisans/${a.userId}`}
                    className="flex-shrink-0 flex items-center gap-1.5 text-primary text-[13px] font-semibold hover:bg-primary-container/30 px-3 py-1.5 rounded-xl transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-[13px] text-on-surface-variant">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
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
