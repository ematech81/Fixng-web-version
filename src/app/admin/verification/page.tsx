'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

// Same flat shape as the artisan list endpoint returns
interface PendingArtisan {
  artisanProfileId: string;  // artisan doc _id
  userId: string;             // user's _id — used for all admin action routes
  name?: string;
  phone?: string;
  artisanCode?: string;
  skills?: string[];
  location?: { state?: string; lga?: string };
  verificationStatus?: string;
  profilePhoto?: { url?: string } | string | null;
  verificationId?: { url?: string; idType?: string } | null;
  skillVideo?: { url?: string; uploaded?: boolean } | null;
  joinedAt?: string;
  bio?: string;
}

export default function AdminVerificationPage() {
  const [list,    setList]    = useState<PendingArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [reason,       setReason]       = useState('');
  const [rejecting,    setRejecting]    = useState(false);

  // Lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    api.get('/api/admin/artisans?status=pending&limit=50')
      .then((r) => setList(r.data?.data ?? r.data?.artisans ?? []))
      .catch(() => showToast('Failed to load pending artisans.', 'err'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // userId is user's _id — what the backend route :artisanUserId expects
  const verify = async (userId: string) => {
    setActing(userId);
    try {
      await api.post(`/api/admin/artisans/${userId}/verify`, {});
      showToast('Artisan verified successfully!');
      setList((prev) => prev.filter((a) => a.userId !== userId));
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verify failed.', 'err');
    } finally { setActing(null); }
  };

  const openReject = (userId: string) => { setRejectTarget(userId); setReason(''); };

  const submitReject = async () => {
    if (!reason.trim()) { showToast('Please enter a reason.', 'err'); return; }
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await api.post(`/api/admin/artisans/${rejectTarget}/reject`, { reason: reason.trim() });
      showToast('Artisan rejected.');
      setList((prev) => prev.filter((a) => a.userId !== rejectTarget));
      setRejectTarget(null);
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Reject failed.', 'err');
    } finally { setRejecting(false); }
  };

  const getPhotoUrl = (photo: PendingArtisan['profilePhoto']): string | null => {
    if (!photo) return null;
    if (typeof photo === 'string') return photo;
    return photo.url ?? null;
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-[14px] font-semibold text-white transition-all ${toast.type === 'ok' ? 'bg-[#006229]' : 'bg-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Document" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
          </button>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[18px] font-black text-on-surface mb-1">Reject Artisan</h3>
            <p className="text-[13px] text-on-surface-variant mb-4">This reason will be sent to the artisan.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={3}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-error/30 resize-none mb-4"
              disabled={rejecting}
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)} disabled={rejecting}
                className="flex-1 py-3 border border-outline-variant rounded-2xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={submitReject} disabled={rejecting}
                className="flex-1 py-3 bg-error text-white rounded-2xl text-[14px] font-bold transition-all disabled:opacity-60">
                {rejecting ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface mb-1">Verification Queue</h1>
          <p className="text-[14px] text-on-surface-variant">Artisans awaiting identity verification</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className={`text-[13px] font-bold px-3 py-1.5 rounded-full ${list.length > 0 ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant'}`}>
              {list.length} pending
            </span>
          )}
          <button onClick={load} className="flex items-center gap-2 text-primary text-[13px] font-semibold hover:bg-primary-container/30 px-3 py-1.5 rounded-xl transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="material-symbols-outlined text-[64px] text-tertiary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">Queue is clear!</p>
          <p className="text-[14px] text-on-surface-variant">No artisans are currently pending verification.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((a) => {
            const name     = a.name ?? 'Unknown';
            const photoUrl = getPhotoUrl(a.profilePhoto);
            const idUrl    = (a.verificationId as { url?: string })?.url ?? null;
            const idType   = (a.verificationId as { idType?: string })?.idType ?? null;
            const hasVideo = (a.skillVideo as { uploaded?: boolean })?.uploaded ?? false;
            const busy     = acting === a.userId;

            return (
              <div key={a.artisanProfileId ?? a.userId} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-outline-variant/10">
                  {/* Profile photo */}
                  <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[20px] font-black text-primary">{name[0]?.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-on-surface">{name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {a.phone      && <span className="text-[12px] text-outline">{a.phone}</span>}
                      {a.artisanCode && <span className="text-[12px] text-outline font-mono">· {a.artisanCode}</span>}
                      {a.location?.lga && <span className="text-[12px] text-outline">· {a.location.lga}, {a.location.state}</span>}
                    </div>
                    {a.skills && a.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {a.skills.slice(0, 4).map((s) => (
                          <span key={s} className="text-[11px] font-semibold px-2 py-0.5 bg-primary-container/30 text-primary rounded-full">{s}</span>
                        ))}
                        {a.skills.length > 4 && <span className="text-[11px] text-outline">+{a.skills.length - 4} more</span>}
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-outline flex-shrink-0">{a.joinedAt ? formatDate(a.joinedAt) : ''}</p>
                </div>

                {/* Media row */}
                <div className="flex gap-3 px-6 py-4 border-b border-outline-variant/10 bg-surface-container/20">
                  {/* ID Document */}
                  {idUrl ? (
                    <div className="flex-1 cursor-pointer" onClick={() => setLightbox(idUrl)}>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{idType ?? 'ID Document'}</p>
                      <div className="w-full h-28 rounded-xl overflow-hidden group relative bg-surface-container">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={idUrl} alt="ID" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '24px' }}>zoom_in</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-outline text-center mt-1">Click to enlarge</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center h-28 rounded-xl bg-surface-container/50 gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>hide_image</span>
                      <p className="text-[12px]">No ID uploaded</p>
                    </div>
                  )}

                  {/* Skill video */}
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Skill Video</p>
                    <div className={`h-28 rounded-xl flex flex-col items-center justify-center gap-2 ${hasVideo ? 'bg-primary-container/20' : 'bg-surface-container/50'}`}>
                      <span className={`material-symbols-outlined ${hasVideo ? 'text-primary' : 'text-outline'}`} style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>videocam</span>
                      <p className={`text-[12px] font-semibold ${hasVideo ? 'text-primary' : 'text-on-surface-variant'}`}>{hasVideo ? 'Submitted' : 'Not submitted'}</p>
                    </div>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-3 px-6 py-4">
                  <button
                    onClick={() => verify(a.userId)}
                    disabled={busy}
                    className="flex-1 py-2.5 bg-[#006229] text-white rounded-xl text-[13px] font-bold hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {busy
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> Approve</>
                    }
                  </button>
                  <button
                    onClick={() => openReject(a.userId)}
                    disabled={busy}
                    className="flex-1 py-2.5 border border-error text-error rounded-xl text-[13px] font-bold hover:bg-error-container transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span> Reject
                  </button>
                  <Link
                    href={`/admin/artisans/${a.userId}`}
                    className="px-4 py-2.5 border border-outline-variant/40 text-on-surface-variant rounded-xl text-[13px] font-semibold hover:bg-surface-container transition-all flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span> Full Profile
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
