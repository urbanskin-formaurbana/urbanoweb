import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { Container, Box, Typography, Link } from '@mui/material'
import FormaUrbanaLogo from '../assets/images/FormaUrbanaLogo.svg'

export default function LandingLayout() {
  const { pathname } = useLocation()

  const links = [
    { to: '/cinturon-orion', label: 'Cinturón de Orión' },
    { to: '/cinturon-titan', label: 'Cinturón de Titán' },
    { to: '/cinturon-acero', label: 'Cinturón de Acero' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box component="header" display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
          <Box component="nav" display="flex" alignItems="center" gap={2}>
            <Box
              component={RouterLink}
              to="/cinturon-orion"
              sx={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Box
                component="img"
                src={FormaUrbanaLogo}
                alt="FORMA Urbana"
                sx={{ height: { xs: 32, sm: 40, md: 48 }, display: 'block' }}
              />
            </Box>
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
    </Box>
  )
}
