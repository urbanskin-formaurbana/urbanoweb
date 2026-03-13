import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * MercadoPago redirect page after failed payment
 */
export default function BookingFailurePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        El pago no pudo ser procesado
      </Typography>

      <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
        Hubo un problema al procesar tu pago. Por favor, verifica tus datos e intenta de nuevo.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/payment')}
        >
          Intentar de nuevo
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </Box>
    </Box>
  );
}
