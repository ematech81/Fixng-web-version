'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { PROFESSION_ICONS } from '@/lib/constants';

interface AvailableJob {
  _id?: string;
  jobId?: string;
  category: string;
  description: string;
  urgency?: string;
  address?: string;
  state?: string;
  lga?: string;
  createdAt?: string;
  expiresAt?: string;
  isDirect?: boolean;
  isNew?: boolean;
}

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const isExpiringSoon = (expiresAt?: string) =>
  expiresAt ? new Date(expiresAt).getTime() - Date.now() < 30 * 60 * 1000 : false;

export default function AvailableJobsPage() {
  const socket = useSocket();
  const [jobs,       setJobs]       = useState<AvailableJob[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/jobs/artisan/available');
      setJobs(res.data.data ?? []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Could not load available jobs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Real-time: prepend new jobs as they arrive
  useEffect(() => {
    if (!socket) return;
    const onNewJob = (data: AvailableJob) => {
      const id = data._id ?? data.jobId ?? '';
      setJobs((prev) => {
        if (prev.find((j) => (j._id ?? j.jobId) === id)) return prev;
        return [{ ...data, _id: id, isNew: true }, ...prev];
      });
    };
    const onJobTaken = ({ jobId }: { jobId: string }) => {
      setJobs((prev) => prev.filter((j) => (j._id ?? j.jobId) !== jobId));
    };
    socket.on('new_job',   onNewJob);
    socket.on('job_taken', onJobTaken);
    return () => {
      socket.off('new_job',   onNewJob);
      socket.off('job_taken', onJobTaken);
    };
  }, [socket]);

  const getJobId = (j: AvailableJob) => j._id ?? j.jobId ?? '';

  return (
    <div className="py-8 px-4 md:px-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Available Jobs</h1>
          <p className="text-[14px] text-on-surface-variant">
            {loading ? 'Loading…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} near you`}
          </p>
        </div>
        <button
          onClick={() => fetchJobs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-[13px] font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-all disabled:opacity-50"
        >
          <span className={`material-symbols-outlined ${refreshing ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>error</span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold">{error}</p>
            {error.toLowerCase().includes('verif') && (
              <p className="text-[12px] mt-1 opacity-80">Complete your profile verification to access available jobs.</p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
        </div>
      ) : jobs.length === 0 && !error ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">work_off</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">No jobs near you right now</p>
          <p className="text-[14px] text-on-surface-variant mb-6">
            Pull to refresh. Jobs appear as customers post them — check back soon!
          </p>
          <button
            onClick={() => fetchJobs(true)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-[14px] hover:brightness-110 transition-all"
          >
            Check Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => {
            const id       = getJobId(j);
            const icon     = PROFESSION_ICONS[j.category] ?? PROFESSION_ICONS.default;
            const expiring = isExpiringSoon(j.expiresAt);
            const urgent   = j.urgency === 'emergency';

            return (
              <div
                key={id}
                className={`bg-white rounded-2xl border transition-all ${j.isNew ? 'border-primary shadow-md' : 'border-outline-variant/20'}`}
                style={{ boxShadow: j.isNew ? '0 4px 20px rgba(37,99,235,0.12)' : '0px 2px 10px rgba(0,0,0,0.04)' }}
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {j.isNew && (
                          <span className="text-[10px] font-black bg-primary text-on-primary px-2 py-0.5 rounded-full">NEW</span>
                        )}
                        {j.isDirect && (
                          <span className="text-[10px] font-black bg-secondary text-on-secondary px-2 py-0.5 rounded-full">DIRECT</span>
                        )}
                        {urgent && (
                          <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🚨 URGENT</span>
                        )}
                        {expiring && (
                          <span className="text-[10px] font-semibold text-amber-600">⚠ Expires soon</span>
                        )}
                        <span className="text-[11px] text-outline ml-auto flex-shrink-0">{timeAgo(j.createdAt)}</span>
                      </div>
                      <p className="text-[17px] font-bold text-on-surface">{j.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-on-surface-variant leading-relaxed mb-3 line-clamp-2">{j.description}</p>

                  {/* Location */}
                  {(j.address || j.state) && (
                    <div className="flex items-center gap-1.5 text-[13px] text-outline mb-4">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      <span>{[j.address, j.lga, j.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {/* Action */}
                  <Link
                    href={`/artisan/jobs/${id}`}
                    className="block w-full py-3 bg-primary-container/20 text-primary border border-primary/20 rounded-xl text-[14px] font-bold text-center hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
                  >
                    View & Accept →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
