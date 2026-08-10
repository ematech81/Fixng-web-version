'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ArtisanDetail {
  _id: string;
  userId?: { _id: string; name: string; phone?: string; email?: string; artisanCode?: string; isActive?: boolean };
  bio?: string;
  skills?: string[];
  isPro?: boolean;
  proSource?: string;
  badgeLevel?: string;
  verificationStatus?: string;
  isSuspended?: boolean;
  isBanned?: boolean;
  warningCount?: number;
  suspensionReason?: string;
  location?: { state?: string; lga?: string; address?: string };
  stats?: { completedJobs?: number; averageRating?: number; totalRatings?: number };
  onboardingComplete?: boolean;
  profilePhoto?: { url?: string } | string | null;
  verificationId?: { url?: string; idType?: string } | null;
  skillVideo?: { url?: string; uploaded?: boolean } | null;
  createdAt?: string;
}

type ActionType = 'warn' | 'suspend' | 'reject' | 'ban';

export default function AdminArtisanDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Reason modal
  const [modal,       setModal]       = useState<{ action: ActionType; label: string } | null>(null);
  const [reason,      setReason]      = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Media lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get(`/api/admin/artisans/${id}`)
      .then((r) => setArtisan(r.data.data ?? r.data.artisan ?? r.data))
      .catch(() => showToast('Failed to load artisan.', 'err'))
      .finally(() => setLoading(false));
  }, [id]);

  // Simple actions (no reason required)
  const doSimple = async (endpoint: string, label: string) => {
    setActing(true);
    try {
      await api.post(`/api/admin/artisans/${id}/${endpoint}`, {});
      showToast(`${label} applied.`);
      // Refresh
      const r = await api.get(`/api/admin/artisans/${id}`);
      setArtisan(r.data.data ?? r.data.artisan ?? r.data);
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setActing(false); }
  };

  // Actions requiring a reason
  const openModal = (action: ActionType, label: string) => {
    setReason('');
    setModal({ action, label });
  };

  const submitModal = async () => {
    if (!reason.trim()) { showToast('Please enter a reason.', 'err'); return; }
    if (!modal) return;
    setModalLoading(true);
    const endpointMap: Record<ActionType, string> = {
      warn: 'warn', suspend: 'suspend', reject: 'reject', ban: 'ban',
    };
    try {
      await api.post(`/api/admin/artisans/${id}/${endpointMap[modal.action]}`, { reason: reason.trim() });
      showToast(`${modal.label} applied.`);
      setModal(null);
      const r = await api.get(`/api/admin/artisans/${id}`);
      setArtisan(r.data.data ?? r.data.artisan ?? r.data);
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setModalLoading(false); }
  };

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
    </div>
  );
  if (!artisan) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="material-symbols-outlined text-[56px] text-error mb-3">person_off</span>
      <p className="text-[16px] font-bold text-on-surface">Artisan not found</p>
      <button onClick={() => router.back()} className="text-primary mt-3 hover:underline text-[14px]">Go Back</button>
    </div>
  );

  const name = artisan.userId?.name ?? 'Unknown';
  const photoUrl = typeof artisan.profilePhoto === 'string'
    ? artisan.profilePhoto
    : (artisan.profilePhoto as { url?: string })?.url ?? null;
  const idUrl = (artisan.verificationId as { url?: string })?.url ?? null;
  const videoUploaded = (artisan.skillVideo as { uploaded?: boolean })?.uploaded ?? false;

  return (
    <div className="max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-[14px] font-semibold text-white transition-all ${toast.type === 'ok' ? 'bg-[#006229]' : 'bg-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="ID Document" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
          </button>
        </div>
      )}

      {/* Reason modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[18px] font-black text-on-surface mb-1">{modal.label}</h3>
            <p className="text-[13px] text-on-surface-variant mb-4">This reason will be sent to the artisan.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason…"
              rows={3}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              disabled={modalLoading}
            />
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} disabled={modalLoading}
                className="flex-1 py-3 border border-outline-variant rounded-2xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={submitModal} disabled={modalLoading}
                className={`flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition-all disabled:opacity-60 ${modal.action === 'ban' ? 'bg-error' : modal.action === 'suspend' ? 'bg-error' : modal.action === 'warn' ? 'bg-[#b45309]' : 'bg-error'}`}>
                {modalLoading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : modal.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-on-surface-variant mb-6 flex-wrap">
        <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '16px' }}>chevron_right</span>
        <Link href="/admin/artisans" className="hover:text-primary transition-colors">Artisans</Link>
        <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '16px' }}>chevron_right</span>
        <span className="text-on-surface font-semibold truncate max-w-[180px]">{name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            : <span className="text-[24px] font-black text-primary">{name[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <h1 className="text-[24px] font-black text-on-surface">{name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {artisan.isPro && <span className="text-[11px] font-bold bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full">PRO {artisan.proSource ? `(${artisan.proSource})` : ''}</span>}
            {artisan.verificationStatus === 'verified' && <span className="text-[11px] font-bold bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full">Verified</span>}
            {artisan.isSuspended && <span className="text-[11px] font-bold bg-error-container text-error px-2.5 py-0.5 rounded-full">Suspended</span>}
            {artisan.isBanned    && <span className="text-[11px] font-bold bg-error text-white px-2.5 py-0.5 rounded-full">Banned</span>}
            {(artisan.warningCount ?? 0) > 0 && <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">{artisan.warningCount} Warning{artisan.warningCount !== 1 ? 's' : ''}</span>}
            <span className="text-[12px] text-outline capitalize">{artisan.badgeLevel ?? 'new'}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 mb-5 space-y-3">
        {[
          { label: 'Phone',      value: artisan.userId?.phone },
          { label: 'Email',      value: artisan.userId?.email ?? '—' },
          { label: 'Code',       value: artisan.userId?.artisanCode ?? '—' },
          { label: 'Status',     value: artisan.verificationStatus ?? '—' },
          { label: 'Location',   value: [artisan.location?.lga, artisan.location?.state].filter(Boolean).join(', ') || '—' },
          { label: 'Joined',     value: artisan.createdAt ? formatDate(artisan.createdAt) : '—' },
          { label: 'Onboarded',  value: artisan.onboardingComplete ? 'Yes' : 'No' },
          { label: 'Account',    value: artisan.userId?.isActive === false ? 'Disabled' : 'Active' },
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
        {artisan.isSuspended && artisan.suspensionReason && (
          <div className="flex gap-4">
            <span className="text-[13px] font-bold text-error w-24 flex-shrink-0">Suspension</span>
            <span className="text-[14px] text-error">{artisan.suspensionReason}</span>
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

      {/* ID Document */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-5">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Verification ID</h3>
        {idUrl ? (
          <div>
            {(artisan.verificationId as { idType?: string })?.idType && (
              <p className="text-[12px] font-semibold text-outline mb-2">{(artisan.verificationId as { idType?: string }).idType}</p>
            )}
            <div className="w-full aspect-video rounded-xl overflow-hidden cursor-pointer group relative bg-surface-container" onClick={() => setLightbox(idUrl)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={idUrl} alt="ID Document" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '32px' }}>zoom_in</span>
              </div>
            </div>
            <p className="text-[11px] text-outline text-center mt-1">Click to view full size</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>hide_image</span>
            <p className="text-[14px]">No ID document uploaded</p>
          </div>
        )}
      </div>

      {/* Skill Video */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-5">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Skill Video</h3>
        {videoUploaded ? (
          <div className="flex items-center gap-3 bg-primary-container/20 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>videocam</span>
            <p className="text-[14px] font-semibold text-on-surface">Video submitted</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>video_file</span>
            <p className="text-[14px]">No skill video uploaded</p>
          </div>
        )}
      </div>

      {/* Admin actions */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Admin Actions</h3>

        {/* Verification */}
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 mt-1">Verification</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => doSimple('verify', 'Verify')}
            disabled={acting || artisan.verificationStatus === 'verified'}
            className="py-2.5 border border-tertiary text-tertiary rounded-xl text-[13px] font-bold hover:bg-tertiary-container transition-all disabled:opacity-40">
            {artisan.verificationStatus === 'verified' ? '✓ Verified' : 'Verify Artisan'}
          </button>
          <button onClick={() => openModal('reject', 'Reject Artisan')}
            disabled={acting || artisan.verificationStatus === 'rejected'}
            className="py-2.5 border border-error text-error rounded-xl text-[13px] font-bold hover:bg-error-container transition-all disabled:opacity-40">
            Reject
          </button>
        </div>

        {/* Pro status */}
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pro Status</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => doSimple('grant-pro', 'Grant PRO')}
            disabled={acting || artisan.isPro}
            className="py-2.5 border border-secondary text-secondary rounded-xl text-[13px] font-bold hover:bg-secondary-container transition-all disabled:opacity-40">
            {artisan.isPro ? '✓ Already PRO' : 'Grant PRO'}
          </button>
          <button onClick={() => doSimple('revoke-pro', 'Revoke PRO')}
            disabled={acting || !artisan.isPro}
            className="py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-[13px] font-bold hover:bg-surface-container transition-all disabled:opacity-40">
            Revoke PRO
          </button>
        </div>

        {/* Disciplinary */}
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Disciplinary</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => openModal('warn', 'Warn Artisan')}
            disabled={acting}
            className="py-2.5 border border-amber-500 text-amber-700 rounded-xl text-[13px] font-bold hover:bg-amber-50 transition-all disabled:opacity-40">
            Issue Warning
          </button>
          {artisan.isSuspended ? (
            <button onClick={() => doSimple('unsuspend', 'Unsuspend')}
              disabled={acting}
              className="py-2.5 border border-tertiary text-tertiary rounded-xl text-[13px] font-bold hover:bg-tertiary-container transition-all disabled:opacity-40">
              Unsuspend
            </button>
          ) : (
            <button onClick={() => openModal('suspend', 'Suspend Artisan')}
              disabled={acting || artisan.isBanned}
              className="py-2.5 border border-error text-error rounded-xl text-[13px] font-bold hover:bg-error-container transition-all disabled:opacity-40">
              Suspend
            </button>
          )}
          <button onClick={() => openModal('ban', 'Permanently Ban')}
            disabled={acting || artisan.isBanned}
            className="col-span-2 py-2.5 bg-error text-white rounded-xl text-[13px] font-bold hover:brightness-110 transition-all disabled:opacity-40">
            {artisan.isBanned ? '✕ Account Banned' : 'Permanently Ban'}
          </button>
        </div>

        {/* View jobs link */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <Link href={`/admin/jobs?artisan=${id}`} className="flex items-center gap-2 text-primary text-[13px] font-semibold hover:underline">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>work</span>
            View all jobs by this artisan
          </Link>
        </div>
      </div>
    </div>
  );
}
