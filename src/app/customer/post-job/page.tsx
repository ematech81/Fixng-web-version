'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import api, { publicApi } from '@/lib/api';
import { SKILLS, NIGERIAN_STATES, PROFESSION_ICONS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

// ── Config ────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'ARTISAN'  },
  { n: 2, label: 'DETAILS'  },
  { n: 3, label: 'URGENCY'  },
  { n: 4, label: 'LOCATION' },
  { n: 5, label: 'PHOTOS'   },
] as const;

const URGENCY_OPTS = [
  { value: 'immediate', label: 'Immediately', desc: 'I need help within 1–2 hours',     icon: 'flash_on'      },
  { value: 'today',     label: 'Today',        desc: 'Sometime today works',              icon: 'wb_sunny'      },
  { value: 'this_week', label: 'This Week',    desc: 'Within the next few days',          icon: 'date_range'    },
  { value: 'flexible',  label: 'Flexible',     desc: 'No rush — whenever available',      icon: 'all_inclusive' },
  { value: 'scheduled', label: 'Pick a Date',  desc: 'Schedule a specific date and time', icon: 'event'         },
];

const TITLE_HINTS: Record<string, string> = {
  Plumber:              'Fix plumbing issue at home',
  Electrician:          'Electrical fault / wiring repair',
  Carpenter:            'Carpentry work needed',
  Painter:              'Painting job',
  'AC Technician':      'AC service or repair',
  'AC Maintenance':     'AC routine maintenance',
  'Generator Repair':   'Generator repair / servicing',
  'Auto Mechanic':      'Car repair',
  'Phone/Laptop Repair':'Device repair',
  Welder:               'Welding work needed',
  Tiler:                'Tiling work needed',
  Mason:                'Masonry / block work',
  'Solar Installation': 'Solar panel installation',
  'Dispatch Rider':     'Dispatch / delivery needed',
};

const PAGE_SIZE = 6;
const FEATURED_SKILLS = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'AC Technician',
  'Generator Repair', 'Auto Mechanic', 'Dispatch Rider', 'Cleaner', 'Chef / Cook',
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookingArtisan {
  id: string;
  name: string;
  skills: string[];
  profilePhoto: string | null;
  isPro: boolean;
  badgeLevel: string;
  lga: string | null;
  state: string | null;
  distanceKm: number | null;
  stats?: { averageRating?: number; completedJobs?: number };
}

interface Form {
  skill:         string;
  title:         string;
  description:   string;
  urgency:       string;
  scheduledDate: string;
  address:       string;
  state:         string;
  lga:           string;
  photos:        File[];
  artisanId:     string;
}

