import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const PROFESSIONS = [
  { label: 'Plumber',         icon: 'plumbing',           skill: 'Plumber' },
  { label: 'Electrician',     icon: 'electric_bolt',       skill: 'Electrician' },
  { label: 'Carpenter',       icon: 'carpenter',           skill: 'Carpenter' },
  { label: 'Painter',         icon: 'format_paint',        skill: 'Painter' },
  { label: 'AC Technician',   icon: 'ac_unit',             skill: 'AC Technician' },
  { label: 'Solar Installer', icon: 'solar_power',         skill: 'Solar Installation' },
  { label: 'Welder',          icon: 'hardware',            skill: 'Welder' },
  { label: 'Tiler',           icon: 'grid_view',           skill: 'Tiler' },
  { label: 'Bricklayer',      icon: 'home_repair_service', skill: 'Mason' },
  { label: 'Gen Repair',      icon: 'bolt',                skill: 'Generator Repair' },
  { label: 'Auto Mechanic',   icon: 'car_repair',          skill: 'Auto Mechanic' },
  { label: 'Phone/Laptop',    icon: 'devices',             skill: 'Phone/Laptop Repair' },
];

const WHY_ITEMS = [
  { icon: 'verified',             title: 'Verified Professionals', desc: 'Every artisan undergoes a strict identity and skill verification process.' },
  { icon: 'gps_fixed',            title: 'GPS-Powered',            desc: 'Find the closest available pros to reduce wait times and transport costs.' },
  { icon: 'handshake',            title: 'No Middlemen',           desc: 'Negotiate directly with the pro. No agency fees or hidden charges.' },
  { icon: 'app_registration',     title: 'Free to Join',           desc: 'Customers and professionals can sign up and start browsing for free.' },
  { icon: 'star',                 title: 'Real Reviews',           desc: 'Make informed decisions based on genuine feedback from past clients.' },
  { icon: 'notifications_active', title: 'Real-time Updates',      desc: 'Track your booking status and communicate instantly via our platform.' },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-primary-container min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-30" />
          <div className="container mx-auto px-4 md:px-12 relative z-10 grid md:grid-cols-2 gap-8 items-center py-8">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mx-auto md:mx-0">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Verified Network in Nigeria
              </span>
              <h1 className="text-[24px] md:text-[48px] leading-tight font-extrabold text-on-primary-container tracking-tight">
                Find Skilled Professionals{' '}
                <span className="text-secondary-fixed">Near You</span>
              </h1>
              <p className="text-[18px] leading-7 text-on-primary-container/80 max-w-xl">
                GPS-powered marketplace connecting customers with verified artisans in Nigeria.
                Fast, secure, and transparent professional services at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link
                  href="/search"
                  className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
                >
                  <span className="material-symbols-outlined">search</span>
                  Find an Artisan
                </Link>
                <Link
                  href="/register"
                  className="bg-white/10 text-on-primary-container border border-white/20 px-8 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  Join as Professional
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden md:block relative h-[520px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10 w-full h-full bg-surface-container rounded-3xl shadow-2xl border-4 border-white/10 transform rotate-3 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-tertiary-container/20" />
                <div className="relative z-10 text-center p-8">
                  <span className="material-symbols-outlined text-[96px] text-on-primary-container/60">engineering</span>
                  <p className="text-on-primary-container/80 font-bold text-xl mt-4">Nigeria&apos;s #1 Artisan Platform</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface p-4 rounded-2xl shadow-xl flex items-center gap-4" style={{ animation: 'bounce 3s infinite' }}>
                <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-outline">Near You</p>
                  <p className="text-[14px] font-bold">12 Pros Online</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <section className="bg-surface py-8 border-b border-outline-variant/30">
          <div className="container mx-auto px-4 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '100+', label: 'Verified Professionals' },
                { value: '36',   label: 'States Covered' },
                { value: '0',    label: 'Middlemen' },
                { value: 'Free', label: 'To Join' },
              ].map((stat, i) => (
                <div key={i} className="text-center md:border-r border-outline-variant/30 last:border-0 p-4">
                  <h3 className="text-[32px] leading-10 font-bold text-primary tracking-tight">{stat.value}</h3>
                  <p className="text-[14px] font-medium text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section className="py-8 bg-surface-container-low">
          <div className="container mx-auto px-4 md:px-12">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <h2 className="text-[32px] leading-10 font-bold text-on-surface mb-4 tracking-tight">How it Works</h2>
              <p className="text-[16px] text-on-surface-variant">Getting high-quality service shouldn&apos;t be a hassle. We&apos;ve streamlined the process into three simple steps.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-px border-t-2 border-dashed border-primary/20" />
              {[
                { icon: 'search',          step: '1. Search', desc: 'Use our GPS-powered map to find top-rated professionals in your immediate area.' },
                { icon: 'event_available', step: '2. Book',   desc: 'Review profiles, check ratings, and book your preferred artisan instantly with no middlemen.' },
                { icon: 'check_circle',    step: '3. Done',   desc: 'Your artisan arrives, completes the job, and you provide a rating to help others in the community.' },
              ].map((item, i) => (
                <div key={i} className="bg-surface p-8 rounded-2xl shadow-sm text-center relative z-10 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                  </div>
                  <h4 className="text-[20px] leading-7 font-semibold mb-2">{item.step}</h4>
                  <p className="text-[16px] text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Professions Grid ─────────────────────────────────────────────── */}
        <section className="py-8 bg-surface">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex justify-between items-end mb-8">
              <div className="max-w-xl">
                <h2 className="text-[32px] leading-10 font-bold text-on-surface mb-4 tracking-tight">Popular Professions</h2>
                <p className="text-[16px] text-on-surface-variant">From home repairs to professional digital services, find the expert you need.</p>
              </div>
              <Link href="/search" className="text-primary font-bold text-[14px] items-center gap-1 hover:underline hidden md:flex">
                View All Professions <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {PROFESSIONS.map((p) => (
                <Link
                  key={p.skill}
                  href={`/search?skill=${encodeURIComponent(p.skill)}`}
                  className="group bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl flex flex-col items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-variant text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined">{p.icon}</span>
                  </div>
                  <span className="text-[14px] font-bold text-center">{p.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why FixNG ────────────────────────────────────────────────────── */}
        <section className="py-8 bg-inverse-surface text-on-primary-container overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[160px] opacity-20 -mr-48 -mt-48" />
          <div className="container mx-auto px-4 md:px-12 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-[32px] leading-10 font-bold mb-4 tracking-tight">Why Choose FixNG?</h2>
              <p className="text-[16px] opacity-80 max-w-2xl mx-auto">The most secure and efficient way to hire local talent in Nigeria.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {WHY_ITEMS.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-container text-white rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-[20px] leading-7 font-semibold mb-1">{item.title}</h4>
                    <p className="text-[16px] opacity-70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonial ──────────────────────────────────────────────────── */}
        <section className="py-8 bg-surface-container-high overflow-hidden">
          <div className="container mx-auto px-4 md:px-12">
            <div className="max-w-4xl mx-auto bg-surface p-8 md:p-16 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-8 relative">
              <div className="absolute top-0 right-0 p-6 text-primary/10">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
              </div>
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary/10 shadow-lg bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-outline">person</span>
              </div>
              <div className="relative z-10 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-[18px] leading-7 italic font-medium mb-6">
                  &ldquo;I needed an emergency electrician at 8 PM on a Sunday in Lagos. Through FixNG, I found a verified pro just 10 minutes away. He fixed the fault in less than an hour. The GPS tracking and verified badge gave me total peace of mind!&rdquo;
                </p>
                <div>
                  <h5 className="text-[20px] font-bold">Chiamaka Adeleke</h5>
                  <p className="text-[14px] text-on-surface-variant">Lagos Resident</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────────── */}
        <section className="py-8">
          <div className="container mx-auto px-4 md:px-12">
            <div className="bg-primary rounded-[32px] p-8 text-center text-on-primary shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6">
                <h2 className="text-[24px] md:text-[32px] leading-10 font-bold tracking-tight">
                  Ready to find work or get it done?
                </h2>
                <p className="text-[16px] opacity-90">
                  Join thousands of Nigerians using FixNG to grow their businesses or solve their home maintenance needs today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                  <Link href="/search"   className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md">Hire a Professional</Link>
                  <Link href="/register" className="bg-primary-container border border-white/30 text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">List My Services</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 md:px-12 flex flex-col md:flex-row justify-between gap-6 bg-surface-container-highest border-t border-outline-variant">
        <div className="flex flex-col gap-4 max-w-xs">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <p className="text-[16px] text-on-surface-variant">Connecting Nigeria&apos;s finest artisans with people who need quality work done, efficiently and safely.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h6 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Company</h6>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">About Us</Link>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h6 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Legal</h6>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Privacy Policy</Link>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h6 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Support</h6>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Help Center</Link>
            <Link href="#" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">FAQ</Link>
          </div>
        </div>
      </footer>
      <div className="bg-surface-container-highest px-4 md:px-12 py-4 border-t border-outline-variant/30 text-center md:text-left">
        <p className="text-[12px] font-semibold text-on-surface-variant">
          © 2025 FixNG Artisan Marketplace — Spheralix Digital Labs. All rights reserved.
        </p>
      </div>
    </>
  );
}
