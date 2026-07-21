'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// ── Plans — must match backend ENV.korapay.prices ─────────────────────────────
const PLANS = [
  { id: 'monthly',   label: 'Monthly',   price: 5_000,  billing: 'Billed monthly',         savings: null,       badge: null },
  { id: 'quarterly', label: 'Quarterly', price: 13_500, billing: 'Billed every 3 months',  savings: 'Save 10%', badge: null },
  { id: 'yearly',    label: 'Yearly',    price: 48_000, billing: 'Billed annually',         savings: 'Save 20%', badge: 'Best Value' },
] as const;
type Cycle = typeof PLANS[number]['id'];

const FEATURES = [
  { icon: 'search',                label: 'Appear in Customer Search',     desc: 'Show up when customers search for your skills nearby' },
  { icon: 'work',                  label: 'Unlimited Job Requests',         desc: 'Accept as many jobs as you want — no cap' },
  { icon: 'trending_up',           label: 'Priority Placement in Search',   desc: 'Rank higher than free artisans in results' },
  { icon: 'verified',              label: 'Verified Pro Badge',             desc: 'Build trust with a "Verified Pro" badge on your profile' },
  { icon: 'chat',                  label: 'In-App Chat with Customers',     desc: 'Communicate directly with clients through the app' },
  { icon: 'notifications_active',  label: 'Real-Time Job Notifications',    desc: 'Never miss a job request with instant alerts' },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  trial:     { label: 'FREE TRIAL',    color: '#004ac6', bg: '#e8f0fe', icon: 'card_giftcard' },
  active:    { label: 'ACTIVE',        color: '#006229', bg: '#e6f4ed', icon: 'check_circle' },
  grace:     { label: 'GRACE PERIOD',  color: '#b45309', bg: '#fef3c7', icon: 'warning' },
  expired:   { label: 'EXPIRED',       color: '#c62828', bg: '#fce8e8', icon: 'cancel' },
  cancelled: { label: 'CANCELLED',     color: '#616161', bg: '#f5f5f5', icon: 'block' },
};

interface SubData {
  status: string;
  cycle: string | null;
  endsAt: string | null;
  graceEndsAt: string | null;
  daysRemaining: number | null;
  isAllowed: boolean;
}

