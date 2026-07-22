'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Trades & Home Services',
    icon: 'home_repair_service',
    bg: '#1E40AF',
    skills: [
      'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Tiler',
      'Bricklayer', 'Welder', 'AC Technician', 'Generator Repair',
      'Auto Mechanic', 'Phone / Laptop Repair', 'POP / Ceiling Work',
      'Fumigation', 'Solar Installation', 'CCTV / Security Systems',
      'Roofing Specialist', 'Landscaper / Gardener', 'Pool Maintenance',
      'Locksmith', 'Glass & Aluminium Work',
    ],
  },
  {
    name: 'Beauty & Personal Care',
    icon: 'face_retouching_natural',
    bg: '#BE185D',
    skills: ['Tailor', 'Barber', 'Hairdresser', 'Makeup Artist', 'Nail Technician', 'Spa Therapist / Masseur'],
  },
  {
    name: 'Home & Lifestyle',
    icon: 'chair',
    bg: '#15803D',
    skills: ['Chef / Cook', 'Caterer / Event Caterer', 'Cleaner', 'Laundry', 'Interior Decorator', 'Moving / Relocation Service'],
  },
  {
    name: 'Security & Transport',
    icon: 'security',
    bg: '#B45309',
    skills: ['Security Guard', 'Driver', 'Dispatch Rider', 'Logistics / Courier Service'],
  },
  {
    name: 'Media, Design & Events',
    icon: 'camera_alt',
    bg: '#7C3AED',
    skills: [
      'Photographer', 'Videographer', 'Graphic Designer', 'Animator / Motion Designer',
      'Content Writer / Copywriter', 'Voiceover Artist', 'Event Planner',
      'Event MC / Host', 'DJ / Sound Engineer',
    ],
  },
  {
    name: 'Technology & Digital',
    icon: 'code',
    bg: '#0E7490',
    skills: [
      'Web Developer', 'Mobile App Developer', 'Software Engineer', 'UI / UX Designer',
      'IT Support / Network Engineer', 'Cybersecurity Specialist', 'Data Analyst',
      'Social Media Manager', 'Digital Marketer / SEO Specialist', 'Virtual Assistant',
    ],
  },
  {
    name: 'Legal & Compliance',
    icon: 'gavel',
    bg: '#1E3A5F',
    skills: ['Lawyer / Legal Consultant', 'Corporate Lawyer', 'Contract & IP Lawyer', 'Notary Public / Commissioner for Oaths'],
  },
  {
    name: 'Engineering',
    icon: 'construction',
    bg: '#B91C1C',
    skills: [
      'Civil Engineer', 'Structural Engineer', 'Mechanical Engineer', 'Electrical Engineer',
      'Chemical Engineer', 'Environmental Engineer', 'Architect',
      'Quantity Surveyor', 'Land Surveyor', 'Facility Manager', 'Project Manager',
    ],
  },
  {
    name: 'Real Estate',
    icon: 'home',
    bg: '#065F46',
    skills: ['Real Estate Agent', 'Property Manager / Housing Agent', 'Estate Valuer', 'Mortgage Consultant'],
  },
  {
    name: 'Finance & Business',
    icon: 'account_balance',
    bg: '#92400E',
    skills: ['Accountant / Auditor', 'Tax Consultant', 'Financial Advisor', 'Business Consultant', 'Investment Advisor'],
  },
  {
    name: 'Health & Wellness',
    icon: 'medical_services',
    bg: '#9F1239',
    skills: [
      'Doctor / Medical Consultant', 'Nurse / Caregiver', 'Pharmacist', 'Physiotherapist',
      'Therapist / Counsellor', 'Psychologist', 'Nutritionist / Dietitian',
      'Personal Trainer / Fitness Coach', 'Optician',
    ],
  },
  {
    name: 'Education & Training',
    icon: 'school',
    bg: '#3730A3',
    skills: ['Private Tutor', 'Corporate Trainer', 'Language Instructor'],
  },
  {
    name: 'HR & Recruitment',
    icon: 'people',
    bg: '#374151',
    skills: ['HR Consultant', 'Recruitment Consultant'],
  },
];

export default function CategoryBrowser() {
  // hovered: changes on mouseEnter/mouseLeave — no click involved
  // pinned:  set by clicking a category; panel stays open until X or skill clicked
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned,  setPinned]  = useState<string | null>(null);

  const activeName     = pinned ?? hovered;
  const activeCategory = CATEGORIES.find((c) => c.name === activeName) ?? null;

  const handleClose = () => {
    setPinned(null);
    setHovered(null);
  };

  return (
    <section className="py-12 bg-surface-container-low">
      <div className="container mx-auto px-4 md:px-12">

        <div className="text-center md:text-left mb-8">
          <h2 className="text-[32px] leading-10 font-bold text-on-surface mb-2 tracking-tight">Browse by Category</h2>
          <p className="text-[16px] text-on-surface-variant">
            Find exactly what you need from 80+ professional skills — hover to preview, click to pin
          </p>
        </div>

        {/* Mouse-leave only closes when nothing is pinned */}
        <div onMouseLeave={() => { if (!pinned) setHovered(null); }}>

          {/* Category grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-4">
            {CATEGORIES.map((cat) => {
              const isActive = activeName === cat.name;
              const isPinned = pinned === cat.name;
              return (
                <button
                  key={cat.name}
                  onMouseEnter={() => setHovered(cat.name)}
                  onClick={() => setPinned(isPinned ? null : cat.name)}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none"
                  style={
                    isActive
                      ? { background: cat.bg, borderColor: cat.bg, transform: 'scale(1.05)', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }
                      : { background: '#fff', borderColor: 'rgba(0,0,0,0.08)' }
                  }
                >
                  <span
                    className="material-symbols-outlined text-[24px] md:text-[28px]"
                    style={{ color: isActive ? '#fff' : cat.bg, fontVariationSettings: "'FILL' 1" }}
                  >
                    {cat.icon}
                  </span>
                  <span
                    className="text-[10px] md:text-[11px] font-bold text-center leading-tight"
                    style={{ color: isActive ? '#fff' : undefined }}
                  >
                    {cat.name}
                  </span>
                  <span
                    className="text-[10px] font-medium hidden md:block"
                    style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}
                  >
                    {cat.skills.length} skills
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded skills panel */}
          {activeCategory && (
            <div
              className="bg-white rounded-2xl p-5 md:p-6 shadow-xl border-t-[3px] animate-fade-in"
              style={{ borderTopColor: activeCategory.bg }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: activeCategory.bg }}
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {activeCategory.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-on-surface">{activeCategory.name}</h3>
                    <p className="text-[12px] text-outline">{activeCategory.skills.length} specialists available</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline-variant/20 transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeCategory.skills.map((skill) => (
                  <Link
                    key={skill}
                    href={`/search?skill=${encodeURIComponent(skill)}`}
                    onClick={handleClose}
                    className="px-3 py-1.5 rounded-full text-[13px] font-semibold border text-on-surface transition-all duration-150"
                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = activeCategory.bg;
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = activeCategory.bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                    }}
                  >
                    {skill}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
