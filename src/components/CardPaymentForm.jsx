import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';

/**
 * Custom Card Payment Form using MercadoPago SDK
 * Loads SDK script and initializes on mount
 */
export default function CardPaymentForm({ onSubmit, onError, loading = false }) {
  const [mp, setMp] = useState(null);
  const [sdkLoading, setSdkLoading] = useState(true);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      setSdkLoading(false);
      return;
    }

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      if (window?.MercadoPago) {
        // Create instance with public key
        const mpInstance = new window.MercadoPago(publicKey);
        setMp(mpInstance);
      }
      setSdkLoading(false);
    };
    script.onerror = () => {
      setSdkLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const [cardData, setCardData] = useState({
    number: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    cardholderName: '',
    identificationType: 'CI', // Default to CI (Cedula de Identidad) for Uruguay
    identificationNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);


  const validateCardData = () => {
    const newErrors = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Número de tarjeta inválido';
    }

    if (!cardData.expirationMonth || !cardData.expirationYear) {
      newErrors.expirationMonth = 'Fecha de expiración requerida';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    if (!cardData.cardholderName) {
      newErrors.cardholderName = 'Nombre del titular requerido';
    }

    if (!cardData.identificationNumber) {
      newErrors.identificationNumber = 'Número de documento requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 19);
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    handleInputChange('number', formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCardData()) {
      return;
    }

    setIsProcessing(true);

    try {
      if (!mp) {
        throw new Error('MercadoPago SDK not initialized - please refresh the page');
      }

      // Determine payment method from card BIN
      const cardBin = cardData.number.replace(/\s/g, '').slice(0, 6);
      let paymentMethodId = 'visa'; // default
      if (cardBin.startsWith('5')) {
        paymentMethodId = 'master';
      } else if (cardBin.startsWith('3')) {
        paymentMethodId = 'amex';
      }

      // Create card token using the SDK
      // The token must be created BEFORE sending to backend
      const tokenResponse = await mp.createCardToken({
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expirationMonth,
        cardExpirationYear: cardData.expirationYear,
        securityCode: cardData.cvv,
      });

      // Check for errors in token response
      if (!tokenResponse || !tokenResponse.id) {
        const errorMsg =
          tokenResponse?.message ||
          tokenResponse?.cause?.[0]?.description ||
          'Failed to create card token';
        throw new Error(errorMsg);
      }

      // Call parent handler with token and payer identification
      await onSubmit({
        token: tokenResponse.id,
        payment_method_id: paymentMethodId,
        installments: 1,
        payer_identification_type: cardData.identificationType,
        payer_identification_number: cardData.identificationNumber,
      });

      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      onError({
        type: 'error',
        cause: 'tokenization_failed',
        message: err.message || 'Failed to process card',
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Número de tarjeta"
          placeholder="4111 1111 1111 1111"
          value={cardData.number}
          onChange={handleCardNumberChange}
          error={!!errors.number}
          helperText={errors.number}
          fullWidth
          disabled={isProcessing || loading}
          inputProps={{
            maxLength: 23,
            inputMode: 'numeric',
          }}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Mes"
              placeholder="MM"
              type="number"
              value={cardData.expirationMonth}
              onChange={(e) => {
                const val = e.target.value.slice(0, 2);
                if (!val || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                  handleInputChange('expirationMonth', val);
                }
              }}
              error={!!errors.expirationMonth}
              helperText={errors.expirationMonth}
              fullWidth
              disabled={isProcessing || loading}
              inputProps={{
                maxLength: 2,
                inputMode: 'numeric',
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Año"
              placeholder="YY"
              type="number"
              value={cardData.expirationYear}
              onChange={(e) => {
                const val = e.target.value.slice(0, 2);
                handleInputChange('expirationYear', val);
              }}
              error={!!errors.expirationMonth}
              fullWidth
              disabled={isProcessing || loading}
              inputProps={{
                maxLength: 2,
                inputMode: 'numeric',
              }}
            />
          </Grid>
        </Grid>

        <TextField
          label="CVV"
          placeholder="123"
          type="password"
          value={cardData.cvv}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            handleInputChange('cvv', val);
          }}
          error={!!errors.cvv}
          helperText={errors.cvv}
          fullWidth
          disabled={isProcessing || loading}
          inputProps={{
            maxLength: 4,
            inputMode: 'numeric',
          }}
        />

        <TextField
          label="Nombre del titular"
          placeholder="Juan Pérez"
          value={cardData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          error={!!errors.cardholderName}
          helperText={errors.cardholderName}
          fullWidth
          disabled={isProcessing || loading}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Tipo de documento"
              value={cardData.identificationType}
              onChange={(e) => handleInputChange('identificationType', e.target.value)}
              fullWidth
              disabled={isProcessing || loading}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value="CI">Cédula de Identidad</option>
              <option value="RUT">RUT</option>
              <option value="DNI">DNI</option>
              <option value="PASSPORT">Pasaporte</option>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Número de documento"
              placeholder="12345678"
              value={cardData.identificationNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                handleInputChange('identificationNumber', val);
              }}
              error={!!errors.identificationNumber}
              helperText={errors.identificationNumber}
              fullWidth
              disabled={isProcessing || loading}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                },
              }}
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2">
            <strong>Tarjeta de prueba:</strong> 4111 1111 1111 1111 (Visa)
          </Typography>
          <Typography variant="body2">
            Cualquier fecha futura • CVV: 123 • Nombre: Test
          </Typography>
        </Alert>

        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          disabled={isProcessing || loading}
          sx={{ mt: 2 }}
        >
          {isProcessing || loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Procesando...
            </>
          ) : (
            'Confirmar Pago'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
