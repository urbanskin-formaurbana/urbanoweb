import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFound() {
  return (
    <Container
      component="main"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} sx={{ p: 5 }}>
        <Stack spacing={2} textAlign="center">
          <Typography variant="h1" color="primary" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Página no encontrada
          </Typography>
          <Typography>
            Lo sentimos, la página que buscas no existe. Nuestro equipo cuida
            cada detalle; vuelve al inicio para continuar tu experiencia.
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              color="primary"
            >
              Volver al inicio
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}
