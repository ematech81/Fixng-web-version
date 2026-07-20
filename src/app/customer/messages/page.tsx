'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';

interface Thread {
  jobId: string;
  jobTitle: string;
  artisan: { id: string; name: string; profilePhoto?: string | null };
  lastMessage: { text: string; createdAt: string } | null;
  unread: boolean;
}

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

export default function CustomerMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/chat/conversations'),
      api.get('/api/notifications').catch(() => ({ data: { data: [] } })),
    ]).then(([convRes, notifRes]) => {
      const notifs: { type: string; read: boolean; data?: { jobId?: string }; meta?: { jobId?: string } }[] =
        notifRes.data.data ?? notifRes.data.notifications ?? [];
      const unreadIds = new Set(
        notifs
          .filter((n) => n.type === 'new_message' && !n.read)
          .map((n) => String(n.data?.jobId ?? n.meta?.jobId ?? ''))
          .filter(Boolean)
      );

      const convos = convRes.data.data ?? [];
      setThreads(convos.map((j: {
        _id: string;
        title?: string;
        category?: string;
        assignedArtisanId?: { _id: string; name: string; profilePhoto?: string | null } | null;
        lastMessage?: { text: string; at: string };
      }) => ({
        jobId:       String(j._id),
        jobTitle:    j.title ?? j.category ?? 'Job',
        artisan:     {
          id:           j.assignedArtisanId?._id ?? '',
          name:         j.assignedArtisanId?.name ?? 'Artisan',
          profilePhoto: j.assignedArtisanId?.profilePhoto ?? null,
        },
        lastMessage: j.lastMessage
          ? { text: j.lastMessage.text, createdAt: j.lastMessage.at }
          : null,
        unread: unreadIds.has(String(j._id)),
      })));
    })
    .catch(() => setThreads([]))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      <h1 className="text-[28px] font-black text-on-surface mb-1">Messages</h1>
      <p className="text-[14px] text-on-surface-variant mb-6">Chat with artisans about your jobs</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl skeleton" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">chat_bubble_outline</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">No messages yet</p>
          <p className="text-[14px] text-on-surface-variant mb-6">Messages with artisans will appear here once a job is assigned.</p>
          <Link href="/customer/post-job" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-[14px] hover:brightness-110 transition-all">
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.jobId}
              href={`/customer/messages/${t.jobId}`}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all"
              style={t.unread ? {
                background: '#e8f0fe',
                boxShadow: 'inset 4px 0 0 #004ac6, 0 0 0 1px rgba(0,74,198,0.18)',
              } : {
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(195,198,215,0.4)',
              }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-container"
                  style={t.unread ? { outline: '2px solid #004ac6', outlineOffset: '1px' } : undefined}>
                  {t.artisan.profilePhoto ? (
                    <Image src={t.artisan.profilePhoto} alt={t.artisan.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-primary-container flex items-center justify-center">
                      <span className="text-[18px] font-black text-primary/50">{getInitials(t.artisan.name)}</span>
                    </div>
                  )}
                </div>
                {t.unread && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[15px] truncate font-black text-on-surface">
                    {t.artisan.name}
                  </p>
                  {t.lastMessage && (
                    <span className="text-[11px] flex-shrink-0 ml-2"
                      style={{ color: t.unread ? '#004ac6' : '#737686', fontWeight: t.unread ? 700 : 400 }}>
                      {timeAgo(t.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-outline mb-0.5 truncate">{t.jobTitle}</p>
                {t.lastMessage && (
                  <p className="text-[13px] truncate"
                    style={{ color: t.unread ? '#0b1c30' : '#434655', fontWeight: t.unread ? 600 : 400 }}>
                    {t.lastMessage.text}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {t.unread && (
                <span className="flex-shrink-0 text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                  style={{ background: '#004ac6' }}>
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
