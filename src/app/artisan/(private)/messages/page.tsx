'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Thread {
  jobId: string;
  jobTitle: string;
  otherUser: { name: string; photo?: string };
  lastMessage?: string;
  lastAt?: string;
  unread?: number;
}

export default function ArtisanMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/chat/conversations')
      .then((r) => {
        const convos = r.data.data ?? [];
        setThreads(convos.map((j: {
          _id: string;
          title?: string;
          category?: string;
          customerId?: { _id: string; name: string; profilePhoto?: string } | null;
          lastMessage?: { text: string; at: string };
        }) => ({
          jobId:     j._id,
          jobTitle:  j.title ?? j.category ?? 'Job',
          otherUser: {
            name:  j.customerId?.name ?? 'Customer',
            photo: j.customerId?.profilePhoto,
          },
          lastMessage: j.lastMessage?.text,
          lastAt:      j.lastMessage?.at,
        })));
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">
      <h1 className="text-[28px] font-black text-on-surface mb-6">Messages</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-3">chat_bubble</span>
          <p className="text-[18px] font-bold text-on-surface mb-1">No messages yet</p>
          <p className="text-[14px] text-on-surface-variant">Accept a job to start chatting with customers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link key={t.jobId} href={`/artisan/messages/${t.jobId}`}
              className="flex items-center gap-4 bg-white border border-outline-variant/20 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                  {t.otherUser.photo
                    ? <img src={t.otherUser.photo} alt={t.otherUser.name} className="w-full h-full object-cover" />
                    : <span className="text-[16px] font-black text-primary">{t.otherUser.name?.[0]?.toUpperCase()}</span>}
                </div>
                {t.unread && t.unread > 0 ? (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-on-primary">{t.unread > 9 ? '9+' : t.unread}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <p className={`text-[15px] font-bold text-on-surface truncate ${t.unread ? 'text-primary' : ''}`}>{t.otherUser.name}</p>
                  {t.lastAt && <span className="text-[11px] text-outline flex-shrink-0 ml-2">{formatDate(t.lastAt)}</span>}
                </div>
                <p className="text-[12px] text-outline truncate">{t.jobTitle}</p>
                {t.lastMessage && <p className="text-[13px] text-on-surface-variant truncate">{t.lastMessage}</p>}
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors flex-shrink-0" style={{ fontSize: '20px' }}>chevron_right</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
