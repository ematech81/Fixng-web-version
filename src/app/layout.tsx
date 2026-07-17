import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'FixNG — Find Verified Artisans Near You in Nigeria',
  description:
    'GPS-powered marketplace connecting customers with verified plumbers, electricians, lawyers, engineers and more across Nigeria.',
  keywords: 'artisan, Nigeria, plumber, electrician, carpenter, FixNG, handyman',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-on-surface overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
