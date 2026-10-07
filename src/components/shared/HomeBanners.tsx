'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { NOTIFICATIONS_CHANGED_EVENT } from '@/hooks/useUnreadNotifications';

interface Banner {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: { jobId?: string };
}

const MAX_SHOWN = 3;

const STYLE: Record<string, { icon: string; accent: string }> = {
  new_job:          { icon: 'work',           accent: '#2563EB' },
  job_broadcast:    { icon: 'campaign',       accent: '#7C3AED' },
  profile_verified: { icon: 'verified',       accent: '#16A34A' },
  badge_upgraded:   { icon: 'military_tech',  accent: '#D97706' },
  announcement:     { icon: 'campaign',       accent: '#FF6B00' },
};

/**
 * Alert banners at the top of the dashboard: pinned job requests / nearby jobs /
 * announcements (until dismissed) and a count of unread messages. Refreshes every
 * 30 s while visible, when the tab regains focus, and when notifications change.
 */
export default function HomeBanners({ role }: { role: 'artisan' | 'customer' }) {
  const router = useRouter();
  const { token } = useAuth();
  const socket = useSocket();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const base = role === 'artisan' ? '/artisan' : '/customer';

  const refresh = useCallback(() => {
    api.get('/api/notifications/banners')
      .then((r) => setBanners(r.data?.data ?? []))
      .catch(() => {});
    api.get('/api/notifications', { params: { unreadOnly: 'true', limit: 50 } })
      .then((r) => {
        const list: { type: string }[] = r.data?.data ?? [];
        setUnreadMessages(list.filter((n) => n.type === 'new_message').length);
      })
      .catch(() => {});
  }, []);

  // Live: a new alert (job request, message, announcement…) shows up immediately
  useEffect(() => {
    if (!socket) return;
    socket.on('notification', refresh);
    return () => { socket.off('notification', refresh); };
  }, [socket, refresh]);

  useEffect(() => {
    if (!token) return;
    refresh();
    const visibleRefresh = () => { if (document.visibilityState === 'visible') refresh(); };
    const id = setInterval(visibleRefresh, 30000);
    document.addEventListener('visibilitychange', visibleRefresh);
    window.addEventListener('focus', refresh);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', visibleRefresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [token, refresh]);

  const dismiss = (id: string) => {
    setBanners((b) => b.filter((x) => x._id !== id));
    api.patch(`/api/notifications/${id}/dismiss`)
      .finally(() => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT)));
  };

  const hrefFor = (b: Banner): string | null => {
    if (b.type === 'new_job' && b.data?.jobId) return `${base}/jobs/${b.data.jobId}`;
    if (b.type === 'job_broadcast') return role === 'artisan' ? '/artisan/jobs/available' : `${base}/notifications`;
    if (b.type === 'profile_verified' || b.type === 'badge_upgraded') return `${base}/notifications`;
    return null; // announcements: read-only, just dismiss
  };

  const open = (b: Banner) => {
    const href = hrefFor(b);
    dismiss(b._id);               // acted on — don't keep nagging
    if (href) router.push(href);
  };

  if (banners.length === 0 && unreadMessages === 0) return null;

  const shown = banners.slice(0, MAX_SHOWN);
  const hidden = banners.length - shown.length;

  return (
    <div className="mb-6 space-y-2">
      {unreadMessages > 0 && (
        <Link
          href={`${base}/messages`}
          className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/20 shadow-sm px-4 py-3 hover:shadow-md transition-shadow"
          style={{ borderLeft: '4px solid #2563EB' }}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          <p className="flex-1 text-[14px] font-semibold text-on-surface">
            You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
          </p>
          <span className="material-symbols-outlined text-outline">chevron_right</span>
        </Link>
      )}

      {shown.map((b) => {
        const s = STYLE[b.type] ?? STYLE.announcement;
        const clickable = hrefFor(b) !== null;
        return (
          <div
            key={b._id}
            className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/20 shadow-sm px-4 py-3"
            style={{ borderLeft: `4px solid ${s.accent}` }}
          >
            <button
              type="button"
              onClick={() => (clickable ? open(b) : undefined)}
              className={`flex items-center gap-3 flex-1 min-w-0 text-left ${clickable ? '' : 'cursor-default'}`}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: s.accent + '1F' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: s.accent, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold text-on-surface truncate">{b.title}</span>
                <span className="block text-[12px] text-on-surface-variant line-clamp-2">{b.body}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => dismiss(b._id)}
              aria-label="Dismiss"
              className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:bg-surface-container flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        );
      })}

      {hidden > 0 && (
        <Link href={`${base}/notifications`} className="block text-center text-[13px] font-bold text-primary py-1">
          +{hidden} more alert{hidden !== 1 ? 's' : ''} — view all
        </Link>
      )}
    </div>
  );
}
