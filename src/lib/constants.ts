export const SKILLS = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Welder',
  'Mason', 'Tiler', 'Roofer', 'AC Technician', 'AC Maintenance',
  'Generator Repair', 'Wiring', 'Solar Installation', 'CCTV Installation',
  'Auto Mechanic', 'Vulcanizer', 'Panel Beater',
  'Phone/Laptop Repair', 'Graphic Designer', 'Web Developer',
  'Dispatch Rider', 'Driver', 'Security Guard', 'Logistics / Courier Service',
  'Lawyer', 'Engineer', 'Architect',
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
  Plumber:              'plumbing',
  Electrician:          'electric_bolt',
  Carpenter:            'carpenter',
  Painter:              'format_paint',
  'AC Technician':      'ac_unit',
  'Solar Installation': 'solar_power',
  Welder:               'hardware',
  Tiler:                'grid_view',
  Mason:                'home_repair_service',
  'Generator Repair':   'bolt',
  'Auto Mechanic':      'car_repair',
  'Phone/Laptop Repair':'devices',
  'Dispatch Rider':     'two_wheeler',
  Driver:               'directions_car',
  'Security Guard':     'security',
  'Web Developer':      'code',
  'Graphic Designer':   'design_services',
  Lawyer:               'gavel',
  Engineer:             'engineering',
  Architect:            'architecture',
  default:              'build',
};
