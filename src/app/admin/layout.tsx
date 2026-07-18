'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin/dashboard', icon: 'dashboard',   label: 'Dashboard' },
  { href: '/admin/artisans',  icon: 'handyman',    label: 'Artisans'  },
  { href: '/admin/users',     icon: 'group',       label: 'Users'     },
  { href: '/admin/jobs',      icon: 'work',        label: 'Jobs'      },
  { href: '/admin/search',    icon: 'search',      label: 'Search'    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (!loading && user && user.role !== 'admin') {
      router.replace(user.role === 'artisan' ? '/artisan/dashboard' : '/customer/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 fixed top-0 bottom-0 left-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-40">
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/20">
          <span className="text-[20px] font-black text-primary">FixNG</span>
          <span className="ml-2 bg-error text-on-error text-[10px] font-black px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[14px] ${active ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'}`}>
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 pb-6">
          <div className="px-4 py-3 mb-2 rounded-xl">
            <p className="text-[13px] font-bold text-on-surface">{user.name}</p>
            <p className="text-[12px] text-outline">{user.phone}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-xl transition-all w-full text-left text-[14px]">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 border-b border-outline-variant/20 bg-white flex items-center px-8 sticky top-0 z-30">
          <p className="text-[14px] font-semibold text-on-surface-variant">
            {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.label ?? 'Admin'}
          </p>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
