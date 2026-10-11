'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
  const [minRating,   setMinRating]   = useState('0');
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [searchText,  setSearchText]  = useState('');

  const [results,     setResults]     = useState<Artisan[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total,       setTotal]       = useState(0);
  const [hasMore,     setHasMore]     = useState(false);
  const [page,        setPage]        = useState(1);
  // Filters as they were when Search was last pressed — "Load More" must use these, not half-edited form values
  const appliedParams = useRef<Record<string, string>>({});
  // Newest request wins: the page fetches once without location and again when location arrives; if the
  // slower first answer landed last it would overwrite the nearest-first list.
  const requestSeq = useRef(0);
  const [coords,      setCoords]      = useState<{ lat: number; lng: number } | null>(null);
  const [showTop,     setShowTop]     = useState(false);

  // Back-to-top button (phones): appears once the user has scrolled down a bit
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Get browser location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null)
      );
    }
  }, []);

  const PAGE_SIZE = 24;   // 24 fills whole rows at 1, 2, 3 and 4 columns

  // Page 1 of a fresh search. Filtering by name/state/skill happens on the server so that
  // paging ("Load More") stays correct. No distance cut-off: artisans are listed nearest first,
  // so people in one city still see artisans elsewhere instead of an empty-looking marketplace.
  const fetchArtisans = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        ...(skill        && { category: skill }),
        ...(state        && { state }),
        ...(searchText.trim() && { q: searchText.trim() }),
        ...(minRating !== '0' && { minRating }),
        ...(trustedOnly  && { isPro: 'true' }),
        ...(coords       && { latitude: String(coords.lat), longitude: String(coords.lng) }),
      };
      appliedParams.current = params;
      const res = await publicApi.get('/api/artisans', { params: { ...params, page: '1' } });
      if (seq !== requestSeq.current) return;          // a newer search started meanwhile: drop this answer
      const data: Artisan[] = res.data.data ?? res.data.artisans ?? [];
      setResults(data);
      setPage(1);
      setTotal(res.data.pagination?.total ?? data.length);
      setHasMore(!!res.data.pagination?.hasMore);
    } catch {
      if (seq !== requestSeq.current) return;
      setResults([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [skill, state, minRating, trustedOnly, searchText, coords]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await publicApi.get('/api/artisans', { params: { ...appliedParams.current, page: String(next) } });
      if (seq !== requestSeq.current) return;          // a new search replaced the list while this page loaded
      const more: Artisan[] = res.data.data ?? [];
      setResults((prev) => {
        const have = new Set(prev.map((a) => a.id));
        return [...prev, ...more.filter((a) => !have.has(a.id))];
      });
      setPage(next);
      setHasMore(!!res.data.pagination?.hasMore);
    } catch { /* keep what is shown; the button stays so they can retry */ }
    finally { setLoadingMore(false); }
  };

  // Load artisans immediately on mount (and whenever filters change via Search button)
  useEffect(() => {
    fetchArtisans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Location arrives a moment after the first load: fetch again once so distances show up
  useEffect(() => {
    if (coords) fetchArtisans();
  }, [coords]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {/* Sticky only on md+; on phones it scrolls away with the page */}
        <section className="md:sticky md:top-16 md:z-40 bg-surface border-b border-outline-variant px-4 md:px-12 py-3 md:py-4">
          <form onSubmit={handleSearch} className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-2 md:gap-3">

            {/* Search text */}
            <div className="relative flex-grow min-w-[180px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name or skill…"
                className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Skill */}
            <select value={skill} onChange={(e) => setSkill(e.target.value)}
              className="w-full md:w-auto bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 md:py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="">All Skills</option>
              {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* State */}
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="flex-1 min-w-0 md:flex-none bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 md:py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="">All States</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Rating */}
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
              className="flex-1 min-w-0 md:flex-none bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 md:py-2.5 text-[14px] text-on-surface-variant focus:ring-2 focus:ring-primary outline-none">
              <option value="0">Any Rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>

            {/* Trusted toggle */}
            <button type="button" onClick={() => setTrustedOnly((t) => !t)}
              className={`flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${trustedOnly ? 'bg-secondary-container text-on-secondary-container border-secondary-container' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: trustedOnly ? "'FILL' 1" : "'FILL' 0" }}>verified</span>
              Verified Only
            </button>

            <button type="submit"
              className="flex-1 md:flex-none bg-primary text-on-primary px-6 py-2 md:py-2.5 rounded-xl text-[14px] font-bold hover:brightness-110 active:scale-95 transition-all">
              Search
            </button>
          </form>
        </section>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-5 md:py-8 max-w-screen-xl mx-auto">

          {/* Result count */}
          {!loading && results.length > 0 && (
            <p className="text-[13px] md:text-[14px] text-on-surface-variant mb-4 md:mb-6">
              {total} artisan{total !== 1 ? 's' : ''} available
              {results.length < total ? ` · showing ${results.length}` : ''}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {results.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && results.length > 0 && (
            <div className="flex flex-col items-center gap-2 mt-8 md:mt-10">
              {hasMore ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-primary text-on-primary text-[16px] font-bold shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
                >
                  {loadingMore
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>expand_more</span>}
                  {loadingMore ? 'Loading…' : 'Load more artisans'}
                </button>
              ) : (
                results.length > PAGE_SIZE && <p className="text-[13px] text-on-surface-variant">You&apos;ve seen all {total} artisans.</p>
              )}
              {hasMore && <p className="text-[12px] text-on-surface-variant">Showing {results.length} of {total}</p>}
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

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="md:hidden fixed bottom-5 right-4 z-40 w-11 h-11 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>keyboard_arrow_up</span>
        </button>
      )}

      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-6 bg-surface-container-highest border-t border-outline-variant">
        <div className="space-y-2">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <p className="text-[14px] text-on-surface-variant">© {new Date().getFullYear()} FixNG Artisan Marketplace. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {([['About Us','/about'],['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Help Center','/help'],['Contact','/contact']] as [string,string][]).map(([label,href]) => (
            <Link key={label} href={href} className="text-[14px] text-on-surface-variant hover:underline hover:text-primary transition-all">{label}</Link>
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
