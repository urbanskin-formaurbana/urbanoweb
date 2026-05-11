import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { notifyAuth } from '../auth/notifyAuth';

function UserGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const accessDenied = !loading && !isAuthenticated;
  const isEmployee = !loading && isAuthenticated && user?.user_type === 'employee';

  useEffect(() => {
    if (accessDenied) notifyAuth('access_denied');
  }, [accessDenied]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessDenied) return <Navigate to="/" replace />;
  if (isEmployee) return <Navigate to="/admin" replace />;

  return children;
}

export default function ProtectedUserRoute({ children }) {
  // requireAuth=false: our own guard handles redirects + user notices,
  // so we don't want SessionAuth bouncing to /auth before we can act.
  return (
    <SessionAuth requireAuth={false}>
      <UserGuard>{children}</UserGuard>
    </SessionAuth>
  );
}
