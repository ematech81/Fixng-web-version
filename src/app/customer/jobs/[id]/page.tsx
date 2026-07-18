'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { formatDate, formatTime, getInitials } from '@/lib/utils';
import { JOB_STATUS_MAP, PROFESSION_ICONS } from '@/lib/constants';

interface JobDetail {
  _id: string;
  title: string;
  description: string;
  skill: string;
  status: string;
  urgency: string;
  createdAt: string;
  scheduledDate?: string | null;
  location?: { address?: string; state?: string; lga?: string };
  artisan?: {
    id: string; name: string;
    profilePhoto?: string | null;
    skills?: string[];
    stats?: { averageRating: number; completedJobs: number };
  } | null;
  customerRating?: { overallScore: number; comment?: string } | null;
}

const STATUS_FLOW = ['pending', 'accepted', 'in-progress', 'completed'];

export default function CustomerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [job,     setJob]     = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/jobs/${id}`)
      .then((r) => setJob(r.data.data ?? r.data.job ?? r.data))
      .catch(() => setError('Job not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    setCancelling(true);
    try {
      await api.put(`/api/jobs/${id}/cancel`);
      setJob((j) => j ? { ...j, status: 'cancelled' } : j);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to cancel job.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="py-8 px-4 md:px-8 space-y-4">
      <div className="h-8 w-48 rounded skeleton" />
      <div className="h-40 rounded-2xl skeleton" />
      <div className="h-32 rounded-2xl skeleton" />
    </div>
  );

  if (error || !job) return (
    <div className="py-16 flex flex-col items-center text-center gap-4">
      <span className="material-symbols-outlined text-[64px] text-outline-variant">work_off</span>
      <p className="text-[18px] font-bold text-on-surface">Job not found</p>
      <Link href="/customer/jobs" className="text-primary font-bold hover:underline">← Back to My Jobs</Link>
    </div>
  );

  const map        = JOB_STATUS_MAP[job.status] ?? { label: job.status, color: '#9CA3AF', bg: '#F9FAFB' };
  const stepIndex  = STATUS_FLOW.indexOf(job.status);
  const isActive   = ['pending', 'accepted', 'in-progress'].includes(job.status);
  const icon       = PROFESSION_ICONS[job.skill] ?? PROFESSION_ICONS.default;

  return (
    <div className="py-8 px-4 md:px-8 max-w-3xl">

      {/* Back */}
      <Link href="/customer/jobs" className="inline-flex items-center gap-1 text-primary text-[14px] font-medium hover:underline mb-6">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        My Jobs
      </Link>

      {/* Job header card */}
      <div className="bg-white rounded-2xl p-6 mb-4 border border-outline-variant/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h1 className="text-[22px] font-black text-on-surface leading-tight">{job.title}</h1>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full border flex-shrink-0 capitalize" style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}>
                {map.label}
              </span>
            </div>
            <p className="text-[13px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
              Posted {formatDate(job.createdAt)}
              {job.skill && <span className="mx-1">·</span>}
              {job.skill && <span className="capitalize">{job.skill}</span>}
            </p>
          </div>
        </div>

        <p className="text-[15px] text-on-surface-variant mt-4 leading-relaxed">{job.description}</p>

        {/* Location */}
        {job.location && (job.location.address || job.location.state) && (
          <div className="mt-4 flex items-start gap-2 text-[14px] text-on-surface-variant">
            <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px' }}>location_on</span>
            <span>{[job.location.address, job.location.lga, job.location.state].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Urgency */}
        {job.urgency && (
          <div className="mt-2 flex items-center gap-2 text-[14px] text-on-surface-variant">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>flash_on</span>
            <span className="capitalize">{job.urgency.replace('_', ' ')}</span>
            {job.scheduledDate && <span>· {formatDate(job.scheduledDate)} at {formatTime(job.scheduledDate)}</span>}
          </div>
        )}
      </div>

      {/* Status timeline */}
      {!['cancelled', 'disputed'].includes(job.status) && (
        <div className="bg-white rounded-2xl p-6 mb-4 border border-outline-variant/20 shadow-sm">
          <h3 className="text-[15px] font-bold text-on-surface mb-5">Job Progress</h3>
          <div className="flex items-start">
            {STATUS_FLOW.map((s, i) => {
              const done  = i <= stepIndex;
              const label = JOB_STATUS_MAP[s]?.label ?? s;
              return (
                <div key={s} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${i <= stepIndex ? 'bg-primary' : 'bg-outline-variant'}`} />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-white text-on-surface-variant'}`}>
                    {done
                      ? <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>
                      : <span className="text-[12px] font-bold">{i + 1}</span>
                    }
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 text-center px-1 ${done ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assigned artisan */}
      {job.artisan && (
        <div className="bg-white rounded-2xl p-6 mb-4 border border-outline-variant/20 shadow-sm">
          <h3 className="text-[15px] font-bold text-on-surface mb-4">Assigned Artisan</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-container overflow-hidden flex-shrink-0">
              {job.artisan.profilePhoto ? (
                <Image src={job.artisan.profilePhoto} alt={job.artisan.name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[18px] font-black text-primary/50">{getInitials(job.artisan.name)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-on-surface">{job.artisan.name}</p>
              {job.artisan.skills?.[0] && <p className="text-[13px] text-on-surface-variant">{job.artisan.skills[0]}</p>}
              {(job.artisan.stats?.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[13px] font-semibold text-on-surface">{job.artisan.stats!.averageRating.toFixed(1)}</span>
                  <span className="text-[12px] text-outline">({job.artisan.stats!.completedJobs} jobs)</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/artisan/${job.artisan.id}`} className="text-[13px] font-bold text-primary hover:underline">View Profile</Link>
              <Link href={`/customer/messages/${job._id}`} className="flex items-center gap-1 text-[13px] font-bold text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat_bubble</span>
                Chat
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isActive && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-5 py-2.5 border border-error text-error rounded-xl text-[14px] font-semibold hover:bg-error-container transition-all disabled:opacity-50"
          >
            {cancelling ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>}
            Cancel Job
          </button>
        )}
        {job.status === 'completed' && !job.customerRating && (
          <Link
            href={`/customer/jobs/${job._id}/rate`}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-on-secondary rounded-xl text-[14px] font-semibold hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>star</span>
            Rate Artisan
          </Link>
        )}
        {job.artisan && (
          <Link
            href={`/customer/messages/${job._id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-container/20 text-primary border border-primary/20 rounded-xl text-[14px] font-semibold hover:bg-primary-container/30 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat_bubble</span>
            Message Artisan
          </Link>
        )}
        <button onClick={() => router.push('/customer/post-job')} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-low border border-outline-variant text-on-surface-variant rounded-xl text-[14px] font-semibold hover:border-primary hover:text-primary transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Job
        </button>
      </div>
    </div>
  );
}
