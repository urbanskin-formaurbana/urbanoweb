import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

/**
 * MercadoPago redirect page when payment is pending
 */
export default function BookingPendingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
      <HourglassEmptyIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        Tu pago está en verificación
      </Typography>

      <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
        Tu pago está siendo verificado por MercadoPago. Esto puede tomar algunos minutos. Te notificaremos por correo electrónico cuando se complete.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/schedule')}
        >
          Ir a agendamiento
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
