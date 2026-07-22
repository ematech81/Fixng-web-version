'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CTABannerContent() {
  const { user, artisanProfile } = useAuth();
  const isPro = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;

  // Pro artisan
  if (user?.role === 'artisan' && isPro) {
    return (
      <>
        <h2 className="text-[24px] md:text-[32px] leading-10 font-bold tracking-tight">
          You&apos;re verified. Clients are waiting.
        </h2>
        <p className="text-[16px] opacity-90">
          Your Pro profile is live. Check incoming job requests and keep your dashboard up to date.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link href="/artisan/jobs" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            See Who&apos;s Hiring
          </Link>
          <Link href="/artisan/dashboard" className="bg-primary-container border border-white/30 text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            My Dashboard
          </Link>
        </div>
      </>
    );
  }

  // Non-Pro artisan
  if (user?.role === 'artisan' && !isPro) {
    return (
      <>
        <h2 className="text-[24px] md:text-[32px] leading-10 font-bold tracking-tight">
          Ready to attract more clients?
        </h2>
        <p className="text-[16px] opacity-90">
          Upgrade to Pro and get featured in customer searches, priority placement, and a verified badge that builds trust.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link href="/artisan/upgrade" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            Boost Your Visibility
          </Link>
          <Link href="/artisan/dashboard" className="bg-primary-container border border-white/30 text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            My Profile
          </Link>
        </div>
      </>
    );
  }

  // Guest or customer — default
  return (
    <>
      <h2 className="text-[24px] md:text-[32px] leading-10 font-bold tracking-tight">
        Ready to find work or get it done?
      </h2>
      <p className="text-[16px] opacity-90">
        Join thousands of Nigerians using FixNG to grow their businesses or solve their home maintenance needs today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <Link href="/search" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md">
          Hire a Professional
        </Link>
        <Link href="/register" className="bg-primary-container border border-white/30 text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
          List My Services
        </Link>
      </div>
    </>
  );
}
