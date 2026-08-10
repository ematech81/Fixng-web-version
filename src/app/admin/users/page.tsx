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
  isPro?: boolean;
  isSuspended?: boolean;
  isActive?: boolean;
  artisanId?: string;
}

type ModalAction = 'warn-customer' | 'suspend-customer';

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('all');
  const limit = 25;

  const [acting, setActing] = useState<string | null>(null);
  const [toast,  setToast]  = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Reason modal (warn / suspend)
  const [modal,   setModal]   = useState<{ userId: string; action: ModalAction; label: string } | null>(null);
  const [reason,  setReason]  = useState('');
  const [modalBusy, setModalBusy] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (role !== 'all') params.role = role;

    api.get('/api/admin/users', { params })
      .then((r) => {
        setUsers(r.data.data ?? r.data.users ?? []);
        setTotal(r.data.total ?? 0);
      })
      .catch(() => { setUsers([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  // Generic user action (toggle-active, unsuspend-customer, grant-pro, revoke-pro)
  const doUserAction = async (userId: string, endpoint: string, body: Record<string, unknown> = {}) => {
    setActing(userId + endpoint);
    try {
      await api.post(`/api/admin/users/${userId}/${endpoint}`, body);
      showToast('Action applied.');
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setActing(null); }
  };

  // Artisan pro via artisan endpoint
  const doArtisanPro = async (artisanId: string, grant: boolean) => {
    const key = artisanId + (grant ? 'grant' : 'revoke');
    setActing(key);
    try {
      await api.post(`/api/admin/artisans/${artisanId}/${grant ? 'grant-pro' : 'revoke-pro'}`, {});
      showToast(grant ? 'PRO granted.' : 'PRO revoked.');
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setActing(null); }
  };

  const openModal = (userId: string, action: ModalAction, label: string) => {
    setModal({ userId, action, label });
    setReason('');
  };

  const submitModal = async () => {
    if (!reason.trim()) { showToast('Please enter a reason.', 'err'); return; }
    if (!modal) return;
    setModalBusy(true);
    const endpointMap: Record<ModalAction, string> = {
      'warn-customer':    'warn',
      'suspend-customer': 'suspend',
    };
    try {
      await api.post(`/api/admin/users/${modal.userId}/${endpointMap[modal.action]}`, { reason: reason.trim() });
      showToast(`${modal.label} applied.`);
      setModal(null);
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setModalBusy(false); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-[14px] font-semibold text-white transition-all ${toast.type === 'ok' ? 'bg-[#006229]' : 'bg-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Reason modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[18px] font-black text-on-surface mb-1">{modal.label}</h3>
            <p className="text-[13px] text-on-surface-variant mb-4">This reason will be sent to the user.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason…"
              rows={3}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              disabled={modalBusy}
            />
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} disabled={modalBusy}
                className="flex-1 py-3 border border-outline-variant rounded-2xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={submitModal} disabled={modalBusy}
                className={`flex-1 py-3 text-white rounded-2xl text-[14px] font-bold transition-all disabled:opacity-60 ${modal.action === 'suspend-customer' ? 'bg-error' : 'bg-[#b45309]'}`}>
                {modalBusy ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : modal.label}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="divide-y divide-outline-variant/20">
            {users.map((u) => {
              const busy = acting?.startsWith(u._id) || acting?.startsWith(u.artisanId ?? '$$');
              return (
                <div key={u._id} className={`px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 transition-colors ${u.isActive === false ? 'bg-error-container/10' : 'hover:bg-surface-container-low'}`}>
                  {/* Identity */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-[14px] font-black text-primary">{u.name?.[0]?.toUpperCase()}</span>
                      {u.isActive === false && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>block</span>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-on-surface text-[14px]">{u.name}</p>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${u.role === 'artisan' ? 'bg-secondary-container text-on-secondary-container' : u.role === 'admin' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span>
                        {u.isPro && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PRO</span>}
                        {u.isSuspended && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-error-container text-error">Suspended</span>}
                        {u.isActive === false && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-error text-white">Disabled</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[12px] text-outline">
                        <span>{u.phone}</span>
                        {u.artisanCode && <><span>·</span><span className="font-mono">{u.artisanCode}</span></>}
                        <span>·</span><span>{formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Toggle account active/disabled */}
                    <button
                      onClick={() => doUserAction(u._id, 'toggle-active')}
                      disabled={!!busy}
                      title={u.isActive === false ? 'Enable account' : 'Disable account'}
                      className={`p-2 rounded-lg border text-[12px] font-bold transition-all disabled:opacity-40 ${u.isActive === false ? 'border-[#006229] text-[#006229] hover:bg-[#d1fae5]' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{u.isActive === false ? 'check_circle' : 'block'}</span>
                    </button>

                    {/* Customer-specific: Warn, Suspend/Unsuspend */}
                    {u.role === 'customer' && (
                      <>
                        <button
                          onClick={() => openModal(u._id, 'warn-customer', 'Warn Customer')}
                          disabled={!!busy}
                          className="px-3 py-1.5 border border-amber-400 text-amber-700 rounded-lg text-[12px] font-bold hover:bg-amber-50 transition-all disabled:opacity-40">
                          Warn
                        </button>
                        {u.isSuspended ? (
                          <button
                            onClick={() => doUserAction(u._id, 'unsuspend')}
                            disabled={!!busy}
                            className="px-3 py-1.5 border border-tertiary text-tertiary rounded-lg text-[12px] font-bold hover:bg-tertiary-container transition-all disabled:opacity-40">
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal(u._id, 'suspend-customer', 'Suspend Customer')}
                            disabled={!!busy}
                            className="px-3 py-1.5 border border-error text-error rounded-lg text-[12px] font-bold hover:bg-error-container transition-all disabled:opacity-40">
                            Suspend
                          </button>
                        )}
                      </>
                    )}

                    {/* Artisan-specific: Grant / Revoke PRO */}
                    {u.role === 'artisan' && u.artisanId && (
                      u.isPro ? (
                        <button
                          onClick={() => doArtisanPro(u.artisanId!, false)}
                          disabled={!!busy}
                          className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg text-[12px] font-bold hover:bg-surface-container transition-all disabled:opacity-40">
                          Revoke PRO
                        </button>
                      ) : (
                        <button
                          onClick={() => doArtisanPro(u.artisanId!, true)}
                          disabled={!!busy}
                          className="px-3 py-1.5 border border-secondary text-secondary rounded-lg text-[12px] font-bold hover:bg-secondary-container transition-all disabled:opacity-40">
                          Grant PRO
                        </button>
                      )
                    )}

                    {/* Artisan detail link */}
                    {u.role === 'artisan' && u.artisanId && (
                      <a href={`/admin/artisans/${u.artisanId}`}
                        className="p-2 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container transition-all"
                        title="View artisan profile">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                      </a>
                    )}

                    {busy && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-1" />}
                  </div>
                </div>
              );
            })}
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
