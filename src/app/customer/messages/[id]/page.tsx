'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { formatTime, getInitials } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface JobInfo {
  title: string;
  artisan?: { id?: string; _id?: string; name: string; profilePhoto?: string | null } | null;
}

export default function CustomerChatPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const { user }      = useAuth();
  const socket        = useSocket();

  const [messages,  setMessages]  = useState<Message[]>([]);
  const [jobInfo,   setJobInfo]   = useState<JobInfo | null>(null);
  const [text,      setText]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  // Fetch history + job info
  useEffect(() => {
    if (!jobId) return;
    Promise.all([
      api.get(`/api/chat/${jobId}`).catch(() => ({ data: { data: [] } })),
      api.get(`/api/jobs/${jobId}`).catch(() => ({ data: null })),
    ]).then(([msgRes, jobRes]) => {
      setMessages(msgRes.data.data ?? msgRes.data.messages ?? []);
      const j = jobRes.data?.data ?? jobRes.data?.job ?? jobRes.data;
      setJobInfo(j ? { title: j.title, artisan: j.artisan } : null);
    }).finally(() => { setLoading(false); scrollBottom(); });
  }, [jobId]);

  // Socket room join + listen
  useEffect(() => {
    if (!socket || !jobId) return;
    socket.emit('joinRoom', jobId);
    const onMsg = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      scrollBottom();
    };
    socket.on('newMessage', onMsg);
    return () => { socket.off('newMessage', onMsg); socket.emit('leaveRoom', jobId); };
  }, [socket, jobId]);

  const handleSend = useCallback(async () => {
    const t = text.trim();
    if (!t || !jobId) return;
    setSendError(null);
    setText('');
    try {
      const res = await api.post(`/api/chat/${jobId}`, { text: t });
      const msg = res.data.data ?? res.data.message ?? res.data;
      setMessages((prev) => [...prev, msg]);
      scrollBottom();
    } catch (err: unknown) {
      setText(t);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSendError(msg ?? 'Failed to send. Please try again.');
    }
  }, [text, jobId]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const artisan = jobInfo?.artisan;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-8 py-4 border-b border-outline-variant bg-white flex-shrink-0">
        <Link href="/customer/messages" className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
        </Link>
        {artisan && (
          <div className="w-10 h-10 rounded-xl bg-primary-container overflow-hidden flex-shrink-0">
            {artisan.profilePhoto ? (
              <Image src={artisan.profilePhoto} alt={artisan.name} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[13px] font-black text-primary/50">{getInitials(artisan.name)}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-on-surface truncate">{artisan?.name ?? 'Artisan'}</p>
          <p className="text-[12px] text-on-surface-variant truncate">{jobInfo?.title ?? 'Job chat'}</p>
        </div>
        {artisan && (
          <Link href={`/artisan/${artisan.id ?? artisan._id}`} className="text-[13px] font-bold text-primary hover:underline flex-shrink-0">
            View Profile
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-3 bg-surface">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <span className="material-symbols-outlined text-[56px] text-outline-variant">chat_bubble_outline</span>
            <p className="text-[16px] font-semibold text-on-surface">No messages yet</p>
            <p className="text-[13px] text-on-surface-variant">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === user?.id || msg.senderId === user?._id;
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                  mine
                    ? 'bg-primary text-on-primary rounded-tr-sm'
                    : 'bg-white border border-outline-variant text-on-surface rounded-tl-sm'
                }`} style={{ boxShadow: '0px 1px 4px rgba(0,0,0,0.06)' }}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${mine ? 'text-on-primary/60' : 'text-outline'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="px-4 md:px-8 py-2 bg-error-container flex items-center gap-2 flex-shrink-0">
          <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
          <p className="text-[13px] text-on-error-container flex-1">{sendError}</p>
          <button onClick={() => setSendError(null)} className="text-error flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-3 px-4 md:px-8 py-4 border-t border-outline-variant bg-white flex-shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-[15px] resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all max-h-32 overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </div>
    </div>
  );
}
