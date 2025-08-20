import { Link as RouterLink, Outlet } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { Container, Box, Typography, Link } from '@mui/material'

export default function LandingLayout() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box component="header" display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Link component={RouterLink} to="/cinturon-orion" underline="none" color="inherit">
            Cinturón de Orión
          </Link>
          <Box component="nav" display="flex" gap={2}>
            <Link component={RouterLink} to="/cinturon-titan" underline="hover">
              Cinturón de Titán
            </Link>
            <Link component={RouterLink} to="/cinturon-acero" underline="hover">
              Cinturón de Acero
            </Link>
          </Box>
        </Box>
        <StatusBadge />
      </Box>
      <Box component="main">
        <Outlet />
      </Box>
      <Typography component="footer" mt={6} fontSize={12} color="text.secondary">
        © {new Date().getFullYear()} FORMA Urbana
      </Typography>
    </Container>
  )
}
