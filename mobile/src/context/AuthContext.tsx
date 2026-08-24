import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, User, AuthError } from '../api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = await api.getToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      const user = await api.getMe();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      await api.clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    await api.setTokens(res.accessToken, res.refreshToken);
    setState({ user: res.user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.register(email, password, name);
    await api.setTokens(res.accessToken, res.refreshToken);
    setState({ user: res.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await api.clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
