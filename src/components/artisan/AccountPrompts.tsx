'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type IdStatus = 'none' | 'pending' | 'approved' | 'rejected';

/** The signed-in artisan's ID-verification state and Pro state, in one place. */
export function useArtisanAccountState() {
  const { artisanProfile } = useAuth();
  const ap = artisanProfile as { idStatus?: IdStatus; isPro?: boolean; idRejectionReason?: string | null } | null;
  return {
    loaded: !!ap,
    idStatus: (ap?.idStatus ?? 'none') as IdStatus,
    idRejectionReason: ap?.idRejectionReason ?? null,
    isPro: !!ap?.isPro,
  };
}

/** "Verify your account" prompt — hidden once the ID is approved. */
export function VerifyAccountBanner({ className = 'mb-6' }: { className?: string }) {
  const { loaded, idStatus, idRejectionReason } = useArtisanAccountState();
  if (!loaded || idStatus === 'approved') return null;

  const copy = {
    none:     { title: 'Verify your account to reach more clients', body: 'Upload a valid ID to get the verified badge. Verified artisans are trusted more and get hired more. You are still visible to customers in the meantime.', cta: 'Verify my account' },
    pending:  { title: 'Your ID is being reviewed', body: 'We will notify you as soon as your account is verified (usually within 24 hours).', cta: 'View status' },
    rejected: { title: 'Your ID was not accepted', body: idRejectionReason ? `Reason: ${idRejectionReason}. Please upload a clearer or different ID.` : 'Please upload a clearer or different ID.', cta: 'Upload again' },
  }[idStatus];
  const warn = idStatus === 'rejected';

  return (
    <div className={`${className} rounded-2xl p-4 flex items-start gap-3`} style={{ background: warn ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${warn ? '#FCA5A5' : '#FCD34D'}` }}>
      <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '24px', color: warn ? '#DC2626' : '#D97706', fontVariationSettings: "'FILL' 1" }}>
        {idStatus === 'pending' ? 'hourglass_top' : 'verified_user'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold" style={{ color: warn ? '#991B1B' : '#92400E' }}>{copy.title}</p>
        <p className="text-[13px] mt-0.5" style={{ color: warn ? '#7F1D1D' : '#78350F' }}>{copy.body}</p>
        <Link href="/artisan/verify" className="inline-block mt-3 text-[13px] font-bold px-4 py-2 rounded-lg text-white hover:brightness-110 transition-all" style={{ background: warn ? '#DC2626' : '#D97706' }}>
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}

/** "Go PRO" upsell — hidden for Pro artisans. */
export function ProUpgradeBanner({ className = 'mb-6', compact = false }: { className?: string; compact?: boolean }) {
  const { loaded } = useArtisanAccountState();
  const { artisanProfile } = useAuth();
  const [sub, setSub] = useState<{ status?: string } | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    api.get('/api/subscriptions/me')
      .then((r) => setSub(r.data.data ?? null))
      .catch(() => setSub(null));
  }, []);

  // isPro is also true during the free trial, so it can't tell "subscribed" from "not yet".
  // Hide only for a paid active plan or Pro granted by an admin.
  const adminPro = (artisanProfile as { isPro?: boolean; proSource?: string } | null)?.proSource === 'admin'
    && (artisanProfile as { isPro?: boolean } | null)?.isPro === true;
  if (!loaded || sub === undefined || adminPro || sub?.status === 'active') return null;

  return (
    <div className={`${className} rounded-2xl ${compact ? 'p-3' : 'p-4'} flex items-center gap-3`} style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#4F46E5 100%)' }}>
      <span className="material-symbols-outlined flex-shrink-0 text-white" style={{ fontSize: compact ? '24px' : '30px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
      <p className={`flex-1 min-w-0 font-extrabold ${compact ? 'text-[13px]' : 'text-[15px]'}`} style={{ color: '#FFD700' }}>Go PRO to be ranked first in search results</p>
      <Link href="/artisan/upgrade" className="flex-shrink-0 text-[13px] font-black px-4 py-2 rounded-lg bg-white hover:brightness-95 transition-all" style={{ color: '#1E3A8A' }}>
        Go PRO
      </Link>
    </div>
  );
}
