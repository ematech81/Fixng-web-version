import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Privacy Policy — FixNG' };

const SECTIONS = [
  {
    icon: '🔐',
    title: 'Account Security',
    items: [
      {
        icon: '📱',
        label: 'Phone Number',
        body: 'Your phone number is used solely for login and OTP verification. To update your registered phone number, contact our support team at support@techsphereapp.com with your account details.',
      },
      {
        icon: '🔑',
        label: 'Two-Factor Authentication',
        body: 'Every FixNG account is protected by SMS OTP verification on every login. This protection cannot be disabled and is applied automatically to keep your account secure.',
      },
      {
        icon: '🚪',
        label: 'Active Sessions',
        body: 'If you believe your account is compromised, log out immediately and contact support. Active session management will be available in a future update.',
      },
    ],
  },
  {
    icon: '👁️',
    title: 'Privacy',
    items: [
      {
        icon: '👤',
        label: 'Profile Visibility',
        body: 'Your profile name, skills, and job history are visible to other users on FixNG. Artisan profiles are publicly visible to customers searching for services. Customer profiles are only visible to artisans involved in shared jobs.',
      },
      {
        icon: '📍',
        label: 'Location Sharing',
        body: 'Your location is only used for job matching and artisan discovery. It is not shared with third parties. You can revoke location permissions at any time in your device or browser settings.',
      },
      {
        icon: '💬',
        label: 'Chat Privacy',
        body: 'All chat messages are visible only to the customer and artisan involved in the same job. FixNG staff may review messages to resolve disputes or investigate platform abuse.',
      },
    ],
  },
  {
    icon: '🗂️',
    title: 'Data & Account',
    items: [
      {
        icon: '📦',
        label: 'Download My Data',
        body: 'To request a copy of all your personal data, email support@techsphereapp.com with the subject "Data Request" and include your registered phone number. We will respond within 30 days as required by NDPR.',
      },
      {
        icon: '🗑️',
        label: 'Account Deletion',
        body: 'You may request permanent deletion of your account and all associated data by emailing support@techsphereapp.com with the subject "Account Deletion Request". This action is irreversible. We process requests within 3 business days.',
        danger: true,
      },
    ],
  },
  {
    icon: '⚖️',
    title: 'Legal & Compliance',
    items: [
      {
        icon: '📄',
        label: 'NDPR Compliance',
        body: 'FixNG processes all personal data in full compliance with the Nigeria Data Protection Regulation (NDPR) 2019. You have the right to access, correct, port, restrict processing of, and delete your personal data at any time.',
      },
      {
        icon: '🛡️',
        label: 'Data Retention',
        body: 'We retain your personal data for as long as your account is active, or as required by Nigerian law. When an account is deleted, personal data is erased within 30 days except where retention is legally required.',
      },
      {
        icon: '🌐',
        label: 'Third-Party Services',
        body: 'FixNG uses third-party services including payment gateways (Kora Pay) and cloud infrastructure. These providers are bound by their own data protection policies and are selected for GDPR/NDPR compatibility.',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 container mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mb-4">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Privacy Policy
            </span>
            <h1 className="text-[36px] font-extrabold text-on-primary-container mb-3">Your privacy matters</h1>
            <p className="text-[16px] text-on-primary-container/80 leading-relaxed max-w-xl">
              FixNG protects your data in line with the Nigeria Data Protection Regulation (NDPR) 2019.
              This policy explains what we collect, how we use it, and your rights.
            </p>
            <p className="text-[13px] text-on-primary-container/60 mt-4">Last updated: January 2025</p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 max-w-3xl flex flex-col gap-10">

          {/* NDPR badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-[28px]">🇳🇬</span>
            <div>
              <p className="text-[14px] font-bold text-blue-700 mb-1">NDPR Compliant</p>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                FixNG is built in compliance with the Nigeria Data Protection Regulation (NDPR) 2019 as issued
                by the National Information Technology Development Agency (NITDA). Your rights as a data subject
                are respected and enforceable.
              </p>
            </div>
          </div>

          {/* Data we collect */}
          <section>
            <h2 className="text-[20px] font-bold text-on-surface mb-4">What Data We Collect</h2>
            <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden divide-y divide-outline-variant/20">
              {[
                { label: 'Phone Number', desc: 'Used for account creation, login, and OTP verification.' },
                { label: 'Name & Profile Photo', desc: 'Used to identify you on the platform and display your public profile.' },
                { label: 'Location', desc: 'Used to match you with nearby artisans. Not stored permanently.' },
                { label: 'Skills & Work History', desc: 'Artisan-provided information displayed on your public profile.' },
                { label: 'Job Data', desc: 'Details of jobs created, accepted, and completed on the platform.' },
                { label: 'Chat Messages', desc: 'Stored to support dispute resolution and customer protection.' },
                { label: 'Verification Documents', desc: 'Government-issued ID uploaded during artisan onboarding. Stored securely and reviewed only by FixNG staff.' },
              ].map((item) => (
                <div key={item.label} className="px-5 py-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>circle</span>
                  <div>
                    <p className="text-[14px] font-bold text-on-surface">{item.label}</p>
                    <p className="text-[13px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sections */}
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[20px]">{section.icon}</span>
                <h2 className="text-[18px] font-bold text-on-surface uppercase tracking-wide text-[13px]">{section.title}</h2>
              </div>
              <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden divide-y divide-outline-variant/20">
                {section.items.map((item) => (
                  <div key={item.label} className="px-5 py-5 flex items-start gap-4">
                    <span className="text-[22px] flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className={`text-[14px] font-bold mb-1 ${'danger' in item && item.danger ? 'text-red-600' : 'text-on-surface'}`}>
                        {item.label}
                      </p>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Contact */}
          <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <h2 className="text-[17px] font-bold text-on-surface mb-2">Questions About Your Privacy?</h2>
            <p className="text-[14px] text-on-surface-variant mb-4">
              Contact our Data Protection Officer at{' '}
              <a href="mailto:support@techsphereapp.com" className="text-primary font-semibold hover:underline">
                support@techsphereapp.com
              </a>
              . We respond to all data-related requests within the timeframes required by the NDPR.
            </p>
          </section>

        </div>

        <div className="border-t border-outline-variant/30 px-4 py-6 text-center">
          <p className="text-[12px] text-on-surface-variant">© 2025 FixNG Artisan Marketplace — Spheralix Digital Labs. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
