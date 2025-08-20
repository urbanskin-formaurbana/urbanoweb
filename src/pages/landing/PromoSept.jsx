import SEO from '../../components/SEO'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Link
} from '@mui/material'

function Section({ title, children, ...props }) {
  return (
    <Box component="section" sx={{ my: 6 }} {...props}>
      {title && (
        <Typography variant="h2" sx={{ fontSize: 24, mb: 1.5 }}>
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </Box>
  )
}

function CTAButton({ to = '#', children }) {
  return (
    <Button component="a" href={to} variant="outlined" sx={{ borderRadius: 2 }}>
      {children}
    </Button>
  )
}

export default function PromoSept() {
  return (
    <>
      <SEO
        title="Urbanoweb — Promo Septiembre"
        description="Descuento especial de septiembre. Oferta por tiempo limitado."
      />
      <Container>
        <Box
          component="header"
          display="flex"
          alignItems="center"
          gap={2}
          my={3}
        >
          <Box component="img" src="/landings/promo-sept/logo.svg" alt="Logo" height={32} />
          <Typography color="text.secondary">|</Typography>
          <Link component={RouterLink} to="/">
            Volver al inicio
          </Link>
        </Box>

        <Section>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h1" sx={{ fontSize: 40, lineHeight: 1.1, mb: 1.5 }}>
                -30% este mes. Construye tu presencia web ahora.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Sitios rápidos con enfoque SEO y performance. Entrega ágil en pocos días.
              </Typography>
              <Box display="flex" gap={1.5}>
                <CTAButton to="#contacto">Solicitar demo</CTAButton>
                <CTAButton to="#precios">Ver precios</CTAButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/landings/promo-sept/hero.jpg"
                alt="Hero"
                sx={{ width: '100%', borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </Section>

        <Section title="Beneficios clave">
          <Box
            component="ul"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, pl: 2 }}
          >
            <li>
              Tiempo de carga <strong>1s</strong> en 4G.
            </li>
            <li>Diseño responsive y accesible.</li>
            <li>Integración con analítica y pixel.</li>
          </Box>
        </Section>

        <Section title="Planes" id="precios">
          <Grid container spacing={2}>
            {[
              {
                name: 'Starter',
                price: 'USD 299',
                features: ['1 landing', 'Hosting incluido', 'Soporte 15 días']
              },
              {
                name: 'Growth',
                price: 'USD 699',
                features: ['3 landings', 'A/B testing', 'Soporte 30 días']
              },
              {
                name: 'Scale',
                price: 'USD 1299',
                features: ['6 landings', 'CMS ligero', 'Soporte 60 días']
              }
            ].map((card) => (
              <Grid item xs={12} md={4} key={card.name}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {card.name}
                    </Typography>
                    <Typography sx={{ fontSize: 24, mb: 1 }}>{card.price}</Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {card.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <CTAButton to="#contacto">Seleccionar</CTAButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        <Section title="FAQ">
          <Box>
            <Box mb={1}>
              <Box component="details">
                <Box component="summary">¿Cuánto tarda la entrega?</Box>
                <Typography>
                  Primer borrador en 72 horas para el plan Starter.
                </Typography>
              </Box>
            </Box>
            <Box mb={1}>
              <Box component="details">
                <Box component="summary">¿Puedo migrar a un plan superior?</Box>
                <Typography>
                  Sí, se prorratea la diferencia y no pierdes trabajo realizado.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Section>

        <Typography
          component="footer"
          sx={{ mt: 8, mb: 3, fontSize: 12, color: 'text.secondary' }}
        >
          © {new Date().getFullYear()} Urbanoweb — Promo Septiembre
        </Typography>
      </Container>
    </>
  )
}

