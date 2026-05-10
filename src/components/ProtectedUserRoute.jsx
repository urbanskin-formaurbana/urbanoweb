import { Navigate } from 'react-router-dom';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function UserGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.user_type === 'employee') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function ProtectedUserRoute({ children }) {
  return (
    <SessionAuth>
      <UserGuard>{children}</UserGuard>
    </SessionAuth>
  );
}
