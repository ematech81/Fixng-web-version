import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import CategoryBrowser from '@/components/home/CategoryBrowser';
import FeaturedProfessionals from '@/components/home/FeaturedProfessionals';
import HeroCTA from '@/components/home/HeroCTA';
import CTABannerContent from '@/components/home/CTABannerContent';

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
                <HeroCTA />
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden md:block relative h-[520px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 rounded-full blur-3xl" />
              <div className="relative z-10 w-full h-full rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
                <Image
                  src="/hero-artisan.jpeg"
                  alt="Verified Nigerian electrician ready to help"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 0px, 50vw"
                />
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

        {/* ── Browse by Category ────────────────────────────────────────────── */}
        <CategoryBrowser />

        {/* ── Featured Professionals ────────────────────────────────────────── */}
        <FeaturedProfessionals />

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
                <CTABannerContent />
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
            <Link href="/about"   className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">About Us</Link>
            <Link href="/contact" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h6 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Legal</h6>
            <Link href="/privacy" className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Privacy Policy</Link>
            <Link href="/terms"   className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h6 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Support</h6>
            <Link href="/help"    className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">Help Center</Link>
            <Link href="/faq"     className="text-[16px] text-on-surface-variant hover:underline hover:text-primary transition-all">FAQ</Link>
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
