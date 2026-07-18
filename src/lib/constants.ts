export const SKILLS = [
  // ── Trades & Home Services ────────────────────────────────────────────────
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Tiler',
  'Bricklayer',
  'Welder',
  'AC Technician',
  'Generator Repair',
  'Auto Mechanic',
  'Phone / Laptop Repair',
  'POP / Ceiling Work',
  'Fumigation',
  'Solar Installation',
  'CCTV / Security Systems',
  'Roofing Specialist',
  'Landscaper / Gardener',
  'Pool Maintenance',
  'Locksmith',
  'Glass & Aluminium Work',

  // ── Beauty & Personal Care ────────────────────────────────────────────────
  'Tailor',
  'Barber',
  'Hairdresser',
  'Makeup Artist',
  'Nail Technician',
  'Spa Therapist / Masseur',

  // ── Home & Lifestyle ──────────────────────────────────────────────────────
  'Chef / Cook',
  'Caterer / Event Caterer',
  'Cleaner',
  'Laundry',
  'Interior Decorator',
  'Moving / Relocation Service',

  // ── Security, Transport & Logistics ──────────────────────────────────────
  'Security Guard',
  'Driver',
  'Dispatch Rider',
  'Logistics / Courier Service',

  // ── Media, Design & Events ────────────────────────────────────────────────
  'Photographer',
  'Videographer',
  'Graphic Designer',
  'Animator / Motion Designer',
  'Content Writer / Copywriter',
  'Voiceover Artist',
  'Event Planner',
  'Event MC / Host',
  'DJ / Sound Engineer',

  // ── Technology & Digital ──────────────────────────────────────────────────
  'Web Developer',
  'Mobile App Developer',
  'Software Engineer',
  'UI / UX Designer',
  'IT Support / Network Engineer',
  'Cybersecurity Specialist',
  'Data Analyst',
  'Social Media Manager',
  'Digital Marketer / SEO Specialist',
  'Virtual Assistant',

  // ── Legal & Compliance ────────────────────────────────────────────────────
  'Lawyer / Legal Consultant',
  'Corporate Lawyer',
  'Contract & IP Lawyer',
  'Notary Public / Commissioner for Oaths',

  // ── Engineering & Construction ────────────────────────────────────────────
  'Civil Engineer',
  'Structural Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Chemical Engineer',
  'Environmental Engineer',
  'Architect',
  'Quantity Surveyor',
  'Land Surveyor',
  'Facility Manager',
  'Project Manager',

  // ── Real Estate & Property ────────────────────────────────────────────────
  'Real Estate Agent',
  'Property Manager / Housing Agent',
  'Estate Valuer',
  'Mortgage Consultant',

  // ── Finance & Business ────────────────────────────────────────────────────
  'Accountant / Auditor',
  'Tax Consultant',
  'Financial Advisor',
  'Business Consultant',
  'Investment Advisor',

  // ── Health & Wellness ─────────────────────────────────────────────────────
  'Doctor / Medical Consultant',
  'Nurse / Caregiver',
  'Pharmacist',
  'Physiotherapist',
  'Therapist / Counsellor',
  'Psychologist',
  'Nutritionist / Dietitian',
  'Personal Trainer / Fitness Coach',
  'Optician',

  // ── Education & Training ──────────────────────────────────────────────────
  'Private Tutor',
  'Corporate Trainer',
  'Language Instructor',

  // ── HR, Recruitment & Admin ───────────────────────────────────────────────
  'HR Consultant',
  'Recruitment Consultant',

  // ── Others ────────────────────────────────────────────────────────────────
  'Others',
] as const;

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const JOB_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:      { label: 'Pending',     color: '#F59E0B', bg: '#FFFBEB' },
  accepted:     { label: 'Accepted',    color: '#3B82F6', bg: '#EFF6FF' },
  'in-progress':{ label: 'In Progress', color: '#8B5CF6', bg: '#F5F3FF' },
  completed:    { label: 'Completed',   color: '#22C55E', bg: '#F0FDF4' },
  disputed:     { label: 'Disputed',    color: '#EF4444', bg: '#FEF2F2' },
  cancelled:    { label: 'Cancelled',   color: '#9CA3AF', bg: '#F9FAFB' },
};

export const BADGE_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  new:      { label: 'New',      color: '#9CA3AF' },
  verified: { label: 'Verified', color: '#3B82F6' },
  trusted:  { label: 'Trusted',  color: '#F59E0B' },
};

