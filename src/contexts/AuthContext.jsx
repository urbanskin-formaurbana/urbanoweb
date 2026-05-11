import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSessionContext, signOut } from 'supertokens-auth-react/recipe/session';
import { apiCall } from '../services/api';
import logger from '../utils/logger';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const sessionCtx = useSessionContext();
  const [user, setUser] = useState(null);
  // resolvedForHasSession holds the value of hasSession we've fully resolved
  // the profile for. While it differs from the current hasSession, we treat
  // the auth state as still-loading — this prevents a transient frame where
  // sessionCtx.loading flips to false but the /auth/me fetch hasn't started,
  // which would otherwise read as "no session" and fire premature redirects.
  const [resolvedForHasSession, setResolvedForHasSession] = useState(null);

  const hasSession = !sessionCtx.loading && sessionCtx.doesSessionExist;

  useEffect(() => {
    if (sessionCtx.loading) return;

    if (!hasSession) {
      setUser(null);
      setResolvedForHasSession(false);
      return;
    }

    apiCall('/auth/me')
      .then((userData) => {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone || null,
          auth_method: userData.auth_method,
          user_type: userData.user_type,
          role: userData.role || null,
        });
      })
      .catch((err) => {
        logger.error('Failed to fetch user profile:', err);
        setUser(null);
      })
      .finally(() => setResolvedForHasSession(true));
  }, [hasSession, sessionCtx.loading]);

  useEffect(() => {
    if (hasSession && user?.user_type === 'employee') {
      window.dispatchEvent(new CustomEvent('auth:employee_login'));
    }
  }, [hasSession, user?.user_type]);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      logger.error('Logout error:', err);
    }
    setUser(null);
  }, []);

  const profileLoading = resolvedForHasSession !== hasSession;
  const loading = sessionCtx.loading || profileLoading;
  const isAuthenticated = !loading && hasSession && user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
