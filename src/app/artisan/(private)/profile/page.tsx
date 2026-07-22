'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SKILLS, NIGERIAN_STATES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

export default function ArtisanProfilePage() {
  const { user, artisanProfile, refreshMe, logout } = useAuth();
  const ap = artisanProfile as {
    bio?: string;
    skills?: string[];
    location?: { state?: string; lga?: string; address?: string };
    badgeLevel?: string;
    isPro?: boolean;
    profilePhoto?: string;
  } | null;

  const [name,    setName]    = useState(user?.name  ?? '');
  const [email,   setEmail]   = useState(user?.email ?? '');
  const [bio,     setBio]     = useState(ap?.bio     ?? '');
  const [skills,  setSkills]  = useState<string[]>(ap?.skills ?? []);
  const [state,   setStateVal]= useState(ap?.location?.state   ?? '');
  const [lga,     setLga]     = useState(ap?.location?.lga     ?? '');
  const [address, setAddress] = useState(ap?.location?.address ?? '');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [photoUrl,       setPhotoUrl]       = useState<string | null>(ap?.profilePhoto ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('profilePhoto', file);
      const res = await api.post('/api/artisan/onboarding/profile-photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.data?.profilePhotoUrl as string | undefined;
      if (url) {
        setPhotoUrl(url);
        await refreshMe();
      }
    } catch {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await Promise.all([
        api.put('/api/auth/profile', { name: name.trim(), email: email.trim() || undefined }),
        api.put('/api/artisan/profile', { bio: bio.trim(), skills, location: { state, lga: lga.trim(), address: address.trim() } }),
      ]);
      await refreshMe();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      <h1 className="text-[28px] font-black text-on-surface mb-1">My Profile</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Keep your profile updated to attract more customers</p>

      {/* Avatar + badges */}
      <div className="flex items-center gap-5 mb-8">
        {/* Photo with upload button */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <Image src={photoUrl} alt={user?.name ?? ''} fill className="object-cover rounded-2xl" sizes="80px" />
            ) : (
              <span className="text-[28px] font-black text-primary/60">{getInitials(user?.name ?? 'A')}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:brightness-110 transition-all disabled:opacity-50"
            title="Change photo"
          >
            {photoUploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div>
          <p className="text-[18px] font-black text-on-surface">{user?.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {ap?.isPro && <span className="bg-secondary text-on-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full">PRO</span>}
            {ap?.badgeLevel && ap.badgeLevel !== 'new' && (
              <span className="bg-primary-container/20 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">{ap.badgeLevel}</span>
            )}
            {user?.artisanCode && (
              <span className="text-[12px] text-outline font-mono">Code: {user.artisanCode}</span>
            )}
          </div>
          <p className="text-[12px] text-outline mt-1">Tap the camera icon to change your photo</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-on-surface">Basic Information</h3>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Email <span className="text-outline">(optional)</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Bio / Professional Summary</label>
            <textarea value={bio} onChange={(e) => e.target.value.length <= 400 && setBio(e.target.value)} rows={4} placeholder="Describe your skills and experience…"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" />
            <p className="text-[11px] text-outline mt-1 text-right">{bio.length}/400</p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
          <h3 className="text-[15px] font-bold text-on-surface mb-3">Skills <span className="text-outline text-[13px] font-normal">(select all that apply)</span></h3>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <button key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${skills.includes(s) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-on-surface">Service Location</h3>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">State</label>
            <select value={state} onChange={(e) => setStateVal(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">LGA / Area</label>
              <input type="text" value={lga} onChange={(e) => setLga(e.target.value)} placeholder="e.g. Ikeja"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5">Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        {error   && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[13px]">{error}</div>}
        {success && <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-xl text-[13px] flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>Profile saved!</div>}

        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="w-full py-3 bg-primary text-on-primary font-bold text-[15px] rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>

        <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-error text-error rounded-xl font-semibold text-[14px] hover:bg-error-container transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Log Out
        </button>
      </div>
    </div>
  );
}
