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
  const [profileLoading, setProfileLoading] = useState(false);

  const hasSession = !sessionCtx.loading && sessionCtx.doesSessionExist;

  useEffect(() => {
    if (!hasSession) {
      setUser(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
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
      .finally(() => setProfileLoading(false));
  }, [hasSession]);

  // Redirect employees to the admin panel after login
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

  const loading = sessionCtx.loading || profileLoading;
  const isAuthenticated = !loading && hasSession && user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
