'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { saveSession, clearSession, getStoredUser, getToken } from '@/lib/auth';

interface User {
  id: string;
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'artisan' | 'admin';
  artisanCode?: string;
  isActive: boolean;
}

interface ArtisanProfile {
  badgeLevel?: string;
  isPro?: boolean;
  verificationStatus?: string;
  onboardingComplete?: boolean;
  skills?: string[];
  location?: { state?: string; city?: string; lga?: string };
  profilePhoto?: string;
  bio?: string;
  artisanCode?: string;
}

interface AuthState {
  user: User | null;
  artisanProfile: ArtisanProfile | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    artisanProfile: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = getToken();
    const user  = getStoredUser<User>();
    if (token && user) {
      setState((s) => ({ ...s, token, user, loading: false }));
      // Refresh from server in background
      api.get('/api/auth/me').then((res) => {
        setState((s) => ({
          ...s,
          user:           res.data.user,
          artisanProfile: res.data.artisanProfile || null,
        }));
      }).catch(() => {
        clearSession();
        setState({ user: null, artisanProfile: null, token: null, loading: false });
      });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const login = (token: string, user: User) => {
    saveSession(token, user as unknown as Record<string, unknown>);
    setState((s) => ({ ...s, token, user }));
  };

  const logout = () => {
    clearSession();
    setState({ user: null, artisanProfile: null, token: null, loading: false });
    window.location.href = '/';
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setState((s) => ({
        ...s,
        user:           res.data.user,
        artisanProfile: res.data.artisanProfile || null,
      }));
    } catch { /* handled by interceptor */ }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
