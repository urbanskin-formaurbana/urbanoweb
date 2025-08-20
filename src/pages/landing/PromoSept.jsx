import SEO from '../../components/SEO'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box
} from '@mui/material'

const PROGRAMS = [
  {
    name: 'Cinturón de Orión',
    path: '/cinturon-orion',
    description: 'Reducir y tensar la piel.',
    features: ['30 minutos de Lipo Laser', 'Maderoterapia', 'Masaje de drenaje linfático'],
    prices: [
      { label: 'Sesión', value: '1500' },
      { label: 'Cuponera 6', value: '5500 (Oferta de Apertura)' },
      { label: 'Cuponera 8', value: '7900' },
      { label: 'Cuponera 10', value: '9800' }
    ],
    level: 'Nivel inicial'
  },
  {
    name: 'Cinturón de Titán',
    path: '/cinturon-titan',
    description: 'Reduce y tonifica al mismo tiempo de forma eficiente.',
    features: ['30 minutos de MSCULP', '30 minutos de Lipo Laser', 'Maderoterapia', 'Pulido'],
    prices: [
      { label: 'Sesión', value: '2000' },
      { label: 'Cuponera 6', value: '6600 (Oferta de Apertura)' },
      { label: 'Cuponera 8', value: '8900' },
      { label: 'Cuponera 10', value: '10900' }
    ],
    level: 'Nivel intermedio'
  },
  {
    name: 'Cinturón de Acero',
    path: '/cinturon-acero',
    description: 'Diseñado para llevar tu músculo abdominal a su máximo potencial.',
    features: ['30 minutos de MSCulp', 'Radiofrecuencia', 'Maderoterapia', 'Drenaje linfático'],
    prices: [
      { label: 'Sesión', value: '1900' },
      { label: 'Cuponera 6', value: '6200' },
      { label: 'Cuponera 8', value: '8200' },
      { label: 'Cuponera 10', value: '10200' }
    ],
    level: 'Nivel avanzado'
  }
]

function ProgramCard({ program }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {program.name}
        </Typography>
        <Typography sx={{ mb: 1 }}>{program.description}</Typography>
        <Box component="ul" sx={{ m: 0, pl: 2, mb: 1 }}>
          {program.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </Box>
        <Box>
          {program.prices.map((p) => (
            <Typography key={p.label}>{p.label}: {p.value}</Typography>
          ))}
        </Box>
        <Typography sx={{ mt: 1 }}>{program.level}</Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button component={RouterLink} to={program.path} variant="outlined">
          Ver más
        </Button>
      </CardActions>
    </Card>
  )
}

export default function PromoSept() {
  return (
    <>
      <SEO title="FORMA Urbana — Programas Cinturón" description="Información de los tres programas Cinturón." />
      <Container sx={{ my: 4 }}>
        <Typography variant="h1" gutterBottom>
          Programas Cinturón
        </Typography>
        <Grid container spacing={2}>
          {PROGRAMS.map((program) => (
            <Grid item xs={12} md={4} key={program.name}>
              <ProgramCard program={program} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}
