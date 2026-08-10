'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { publicApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Already logged in as admin — go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/login');
    }
  }, [user, authLoading, router]);

  const handleLogin = async () => {
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await publicApi.post('/api/auth/admin-login', { phone: phone.trim() });
      login(res.data.token, res.data.user);
      router.replace('/admin/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Login failed. Check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[28px] font-black text-primary">FixNG</span>
            <span className="bg-error text-on-error text-[11px] font-black px-2.5 py-1 rounded-full">Admin</span>
          </div>
          <p className="text-[14px] text-on-surface-variant">Administrative access only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-outline-variant/20 shadow-lg p-8">
          <h1 className="text-[22px] font-black text-on-surface mb-1">Admin Sign In</h1>
          <p className="text-[13px] text-on-surface-variant mb-6">Enter your registered phone number.</p>

          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-[13px] font-bold text-on-surface-variant mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all bg-surface">
                <span className="px-3 text-[14px] font-semibold text-on-surface-variant border-r border-outline-variant py-3.5 bg-surface-container/50 select-none">
                  +234
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="8068745098"
                  autoFocus
                  className="flex-1 px-3 py-3.5 text-[15px] outline-none bg-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] flex items-start gap-2">
                <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading || phone.trim().length < 9}
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-[16px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
                  Access Dashboard
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[12px] text-on-surface-variant mt-6">
          Not an admin?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">Go to regular login</a>
        </p>
      </div>
    </div>
  );
}
