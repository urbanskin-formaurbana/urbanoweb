import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

/**
 * MercadoPago redirect page after successful payment
 * Auto-redirects to scheduling page after payment confirmation
 */
export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Wait a moment to show the loading state, then redirect
    const timer = setTimeout(() => {
      // Get the preference ID to track the payment
      const preferenceId = searchParams.get('preference-id');
      console.log('✅ Payment successful. Preference ID:', preferenceId);

      // Redirect to scheduling page
      navigate('/schedule', {
        state: { paymentSuccess: true, preferenceId }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Procesando tu pago...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Redirigiendo a la página de agendamiento
      </Typography>
    </Box>
  );
}
