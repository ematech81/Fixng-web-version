'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  read: boolean;
  createdAt: string;
  meta?: { jobId?: string };
  data?: { jobId?: string };
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  new_job:             { icon: 'work',              color: '#2563EB', label: 'Job Request'        },
  job_broadcast:       { icon: 'campaign',          color: '#0EA5E9', label: 'New Job Nearby'     },
  job_accepted:        { icon: 'handshake',         color: '#16A34A', label: 'Job Accepted'       },
  job_declined:        { icon: 'cancel',            color: '#EF4444', label: 'Job Declined'       },
  artisan_arrived:     { icon: 'place',             color: '#8B5CF6', label: 'Artisan Arrived'    },
  job_started:         { icon: 'play_circle',       color: '#8B5CF6', label: 'Job Started'        },
  job_completed:       { icon: 'task_alt',          color: '#F59E0B', label: 'Job Completed'      },
  job_cancelled:       { icon: 'cancel',            color: '#EF4444', label: 'Job Cancelled'      },
  dispute_raised:      { icon: 'warning',           color: '#D97706', label: 'Dispute Raised'     },
  dispute_resolved:    { icon: 'shield',            color: '#16A34A', label: 'Dispute Resolved'   },
  new_message:         { icon: 'chat_bubble',       color: '#2563EB', label: 'New Message'        },
  profile_verified:    { icon: 'verified',          color: '#16A34A', label: 'Profile Verified'   },
  profile_rejected:    { icon: 'gpp_bad',           color: '#EF4444', label: 'Verification Issue' },
  account_warning:     { icon: 'warning',           color: '#D97706', label: 'Account Warning'    },
  account_suspended:   { icon: 'lock',              color: '#EF4444', label: 'Account Suspended'  },
  account_unsuspended: { icon: 'lock_open',         color: '#16A34A', label: 'Account Restored'   },
  payment:             { icon: 'payments',          color: '#1565C0', label: 'Payment'            },
  review_received:     { icon: 'star',              color: '#F57F17', label: 'Review Received'    },
  upgrade:             { icon: 'workspace_premium', color: '#F9A825', label: 'Upgrade'            },
};

const DEFAULT_CFG = { icon: 'notifications', color: '#9CA3AF', label: 'Notification' };

function cfg(type: string) { return TYPE_CONFIG[type] ?? DEFAULT_CFG; }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<Notification | null>(null);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setNotifs(r.data.data ?? r.data.notifications ?? []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    api.patch(`/api/notifications/${id}/read`).catch(() => {});
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    api.patch('/api/notifications/read-all').catch(() => {});
  };

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n._id !== id));
    api.delete(`/api/notifications/${id}`).catch(() => {});
  };

  const handleTap = (n: Notification) => {
    if (!n.read) markRead(n._id);
    const jobId = n.meta?.jobId ?? n.data?.jobId;
    if (n.type === 'new_message' && jobId) {
      router.push(`/customer/messages/${jobId}`);
      return;
    }
    if (jobId) {
      router.push(`/customer/jobs/${jobId}`);
      return;
    }
    setModal(n);
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-on-surface">Notifications</h1>
          {unread > 0 && <p className="text-[14px] text-primary font-medium">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-[14px] font-bold text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">notifications_none</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">All clear!</p>
          <p className="text-[14px] text-on-surface-variant">You have no notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const c = cfg(n.type);
            const body = n.body ?? n.message ?? '';
            return (
              <div
                key={n._id}
                onClick={() => handleTap(n)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  n.read
                    ? 'bg-white border-outline-variant/20 hover:border-outline-variant/60'
                    : 'bg-primary-container/10 border-primary/20 hover:bg-primary-container/20'
                }`}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.color + '18' }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '22px', color: c.color, fontVariationSettings: "'FILL' 1" }}
                  >
                    {c.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] leading-tight mb-0.5 ${n.read ? 'font-semibold' : 'font-black'} text-on-surface`}>
                    {n.title}
                  </p>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-2">{body}</p>
                  <p className="text-[11px] text-outline mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Right side: unread dot + delete */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
                  {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + type label */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: cfg(modal.type).color + '18' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '24px', color: cfg(modal.type).color, fontVariationSettings: "'FILL' 1" }}
                >
                  {cfg(modal.type).icon}
                </span>
              </div>
              <span
                className="text-[12px] font-black uppercase tracking-wider"
                style={{ color: cfg(modal.type).color }}
              >
                {cfg(modal.type).label}
              </span>
            </div>

            <h3 className="text-[17px] font-black text-on-surface mb-2">{modal.title}</h3>
            <p className="text-[14px] text-on-surface-variant leading-relaxed mb-3">
              {modal.body ?? modal.message}
            </p>
            <p className="text-[11px] text-outline mb-6">{timeAgo(modal.createdAt)}</p>

            <button
              onClick={() => setModal(null)}
              className="w-full py-3 rounded-xl font-bold text-[15px] text-white transition-all hover:brightness-110"
              style={{ background: cfg(modal.type).color }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
