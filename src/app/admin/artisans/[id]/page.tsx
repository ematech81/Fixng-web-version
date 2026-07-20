'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ArtisanDetail {
  _id: string;
  userId?: { _id: string; name: string; phone?: string; email?: string; artisanCode?: string };
  name?: string;
  bio?: string;
  skills?: string[];
  isPro?: boolean;
  isVerified?: boolean;
  badgeLevel?: string;
  location?: { state?: string; lga?: string; address?: string };
  stats?: { completedJobs?: number; averageRating?: number; totalRatings?: number };
  onboardingComplete?: boolean;
  createdAt?: string;
}

export default function AdminArtisanDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/admin/artisans/${id}`)
      .then((r) => setArtisan(r.data.data ?? r.data.artisan ?? r.data))
      .catch(() => setError('Failed to load artisan.'))
      .finally(() => setLoading(false));
  }, [id]);

  const doAction = async (action: string) => {
    setActing(true); setError(null); setSuccess(null);
    try {
      const r = await api.patch(`/api/admin/artisans/${id}/${action}`, {});
      setArtisan(r.data.data ?? r.data.artisan ?? artisan);
      setSuccess(`Action "${action}" applied.`);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>;
  if (error || !artisan) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="material-symbols-outlined text-[56px] text-error mb-3">error</span>
      <p className="text-[16px] font-bold">{error ?? 'Not found'}</p>
      <button onClick={() => router.back()} className="text-primary mt-3 hover:underline text-[14px]">Go Back</button>
    </div>
  );

  const name = artisan.name ?? artisan.userId?.name ?? 'Unknown';

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-[14px] font-medium mb-6 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Back to Artisans
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center">
          <span className="text-[24px] font-black text-primary">{name[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-[24px] font-black text-on-surface">{name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {artisan.isPro     && <span className="text-[11px] font-bold bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full">PRO</span>}
            {artisan.isVerified && <span className="text-[11px] font-bold bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full">Verified</span>}
            <span className="text-[12px] text-outline capitalize">{artisan.badgeLevel ?? 'new'}</span>
          </div>
        </div>
      </div>

      {error   && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4">{error}</div>}
      {success && <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-xl text-[13px] mb-4">{success}</div>}

      {/* Info */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 mb-5 space-y-3">
        {[
          { label: 'Phone',   value: artisan.userId?.phone },
          { label: 'Email',   value: artisan.userId?.email ?? '—' },
          { label: 'Code',    value: artisan.userId?.artisanCode ?? '—' },
          { label: 'Location',value: [artisan.location?.lga, artisan.location?.state].filter(Boolean).join(', ') || '—' },
          { label: 'Joined',  value: artisan.createdAt ? formatDate(artisan.createdAt) : '—' },
          { label: 'Onboarded', value: artisan.onboardingComplete ? 'Yes' : 'No' },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-4">
            <span className="text-[13px] font-bold text-on-surface-variant w-24 flex-shrink-0">{label}</span>
            <span className="text-[14px] text-on-surface">{value ?? '—'}</span>
          </div>
        ))}
        {artisan.bio && (
          <div className="flex gap-4">
            <span className="text-[13px] font-bold text-on-surface-variant w-24 flex-shrink-0">Bio</span>
            <span className="text-[14px] text-on-surface leading-relaxed">{artisan.bio}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Jobs Done', value: artisan.stats?.completedJobs ?? 0 },
          { label: 'Rating',    value: artisan.stats?.averageRating ? artisan.stats.averageRating.toFixed(1) : '—' },
          { label: 'Reviews',   value: artisan.stats?.totalRatings ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-4 text-center">
            <p className="text-[22px] font-black text-on-surface">{value}</p>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      {artisan.skills && artisan.skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-5">
          <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {artisan.skills.map((s) => <span key={s} className="px-3 py-1.5 bg-primary-container/30 text-primary text-[13px] font-semibold rounded-full">{s}</span>)}
          </div>
        </div>
      )}

      {/* Admin actions */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => doAction('verify')} disabled={acting || artisan.isVerified}
            className="py-2.5 border border-tertiary text-tertiary rounded-xl text-[13px] font-bold hover:bg-tertiary-container transition-all disabled:opacity-40">
            {artisan.isVerified ? 'Already Verified' : 'Verify Artisan'}
          </button>
          <button onClick={() => doAction('grant-pro')} disabled={acting || artisan.isPro}
            className="py-2.5 border border-secondary text-secondary rounded-xl text-[13px] font-bold hover:bg-secondary-container transition-all disabled:opacity-40">
            {artisan.isPro ? 'Already PRO' : 'Grant PRO'}
          </button>
          <button onClick={() => doAction('revoke-pro')} disabled={acting || !artisan.isPro}
            className="py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-[13px] font-bold hover:bg-surface-container transition-all disabled:opacity-40">
            Revoke PRO
          </button>
          <button onClick={() => doAction('suspend')} disabled={acting}
            className="py-2.5 border border-error text-error rounded-xl text-[13px] font-bold hover:bg-error-container transition-all disabled:opacity-40">
            Suspend Account
          </button>
        </div>
      </div>
    </div>
  );
}
