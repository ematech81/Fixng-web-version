'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_MAP, PROFESSION_ICONS } from '@/lib/constants';

interface Job {
  _id: string;
  title: string;
  skill: string;
  description?: string;
  status: string;
  urgency?: string;
  createdAt: string;
  customer?: { _id: string; name: string; phone?: string };
  artisan?: { _id: string; userId?: { name: string; phone?: string }; name?: string };
  location?: { state?: string; lga?: string; address?: string };
  voiceNote?: string;
  photos?: string[];
}

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [job,    setJob]    = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/admin/jobs/${id}`)
      .then((r) => setJob(r.data.data ?? r.data.job ?? r.data))
      .catch(() => api.get(`/api/jobs/${id}`).then((r) => setJob(r.data.data ?? r.data.job ?? r.data)).catch(() => setError('Failed to load job.')))
      .finally(() => setLoading(false));
  }, [id]);

  const doAction = async (action: string) => {
    setActing(true); setError(null); setSuccess(null);
    try {
      const r = await api.patch(`/api/admin/jobs/${id}/${action}`, {});
      setJob(r.data.data ?? r.data.job ?? job);
      setSuccess(`Job ${action} applied.`);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>;
  if (error || !job) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="material-symbols-outlined text-[56px] text-error mb-3">error</span>
      <p className="text-[16px] font-bold">{error ?? 'Not found'}</p>
      <button onClick={() => router.back()} className="text-primary mt-3 hover:underline text-[14px]">Go Back</button>
    </div>
  );

  const map  = JOB_STATUS_MAP[job.status] ?? { label: job.status, color: '#9CA3AF', bg: '#F9FAFB' };
  const icon = PROFESSION_ICONS[job.skill] ?? PROFESSION_ICONS.default;
  const artisanName = job.artisan?.name ?? job.artisan?.userId?.name;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-[14px] font-medium mb-6 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Back to Jobs
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-[24px] font-black text-on-surface">{job.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full border" style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}>{map.label}</span>
            <span className="text-[12px] text-outline">{job.skill}</span>
            <span className="text-[12px] text-outline">· {formatDate(job.createdAt)}</span>
          </div>
        </div>
      </div>

      {error   && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4">{error}</div>}
      {success && <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-xl text-[13px] mb-4">{success}</div>}

      {/* Parties */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Customer</p>
          <p className="text-[15px] font-bold text-on-surface">{job.customer?.name ?? '—'}</p>
          <p className="text-[12px] text-outline">{job.customer?.phone ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Artisan</p>
          <p className="text-[15px] font-bold text-on-surface">{artisanName ?? 'Unassigned'}</p>
          {artisanName && job.artisan?._id && (
            <Link href={`/admin/artisans/${job.artisan._id}`} className="text-[12px] text-primary hover:underline">View profile →</Link>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 mb-5 space-y-3">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Job Details</h3>
        {job.description && (
          <div><p className="text-[12px] font-semibold text-outline mb-1">Description</p><p className="text-[14px] text-on-surface">{job.description}</p></div>
        )}
        {job.location && (
          <div><p className="text-[12px] font-semibold text-outline mb-1">Location</p><p className="text-[14px] text-on-surface">{[job.location.address, job.location.lga, job.location.state].filter(Boolean).join(', ')}</p></div>
        )}
        {job.urgency && (
          <div><p className="text-[12px] font-semibold text-outline mb-1">Urgency</p><p className="text-[14px] text-on-surface capitalize">{job.urgency.replace('_', ' ')}</p></div>
        )}
      </div>

      {/* Photos */}
      {job.photos && job.photos.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-5">
          <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photos.map((ph, i) => <a key={i} href={ph} target="_blank" rel="noopener noreferrer"><img src={ph} alt="" className="w-full aspect-square rounded-xl object-cover" /></a>)}
          </div>
        </div>
      )}

      {/* Admin actions */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => doAction('cancel')} disabled={acting || ['completed', 'cancelled'].includes(job.status)}
            className="py-2.5 border border-error text-error rounded-xl text-[13px] font-bold hover:bg-error-container transition-all disabled:opacity-40">
            Cancel Job
          </button>
          <button onClick={() => doAction('resolve-dispute')} disabled={acting || job.status !== 'disputed'}
            className="py-2.5 border border-tertiary text-tertiary rounded-xl text-[13px] font-bold hover:bg-tertiary-container transition-all disabled:opacity-40">
            Resolve Dispute
          </button>
          <button onClick={() => doAction('force-complete')} disabled={acting || job.status === 'completed'}
            className="py-2.5 border border-secondary text-secondary rounded-xl text-[13px] font-bold hover:bg-secondary-container transition-all disabled:opacity-40">
            Force Complete
          </button>
          <button onClick={() => doAction('refund')} disabled={acting}
            className="py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-[13px] font-bold hover:bg-surface-container transition-all disabled:opacity-40">
            Refund Customer
          </button>
        </div>
      </div>
    </div>
  );
}
