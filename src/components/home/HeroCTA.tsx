'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeroCTA() {
  const { user, artisanProfile } = useAuth();
  const isPro = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;

  // Guest or customer → encourage them to register as an artisan
  if (!user || user.role === 'customer') {
    return (
      <Link
        href="/register"
        className="bg-white/10 text-on-primary-container border border-white/20 px-8 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
      >
        Join as Professional
      </Link>
    );
  }

  // Artisan — not yet Pro → nudge to upgrade
  if (user.role === 'artisan' && !isPro) {
    return (
      <Link
        href="/artisan/upgrade"
        className="bg-white/10 text-on-primary-container border border-white/20 px-8 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        Boost Your Visibility
      </Link>
    );
  }

  // Pro artisan → point them to where jobs come in
  if (user.role === 'artisan' && isPro) {
    return (
      <Link
        href="/artisan/jobs"
        className="bg-white/10 text-on-primary-container border border-white/20 px-8 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
        See Who&apos;s Hiring
      </Link>
    );
  }

  // Admin or any other role → nothing
  return null;
}
