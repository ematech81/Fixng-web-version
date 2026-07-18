'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';

interface Thread {
  jobId: string;
  jobTitle: string;
  artisan: { id: string; name: string; profilePhoto?: string | null };
  lastMessage: { text: string; createdAt: string; isFromMe: boolean } | null;
  unreadCount: number;
}

export default function CustomerMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get message threads; fall back to jobs list with artisan assigned
    api.get('/api/messages/threads').then((r) => {
      setThreads(r.data.data ?? r.data.threads ?? []);
    }).catch(async () => {
      // Fallback: show jobs that have an assigned artisan as chat threads
      try {
        const res = await api.get('/api/jobs', { params: { limit: '50' } });
        const jobs = res.data.data ?? res.data.jobs ?? [];
        const withArtisan = jobs.filter((j: { artisan?: unknown }) => j.artisan);
        setThreads(withArtisan.map((j: { _id: string; title: string; artisan: { id?: string; _id?: string; name: string; profilePhoto?: string | null }; updatedAt: string; status: string }) => ({
          jobId:       j._id,
          jobTitle:    j.title,
          artisan:     { id: j.artisan.id ?? j.artisan._id ?? '', name: j.artisan.name, profilePhoto: j.artisan.profilePhoto ?? null },
          lastMessage: { text: `Job is ${j.status}`, createdAt: j.updatedAt, isFromMe: false },
          unreadCount: 0,
        })));
      } catch { setThreads([]); }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4 md:px-8">
      <h1 className="text-[28px] font-black text-on-surface mb-2">Messages</h1>
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
              className="flex items-center gap-4 bg-white border border-outline-variant/20 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all"
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary-container overflow-hidden">
                  {t.artisan.profilePhoto ? (
                    <Image src={t.artisan.profilePhoto} alt={t.artisan.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[18px] font-black text-primary/50">{getInitials(t.artisan.name)}</span>
                    </div>
                  )}
                </div>
                {t.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {t.unreadCount > 9 ? '9+' : t.unreadCount}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-[15px] truncate ${t.unreadCount > 0 ? 'font-black text-on-surface' : 'font-bold text-on-surface'}`}>
                    {t.artisan.name}
                  </p>
                  {t.lastMessage && (
                    <span className="text-[11px] text-outline flex-shrink-0 ml-2">{formatDate(t.lastMessage.createdAt)}</span>
                  )}
                </div>
                <p className="text-[12px] text-outline mb-1 truncate">{t.jobTitle}</p>
                {t.lastMessage && (
                  <p className={`text-[13px] truncate ${t.unreadCount > 0 ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                    {t.lastMessage.isFromMe ? 'You: ' : ''}{t.lastMessage.text}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
