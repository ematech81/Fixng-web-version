import Navbar from '@/components/layout/Navbar';
import FAQAccordion from '@/components/shared/FAQAccordion';

export const metadata = { title: 'Help Center — FixNG' };

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 max-w-xl mx-auto flex flex-col gap-3">
            <span className="text-[40px]">🛠️</span>
            <h1 className="text-[36px] font-extrabold text-on-primary-container">How can we help?</h1>
            <p className="text-[16px] text-on-primary-container/80">
              Browse common questions below or reach us directly. We typically respond within a few hours.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 max-w-3xl flex flex-col gap-12">

          {/* Contact channels */}
          <section>
            <h2 className="text-[20px] font-bold text-on-surface mb-6">Contact Us</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:support@techsphereapp.com"
                className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>mail</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-blue-700">Email Support</p>
                  <p className="text-[14px] font-semibold text-on-surface group-hover:text-blue-600 transition-colors">support@techsphereapp.com</p>
                </div>
              </a>
              <a
                href="https://wa.me/2349011495230"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-600" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>chat</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-green-700">WhatsApp</p>
                  <p className="text-[14px] font-semibold text-on-surface group-hover:text-green-600 transition-colors">+234 901 149 5230</p>
                </div>
              </a>
            </div>

            {/* Hours */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <div>
                <p className="text-[13px] font-bold text-amber-700">Support Hours</p>
                <p className="text-[13px] text-on-surface-variant">Monday – Saturday &middot; 8:00 AM – 8:00 PM WAT</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq">
            <h2 className="text-[20px] font-bold text-on-surface mb-6">Frequently Asked Questions</h2>
            <FAQAccordion />
          </section>

          {/* Still stuck */}
          <section className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/30">
            <p className="text-[16px] font-bold text-on-surface mb-2">Still need help?</p>
            <p className="text-[14px] text-on-surface-variant mb-4">
              If you couldn&apos;t find your answer above, reach out to us directly and we&apos;ll get back to you.
            </p>
            <a
              href="mailto:support@techsphereapp.com"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-[14px] hover:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Email Us
            </a>
          </section>

        </div>

        <div className="border-t border-outline-variant/30 px-4 py-6 text-center">
          <p className="text-[12px] text-on-surface-variant">FixNG v1.0 · Made with ❤️ in Nigeria &nbsp;·&nbsp; © 2025 Spheralix Digital Labs</p>
        </div>
      </main>
    </>
  );
}
