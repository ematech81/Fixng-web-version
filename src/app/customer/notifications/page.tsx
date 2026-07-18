'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  meta?: { jobId?: string };
}

const ICON_MAP: Record<string, string> = {
  job_accepted:   'handshake',
  job_started:    'play_circle',
  job_completed:  'check_circle',
  job_cancelled:  'cancel',
  new_message:    'chat_bubble',
  payment:        'payments',
  default:        'notifications',
};

export default function CustomerNotificationsPage() {
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications').then((r) => {
      setNotifs(r.data.data ?? r.data.notifications ?? []);
    }).catch(() => setNotifs([])).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    } catch {/* silent */}
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifs((n) => n.map((x) => x._id === id ? { ...x, read: true } : x));
    } catch {/* silent */}
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Notifications</h1>
          {unread > 0 && <p className="text-[14px] text-on-surface-variant">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-[14px] font-bold text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">notifications_none</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">All clear!</p>
          <p className="text-[14px] text-on-surface-variant">You have no notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const icon = ICON_MAP[n.type] ?? ICON_MAP.default;
            const isJobNotif = !!n.meta?.jobId;
            const content = (
              <div
                onClick={() => !n.read && markRead(n._id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-outline-variant/20'
                    : 'bg-primary-container/10 border-primary/20 hover:bg-primary-container/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-surface-container text-on-surface-variant' : 'bg-primary text-on-primary'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: n.read ? "'FILL' 0" : "'FILL' 1" }}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[15px] ${n.read ? 'font-semibold text-on-surface' : 'font-black text-on-surface'}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-[13px] text-on-surface-variant mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-outline mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );
            return isJobNotif
              ? <Link key={n._id} href={`/customer/jobs/${n.meta!.jobId}`}>{content}</Link>
              : <div key={n._id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
