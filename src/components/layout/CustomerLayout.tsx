'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import api from '@/lib/api';

const sidebarNav = [
  { href: '/customer/dashboard',    icon: 'dashboard',    label: 'Home'       },
  { href: '/search',                icon: 'explore',      label: 'Explore'    },
  { href: '/customer/jobs',         icon: 'work_history', label: 'My Jobs'    },
  { href: '/customer/messages',     icon: 'chat_bubble',  label: 'Messages'   },
  { href: '/customer/reviews',      icon: 'star',         label: 'My Reviews' },
  { href: '/customer/notifications',icon: 'notifications',label: 'Alerts'     },
];

const mobileNav = [
  { href: '/customer/dashboard', icon: 'home',         label: 'Home'    },
  { href: '/search',             icon: 'search',       label: 'Search'  },
  { href: '/customer/jobs',      icon: 'work_history', label: 'Jobs'    },
  { href: '/customer/profile',   icon: 'person',       label: 'Profile' },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, artisanProfile, logout } = useAuth();

  const [collapsed,     setCollapsed]     = useState(false);
  const [unreadNotifs,  setUnreadNotifs]  = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem('customer-sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* private browsing */ }
  }, []);

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then((r) => setUnreadNotifs(r.data.count ?? r.data.unreadCount ?? 0))
      .catch(() => {});
  }, [pathname]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('customer-sidebar-collapsed', String(next)); } catch { /* */ }
  };

  const profilePhoto = (artisanProfile as { profilePhoto?: string } | null)?.profilePhoto ?? null;
  const sideW        = collapsed ? 'w-16' : 'w-64';
  const mainML       = collapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="text-[20px] leading-7 font-extrabold text-primary">
            {collapsed ? 'F' : 'FixNG'}
          </Link>
          {!collapsed && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/customer/dashboard"
                className={`text-[14px] font-medium pb-1 transition-colors ${pathname === '/customer/dashboard' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                Dashboard
              </Link>
              <Link href="/search"
                className="text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
                Find Artisans
              </Link>
              <Link href="/customer/jobs"
                className={`text-[14px] font-medium pb-1 transition-colors ${pathname.startsWith('/customer/jobs') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                My Jobs
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/notifications" className="relative p-2" onClick={() => setUnreadNotifs(0)}>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</span>
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                {unreadNotifs > 99 ? '99+' : unreadNotifs}
              </span>
            )}
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
              const active = href === '/search'
                ? pathname === '/search'
                : pathname === href || pathname.startsWith(href + '/');
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
            {/* Become Artisan — highlighted CTA */}
            <Link href="/customer/become-artisan"
              title={collapsed ? 'Become Artisan' : undefined}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-[14px] ${collapsed ? 'justify-center' : ''}`}
              style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff' }}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                handyman
              </span>
              {!collapsed && <span>Become Artisan</span>}
            </Link>

            <Link href="/customer/profile"
              title={collapsed ? 'Profile' : undefined}
              className={`flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined flex-shrink-0">manage_accounts</span>
              {!collapsed && <span className="text-[14px]">Profile</span>}
            </Link>
            <Link href="/customer/settings"
              title={collapsed ? 'Settings' : undefined}
              className={`flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined flex-shrink-0">settings</span>
              {!collapsed && <span className="text-[14px]">Settings</span>}
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

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className={`flex-1 ${mainML} w-full bg-surface pb-20 md:pb-0 transition-all duration-200`}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-outline-variant/30 flex items-center justify-around z-50 px-4">
        {mobileNav.map(({ href, icon, label }) => {
          const active = href === '/customer/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}
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
