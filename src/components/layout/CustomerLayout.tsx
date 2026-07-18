'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const sidebarNav = [
  { href: '/customer/dashboard',      icon: 'dashboard',      label: 'Home'     },
  { href: '/search',                   icon: 'explore',         label: 'Explore'  },
  { href: '/customer/jobs',            icon: 'work_history',    label: 'My Jobs'  },
  { href: '/customer/messages',        icon: 'chat_bubble',     label: 'Messages' },
  { href: '/customer/notifications',   icon: 'notifications',   label: 'Alerts'   },
];

const mobileNav = [
  { href: '/customer/dashboard', icon: 'home',         label: 'Home'    },
  { href: '/search',              icon: 'search',       label: 'Search'  },
  { href: '/customer/jobs',       icon: 'work_history', label: 'Jobs'    },
  { href: '/customer/profile',    icon: 'person',       label: 'Profile' },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, artisanProfile, logout } = useAuth();

  const profilePhoto = (artisanProfile as { profilePhoto?: string } | null)?.profilePhoto ?? null;
  const firstName    = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/customer/dashboard" className="text-[20px] leading-7 font-extrabold text-primary">
            FixNG
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/customer/dashboard"
              className={`text-[14px] font-medium pb-1 transition-colors ${
                pathname === '/customer/dashboard'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Find Artisans
            </Link>
            <Link
              href="/customer/jobs"
              className={`text-[14px] font-medium pb-1 transition-colors ${
                pathname.startsWith('/customer/jobs')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              My Jobs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/notifications" className="relative p-2">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
              notifications
            </span>
          </Link>
          <Link href="/customer/profile">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-surface-container-high overflow-hidden shadow-sm">
              {profilePhoto ? (
                <Image src={profilePhoto} alt={user?.name ?? ''} fill className="object-cover" sizes="40px" />
              ) : (
                <span className="text-[14px] font-black text-primary">{getInitials(user?.name ?? 'U')}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">

        {/* ── Desktop sidebar ──────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-surface-container-low px-4 py-8 border-r border-outline-variant/30">
          <div className="flex flex-col gap-2 flex-1">
            {sidebarNav.map(({ href, icon, label }) => {
              const active = href === '/search'
                ? pathname === '/search'
                : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {icon}
                  </span>
                  <span className="text-[14px]">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/customer/profile"
              className="flex items-center gap-4 p-4 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-[14px]">Settings</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-4 p-4 text-error hover:bg-error-container rounded-xl transition-all w-full text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-[14px]">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 md:ml-64 w-full bg-surface pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-outline-variant/30 flex items-center justify-around z-50 px-4">
        {mobileNav.map(({ href, icon, label }) => {
          const active = href === '/customer/dashboard'
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
