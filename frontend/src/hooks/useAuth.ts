import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('xbet_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const setAuthData = useCallback((userData: User, token: string) => {
    localStorage.setItem('xbet_token', token);
    localStorage.setItem('xbet_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('xbet_token');
    localStorage.removeItem('xbet_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('xbet_token');
    if (!token) return;
    try {
      setLoading(true);
      const res = await authApi.me();
      const updatedUser = res.data.data;
      localStorage.setItem('xbet_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isLoggedIn = !!user;

  return { user, loading, isAdmin, isLoggedIn, setAuthData, logout, refreshUser };
}
