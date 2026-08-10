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
  customerId?: { name: string } | null;
  assignedArtisanId?: { name: string } | null;
  location?: { state?: string; address?: string };
  _myRole: 'artisan' | 'customer';
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
  const [subStatus, setSubStatus] = useState<{ status: string; daysRemaining: number | null; graceEndsAt: string | null; isCancelling?: boolean } | null>(null);

  // Load subscription status alongside other data
  useEffect(() => {
    api.get('/api/subscriptions/me')
      .then((r) => setSubStatus(r.data.data ?? null))
      .catch(() => { /* non-fatal — subscription banner is optional */ });
  }, []);

  const loadData = useCallback(() => {
    Promise.all([
      api.get('/api/jobs/my', { params: { limit: '20' } }).catch(() => ({ data: { data: [] } })),
      api.get('/api/jobs/my', { params: { limit: '20', as: 'customer' } }).catch(() => ({ data: { data: [] } })),
      api.get('/api/artisans/me/stats').catch(() => ({ data: null })),
    ]).then(([artisanRes, customerRes, statRes]) => {
      const artisanJobs: Job[] = (artisanRes.data.data ?? artisanRes.data.jobs ?? []).map(
        (j: Omit<Job, '_myRole'>) => ({ ...j, _myRole: 'artisan' as const })
      );
      const customerJobs: Job[] = (customerRes.data.data ?? customerRes.data.jobs ?? []).map(
        (j: Omit<Job, '_myRole'>) => ({ ...j, _myRole: 'customer' as const })
      );
      // Deduplicate by _id — artisan role wins
      const seen = new Set<string>();
      const merged: Job[] = [];
      for (const j of [...artisanJobs, ...customerJobs]) {
        if (!seen.has(j._id)) { seen.add(j._id); merged.push(j); }
      }
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(merged);
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
    { icon: 'work',    label: 'Jobs Done', value: stats?.completedJobs ?? 0,                                   color: 'text-primary'   },
    { icon: 'star',    label: 'Rating',    value: stats?.averageRating ? stats.averageRating.toFixed(1) : '—', color: 'text-secondary' },
    { icon: 'reviews', label: 'Reviews',   value: stats?.totalRatings  ?? 0,                                   color: 'text-tertiary'  },
    { icon: 'pending', label: 'Pending',   value: stats?.pendingJobs   ?? activeJobs.filter((j) => j.status === 'pending').length, color: 'text-outline' },
  ];

  return (
    <div>

      {/* ── Hero banner (primary colour — no user image) ── */}
      <div className="relative overflow-hidden" style={{ background: '#004ac6' }}>
        {/* Subtle depth gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #003ba3 0%, #004ac6 45%, #1a5fd8 100%)' }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full opacity-5" style={{ background: '#fff' }} />

        <div className="relative px-4 md:px-8 pt-10 pb-12">
          {user?.artisanCode && (
            <p className="flex items-center gap-1 text-[13px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>badge</span>
              Code: {user.artisanCode}
            </p>
          )}
          <h1 className="text-[26px] md:text-[34px] font-black tracking-tight" style={{ color: '#fff' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {activeJobs.length > 0
              ? `You have ${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}.`
              : 'No active jobs right now.'}
          </p>
        </div>
      </div>

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

      {/* ── Subscription status banners ─────────────────────────── */}
      {subStatus?.status === 'grace' && (
        <div className="mb-6 rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FFF7ED', border: '1px solid #F59E0B' }}>
          <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '22px', color: '#D97706', fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: '#92400E' }}>Pro renewal needed — grace period active</p>
            <p className="text-[13px]" style={{ color: '#78350F' }}>
              {subStatus.graceEndsAt
                ? `You still have Pro access until ${new Date(subStatus.graceEndsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })}. After that your Pro badge will be removed and you will appear lower in search results.`
                : 'Your subscription has lapsed. Renew now to keep your Pro badge and priority placement in search results.'}
            </p>
          </div>
          <Link href="/artisan/upgrade" className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg text-white hover:brightness-110 transition-all" style={{ background: '#D97706' }}>
            Renew
          </Link>
        </div>
      )}
      {subStatus?.status === 'expired' && (
        <div className="mb-6 rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FFF7ED', border: '1px solid #F59E0B' }}>
          <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '22px', color: '#D97706', fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: '#92400E' }}>Your Pro subscription has ended</p>
            <p className="text-[13px]" style={{ color: '#78350F' }}>You are still visible to clients and can still receive job requests. However, your Pro badge has been removed and you will appear lower in search results. Upgrade to Pro to get priority placement and stand out to more clients.</p>
          </div>
          <Link href="/artisan/upgrade" className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg text-white hover:brightness-110 transition-all" style={{ background: '#D97706' }}>
            Upgrade to Pro
          </Link>
        </div>
      )}
      {subStatus?.status === 'trial' && (subStatus.daysRemaining ?? 0) <= 2 && (
        <div className="mb-6 rounded-2xl p-4 flex items-start gap-3" style={{ background: '#e8f0fe', border: '1px solid #3b82f6' }}>
          <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '22px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: '#1e3a8a' }}>Free Trial Ending Soon</p>
            <p className="text-[13px]" style={{ color: '#1e40af' }}>
              Your 7-day trial ends in {subStatus.daysRemaining ?? 0} day{subStatus.daysRemaining !== 1 ? 's' : ''}. Subscribe to keep Pro access.
            </p>
          </div>
          <Link href="/artisan/upgrade" className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg text-white hover:brightness-110 transition-all" style={{ background: '#004ac6' }}>
            Subscribe
          </Link>
        </div>
      )}

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
            <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>home_repair_service</span>
            <div>
              <p className="text-[15px] font-bold">Book a Service</p>
              <p className="text-[12px] opacity-80 mt-0.5">Hire another professional</p>
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
              Book a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((j) => {
              const map     = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
              const icon    = PROFESSION_ICONS[j.category] ?? PROFESSION_ICONS.default;
              const href    = j._myRole === 'artisan' ? `/artisan/jobs/${j._id}` : `/customer/jobs/${j._id}`;
              const subtitle = j._myRole === 'artisan'
                ? `${j.customerId?.name ?? 'Customer'} · ${formatDate(j.createdAt)}`
                : `You posted · ${formatDate(j.createdAt)}`;
              return (
                <Link key={j._id} href={href}
                  className="flex items-center gap-4 bg-white border border-outline-variant/20 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[15px] font-bold text-on-surface truncate">{j.title ?? j.category}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                      {j._myRole === 'customer' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Posted by me</span>
                      )}
                    </div>
                    <p className="text-[12px] text-outline">{subtitle}</p>
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
              const map  = JOB_STATUS_MAP[j.status] ?? { label: j.status, color: '#9CA3AF', bg: '#F9FAFB' };
              const href = j._myRole === 'artisan' ? `/artisan/jobs/${j._id}` : `/customer/jobs/${j._id}`;
              return (
                <Link key={j._id} href={href}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
                      {PROFESSION_ICONS[j.category] ?? PROFESSION_ICONS.default}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-on-surface truncate">{j.title ?? j.category}</p>
                      {j._myRole === 'customer' && (
                        <span className="text-[9px] font-bold px-1.5 py-0 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Posted</span>
                      )}
                    </div>
                    <p className="text-[12px] text-outline">{formatDate(j.createdAt)}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: map.color, background: map.bg }}>{map.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      </div>{/* end py-8 content */}
    </div>
  );
}
