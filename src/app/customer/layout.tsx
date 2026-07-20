'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CustomerLayout from '@/components/layout/CustomerLayout';

export default function CustomerRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user && user.role === 'admin') {
      // Only admins are blocked — artisans can browse as customers
      router.replace('/admin/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant text-[14px]">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return <CustomerLayout>{children}</CustomerLayout>;
}
