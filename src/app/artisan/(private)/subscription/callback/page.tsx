'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type VerifyState = 'verifying' | 'success' | 'failed' | 'no-reference';

export default function SubscriptionCallbackPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { refreshMe } = useAuth();

  const [state,   setState]   = useState<VerifyState>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const reference = params.get('reference');

    if (!reference) {
      setState('no-reference');
      return;
    }

    let cancelled = false;

    api.get(`/api/subscriptions/verify/${reference}`)
      .then(async (res) => {
        if (cancelled) return;
        try { await refreshMe(); } catch { /* non-fatal */ }
        setMessage(res.data.message ?? 'Subscription activated successfully!');
        setState('success');
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.message ?? 'Payment verification failed. Contact support if funds were deducted.';
        setMessage(msg);
        setState('failed');
      });

    return () => { cancelled = true; };
  }, [params, refreshMe]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {state === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6" style={{ borderColor: '#004ac6', borderTopColor: 'transparent' }} />
            <h1 className="text-[22px] font-black text-gray-900 mb-2">Verifying Payment…</h1>
            <p className="text-[14px] text-gray-500">Please wait while we confirm your payment with Kora Pay.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#e6f4ed' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '52px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="text-[28px] font-black text-gray-900 mb-2">You&apos;re now PRO! 🎉</h1>
            <p className="text-[15px] text-gray-500 mb-8">{message}</p>
            <button
              onClick={() => router.replace('/artisan/dashboard')}
              className="w-full py-4 rounded-2xl font-black text-[16px] text-white hover:brightness-110 transition-all"
              style={{ background: '#004ac6' }}
            >
              Go to Dashboard
            </button>
          </>
        )}

        {state === 'failed' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#fce8e8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '52px', color: '#c62828', fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <h1 className="text-[28px] font-black text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-[15px] text-gray-500 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.replace('/artisan/upgrade')}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white hover:brightness-110 transition-all"
                style={{ background: '#004ac6' }}
              >
                Try Again
              </button>
              <button
                onClick={() => router.replace('/artisan/dashboard')}
                className="w-full py-3 rounded-2xl font-semibold text-[15px] text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}

        {state === 'no-reference' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#fce8e8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '52px', color: '#c62828', fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            <h1 className="text-[28px] font-black text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-[15px] text-gray-500 mb-8">This payment link is missing a reference. Please try subscribing again.</p>
            <button
              onClick={() => router.replace('/artisan/upgrade')}
              className="w-full py-4 rounded-2xl font-black text-[16px] text-white hover:brightness-110 transition-all"
              style={{ background: '#004ac6' }}
            >
              Back to Subscription
            </button>
          </>
        )}

      </div>
    </div>
  );
}
