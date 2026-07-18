'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ArtisanCard, { Artisan } from '@/components/artisan/ArtisanCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { publicApi } from '@/lib/api';
import { SKILLS, NIGERIAN_STATES } from '@/lib/constants';

function SearchInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [skill,       setSkill]       = useState(searchParams.get('skill') ?? '');
  const [state,       setState]       = useState(searchParams.get('state') ?? '');
  const [maxDistance, setMaxDistance] = useState('50');
  const [minRating,   setMinRating]   = useState('0');
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [searchText,  setSearchText]  = useState('');

  const [results,     setResults]     = useState<Artisan[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [coords,      setCoords]      = useState<{ lat: number; lng: number } | null>(null);

  // Get browser location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null)
      );
    }
  }, []);

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: '48',
        ...(skill        && { category: skill }),
        ...(minRating !== '0' && { minRating }),
        ...(trustedOnly  && { isPro: 'true' }),
        ...(coords       && { latitude: String(coords.lat), longitude: String(coords.lng) }),
        ...(maxDistance  && coords && { maxDistance }),
      };
      const res = await publicApi.get('/api/artisans', { params });
      let data: Artisan[] = res.data.data ?? res.data.artisans ?? [];

      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        data = data.filter(
          (a) => a.name.toLowerCase().includes(q) || a.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (state) {
        data = data.filter((a) => a.state?.toLowerCase() === state.toLowerCase());
      }
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [skill, state, maxDistance, minRating, trustedOnly, searchText, coords]);

  // Load artisans immediately on mount (and whenever filters change via Search button)
  useEffect(() => {
    fetchArtisans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when URL skill param changes (clicking profession from landing page)
  useEffect(() => {
    const urlSkill = searchParams.get('skill');
    if (urlSkill) {
      setSkill(urlSkill);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtisans();
  };

  const resetFilters = () => {
    setSkill('');
    setState('');
    setMaxDistance('50');
    setMinRating('0');
    setTrustedOnly(false);
    setSearchText('');
    router.push('/search');
    // Fetch all after reset
    setTimeout(() => fetchArtisans(), 0);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">

        {/* ── Sticky Filter Bar ────────────────────────────────────────────── */}
        <section className="sticky top-16 z-40 bg-surface border-b border-outline-variant px-4 md:px-12 py-4">
          <form onSubmit={handleSearch} className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-3">

            {/* Search text */}
            <div className="relative flex-grow min-w-[180px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name or skill…"
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Skill */}
            <select value={skill} onChange={(e) => setSkill(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="">All Skills</option>
              {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* State */}
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="">All States</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Rating */}
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="0">Any Rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>

            {/* Trusted toggle */}
            <button type="button" onClick={() => setTrustedOnly((t) => !t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${trustedOnly ? 'bg-secondary-container text-on-secondary-container border-secondary-container' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: trustedOnly ? "'FILL' 1" : "'FILL' 0" }}>verified</span>
              Verified Only
            </button>

            <button type="submit"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-[14px] font-bold hover:brightness-110 active:scale-95 transition-all">
              Search
            </button>
          </form>
        </section>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-8 max-w-screen-xl mx-auto">

          {/* Result count */}
          {!loading && results.length > 0 && (
            <p className="text-[14px] text-on-surface-variant mb-6">
              {results.length} artisan{results.length !== 1 ? 's' : ''} available
              {skill ? ` · ${skill}` : ''}
              {state ? ` · ${state}` : ''}
            </p>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Grid */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[80px] text-outline-variant mb-4">person_search</span>
              <h2 className="text-[24px] font-bold text-on-surface mb-2">No artisans found</h2>
              <p className="text-[15px] text-on-surface-variant max-w-sm mb-6">
                Try broadening your filters or searching a different skill or state.
              </p>
              <button onClick={resetFilters} className="text-primary font-bold hover:underline text-[15px]">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-6 bg-surface-container-highest border-t border-outline-variant">
        <div className="space-y-2">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <p className="text-[14px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {['About Us', 'Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map((l) => (
            <Link key={l} href="#" className="text-[14px] text-on-surface-variant hover:underline hover:text-primary transition-all">{l}</Link>
          ))}
        </div>
      </footer>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
