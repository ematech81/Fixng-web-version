import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Terms of Service — FixNG' };

const TERMS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the FixNG platform (web or mobile), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must stop using the platform immediately.

These terms apply to all users — customers, artisans, and administrators.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years of age to create an account on FixNG. By registering, you confirm that the information you provide is accurate and that you have the legal capacity to enter into binding agreements under Nigerian law.`,
  },
  {
    title: '3. Platform Role',
    body: `FixNG is a marketplace platform. We connect customers with independent artisans and service professionals. We do not employ artisans, control their work, or guarantee the quality of services rendered.

The platform facilitates discovery, communication, and booking — all contracts for services are between the customer and the artisan directly.`,
  },
  {
    title: '4. Artisan Onboarding & Verification',
    body: `Artisans must complete the full onboarding process, including identity verification (government-issued ID) and skills declaration. Submitting false or misleading information during onboarding is grounds for immediate account suspension or permanent ban.

Verification status is reviewed by our team within 24–48 hours. We reserve the right to reject any application without explanation.`,
  },
  {
    title: '5. Pro Subscription',
    body: `Pro status is granted either through an active paid subscription or by admin decision. Subscription plans are billed on a monthly, quarterly, or yearly basis via Kora Pay.

Subscriptions auto-renew unless cancelled before the renewal date. Refunds are not available for partially used subscription periods except where required by Nigerian consumer law. FixNG reserves the right to change subscription pricing with 30 days' notice.`,
  },
  {
    title: '6. Payments',
    body: `FixNG does not process payments between customers and artisans. All service fees are agreed directly between the parties. FixNG is not liable for any payment disputes, non-payment, or fraud between users.

Platform subscription payments are processed securely via Kora Pay. FixNG does not store payment card details.`,
  },
  {
    title: '7. Jobs & Disputes',
    body: `Customers may raise a dispute from the Job Detail page within 72 hours of a job being marked complete. Our team reviews all disputes within 24 hours and makes a determination based on available evidence (messages, reviews, job history).

FixNG's decision on disputes is final within the platform. This does not limit any legal rights you may have under Nigerian law.`,
  },
  {
    title: '8. Prohibited Conduct',
    body: `Users must not:
• Provide false identity or skills information
• Use the platform to facilitate illegal transactions
• Harass, threaten, or abuse other users
• Attempt to circumvent platform protections or charge off-platform to avoid fees
• Post fake reviews or manipulate rating systems
• Scrape, reverse-engineer, or copy the platform

Violations may result in warnings, suspension, or permanent bans.`,
  },
  {
    title: '9. Content & Reviews',
    body: `Reviews may only be submitted for verified completed jobs. By submitting a review, you confirm it is honest and based on your genuine experience. FixNG reserves the right to remove reviews that are fraudulent, abusive, or in violation of these terms.`,
  },
  {
    title: '10. Liability Limitation',
    body: `FixNG provides the platform on an "as is" basis. To the maximum extent permitted by Nigerian law, we are not liable for:
• Any loss arising from your use of the platform
• The conduct or quality of work of any artisan
• Loss of data, revenue, or business opportunity
• Service interruptions or technical failures

Our total liability to any user shall not exceed the amount paid by that user to FixNG in the 12 months preceding the claim.`,
  },
  {
    title: '11. Account Termination',
    body: `You may close your account at any time by contacting support. FixNG may suspend or permanently ban accounts that violate these terms, with or without prior notice.

Upon termination, your right to access the platform ceases immediately. Data deletion follows the process described in our Privacy Policy.`,
  },
  {
    title: '12. Changes to Terms',
    body: `We may update these terms from time to time. Significant changes will be communicated via in-app notification or email. Continued use of the platform after changes are published constitutes your acceptance of the updated terms.`,
  },
  {
    title: '13. Governing Law',
    body: `These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the jurisdiction of Nigerian courts.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary-container py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20" />
          <div className="relative z-10 container mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-on-primary-container rounded-full text-[12px] font-semibold w-fit mb-4">
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              Terms of Service
            </span>
            <h1 className="text-[36px] font-extrabold text-on-primary-container mb-3">Terms of Service</h1>
            <p className="text-[16px] text-on-primary-container/80 leading-relaxed">
              These terms govern your use of the FixNG platform. Please read them carefully before using the service.
            </p>
            <p className="text-[13px] text-on-primary-container/60 mt-4">Effective date: January 2025</p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-12 py-16 max-w-3xl flex flex-col gap-8">

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 flex-shrink-0 mt-0.5" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-[13px] text-amber-800 leading-relaxed">
              By using FixNG, you agree to these terms. If you are using the platform on behalf of a business,
              you also agree on behalf of that business and confirm you have authority to do so.
            </p>
          </div>

          {/* Terms sections */}
          {TERMS.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-[17px] font-bold text-on-surface">{section.title}</h2>
              <p className="text-[14px] text-on-surface-variant leading-relaxed whitespace-pre-line">{section.body}</p>
              <hr className="border-outline-variant/20" />
            </section>
          ))}

          {/* Contact */}
          <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <h2 className="text-[17px] font-bold text-on-surface mb-2">Questions About These Terms?</h2>
            <p className="text-[14px] text-on-surface-variant">
              Contact us at{' '}
              <a href="mailto:support@techsphereapp.com" className="text-primary font-semibold hover:underline">
                support@techsphereapp.com
              </a>
              . We are happy to clarify any part of these terms.
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
