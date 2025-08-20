import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { Container, Box, Typography, Link } from '@mui/material'

export default function LandingLayout() {
  const { pathname } = useLocation()

  const links = [
    { to: '/cinturon-orion', label: 'Cinturón de Orión' },
    { to: '/cinturon-titan', label: 'Cinturón de Titán' },
    { to: '/cinturon-acero', label: 'Cinturón de Acero' },
  ]

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box component="header" display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box component="nav" display="flex" alignItems="center" gap={2}>
          {links.map(({ to, label }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                component={isActive ? 'span' : RouterLink}
                to={isActive ? undefined : to}
                underline={isActive ? 'none' : 'hover'}
                color={isActive ? 'text.primary' : 'primary.main'}
                sx={isActive ? { pointerEvents: 'none' } : undefined}
              >
                {label}
              </Link>
            )
          })}
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
