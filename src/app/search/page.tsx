'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ArtisanCard, { Artisan } from '@/components/artisan/ArtisanCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import api from '@/lib/api';
import { SKILLS, NIGERIAN_STATES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

// ── Search inner (needs useSearchParams inside Suspense) ──────────────────────
function SearchInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user, loading: authLoading } = useAuth();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [skill,       setSkill]       = useState(searchParams.get('skill') ?? '');
  const [state,       setState]       = useState(searchParams.get('state') ?? '');
  const [maxDistance, setMaxDistance] = useState('20');
  const [minRating,   setMinRating]   = useState('0');
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [searchText,  setSearchText]  = useState('');

  // ── Results state ─────────────────────────────────────────────────────────
  const [results,  setResults]  = useState<Artisan[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showMap, setShowMap] = useState(false);
  const [coords,  setCoords]  = useState<{ lat: number; lng: number } | null>(null);

  // ── Get browser location once ──────────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null)
      );
    }
  }, []);

  // ── Fetch artisans ─────────────────────────────────────────────────────────
  const fetchArtisans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const params: Record<string, string> = {
        limit: '24',
        ...(skill       && { category: skill }),
        ...(maxDistance && { maxDistance }),
        ...(minRating !== '0' && { minRating }),
        ...(trustedOnly && { isPro: 'true' }),
        ...(coords && { latitude: String(coords.lat), longitude: String(coords.lng) }),
      };
      const res = await api.get('/api/artisans', { params });
      let data: Artisan[] = res.data.data ?? [];

      // Client-side text filter (name search)
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        data = data.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      // State filter (backend doesn't take state param, filter client-side)
      if (state) {
        data = data.filter((a) => a.state?.toLowerCase() === state.toLowerCase());
      }
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user, skill, state, maxDistance, minRating, trustedOnly, searchText, coords]);

  // Auto-fetch when user is ready and a skill param came from landing page
  useEffect(() => {
    if (!authLoading && user && searchParams.get('skill')) {
      fetchArtisans();
    }
  }, [authLoading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtisans();
  };

  const resetFilters = () => {
    setSkill('');
    setState('');
    setMaxDistance('20');
    setMinRating('0');
    setTrustedOnly(false);
    setSearchText('');
    setResults([]);
    setHasSearched(false);
    router.push('/search');
  };

  // ── Not logged in — gate ──────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[48px] text-primary">person_search</span>
          </div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight">Find Skilled Artisans</h2>
          <p className="text-[16px] text-on-surface-variant max-w-md">
            Create a free account to search for verified professionals near you.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="/register" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-[16px] hover:opacity-90 transition-all">
              Get Started Free
            </Link>
            <Link href="/login" className="border border-primary text-primary px-8 py-3 rounded-xl font-bold text-[16px] hover:bg-primary hover:text-on-primary transition-all">
              Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">

        {/* ── Sticky Filter Bar ─────────────────────────────────────────────── */}
        <section className="sticky top-16 z-40 bg-surface border-b border-outline-variant px-4 md:px-12 py-4">
          <form onSubmit={handleSearch} className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-4">

            {/* Search text */}
            <div className="relative flex-grow min-w-[200px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search skilled pros..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Skill */}
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Skill: All</option>
                {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* State */}
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">State: All</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Distance */}
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="5">Distance: 5km</option>
                <option value="10">10km</option>
                <option value="20">20km</option>
                <option value="50">50km</option>
                <option value="100">100km</option>
              </select>

              {/* Rating */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="0">Rating: Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>

              {/* Trusted only toggle */}
              <button
                type="button"
                onClick={() => setTrustedOnly((t) => !t)}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-[14px] font-bold border transition-all ${
                  trustedOnly
                    ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: trustedOnly ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                Trusted
              </button>
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="bg-primary text-on-primary px-6 py-2 rounded-xl text-[14px] font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Search
            </button>

            {/* Map toggle */}
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-[14px] font-bold hover:brightness-95 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">{showMap ? 'grid_view' : 'map'}</span>
              {showMap ? 'Show Grid' : 'Show Map'}
            </button>
          </form>
        </section>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-8 max-w-screen-xl mx-auto">

          {/* Result count */}
          {hasSearched && !loading && (
            <p className="text-[14px] text-on-surface-variant mb-6">
              {results.length > 0
                ? `${results.length} artisan${results.length !== 1 ? 's' : ''} found${skill ? ` for "${skill}"` : ''}${state ? ` in ${state}` : ''}`
                : ''}
            </p>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Map view */}
          {!loading && showMap && hasSearched && (
            <div className="h-[70vh] rounded-2xl overflow-hidden relative border border-outline-variant bg-surface-container-low flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-[64px] text-outline-variant">map</span>
                <p className="text-[16px] text-on-surface-variant mt-4 font-medium">Map view coming soon</p>
                <p className="text-[14px] text-outline mt-1">Leaflet integration in next update</p>
              </div>
            </div>
          )}

          {/* Grid view */}
          {!loading && !showMap && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300">
              {results.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          )}

          {/* Initial state — not searched yet */}
          {!loading && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-48 h-48 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[80px] text-outline-variant">search</span>
              </div>
              <h2 className="text-[32px] font-bold text-on-surface mb-4 tracking-tight">Find Your Pro</h2>
              <p className="text-[16px] text-on-surface-variant max-w-md mb-8">
                Choose a skill, set your location, and hit Search to find verified professionals near you.
              </p>
              {coords && (
                <button
                  onClick={fetchArtisans}
                  className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-[16px] hover:opacity-90 transition-all"
                >
                  Find Artisans Near Me
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-48 h-48 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[80px] text-outline-variant">person_search</span>
              </div>
              <h2 className="text-[32px] font-bold text-on-surface mb-4 tracking-tight">No Artisans Found</h2>
              <p className="text-[16px] text-on-surface-variant max-w-md mb-8">
                Try adjusting your filters or searching for a broader skill to find professionals in your area.
              </p>
              <button
                onClick={resetFilters}
                className="text-primary font-bold hover:underline text-[16px]"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
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

// ── Page export (wraps Suspense for useSearchParams) ─────────────────────────
export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
