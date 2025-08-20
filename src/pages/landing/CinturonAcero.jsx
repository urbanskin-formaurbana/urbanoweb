import SEO from '../../components/SEO.jsx'
import { Container, Typography, Box } from '@mui/material'

export default function CinturonAcero() {
  return (
    <>
      <SEO title="FORMA Urbana — Cinturón de Acero" description="Diseñado para llevar tu músculo abdominal a su máximo potencial." />
      <Container component="section" sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>Cinturón de Acero</Typography>
        <Typography sx={{ mb: 2 }}>
          Diseñado para llevar tu músculo abdominal a su máximo potencial.
        </Typography>
        <Box component="ul" sx={{ mb: 2 }}>
          <li>30 minutos de MSCulp</li>
          <li>Radiofrecuencia</li>
          <li>Maderoterapia</li>
          <li>Drenaje linfático</li>
        </Box>
        <Box>
          <Typography>Precio sesión: 1900</Typography>
          <Typography>Precio cuponera 6: 6200</Typography>
          <Typography>Precio cuponera 8: 8200</Typography>
          <Typography>Precio cuponera 10: 10200</Typography>
        </Box>
        <Typography sx={{ mt: 2 }}>
          Nivel avanzado: apto para personas buscando seguir tonificando músculo y piel.
        </Typography>
      </Container>
    </>
  )
}
