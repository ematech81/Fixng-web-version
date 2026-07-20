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

const SKILL_COLORS: Record<string, string> = {
  // Trades & Home Services
  Plumber: '#1E40AF', Electrician: '#1E40AF', Carpenter: '#1E40AF',
  Painter: '#1E40AF', Tiler: '#1E40AF', Bricklayer: '#1E40AF',
  Welder: '#1E40AF', 'AC Technician': '#1E40AF', 'Generator Repair': '#1E40AF',
  'Auto Mechanic': '#1E40AF', 'Phone / Laptop Repair': '#1E40AF',
  'POP / Ceiling Work': '#1E40AF', Fumigation: '#1E40AF',
  'Solar Installation': '#1E40AF', 'CCTV / Security Systems': '#1E40AF',
  'Roofing Specialist': '#1E40AF', 'Landscaper / Gardener': '#1E40AF',
  'Pool Maintenance': '#1E40AF', Locksmith: '#1E40AF',
  'Glass & Aluminium Work': '#1E40AF',
  // Beauty & Personal Care
  Tailor: '#BE185D', Barber: '#BE185D', Hairdresser: '#BE185D',
  'Makeup Artist': '#BE185D', 'Nail Technician': '#BE185D',
  'Spa Therapist / Masseur': '#BE185D',
  // Home & Lifestyle
  'Chef / Cook': '#15803D', 'Caterer / Event Caterer': '#15803D',
  Cleaner: '#15803D', Laundry: '#15803D', 'Interior Decorator': '#15803D',
  'Moving / Relocation Service': '#15803D',
  // Security, Transport & Logistics
  'Security Guard': '#B45309', Driver: '#B45309',
  'Dispatch Rider': '#B45309', 'Logistics / Courier Service': '#B45309',
  // Media, Design & Events
  Photographer: '#7C3AED', Videographer: '#7C3AED',
  'Graphic Designer': '#7C3AED', 'Animator / Motion Designer': '#7C3AED',
  'Content Writer / Copywriter': '#7C3AED', 'Voiceover Artist': '#7C3AED',
  'Event Planner': '#7C3AED', 'Event MC / Host': '#7C3AED',
  'DJ / Sound Engineer': '#7C3AED',
  // Technology & Digital
  'Web Developer': '#0E7490', 'Mobile App Developer': '#0E7490',
  'Software Engineer': '#0E7490', 'UI / UX Designer': '#0E7490',
  'IT Support / Network Engineer': '#0E7490', 'Cybersecurity Specialist': '#0E7490',
  'Data Analyst': '#0E7490', 'Social Media Manager': '#0E7490',
  'Digital Marketer / SEO Specialist': '#0E7490', 'Virtual Assistant': '#0E7490',
  // Legal & Compliance
  'Lawyer / Legal Consultant': '#1E3A5F', 'Corporate Lawyer': '#1E3A5F',
  'Contract & IP Lawyer': '#1E3A5F', 'Notary Public / Commissioner for Oaths': '#1E3A5F',
  // Engineering & Construction
  'Civil Engineer': '#B91C1C', 'Structural Engineer': '#B91C1C',
  'Mechanical Engineer': '#B91C1C', 'Electrical Engineer': '#B91C1C',
  'Chemical Engineer': '#B91C1C', 'Environmental Engineer': '#B91C1C',
  Architect: '#B91C1C', 'Quantity Surveyor': '#B91C1C',
  'Land Surveyor': '#B91C1C', 'Facility Manager': '#B91C1C',
  'Project Manager': '#B91C1C',
  // Real Estate & Property
  'Real Estate Agent': '#065F46', 'Property Manager / Housing Agent': '#065F46',
  'Estate Valuer': '#065F46', 'Mortgage Consultant': '#065F46',
  // Finance & Business
  'Accountant / Auditor': '#92400E', 'Tax Consultant': '#92400E',
  'Financial Advisor': '#92400E', 'Business Consultant': '#92400E',
  'Investment Advisor': '#92400E',
  // Health & Wellness
  'Doctor / Medical Consultant': '#9F1239', 'Nurse / Caregiver': '#9F1239',
  Pharmacist: '#9F1239', Physiotherapist: '#9F1239',
  'Therapist / Counsellor': '#9F1239', Psychologist: '#9F1239',
  'Nutritionist / Dietitian': '#9F1239',
  'Personal Trainer / Fitness Coach': '#9F1239', Optician: '#9F1239',
  // Education & Training
  'Private Tutor': '#3730A3', 'Corporate Trainer': '#3730A3',
  'Language Instructor': '#3730A3',
  // HR & Recruitment
  'HR Consultant': '#374151', 'Recruitment Consultant': '#374151',
};