export const PROFESSION_ICONS: Record<string, string> = {
  // Trades & Home Services
  Plumber:                          'plumbing',
  Electrician:                      'electric_bolt',
  Carpenter:                        'carpenter',
  Painter:                          'format_paint',
  Tiler:                            'grid_view',
  Bricklayer:                       'foundation',
  Welder:                           'hardware',
  'AC Technician':                  'ac_unit',
  'Generator Repair':               'bolt',
  'Auto Mechanic':                  'car_repair',
  'Phone / Laptop Repair':          'devices',
  'POP / Ceiling Work':             'weekend',
  Fumigation:                       'pest_control',
  'Solar Installation':             'solar_power',
  'CCTV / Security Systems':        'videocam',
  'Roofing Specialist':             'roofing',
  'Landscaper / Gardener':          'yard',
  'Pool Maintenance':               'pool',
  Locksmith:                        'lock',
  'Glass & Aluminium Work':         'window',

  // Beauty & Personal Care
  Tailor:                           'checkroom',
  Barber:                           'content_cut',
  Hairdresser:                      'face_4',
  'Makeup Artist':                  'face_retouching_natural',
  'Nail Technician':                'spa',
  'Spa Therapist / Masseur':        'self_improvement',

  // Home & Lifestyle
  'Chef / Cook':                    'restaurant',
  'Caterer / Event Caterer':        'dinner_dining',
  Cleaner:                          'cleaning_services',
  Laundry:                          'local_laundry_service',
  'Interior Decorator':             'chair',
  'Moving / Relocation Service':    'local_shipping',

  // Security, Transport & Logistics
  'Security Guard':                 'security',
  Driver:                           'directions_car',
  'Dispatch Rider':                 'two_wheeler',
  'Logistics / Courier Service':    'inventory_2',

  // Media, Design & Events
  Photographer:                     'camera_alt',
  Videographer:                     'videocam',
  'Graphic Designer':               'design_services',
  'Animator / Motion Designer':     'animation',
  'Content Writer / Copywriter':    'edit_note',
  'Voiceover Artist':               'record_voice_over',
  'Event Planner':                  'event',
  'Event MC / Host':                'mic',
  'DJ / Sound Engineer':            'headphones',

  // Technology & Digital
  'Web Developer':                  'code',
  'Mobile App Developer':           'phone_android',
  'Software Engineer':              'terminal',
  'UI / UX Designer':               'palette',
  'IT Support / Network Engineer':  'router',
  'Cybersecurity Specialist':       'shield',
  'Data Analyst':                   'analytics',
  'Social Media Manager':           'share',
  'Digital Marketer / SEO Specialist': 'trending_up',
  'Virtual Assistant':              'support_agent',

  // Legal & Compliance
  'Lawyer / Legal Consultant':      'gavel',
  'Corporate Lawyer':               'balance',
  'Contract & IP Lawyer':           'description',
  'Notary Public / Commissioner for Oaths': 'verified_user',

  // Engineering & Construction
  'Civil Engineer':                 'construction',
  'Structural Engineer':            'domain',
  'Mechanical Engineer':            'settings',
  'Electrical Engineer':            'electrical_services',
  'Chemical Engineer':              'science',
  'Environmental Engineer':         'eco',
  Architect:                        'architecture',
  'Quantity Surveyor':              'calculate',
  'Land Surveyor':                  'map',
  'Facility Manager':               'apartment',
  'Project Manager':                'manage_accounts',

  // Real Estate & Property
  'Real Estate Agent':              'home',
  'Property Manager / Housing Agent': 'house',
  'Estate Valuer':                  'price_check',
  'Mortgage Consultant':            'account_balance',

  // Finance & Business
  'Accountant / Auditor':           'receipt_long',
  'Tax Consultant':                 'paid',
  'Financial Advisor':              'savings',
  'Business Consultant':            'business_center',
  'Investment Advisor':             'show_chart',

  // Health & Wellness
  'Doctor / Medical Consultant':    'medical_services',
  'Nurse / Caregiver':              'health_and_safety',
  Pharmacist:                       'medication',
  Physiotherapist:                  'accessibility_new',
  'Therapist / Counsellor':         'psychology',
  Psychologist:                     'psychology_alt',
  'Nutritionist / Dietitian':       'restaurant_menu',
  'Personal Trainer / Fitness Coach': 'fitness_center',
  Optician:                         'visibility',

  // Education & Training
  'Private Tutor':                  'school',
  'Corporate Trainer':              'groups',
  'Language Instructor':            'language',

  // HR, Recruitment & Admin
  'HR Consultant':                  'people',
  'Recruitment Consultant':         'person_search',

  // Others
  Others:                           'more_horiz',

  default:                          'build',
};
