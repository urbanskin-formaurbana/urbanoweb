import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  // Verify session is still valid on backend
  useEffect(() => {
    if (loading || !user) {
      setSessionVerified(true);
      return;
    }

    const verifySession = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setSessionValid(false);
          setSessionVerified(true);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          // Token expired, clear auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('login_method');
          window.dispatchEvent(new CustomEvent('auth:logout'));
          setSessionValid(false);
        } else if (response.ok) {
          setSessionValid(true);
        }
      } catch (error) {
        // Network error, allow to proceed and let API handle it
        setSessionValid(true);
      } finally {
        setSessionVerified(true);
      }
    };

    verifySession();
  }, [loading, user]);

  if (loading || !sessionVerified) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !sessionValid || user.user_type !== 'employee') {
    return <Navigate to="/" replace />;
  }

  return children;
}
