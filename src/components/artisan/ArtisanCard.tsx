'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

interface ArtisanStats {
  completedJobs: number;
  averageRating: number;
  totalRatings: number;
}

export interface Artisan {
  id: string;
  name: string;
  profilePhoto: string | null;
  skills: string[];
  bio: string | null;
  address: string | null;
  state: string | null;
  lga?: string | null;
  badgeLevel: 'new' | 'verified' | 'trusted';
  isPro: boolean;
  distanceKm: number | null;
  stats: ArtisanStats;
}

interface Props {
  artisan: Artisan;
}

export default function ArtisanCard({ artisan }: Props) {
  const router         = useRouter();
  const { user }       = useAuth();
  const primarySkill   = artisan.skills?.[0] ?? 'Artisan';
  const rating         = artisan.stats?.averageRating ?? 0;
  const jobs           = artisan.stats?.completedJobs  ?? 0;

  const badgeLabel =
    artisan.badgeLevel === 'trusted'  ? 'Trusted'  :
    artisan.badgeLevel === 'verified' ? 'Verified' : null;

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/customer/post-job?artisanId=${artisan.id}`);
      return;
    }
    if (user.role === 'artisan') {
      router.push(`/artisan/${artisan.id}`);
      return;
    }
    try {
      sessionStorage.setItem('booking_artisan', JSON.stringify({
        id: artisan.id, name: artisan.name, skills: artisan.skills,
        profilePhoto: artisan.profilePhoto, isPro: artisan.isPro,
        badgeLevel: artisan.badgeLevel, lga: artisan.lga ?? null,
        state: artisan.state, distanceKm: artisan.distanceKm,
      }));
    } catch { /* private browsing */ }
    router.push(`/customer/post-job?artisanId=${artisan.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl p-4 flex flex-col group transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0px 10px 25px rgba(0,0,0,0.10)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0,0,0,0.05)')}
    >
      {/* Photo */}
      <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-surface-container">
        {artisan.profilePhoto ? (
          <Image
            src={artisan.profilePhoto}
            alt={artisan.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="text-[48px] font-black text-primary/30">
              {getInitials(artisan.name)}
            </span>
          </div>
        )}

        {/* PRO pill */}
        {artisan.isPro && (
          <div className="absolute top-2 left-2 bg-secondary text-on-secondary text-[10px] font-black px-2 py-0.5 rounded-full">
            PRO
          </div>
        )}

        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[12px] font-semibold text-on-surface">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Verified badge */}
        {badgeLabel && !artisan.isPro && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            artisan.badgeLevel === 'trusted'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-primary text-on-primary'
          }`}>
            {badgeLabel}
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-[17px] font-bold text-on-surface mb-0.5">{artisan.name}</h3>
      <p className="text-[13px] font-medium text-on-surface-variant mb-3">{primarySkill}</p>

      {/* Skills chips */}
      {artisan.skills.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {artisan.skills.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-primary-container/20 text-primary text-[11px] font-semibold rounded-full">{s}</span>
          ))}
          {artisan.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-surface-container text-outline text-[11px] font-semibold rounded-full">+{artisan.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="mt-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-outline">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
          <span className="text-[12px] font-semibold">
            {artisan.distanceKm != null ? `${artisan.distanceKm} km away` : artisan.state ?? 'Nigeria'}
          </span>
        </div>
        <span className="text-[12px] font-semibold text-on-surface-variant">
          {jobs > 0 ? `${jobs} job${jobs !== 1 ? 's' : ''}` : 'New'}
        </span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <Link
          href={`/artisan/${artisan.id}`}
          className="flex-1 py-2 border border-outline-variant text-on-surface-variant font-semibold rounded-xl text-[13px] text-center hover:border-primary hover:text-primary transition-all duration-200"
        >
          View Profile
        </Link>
        <button
          onClick={handleBookNow}
          className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl text-[13px] hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
