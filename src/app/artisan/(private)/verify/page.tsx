'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useArtisanAccountState } from '@/components/artisan/AccountPrompts';

const ID_TYPES = ['NIN', 'Voters Card', "Driver's License", 'International Passport', 'BVN'];
const MAX_MB = 10;

export default function VerifyAccountPage() {
  const { refreshMe } = useAuth();
  const { idStatus, idRejectionReason, isPro } = useArtisanAccountState();

  const [idType, setIdType] = useState('');
  const [file,   setFile]   = useState<File | null>(null);
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [done,   setDone]   = useState(false);

  const submit = async () => {
    if (!idType || !file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('verificationId', file);
      fd.append('idType', idType);
      await api.post('/api/artisan/onboarding/verification-id', fd);
      await refreshMe();
      setDone(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onPick = (f: File | null) => {
    setError(null);
    if (f && f.size > MAX_MB * 1024 * 1024) { setError(`File is too large. Maximum is ${MAX_MB}MB.`); return; }
    setFile(f);
  };

  const showForm = (idStatus === 'none' || idStatus === 'rejected' || (idStatus === 'pending' && !done)) && !done;

  return (
    <div className="py-8 px-4 md:px-8 max-w-xl mx-auto">
      <h1 className="text-[26px] font-black text-on-surface mb-1">Verify your account</h1>
      <p className="text-[14px] text-on-surface-variant mb-6">
        Upload a valid government ID to get the verified badge and reach more clients. {isPro ? '' : 'Verification is also required before you can go Pro.'}
      </p>

      {idStatus === 'approved' && (
        <div className="rounded-2xl p-5 text-center" style={{ background: '#e6f4ed' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>verified</span>
          <p className="text-[16px] font-bold mt-2" style={{ color: '#006229' }}>Your account is verified</p>
          <Link href="/artisan/upgrade" className="inline-block mt-4 text-[14px] font-bold text-primary hover:underline">{isPro ? 'View your plan' : 'Go PRO →'}</Link>
        </div>
      )}

      {(done || idStatus === 'pending') && (
        <div className="rounded-2xl p-5 text-center mb-4" style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#D97706', fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
          <p className="text-[16px] font-bold mt-2" style={{ color: '#92400E' }}>ID received — under review</p>
          <p className="text-[13px] mt-1" style={{ color: '#78350F' }}>We will notify you once your account is verified (usually within 24 hours).</p>
        </div>
      )}

      {idStatus === 'rejected' && !done && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <p className="text-[14px] font-bold" style={{ color: '#991B1B' }}>Your last ID was not accepted</p>
          {idRejectionReason && <p className="text-[13px] mt-0.5" style={{ color: '#7F1D1D' }}>Reason: {idRejectionReason}</p>}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          {idStatus === 'pending' && <p className="text-[12px] text-on-surface-variant">Uploaded the wrong file? Upload again to replace it.</p>}
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">ID type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-[14px] bg-white">
              <option value="">Select an ID type</option>
              {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Photo of your ID</label>
            <input type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              className="w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-primary-container file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-on-primary-container" />
            <p className="text-[11px] text-outline mt-1">Clear photo, all corners visible, not blurry. Max {MAX_MB}MB.</p>
          </div>
          {error && <p className="text-[13px] px-3 py-2 rounded-lg" style={{ background: '#fce8e8', color: '#c62828' }}>{error}</p>}
          <button onClick={submit} disabled={busy || !idType || !file}
            className="w-full py-3 rounded-xl font-bold text-[15px] text-white disabled:opacity-50 hover:brightness-110 transition-all" style={{ background: '#004ac6' }}>
            {busy ? 'Uploading…' : 'Submit for verification'}
          </button>
          <p className="text-[11px] text-outline text-center">Your ID is used only to confirm who you are and is never shown to customers.</p>
        </div>
      )}
    </div>
  );
}
