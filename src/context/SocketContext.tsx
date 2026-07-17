'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token) {
      socketRef.current = connectSocket();
    } else {
      disconnectSocket();
      socketRef.current = null;
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
