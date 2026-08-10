'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

type ComplaintStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';
type ResolveStatus   = 'resolved' | 'dismissed' | 'under_review';

interface Complaint {
  _id: string;
  title?: string;
  description?: string;
  status?: ComplaintStatus;
  resolution?: string;
  createdAt?: string;
  updatedAt?: string;
  reporter?: { _id?: string; name?: string; role?: string } | null;
  reportedUser?: { _id?: string; name?: string; role?: string } | null;
  job?: { _id?: string; title?: string } | null;
}

const STATUS_TABS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'open',         label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved',     label: 'Resolved' },
  { value: 'dismissed',    label: 'Dismissed' },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  open:         { color: '#B91C1C', bg: '#FEE2E2', label: 'Open' },
  under_review: { color: '#92400E', bg: '#FEF3C7', label: 'Under Review' },
  resolved:     { color: '#065F46', bg: '#D1FAE5', label: 'Resolved' },
  dismissed:    { color: '#374151', bg: '#F3F4F6', label: 'Dismissed' },
};

export default function AdminComplaintsPage() {
  const [tab,     setTab]     = useState<ComplaintStatus | 'all'>('open');
  const [list,    setList]    = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve modal
  const [target,     setTarget]     = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus,  setNewStatus]  = useState<ResolveStatus>('resolved');
  const [resolving,  setResolving]  = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = (filter: ComplaintStatus | 'all' = tab) => {
    setLoading(true);
    const qs = filter !== 'all' ? `?status=${filter}&limit=50` : '?limit=50';
    api.get(`/api/admin/complaints${qs}`)
      .then((r) => setList(r.data?.data ?? r.data?.complaints ?? []))
      .catch(() => showToast('Failed to load complaints.', 'err'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const openResolve = (id: string) => {
    setTarget(id);
    setResolution('');
    setNewStatus('resolved');
  };

  const submitResolve = async () => {
    if (!resolution.trim()) { showToast('Please enter a resolution.', 'err'); return; }
    if (!target) return;
    setResolving(true);
    try {
      await api.post(`/api/admin/complaints/${target}/resolve`, {
        resolution: resolution.trim(),
        status: newStatus,
      });
      showToast('Complaint updated.');
      setTarget(null);
      load(tab);
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.', 'err');
    } finally { setResolving(false); }
  };

  const markUnderReview = async (id: string) => {
    try {
      await api.post(`/api/admin/complaints/${id}/resolve`, { resolution: 'Under admin review.', status: 'under_review' });
      showToast('Marked as under review.');
      load(tab);
    } catch {
      showToast('Action failed.', 'err');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-[14px] font-semibold text-white transition-all ${toast.type === 'ok' ? 'bg-[#006229]' : 'bg-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Resolve modal */}
      {target && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[18px] font-black text-on-surface mb-4">Resolve Complaint</h3>

            <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Resolution Status</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['resolved', 'dismissed', 'under_review'] as ResolveStatus[]).map((s) => {
                const st = STATUS_STYLE[s];
                return (
                  <button key={s} onClick={() => setNewStatus(s)}
                    className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${newStatus === s ? 'border-primary' : 'border-outline-variant/30'}`}
                    style={newStatus === s ? { color: st.color, background: st.bg } : {}}>
                    {st.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Resolution Notes</p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe the resolution or action taken…"
              rows={3}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              disabled={resolving}
            />
            <div className="flex gap-3">
              <button onClick={() => setTarget(null)} disabled={resolving}
                className="flex-1 py-3 border border-outline-variant rounded-2xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={submitResolve} disabled={resolving}
                className="flex-1 py-3 bg-primary text-on-primary rounded-2xl text-[14px] font-bold transition-all disabled:opacity-60">
                {resolving ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface mb-1">Complaints</h1>
          <p className="text-[14px] text-on-surface-variant">Review and manage user complaints</p>
        </div>
        <button onClick={() => load(tab)} className="flex items-center gap-2 text-primary text-[13px] font-semibold hover:bg-primary-container/30 px-3 py-1.5 rounded-xl transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ value, label }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold flex-shrink-0 transition-all ${tab === value ? 'bg-primary text-on-primary' : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/40'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4">inbox</span>
          <p className="text-[16px] font-bold text-on-surface">No complaints</p>
          <p className="text-[13px] text-on-surface-variant mt-1">Nothing to show for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const st = STATUS_STYLE[c.status ?? 'open'] ?? STATUS_STYLE.open;
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      {c.createdAt && <span className="text-[12px] text-outline">{formatDate(c.createdAt)}</span>}
                    </div>
                    <p className="text-[16px] font-bold text-on-surface">{c.title ?? 'Untitled Complaint'}</p>
                    {c.description && <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed line-clamp-2">{c.description}</p>}
                  </div>
                </div>

                {/* Parties */}
                <div className="flex flex-wrap gap-4 px-6 pb-4 border-b border-outline-variant/10">
                  {c.reporter && (
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Reporter</p>
                      <p className="text-[13px] text-on-surface font-semibold">{c.reporter.name ?? '—'} <span className="text-[11px] text-outline font-normal capitalize">({c.reporter.role})</span></p>
                    </div>
                  )}
                  {c.reportedUser && (
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Reported</p>
                      <p className="text-[13px] text-on-surface font-semibold">{c.reportedUser.name ?? '—'} <span className="text-[11px] text-outline font-normal capitalize">({c.reportedUser.role})</span></p>
                    </div>
                  )}
                  {c.job && (
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Job</p>
                      <p className="text-[13px] text-primary font-semibold truncate max-w-[160px]">{c.job.title ?? 'Job'}</p>
                    </div>
                  )}
                </div>

                {/* Resolution (if resolved/dismissed) */}
                {c.resolution && (c.status === 'resolved' || c.status === 'dismissed') && (
                  <div className="px-6 py-3 bg-surface-container/30 border-b border-outline-variant/10">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Resolution</p>
                    <p className="text-[13px] text-on-surface leading-relaxed">{c.resolution}</p>
                  </div>
                )}

                {/* Actions */}
                {c.status !== 'resolved' && c.status !== 'dismissed' && (
                  <div className="flex gap-3 px-6 py-4">
                    {c.status === 'open' && (
                      <button onClick={() => markUnderReview(c._id)}
                        className="px-4 py-2 border border-amber-400 text-amber-700 rounded-xl text-[13px] font-bold hover:bg-amber-50 transition-all">
                        Mark Under Review
                      </button>
                    )}
                    <button onClick={() => openResolve(c._id)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-[13px] font-bold hover:brightness-110 transition-all">
                      Resolve / Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
