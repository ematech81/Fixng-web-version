'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';

interface Message {
  _id: string;
  sender: string | { _id: string };
  content: string;
  createdAt: string;
}

interface JobSnippet {
  title?: string;
  customer?: { _id: string; name: string };
}

export default function ArtisanChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const router  = useRouter();
  const { user } = useAuth();
  const socket   = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [job,      setJob]      = useState<JobSnippet | null>(null);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/api/messages/${jobId}`),
      api.get(`/api/jobs/${jobId}`).catch(() => ({ data: null })),
    ]).then(([msgRes, jobRes]) => {
      setMessages(msgRes.data.data ?? msgRes.data.messages ?? msgRes.data ?? []);
      const j = jobRes.data?.data ?? jobRes.data?.job ?? jobRes.data;
      if (j) setJob(j);
    });
  }, [jobId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinRoom', jobId);
    const handler = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on('newMessage', handler);
    return () => { socket.off('newMessage', handler); socket.emit('leaveRoom', jobId); };
  }, [socket, jobId]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText('');
    try {
      await api.post('/api/messages', { jobId, content });
    } catch { /* message will still arrive via socket or optimistic */ }
    finally { setSending(false); }
  };

  const myId = user?._id ?? user?.id ?? '';
  const getSenderId = (m: Message) => typeof m.sender === 'string' ? m.sender : m.sender._id;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-4 border-b border-outline-variant/30 bg-white flex-shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <span className="text-[14px] font-black text-primary">{job?.customer?.name?.[0]?.toUpperCase() ?? 'C'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-on-surface truncate">{job?.customer?.name ?? 'Customer'}</p>
          {job?.title && <p className="text-[12px] text-outline truncate">{job.title}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-3 bg-surface-container-low">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">chat</span>
            <p className="text-[14px] text-on-surface-variant">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = getSenderId(m) === myId;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${mine ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white text-on-surface rounded-bl-sm shadow-sm border border-outline-variant/20'}`}>
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-on-primary/60' : 'text-outline'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-3 px-4 md:px-8 py-3 border-t border-outline-variant/30 bg-white flex-shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] resize-none outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <button onClick={sendMessage} disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all disabled:opacity-40">
          <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </div>
    </div>
  );
}
