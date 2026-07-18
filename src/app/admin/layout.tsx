'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/artisans',  icon: 'handyman',  label: 'Artisans'  },
  { href: '/admin/users',     icon: 'group',     label: 'Users'     },
  { href: '/admin/jobs',      icon: 'work',      label: 'Jobs'      },
  { href: '/admin/search',    icon: 'search',    label: 'Search'    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('admin-sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* */ }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('admin-sidebar-collapsed', String(next)); } catch { /* */ }
  };

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

  const sideW  = collapsed ? 'w-16' : 'w-64';
  const mainML = collapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Sidebar */}
      <aside className={`${sideW} flex-shrink-0 fixed top-0 bottom-0 left-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-40 transition-all duration-200 overflow-hidden`}>
        <div className="h-16 flex items-center px-4 border-b border-outline-variant/20 gap-2">
          {!collapsed && (
            <>
              <span className="text-[20px] font-black text-primary">FixNG</span>
              <span className="bg-error text-on-error text-[10px] font-black px-2 py-0.5 rounded-full">Admin</span>
            </>
          )}
          {collapsed && <span className="text-[20px] font-black text-primary mx-auto">F</span>}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center h-10 mt-2 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-[14px] ${collapsed ? 'justify-center' : ''} ${
                  active
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined flex-shrink-0" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4">
          {!collapsed && (
            <div className="px-3 py-2 mb-1 rounded-xl">
              <p className="text-[13px] font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[12px] text-outline truncate">{user.phone}</p>
            </div>
          )}
          <button onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 p-3 text-error hover:bg-error-container rounded-xl transition-all w-full text-left ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined flex-shrink-0">logout</span>
            {!collapsed && <span className="text-[14px]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${mainML} min-h-screen transition-all duration-200`}>
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
