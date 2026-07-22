'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP, PROFESSION_ICONS } from '@/lib/constants';

interface Job {
  _id: string;
  title?: string | null;
  description: string;
  category: string;
  status: string;
  urgency?: string;
  createdAt: string;
  location?: { address?: string; state?: string; lga?: string };
  assignedArtisanId?: { _id: string; name: string } | null;
}

const TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES = ['pending', 'accepted', 'in-progress'];

function JobCard({ job }: { job: Job }) {
  const map  = JOB_STATUS_MAP[job.status] ?? { label: job.status, color: '#9CA3AF', bg: '#F9FAFB' };
  const icon = PROFESSION_ICONS[job.category] ?? PROFESSION_ICONS.default;
  const displayTitle = job.title || job.category;

  return (
    <Link
      href={`/customer/jobs/${job._id}`}
      className="bg-white border border-outline-variant/20 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all group"
      style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.04)' }}
    >
      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-[16px] font-bold text-on-surface truncate">{displayTitle}</h3>
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 capitalize"
            style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}
          >
            {map.label}
          </span>
        </div>
        <p className="text-[13px] text-on-surface-variant truncate mb-1">{job.description}</p>
        <div className="flex items-center gap-3 text-[12px] text-outline flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
            {formatDate(job.createdAt)}
          </span>
          {job.location?.state && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
              {job.location.state}
            </span>
          )}
          {job.assignedArtisanId?.name && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>handyman</span>
              {job.assignedArtisanId.name}
            </span>
          )}
        </div>
      </div>
      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors flex-shrink-0" style={{ fontSize: '20px' }}>
        chevron_right
      </span>
    </Link>
  );
}

// ── Success banner shown after posting a job ──────────────────────────────────
function PostedBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="mb-6 bg-white border border-green-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm"
      style={{ boxShadow: '0 4px 20px rgba(34,197,94,0.10)' }}
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="material-symbols-outlined text-green-600" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-black text-on-surface mb-0.5">Job posted successfully! 🎉</p>
        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          Your request is live. We&apos;ve notified nearby artisans who match your job.
          You&apos;ll receive an alert the moment someone accepts — usually within minutes.
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-[12px] text-green-700 font-semibold">
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            We&apos;ll notify you instantly when accepted
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-outline font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
            Usually accepted within minutes
          </div>
        </div>
      </div>

      {/* Dismiss */}
      <button onClick={onDismiss}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-all">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
      </button>
    </div>
  );
}

// ── Inner page (reads searchParams) ──────────────────────────────────────────
function CustomerJobsInner() {
  const searchParams = useSearchParams();
  const justPosted   = searchParams.get('posted') === 'true';

  const [tab,         setTab]         = useState('all');
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showBanner,  setShowBanner]  = useState(justPosted);

  useEffect(() => {
    setLoading(true);
    api.get('/api/jobs/my', { params: { limit: '50', as: 'customer' } })
      .then((r) => setJobs(r.data.data ?? r.data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    if (tab === 'all')       return true;
    if (tab === 'active')    return ACTIVE_STATUSES.includes(j.status);
    if (tab === 'completed') return j.status === 'completed';
    if (tab === 'cancelled') return j.status === 'cancelled';
    return true;
  });

  return (
    <div className="py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">My Jobs</h1>
          <p className="text-[14px] text-on-surface-variant">Track all your service requests</p>
        </div>
        <Link
          href="/customer/post-job"
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-[14px] hover:brightness-110 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Job
        </Link>
      </div>

      {/* Success banner */}
      {showBanner && <PostedBanner onDismiss={() => setShowBanner(false)} />}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline-variant overflow-x-auto pb-0">
        {TABS.map(({ key, label }) => {
          const count =
            key === 'all'       ? jobs.length :
            key === 'active'    ? jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length :
            jobs.filter((j) => j.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-all ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">work_off</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">
            {tab === 'all' ? 'No jobs yet' : `No ${tab} jobs`}
          </p>
          <p className="text-[14px] text-on-surface-variant mb-6">
            {tab === 'all' ? 'Post your first job to get started.' : `You have no ${tab} jobs right now.`}
          </p>
          {tab === 'all' && (
            <Link href="/customer/post-job" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-[14px] hover:brightness-110 transition-all">
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => <JobCard key={j._id} job={j} />)}
        </div>
      )}
    </div>
  );
}

export default function CustomerJobsPage() {
  return (
    <Suspense fallback={
      <div className="py-8 px-4 md:px-8">
        <div className="h-10 w-48 rounded-xl skeleton mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      </div>
    }>
      <CustomerJobsInner />
    </Suspense>
  );
}
