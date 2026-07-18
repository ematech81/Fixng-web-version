'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import { PROFESSION_ICONS, BADGE_LEVEL_MAP } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ArtisanProfile {
  id: string;
  name: string;
  artisanCode: string;
  memberSince: string;
  profilePhoto: string | null;
  skills: string[];
  bio: string | null;
  badgeLevel: 'new' | 'verified' | 'trusted';
  isPro: boolean;
  location: { address: string | null; state: string | null; lga: string | null };
  stats: {
    completedJobs: number;
    averageRating: number;
    totalRatings: number;
    cancelledJobs: number;
    disputeCount: number;
    avgResponseTimeMinutes: number;
    onTimeArrivalRate: number;
    acceptanceRate: number;
  };
  dispatchInfo?: {
    vehicleType?: string;
    plateNumber?: string;
    coverageArea?: string[];
  } | null;
}

interface Review {
  id: string;
  customerName: string;
  ratings: {
    quality?: number;
    timeliness?: number;
    communication?: number;
    value?: number;
  };
  overallScore: number;
  comment: string | null;
  createdAt: string;
}

// ── Star row helper ───────────────────────────────────────────────────────────
function Stars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-secondary-fixed-dim"
          style={{
            fontSize: '16px',
            fontVariationSettings: i <= Math.round(score) ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-2xl text-[14px] font-medium shadow-xl flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        {message}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="h-64 md:h-80 skeleton w-full" />
        {/* Profile card */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-12 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-2xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded skeleton" />
              <div className="h-5 w-32 rounded skeleton" />
              <div className="h-4 w-64 rounded skeleton" />
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 rounded-2xl skeleton" />
            <div className="h-64 rounded-2xl skeleton" />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ArtisanProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toastMsg, setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoadingProfile(true);
    api
      .get(`/api/artisans/${id}`)
      .then((res) => setProfile(res.data.data))
      .catch(() => setError('Artisan not found.'))
      .finally(() => setLoadingProfile(false));
  }, [id]);

  // ── Fetch reviews ──────────────────────────────────────────────────────────
  const fetchReviews = useCallback(
    (page: number) => {
      if (!id) return;
      setLoadingReviews(true);
      api
        .get(`/api/artisans/${id}/reviews`, { params: { page, limit: 5 } })
        .then((res) => {
          setReviews(res.data.data ?? []);
          setReviewTotal(res.data.pagination?.total ?? 0);
        })
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    },
    [id]
  );

  useEffect(() => {
    if (id) fetchReviews(reviewPage);
  }, [id, reviewPage, fetchReviews]);

  // ── Copy artisan code ──────────────────────────────────────────────────────
  const handleCopyCode = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.artisanCode);
      showToast('Artisan code copied!');
    } catch {
      showToast(`Code: ${profile.artisanCode}`);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile.name, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      showToast('Link copied to clipboard!');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  if (loadingProfile) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
          <span className="material-symbols-outlined text-[72px] text-outline-variant">person_off</span>
          <h2 className="text-[28px] font-bold text-on-surface">Artisan Not Found</h2>
          <p className="text-on-surface-variant">{error ?? 'This profile does not exist or has been removed.'}</p>
          <Link href="/search" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
            Search Artisans
          </Link>
        </div>
      </>
    );
  }

  const badge = BADGE_LEVEL_MAP[profile.badgeLevel];
  const primarySkill = profile.skills?.[0] ?? 'Artisan';
  const skillIcon = PROFESSION_ICONS[primarySkill] ?? PROFESSION_ICONS.default;
  const locationStr = [profile.location.lga, profile.location.state].filter(Boolean).join(', ');
  const reviewPages = Math.ceil(reviewTotal / 5);

  const statItems = [
    { icon: 'work', label: 'Jobs Done', value: profile.stats.completedJobs },
    { icon: 'star', label: 'Rating', value: profile.stats.averageRating > 0 ? profile.stats.averageRating.toFixed(1) : '—' },
    { icon: 'reviews', label: 'Reviews', value: profile.stats.totalRatings },
    { icon: 'schedule', label: 'Avg Response', value: profile.stats.avgResponseTimeMinutes > 0 ? `${profile.stats.avgResponseTimeMinutes}m` : '—' },
  ];

  return (
    <>
      <Navbar />
      <Toast message={toastMsg} visible={toastVisible} />

      <main className="pt-16 min-h-screen bg-surface">

        {/* ── Hero cover ──────────────────────────────────────────────────── */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {/* Gradient cover — no cover photo in DB */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg,
                hsl(var(--md-sys-color-primary) / 0.9) 0%,
                hsl(var(--md-sys-color-secondary) / 0.7) 60%,
                hsl(var(--md-sys-color-tertiary) / 0.5) 100%)`,
              backgroundColor: '#1B4FD8',
            }}
          />
          {/* Circuit overlay */}
          <div className="absolute inset-0 circuit-bg" />
          {/* Skill icon watermark */}
          <div className="absolute bottom-8 right-8 opacity-10">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '128px' }}>
              {skillIcon}
            </span>
          </div>
        </div>

        {/* ── Profile card ────────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-12">
          <div
            className="relative -mt-24 md:-mt-32 z-10 bg-white rounded-2xl p-6 md:p-8"
            style={{ boxShadow: '0px 8px 40px rgba(0,0,0,0.12)' }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-surface-container">
                  {profile.profilePhoto ? (
                    <Image
                      src={profile.profilePhoto}
                      alt={profile.name}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-container flex items-center justify-center">
                      <span className="text-[40px] font-black text-primary/60">
                        {getInitials(profile.name)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Pro badge dot */}
                {profile.isPro && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center border-2 border-white shadow">
                    <span className="material-symbols-outlined text-on-secondary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-[28px] md:text-[32px] font-black text-on-surface tracking-tight leading-tight">
                    {profile.name}
                  </h1>
                  {profile.isPro && (
                    <span className="inline-flex items-center gap-1 bg-secondary text-on-secondary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verified Pro
                    </span>
                  )}
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{
                      background:
                        profile.badgeLevel === 'trusted' ? '#FEF3C7' :
                        profile.badgeLevel === 'verified' ? '#EFF6FF' : '#F3F4F6',
                      color:
                        profile.badgeLevel === 'trusted' ? '#92400E' :
                        profile.badgeLevel === 'verified' ? '#1D4ED8' : '#6B7280',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-[16px] font-semibold text-on-surface-variant mb-2">{primarySkill}</p>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-[14px] text-outline">
                  {locationStr && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      {locationStr}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                    Member since {formatDate(profile.memberSince)}
                  </span>
                  {profile.stats.averageRating > 0 && (
                    <span className="flex items-center gap-1 text-secondary-fixed-dim font-semibold">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                      {profile.stats.averageRating.toFixed(1)} ({profile.stats.totalRatings})
                    </span>
                  )}
                </div>

                {/* Artisan code + actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* FNG code chip */}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-xl text-[13px] font-bold hover:brightness-95 active:scale-95 transition-all"
                    title="Click to copy artisan code"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>badge</span>
                    FNG Code: {profile.artisanCode}
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }}>content_copy</span>
                  </button>

                  {/* Request job */}
                  {user ? (
                    <button
                      onClick={() => router.push(`/customer/post-job?artisanId=${profile.id}`)}
                      className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-[14px] font-bold hover:opacity-90 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>handyman</span>
                      Request Service
                    </button>
                  ) : (
                    <Link
                      href="/register"
                      className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-[14px] font-bold hover:opacity-90 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>handyman</span>
                      Request Service
                    </Link>
                  )}

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 border border-outline-variant text-on-surface-variant px-4 py-2 rounded-xl text-[14px] font-medium hover:border-primary hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento body ──────────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left column (stats, skills, badges) ──────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Stats card */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 className="text-[16px] font-bold text-on-surface mb-4">Performance Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {statItems.map((s) => (
                  <div key={s.label} className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center gap-1 text-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
                      {s.icon}
                    </span>
                    <span className="text-[20px] font-black text-on-surface leading-tight">{s.value}</span>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Extra rates */}
              {(profile.stats.onTimeArrivalRate > 0 || profile.stats.acceptanceRate > 0) && (
                <div className="mt-4 space-y-3">
                  {profile.stats.onTimeArrivalRate > 0 && (
                    <div>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-on-surface-variant">On-Time Arrival</span>
                        <span className="font-bold text-on-surface">{profile.stats.onTimeArrivalRate}%</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tertiary rounded-full"
                          style={{ width: `${profile.stats.onTimeArrivalRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {profile.stats.acceptanceRate > 0 && (
                    <div>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-on-surface-variant">Acceptance Rate</span>
                        <span className="font-bold text-on-surface">{profile.stats.acceptanceRate}%</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${profile.stats.acceptanceRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 className="text-[16px] font-bold text-on-surface mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Link
                    key={skill}
                    href={`/search?skill=${encodeURIComponent(skill)}`}
                    className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-[13px] font-semibold hover:brightness-95 transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {PROFESSION_ICONS[skill] ?? PROFESSION_ICONS.default}
                    </span>
                    {skill}
                  </Link>
                ))}
              </div>
            </div>

            {/* Badge / Trust */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 className="text-[16px] font-bold text-on-surface mb-4">Trust Level</h3>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      profile.badgeLevel === 'trusted' ? '#FEF3C7' :
                      profile.badgeLevel === 'verified' ? '#EFF6FF' : '#F3F4F6',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '28px',
                      fontVariationSettings: "'FILL' 1",
                      color:
                        profile.badgeLevel === 'trusted' ? '#D97706' :
                        profile.badgeLevel === 'verified' ? '#1D4ED8' : '#9CA3AF',
                    }}
                  >
                    {profile.badgeLevel === 'trusted' ? 'military_tech' : profile.badgeLevel === 'verified' ? 'verified_user' : 'person'}
                  </span>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-on-surface">{badge.label} Artisan</p>
                  <p className="text-[13px] text-on-surface-variant">
                    {profile.badgeLevel === 'trusted'
                      ? 'Top-rated with 5+ completed jobs'
                      : profile.badgeLevel === 'verified'
                      ? 'Identity and skills verified'
                      : 'Recently joined FixNG'}
                  </p>
                </div>
              </div>
              {profile.isPro && (
                <div className="mt-3 p-3 bg-secondary-container rounded-xl flex items-center gap-2 text-on-secondary-container text-[13px] font-semibold">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  Pro Plan — Priority visibility & advanced features
                </div>
              )}
            </div>

            {/* Dispatch info (if applicable) */}
            {profile.dispatchInfo && (
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 className="text-[16px] font-bold text-on-surface mb-4">Dispatch Details</h3>
                <dl className="space-y-2 text-[14px]">
                  {profile.dispatchInfo.vehicleType && (
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Vehicle</dt>
                      <dd className="font-semibold text-on-surface capitalize">{profile.dispatchInfo.vehicleType}</dd>
                    </div>
                  )}
                  {profile.dispatchInfo.plateNumber && (
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Plate Number</dt>
                      <dd className="font-semibold text-on-surface font-mono">{profile.dispatchInfo.plateNumber}</dd>
                    </div>
                  )}
                  {profile.dispatchInfo.coverageArea && profile.dispatchInfo.coverageArea.length > 0 && (
                    <div>
                      <dt className="text-on-surface-variant mb-1">Coverage Area</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {profile.dispatchInfo.coverageArea.map((area) => (
                          <span key={area} className="bg-surface-container-low text-on-surface px-2 py-0.5 rounded-full text-[12px] font-medium">
                            {area}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* ── Right column (bio, portfolio placeholder, reviews) ────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 className="text-[18px] font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>person</span>
                  Professional Summary
                </h3>
                <p className="text-[15px] text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Portfolio placeholder */}
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 className="text-[18px] font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>photo_library</span>
                Portfolio
              </h3>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-[56px] text-outline-variant mb-3">add_photo_alternate</span>
                <p className="text-[15px] font-semibold text-on-surface">No portfolio photos yet</p>
                <p className="text-[13px] text-on-surface-variant mt-1">
                  This artisan hasn&apos;t uploaded work samples yet.
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>reviews</span>
                  Reviews
                  {reviewTotal > 0 && (
                    <span className="bg-primary-container text-on-primary-container text-[12px] font-bold px-2 py-0.5 rounded-full ml-1">
                      {reviewTotal}
                    </span>
                  )}
                </h3>
                {profile.stats.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Stars score={profile.stats.averageRating} />
                    <span className="text-[20px] font-black text-on-surface">{profile.stats.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-outline-variant rounded-xl p-4 space-y-2">
                      <div className="h-4 w-32 rounded skeleton" />
                      <div className="h-3 w-48 rounded skeleton" />
                      <div className="h-12 rounded skeleton" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">rate_review</span>
                  <p className="text-[15px] font-semibold text-on-surface">No reviews yet</p>
                  <p className="text-[13px] text-on-surface-variant mt-1">Be the first to leave a review after a job.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-outline-variant rounded-xl p-5 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center text-[13px] font-bold text-primary">
                              {getInitials(review.customerName)}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-on-surface leading-tight">{review.customerName}</p>
                              <p className="text-[12px] text-outline">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Stars score={review.overallScore} />
                            <span className="text-[14px] font-bold text-on-surface">{review.overallScore.toFixed(1)}</span>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-[14px] text-on-surface-variant leading-relaxed mt-2">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}

                        {/* Sub-ratings */}
                        {review.ratings && Object.keys(review.ratings).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(review.ratings).map(([key, val]) => (
                              val != null && (
                                <span key={key} className="text-[11px] bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full capitalize font-medium">
                                  {key}: {(val as number).toFixed(1)}
                                </span>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {reviewPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                        disabled={reviewPage === 1}
                        className="p-2 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                      </button>
                      {Array.from({ length: reviewPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setReviewPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${
                            reviewPage === i + 1
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setReviewPage((p) => Math.min(reviewPages, p + 1))}
                        disabled={reviewPage === reviewPages}
                        className="p-2 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Request CTA banner */}
            <div
              className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #0EA5E9 100%)' }}
            >
              <div className="text-white">
                <h4 className="text-[20px] font-black mb-1">Ready to hire {profile.name.split(' ')[0]}?</h4>
                <p className="text-[14px] text-blue-100">Post a job and get a response within minutes.</p>
              </div>
              {user ? (
                <button
                  onClick={() => router.push(`/customer/post-job?artisanId=${profile.id}`)}
                  className="flex-shrink-0 bg-white text-primary font-black px-8 py-3 rounded-xl text-[15px] hover:bg-blue-50 active:scale-95 transition-all whitespace-nowrap"
                >
                  Post a Job
                </button>
              ) : (
                <Link
                  href="/register"
                  className="flex-shrink-0 bg-white text-primary font-black px-8 py-3 rounded-xl text-[15px] hover:bg-blue-50 transition-all whitespace-nowrap"
                >
                  Get Started Free
                </Link>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-6 bg-surface-container-highest border-t border-outline-variant">
        <div className="space-y-2">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <p className="text-[16px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {['About Us', 'Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map((l) => (
            <Link key={l} href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">{l}</Link>
          ))}
        </div>
      </footer>
    </>
  );
}
