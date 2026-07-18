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
  photos?: string[];
  voiceNote?: string;
  customer?: { _id: string; name: string; phone?: string; email?: string };
  location?: { address?: string; state?: string; lga?: string; coords?: { lat: number; lng: number } };
  artisanResponse?: string;
}

const STATUS_STEPS = ['pending', 'accepted', 'in-progress', 'completed'];

export default function ArtisanJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [job,     setJob]     = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [note,    setNote]    = useState('');

  useEffect(() => {
    api.get(`/api/jobs/${id}`)
      .then((r) => { const j = r.data.data ?? r.data.job ?? r.data; setJob(j); setNote(j.artisanResponse ?? ''); })
      .catch(() => setError('Failed to load job.'))
      .finally(() => setLoading(false));
  }, [id]);

  const act = async (action: string) => {
    setActing(true); setError(null);
    try {
      let r;
      if (action === 'accept')    r = await api.put(`/api/jobs/${id}/accept`,   {});
      else if (action === 'start') r = await api.put(`/api/jobs/${id}/start`,    {});
      else if (action === 'complete') r = await api.put(`/api/jobs/${id}/complete`, { artisanResponse: note });
      else if (action === 'reject') r = await api.put(`/api/jobs/${id}/reject`,  {});
      setJob(r?.data.data ?? r?.data.job ?? r?.data ?? job);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return (
    <div className="py-8 px-4 md:px-8 space-y-4 max-w-2xl">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
    </div>
  );

  if (error || !job) return (
    <div className="py-8 px-4 md:px-8 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-[64px] text-error mb-3">error</span>
      <p className="text-[16px] font-bold text-on-surface mb-2">{error ?? 'Job not found'}</p>
      <button onClick={() => router.back()} className="text-primary font-medium text-[14px] hover:underline">Go Back</button>
    </div>
  );

  const map      = JOB_STATUS_MAP[job.status] ?? { label: job.status, color: '#9CA3AF', bg: '#F9FAFB' };
  const icon     = PROFESSION_ICONS[job.skill] ?? PROFESSION_ICONS.default;
  const stepIdx  = STATUS_STEPS.indexOf(job.status);
  const isActive = ['pending', 'accepted', 'in-progress'].includes(job.status);

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-[14px] font-medium mb-6 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-black text-on-surface leading-tight mb-1">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full border" style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}>{map.label}</span>
            <span className="text-[12px] text-outline">{job.skill}</span>
            <span className="text-[12px] text-outline">· {formatDate(job.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      {isActive && (
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-5">
          <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => {
              const done    = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <div key={s} className="flex-1 flex flex-col items-center relative">
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute left-1/2 top-4 w-full h-0.5 -translate-y-0.5 ${i < stepIdx ? 'bg-primary' : 'bg-outline-variant'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${done ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-outline-variant text-outline-variant'} ${current ? 'ring-4 ring-primary/20' : ''}`}>
                    {done ? <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
                           : <div className="w-2 h-2 rounded-full bg-outline-variant" />}
                  </div>
                  <span className="text-[10px] font-semibold mt-1.5 capitalize text-center text-on-surface-variant">{s.replace('-', '\n')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer */}
      {job.customer && (
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-5">
          <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Customer</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <span className="text-[18px] font-black text-on-surface-variant">{job.customer.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-on-surface">{job.customer.name}</p>
              {job.customer.phone && <p className="text-[13px] text-outline">{job.customer.phone}</p>}
            </div>
          </div>
          <Link href={`/artisan/messages/${id}`} className="flex items-center justify-center gap-2 w-full py-2.5 border border-primary text-primary rounded-xl text-[14px] font-semibold hover:bg-primary-container/20 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat_bubble</span>
            Message Customer
          </Link>
        </div>
      )}

      {/* Job details */}
      <div className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-5 space-y-4">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Job Details</h3>
        {job.description && (
          <div>
            <p className="text-[12px] font-semibold text-outline mb-1">Description</p>
            <p className="text-[14px] text-on-surface leading-relaxed">{job.description}</p>
          </div>
        )}
        {job.location && (
          <div>
            <p className="text-[12px] font-semibold text-outline mb-1">Location</p>
            <p className="text-[14px] text-on-surface">
              {[job.location.address, job.location.lga, job.location.state].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
        {job.urgency && (
          <div>
            <p className="text-[12px] font-semibold text-outline mb-1">Urgency</p>
            <p className="text-[14px] text-on-surface capitalize">{job.urgency.replace('_', ' ')}</p>
          </div>
        )}
      </div>

      {/* Photos */}
      {job.photos && job.photos.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-5">
          <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photos.map((ph, i) => (
              <a key={i} href={ph} target="_blank" rel="noopener noreferrer">
                <img src={ph} alt={`Photo ${i + 1}`} className="w-full aspect-square rounded-xl object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {error && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4">{error}</div>}

      {/* Actions */}
      {job.status === 'pending' && (
        <div className="flex gap-3 mb-4">
          <button onClick={() => act('reject')} disabled={acting}
            className="flex-1 py-3 border border-error text-error rounded-xl font-bold text-[14px] hover:bg-error-container transition-all disabled:opacity-50">
            Decline
          </button>
          <button onClick={() => act('accept')} disabled={acting}
            className="flex-2 flex-grow py-3 bg-primary text-on-primary rounded-xl font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {acting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Accept Job
          </button>
        </div>
      )}

      {job.status === 'accepted' && (
        <button onClick={() => act('start')} disabled={acting}
          className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
          {acting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Mark as Started
        </button>
      )}

      {job.status === 'in-progress' && (
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Completion Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Describe what was done…"
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] outline-none resize-none mb-3" />
          <button onClick={() => act('complete')} disabled={acting}
            className="w-full py-3 bg-tertiary text-on-tertiary rounded-xl font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {acting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Mark as Completed
          </button>
        </div>
      )}
    </div>
  );
}
