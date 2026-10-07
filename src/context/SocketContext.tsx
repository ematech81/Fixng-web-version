'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

/**
 * Keeps one live socket connection for the signed-in user and shares it with the app
 * (live chat, new-job alerts, instant notification badges). Held in state so consumers
 * re-render as soon as the socket exists — and get null again after logout.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      return;
    }
    setSocket(connectSocket());
  }, [token]);

  useEffect(() => () => disconnectSocket(), []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
