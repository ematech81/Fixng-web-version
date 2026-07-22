import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import FAQAccordion from '@/components/shared/FAQAccordion';

export const metadata = { title: 'FAQ — FixNG' };

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 max-w-xl mx-auto flex flex-col gap-3">
            <span className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mx-auto">
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              FAQ
            </span>
            <h1 className="text-[36px] font-extrabold text-on-primary-container">Frequently Asked Questions</h1>
            <p className="text-[16px] text-on-primary-container/80">
              Quick answers to the most common questions about FixNG.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 max-w-3xl flex flex-col gap-10">

          <FAQAccordion />

          {/* More help */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <Link href="/help" className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-[14px] hover:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Full Help Center
            </Link>
            <Link href="/contact" className="flex items-center gap-2 border border-outline-variant text-on-surface-variant px-6 py-3 rounded-xl font-bold text-[14px] hover:text-primary hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Contact Support
            </Link>
          </div>

        </div>

        <div className="border-t border-outline-variant/30 px-4 py-6 text-center">
          <p className="text-[12px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace — Spheralix Digital Labs. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
