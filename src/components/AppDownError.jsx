import { Box, Button, Typography } from '@mui/material';

export default function AppDownError() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        El servicio no está disponible en este momento.
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#999',
          marginBottom: 4,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        Intentá recargar la página en unos minutos.
      </Typography>

      <Button
        variant="contained"
        sx={{
          backgroundColor: '#2e7d32',
          color: 'white',
          fontWeight: 600,
          padding: '10px 30px',
          '&:hover': {
            backgroundColor: '#1f4f29',
          },
        }}
        onClick={() => window.location.reload()}
      >
        Recargar página
      </Button>
    </Box>
  );
}
