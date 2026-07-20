'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { NIGERIAN_STATES } from '@/lib/constants';

// ─── Skill categories (matching SKILLS constant in constants.ts) ───────────────
const SKILL_GROUPS = [
  {
    label: 'Trades & Home Services',
    icon: 'handyman',
    skills: ['Plumber','Electrician','Carpenter','Painter','Tiler','Bricklayer','Welder','AC Technician','Generator Repair','Auto Mechanic','Phone / Laptop Repair','POP / Ceiling Work','Fumigation','Solar Installation','CCTV / Security Systems','Roofing Specialist','Landscaper / Gardener','Pool Maintenance','Locksmith','Glass & Aluminium Work'],
  },
  {
    label: 'Beauty & Personal Care',
    icon: 'face_retouching_natural',
    skills: ['Tailor','Barber','Hairdresser','Makeup Artist','Nail Technician','Spa Therapist / Masseur'],
  },
  {
    label: 'Home & Lifestyle',
    icon: 'home',
    skills: ['Chef / Cook','Caterer / Event Caterer','Cleaner','Laundry','Interior Decorator','Moving / Relocation Service'],
  },
  {
    label: 'Transport & Logistics',
    icon: 'local_shipping',
    skills: ['Security Guard','Driver','Dispatch Rider','Logistics / Courier Service'],
  },
  {
    label: 'Media, Design & Events',
    icon: 'camera_alt',
    skills: ['Photographer','Videographer','Graphic Designer','Animator / Motion Designer','Content Writer / Copywriter','Voiceover Artist','Event Planner','Event MC / Host','DJ / Sound Engineer'],
  },
  {
    label: 'Technology & Digital',
    icon: 'code',
    skills: ['Web Developer','Mobile App Developer','Software Engineer','UI / UX Designer','IT Support / Network Engineer','Cybersecurity Specialist','Data Analyst','Social Media Manager','Digital Marketer / SEO Specialist','Virtual Assistant'],
  },
  {
    label: 'Legal & Compliance',
    icon: 'gavel',
    skills: ['Lawyer / Legal Consultant','Corporate Lawyer','Contract & IP Lawyer','Notary Public / Commissioner for Oaths'],
  },
  {
    label: 'Engineering & Construction',
    icon: 'construction',
    skills: ['Civil Engineer','Structural Engineer','Mechanical Engineer','Electrical Engineer','Chemical Engineer','Environmental Engineer','Architect','Quantity Surveyor','Land Surveyor','Facility Manager','Project Manager'],
  },
  {
    label: 'Real Estate & Property',
    icon: 'domain',
    skills: ['Real Estate Agent','Property Manager / Housing Agent','Estate Valuer','Mortgage Consultant'],
  },
  {
    label: 'Finance & Business',
    icon: 'account_balance',
    skills: ['Accountant / Auditor','Tax Consultant','Financial Advisor','Business Consultant','Investment Advisor'],
  },
  {
    label: 'Health & Wellness',
    icon: 'medical_services',
    skills: ['Doctor / Medical Consultant','Nurse / Caregiver','Pharmacist','Physiotherapist','Therapist / Counsellor','Psychologist','Nutritionist / Dietitian','Personal Trainer / Fitness Coach','Optician'],
  },
  {
    label: 'Education & Training',
    icon: 'school',
    skills: ['Private Tutor','Corporate Trainer','Language Instructor'],
  },
  {
    label: 'HR & Recruitment',
    icon: 'people',
    skills: ['HR Consultant','Recruitment Consultant'],
  },
  {
    label: 'Others',
    icon: 'more_horiz',
    skills: ['Others'],
  },
];

const ID_TYPES = [
  { value: 'NIN',                    label: 'National Identity Number (NIN)',  icon: 'badge'          },
  { value: 'Voters Card',            label: "Voter's Card",                     icon: 'how_to_vote'    },
  { value: "Driver's License",       label: "Driver's License",                 icon: 'directions_car' },
  { value: 'International Passport', label: 'International Passport',           icon: 'flight_takeoff' },
  { value: 'BVN',                    label: 'Bank Verification Number (BVN)',   icon: 'account_balance'},
];

type Step = 'photo' | 'skills' | 'location' | 'verification' | 'video' | 'pending';

