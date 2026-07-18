'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { PROFESSION_ICONS, SKILLS, JOB_STATUS_MAP } from '@/lib/constants';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NearbyArtisan {
  id: string;
  name: string;
  profilePhoto: string | null;
  skills: string[];
  badgeLevel: 'new' | 'verified' | 'trusted';
  isPro: boolean;
  distanceKm: number | null;
  state: string | null;
  stats: { completedJobs: number; averageRating: number };
}

interface Job {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  artisan?: { name: string; profilePhoto?: string | null } | null;
  scheduledDate?: string | null;
  skill?: string;
}

// ── Skill colour palette for cover gradients ───────────────────────────────
const SKILL_GRADIENTS: Record<string, string> = {
  Plumber:              'from-blue-600 to-cyan-500',
  Electrician:          'from-yellow-500 to-orange-500',
  Carpenter:            'from-amber-700 to-yellow-600',
  Painter:              'from-pink-500 to-rose-400',
  'AC Technician':      'from-sky-500 to-indigo-500',
  'AC Maintenance':     'from-sky-500 to-indigo-500',
  'Solar Installation': 'from-yellow-400 to-green-500',
  Welder:               'from-red-600 to-orange-500',
  Tiler:                'from-stone-500 to-gray-600',
  Mason:                'from-gray-500 to-slate-600',
  'Generator Repair':   'from-lime-600 to-green-500',
  'Auto Mechanic':      'from-gray-700 to-zinc-600',
  'Phone/Laptop Repair':'from-purple-600 to-violet-500',
  'Dispatch Rider':     'from-green-500 to-teal-500',
  Driver:               'from-teal-600 to-cyan-500',
  Painter_default:      'from-primary to-blue-400',
};

function skillGradient(skills: string[]): string {
  for (const s of skills) {
    if (SKILL_GRADIENTS[s]) return SKILL_GRADIENTS[s];
  }
  return 'from-primary to-blue-400';
}

// ── Featured categories shown as chips ────────────────────────────────────
const CATEGORY_CHIPS = [
  { label: 'All Services', skill: '' },
  { label: 'Plumbing',     skill: 'Plumber' },
  { label: 'Electrical',   skill: 'Electrician' },
  { label: 'Carpentry',    skill: 'Carpenter' },
  { label: 'AC Repair',    skill: 'AC Technician' },
  { label: 'Painting',     skill: 'Painter' },
  { label: 'Solar',        skill: 'Solar Installation' },
  { label: 'Generator',    skill: 'Generator Repair' },
];

