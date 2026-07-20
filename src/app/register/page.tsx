'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type Role = 'customer' | 'artisan' | '';

export default function RegisterPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  const [step, setStep]     = useState(1);
  const [role, setRole]     = useState<Role>('');
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [email, setEmail]   = useState('');
  const [otp,   setOtp]     = useState(Array(6).fill(''));

  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState<string | null>(null);
  const [countdown,  setCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(
        user.role === 'artisan' ? '/artisan/dashboard' :
        user.role === 'admin'   ? '/admin/dashboard'   : '/customer/dashboard'
      );
    }
  }, [user, authLoading, router]);

  const startCountdown = useCallback(() => {
    setCountdown(59);
    const t = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  }, []);

  // Step 2 → 3: send OTP
  const handleSendOTP = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/otp/send', { phone: phone.trim(), ...(email.trim() && { email: email.trim() }) });
      setMaskedEmail(res.data.maskedEmail ?? null);
      try { if (email.trim()) localStorage.setItem('fixng_email', email.trim()); } catch { /* */ }
      setStep(3);
      startCountdown();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: verify + create account
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the full 6-character code.'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/otp/verify-register', {
        name:  name.trim(),
        phone: phone.trim(),
        role,
        otp:   code,
        ...(email.trim() && { email: email.trim() }),
      });
      login(res.data.token, res.data.user);
      router.replace(res.data.user.role === 'artisan' ? '/artisan/dashboard' : '/customer/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verification failed. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post('/api/auth/otp/send', { phone: phone.trim(), ...(email.trim() && { email: email.trim() }) });
      setMaskedEmail(res.data.maskedEmail ?? null);
      startCountdown();
      setOtp(Array(6).fill(''));
    } catch {/* silent */}
  };

  // OTP character input helpers
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
    const text = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const chars = text.split('');
    const next = [...otp];
    chars.forEach((c, i) => { if (i < 6) next[i] = c; });
    setOtp(next);
    otpRefs.current[Math.min(chars.length, 5)]?.focus();
  };

  const step2Valid = name.trim().length >= 2 && phone.trim().length >= 9;
  const displayPhone = phone.startsWith('0') ? `+234 ${phone.slice(1)}` : `+234 ${phone}`;

  // Progress bar widths
  const barW = ['100%', step >= 2 ? '100%' : '0%', step >= 3 ? '100%' : '0%'];

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface shadow-sm">
        <Link href="/" className="text-[20px] font-extrabold text-primary">FixNG</Link>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-[14px] text-on-surface-variant">Already have an account?</span>
          <Link href="/login" className="text-[14px] font-bold text-primary hover:underline transition-all">Login</Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-4xl flex flex-col items-center">

          {/* ── Step badge + title ──────────────────────────────────── */}
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Step {step} of 3</span>
            <h1 className="text-[24px] md:text-[32px] font-black text-on-surface">
              {step === 1 ? 'Join our community' : step === 2 ? 'Your details' : 'Verify your number'}
            </h1>
            <p className="text-[16px] text-on-surface-variant max-w-md">
              {step === 1 ? "Select how you'd like to use the FixNG platform to get started."
               : step === 2 ? 'Fill in your details to create your account.'
               : `Enter the 6-character code we sent to ${displayPhone}.`}
            </p>
          </div>

          {/* ── Step 1: Role cards ─────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {([
                  { r: 'customer' as Role, icon: 'person',   title: 'I need services',    desc: 'Browse verified artisans, book home repairs, and manage your projects with ease.',   cta: 'Join as Customer' },
                  { r: 'artisan'  as Role, icon: 'handyman', title: 'I offer services',   desc: 'Showcase your skills, reach new customers in your area, and grow your business.',  cta: 'Join as Pro'       },
                ] as const).map(({ r, icon, title, desc, cta }) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setStep(2); }}
                    className={`group relative bg-white border-2 p-8 rounded-3xl transition-all duration-300 flex flex-col items-center text-center
                      hover:border-primary hover:shadow-[0px_10px_25px_rgba(0,0,0,0.10)] focus:outline-none focus:ring-4 focus:ring-primary/20
                      shadow-[0px_4px_20px_rgba(0,0,0,0.05)]
                      ${role === r ? 'border-primary shadow-[0px_10px_25px_rgba(0,0,0,0.10)]' : 'border-transparent'}`}
                  >
                    {/* Selection dot */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${role === r ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                      <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${role === r ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>

                    {/* Icon box */}
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-primary mb-6 transition-all duration-300 group-hover:bg-primary group-hover:text-white ${role === r ? 'bg-primary text-white' : 'bg-surface-container'}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', fontVariationSettings: role === r ? "'FILL' 1" : "'FILL' 0" }}>
                        {icon}
                      </span>
                    </div>

                    <h2 className="text-[20px] font-black text-on-surface mb-2">{title}</h2>
                    <p className="text-[15px] text-on-surface-variant mb-6 leading-relaxed">{desc}</p>

                    <div className="mt-auto py-2 px-8 rounded-full bg-primary text-on-primary text-[14px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {cta}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                <span className="text-[13px] font-medium">Secure registration with phone verification</span>
              </div>
            </>
          )}

          {/* ── Step 2: Details form ────────────────────────────────── */}
          {step === 2 && (
            <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-outline-variant/20 shadow-[0px_4px_20px_rgba(0,0,0,0.06)]">
              {/* Role pill */}
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep(1)} className="text-primary hover:underline text-[13px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                  Change role
                </button>
                <span className="bg-primary-container/20 text-primary text-[12px] font-bold px-3 py-1 rounded-full capitalize">
                  {role}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Full Name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tunde Okafor"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Nigerian Phone Number <span className="text-error">*</span></label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-outline-variant pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>flag</span>
                      <span className="text-[15px] text-on-surface font-medium">+234</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="812 345 6789"
                      className="w-full pl-28 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-[11px] text-outline mt-1">Recommended — your OTP will be sent here if SMS fails.</p>
                </div>

                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] flex items-start gap-2">
                    <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={!step2Valid || loading}
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
              </div>
            </div>
          )}

          {/* ── Step 3: OTP ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-outline-variant/20 shadow-[0px_4px_20px_rgba(0,0,0,0.06)]">
              {/* Progress bars */}
              <div className="flex items-center gap-2 mb-8">
                {barW.map((w, i) => (
                  <div key={i} className="h-1 flex-1 bg-outline-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: w }} />
                  </div>
                ))}
              </div>

              <button onClick={() => { setStep(2); setOtp(Array(6).fill('')); setError(null); }} className="flex items-center gap-1 text-primary font-medium text-[13px] mb-4 hover:underline">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Change number
              </button>

              <h2 className="text-[24px] font-black text-on-surface mb-1">Enter Access Key</h2>
              {maskedEmail ? (
                <div className="mb-6">
                  <p className="text-[15px] text-on-surface-variant">
                    SMS unavailable right now — we sent a 6-character code to your email:
                  </p>
                  <div className="mt-2 flex items-center gap-2 bg-primary-container/20 px-4 py-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>mail</span>
                    <strong className="text-primary font-bold">{maskedEmail}</strong>
                  </div>
                  <p className="text-[12px] text-outline mt-2">Check your inbox and spam folder.</p>
                </div>
              ) : (
                <p className="text-[15px] text-on-surface-variant mb-6">
                  We sent a 6-character code to <strong className="text-on-surface">{displayPhone}</strong>
                </p>
              )}

              {/* OTP inputs */}
              <div className="flex justify-between gap-2 mb-6" onPaste={handleOtpPaste}>
                {otp.map((char, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-[22px] font-black bg-surface border-2 border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                  />
                ))}
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px] mb-4 flex items-start gap-2">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-[16px] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Verifying…' : 'Complete Registration'}
              </button>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[13px] text-on-surface-variant">
                  Didn&apos;t get the code?{' '}
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="text-primary font-bold hover:underline disabled:text-outline disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend now'}
                  </button>
                </p>
                <p className="text-[11px] text-outline text-center">Codes typically arrive within 10–30 seconds.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-4 border-t border-outline-variant bg-surface">
        <div className="space-y-1">
          <div className="text-[20px] font-black text-primary">FixNG</div>
          <p className="text-[14px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {['Help Center', 'Terms of Service', 'Privacy Policy'].map((l) => (
            <Link key={l} href="#" className="text-[14px] text-on-surface-variant hover:text-primary transition-colors">{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
