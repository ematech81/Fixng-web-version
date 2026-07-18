'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  createdAt: string;
  artisanCode?: string;
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('all');
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (role !== 'all') params.role = role;

    api.get('/api/admin/users', { params })
      .then((r) => { setUsers(r.data.data ?? r.data.users ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => { setUsers([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Users</h1>
          <p className="text-[14px] text-on-surface-variant">{total} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {['all', 'customer', 'artisan', 'admin'].map((r) => (
          <button key={r} onClick={() => { setRole(r); setPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all capitalize ${role === r ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
            {r === 'all' ? 'All Roles' : r}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2 block">group</span>
            <p className="text-[16px] font-bold text-on-surface">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Artisan Code</th>
                  <th className="px-5 py-3 text-left text-[12px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="text-[13px] font-black text-primary">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{u.name}</p>
                          {u.email && <p className="text-[12px] text-outline">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-on-surface-variant">{u.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${u.role === 'artisan' ? 'bg-secondary-container text-on-secondary-container' : u.role === 'admin' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {u.artisanCode ? <span className="text-[12px] font-mono text-on-surface-variant">{u.artisanCode}</span> : <span className="text-[12px] text-outline">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-[12px] text-outline">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-[13px] text-on-surface-variant">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-outline-variant text-[13px] font-medium disabled:opacity-40 hover:bg-surface-container transition-all">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-outline-variant text-[13px] font-medium disabled:opacity-40 hover:bg-surface-container transition-all">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
