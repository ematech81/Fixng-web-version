'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, artisanProfile } = useAuth();
  const isPro = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardHref =
    user?.role === 'admin'    ? '/admin/dashboard'    :
    user?.role === 'artisan'  ? '/artisan/dashboard'  :
    user?.role === 'customer' ? '/customer/dashboard' : null;

  return (
    <header
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* Logo + nav links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-[20px] leading-7 font-extrabold text-primary">
          FixNG
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/search"
            className="text-[14px] font-medium text-primary border-b-2 border-primary pb-1 transition-colors"
          >
            Find Artisans
          </Link>
          {/* Show "Join as Pro" only when not logged in; non-Pro artisans see "Go Pro" */}
          {!user && (
            <Link href="/register" className="text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
              Join as Pro
            </Link>
          )}
          {user?.role === 'artisan' && !isPro && (
            <Link href="/artisan/upgrade" className="text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
              Go Pro
            </Link>
          )}
        </nav>
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-4">
        {user && dashboardHref ? (
          <Link
            href={dashboardHref}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg text-[14px] font-medium hover:scale-95 duration-100 shadow-sm"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden md:block text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors px-4 py-1"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary text-on-primary px-6 py-2 rounded-lg text-[14px] font-medium hover:scale-95 duration-100 shadow-sm"
            >
              Register
            </Link>
          </>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-on-surface-variant"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-surface shadow-lg border-t border-outline-variant/30 flex flex-col gap-1 px-4 py-4 md:hidden">
          <Link href="/search" className="py-3 text-[14px] font-medium text-on-surface border-b border-outline-variant/20" onClick={() => setMenuOpen(false)}>Find Artisans</Link>
          {!user && (
            <Link href="/register" className="py-3 text-[14px] font-medium text-on-surface border-b border-outline-variant/20" onClick={() => setMenuOpen(false)}>Join as Pro</Link>
          )}
          {user?.role === 'artisan' && !isPro && (
            <Link href="/artisan/upgrade" className="py-3 text-[14px] font-medium text-on-surface border-b border-outline-variant/20" onClick={() => setMenuOpen(false)}>Go Pro</Link>
          )}
          {!user && (
            <Link href="/login" className="py-3 text-[14px] font-medium text-on-surface" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
