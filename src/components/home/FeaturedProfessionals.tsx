'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArtisanCard, { Artisan } from '@/components/artisan/ArtisanCard';
import { publicApi } from '@/lib/api';

export default function FeaturedProfessionals() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    publicApi
      .get('/api/artisans', { params: { limit: '6' } })
      .then((r) => setArtisans(r.data.data ?? r.data.artisans ?? []))
      .catch(() => setArtisans([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && artisans.length === 0) return null;

  return (
    <section className="py-12 bg-surface">
      <div className="container mx-auto px-4 md:px-12">

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[32px] leading-10 font-bold text-on-surface mb-2 tracking-tight">Trusted Professionals</h2>
            <p className="text-[16px] text-on-surface-variant">Top-rated artisans ready to serve you across Nigeria</p>
          </div>
          <Link
            href="/search"
            className="text-primary font-bold text-[14px] items-center gap-1 hover:underline hidden md:flex"
          >
            View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="h-20 skeleton" />
                <div className="bg-white p-4 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full skeleton -mt-10" />
                  <div className="h-5 w-32 skeleton rounded-full" />
                  <div className="h-3 w-24 skeleton rounded-full" />
                  <div className="h-3 w-full skeleton rounded-full" />
                  <div className="h-3 w-3/4 skeleton rounded-full" />
                  <div className="flex gap-2 w-full mt-2">
                    <div className="flex-1 h-9 skeleton rounded-xl" />
                    <div className="flex-1 h-9 skeleton rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8 md:hidden">
          <Link href="/search" className="flex items-center gap-2 text-primary font-bold text-[15px]">
            View All Professionals
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
