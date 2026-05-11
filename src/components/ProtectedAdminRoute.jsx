import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { notifyAuth } from '../auth/notifyAuth';

function AdminGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const accessDenied = !loading && !isAuthenticated;
  const wrongRole = !loading && isAuthenticated && user?.user_type !== 'employee';

  useEffect(() => {
    if (accessDenied) notifyAuth('access_denied');
    else if (wrongRole) notifyAuth('admin_only');
  }, [accessDenied, wrongRole]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessDenied || wrongRole) return <Navigate to="/" replace />;

  return children;
}

export default function ProtectedAdminRoute({ children }) {
  // requireAuth=false: AdminGuard handles redirects + user notices,
  // so we don't want SessionAuth bouncing to /auth before we can act.
  return (
    <SessionAuth requireAuth={false}>
      <AdminGuard>{children}</AdminGuard>
    </SessionAuth>
  );
}
