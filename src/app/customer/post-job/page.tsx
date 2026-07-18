'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SKILLS, NIGERIAN_STATES, PROFESSION_ICONS } from '@/lib/constants';

// ── Config ────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'SKILL'    },
  { n: 2, label: 'DETAILS'  },
  { n: 3, label: 'VOICE'    },
  { n: 4, label: 'URGENCY'  },
  { n: 5, label: 'LOCATION' },
  { n: 6, label: 'PHOTOS'   },
] as const;

const FEATURED = [
  { skill: 'Plumber',      label: 'Plumbing'   },
  { skill: 'Electrician',  label: 'Electrical' },
  { skill: 'Carpenter',    label: 'Carpentry'  },
  { skill: 'Painter',      label: 'Painting'   },
  { skill: 'AC Technician',label: 'AC Repair'  },
];

const URGENCY_OPTS = [
  { value: 'immediate',  label: 'Immediately',  desc: 'I need help within 1–2 hours',     icon: 'flash_on'      },
  { value: 'today',      label: 'Today',         desc: 'Sometime today works',              icon: 'wb_sunny'      },
  { value: 'this_week',  label: 'This Week',     desc: 'Within the next few days',          icon: 'date_range'    },
  { value: 'flexible',   label: 'Flexible',      desc: 'No rush — whenever available',      icon: 'all_inclusive' },
  { value: 'scheduled',  label: 'Pick a Date',   desc: 'Schedule a specific date and time', icon: 'event'         },
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Form {
  skill:         string;
  customSkill:   string;
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

// ── Inner page (uses useSearchParams) ────────────────────────────────────────
function PostJobInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useAuth(); // ensures auth guard ran in layout

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Voice recording
  const [recording, setRecording]       = useState(false);
  const [audioUrl,  setAudioUrl]        = useState<string | null>(null);
  const [recSecs,   setRecSecs]         = useState(0);
  const mrRef    = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Geolocation
  const [locLoading, setLocLoading]   = useState(false);
  const [coords,     setCoords]       = useState<{ lat: number; lng: number } | null>(null);

  // Photo previews (object URLs)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState<Form>({
    skill:         '',
    customSkill:   '',
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

  const effectiveSkill = form.skill === 'Other' ? form.customSkill : form.skill;

  // ── Step validation ─────────────────────────────────────────────────────
  const canProceed = () => {
    switch (step) {
      case 1: return !!effectiveSkill;
      case 2: return !!(form.title.trim() && form.description.trim());
      case 3: return true;  // optional
      case 4: return !!form.urgency && (form.urgency !== 'scheduled' || !!form.scheduledDate);
      case 5: return !!(form.address.trim() && form.state);
      case 6: return true;
      default: return false;
    }
  };

  // ── Voice recording ─────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
    } catch {
      alert('Microphone access was denied. You can skip this step.');
    }
  };

  const stopRecording = () => {
    mrRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setRecSecs(0);
  };

  // ── Geolocation ─────────────────────────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        set('address', 'Current location (coordinates captured)');
        setLocLoading(false);
      },
      () => {
        alert('Could not get your location. Please enter your address manually.');
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // ── Photo handler ───────────────────────────────────────────────────────
  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4);
    set('photos', files as unknown as File[]);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (i: number) => {
    const updated = form.photos.filter((_, j) => j !== i);
    set('photos', updated as unknown as File[]);
    setPhotoPreviews(photoPreviews.filter((_, j) => j !== i));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, unknown> = {
        title:       form.title,
        description: form.description,
        skill:       effectiveSkill,
        urgency:     form.urgency,
        location: {
          address: form.address,
          state:   form.state,
          ...(form.lga    && { lga:       form.lga   }),
          ...(coords      && { latitude:  coords.lat }),
          ...(coords      && { longitude: coords.lng }),
        },
      };
      if (form.urgency === 'scheduled' && form.scheduledDate) body.scheduledDate = form.scheduledDate;
      if (form.artisanId) body.artisanId = form.artisanId;

      const res   = await api.post('/api/jobs', body);
      const jobId = res.data.data?._id ?? res.data.data?.id ?? res.data._id ?? res.data.id;
      router.push(jobId ? `/customer/jobs/${jobId}` : '/customer/jobs');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Failed to post job. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stepper ─────────────────────────────────────────────────────────────
  const Stepper = () => (
    <div className="flex items-start justify-center gap-0 mb-10 overflow-x-auto pb-2">
      {STEPS.map(({ n, label }, i) => (
        <div key={n} className="flex items-start">
          <div className="flex flex-col items-center min-w-[52px]">
            <button
              onClick={() => n < step && setStep(n)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
                n < step
                  ? 'bg-primary text-on-primary cursor-pointer hover:brightness-110'
                  : n === step
                  ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {n < step
                ? <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
                : n
              }
            </button>
            <span className={`text-[9px] font-bold mt-1 tracking-widest ${n === step ? 'text-primary' : 'text-on-surface-variant'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 md:w-14 h-0.5 mt-[18px] flex-shrink-0 transition-colors ${n < step ? 'bg-primary' : 'bg-outline-variant'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-8 px-4 md:px-8 min-h-full">
      <Stepper />

      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-outline-variant/20"
        style={{ boxShadow: '0px 4px 24px rgba(0,0,0,0.06)' }}
      >

        {/* ── Step 1: Skill ──────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">What help do you need?</h2>
            <p className="text-on-surface-variant mb-6">Select the trade or skill required for your job.</p>

            {/* Featured grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {FEATURED.map(({ skill, label }) => (
                <button
                  key={skill}
                  onClick={() => {
                    set('skill', skill);
                    set('customSkill', '');
                    if (!form.title) set('title', TITLE_HINTS[skill] ?? `${skill} service needed`);
                  }}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group ${
                    form.skill === skill
                      ? 'border-primary bg-primary-container/20 text-primary'
                      : 'border-outline-variant hover:border-primary/40 text-on-surface-variant'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={form.skill === skill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {PROFESSION_ICONS[skill] ?? PROFESSION_ICONS.default}
                  </span>
                  <span className={`text-[14px] font-semibold ${form.skill === skill ? 'text-primary' : 'group-hover:text-primary'}`}>
                    {label}
                  </span>
                </button>
              ))}

              {/* Other */}
              <button
                onClick={() => set('skill', 'Other')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                  form.skill === 'Other'
                    ? 'border-primary bg-primary-container/20 text-primary'
                    : 'border-outline-variant hover:border-primary/40 text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[32px]">more_horiz</span>
                <span className="text-[14px] font-semibold">Other</span>
              </button>
            </div>

            {/* Expanded "Other" skill list */}
            {form.skill === 'Other' && (
              <div className="mt-4 border border-outline-variant rounded-2xl p-4">
                <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">All Skills</p>
                <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {SKILLS.filter((s) => !FEATURED.some((f) => f.skill === s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        set('customSkill', s);
                        if (!form.title) set('title', TITLE_HINTS[s] ?? `${s} service needed`);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[13px] transition-all ${
                        form.customSkill === s
                          ? 'border-primary bg-primary-container/20 text-primary font-semibold'
                          : 'border-outline-variant/50 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '15px' }}>
                        {PROFESSION_ICONS[s] ?? PROFESSION_ICONS.default}
                      </span>
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Step 2: Details ────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Describe the job</h2>
            <p className="text-on-surface-variant mb-6">
              Give details so we can match you with the right professional for <strong>{effectiveSkill}</strong>.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">Job Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder={`e.g. ${TITLE_HINTS[effectiveSkill] ?? `${effectiveSkill} needed`}`}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">Describe the problem</label>
                <textarea
                  value={form.description}
                  onChange={(e) => e.target.value.length <= 500 && set('description', e.target.value)}
                  placeholder="What's the issue? How long has it been there? Any measurements or relevant details? The more specific you are, the better matched you'll be."
                  rows={6}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-outline">Be specific — it helps artisans prepare</span>
                  <span className={`text-[11px] font-mono ${form.description.length > 450 ? 'text-error' : 'text-outline'}`}>
                    {form.description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Voice note ─────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[28px] font-black text-on-surface">Add a voice note</h2>
              <span className="text-[12px] text-outline bg-surface-container-low px-3 py-1 rounded-full font-medium">Optional</span>
            </div>
            <p className="text-on-surface-variant mb-8">
              Sometimes it&apos;s easier to explain out loud. Record a short clip to help the artisan understand the job faster.
            </p>

            <div className="flex flex-col items-center py-4">
              {!audioUrl ? (
                <>
                  {/* Record button */}
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 font-bold text-[15px] transition-all select-none ${
                      recording
                        ? 'bg-error text-white shadow-2xl shadow-error/40 scale-105'
                        : 'bg-primary text-on-primary hover:brightness-110 shadow-2xl shadow-primary/30'
                    }`}
                  >
                    {recording && (
                      <span className="absolute w-36 h-36 rounded-full border-4 border-error animate-ping opacity-30" />
                    )}
                    <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {recording ? 'stop_circle' : 'mic'}
                    </span>
                    <span>{recording ? 'Stop' : 'Record'}</span>
                  </button>

                  {recording ? (
                    <div className="mt-6 flex items-center gap-3 text-error">
                      <div className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                      <span className="text-[18px] font-mono font-black tracking-widest">
                        {String(Math.floor(recSecs / 60)).padStart(2, '0')}:{String(recSecs % 60).padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-on-surface-variant mt-6 text-center max-w-xs leading-relaxed">
                      Tap to start recording. Keep it under 2 minutes.<br/>
                      Your mic will be used only for this note.
                    </p>
                  )}
                </>
              ) : (
                /* Recorded preview */
                <div className="w-full max-w-sm space-y-4">
                  <div className="bg-primary-container/20 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
                        graphic_eq
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-on-surface">Voice note recorded</p>
                      <p className="text-[13px] text-on-surface-variant">{recSecs} second{recSecs !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <audio src={audioUrl} controls className="w-full rounded-xl" />
                  <button
                    onClick={clearRecording}
                    className="text-[13px] text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                    Record again
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Step 4: Urgency ────────────────────────────────────────── */}
        {step === 4 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">How urgent is this?</h2>
            <p className="text-on-surface-variant mb-6">This helps us prioritise and match you with available professionals.</p>

            <div className="space-y-3">
              {URGENCY_OPTS.map(({ value, label, desc, icon }) => (
                <button
                  key={value}
                  onClick={() => set('urgency', value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    form.urgency === value
                      ? 'border-primary bg-primary-container/10'
                      : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    form.urgency === value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined" style={form.urgency === value ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-[15px] font-bold leading-tight ${form.urgency === value ? 'text-primary' : 'text-on-surface'}`}>
                      {label}
                    </p>
                    <p className="text-[13px] text-on-surface-variant">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    form.urgency === value ? 'border-primary bg-primary' : 'border-outline-variant'
                  }`}>
                    {form.urgency === value && (
                      <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Date picker for "scheduled" */}
            {form.urgency === 'scheduled' && (
              <div className="mt-5 p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                <label className="block text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>calendar_month</span>
                  Pick your preferred date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(e) => set('scheduledDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            )}
          </>
        )}

        {/* ── Step 5: Location ───────────────────────────────────────── */}
        {step === 5 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Where is the job?</h2>
            <p className="text-on-surface-variant mb-6">We use your location to find professionals nearby.</p>

            <div className="space-y-4">
              {/* Use my location */}
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locLoading}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-container/10 hover:bg-primary-container/20 transition-all text-primary"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                  {locLoading ? 'pending' : coords ? 'my_location' : 'location_searching'}
                </span>
                <div className="text-left">
                  <p className="text-[14px] font-bold">
                    {locLoading ? 'Locating…' : coords ? 'Location captured ✓' : 'Use my current location'}
                  </p>
                  <p className="text-[12px] opacity-70">Tap to auto-fill your address</p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[12px] text-outline font-medium">OR enter manually</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              {/* Address */}
              <div>
                <label className="block text-[14px] font-semibold text-on-surface mb-2">Street Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>location_on</span>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="e.g. 15 Adeola Odeku Street, Victoria Island"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* State + LGA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-on-surface mb-2">State <span className="text-error">*</span></label>
                  <select
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-on-surface mb-2">LGA / Area</label>
                  <input
                    type="text"
                    value={form.lga}
                    onChange={(e) => set('lga', e.target.value)}
                    placeholder="e.g. Victoria Island"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[15px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 6: Photos + review ────────────────────────────────── */}
        {step === 6 && (
          <>
            <h2 className="text-[28px] font-black text-on-surface mb-2">Add photos</h2>
            <p className="text-on-surface-variant mb-6">
              Photos help artisans prepare for the job. Add up to 4.{' '}
              <span className="text-outline">(Optional)</span>
            </p>

            {/* Photo picker */}
            <label
              htmlFor="photos"
              className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-outline-variant rounded-2xl cursor-pointer hover:border-primary hover:bg-primary-container/10 transition-all mb-3"
            >
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
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-on-surface/70 text-white rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Job review summary */}
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
              <h3 className="text-[15px] font-bold text-on-surface border-b border-outline-variant pb-3 mb-3">Review your job</h3>
              {([
                { icon: 'build',       label: 'Skill',     value: effectiveSkill },
                { icon: 'article',     label: 'Title',     value: form.title },
                { icon: 'notes',       label: 'Details',   value: form.description.slice(0, 120) + (form.description.length > 120 ? '…' : '') },
                { icon: 'flash_on',    label: 'Urgency',   value: URGENCY_OPTS.find((u) => u.value === form.urgency)?.label ?? form.urgency },
                { icon: 'location_on', label: 'Location',  value: [form.address, form.lga, form.state].filter(Boolean).join(', ') },
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

        {/* ── Navigation buttons ──────────────────────────────────────── */}
        <div className={`flex items-center mt-8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all text-[15px] font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              Back
            </button>
          )}

          <div className="flex flex-col items-end gap-2">
            {step < 6 ? (
              <button
                onClick={() => canProceed() && setStep((s) => s + 1)}
                disabled={!canProceed()}
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
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-on-primary text-[15px] font-bold hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting your job…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>send</span>
                    Post Job
                  </>
                )}
              </button>
            )}
            {/* Skip for voice step */}
            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="text-[12px] text-outline hover:text-primary transition-colors"
              >
                Skip this step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function PostJobPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PostJobInner />
    </Suspense>
  );
}