// ── Artisan row inside the list ───────────────────────────────────────────────
function ArtisanRow({
  artisan,
  isSelected,
  onSelect,
}: {
  artisan: BookingArtisan;
  isSelected: boolean;
  onSelect: (a: BookingArtisan) => void;
}) {
  const rating = artisan.stats?.averageRating ?? 0;
  const jobs   = artisan.stats?.completedJobs  ?? 0;
  const loc    = artisan.distanceKm != null
    ? `${artisan.distanceKm} km away`
    : [artisan.lga, artisan.state].filter(Boolean).join(', ') || 'Nigeria';

  return (
    <button
      onClick={() => onSelect(artisan)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-outline-variant/20 last:border-0 ${
        isSelected ? 'bg-primary-container/15' : 'hover:bg-surface-container-low'
      }`}
    >
      {/* Avatar */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary-container flex-shrink-0">
        {artisan.profilePhoto ? (
          <Image src={artisan.profilePhoto} alt={artisan.name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[15px] font-black text-primary/50">{getInitials(artisan.name)}</span>
          </div>
        )}
        {artisan.isPro && (
          <span className="absolute bottom-0 right-0 text-[7px] font-black bg-secondary text-on-secondary px-1 rounded-tl-md">PRO</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[14px] font-semibold text-on-surface truncate leading-tight">{artisan.name}</span>
          {(artisan.badgeLevel === 'verified' || artisan.badgeLevel === 'trusted') && (
            <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>verified</span>
          )}
        </div>
        <p className="text-[12px] text-on-surface-variant truncate">{artisan.skills[0]}</p>
        <p className="text-[11px] text-outline flex items-center gap-0.5 mt-0.5">
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>location_on</span>
          {loc}
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {isSelected ? (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }}>add</span>
          </div>
        )}
        {rating > 0 && (
          <div className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[11px] font-semibold text-on-surface-variant">{rating.toFixed(1)}</span>
          </div>
        )}
        {jobs > 0 && <span className="text-[10px] text-outline">{jobs} job{jobs !== 1 ? 's' : ''}</span>}
      </div>
    </button>
  );
}

// ── Skill chip selector (no-artisan flow) ─────────────────────────────────────
function SkillChips({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? SKILLS : FEATURED_SKILLS;

  return (
    <div>
      <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
        What service do you need?
      </p>
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <button key={s} onClick={() => onSelect(s === selected ? '' : s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all ${
              selected === s
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px', ...(selected === s ? { fontVariationSettings: "'FILL' 1" } : {}) }}>
              {PROFESSION_ICONS[s] ?? PROFESSION_ICONS.default}
            </span>
            {s}
          </button>
        ))}
        <button onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-[13px] font-semibold transition-all hover:brightness-110 active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
            {showAll ? 'expand_less' : 'expand_more'}
          </span>
          {showAll ? 'Show less' : `More skills (${SKILLS.length - FEATURED_SKILLS.length})`}
        </button>
      </div>
    </div>
  );
}

// ── Dispatch Safety Modal ─────────────────────────────────────────────────────
function DispatchSafetyModal({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 bg-primary-container/20">
          <span className="text-5xl mb-1">🏍️</span>
        </div>

        <div className="px-6 pt-4">
          <h2 className="text-[19px] font-black text-on-surface text-center">Before You Book a Dispatch Rider</h2>
          <p className="text-[13px] text-on-surface-variant text-center mt-1 mb-4">Please read and acknowledge the following.</p>
        </div>

        {/* Scrollable content */}
        <div className="max-h-72 overflow-y-auto px-6 pb-2">
          {/* Pricing */}
          <div className="flex items-center gap-2 mb-2 mt-1">
            <span className="text-base">💰</span>
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Pricing Disclaimer</span>
          </div>
          {[
            'Delivery prices are negotiated directly between you and the rider — FixNG does not set or guarantee pricing.',
            'Always agree on a price BEFORE the rider picks up your item.',
            'FixNG is not responsible for pricing disputes between you and the rider.',
          ].map((t) => (
            <div key={t} className="flex gap-2 mb-2 ml-1">
              <span className="text-primary font-black mt-0.5 flex-shrink-0">•</span>
              <p className="text-[13px] text-on-surface-variant leading-snug">{t}</p>
            </div>
          ))}

          {/* Security */}
          <div className="flex items-center gap-2 mb-2 mt-4">
            <span className="text-base">🔒</span>
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Security Tips</span>
          </div>
          {[
            "Verify the rider's vehicle plate number on their profile before handing over any item.",
            'Only send items you are comfortable entrusting to a third party.',
            'For valuable or fragile items, ensure the rider provides packaging.',
            'Take a photo of your item before handover as proof of condition.',
            "Share the rider's name and plate number with someone you trust.",
          ].map((t) => (
            <div key={t} className="flex gap-2 mb-2 ml-1">
              <span className="text-primary font-black mt-0.5 flex-shrink-0">•</span>
              <p className="text-[13px] text-on-surface-variant leading-snug">{t}</p>
            </div>
          ))}

          {/* Delivery */}
          <div className="flex items-center gap-2 mb-2 mt-4">
            <span className="text-base">📦</span>
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Delivery Tips</span>
          </div>
          {[
            'Provide a clear delivery address with a landmark to avoid confusion.',
            'Stay reachable on your phone throughout the delivery.',
            'Confirm receipt with the recipient before closing the job.',
            'Use the in-app chat to communicate with the rider during delivery.',
          ].map((t) => (
            <div key={t} className="flex gap-2 mb-2 ml-1">
              <span className="text-primary font-black mt-0.5 flex-shrink-0">•</span>
              <p className="text-[13px] text-on-surface-variant leading-snug">{t}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-outline-variant/30 mt-2">
          <button onClick={onBack}
            className="flex-1 py-3 rounded-2xl border border-outline-variant text-on-surface-variant font-semibold text-[14px] hover:bg-surface-container transition-all">
            Go Back
          </button>
          <button onClick={onConfirm}
            className="flex-[2] py-3 rounded-2xl bg-primary text-on-primary font-black text-[14px] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            I Understand →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────
function PostJobInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected artisan
  const [bookingArtisan, setBookingArtisan] = useState<BookingArtisan | null>(null);

  // Dispatch safety modal
  const [dispatchModal,        setDispatchModal]        = useState(false);
  const [pendingDispatchAction, setPendingDispatchAction] = useState<(() => void) | null>(null);

  // Artisan list
  const [artisanList,  setArtisanList]  = useState<BookingArtisan[]>([]);
  const [listPage,     setListPage]     = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [listLoading,  setListLoading]  = useState(false);
  const [listCategory, setListCategory] = useState('');

  // Voice
  const [recording, setRecording]   = useState(false);
  const [audioUrl,  setAudioUrl]    = useState<string | null>(null);
  const [recSecs,   setRecSecs]     = useState(0);
  const mrRef    = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Geolocation
  const [locLoading, setLocLoading] = useState(false);
  const [coords,     setCoords]     = useState<{ lat: number; lng: number } | null>(null);

  // Photos
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState<Form>({
    skill:         '',
    title:         '',
    description:   '',
    urgency:       '',
    scheduledDate: '',
    address:       '',
    state:         '',
    lga:           '',
    photos:        [],
    artisanId:     searchParams.get('artisanId') ?? '',
  });

  const set = useCallback(<K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const effectiveSkill = bookingArtisan?.skills?.[0] || form.skill;

  // ── Fetch artisan list ────────────────────────────────────────────────────
  const fetchArtisanList = useCallback(async (category: string, page: number, replace: boolean) => {
    setListLoading(true);
    try {
      const params: Record<string, string> = { limit: String(PAGE_SIZE), page: String(page) };
      if (category) params.category = category;
      const res = await publicApi.get('/api/artisans', { params });
      const data = (res.data.data ?? []) as BookingArtisan[];
      setArtisanList((prev) => replace ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch { /* silent */ } finally {
      setListLoading(false);
    }
  }, []);

  // ── Load artisan from sessionStorage on mount ────────────────────────────
  useEffect(() => {
    const artisanId = searchParams.get('artisanId');
    let category = '';
    if (artisanId) {
      try {
        const stored = sessionStorage.getItem('booking_artisan');
        if (stored) {
          const data: BookingArtisan = JSON.parse(stored);
          if (data.id === artisanId) {
            setBookingArtisan(data);
            category = data.skills?.[0] ?? '';
            if (category) {
              setForm((f) => ({
                ...f,
                skill:     category,
                artisanId: artisanId,
                title:     f.title || TITLE_HINTS[category] || `${category} service needed`,
              }));
            }
          }
        }
      } catch { /* private browsing */ }
    }
    setListCategory(category);
    fetchArtisanList(category, 1, true);

    // Show dispatch warning if the pre-selected artisan is a dispatch rider
    if (category && (category === 'Dispatch Rider' || category === 'Logistics / Courier Service')) {
      setDispatchModal(true);
      // No pending action — artisan is already loaded; modal is informational only
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDispatch = (skill: string) => skill === 'Dispatch Rider' || skill === 'Logistics / Courier Service';

  // ── Skill chip picked ─────────────────────────────────────────────────────
  const applySkillChip = (skill: string) => {
    set('skill', skill);
    if (skill && !form.title) set('title', TITLE_HINTS[skill] ?? `${skill} service needed`);
    setListCategory(skill);
    setListPage(1);
    fetchArtisanList(skill, 1, true);
  };

  const handleSkillChip = (skill: string) => {
    if (skill && isDispatch(skill)) {
      setPendingDispatchAction(() => () => applySkillChip(skill));
      setDispatchModal(true);
    } else {
      applySkillChip(skill);
    }
  };

  // ── Select artisan from list (replaces top card) ─────────────────────────
  const applySelectArtisan = (a: BookingArtisan) => {
    const skill = a.skills?.[0] ?? '';
    setBookingArtisan(a);
    setForm((f) => ({
      ...f,
      artisanId: a.id,
      skill,
      title: f.title || (skill ? TITLE_HINTS[skill] ?? `${skill} service needed` : f.title),
    }));
    if (skill && skill !== listCategory) {
      setListCategory(skill);
      setListPage(1);
      fetchArtisanList(skill, 1, true);
    }
  };

  const selectArtisan = (a: BookingArtisan) => {
    const skill = a.skills?.[0] ?? '';
    if (isDispatch(skill) && bookingArtisan?.id !== a.id) {
      setPendingDispatchAction(() => () => applySelectArtisan(a));
      setDispatchModal(true);
    } else {
      applySelectArtisan(a);
    }
  };

  const clearArtisan = () => {
    setBookingArtisan(null);
    set('artisanId', '');
    setListCategory('');
    setListPage(1);
    fetchArtisanList('', 1, true);
  };

  const loadMore = () => {
    const next = listPage + 1;
    setListPage(next);
    fetchArtisanList(listCategory, next, false);
  };

  // ── Step validation ──────────────────────────────────────────────────────
  const canProceed = () => {
    switch (step) {
      case 1: return !!(bookingArtisan || effectiveSkill);
      case 2: return !!(form.title.trim() && (form.description.trim() || audioUrl));
      case 3: return !!form.urgency && (form.urgency !== 'scheduled' || !!form.scheduledDate);
      case 4: return !!(form.address.trim() && form.state);
      case 5: return true;
      default: return false;
    }
  };

  // ── Voice recording ──────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' })));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
    } catch { alert('Microphone access was denied.'); }
  };
  const stopRecording = () => {
    mrRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const clearRecording = () => { setAudioUrl(null); setRecSecs(0); };

  // ── Geolocation + reverse geocode ───────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await r.json();
          const addr = data.address ?? {};
          const streetParts = [addr.road, addr.suburb, addr.neighbourhood, addr.village, addr.town, addr.city].filter(Boolean);
          set('address', streetParts.slice(0, 2).join(', ') || 'Current location');
          const rawState = (addr.state ?? '').replace(/\s*state$/i, '').trim();
          const matched  = NIGERIAN_STATES.find((s) => s.toLowerCase() === rawState.toLowerCase() || rawState.toLowerCase().includes(s.toLowerCase()));
          if (matched) set('state', matched);
          const lga = addr.county ?? addr.city_district ?? addr.town ?? '';
          if (lga) set('lga', lga);
        } catch { set('address', 'Current location (tap to edit)'); }
        setLocLoading(false);
      },
      () => { alert('Could not get your location. Please enter manually.'); setLocLoading(false); },
      { timeout: 8000 }
    );
  };

  // ── Photos ───────────────────────────────────────────────────────────────
  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4);
    set('photos', files as unknown as File[]);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };
  const removePhoto = (i: number) => {
    set('photos', form.photos.filter((_, j) => j !== i) as unknown as File[]);
    setPhotoPreviews(photoPreviews.filter((_, j) => j !== i));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, unknown> = {
        title:       form.title,
        description: form.description.trim() || (audioUrl ? '[Voice description attached]' : ''),
        category:    effectiveSkill,
        urgency:     form.urgency,
        address:     form.address,
        state:       form.state,
        ...(form.lga && { lga: form.lga }),
        ...(coords   && { latitude: coords.lat, longitude: coords.lng }),
      };
      if (form.urgency === 'scheduled' && form.scheduledDate) body.scheduledDate = form.scheduledDate;
      if (form.artisanId) body.artisanId = form.artisanId;

      const res   = await api.post('/api/jobs', body);
      const jobId = res.data.data?._id ?? res.data.data?.id ?? res.data._id ?? res.data.id;
      try { sessionStorage.removeItem('booking_artisan'); } catch { /* */ }
      router.push(jobId ? `/customer/jobs/${jobId}` : '/customer/jobs');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Failed to post job. Please check your details and try again.');
    } finally { setSubmitting(false); }
  };

  // ── Stepper ──────────────────────────────────────────────────────────────
  const Stepper = () => (
    <div className="flex items-start justify-center gap-0 mb-10 overflow-x-auto pb-2">
      {STEPS.map(({ n, label }, i) => (
        <div key={n} className="flex items-start">
          <div className="flex flex-col items-center min-w-[52px]">
            <button onClick={() => n < step && setStep(n)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
                n < step ? 'bg-primary text-on-primary cursor-pointer hover:brightness-110'
                : n === step ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                : 'bg-surface-container-high text-on-surface-variant'}`}
            >
              {n < step ? <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span> : n}
            </button>
            <span className={`text-[9px] font-bold mt-1 tracking-widest ${n === step ? 'text-primary' : 'text-on-surface-variant'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 md:w-14 h-0.5 mt-[18px] flex-shrink-0 transition-colors ${n < step ? 'bg-primary' : 'bg-outline-variant'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ── List section heading ─────────────────────────────────────────────────
  const listHeading = bookingArtisan
    ? listCategory
      ? `Other ${listCategory}s near you`
      : 'Other artisans'
    : listCategory
      ? `${listCategory}s available`
      : 'Browse artisans';

  const handleDispatchConfirm = () => {
    setDispatchModal(false);
    pendingDispatchAction?.();
    setPendingDispatchAction(null);
  };

  const handleDispatchBack = () => {
    setDispatchModal(false);
    setPendingDispatchAction(null);
  };

  return (
    <>
      {dispatchModal && (
        <DispatchSafetyModal onConfirm={handleDispatchConfirm} onBack={handleDispatchBack} />
      )}
    <div className="py-8 px-4 md:px-8 min-h-full">
      <Stepper />

      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-outline-variant/20"
        style={{ boxShadow: '0px 4px 24px rgba(0,0,0,0.06)' }}
      >

        {/* ── Step 1: Artisan selection ───────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-1">
              {bookingArtisan ? 'Confirm your artisan' : 'Who do you need?'}
            </h2>
            <p className="text-[14px] text-on-surface-variant mb-6">
              {bookingArtisan
                ? `You're booking ${bookingArtisan.name}. Tap any artisan below to switch.`
                : 'Filter by service or tap an artisan to select them.'}
            </p>

            {/* ── Selected artisan card ─────────────────────────────── */}
            {bookingArtisan ? (
              <div className="mb-5 bg-primary-container/10 border-2 border-primary/25 rounded-2xl p-4 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-container flex-shrink-0 border-2 border-white shadow-sm">
                  {bookingArtisan.profilePhoto ? (
                    <Image src={bookingArtisan.profilePhoto} alt={bookingArtisan.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[17px] font-black text-primary/50">{getInitials(bookingArtisan.name)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[15px] font-bold text-on-surface truncate">{bookingArtisan.name}</span>
                    {(bookingArtisan.badgeLevel === 'verified' || bookingArtisan.badgeLevel === 'trusted') && (
                      <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                    )}
                    {bookingArtisan.isPro && (
                      <span className="text-[9px] font-black bg-secondary text-on-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">PRO</span>
                    )}
                  </div>
                  <p className="text-[12px] text-on-surface-variant">{bookingArtisan.skills.join(' · ')}</p>
                  {(bookingArtisan.lga || bookingArtisan.state || bookingArtisan.distanceKm != null) && (
                    <p className="text-[11px] text-outline flex items-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
                      {bookingArtisan.distanceKm != null && `${bookingArtisan.distanceKm} km away · `}
                      {[bookingArtisan.lga, bookingArtisan.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <button onClick={clearArtisan}
                  className="flex-shrink-0 flex items-center gap-0.5 text-[11px] text-outline hover:text-error transition-colors px-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  Clear
                </button>
              </div>
            ) : (
              /* No artisan — show skill filter chips */
              <div className="mb-5">
                <SkillChips selected={form.skill} onSelect={handleSkillChip} />
              </div>
            )}

            {/* ── Artisan list ─────────────────────────────────────── */}
            <div className="border border-outline-variant/30 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-on-surface">{listHeading}</p>
                  <p className="text-[11px] text-outline mt-0.5">Tap to select — replaces current selection</p>
                </div>
                {listCategory && !bookingArtisan && (
                  <button onClick={() => handleSkillChip('')}
                    className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                    Show all
                  </button>
                )}
              </div>

              {/* List body */}
              {listLoading && artisanList.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : artisanList.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-6">
                  <span className="material-symbols-outlined text-[40px] text-outline-variant mb-2">person_search</span>
                  <p className="text-[14px] font-semibold text-on-surface-variant">No artisans found</p>
                  {listCategory && (
                    <button onClick={() => handleSkillChip('')}
                      className="mt-2 text-[13px] text-primary hover:underline">
                      Browse all artisans
                    </button>
                  )}
                </div>
              ) : (
                artisanList.map((a) => (
                  <ArtisanRow
                    key={a.id}
                    artisan={a}
                    isSelected={bookingArtisan?.id === a.id}
                    onSelect={selectArtisan}
                  />
                ))
              )}

              {/* Load more */}
              {(hasMore || (listLoading && artisanList.length > 0)) && (
                <div className="px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low">
                  <button onClick={loadMore} disabled={listLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all disabled:opacity-50">
                    {listLoading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
                    )}
                    {listLoading ? 'Loading…' : 'Load more artisans'}
                  </button>
                </div>
              )}
            </div>

            {!bookingArtisan && !effectiveSkill && (
              <p className="mt-3 text-[12px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                Select a service above or tap an artisan to continue.
              </p>
            )}
          </>
        )}

        {/* ── Step 2: Details + Voice ────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Describe the job</h2>
            <p className="text-on-surface-variant mb-6">
              Give details so we can match you with the right professional for <strong>{effectiveSkill}</strong>.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">Job Title</label>
                <input type="text" value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder={`e.g. ${TITLE_HINTS[effectiveSkill] ?? `${effectiveSkill} needed`}`}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">
                  Description
                  {audioUrl && <span className="ml-2 text-[12px] text-outline font-normal">(optional if you recorded a voice note)</span>}
                </label>
                <textarea value={form.description}
                  onChange={(e) => e.target.value.length <= 500 && set('description', e.target.value)}
                  placeholder="What's the issue? Any measurements or relevant details? The more specific, the better."
                  rows={5}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-outline">Be specific — it helps artisans prepare</span>
                  <span className={`text-[11px] font-mono ${form.description.length > 450 ? 'text-error' : 'text-outline'}`}>{form.description.length}/500</span>
                </div>
              </div>

              {/* Voice note */}
              <div className="border border-outline-variant/50 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>mic</span>
                    <span className="text-[14px] font-semibold text-on-surface">Voice Note</span>
                    <span className="text-[11px] text-outline bg-surface-container px-2 py-0.5 rounded-full">Optional</span>
                  </div>
                  {audioUrl && (
                    <button onClick={clearRecording} className="text-[12px] text-primary font-medium flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
                      Re-record
                    </button>
                  )}
                </div>
                <div className="p-4">
                  {!audioUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button onClick={recording ? stopRecording : startRecording}
                        className={`relative flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 sm:py-3 rounded-2xl font-bold text-[15px] transition-all select-none flex-shrink-0 ${
                          recording ? 'bg-error text-white shadow-lg shadow-error/30'
                          : 'bg-primary-container/30 text-primary hover:bg-primary-container/50 border-2 border-primary/20'
                        }`} style={{ minWidth: '160px' }}>
                        {recording && <span className="absolute inset-0 rounded-2xl border-2 border-error animate-ping opacity-20" />}
                        <span className="material-symbols-outlined text-[22px]"
                          style={{ fontVariationSettings: recording ? "'FILL' 1" : "'FILL' 0" }}>
                          {recording ? 'stop_circle' : 'mic'}
                        </span>
                        {recording ? 'Stop Recording' : 'Record Voice Note'}
                      </button>
                      {recording ? (
                        <div className="flex items-center gap-2 text-error">
                          <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                          <span className="text-[20px] font-mono font-black tracking-widest">
                            {String(Math.floor(recSecs / 60)).padStart(2, '0')}:{String(recSecs % 60).padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[13px] text-on-surface-variant">Tap to record. Easier than typing on mobile.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-primary flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                        <span className="text-[13px] font-semibold">{recSecs}s recorded</span>
                      </div>
                      <audio src={audioUrl} controls className="w-full rounded-xl h-10" style={{ minWidth: 0 }} />
                    </div>
                  )}
                </div>
              </div>

              {!form.description.trim() && !audioUrl && (
                <p className="text-[12px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                  Provide a text description or a voice note — at least one is required.
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Urgency ────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">How urgent is this?</h2>
            <p className="text-on-surface-variant mb-6">This helps us prioritise and match you with available professionals.</p>
            <div className="space-y-3">
              {URGENCY_OPTS.map(({ value, label, desc, icon }) => (
                <button key={value} onClick={() => set('urgency', value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    form.urgency === value ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${form.urgency === value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined" style={form.urgency === value ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-[15px] font-bold leading-tight ${form.urgency === value ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
                    <p className="text-[13px] text-on-surface-variant">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.urgency === value ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                    {form.urgency === value && <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </div>
                </button>
              ))}
            </div>
            {form.urgency === 'scheduled' && (
              <div className="mt-5 p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                <label className="block text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>calendar_month</span>
                  Pick your preferred date &amp; time
                </label>
                <input type="datetime-local" value={form.scheduledDate}
                  onChange={(e) => set('scheduledDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            )}
          </>
        )}

        {/* ── Step 4: Location ───────────────────────────────────────── */}
        {step === 4 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Where is the job?</h2>
            <p className="text-on-surface-variant mb-6">We use your location to find professionals nearby.</p>
            <div className="space-y-4">
              <button type="button" onClick={useMyLocation} disabled={locLoading}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-container/10 hover:bg-primary-container/20 transition-all text-primary"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                  {locLoading ? 'pending' : coords ? 'my_location' : 'location_searching'}
                </span>
                <div className="text-left">
                  <p className="text-[14px] font-bold">{locLoading ? 'Locating…' : coords ? 'Location captured ✓' : 'Use my current location'}</p>
                  <p className="text-[12px] opacity-70">Tap to auto-fill your address</p>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[12px] text-outline font-medium">OR enter manually</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">Street Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>location_on</span>
                  <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
                    placeholder="e.g. 15 Adeola Odeku Street, Victoria Island"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-on-surface mb-2">State <span className="text-error">*</span></label>
                  <select value={form.state} onChange={(e) => set('state', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-on-surface mb-2">LGA / Area</label>
                  <input type="text" value={form.lga} onChange={(e) => set('lga', e.target.value)}
                    placeholder="e.g. Victoria Island"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 5: Photos + review ────────────────────────────────── */}
        {step === 5 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Add photos</h2>
            <p className="text-on-surface-variant mb-6">Photos help artisans prepare. Add up to 4. <span className="text-outline">(Optional)</span></p>
            <label htmlFor="photos"
              className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-outline-variant rounded-2xl cursor-pointer hover:border-primary hover:bg-primary-container/10 transition-all mb-3">
              <span className="material-symbols-outlined text-[40px] text-outline-variant mb-1">add_photo_alternate</span>
              <span className="text-[14px] font-semibold text-on-surface-variant">Tap to add photos</span>
              <span className="text-[12px] text-outline mt-0.5">JPG or PNG · max 4 photos</span>
              <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoPick} />
            </label>
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-on-surface/70 text-white rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Review summary */}
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
              <h3 className="text-[15px] font-bold text-on-surface border-b border-outline-variant pb-3 mb-3">Review your job</h3>
              {bookingArtisan && (
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>person</span>
                  <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Artisan</p>
                    <p className="text-[14px] text-on-surface">{bookingArtisan.name}</p>
                  </div>
                </div>
              )}
              {([
                { icon: 'build',       label: 'Skill',    value: effectiveSkill },
                { icon: 'article',     label: 'Title',    value: form.title },
                { icon: 'notes',       label: 'Details',  value: form.description.slice(0, 120) + (form.description.length > 120 ? '…' : '') || (audioUrl ? '[Voice note attached]' : '—') },
                { icon: 'flash_on',    label: 'Urgency',  value: URGENCY_OPTS.find((u) => u.value === form.urgency)?.label ?? form.urgency },
                { icon: 'location_on', label: 'Location', value: [form.address, form.lga, form.state].filter(Boolean).join(', ') },
              ] as const).map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px' }}>{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
                    <p className="text-[14px] text-on-surface leading-snug break-words">{value || '—'}</p>
                  </div>
                </div>
              ))}
              {audioUrl && (
                <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>mic</span>
                  <p className="text-[14px] text-on-surface">Voice note attached ({recSecs}s)</p>
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-4 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-[14px] flex items-start gap-2">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>error</span>
                {submitError}
              </div>
            )}
          </>
        )}

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <div className={`flex items-center mt-8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all text-[15px] font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              Back
            </button>
          )}

          {step < 5 ? (
            <button onClick={() => canProceed() && setStep((s) => s + 1)} disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[15px] font-bold transition-all ${
                canProceed()
                  ? 'bg-primary text-on-primary hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20'
                  : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
              }`}
            >
              Next Step
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-on-primary text-[15px] font-bold hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
            >
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Posting your job…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>send</span>Post Job</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PostJobInner />
    </Suspense>
  );
}
