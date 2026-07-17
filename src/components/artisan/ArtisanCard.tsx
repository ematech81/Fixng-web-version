'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  badgeLevel: 'new' | 'verified' | 'trusted';
  isPro: boolean;
  distanceKm: number | null;
  stats: ArtisanStats;
}

interface Props {
  artisan: Artisan;
}

export default function ArtisanCard({ artisan }: Props) {
  const primarySkill = artisan.skills?.[0] ?? 'Artisan';
  const rating       = artisan.stats?.averageRating ?? 0;
  const jobs         = artisan.stats?.completedJobs  ?? 0;

  const badgeLabel =
    artisan.badgeLevel === 'trusted' ? 'Trusted' :
    artisan.badgeLevel === 'verified' ? 'Verified' : null;

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

        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
            <span
              className="material-symbols-outlined text-secondary-fixed-dim"
              style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-[12px] font-semibold text-on-surface">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Badge */}
        {badgeLabel && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            artisan.badgeLevel === 'trusted'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-primary text-on-primary'
          }`}>
            {artisan.isPro && artisan.badgeLevel === 'trusted' ? 'Trusted ⭐' : badgeLabel}
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-[20px] leading-7 font-semibold text-on-surface mb-1">{artisan.name}</h3>
      <p className="text-[14px] font-medium text-on-surface-variant mb-4">{primarySkill}</p>

      {/* Meta row */}
      <div className="mt-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 text-outline">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
          <span className="text-[12px] font-semibold">
            {artisan.distanceKm != null
              ? `${artisan.distanceKm} km away`
              : artisan.state ?? 'Nigeria'}
          </span>
        </div>
        <span className="text-[12px] font-semibold text-on-surface-variant">
          {jobs > 0 ? `${jobs} jobs` : 'New'}
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/artisan/${artisan.id}`}
        className="w-full py-2 border border-primary text-primary font-bold rounded-xl text-[14px] text-center hover:bg-primary hover:text-on-primary transition-all duration-200 block"
      >
        View Profile
      </Link>
    </div>
  );
}
