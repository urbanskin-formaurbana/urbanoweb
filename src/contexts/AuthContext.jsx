import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/auth_service';

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
      console.error('Google login error:', error);
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
      console.error('Send OTP error:', error);
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
      console.error('Verify OTP error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_method');
    setUser(null);
    setIsAuthenticated(false);
    setLoginMethod(null);
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