// ── Nearby professional card ──────────────────────────────────────────────
function ProfCard({ artisan }: { artisan: NearbyArtisan }) {
  const router     = useRouter();
  const primarySkill = artisan.skills?.[0] ?? 'Artisan';
  const grad       = skillGradient(artisan.skills);
  const rating     = artisan.stats?.averageRating ?? 0;

  return (
    <div className="min-w-[280px] bg-white rounded-2xl border border-outline-variant/10 overflow-hidden hover:shadow-lg transition-all duration-300 group flex-shrink-0"
      style={{ boxShadow: '0px 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Cover */}
      <div className={`h-32 bg-gradient-to-br ${grad} relative`}>
        <div className="absolute inset-0 circuit-bg opacity-40" />
        {/* Skill icon watermark */}
        <span className="absolute bottom-2 right-3 material-symbols-outlined text-white/20" style={{ fontSize: '48px' }}>
          {PROFESSION_ICONS[primarySkill] ?? PROFESSION_ICONS.default}
        </span>
        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[12px] font-semibold text-on-surface">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-0 pb-4 relative">
        {/* Overlapping avatar */}
        <div className="absolute -top-8 left-4 w-16 h-16 rounded-xl border-4 border-white overflow-hidden shadow-md bg-primary-container">
          {artisan.profilePhoto ? (
            <Image src={artisan.profilePhoto} alt={artisan.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[20px] font-black text-primary/50">{getInitials(artisan.name)}</span>
            </div>
          )}
        </div>

        <div className="pt-10">
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="text-[16px] font-semibold text-on-surface leading-tight">{artisan.name}</h3>
            {(artisan.badgeLevel === 'verified' || artisan.badgeLevel === 'trusted' || artisan.isPro) && (
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>
            )}
          </div>
          <p className="text-[13px] text-on-surface-variant mb-3">{primarySkill}</p>

          <div className="flex items-center justify-between">
            <p className="text-[13px] text-outline flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
              {artisan.distanceKm != null ? `${artisan.distanceKm} km away` : (artisan.state ?? 'Nigeria')}
            </p>
            <button
              onClick={() => router.push(`/customer/post-job?artisanId=${artisan.id}`)}
              className="bg-primary text-on-primary px-3 py-1.5 rounded-xl text-[12px] font-bold active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map = JOB_STATUS_MAP[status] ?? { label: status, color: '#9CA3AF', bg: '#F9FAFB' };
  return (
    <span
      className="text-[11px] font-bold px-3 py-1 rounded-full border capitalize"
      style={{ color: map.color, background: map.bg, borderColor: map.color + '33' }}
    >
      {map.label}
    </span>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────────
function ProfCardSkeleton() {
  return (
    <div className="min-w-[280px] bg-white rounded-2xl border border-outline-variant/10 overflow-hidden flex-shrink-0" style={{ boxShadow: '0px 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="h-32 skeleton" />
      <div className="px-4 pb-4 pt-0 relative">
        <div className="absolute -top-8 left-4 w-16 h-16 rounded-xl border-4 border-white skeleton" />
        <div className="pt-12 space-y-2">
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-8 rounded skeleton mt-3" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuth();
  const router   = useRouter();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [searchText,   setSearchText]   = useState('');
  const [coords,       setCoords]       = useState<{ lat: number; lng: number } | null>(null);

  // Nearby artisans
  const [artisans,     setArtisans]     = useState<NearbyArtisan[]>([]);
  const [loadingProfs, setLoadingProfs] = useState(true);

  // Jobs
  const [jobs,         setJobs]         = useState<Job[]>([]);
  const [loadingJobs,  setLoadingJobs]  = useState(true);

  // ── Geolocation once ────────────────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setCoords(null),
        { timeout: 5000 }
      );
    }
  }, []);

  // ── Fetch nearby artisans ───────────────────────────────────────────────
  const fetchArtisans = useCallback(async () => {
    setLoadingProfs(true);
    try {
      const params: Record<string, string> = { limit: '8' };
      if (coords) {
        params.latitude    = String(coords.lat);
        params.longitude   = String(coords.lng);
        params.maxDistance = '25';
      }
      const res = await api.get('/api/artisans', { params });
      setArtisans(res.data.data ?? []);
    } catch {
      setArtisans([]);
    } finally {
      setLoadingProfs(false);
    }
  }, [coords]);

  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  // ── Fetch customer jobs ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingJobs(true);
    api
      .get('/api/jobs', { params: { limit: '10' } })
      .then((res) => setJobs(res.data.data ?? res.data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Active jobs = not completed/cancelled
  const activeJobs = jobs.filter((j) => !['completed', 'cancelled'].includes(j.status));
  const mainJob    = activeJobs[0] ?? null;
  const sideJobs   = activeJobs.slice(1, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <>
      {/* ── Greeting + search ─────────────────────────────────────────── */}
      <section className="p-4 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-on-surface-variant text-[14px] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
              Nigeria
            </p>
            <h1 className="text-[24px] md:text-[32px] font-black text-on-surface tracking-tight leading-tight">
              {greeting}, {firstName} 👋
            </h1>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search for plumbers, electricians..."
              className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm outline-none"
            />
          </form>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_CHIPS.map(({ label, skill }) => (
            <Link
              key={label}
              href={skill ? `/search?skill=${encodeURIComponent(skill)}` : '/search'}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all border ${
                skill === ''
                  ? 'bg-primary text-on-primary shadow-md border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Nearby professionals ──────────────────────────────────────── */}
      <section className="mb-8">
        <div className="px-4 md:px-8 flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-on-surface">Nearby Professionals</h2>
          <Link href="/search" className="text-primary text-[14px] font-medium hover:underline">
            View All
          </Link>
        </div>

        <div
          className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {loadingProfs
            ? Array.from({ length: 4 }).map((_, i) => <ProfCardSkeleton key={i} />)
            : artisans.length > 0
            ? artisans.map((a) => <ProfCard key={a.id} artisan={a} />)
            : (
              <div className="flex flex-col items-center py-8 text-center w-full">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">person_search</span>
                <p className="text-on-surface-variant text-[14px]">No professionals found nearby.</p>
                <Link href="/search" className="mt-3 text-primary font-semibold text-[14px] hover:underline">
                  Browse all artisans
                </Link>
              </div>
            )
          }
        </div>
      </section>

      {/* ── Active jobs ───────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-on-surface">Active Jobs</h2>
          {activeJobs.length > 0 && (
            <span className="px-2 py-1 bg-surface-container-highest text-primary text-[13px] font-semibold rounded-lg">
              {activeJobs.length} Ongoing
            </span>
          )}
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-40 rounded-3xl skeleton" />
            <div className="flex flex-col gap-4">
              <div className="h-[72px] rounded-2xl skeleton" />
              <div className="h-[72px] rounded-2xl skeleton" />
            </div>
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center border border-dashed border-outline-variant rounded-2xl">
            <span className="material-symbols-outlined text-[56px] text-outline-variant mb-3">work_off</span>
            <p className="text-[16px] font-semibold text-on-surface mb-1">No active jobs</p>
            <p className="text-[13px] text-on-surface-variant mb-4">Post a job to get started with a professional.</p>
            <Link
              href="/customer/post-job"
              className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold text-[14px] hover:opacity-90 transition-all"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Main job card */}
            {mainJob && (
              <Link
                href={`/customer/jobs/${mainJob._id ?? mainJob.id}`}
                className="lg:col-span-2 p-6 md:p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-md transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[40px] text-on-secondary-container">
                    {PROFESSION_ICONS[mainJob.skill ?? ''] ?? 'construction'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="text-[18px] font-bold text-on-surface truncate">{mainJob.title}</h3>
                    <StatusBadge status={mainJob.status} />
                  </div>
                  {mainJob.artisan?.name && (
                    <p className="text-on-surface-variant text-[14px] mb-3">
                      Assigned to: <span className="font-semibold text-on-surface">{mainJob.artisan.name}</span>
                    </p>
                  )}
                  {/* Status progress bar */}
                  {mainJob.status === 'in-progress' && (
                    <>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1">
                        <div className="bg-tertiary h-full" style={{ width: '60%' }} />
                      </div>
                      <p className="text-[12px] text-on-surface-variant">In progress • Check job for updates</p>
                    </>
                  )}
                  {mainJob.status === 'accepted' && (
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>schedule</span>
                      Artisan has accepted — work starts soon
                    </p>
                  )}
                  {mainJob.status === 'pending' && (
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }}>hourglass_empty</span>
                      Waiting for artisan to accept
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors hidden md:block">
                  chevron_right
                </span>
              </Link>
            )}

            {/* Side job cards */}
            <div className="flex flex-col gap-4">
              {sideJobs.length > 0
                ? sideJobs.map((job) => (
                    <Link
                      key={job._id ?? job.id}
                      href={`/customer/jobs/${job._id ?? job.id}`}
                      className="p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          {PROFESSION_ICONS[job.skill ?? ''] ?? 'home_repair_service'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-semibold text-on-surface truncate">{job.title}</h4>
                        <p className="text-[12px] text-on-surface-variant capitalize">{JOB_STATUS_MAP[job.status]?.label ?? job.status}</p>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[18px]">chevron_right</span>
                    </Link>
                  ))
                : (
                  <Link
                    href="/customer/post-job"
                    className="p-4 bg-surface-container-low border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:border-primary transition-all h-full min-h-[120px]"
                  >
                    <span className="material-symbols-outlined text-[32px] text-outline-variant">add_circle</span>
                    <p className="text-[13px] font-semibold text-on-surface-variant">Post another job</p>
                  </Link>
                )
              }

              {/* Quick action: Post a job */}
              {sideJobs.length < 2 && activeJobs.length > 0 && (
                <Link
                  href="/customer/post-job"
                  className="p-4 bg-primary-container text-on-primary-container border border-primary/20 rounded-2xl flex items-center gap-3 hover:brightness-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                  <span className="text-[14px] font-semibold">Post a New Job</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Map snapshot ──────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 pb-8">
        <div className="rounded-3xl h-64 relative overflow-hidden shadow-sm group">
          {/* Gradient map placeholder */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1B4FD8 40%, #0EA5E9 100%)' }}
          />
          <div className="absolute inset-0 circuit-bg opacity-30" />
          {/* Decorative artisan pins */}
          {[
            { top: '25%', left: '20%' },
            { top: '40%', left: '55%' },
            { top: '60%', left: '30%' },
            { top: '35%', left: '75%' },
            { top: '65%', left: '65%' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  person_pin
                </span>
              </div>
              {i === 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 bg-white text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-md shadow whitespace-nowrap">
                  Pro nearby
                </div>
              )}
            </div>
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />
          {/* Bottom label */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <h3 className="text-[20px] font-bold leading-tight">Artisans Near You</h3>
              <p className="text-[13px] opacity-90 mt-0.5">
                {artisans.length > 0 ? `${artisans.length} active professionals found` : 'Find professionals in your area'}
              </p>
            </div>
            <Link
              href="/search"
              className="bg-white text-on-surface px-5 py-2.5 rounded-2xl text-[14px] font-bold shadow-lg active:scale-95 transition-all hover:bg-surface-container-low whitespace-nowrap"
            >
              Browse All
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 md:px-8 flex flex-col md:flex-row justify-between gap-6 bg-surface-container-highest border-t border-outline-variant/30">
        <div className="space-y-2">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <p className="text-[14px] text-on-surface-variant max-w-xs">
            Connecting trusted artisans with homeowners across Nigeria since 2024.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-on-surface text-[14px]">Company</p>
            <Link href="#" className="text-on-surface-variant hover:text-primary text-[14px] transition-colors">About Us</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary text-[14px] transition-colors">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-on-surface text-[14px]">Legal</p>
            <Link href="#" className="text-on-surface-variant hover:text-primary text-[14px] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary text-[14px] transition-colors">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
            <p className="font-bold text-on-surface text-[14px]">Help</p>
            <Link href="#" className="text-on-surface-variant hover:text-primary text-[14px] transition-colors">Help Center</Link>
            <p className="text-on-surface-variant text-[12px] mt-2">© 2025 FixNG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