const ORDERED_STEPS: Step[] = ['photo', 'skills', 'location', 'verification', 'video'];
const STEP_KEY: Partial<Record<Step, string>> = {
  photo: 'profilePhoto', skills: 'skills', location: 'location',
  verification: 'verificationId', video: 'skillVideo',
};
const STEP_NUM: Partial<Record<Step, number>> = {
  photo: 1, skills: 2, location: 3, verification: 4, video: 5,
};
const STEP_PREV: Partial<Record<Step, Step>> = {
  skills: 'photo', location: 'skills', verification: 'location', video: 'verification',
};
const STEP_META: Record<Step, { title: string; subtitle: string; icon: string }> = {
  photo:        { title: 'Profile Photo',        icon: 'photo_camera',  subtitle: 'A clear, professional photo builds customer trust.' },
  skills:       { title: 'Skills & Bio',          icon: 'build',         subtitle: 'Pick up to 5 skills and write a short description of your work.' },
  location:     { title: 'Your Location',         icon: 'location_on',   subtitle: 'We use your location to match you with nearby job requests.' },
  verification: { title: 'Verify Your Identity',  icon: 'verified_user', subtitle: 'Upload a government-issued ID to earn your Verified badge. You can skip for now.' },
  video:        { title: 'Skill Video',           icon: 'videocam',      subtitle: 'A short video of your work helps you stand out. Optional — you can skip.' },
  pending:      { title: 'Profile Submitted',     icon: 'task_alt',      subtitle: 'Our team will review your profile. This usually takes 24–48 hours.' },
};

interface StatusData {
  verificationStatus: string;
  onboardingComplete: boolean;
  completedSteps: Record<string, boolean>;
  skippedSteps?: Record<string, boolean>;
  rejectionReason?: string;
  profilePhoto?: string;
  skills?: string[];
  bio?: string;
  location?: { address?: string; state?: string; lga?: string };
  verificationId?: { uploaded: boolean; idType?: string };
  skillVideo?: { uploaded: boolean };
}

