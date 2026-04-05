import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import authService from '../services/auth_service';
import { getTimeUntilExpiry } from '../utils/jwt';
import logger from '../utils/logger';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  loginMethod: null,
  loginWithGoogle: async () => {},
  sendWhatsAppOTP: async () => {},
  verifyWhatsAppOTP: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginMethod, setLoginMethod] = useState(null); // 'google' or 'whatsapp'

  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_method');
    setUser(null);
    setIsAuthenticated(false);
    setLoginMethod(null);
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    const method = localStorage.getItem('login_method');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setLoginMethod(method);
    }
    setLoading(false);

    // Listen for forced logout (e.g. expired token detected by api.js)
    const handleForceLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setLoginMethod(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // Inactivity Manager: Track user activity and handle token refresh + logout on inactivity
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up timers if not authenticated
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
      return;
    }

    // Track user activity
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['click', 'keydown', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check inactivity and refresh token every 60 seconds
    inactivityTimerRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const INACTIVITY_THRESHOLD = 20 * 60 * 1000; // 20 minutes
      const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if expiring within 5 minutes

      // Log out if inactive for 20 minutes
      if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
        logger.debug('Session expired due to inactivity');
        logout();
        return;
      }

      // If user is active, check if token needs refresh
      if (timeSinceLastActivity < INACTIVITY_THRESHOLD) {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          const timeUntilExpiry = getTimeUntilExpiry(accessToken);
          if (timeUntilExpiry !== null && timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
            try {
              const refreshResponse = await authService.refreshToken();
              authService.saveTokens(refreshResponse);
              console.log('Token refreshed due to activity');
            } catch (error) {
              logger.error('Token refresh failed:', error);
              // If refresh fails, log out the user
              logout();
            }
          }
        }
      }
    }, 60000); // Check every 60 seconds

    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      // Clean up interval
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    };
  }, [isAuthenticated, logout]);

  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      // Authenticate with Google token
      const data = await authService.loginWithGoogle(idToken);
      const { access_token, refresh_token } = data;

      // Store tokens
      authService.saveTokens({ access_token, refresh_token });
      localStorage.setItem('login_method', 'google');

      // Fetch user profile from /auth/me endpoint
      const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userToStore = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone || null,
          auth_method: userData.auth_method,
          user_type: userData.user_type,
          role: userData.role || null
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));

        // Redirect employees to admin panel
        if (userData.user_type === 'employee') {
          window.dispatchEvent(new CustomEvent('auth:employee_login'));
        }
      }

      setIsAuthenticated(true);
      setLoginMethod('google');
      return true;
    } catch (error) {
      logger.error('Google login error:', error);
      throw error;
    }
  }, []);

  const sendWhatsAppOTP = useCallback(async (phone) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      return await response.json();
    } catch (error) {
      logger.error('Send OTP error:', error);
      throw error;
    }
  }, []);

  const verifyWhatsAppOTP = useCallback(async (phone, otpCode) => {
    try {
      // Verify OTP with backend
      const data = await authService.verifyOTP(phone, otpCode);
      const { access_token, refresh_token } = data;

      // Store tokens
      authService.saveTokens({ access_token, refresh_token });
      localStorage.setItem('login_method', 'whatsapp');

      // Fetch user profile from /auth/me endpoint
      const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userToStore = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone || phone,
          auth_method: userData.auth_method,
          user_type: userData.user_type,
          role: userData.role || null
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));

        // Redirect employees to admin panel
        if (userData.user_type === 'employee') {
          window.dispatchEvent(new CustomEvent('auth:employee_login'));
        }
      }

      setIsAuthenticated(true);
      setLoginMethod('whatsapp');
      return true;
    } catch (error) {
      logger.error('Verify OTP error:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    loginMethod,
    loginWithGoogle,
    sendWhatsAppOTP,
    verifyWhatsAppOTP,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
