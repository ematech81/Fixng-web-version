'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const sidebarNav = [
  { href: '/artisan/dashboard',     icon: 'dashboard',         label: 'Dashboard' },
  { href: '/artisan/jobs',          icon: 'work_history',      label: 'My Jobs'   },
  { href: '/artisan/messages',      icon: 'chat_bubble',       label: 'Messages'  },
  { href: '/artisan/earnings',      icon: 'payments',          label: 'Earnings'  },
  { href: '/artisan/notifications', icon: 'notifications',     label: 'Alerts'    },
  { href: '/artisan/upgrade',       icon: 'workspace_premium', label: 'Go Pro'    },
];

const mobileNav = [
  { href: '/artisan/dashboard', icon: 'home',        label: 'Home'    },
  { href: '/artisan/jobs',      icon: 'work',        label: 'Jobs'    },
  { href: '/artisan/messages',  icon: 'chat_bubble', label: 'Chat'    },
  { href: '/artisan/earnings',  icon: 'payments',    label: 'Earnings'},
  { href: '/artisan/profile',   icon: 'person',      label: 'Profile' },
];

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, artisanProfile, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('artisan-sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* private browsing */ }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('artisan-sidebar-collapsed', String(next)); } catch { /* */ }
  };

  const profilePhoto = (artisanProfile as { profilePhoto?: string } | null)?.profilePhoto ?? null;
  const isPro        = (artisanProfile as { isPro?: boolean } | null)?.isPro ?? false;
  const sideW        = collapsed ? 'w-16' : 'w-64';
  const mainML       = collapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Top header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/artisan/dashboard" className="text-[20px] font-extrabold text-primary flex items-center gap-1">
            {collapsed ? 'F' : 'FixNG'}
            {!collapsed && isPro && (
              <span className="text-[10px] font-black bg-secondary text-on-secondary px-1.5 py-0.5 rounded-full ml-1">PRO</span>
            )}
          </Link>
          {!collapsed && (
            <nav className="hidden md:flex items-center gap-6">
              {[
                { href: '/artisan/dashboard', label: 'Dashboard' },
                { href: '/artisan/jobs',      label: 'My Jobs'   },
                { href: '/artisan/earnings',  label: 'Earnings'  },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`text-[14px] font-medium pb-1 transition-colors ${pathname === href || pathname.startsWith(href + '/') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                  {label}
                </Link>
              ))}
            </nav>
          )}
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
        <aside className={`hidden md:flex flex-col ${sideW} fixed left-0 top-16 bottom-0 bg-surface-container-low border-r border-outline-variant/30 transition-all duration-200 z-40 overflow-hidden`}>

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center h-10 mt-3 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          <nav className="flex flex-col gap-1 flex-1 px-2 py-4">
            {sidebarNav.map(({ href, icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${collapsed ? 'justify-center' : ''} ${
                    active
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined flex-shrink-0" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {icon}
                  </span>
                  {!collapsed && <span className="text-[14px] truncate">{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 pb-4 flex flex-col gap-1">
            {/* Find Artisans — lets an artisan use the platform as a customer */}
            <Link href="/customer/dashboard"
              title={collapsed ? 'Find Artisans' : undefined}
              className={`flex items-center gap-3 p-3 bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
              {!collapsed && <span className="text-[14px] font-bold">Find Artisans</span>}
            </Link>
            <Link href="/artisan/profile"
              title={collapsed ? 'Profile' : undefined}
              className={`flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined flex-shrink-0">manage_accounts</span>
              {!collapsed && <span className="text-[14px]">Profile</span>}
            </Link>
            <button onClick={logout}
              title={collapsed ? 'Logout' : undefined}
              className={`flex items-center gap-3 p-3 text-error hover:bg-error-container rounded-xl transition-all w-full text-left ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined flex-shrink-0">logout</span>
              {!collapsed && <span className="text-[14px]">Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className={`flex-1 ${mainML} w-full bg-surface pb-20 md:pb-0 transition-all duration-200`}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-outline-variant/30 flex items-center justify-around z-50 px-2">
        {mobileNav.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/artisan/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