// ─── Error extraction helper ───────────────────────────────────────────────────
type AxiosErrShape = { response?: { data?: { message?: string } } };
const extractError = (e: unknown, fallback: string) =>
  ((e as AxiosErrShape)?.response?.data?.message) ?? fallback;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ArtisanOnboardingPage() {
  const router = useRouter();
  const { user, login, refreshMe } = useAuth();

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  const [initLoading, setInitLoading] = useState(true);
  const [step, setStep] = useState<Step>('photo');

  // ── Step 1: Photo ──────────────────────────────────────────────────────────
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  const [photoIsExisting, setPhotoIsExisting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError,     setPhotoError]     = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Step 2: Skills ─────────────────────────────────────────────────────────
  const [selectedSkills,     setSelectedSkills]     = useState<string[]>([]);
  const [othersText,         setOthersText]         = useState('');
  const [bio,                setBio]                = useState('');
  const [skillSearch,        setSkillSearch]        = useState('');
  const [vehicleType,        setVehicleType]        = useState('');
  const [plateNumber,        setPlateNumber]        = useState('');
  const [hasHelmet,          setHasHelmet]          = useState(false);
  const [providesPackaging,  setProvidesPackaging]  = useState(false);
  const [skillsLoading,      setSkillsLoading]      = useState(false);
  const [skillsError,        setSkillsError]        = useState<string | null>(null);

  // ── Step 3: Location ───────────────────────────────────────────────────────
  const [address,          setAddress]          = useState('');
  const [stateVal,         setStateVal]         = useState('');
  const [lga,              setLga]              = useState('');
  const [coords,           setCoords]           = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus,        setGpsStatus]        = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [locationError,    setLocationError]    = useState<string | null>(null);
  const [locationLoading,  setLocationLoading]  = useState(false);

  // ── Step 4: Verification ID ────────────────────────────────────────────────
  const [idType,           setIdType]           = useState('');
  const [idFile,           setIdFile]           = useState<File | null>(null);
  const [idPreview,        setIdPreview]        = useState<string | null>(null);
  const [idIsExisting,     setIdIsExisting]     = useState(false);
  const [idUploading,      setIdUploading]      = useState(false);
  const [idError,          setIdError]          = useState<string | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  // ── Step 5: Video ──────────────────────────────────────────────────────────
  const [videoFile,        setVideoFile]        = useState<File | null>(null);
  const [videoName,        setVideoName]        = useState<string | null>(null);
  const [videoIsExisting,  setVideoIsExisting]  = useState(false);
  const [videoUploading,   setVideoUploading]   = useState(false);
  const [videoError,       setVideoError]       = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Pending screen ─────────────────────────────────────────────────────────
  const [pendingData,      setPendingData]      = useState<StatusData | null>(null);
  const [pendingRefreshing, setPendingRefreshing] = useState(false);

  // ── Cancel dialog ──────────────────────────────────────────────────────────
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ─── On mount: load status and resume ──────────────────────────────────────
  useEffect(() => {
    api.get('/api/artisan/onboarding/status')
      .then((res) => {
        const data: StatusData = res.data.data ?? res.data;

        if (data.onboardingComplete) {
          router.replace('/artisan/dashboard');
          return;
        }

        // Pre-populate from existing data so resume feels seamless
        if (data.profilePhoto) {
          setPhotoPreview(data.profilePhoto);
          setPhotoIsExisting(true);
        }
        if (data.skills?.length) setSelectedSkills(data.skills);
        if (data.bio)            setBio(data.bio);
        if (data.location?.address) setAddress(data.location.address);
        if (data.location?.state)   setStateVal(data.location.state);
        if (data.location?.lga)     setLga(data.location.lga);
        if (data.verificationId?.uploaded) {
          setIdIsExisting(true);
          if (data.verificationId.idType) setIdType(data.verificationId.idType);
        }
        if (data.skillVideo?.uploaded) setVideoIsExisting(true);

        const completed = data.completedSteps ?? {};
        const firstIncomplete = ORDERED_STEPS.find(s => !completed[STEP_KEY[s]!]);

        if (!firstIncomplete) {
          setPendingData(data);
          setStep('pending');
        } else {
          setStep(firstIncomplete);
        }
      })
      .catch(() => { /* default to step 'photo' */ })
      .finally(() => setInitLoading(false));
  }, [router]);

  const advanceTo = useCallback((next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Step 1 handlers ───────────────────────────────────────────────────────
  const applyPhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setPhotoError('Please select an image (JPG, PNG, or WebP).'); return; }
    if (file.size > 5 * 1024 * 1024)    { setPhotoError('Image must be under 5 MB.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoIsExisting(false);
    setPhotoError(null);
  };

  const handlePhotoSubmit = async () => {
    if (!photoPreview) { setPhotoError('Please select a profile photo.'); return; }
    if (photoIsExisting || !photoFile) { advanceTo('skills'); return; } // existing photo, no re-upload needed
    setPhotoUploading(true);
    setPhotoError(null);
    try {
      const fd = new FormData();
      fd.append('profilePhoto', photoFile);
      await api.post('/api/artisan/onboarding/profile-photo', fd);
      advanceTo('skills');
    } catch (e) {
      setPhotoError(extractError(e, 'Upload failed. Please try again.'));
    } finally { setPhotoUploading(false); }
  };

  // ─── Step 2 handlers ───────────────────────────────────────────────────────
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill);
      if (prev.length >= 5)    return prev;
      return [...prev, skill];
    });
    setSkillsError(null);
  };

  const handleSkillsSubmit = async () => {
    if (selectedSkills.length === 0) { setSkillsError('Please select at least one skill.'); return; }
    if (selectedSkills.includes('Others') && !othersText.trim()) {
      setSkillsError('Please describe your specific skill in the "Others" field.');
      return;
    }
    const isDispatch = selectedSkills.includes('Dispatch Rider');
    if (isDispatch) {
      if (!vehicleType)               { setSkillsError('Please select your vehicle type.'); return; }
      if (plateNumber.trim().length < 5) { setSkillsError('Enter a valid plate number (at least 5 characters).'); return; }
    }
    const finalSkills = selectedSkills.map(s => (s === 'Others' ? othersText.trim() : s));
    setSkillsLoading(true);
    setSkillsError(null);
    try {
      await api.post('/api/artisan/onboarding/skills', { skills: finalSkills });
      if (bio.trim()) {
        await api.post('/api/artisan/bio', { bio: bio.trim() }).catch(() => {});
      }
      if (isDispatch) {
        await api.post('/api/artisan/onboarding/dispatch-info', {
          vehicleType,
          plateNumber: plateNumber.trim().toUpperCase(),
          hasHelmet,
          providesPackaging,
        }).catch(() => {});
      }
      advanceTo('location');
    } catch (e) {
      setSkillsError(extractError(e, 'Failed to save skills. Please try again.'));
    } finally { setSkillsLoading(false); }
  };

  // ─── Step 3 handlers ───────────────────────────────────────────────────────
  const handleDetectGPS = () => {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsStatus('success');
        // Best-effort reverse geocode via Nominatim
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          ).then(r => r.json());
          const a = geo.address ?? {};
          const parts = [a.road, a.suburb, a.neighbourhood, a.town || a.city].filter(Boolean);
          if (parts.length && !address) setAddress(parts.join(', '));
          const st = (a.state ?? '').replace(' State', '');
          if (st && NIGERIAN_STATES.includes(st) && !stateVal) setStateVal(st);
          if ((a.suburb || a.city_district) && !lga) setLga(a.suburb || a.city_district);
        } catch { /* silent - manual entry is fine */ }
      },
      () => setGpsStatus('error'),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleLocationSubmit = async () => {
    if (!address.trim()) { setLocationError('Please enter your street or area address.'); return; }
    if (!stateVal)       { setLocationError('Please select your state.'); return; }
    setLocationLoading(true);
    setLocationError(null);
    try {
      await api.post('/api/artisan/onboarding/location', {
        address: address.trim(),
        state: stateVal,
        lga: lga.trim(),
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      });
      advanceTo('verification');
    } catch (e) {
      setLocationError(extractError(e, 'Failed to save location. Please try again.'));
    } finally { setLocationLoading(false); }
  };

  // ─── Step 4 handlers ───────────────────────────────────────────────────────
  const applyIdFile = (file: File) => {
    const ok = ['image/jpeg','image/jpg','image/png','image/webp','application/pdf'];
    if (!ok.includes(file.type)) { setIdError('Please select a JPG, PNG, or PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setIdError('File must be under 10 MB.'); return; }
    setIdFile(file);
    setIdIsExisting(false);
    setIdPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setIdError(null);
  };

  const handleIdSubmit = async () => {
    if (!idType) { setIdError('Please select your ID document type.'); return; }
    if (!idFile && !idIsExisting) { setIdError('Please upload a photo or scan of your ID.'); return; }
    if (idIsExisting && !idFile) { advanceTo('video'); return; }
    setIdUploading(true);
    setIdError(null);
    try {
      const fd = new FormData();
      fd.append('verificationId', idFile!);
      fd.append('idType', idType);
      await api.post('/api/artisan/onboarding/verification-id', fd);
      advanceTo('video');
    } catch (e) {
      setIdError(extractError(e, 'Upload failed. Please try again.'));
    } finally { setIdUploading(false); }
  };

  const handleSkipId = async () => {
    await api.post('/api/artisan/onboarding/skip-verification-id').catch(() => {});
    advanceTo('video');
  };

  // ─── Step 5 handlers ───────────────────────────────────────────────────────
  const applyVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) { setVideoError('Please select a video file (MP4, MOV, etc.).'); return; }
    if (file.size > 100 * 1024 * 1024)  { setVideoError('Video must be under 100 MB.'); return; }
    setVideoFile(file);
    setVideoName(file.name);
    setVideoIsExisting(false);
    setVideoError(null);
  };

  const fetchAndShowPending = async () => {
    try {
      const res = await api.get('/api/artisan/onboarding/status');
      setPendingData(res.data.data ?? res.data);
    } catch { /* show pending screen anyway */ }
    advanceTo('pending');
  };

  const handleVideoSubmit = async () => {
    if (!videoFile && !videoIsExisting) { setVideoError('Please select a video file.'); return; }
    if (videoIsExisting && !videoFile)  { await fetchAndShowPending(); return; }
    setVideoUploading(true);
    setVideoError(null);
    try {
      const fd = new FormData();
      fd.append('skillVideo', videoFile!);
      await api.post('/api/artisan/onboarding/skill-video', fd, { timeout: 300000 } as never);
      await fetchAndShowPending();
    } catch (e) {
      setVideoError(extractError(e, 'Upload failed. Please try again.'));
    } finally { setVideoUploading(false); }
  };

  const handleSkipVideo = async () => {
    await api.post('/api/artisan/onboarding/skip-skill-video').catch(() => {});
    await fetchAndShowPending();
  };

  // ─── Pending handlers ──────────────────────────────────────────────────────
  const handleRefreshStatus = async () => {
    setPendingRefreshing(true);
    try {
      const res = await api.get('/api/artisan/onboarding/status');
      const data: StatusData = res.data.data ?? res.data;
      setPendingData(data);
      if (data.verificationStatus === 'verified') {
        await refreshMe();
        router.replace('/artisan/dashboard');
      }
    } catch { /* silent */ }
    finally { setPendingRefreshing(false); }
  };

  // ─── Cancel handlers ───────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      const res = await api.post('/api/auth/cancel-artisan-registration');
      if (res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
      }
    } catch { /* proceed regardless */ }
    finally {
      setCancelling(false);
      router.replace('/customer/dashboard');
    }
  };

  // ─── Computed ──────────────────────────────────────────────────────────────
  const stepNum = STEP_NUM[step];
  const isLoading =
    step === 'photo' ? photoUploading :
    step === 'skills' ? skillsLoading :
    step === 'location' ? locationLoading :
    step === 'verification' ? idUploading :
    step === 'video' ? videoUploading : false;

  const filteredGroups = skillSearch.trim()
    ? SKILL_GROUPS
        .map(g => ({ ...g, skills: g.skills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())) }))
        .filter(g => g.skills.length > 0)
    : SKILL_GROUPS;

  const handleContinue = () => {
    switch (step) {
      case 'photo':        return handlePhotoSubmit();
      case 'skills':       return handleSkillsSubmit();
      case 'location':     return handleLocationSubmit();
      case 'verification': return handleIdSubmit();
      case 'video':        return handleVideoSubmit();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fb' }}>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-[22px] font-extrabold" style={{ color: '#004ac6' }}>FixNG</Link>
        {stepNum && (
          <span className="text-[13px] font-semibold text-gray-500">
            Step {stepNum} of 5
          </span>
        )}
        {step !== 'pending'
          ? (
            <button
              onClick={() => setShowCancel(true)}
              className="text-[13px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )
          : <div className="w-16" />
        }
      </header>

      {/* ── Progress bar ── */}
      {stepNum && (
        <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${(stepNum / 5) * 100}%`, background: '#004ac6' }}
          />
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 pt-20 pb-28 px-4">
        {initLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#004ac6', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className={`mx-auto ${step === 'skills' ? 'max-w-3xl' : 'max-w-xl'}`}>

            {/* Step header (hidden on pending) */}
            {step !== 'pending' && (
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f0fe' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>
                    {STEP_META[step].icon}
                  </span>
                </div>
                <h1 className="text-[26px] md:text-[30px] font-black text-gray-900 mb-2">{STEP_META[step].title}</h1>
                <p className="text-[15px] text-gray-500 max-w-md mx-auto">{STEP_META[step].subtitle}</p>
              </div>
            )}

            {/* ── STEP 1: PHOTO ── */}
            {step === 'photo' && (
              <div className="flex flex-col items-center gap-6">
                {/* Upload circle */}
                <div
                  className="relative cursor-pointer group"
                  style={{ width: 200, height: 200 }}
                  onClick={() => photoInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) applyPhotoFile(f); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div
                    className="w-full h-full rounded-full overflow-hidden border-4 border-dashed transition-all"
                    style={{
                      borderColor: photoPreview ? '#004ac6' : '#c3c6d7',
                      background: '#f0f4ff',
                    }}
                  >
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '52px', color: '#9fa5b5' }}>add_a_photo</span>
                        <span className="text-[13px] text-gray-400 font-medium text-center px-4">Tap to upload</span>
                      </div>
                    )}
                  </div>
                  {/* Hover overlay */}
                  {photoPreview && (
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>edit</span>
                    </div>
                  )}
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) applyPhotoFile(f); }}
                />

                {photoPreview && (
                  <button onClick={() => photoInputRef.current?.click()} className="text-[14px] font-semibold hover:underline" style={{ color: '#004ac6' }}>
                    Change photo
                  </button>
                )}

                {photoError && <ErrorBox message={photoError} />}

                {/* Tips card */}
                <div className="w-full bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#004ac6' }}>tips_and_updates</span>
                    Photo tips
                  </h3>
                  <ul className="space-y-2">
                    {['Clear face, good lighting, no sunglasses', 'Professional appearance — dress how you work', 'Solo photo, not a group shot', 'Face fills most of the frame'].map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-[13px] text-gray-500">
                        <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '14px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ── STEP 2: SKILLS ── */}
            {step === 'skills' && (
              <div className="space-y-6">
                {/* Selected pills */}
                {selectedSkills.length > 0 && (
                  <div className="rounded-2xl p-4 border" style={{ background: '#f0f4ff', borderColor: 'rgba(0,74,198,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-bold text-gray-700">{selectedSkills.length}/5 selected</span>
                      {selectedSkills.length === 5 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#004ac6', color: '#fff' }}>Maximum</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(s => (
                        <button
                          key={s}
                          onClick={() => toggleSkill(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-white transition-all hover:brightness-110"
                          style={{ background: '#004ac6' }}
                        >
                          {s === 'Others' && othersText ? othersText : s}
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400" style={{ fontSize: '20px' }}>search</span>
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills…"
                    className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none transition-all"
                    style={{ boxShadow: 'none' }}
                    onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  {skillSearch && (
                    <button onClick={() => setSkillSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                    </button>
                  )}
                </div>

                {/* Category groups */}
                {filteredGroups.map(group => (
                  <div key={group.label}>
                    <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{group.icon}</span>
                      {group.label}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map(skill => {
                        const selected = selectedSkills.includes(skill);
                        const disabled = !selected && selectedSkills.length >= 5;
                        return (
                          <button
                            key={skill}
                            onClick={() => { if (!disabled) toggleSkill(skill); }}
                            disabled={disabled}
                            className="px-3.5 py-2 rounded-full text-[14px] font-semibold border-2 transition-all"
                            style={{
                              background: selected ? '#004ac6' : '#fff',
                              borderColor: selected ? '#004ac6' : '#e5e7eb',
                              color: selected ? '#fff' : disabled ? '#d1d5db' : '#374151',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              opacity: disabled ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!selected && !disabled) {
                                e.currentTarget.style.borderColor = '#004ac6';
                                e.currentTarget.style.color = '#004ac6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selected && !disabled) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.color = '#374151';
                              }
                            }}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Others text input */}
                {selectedSkills.includes('Others') && (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
                      What is your specific skill? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={othersText}
                      onChange={(e) => setOthersText(e.target.value)}
                      placeholder="e.g. Mason, Weaving, Shoe Cobbler…"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none transition-all"
                      onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                      onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </div>
                )}

                {/* Dispatch Rider extras */}
                {selectedSkills.includes('Dispatch Rider') && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
                    <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>two_wheeler</span>
                      Dispatch Rider Details
                    </h3>
                    {/* Vehicle type */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-500 mb-2">Vehicle Type <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Motorcycle','Bicycle','Car','Van'].map(v => (
                          <button key={v} onClick={() => setVehicleType(v)} className="py-2.5 rounded-xl text-[14px] font-semibold border-2 transition-all"
                            style={{ background: vehicleType === v ? '#004ac6' : '#fff', borderColor: vehicleType === v ? '#004ac6' : '#e5e7eb', color: vehicleType === v ? '#fff' : '#374151' }}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Plate number */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-500 mb-1.5">Plate Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9 \-]/g, ''))}
                        placeholder="e.g. LAG-123AB"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] uppercase tracking-wider outline-none transition-all"
                        onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                      />
                    </div>
                    {/* Toggles */}
                    <div className="flex gap-3">
                      {([
                        { label: 'Has Helmet', value: hasHelmet, toggle: () => setHasHelmet(v => !v) },
                        { label: 'Provides Packaging', value: providesPackaging, toggle: () => setProvidesPackaging(v => !v) },
                      ] as const).map(({ label, value, toggle }) => (
                        <button key={label} onClick={toggle} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all"
                          style={{ background: value ? '#e8f0fe' : '#fff', borderColor: value ? '#004ac6' : '#e5e7eb', color: value ? '#004ac6' : '#6b7280' }}>
                          {value ? '✓ ' : ''}{label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">
                      Short Bio <span className="text-gray-400 font-normal">(optional but recommended)</span>
                    </label>
                    <span className="text-[11px] text-gray-400">{bio.length}/300</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 300))}
                    placeholder="Tell customers what you do and what makes you great at it. e.g. Certified electrician with 8 years of experience, specialising in residential wiring and solar installations…"
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none resize-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>

                {skillsError && <ErrorBox message={skillsError} />}
              </div>
            )}

            {/* ── STEP 3: LOCATION ── */}
            {step === 'location' && (
              <div className="space-y-5">
                {/* GPS button */}
                <button
                  onClick={handleDetectGPS}
                  disabled={gpsStatus === 'detecting'}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 font-semibold text-[15px] transition-all"
                  style={{
                    borderColor: gpsStatus === 'success' ? '#006229' : '#004ac6',
                    background: gpsStatus === 'success' ? '#e6f4ed' : '#f0f4ff',
                    color: gpsStatus === 'success' ? '#006229' : '#004ac6',
                  }}
                >
                  {gpsStatus === 'detecting' ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: gpsStatus === 'success' ? "'FILL' 1" : "'FILL' 0" }}>
                      {gpsStatus === 'success' ? 'my_location' : 'gps_fixed'}
                    </span>
                  )}
                  {gpsStatus === 'detecting' ? 'Detecting location…' :
                   gpsStatus === 'success'   ? 'Location detected — edit below if needed' :
                   gpsStatus === 'error'     ? 'Could not detect — enter manually' :
                   'Detect my location automatically'}
                </button>

                {/* Address fields */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Street / Area <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12 Awolowo Road, Victoria Island"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">State <span className="text-red-500">*</span></label>
                  <select
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none transition-all appearance-none"
                    onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  >
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">LGA / City <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Eti-Osa, Surulere"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = '#004ac6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>

                {locationError && <ErrorBox message={locationError} />}

                <p className="text-[12px] text-gray-400 text-center">Your exact address is only shared with customers you accept jobs from.</p>
              </div>
            )}

            {/* ── STEP 4: VERIFICATION ID ── */}
            {step === 'verification' && (
              <div className="space-y-5">
                {/* Existing ID notice */}
                {idIsExisting && !idFile && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: '#e6f4ed', borderColor: 'rgba(0,98,41,0.2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <p className="text-[14px] font-bold text-gray-800">ID already uploaded{idType ? `: ${idType}` : ''}</p>
                      <p className="text-[12px] text-gray-500">You can continue or upload a different document.</p>
                    </div>
                  </div>
                )}

                {/* ID type selector */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-2">Document Type <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {ID_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => { setIdType(t.value); setIdError(null); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all"
                        style={{
                          background: idType === t.value ? '#f0f4ff' : '#fff',
                          borderColor: idType === t.value ? '#004ac6' : '#e5e7eb',
                        }}
                      >
                        <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '22px', color: idType === t.value ? '#004ac6' : '#9ca3af', fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                        <span className="text-[14px] font-semibold" style={{ color: idType === t.value ? '#004ac6' : '#374151' }}>{t.label}</span>
                        {idType === t.value && (
                          <span className="material-symbols-outlined ml-auto flex-shrink-0" style={{ fontSize: '18px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-2">Upload ID Document <span className="text-red-500">*</span></label>
                  <div
                    className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
                    style={{ borderColor: idFile || idIsExisting ? '#004ac6' : '#d1d5db', background: idFile || idIsExisting ? '#f0f4ff' : '#fafafa' }}
                    onClick={() => idInputRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) applyIdFile(f); }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {idFile ? (
                      <>
                        {idPreview ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
                            <Image src={idPreview} alt="ID preview" fill className="object-contain" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                          </div>
                        )}
                        <p className="text-[14px] font-semibold text-gray-700">{idFile.name}</p>
                        <p className="text-[12px] text-gray-400 mt-1">Tap to replace</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mb-2" style={{ fontSize: '40px', color: '#9ca3af' }}>upload_file</span>
                        <p className="text-[14px] font-semibold text-gray-600">Tap or drag to upload</p>
                        <p className="text-[12px] text-gray-400 mt-1">JPG, PNG or PDF — max 10 MB</p>
                      </>
                    )}
                  </div>
                  <input ref={idInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) applyIdFile(f); }} />
                </div>

                {idError && <ErrorBox message={idError} />}

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '18px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-[12px] text-amber-700">Your ID is used only for verification and is never shared with customers.</p>
                </div>
              </div>
            )}

            {/* ── STEP 5: SKILL VIDEO ── */}
            {step === 'video' && (
              <div className="space-y-5">
                {/* Existing video notice */}
                {videoIsExisting && !videoFile && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: '#e6f4ed', borderColor: 'rgba(0,98,41,0.2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <p className="text-[14px] font-bold text-gray-800">Video already uploaded</p>
                      <p className="text-[12px] text-gray-500">You can continue or replace it with a new one.</p>
                    </div>
                  </div>
                )}

                {/* Upload area */}
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
                  style={{ borderColor: videoFile ? '#004ac6' : '#d1d5db', background: videoFile ? '#f0f4ff' : '#fafafa' }}
                  onClick={() => videoInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) applyVideoFile(f); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {videoFile ? (
                    <>
                      <span className="material-symbols-outlined mb-3" style={{ fontSize: '48px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>videocam</span>
                      <p className="text-[15px] font-bold text-gray-800">{videoName}</p>
                      <p className="text-[12px] text-gray-400 mt-1">Tap to replace</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mb-3" style={{ fontSize: '52px', color: '#9ca3af' }}>video_file</span>
                      <p className="text-[15px] font-semibold text-gray-700">Tap or drag to upload a video</p>
                      <p className="text-[12px] text-gray-400 mt-1">MP4, MOV — max 100 MB</p>
                    </>
                  )}
                </div>
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) applyVideoFile(f); }} />

                {videoUploading && (
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#f0f4ff' }}>
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: '#004ac6', borderTopColor: 'transparent' }} />
                    <p className="text-[14px] text-gray-600">Uploading video — this may take a minute…</p>
                  </div>
                )}

                {videoError && <ErrorBox message={videoError} />}

                {/* Guidelines */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#004ac6' }}>tips_and_updates</span>
                    Video guidelines
                  </h3>
                  <ul className="space-y-2">
                    {['Keep it 30 seconds to 2 minutes long','Show your tools, workspace, or an example of your work','Good lighting and clear audio make a big difference','Speak briefly about your experience if you like'].map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-[13px] text-gray-500">
                        <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '14px', color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ── PENDING / SUBMITTED SCREEN ── */}
            {step === 'pending' && (
              <div>
                {/* Status hero */}
                <div className="text-center py-8">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{
                      background:
                        pendingData?.verificationStatus === 'verified'  ? '#e6f4ed' :
                        pendingData?.verificationStatus === 'rejected'  ? '#fce8e8' :
                        '#fff8e6',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '56px',
                        fontVariationSettings: "'FILL' 1",
                        color:
                          pendingData?.verificationStatus === 'verified'  ? '#006229' :
                          pendingData?.verificationStatus === 'rejected'  ? '#c62828' :
                          '#e65100',
                      }}
                    >
                      {pendingData?.verificationStatus === 'verified'  ? 'verified'         :
                       pendingData?.verificationStatus === 'rejected'  ? 'cancel'           :
                       'pending'}
                    </span>
                  </div>
                  <h1 className="text-[28px] font-black text-gray-900 mb-2">
                    {pendingData?.verificationStatus === 'verified'  ? 'You\'re Verified!' :
                     pendingData?.verificationStatus === 'rejected'  ? 'Review Unsuccessful' :
                     'Profile Under Review'}
                  </h1>
                  <p className="text-[15px] text-gray-500 max-w-sm mx-auto">
                    {pendingData?.verificationStatus === 'verified'  ? 'Your profile is live. Customers can now find and hire you.' :
                     pendingData?.verificationStatus === 'rejected'  ? 'Your profile did not pass review. See the reason below.' :
                     'Our team will review your profile within 24–48 hours. You can use the app while you wait.'}
                  </p>
                </div>

                {/* Rejection reason */}
                {pendingData?.verificationStatus === 'rejected' && pendingData.rejectionReason && (
                  <div className="mb-5 p-4 rounded-2xl border" style={{ background: '#fce8e8', borderColor: 'rgba(198,40,40,0.2)' }}>
                    <h3 className="text-[14px] font-bold text-red-800 mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>warning</span>
                      Rejection Reason
                    </h3>
                    <p className="text-[13px] text-red-700">{pendingData.rejectionReason}</p>
                  </div>
                )}

                {/* Checklist */}
                <div className="bg-white rounded-2xl border border-gray-100 mb-5">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-[16px] font-bold text-gray-800">Profile Checklist</h2>
                  </div>
                  {([
                    { key: 'profilePhoto',  label: 'Profile Photo',      icon: 'photo_camera' },
                    { key: 'skills',        label: 'Skills & Bio',        icon: 'build'         },
                    { key: 'location',      label: 'Location',            icon: 'location_on'   },
                    { key: 'verificationId', label: 'Verification ID',   icon: 'verified_user'  },
                    { key: 'skillVideo',    label: 'Skill Video',         icon: 'videocam'      },
                  ]).map(({ key, label, icon }, i, arr) => {
                    const done = pendingData?.completedSteps?.[key];
                    const skipped = pendingData?.skippedSteps?.[key];
                    return (
                      <div key={key} className={`flex items-center gap-3 px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? '#e6f4ed' : '#f3f4f6' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1", color: done ? '#006229' : '#d1d5db' }}>
                            {done ? 'check_circle' : icon}
                          </span>
                        </div>
                        <span className="text-[14px] font-medium" style={{ color: done ? '#111827' : '#9ca3af' }}>{label}</span>
                        {done && skipped && (
                          <span className="ml-auto text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Skipped</span>
                        )}
                        {done && !skipped && (
                          <span className="material-symbols-outlined ml-auto" style={{ fontSize: '18px', color: '#006229', fontVariationSettings: "'FILL' 1" }}>check</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/artisan/dashboard"
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[16px] text-white transition-all hover:brightness-110"
                    style={{ background: '#004ac6' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleRefreshStatus}
                    disabled={pendingRefreshing}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-[15px] text-gray-700 border border-gray-200 bg-white transition-all hover:bg-gray-50 disabled:opacity-60"
                  >
                    {pendingRefreshing
                      ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>}
                    Refresh Status
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Navigation footer ── */}
      {step !== 'pending' && !initLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 md:px-8 py-4">
          <div className={`mx-auto flex items-center gap-3 ${step === 'skills' ? 'max-w-3xl' : 'max-w-xl'}`}>
            {/* Back */}
            {STEP_PREV[step] ? (
              <button
                onClick={() => advanceTo(STEP_PREV[step]!)}
                className="flex items-center gap-1.5 text-[15px] font-semibold text-gray-500 hover:text-gray-800 transition-colors py-3 px-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                Back
              </button>
            ) : <div className="w-16" />}

            <div className="flex-1" />

            {/* Skip (steps 4 & 5) */}
            {(step === 'verification' || step === 'video') && (
              <button
                onClick={step === 'verification' ? handleSkipId : handleSkipVideo}
                disabled={isLoading}
                className="text-[14px] font-semibold text-gray-400 hover:text-gray-600 transition-colors py-3 px-3 disabled:opacity-40"
              >
                Skip
              </button>
            )}

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-[16px] text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
              style={{ background: '#004ac6' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {step === 'verification' || step === 'video' ? 'Upload & Continue' : 'Continue'}
              {!isLoading && <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
            </button>
          </div>
        </div>
      )}

      {/* ── Cancel confirmation modal ── */}
      {showCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fce8e8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#c62828', fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h2 className="text-[20px] font-black text-gray-900 mb-2">Cancel Registration?</h2>
            <p className="text-[14px] text-gray-500 mb-6">
              This will delete your artisan profile and any uploaded files. Your account will revert to a customer account. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl text-[15px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#c62828' }}
              >
                {cancelling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : 'Cancel & Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared error box ──────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-[14px]" style={{ background: '#fce8e8', color: '#c62828' }}>
      <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
      {message}
    </div>
  );
}
