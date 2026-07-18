'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function CustomerProfilePage() {
  const { user, refreshMe, logout } = useAuth();

  const [name,   setName]   = useState(user?.name  ?? '');
  const [email,  setEmail]  = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await api.put('/api/auth/profile', { name: name.trim(), email: email.trim() || undefined });
      await refreshMe();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8 px-4 md:px-8 max-w-xl">
      <h1 className="text-[28px] font-black text-on-surface mb-1">My Profile</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Manage your account information</p>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center">
          <span className="text-[28px] font-black text-primary/60">{getInitials(user?.name ?? 'U')}</span>
        </div>
        <div>
          <p className="text-[18px] font-black text-on-surface">{user?.name}</p>
          <p className="text-[14px] text-on-surface-variant">Customer Account</p>
          <p className="text-[13px] text-outline mt-0.5">{user?.phone}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm space-y-5">
        <div>
          <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Email Address <span className="text-outline">(optional)</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Phone Number</label>
          <input
            type="text"
            value={user?.phone ?? ''}
            disabled
            className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl text-[15px] text-outline cursor-not-allowed"
          />
          <p className="text-[11px] text-outline mt-1">Phone number cannot be changed.</p>
        </div>

        {error   && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px]">{error}</div>}
        {success && <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-xl text-[13px] flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>Profile saved!</div>}

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3 bg-primary text-on-primary font-bold text-[15px] rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="mt-8 border border-error/20 rounded-2xl p-6">
        <h3 className="text-[16px] font-bold text-on-surface mb-1">Account Actions</h3>
        <p className="text-[13px] text-on-surface-variant mb-4">Manage your session and account settings.</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 border border-error text-error rounded-xl text-[14px] font-semibold hover:bg-error-container transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Log Out
        </button>
      </div>
    </div>
  );
}
