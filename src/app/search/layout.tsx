import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Artisans & Professionals — FixNG',
  description:
    'Search for verified artisans and service professionals near you across all 36 Nigerian states. Filter by skill, location, rating, and more.',
  openGraph: {
    title: 'Search Artisans — FixNG',
    description: 'Find verified plumbers, electricians, lawyers, engineers and more near you.',
    type: 'website',
    locale: 'en_NG',
    siteName: 'FixNG',
  },
  twitter: {
    card: 'summary',
    title: 'Find Artisans — FixNG',
    description: 'Search verified professionals across Nigeria on FixNG.',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
