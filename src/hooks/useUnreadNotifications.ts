'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

// Fired by the notifications screens after mark-read / delete, so badges update instantly.
export const NOTIFICATIONS_CHANGED_EVENT = 'fixng:notifications-changed';

/**
 * Unread notification count for the signed-in user. Refreshes on mount, on every
 * route change, when the tab regains focus, every 30 s while visible, and when a
 * notifications screen changes read state.
 */
export function useUnreadNotifications(): number {
  const { token } = useAuth();
  const socket = useSocket();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    api.get('/api/notifications/unread-count')
      .then((r) => setCount(r.data.count ?? r.data.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) { setCount(0); return; }
    refresh();
  }, [token, pathname, refresh]);

  // Live: the server emits `notification` the moment one is created for this user
  useEffect(() => {
    if (!socket) return;
    socket.on('notification', refresh);
    return () => { socket.off('notification', refresh); };
  }, [socket, refresh]);

  useEffect(() => {
    if (!token) return;
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

  return count;
}
