import SEO from '../../components/SEO'
import { Container, Typography } from '@mui/material'

export default function Home() {
  return (
    <>
      <SEO title="Urbanoweb — Home" description="Landing principal de Urbanoweb" />
      <Container component="section">
        <Typography variant="h1" gutterBottom>Home Landing</Typography>
        <Typography>Hero + CTA.</Typography>
      </Container>
    </>
  )
}
