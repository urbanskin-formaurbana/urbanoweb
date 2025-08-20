import { Outlet } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'

export default function PromoLandingLayout() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box component="main">
        <Outlet />
      </Box>
      <Typography component="footer" mt={6} fontSize={12} color="text.secondary">
        © {new Date().getFullYear()} FORMA Urbana
      </Typography>
    </Container>
  )
}
