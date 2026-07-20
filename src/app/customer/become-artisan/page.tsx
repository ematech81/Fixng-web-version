'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const PERKS = [
  { icon: 'payments',          title: 'Earn on Your Terms',      desc: 'Set your own rates and accept jobs that fit your schedule.' },
  { icon: 'verified',          title: 'Build Your Reputation',   desc: 'Collect ratings and reviews that grow your client base.' },
  { icon: 'location_on',       title: 'Jobs Near You',           desc: 'Get matched with customers in your area automatically.' },
  { icon: 'workspace_premium', title: 'Free 7-Day PRO Trial',    desc: 'Every new artisan starts with a full PRO trial — no card needed.' },
  { icon: 'notifications',     title: 'Instant Job Alerts',      desc: 'Get notified the moment a matching job is posted near you.' },
  { icon: 'shield_person',     title: 'Verified Badge',          desc: 'Complete verification to earn a trusted badge and rank higher.' },
];

export default function BecomeArtisanPage() {
  const router         = useRouter();
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/become-artisan');
      if (res.data.token) {
        // Backend returns a new JWT with role:'artisan' — swap the token in context
        login(res.data.token, { ...user!, role: 'artisan' });
      }
      router.replace('/artisan/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full py-10 px-4 md:px-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>handyman</span>
        </div>
        <h1 className="text-[32px] font-black text-on-surface mb-2">Become a FixNG Artisan</h1>
        <p className="text-[16px] text-on-surface-variant max-w-lg mx-auto">
          Join thousands of skilled professionals earning on their own schedule across Nigeria.
        </p>
      </div>

      {/* Perks grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {PERKS.map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-4 p-4 bg-white rounded-2xl border border-outline-variant/20"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-on-surface mb-0.5">{title}</p>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="bg-surface-container-low rounded-2xl p-6 mb-8 border border-outline-variant/20">
        <h2 className="text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>checklist</span>
          What happens next
        </h2>
        <ol className="space-y-3">
          {[
            'Your account is upgraded to an Artisan account instantly.',
            'A 5-step onboarding wizard guides you through photo, skills, location, ID verification, and a skill video.',
            'Your free 7-day PRO trial starts automatically — no payment required.',
            'Once verified, you start appearing in customer searches.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] text-on-surface-variant">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[14px] flex items-start gap-2">
          <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleStart}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[16px] font-bold text-white transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          )}
          {loading ? 'Setting up your account…' : 'Start Artisan Onboarding'}
        </button>
        <Link href="/customer/dashboard"
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[15px] font-semibold text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-all"
        >
          Maybe later
        </Link>
      </div>

      <p className="text-center text-[12px] text-outline mt-4">
        By continuing you agree to the{' '}
        <Link href="#" className="text-primary hover:underline">FixNG Artisan Terms</Link>.
        You can switch back to a customer account at any time.
      </p>
    </div>
  );
}
