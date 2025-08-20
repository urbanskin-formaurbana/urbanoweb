import SEO from '../../components/SEO'
import { Container, Typography } from '@mui/material'

export default function Pricing() {
  return (
    <>
      <SEO title="Urbanoweb — Pricing" description="Planes y precios" />
      <Container component="section">
        <Typography variant="h1" gutterBottom>Pricing</Typography>
        <Typography>Tabla de precios + CTA.</Typography>
      </Container>
    </>
  )
}
