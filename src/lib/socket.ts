import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;
let connectedWithToken: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: getToken() },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

/**
 * Connect (or reconnect) using the CURRENT login token. The token is read every time — the
 * socket instance outlives logins, so a token captured when it was first created would be
 * stale (or null) after logging out and in as someone else, and the server would reject it.
 */
export function connectSocket() {
  const s = getSocket();
  const token = getToken();
  s.auth = { token };
  if (s.connected && connectedWithToken !== token) s.disconnect();   // different user: reconnect as them
  if (!s.connected) s.connect();
  connectedWithToken = token;
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
  connectedWithToken = null;
}
