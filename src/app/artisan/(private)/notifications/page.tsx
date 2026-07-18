'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notification {
  _id: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: { jobId?: string };
}

const ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  new_job_request: { icon: 'work',           color: '#1976D2', bg: '#E3F2FD' },
  job_accepted:    { icon: 'handshake',       color: '#388E3C', bg: '#E8F5E9' },
  job_completed:   { icon: 'task_alt',        color: '#00897B', bg: '#E0F2F1' },
  job_cancelled:   { icon: 'cancel',          color: '#D32F2F', bg: '#FFEBEE' },
  new_message:     { icon: 'chat_bubble',     color: '#7B1FA2', bg: '#F3E5F5' },
  review_received: { icon: 'star',            color: '#F57F17', bg: '#FFFDE7' },
  payment:         { icon: 'payments',        color: '#1565C0', bg: '#E8EAF6' },
  upgrade:         { icon: 'workspace_premium', color: '#F9A825', bg: '#FFF8E1' },
};

export default function ArtisanNotificationsPage() {
  const [items,   setItems]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setItems(r.data.data ?? r.data.notifications ?? r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    api.put(`/api/notifications/${id}/read`).catch(() => {});
  };

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    api.put('/api/notifications/read-all').catch(() => {});
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Notifications</h1>
          {unread > 0 && <p className="text-[14px] text-primary font-medium">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-[14px] text-primary font-semibold hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">notifications_off</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">No notifications yet</p>
          <p className="text-[14px] text-on-surface-variant">We'll notify you about job requests, messages, and more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const meta = ICONS[n.type] ?? { icon: 'notifications', color: '#9CA3AF', bg: '#F9FAFB' };
            const jobLink = n.data?.jobId ? `/artisan/jobs/${n.data.jobId}` : null;

            const Inner = (
              <div className={`flex items-start gap-4 bg-white border rounded-2xl p-4 transition-all ${!n.read ? 'border-primary/20 bg-primary-container/5' : 'border-outline-variant/20'}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1", color: meta.color }}>{meta.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-[14px] font-bold text-on-surface mb-0.5">{n.title}</p>}
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-outline mt-1.5">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1" />}
              </div>
            );

            return jobLink ? (
              <Link key={n._id} href={jobLink} onClick={() => markRead(n._id)}>
                {Inner}
              </Link>
            ) : (
              <div key={n._id} onClick={() => markRead(n._id)} className="cursor-default">
                {Inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
