'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const sidebarNav = [
  { href: '/artisan/dashboard',      icon: 'dashboard',      label: 'Dashboard'   },
  { href: '/artisan/jobs',           icon: 'work_history',   label: 'My Jobs'     },
  { href: '/artisan/messages',       icon: 'chat_bubble',    label: 'Messages'    },
  { href: '/artisan/earnings',       icon: 'payments',       label: 'Earnings'    },
  { href: '/artisan/notifications',  icon: 'notifications',  label: 'Alerts'      },
  { href: '/artisan/upgrade',        icon: 'workspace_premium', label: 'Go Pro'   },
];

const mobileNav = [
  { href: '/artisan/dashboard', icon: 'home',       label: 'Home'    },
  { href: '/artisan/jobs',      icon: 'work',       label: 'Jobs'    },
  { href: '/artisan/messages',  icon: 'chat_bubble',label: 'Chat'    },
  { href: '/artisan/earnings',  icon: 'payments',   label: 'Earnings'},
  { href: '/artisan/profile',   icon: 'person',     label: 'Profile' },
];

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const pathname        = usePathname();
  const { user, artisanProfile, logout } = useAuth();

  const profilePhoto = (artisanProfile as { profilePhoto?: string } | null)?.profilePhoto ?? null;
  const isPro        = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Top header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/artisan/dashboard" className="text-[20px] font-extrabold text-primary flex items-center gap-1">
            FixNG
            {isPro && <span className="text-[10px] font-black bg-secondary text-on-secondary px-1.5 py-0.5 rounded-full ml-1">PRO</span>}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: '/artisan/dashboard', label: 'Dashboard' },
              { href: '/artisan/jobs',      label: 'My Jobs'   },
              { href: '/artisan/earnings',  label: 'Earnings'  },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className={`text-[14px] font-medium pb-1 transition-colors ${pathname === href || pathname.startsWith(href + '/') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/artisan/notifications" className="p-2">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</span>
          </Link>
          <Link href="/artisan/profile">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-surface-container-high overflow-hidden shadow-sm">
              {profilePhoto ? (
                <Image src={profilePhoto} alt={user?.name ?? ''} fill className="object-cover" sizes="40px" />
              ) : (
                <span className="text-[14px] font-black text-primary">{getInitials(user?.name ?? 'A')}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-surface-container-low px-4 py-8 border-r border-outline-variant/30">
          <div className="flex flex-col gap-2 flex-1">
            {sidebarNav.map(({ href, icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${active ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'}`}>
                  <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
                  <span className="text-[14px]">{label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <Link href="/artisan/profile" className="flex items-center gap-4 p-4 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all">
              <span className="material-symbols-outlined">manage_accounts</span>
              <span className="text-[14px]">Profile</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-4 p-4 text-error hover:bg-error-container rounded-xl transition-all w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-[14px]">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className="flex-1 md:ml-64 w-full bg-surface pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-outline-variant/30 flex items-center justify-around z-50 px-2">
        {mobileNav.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/artisan/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
