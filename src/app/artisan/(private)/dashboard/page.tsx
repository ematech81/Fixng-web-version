'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';
import { JOB_STATUS_MAP, PROFESSION_ICONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface Job {
  _id: string;
  title?: string | null;
  category: string;
  status: string;
  createdAt: string;
  customer?: { name: string };
  location?: { state?: string; address?: string };
}

interface Stats {
  completedJobs: number;
  averageRating: number;
  totalRatings: number;
  pendingJobs: number;
}

interface NewJobAlert {
  jobId: string;
  category: string;
  description: string;
  address?: string;
  state?: string;
  urgency?: string;
  isDirect?: boolean;
}

export default function ArtisanDashboard() {
  const { user, artisanProfile } = useAuth();
  const socket = useSocket();
  const profile = artisanProfile as { badgeLevel?: string; isPro?: boolean; stats?: Stats; onboardingComplete?: boolean } | null;

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [jobs,      setJobs]      = useState<Job[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [jobAlerts, setJobAlerts] = useState<NewJobAlert[]>([]);

  const loadData = useCallback(() => {
    Promise.all([
      api.get('/api/jobs/my', { params: { limit: '20' } }).catch(() => ({ data: { data: [] } })),
      api.get('/api/artisans/me/stats').catch(() => ({ data: null })),
    ]).then(([jobRes, statRes]) => {
      setJobs(jobRes.data.data ?? jobRes.data.jobs ?? []);
      setStats(statRes.data?.data ?? statRes.data?.stats ?? profile?.stats ?? null);
    }).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time new job alerts
  useEffect(() => {
    if (!socket) return;
    const onNewJob = (data: NewJobAlert) => {
      setJobAlerts((prev) => [data, ...prev].slice(0, 3));
    };
    socket.on('new_job', onNewJob);
    return () => { socket.off('new_job', onNewJob); };
  }, [socket]);

  const dismissAlert = (jobId: string) =>
    setJobAlerts((prev) => prev.filter((a) => a.jobId !== jobId));

  const activeJobs = jobs.filter((j) => ['pending', 'accepted', 'in-progress'].includes(j.status));

  const statCards = [
    { icon: 'work',    label: 'Jobs Done', value: stats?.completedJobs ?? 0,                              color: 'text-primary'   },
    { icon: 'star',    label: 'Rating',    value: stats?.averageRating ? stats.averageRating.toFixed(1) : '—', color: 'text-secondary' },
    { icon: 'reviews', label: 'Reviews',   value: stats?.totalRatings  ?? 0,                              color: 'text-tertiary'  },
    { icon: 'pending', label: 'Pending',   value: stats?.pendingJobs   ?? activeJobs.filter((j) => j.status === 'pending').length, color: 'text-outline' },
  ];

  return (
    <div className="py-8 px-4 md:px-8">

      {/* Real-time job alerts */}
      {jobAlerts.map((alert) => (
        <div key={alert.jobId}
          className="mb-4 bg-white border-2 border-primary/40 rounded-2xl p-4 flex items-start gap-4 shadow-md"
          style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.12)' }}
        >
          <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-black text-on-surface">
                {alert.isDirect ? '🎯 Direct Job Request' : '📋 New Job Near You'}
              </p>
              {alert.urgency === 'emergency' && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">URGENT</span>
              )}
            </div>
            <p className="text-[13px] font-semibold text-primary">{alert.category}</p>
            <p className="text-[12px] text-on-surface-variant truncate">{alert.description}</p>
            {(alert.address || alert.state) && (
              <p className="text-[11px] text-outline mt-0.5">📍 {alert.address || alert.state}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link href={`/artisan/jobs/${alert.jobId}`}
              onClick={() => dismissAlert(alert.jobId)}
              className="text-[12px] font-bold bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:brightness-110 transition-all text-center">
              View
            </Link>
            <button onClick={() => dismissAlert(alert.jobId)}
              className="text-[11px] text-outline hover:text-on-surface transition-colors text-center">
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {/* Greeting */}
      <div className="mb-8">
        <p className="text-[14px] text-on-surface-variant font-medium mb-1">
          {user?.artisanCode && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>badge</span>
              Code: {user.artisanCode}
            </span>
          )}
        </p>
        <h1 className="text-[24px] md:text-[32px] font-black text-on-surface tracking-tight">{greeting}, {firstName} 👋</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">
          {activeJobs.length > 0
            ? `You have ${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}.`
            : 'No active jobs right now.'}
        </p>
      </div>

      {/* Onboarding alert */}
      {profile && !profile.onboardingComplete && (
        <div className="mb-6 bg-secondary-container text-on-secondary-container rounded-2xl p-5 flex items-start gap-3">
          <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>info</span>
          <div>
            <p className="text-[15px] font-bold mb-1">Complete your profile to get discovered</p>
            <p className="text-[13px] mb-3">Add your skills, bio, and location to start receiving job requests.</p>
            <Link href="/artisan/profile" className="bg-on-secondary-container text-secondary-container px-4 py-1.5 rounded-lg text-[13px] font-bold hover:brightness-110 transition-all inline-flex items-center gap-1">
              Complete Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 text-center border border-outline-variant/20 shadow-sm">
            <span className={`material-symbols-outlined ${color} mb-2 block`} style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            <p className="text-[24px] font-black text-on-surface">{loading ? '—' : value}</p>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-[20px] font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/customer/dashboard"
            className="bg-primary text-on-primary rounded-2xl p-5 flex flex-col items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-sm text-center">
            <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>search</span>
            <div>
              <p className="text-[15px] font-bold">Find Artisans</p>
              <p className="text-[12px] opacity-80 mt-0.5">Book a service for yourself</p>
            </div>
          </Link>
          <Link href="/artisan/jobs"
            className="bg-white border border-outline-variant/30 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-primary/30 active:scale-95 transition-all text-center">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>work_history</span>
            <div>
              <p className="text-[15px] font-bold text-on-surface">My Jobs</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">Track your assigned jobs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Active jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-on-surface">Active Jobs</h2>
          <Link href="/artisan/jobs" className="text-primary text-[14px] font-medium hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
        ) : activeJobs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center border border-dashed border-outline-variant rounded-2xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">work_off</span>
            <p className="text-[16px] font-semibold text-on-surface mb-1">No active jobs</p>
            <p className="text-[13px] text-on-surface-variant mb-4">Jobs assigned to you will appear here.</p>
            <Link href="/customer/dashboard"
              className="bg-primary text-on-primary px-5 py-2 rounded-xl text-[13px] font-bold hover:brightness-110 transition-all">
              Find Artisans
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((j) => {
              const map  = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
              const icon = PROFESSION_ICONS[j.category] ?? PROFESSION_ICONS.default;
              return (
                <Link key={j._id} href={`/artisan/jobs/${j._id}`}
                  className="flex items-center gap-4 bg-white border border-outline-variant/20 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15px] font-bold text-on-surface truncate">{j.title ?? j.category}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                    </div>
                    <p className="text-[12px] text-outline">{j.customer?.name ?? 'Customer'} · {formatDate(j.createdAt)}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors" style={{ fontSize: '20px' }}>chevron_right</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {jobs.length > 0 && (
        <div>
          <h2 className="text-[20px] font-bold text-on-surface mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/20">
            {jobs.slice(0, 5).map((j) => {
              const map = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
              return (
                <Link key={j._id} href={`/artisan/jobs/${j._id}`}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
                      {PROFESSION_ICONS[j.category] ?? PROFESSION_ICONS.default}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface truncate">{j.title ?? j.category}</p>
                    <p className="text-[12px] text-outline">{formatDate(j.createdAt)}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
