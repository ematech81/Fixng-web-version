import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'About Us — FixNG' };

const PILLARS = [
  { icon: 'verified', title: 'Verified Professionals', desc: 'Every artisan on FixNG undergoes identity and skill verification before appearing in search results.' },
  { icon: 'gps_fixed', title: 'GPS-Powered Matching', desc: 'Our location engine connects you with the closest available professional, cutting wait times and transport costs.' },
  { icon: 'handshake', title: 'No Middlemen', desc: 'Customers and artisans negotiate directly. No agency fees, no hidden charges — just transparent service.' },
  { icon: 'shield', title: 'NDPR Compliant', desc: 'All personal data is handled in full compliance with the Nigeria Data Protection Regulation (NDPR) 2019.' },
  { icon: 'star', title: 'Real Reviews', desc: 'Ratings come from verified completed jobs only — no fake or unverified feedback.' },
  { icon: 'notifications_active', title: 'Real-Time Updates', desc: 'Track your booking status and communicate instantly through our platform on both mobile and web.' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-20 px-4 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-4">
            <span className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mx-auto">
              <span className="material-symbols-outlined text-[16px]">info</span>
              About FixNG
            </span>
            <h1 className="text-[36px] md:text-[52px] font-extrabold text-on-primary-container leading-tight tracking-tight">
              Nigeria&apos;s Artisan Marketplace
            </h1>
            <p className="text-[18px] text-on-primary-container/80 leading-relaxed max-w-2xl mx-auto">
              FixNG connects customers with skilled, verified professionals across Nigeria — from plumbers and electricians
              to lawyers, engineers, and creative professionals.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 flex flex-col gap-16">

          {/* Mission */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-primary uppercase tracking-widest">Our Mission</span>
              <h2 className="text-[28px] md:text-[36px] font-bold text-on-surface leading-tight">
                Making quality service accessible to every Nigerian
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Millions of Nigerians struggle to find reliable skilled professionals — and millions of skilled artisans
                struggle to reach customers. FixNG bridges that gap with a GPS-powered platform that makes discovering,
                vetting, and booking service professionals as simple as a few taps.
              </p>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                We believe every Nigerian deserves access to quality, affordable, and trustworthy professional services —
                and every artisan deserves a fair platform to grow their business.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '80+', label: 'Skill Categories' },
                { value: '36', label: 'States Covered' },
                { value: '0', label: 'Middlemen' },
                { value: '24h', label: 'Dispute Resolution' },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/30">
                  <p className="text-[32px] font-black text-primary">{s.value}</p>
                  <p className="text-[13px] font-semibold text-on-surface-variant mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pillars */}
          <section>
            <div className="text-center mb-10">
              <span className="text-[12px] font-bold text-primary uppercase tracking-widest">What We Stand For</span>
              <h2 className="text-[28px] font-bold text-on-surface mt-2">Built on trust, powered by technology</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PILLARS.map((p) => (
                <div key={p.title} className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-on-surface">{p.title}</h3>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Company */}
          <section className="bg-surface-container-low rounded-3xl p-8 md:p-12 border border-outline-variant/30">
            <span className="text-[12px] font-bold text-primary uppercase tracking-widest">The Company</span>
            <h2 className="text-[24px] font-bold text-on-surface mt-2 mb-4">Spheralix Digital Labs</h2>
            <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-3xl">
              FixNG is built and maintained by <strong className="text-on-surface">Spheralix Digital Labs</strong>, a Nigerian software company
              focused on building practical digital solutions for the African market. We are headquartered in Nigeria
              and committed to creating technology that works for everyday Nigerians — on any device, anywhere in the country.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-[14px] text-center hover:scale-95 transition-transform">
                Get in Touch
              </Link>
              <Link href="/help" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-xl font-bold text-[14px] text-center hover:text-primary hover:border-primary transition-colors">
                Visit Help Center
              </Link>
            </div>
          </section>

        </div>

        {/* Mini footer */}
        <div className="border-t border-outline-variant/30 px-4 py-6 text-center">
          <p className="text-[12px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace — Spheralix Digital Labs. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
