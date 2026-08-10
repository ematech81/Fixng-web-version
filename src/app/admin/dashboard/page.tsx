'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP } from '@/lib/constants';

interface Stats { totalUsers?: number; totalVerifiedArtisans?: number; totalJobs?: number; activeJobs?: number; pendingVerifications?: number; openComplaints?: number; }
interface RecentJob { _id: string; title: string; skill: string; status: string; createdAt: string; customer?: { name: string }; }
interface RecentUser { _id: string; name: string; role: string; createdAt: string; }

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats').catch(() => ({ data: null })),
      api.get('/api/admin/jobs?limit=5&sort=newest').catch(() => api.get('/api/jobs?limit=5')),
      api.get('/api/admin/users?limit=5&sort=newest').catch(() => ({ data: { data: [] } })),
    ]).then(([sRes, jRes, uRes]) => {
      setStats(sRes.data?.data ?? sRes.data?.stats ?? sRes.data);
      setRecentJobs(jRes.data?.data ?? jRes.data?.jobs ?? []);
      setRecentUsers(uRes.data?.data ?? uRes.data?.users ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: 'group',          label: 'Total Users',     value: stats?.totalUsers,             href: '/admin/users',        color: 'text-primary',   urgent: false },
    { icon: 'handyman',       label: 'Verified Artisans', value: stats?.totalVerifiedArtisans, href: '/admin/artisans',    color: 'text-secondary', urgent: false },
    { icon: 'work',           label: 'Total Jobs',      value: stats?.totalJobs,              href: '/admin/jobs',         color: 'text-tertiary',  urgent: false },
    { icon: 'pending',        label: 'Active Jobs',     value: stats?.activeJobs,             href: '/admin/jobs',         color: 'text-outline',   urgent: false },
    { icon: 'verified_user',  label: 'Pending Reviews', value: stats?.pendingVerifications,   href: '/admin/verification', color: 'text-primary',   urgent: (stats?.pendingVerifications ?? 0) > 0 },
    { icon: 'report',         label: 'Open Complaints', value: stats?.openComplaints,         href: '/admin/complaints',   color: 'text-error',     urgent: (stats?.openComplaints ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="text-[28px] font-black text-on-surface mb-1">Admin Dashboard</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Platform overview and key metrics</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ icon, label, value, href, color, urgent }) => (
          <Link key={label} href={href}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all relative overflow-hidden ${urgent ? 'border-error/40 hover:border-error/60' : 'border-outline-variant/20 hover:border-primary/20'}`}>
            {urgent && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-error animate-pulse" />}
            <span className={`material-symbols-outlined ${color} mb-2 block`} style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            <p className="text-[26px] font-black text-on-surface">{loading ? '—' : (value ?? '—')}</p>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</p>
            {urgent && <p className="text-[10px] font-bold text-error mt-1">ACTION REQUIRED</p>}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-outline-variant/20">
            <h2 className="text-[16px] font-bold text-on-surface">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-primary text-[13px] font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl skeleton" />)}</div>
          ) : recentJobs.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-[14px]">No jobs yet.</div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {recentJobs.map((j) => {
                const map = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
                return (
                  <Link key={j._id} href={`/admin/jobs/${j._id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface-container-low transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-on-surface truncate">{j.title}</p>
                      <p className="text-[12px] text-outline">{j.customer?.name ?? 'Customer'} · {formatDate(j.createdAt)}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-outline-variant/20">
            <h2 className="text-[16px] font-bold text-on-surface">New Users</h2>
            <Link href="/admin/users" className="text-primary text-[13px] font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl skeleton" />)}</div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-[14px]">No users yet.</div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-6 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-black text-primary">{u.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface truncate">{u.name}</p>
                    <p className="text-[12px] text-outline">{formatDate(u.createdAt)}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${u.role === 'artisan' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
