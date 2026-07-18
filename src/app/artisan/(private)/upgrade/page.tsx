'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const FEATURES = [
  { icon: 'verified',            label: 'PRO Verified Badge',      desc: 'Stand out with a trust badge on your profile' },
  { icon: 'priority_high',       label: 'Priority Placement',       desc: 'Appear first in customer search results'       },
  { icon: 'work',                label: 'Unlimited Job Requests',   desc: 'No cap on how many jobs you can take'          },
  { icon: 'analytics',           label: 'Advanced Analytics',       desc: 'Track views, clicks, and acceptance rates'     },
  { icon: 'payments',            label: 'Priority Payouts',         desc: 'Get paid within 24 hours after completion'     },
  { icon: 'support_agent',       label: 'Dedicated Support',        desc: 'Skip the queue with Pro-only support access'   },
  { icon: 'share',               label: 'Shareable Portfolio Link', desc: 'Custom link to show off your work'             },
  { icon: 'star',                label: 'Featured in Newsletter',   desc: 'Monthly feature to thousands of customers'     },
];

const PLANS = [
  { id: 'monthly', label: 'Monthly',  price: 2_500,  period: '/month',   badge: null,       popular: false },
  { id: 'yearly',  label: 'Yearly',   price: 25_000, period: '/year',    badge: 'Save 17%', popular: true  },
];

export default function ArtisanUpgradePage() {
  const router = useRouter();
  const { artisanProfile, refreshMe } = useAuth();
  const isPro = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;

  const [plan,     setPlan]     = useState('yearly');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true); setError(null);
    try {
      const r = await api.post('/api/artisans/upgrade', { plan });
      if (r.data.paymentUrl) {
        window.location.href = r.data.paymentUrl;
      } else {
        await refreshMe();
        router.push('/artisan/dashboard');
      }
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to start upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPro) return (
    <div className="py-16 px-4 md:px-8 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
      </div>
      <h1 className="text-[28px] font-black text-on-surface mb-2">You're already PRO!</h1>
      <p className="text-[15px] text-on-surface-variant mb-8">Enjoy all your Pro benefits and keep up the great work.</p>
      <button onClick={() => router.push('/artisan/dashboard')} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold text-[15px] hover:brightness-110 transition-all">
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-secondary to-primary rounded-3xl p-8 mb-8 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-white mb-3 block" style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <h1 className="text-[32px] font-black text-white mb-2">Go PRO</h1>
          <p className="text-white/80 text-[15px] leading-relaxed">Unlock premium features, get more customers, and earn more with FixNG Pro</p>
        </div>
      </div>

      {/* Plan selector */}
      <div className="flex gap-3 mb-6">
        {PLANS.map((p) => (
          <button key={p.id} onClick={() => setPlan(p.id)}
            className={`flex-1 relative rounded-2xl border-2 p-4 text-center transition-all ${plan === p.id ? 'border-primary bg-primary-container/20' : 'border-outline-variant bg-white hover:border-primary/40'}`}>
            {p.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {p.badge}
              </span>
            )}
            {p.popular && !p.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-black px-2.5 py-0.5 rounded-full">Popular</span>
            )}
            <p className="text-[13px] font-semibold text-on-surface-variant mb-1">{p.label}</p>
            <p className="text-[24px] font-black text-on-surface">₦{p.price.toLocaleString('en-NG')}</p>
            <p className="text-[12px] text-outline">{p.period}</p>
            {plan === p.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm mb-6 divide-y divide-outline-variant/20">
        {FEATURES.map(({ icon, label, desc }) => (
          <div key={label} className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-on-surface">{label}</p>
              <p className="text-[12px] text-on-surface-variant">{desc}</p>
            </div>
            <span className="material-symbols-outlined text-primary ml-auto flex-shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        ))}
      </div>

      {error && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4">{error}</div>}

      <button onClick={handleUpgrade} disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-secondary to-primary text-white font-black text-[16px] rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg">
        {loading ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
        ) : (
          <><span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            Upgrade to PRO — ₦{PLANS.find((p) => p.id === plan)?.price.toLocaleString('en-NG')}</>
        )}
      </button>

      <p className="text-center text-[12px] text-outline mt-4">Secure payment via Paystack · Cancel anytime</p>
    </div>
  );
}
