'use client';

import { useState } from 'react';

export const FAQS = [
  {
    q: 'How do I book an artisan?',
    a: 'Browse the homepage or use the Search page to filter by skill and location. Click an artisan card, then click "Book Now" to send a booking request.',
  },
  {
    q: 'How does payment work?',
    a: 'FixNG does not process payments directly. Once an artisan accepts your request, agree on payment with them directly. We recommend confirming the price before work begins.',
  },
  {
    q: 'What does "Pro Artisan" mean?',
    a: 'Pro artisans are subscribed members who have completed identity and skill verification. They receive priority placement in search results and carry a verified Pro badge.',
  },
  {
    q: 'How do I become a verified artisan?',
    a: 'Register an account, then navigate to your dashboard and start the onboarding process. You will upload a profile photo, list your skills, set your location, provide a verification ID, and optionally a skill video. Our team reviews submissions within 24–48 hours.',
  },
  {
    q: 'What happens if an artisan does not show up?',
    a: 'After a job is marked complete, you can leave a review. If you have a dispute, open the Job Detail page and use the "Raise Dispute" option. Our team reviews all disputes within 24 hours.',
  },
  {
    q: 'How do I cancel a job request?',
    a: 'Go to My Jobs, open the job, and click "Cancel Request" — available as long as the artisan has not yet accepted. Once accepted, reach out to the artisan directly via chat to cancel.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. Email us at support@techsphereapp.com with the subject "Account Deletion Request" and include your registered phone number. We process requests within 3 business days.',
  },
  {
    q: 'How do I upgrade to a Pro plan?',
    a: 'Go to your artisan dashboard and click "Go Pro" or visit the Upgrade page. Choose from monthly, quarterly, or yearly plans. Your Pro badge activates immediately after payment is confirmed.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-outline-variant/30 rounded-2xl border border-outline-variant/30 overflow-hidden bg-white">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-container-low transition-colors"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-[15px] font-bold text-on-surface pr-4">{faq.q}</span>
            <span
              className="material-symbols-outlined text-primary flex-shrink-0 transition-transform duration-200"
              style={{ fontSize: '20px', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-5 text-[14px] text-on-surface-variant leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
