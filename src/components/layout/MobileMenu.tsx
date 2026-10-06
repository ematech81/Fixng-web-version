'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

export type MenuVariant = 'artisan' | 'customer' | 'admin';

interface Item {
  href: string;
  icon: string;
  label: string;
  badge?: boolean;   // show the unread notification count
  accent?: boolean;
}

// Mirrors each role's desktop sidebar (a superset of the dashboard bottom-nav tabs),
// with Notifications and its unread badge.
function buildItems(variant: MenuVariant, hasArtisanProfile: boolean): { main: Item[]; more: Item[] } {
  if (variant === 'admin') {
    return { main: [{ href: '/admin/dashboard', icon: 'dashboard', label: 'Admin Dashboard' }], more: [] };
  }
  if (variant === 'artisan') {
    return {
      main: [
        { href: '/artisan/dashboard',     icon: 'home',              label: 'Home'          },
        { href: '/artisan/jobs',          icon: 'work_history',      label: 'My Jobs'       },
        { href: '/artisan/messages',      icon: 'chat_bubble',       label: 'Messages'      },
        { href: '/artisan/earnings',      icon: 'payments',          label: 'Earnings'      },
        { href: '/artisan/notifications', icon: 'notifications',     label: 'Notifications', badge: true },
        { href: '/artisan/reviews',       icon: 'star',              label: 'My Reviews'    },
        { href: '/artisan/upgrade',       icon: 'workspace_premium', label: 'Go Pro'        },
      ],
      more: [
        { href: '/customer/dashboard', icon: 'search',          label: 'Find Artisans', accent: true },
        { href: '/artisan/profile',    icon: 'manage_accounts', label: 'Profile'  },
        { href: '/artisan/settings',   icon: 'settings',        label: 'Settings' },
      ],
    };
  }
  return {
    main: [
      { href: '/customer/dashboard',     icon: 'home',          label: 'Home'          },
      { href: '/search',                 icon: 'explore',       label: 'Explore'       },
      { href: '/customer/jobs',          icon: 'work_history',  label: 'My Jobs'       },
      { href: '/customer/messages',      icon: 'chat_bubble',   label: 'Messages'      },
      { href: '/customer/notifications', icon: 'notifications', label: 'Notifications', badge: true },
      { href: '/customer/reviews',       icon: 'star',          label: 'My Reviews'    },
    ],
    more: [
      hasArtisanProfile
        ? { href: '/artisan/dashboard',         icon: 'handyman', label: 'Artisan Dashboard', accent: true }
        : { href: '/customer/become-artisan',   icon: 'handyman', label: 'Become Artisan',    accent: true },
      { href: '/customer/profile',  icon: 'manage_accounts', label: 'Profile'  },
      { href: '/customer/settings', icon: 'settings',        label: 'Settings' },
    ],
  };
}

/**
 * Hamburger button + slide-in side menu for signed-in users on small screens.
 * Renders nothing for guests or on md+ (desktop uses its sidebar/header).
 */
export default function MobileMenu({ variant }: { variant: MenuVariant }) {
  const { user, artisanProfile, logout } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadNotifications();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  // Lock page scroll and allow Escape to close while the menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const { main, more } = buildItems(variant, !!artisanProfile);
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  const renderItem = ({ href, icon, label, badge, accent }: Item) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] transition-colors ${
          accent
            ? 'bg-primary text-on-primary font-bold'
            : active
              ? 'bg-primary-container text-on-primary-container font-semibold'
              : 'text-on-surface hover:bg-surface-container'
        }`}
      >
        <span className="material-symbols-outlined" style={active || accent ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
        <span className="flex-1">{label}</span>
        {badge && unread > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-error text-white text-[11px] font-black flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>
    );
  };

  const drawer = (
    <div className="md:hidden fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 bottom-0 w-72 max-w-[85%] bg-surface shadow-2xl flex flex-col" role="dialog" aria-label="Menu">
        <div className="flex items-center justify-between px-4 h-16 border-b border-outline-variant/30 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[15px] font-black text-on-surface truncate">{user.name}</p>
            <p className="text-[12px] text-on-surface-variant truncate">{user.phone}</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {main.map(renderItem)}
          {more.length > 0 && <div className="my-2 border-t border-outline-variant/30" />}
          {more.map(renderItem)}
        </nav>

        <div className="px-3 py-3 border-t border-outline-variant/30 flex-shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-error hover:bg-error-container transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden relative p-2 text-on-surface-variant"
      >
        <span className="material-symbols-outlined">menu</span>
        {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface" />}
      </button>
      {/* Portal so the drawer escapes the fixed header's stacking context (and sits above the bottom nav) */}
      {open && mounted && createPortal(drawer, document.body)}
    </>
  );
}