export default function ArtisanUpgradePage() {
  const router = useRouter();
  const { artisanProfile, refreshMe } = useAuth();
  const isAdminPro = (artisanProfile as { isPro?: boolean; proSource?: string } | null)?.proSource === 'admin'
    && (artisanProfile as { isPro?: boolean } | null)?.isPro === true;

  const [subData,    setSubData]    = useState<SubData | null | undefined>(undefined); // undefined = still loading
  const [cycle,      setCycle]      = useState<Cycle>('yearly');
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [showCancel,  setShowCancel]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const loadSub = useCallback(async () => {
    try {
      const res = await api.get('/api/subscriptions/me');
      setSubData(res.data.data ?? null);
    } catch {
      setSubData(null);
    }
  }, []);

  useEffect(() => { loadSub(); }, [loadSub]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setError(null);
    try {
      const redirectUrl = `${window.location.origin}/artisan/subscription/callback`;
      const res = await api.post('/api/subscriptions/initialize', { cycle, redirectUrl });
      const { checkout_url } = res.data.data;
      window.location.href = checkout_url;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to start payment. Please try again.');
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await api.post('/api/subscriptions/cancel');
      await loadSub();
      setShowCancel(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (subData === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#004ac6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // ── Admin-granted Pro (no subscription record) ───────────────────────────────
  if (isAdminPro && !subData) {
    return (
      <div className="py-16 px-4 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#fef3c7' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#b45309', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </div>
        <h1 className="text-[28px] font-black text-gray-900 mb-2">You&apos;re PRO!</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your Pro access was granted by the FixNG admin team. Enjoy all Pro benefits!</p>
        <button onClick={() => router.push('/artisan/dashboard')} className="px-8 py-3 rounded-xl font-bold text-[15px] text-white hover:brightness-110 transition-all" style={{ background: '#004ac6' }}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const status = subData?.status ?? null;
  const isActive  = status === 'active';
  const isAllowed = subData?.isAllowed ?? false;
  const showCTA   = !isAllowed || status === 'grace' || status === 'trial';
  const showRenew = status === 'grace' || status === 'expired' || status === 'cancelled';
  const statusMeta = status ? STATUS_META[status] : null;

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl mx-auto">

      {/* ── Hero ── */}
      <div className="relative rounded-3xl p-8 mb-6 overflow-hidden text-center" style={{ background: 'linear-gradient(135deg, #004ac6 0%, #0026a3 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-white mb-3 block" style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <h1 className="text-[32px] font-black text-white mb-2">Go PRO</h1>
          <p className="text-white/80 text-[15px] leading-relaxed">Unlock premium features, get more customers, and earn more with FixNG Pro</p>
        </div>
      </div>

      {/* ── Current subscription status ── */}
      {statusMeta && (
        <div className="rounded-2xl p-4 mb-6 flex items-start gap-4" style={{ background: statusMeta.bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: statusMeta.color, fontVariationSettings: "'FILL' 1" }}>{statusMeta.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[13px] font-black tracking-wide" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
              {subData?.cycle && (
                <span className="text-[12px] font-semibold text-gray-500 capitalize">· {subData.cycle} plan</span>
              )}
            </div>
            {status === 'active' && subData?.daysRemaining != null && (
              <p className="text-[13px] text-gray-600">{subData.daysRemaining} day{subData.daysRemaining !== 1 ? 's' : ''} remaining</p>
            )}
            {status === 'trial' && subData?.daysRemaining != null && (
              <p className="text-[13px] text-gray-600">Trial ends in {subData.daysRemaining} day{subData.daysRemaining !== 1 ? 's' : ''} — subscribe to keep access</p>
            )}
            {status === 'grace' && subData?.graceEndsAt && (
              <p className="text-[13px] text-gray-600">Grace period ends {new Date(subData.graceEndsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} — renew now to avoid losing access</p>
            )}
            {status === 'expired' && <p className="text-[13px] text-gray-600">Your subscription has expired. Resubscribe to regain Pro access.</p>}
            {status === 'cancelled' && <p className="text-[13px] text-gray-600">Your subscription was cancelled. Resubscribe anytime.</p>}
          </div>
          {isActive && (
            <button onClick={() => setShowCancel(true)} className="text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap flex-shrink-0">
              Cancel plan
            </button>
          )}
        </div>
      )}

      {/* ── Plan selector (always visible) ── */}
      <h2 className="text-[17px] font-black text-gray-900 mb-3">
        {showRenew ? 'Renew your plan' : isActive ? 'Change your plan' : 'Choose a plan'}
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCycle(p.id)}
            className={`relative rounded-2xl border-2 p-4 text-center transition-all ${cycle === p.id ? 'border-[#004ac6]' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            style={cycle === p.id ? { background: '#f0f4ff', borderColor: '#004ac6' } : { background: '#fff' }}
          >
            {/* Badge */}
            {p.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap text-white" style={{ background: '#004ac6' }}>
                {p.badge}
              </span>
            )}
            {/* Selected tick */}
            {cycle === p.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#004ac6' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            )}
            <p className="text-[12px] font-semibold text-gray-500 mb-1">{p.label}</p>
            <p className="text-[22px] font-black text-gray-900">₦{p.price.toLocaleString('en-NG')}</p>
            {p.savings ? (
              <p className="text-[11px] font-bold mt-0.5" style={{ color: '#006229' }}>{p.savings}</p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-0.5">{p.billing}</p>
            )}
          </button>
        ))}
      </div>

      {/* ── Feature list ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        {FEATURES.map(({ icon, label, desc }, i) => (
          <div key={label} className={`flex items-center gap-4 px-4 py-3.5 ${i < FEATURES.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e8f0fe' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-800">{label}</p>
              <p className="text-[12px] text-gray-500">{desc}</p>
            </div>
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-[13px] mb-4" style={{ background: '#fce8e8', color: '#c62828' }}>
          {error}
        </div>
      )}

      {/* ── Subscribe / Renew button ── */}
      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="w-full py-4 font-black text-[16px] rounded-2xl text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
        style={{ background: 'linear-gradient(90deg, #004ac6 0%, #0026a3 100%)' }}
      >
        {subscribing ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting to payment…</>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            {showRenew ? 'Renew' : isActive ? 'Change Plan'  : 'Subscribe Now'} — ₦{PLANS.find(p => p.id === cycle)!.price.toLocaleString('en-NG')}
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-gray-400 mt-4">
        Payments processed securely via Kora Pay · Cancel anytime
      </p>

      {/* ── Cancel confirmation modal ── */}
      {showCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fce8e8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#c62828', fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h2 className="text-[20px] font-black text-gray-900 mb-2">Cancel Subscription?</h2>
            <p className="text-[14px] text-gray-500 mb-6">
              You&apos;ll keep Pro access until your current period ends. You can request a refund within 48 hours if eligible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl text-[15px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#c62828' }}
              >
                {cancelling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