interface Props {
  artisan: Artisan;
}

export default function ArtisanCard({ artisan }: Props) {
  const router       = useRouter();
  const { user }     = useAuth();
  const primarySkill = artisan.skills?.[0] ?? 'Artisan';
  const rating       = artisan.stats?.averageRating ?? 0;
  const jobs         = artisan.stats?.completedJobs  ?? 0;
  const reviews      = artisan.stats?.totalRatings   ?? 0;
  const headerColor  = SKILL_COLORS[primarySkill] ?? '#1E40AF';
  const isVerified   = artisan.badgeLevel === 'verified' || artisan.badgeLevel === 'trusted';

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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col">

      {/* Colored skill header */}
      <div className="h-20 flex items-start justify-between px-4 pt-3 flex-shrink-0 relative" style={{ background: headerColor }}>
        <span className="text-white font-black text-[14px] tracking-widest uppercase leading-tight line-clamp-2 max-w-[70%]">
          {primarySkill}
        </span>
        {artisan.isPro && (
          <span className="bg-white/25 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/30 whitespace-nowrap">
            PRO
          </span>
        )}
      </div>

      {/* Body — avatar overlaps header via negative top margin */}
      <div className="flex flex-col items-center px-4 pb-5 -mt-10 flex-1">

        {/* Profile circle */}
        <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
          {artisan.profilePhoto ? (
            <Image
              src={artisan.profilePhoto}
              alt={artisan.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: headerColor }}>
              <span className="text-white text-[22px] font-black leading-none">{getInitials(artisan.name)}</span>
            </div>
          )}
        </div>

        {/* Name + verified badge */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
          <h3 className="text-[16px] font-black text-on-surface text-center leading-tight">{artisan.name}</h3>
          {isVerified && (
            <span
              className="material-symbols-outlined flex-shrink-0"
              style={{ fontSize: '18px', color: '#3B82F6', fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          )}
        </div>

        {/* Specialty */}
        <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5 text-center">{primarySkill}</p>

        {/* Bio excerpt */}
        {artisan.bio && (
          <p className="text-[12px] text-outline text-center mt-2 leading-relaxed line-clamp-2">{artisan.bio}</p>
        )}

        {/* Location + jobs */}
        <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
          <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
            {artisan.lga ? `${artisan.lga}, ${artisan.state ?? 'NG'}` : (artisan.state ?? 'Nigeria')}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>work_history</span>
            {jobs > 0 ? `${jobs} job${jobs !== 1 ? 's' : ''}` : 'New'}
          </span>
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-0.5 mt-2 min-h-[20px]">
          {rating > 0 ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', color: '#F59E0B', fontVariationSettings: `'FILL' ${i <= Math.round(rating) ? 1 : 0}` }}
                >
                  star
                </span>
              ))}
              <span className="text-[11px] font-semibold text-on-surface-variant ml-1">{rating.toFixed(1)}</span>
              {reviews > 0 && <span className="text-[11px] text-outline ml-0.5">({reviews})</span>}
            </>
          ) : (
            <span className="text-[11px] text-outline">No ratings yet</span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 w-full mt-4">
          <Link
            href={`/artisan/${artisan.id}`}
            className="flex-1 py-2 border border-outline-variant text-on-surface-variant font-semibold rounded-xl text-[12px] text-center hover:border-primary hover:text-primary transition-all duration-200"
          >
            View Profile
          </Link>
          <button
            onClick={handleBookNow}
            className="flex-1 py-2 text-white font-bold rounded-xl text-[12px] hover:brightness-110 active:scale-95 transition-all duration-200"
            style={{ background: headerColor }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
