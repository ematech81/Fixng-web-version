'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

type Audience = 'all' | 'artisan' | 'customer';

interface Announcement {
  _id: string;
  title: string;
  body: string;
  targetRole?: string;
  createdAt?: string;
  sentAt?: string;
  sentBy?: { name?: string } | string;
}

const AUDIENCES: { value: Audience; label: string; icon: string; desc: string }[] = [
  { value: 'all',      label: 'Everyone',  icon: 'groups',    desc: 'All users (artisans + customers)' },
  { value: 'artisan',  label: 'Artisans',  icon: 'handyman',  desc: 'Only artisan accounts' },
  { value: 'customer', label: 'Customers', icon: 'person',    desc: 'Only customer accounts' },
];

export default function AdminAnnouncementsPage() {
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [sending,  setSending]  = useState(false);
  const [history,  setHistory]  = useState<Announcement[]>([]);
  const [histLoad, setHistLoad] = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadHistory = () => {
    setHistLoad(true);
    api.get('/api/admin/announcements?limit=20')
      .then((r) => setHistory(r.data?.data ?? r.data?.announcements ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoad(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const send = async () => {
    if (!title.trim()) { showToast('Title is required.', 'err'); return; }
    if (!body.trim())  { showToast('Message body is required.', 'err'); return; }
    setSending(true);
    try {
      await api.post('/api/admin/announce', { title: title.trim(), body: body.trim(), targetRole: audience });
      showToast('Announcement sent successfully!');
      setTitle('');
      setBody('');
      setAudience('all');
      loadHistory();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send.', 'err');
    } finally { setSending(false); }
  };

  const audienceColors: Record<string, string> = {
    all:      'bg-primary-container/30 text-primary',
    artisan:  'bg-secondary-container/50 text-on-secondary-container',
    customer: 'bg-tertiary-container/50 text-on-tertiary-container',
  };

  return (
    <div className="max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-[14px] font-semibold text-white transition-all ${toast.type === 'ok' ? 'bg-[#006229]' : 'bg-error'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-[28px] font-black text-on-surface mb-1">Announcements</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">Broadcast push notifications to app users</p>

      {/* Compose card */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 mb-8">
        <h2 className="text-[16px] font-bold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>campaign</span>
          Compose Announcement
        </h2>

        {/* Audience selector */}
        <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Target Audience</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {AUDIENCES.map(({ value, label, icon, desc }) => (
            <button key={value} onClick={() => setAudience(value)}
              className={`p-3 rounded-xl border text-left transition-all ${audience === value ? 'border-primary bg-primary-container/20' : 'border-outline-variant/30 hover:bg-surface-container'}`}>
              <span className={`material-symbols-outlined block mb-1.5 ${audience === value ? 'text-primary' : 'text-on-surface-variant'}`}
                style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`text-[13px] font-bold ${audience === value ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Platform Update"
            maxLength={100}
            className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={sending}
          />
          <p className="text-[11px] text-outline mt-1 text-right">{title.length}/100</p>
        </div>

        {/* Body */}
        <div className="mb-5">
          <label className="block text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the full announcement message…"
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            disabled={sending}
          />
          <p className="text-[11px] text-outline mt-1 text-right">{body.length}/1000</p>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="mb-5 p-4 bg-surface-container/50 rounded-xl border border-outline-variant/20">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Preview</p>
            <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[14px] font-black">FX</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-on-surface">{title || '(No title)'}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">{body || '(No message)'}</p>
                  <p className="text-[11px] text-outline mt-1.5 flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${audienceColors[audience]}`}>
                      {AUDIENCES.find((a) => a.value === audience)?.label}
                    </span>
                    · now
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button onClick={send} disabled={sending || !title.trim() || !body.trim()}
          className="w-full py-3.5 bg-primary text-on-primary rounded-2xl text-[15px] font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {sending
            ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
            : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span> Send to {AUDIENCES.find((a) => a.value === audience)?.label}</>
          }
        </button>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-on-surface">Announcement History</h2>
          <button onClick={loadHistory} className="flex items-center gap-1.5 text-primary text-[13px] font-semibold hover:bg-primary-container/30 px-3 py-1.5 rounded-xl transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Refresh
          </button>
        </div>

        {histLoad ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">campaign</span>
            <p className="text-[15px] font-bold text-on-surface">No announcements yet</p>
            <p className="text-[13px] text-on-surface-variant">Compose one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((a) => (
              <div key={a._id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-[15px] font-bold text-on-surface">{a.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${audienceColors[a.targetRole ?? 'all']}`}>
                      {AUDIENCES.find((x) => x.value === a.targetRole)?.label ?? 'Everyone'}
                    </span>
                    <span className="text-[12px] text-outline">{a.createdAt ? formatDate(a.createdAt) : ''}</span>
                  </div>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">{a.body}</p>
                {typeof a.sentBy === 'object' && a.sentBy?.name && (
                  <p className="text-[11px] text-outline mt-2">by {a.sentBy.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
