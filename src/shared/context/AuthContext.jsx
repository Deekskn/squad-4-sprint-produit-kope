import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '@/features/auth/services/auth.service.js';
import { ROUTES } from '@/lib/constants.js';

const AuthContext = createContext(null);

function redirect(to) {
  if (typeof window === 'undefined') return;
  window.location.assign(to);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
  }, [fetchMe]);

  const login = useCallback((userData) => setUser(userData), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    } finally {
      setUser(null);
      setInterval(() => redirect(ROUTES.HOME), 0);
    }
  }, []);

  const hasRole = useCallback(
    (role) => Boolean(user?.role && user.role === role),
    [user],
  );

  const value = { user, loading, login, logout, hasRole, refresh: fetchMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
