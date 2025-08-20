import SEO from '../../components/SEO'
import { Container, Typography, Box } from '@mui/material'

export default function CinturonTitan() {
  return (
    <>
      <SEO title="FORMA Urbana — Cinturón de Titán" description="Reduce y tonifica al mismo tiempo de forma eficiente." />
      <Container component="section" sx={{ my: 4 }}>
        <Typography variant="h1" gutterBottom>Cinturón de Titán</Typography>
        <Typography sx={{ mb: 2 }}>
          Reduce y tonifica al mismo tiempo de forma eficiente.
        </Typography>
        <Box component="ul" sx={{ mb: 2 }}>
          <li>30 minutos de MSCULP</li>
          <li>30 minutos de Lipo Laser</li>
          <li>Maderoterapia</li>
          <li>Pulido</li>
        </Box>
        <Box>
          <Typography>Precio sesión: 2000</Typography>
          <Typography>Precio cuponera 6: 6600. Oferta de Apertura</Typography>
          <Typography>Precio cuponera 8: 8900</Typography>
          <Typography>Precio cuponera 10: 10900</Typography>
        </Box>
        <Typography sx={{ mt: 2 }}>
          Nivel intermedio: apto para personas buscando eliminar la última grasa localizada.
        </Typography>
      </Container>
    </>
  )
}
