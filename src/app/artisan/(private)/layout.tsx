'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ArtisanLayout from '@/components/layout/ArtisanLayout';

export default function ArtisanPrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, artisanProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (!loading && user && user.role !== 'artisan') {
      router.replace(user.role === 'customer' ? '/customer/dashboard' : '/admin/dashboard');
    } else if (!loading && user && user.role === 'artisan' && artisanProfile?.onboardingComplete === false) {
      router.replace('/artisan/onboarding');
    }
  }, [user, loading, artisanProfile, router]);

  if (loading || !user || user.role !== 'artisan') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant text-[14px]">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return <ArtisanLayout>{children}</ArtisanLayout>;
}
