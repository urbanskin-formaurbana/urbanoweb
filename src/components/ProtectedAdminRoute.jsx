import { Navigate } from 'react-router-dom';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.user_type !== 'employee') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function ProtectedAdminRoute({ children }) {
  return (
    <SessionAuth>
      <AdminGuard>{children}</AdminGuard>
    </SessionAuth>
  );
}
