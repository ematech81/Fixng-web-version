import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Contact Us — FixNG' };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 max-w-xl mx-auto flex flex-col gap-3">
            <span className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mx-auto">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              We&apos;re here to help
            </span>
            <h1 className="text-[36px] font-extrabold text-on-primary-container">Contact Us</h1>
            <p className="text-[16px] text-on-primary-container/80">
              Have a question, complaint, or partnership enquiry? Reach us through any of the channels below.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 max-w-3xl flex flex-col gap-10">

          {/* Contact cards */}
          <section className="grid sm:grid-cols-2 gap-6">
            {/* Email */}
            <a
              href="mailto:support@techsphereapp.com"
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>mail</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-blue-700 mb-1">Email Support</p>
                <p className="text-[15px] font-semibold text-on-surface group-hover:text-blue-600 transition-colors">support@techsphereapp.com</p>
                <p className="text-[12px] text-on-surface-variant mt-1">We typically reply within a few hours</p>
              </div>
              <span className="text-blue-500 text-[13px] font-bold flex items-center gap-1">
                Send Email <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2349011495230"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-green-700 mb-1">WhatsApp</p>
                <p className="text-[15px] font-semibold text-on-surface group-hover:text-green-600 transition-colors">+234 901 149 5230</p>
                <p className="text-[12px] text-on-surface-variant mt-1">Chat with us directly on WhatsApp</p>
              </div>
              <span className="text-green-600 text-[13px] font-bold flex items-center gap-1">
                Open WhatsApp <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </a>
          </section>

          {/* Support hours */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-amber-700 mb-1">Support Hours</p>
              <p className="text-[14px] text-on-surface-variant">Monday – Saturday &middot; 8:00 AM – 8:00 PM WAT</p>
              <p className="text-[13px] text-on-surface-variant mt-1">We are closed on Sundays and Nigerian public holidays.</p>
            </div>
          </section>

          {/* Account deletion / data request */}
          <section className="border border-outline-variant/40 rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-on-surface">Account Deletion &amp; Data Requests</h2>
            <p className="text-[14px] text-on-surface-variant leading-relaxed">
              To delete your account or request a copy of your personal data, send an email to{' '}
              <a href="mailto:support@techsphereapp.com" className="text-primary font-semibold hover:underline">
                support@techsphereapp.com
              </a>{' '}
              with one of the following subjects:
            </p>
            <ul className="flex flex-col gap-2 mt-1">
              {[
                { subject: 'Account Deletion Request', desc: 'Permanently removes your account and all associated data. Processed within 3 business days.' },
                { subject: 'Data Request', desc: 'Receive a copy of all personal data we hold on you. Processed within 30 days per NDPR requirements.' },
              ].map((item) => (
                <li key={item.subject} className="flex items-start gap-3 bg-surface-container-low rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px' }}>label</span>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">&ldquo;{item.subject}&rdquo;</p>
                    <p className="text-[12px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        </div>

        <div className="border-t border-outline-variant/30 px-4 py-6 text-center">
          <p className="text-[12px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace — Spheralix Digital Labs. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
