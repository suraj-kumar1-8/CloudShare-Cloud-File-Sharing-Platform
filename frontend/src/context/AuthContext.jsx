import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authAPI from '../api/auth';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and exposes:
 *   user, token, login(), register(), logout(), loading
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // initial check in progress

  // On mount, verify stored token is still valid by hitting /api/auth/me
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!token) { setLoading(false); return; }
      // Hard 6-second deadline so the spinner never hangs indefinitely
      const timeout = setTimeout(() => {
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setLoading(false);
        }
      }, 6000);
      try {
        const { data } = await authAPI.getMe();
        if (!cancelled) setUser(data.user);
      } catch {
        // Token invalid or expired – clear it
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (details) => {
    const { data } = await authAPI.register(details);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
