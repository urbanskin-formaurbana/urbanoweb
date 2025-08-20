import SEO from '../../components/SEO.jsx'
import { Container, Typography, Box } from '@mui/material'

export default function CinturonOrion() {
  return (
    <>
      <SEO title="FORMA Urbana — Cinturón de Orión" description="Reducir y tensar la piel." />
      <Container component="section" sx={{ my: 4 }}>
        <Typography variant="h1" gutterBottom>Cinturón de Orión</Typography>
        <Typography sx={{ mb: 2 }}>Reducir y tensar la piel.</Typography>
        <Box component="ul" sx={{ mb: 2 }}>
          <li>30 minutos de Lipo Laser</li>
          <li>Maderoterapia</li>
          <li>Masaje de drenaje linfático</li>
        </Box>
        <Box>
          <Typography>Precio sesión: 1500</Typography>
          <Typography>Precio cuponera 6: 5500. Oferta de Apertura</Typography>
          <Typography>Precio cuponera 8: 7900</Typography>
          <Typography>Precio cuponera 10: 9800</Typography>
        </Box>
        <Typography sx={{ mt: 2 }}>
          Nivel inicial: apto para personas que no son muy activas físicamente.
        </Typography>
      </Container>
    </>
  )
}
