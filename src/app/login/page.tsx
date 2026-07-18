'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect');
  const { login, user, loading: authLoading } = useAuth();

  const [step,  setStep]  = useState(1);
  const [phone, setPhone] = useState('');
  const [otp,   setOtp]   = useState(Array(6).fill(''));

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultRedirect = (role: string) =>
    role === 'artisan' ? '/artisan/dashboard' :
    role === 'admin'   ? '/admin/dashboard'   : '/customer/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTo ?? defaultRedirect(user.role));
    }
  }, [user, authLoading, router, redirectTo]);

  const startCountdown = useCallback(() => {
    setCountdown(59);
    const t = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  }, []);

  const handleSendOTP = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/auth/otp/send', { phone: phone.trim() });
      setStep(2);
      startCountdown();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the full 6-character code.'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/otp/verify-login', { phone: phone.trim(), otp: code });
      login(res.data.token, res.data.user);
      router.replace(redirectTo ?? defaultRedirect(res.data.user.role));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '';
      // If user doesn't exist, nudge them to register
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('register')) {
        setError('No account found for this number. Please register first.');
      } else {
        setError(msg || 'Login failed. Check the code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/api/auth/otp/send', { phone: phone.trim() });
      setOtp(Array(6).fill(''));
      startCountdown();
    } catch {/* silent */}
  };

  const handleOtpChange = (i: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const next = [...otp]; next[i] = char; setOtp(next);
    if (char && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const next = [...otp]; next[i - 1] = ''; setOtp(next);
      otpRefs.current[i - 1]?.focus();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').toUpperCase().slice(0, 6).split('');
    const next = [...otp];
    text.forEach((c, i) => { if (i < 6) next[i] = c; });
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const displayPhone = phone.startsWith('0') ? `+234 ${phone.slice(1)}` : `+234 ${phone}`;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface shadow-sm">
        <Link href="/" className="text-[20px] font-extrabold text-primary">FixNG</Link>
        <div className="hidden md:flex gap-8">
          <Link href="/search"   className="text-[14px] text-on-surface-variant hover:text-primary transition-colors">Find Artisans</Link>
          <Link href="/register" className="text-[14px] text-on-surface-variant hover:text-primary transition-colors">Join as Pro</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"    className="text-[14px] font-bold text-primary px-4 py-1.5 rounded-lg hover:bg-surface-container transition-colors">Login</Link>
          <Link href="/register" className="text-[14px] font-bold bg-primary text-on-primary px-5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all">Register</Link>
        </div>
      </header>

      {/* ── Auth card ───────────────────────────────────────────────── */}
      <div className="w-full max-w-md mt-16">
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.06)]">

          {/* Progress bars */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="h-1 flex-1 bg-outline-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: step >= s ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          {/* ── Step 1: Phone ──────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-[28px] font-black text-on-surface mb-1">Welcome back</h1>
                <p className="text-[15px] text-on-surface-variant">Enter your phone number to receive an access key.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Nigerian Phone Number</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-outline-variant pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>flag</span>
                      <span className="text-[15px] text-on-surface font-medium">+234</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && phone.trim().length >= 9 && handleSendOTP()}
                      placeholder="812 345 6789"
                      autoFocus
                      className="w-full pl-28 pr-4 py-3.5 bg-surface border border-outline-variant rounded-xl text-[16px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] flex items-start gap-2">
                    <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
                    <span>
                      {error}{' '}
                      {error.includes('register') && (
                        <Link href="/register" className="font-bold underline">Register here</Link>
                      )}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={phone.trim().length < 9 || loading}
                  className="w-full py-3.5 bg-primary text-on-primary font-bold text-[16px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Send Access Key
                  {!loading && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
                </button>

                <div className="bg-surface-container-high/60 p-3 rounded-xl flex gap-3 items-start">
                  <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0" style={{ fontSize: '18px' }}>info</span>
                  <p className="text-[12px] text-on-surface-variant">Standard SMS rates may apply. By continuing you agree to receive a verification code.</p>
                </div>

                <p className="text-center text-[14px] text-on-surface-variant">
                  New to FixNG?{' '}
                  <Link href="/register" className="text-primary font-bold hover:underline">Create an account</Link>
                </p>
              </div>
            </>
          )}

          {/* ── Step 2: OTP ──────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <button onClick={() => { setStep(1); setOtp(Array(6).fill('')); setError(null); }} className="flex items-center gap-1 text-primary font-medium text-[13px] mb-4 hover:underline">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Change number
              </button>

              <div className="mb-6">
                <h1 className="text-[28px] font-black text-on-surface mb-1">Enter Access Key</h1>
                <p className="text-[15px] text-on-surface-variant">
                  We&apos;ve sent a 6-character key to <strong className="text-on-surface">{displayPhone}</strong>
                </p>
              </div>

              {/* OTP inputs */}
              <div className="flex justify-between gap-2 mb-5" onPaste={handleOtpPaste}>
                {otp.map((char, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    autoFocus={i === 0}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-[22px] font-black bg-surface border-2 border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 mb-5">
                <p className="text-[13px] text-on-surface-variant">
                  Didn&apos;t receive it?{' '}
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="text-primary font-bold hover:underline disabled:text-outline disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend now'}
                  </button>
                </p>
                <p className="text-[11px] text-outline text-center">Keys typically arrive within 10–30 seconds.</p>
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4 flex items-start gap-2">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
                  <span>
                    {error}{' '}
                    {error.includes('register') && (
                      <Link href="/register" className="font-bold underline">Register here</Link>
                    )}
                  </span>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-[16px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Verifying…' : 'Complete Login'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-4 mt-auto bg-surface-container-highest border-t border-outline-variant">
        <div className="space-y-1">
          <div className="text-[20px] font-black text-primary">FixNG</div>
          <p className="text-[14px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {['About Us', 'Privacy Policy', 'Terms of Service', 'Help Center'].map((l) => (
            <Link key={l} href="#" className="text-[14px] text-on-surface-variant hover:text-primary transition-colors">{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
