import { useEffect, useRef } from 'react';
import { CircularProgress, Box } from '@mui/material';
import paymentService from '../services/payment_service';

/**
 * Maps MercadoPago status_detail codes to human-readable Spanish messages
 */
const mapMpError = (status, statusDetail) => {
  const detailMap = {
    'cc_rejected_bad_filled_security_code': 'El código de seguridad (CVV) ingresado es incorrecto. Verificá e intentá de nuevo.',
    'cc_rejected_bad_filled_card_number': 'El número de tarjeta ingresado es incorrecto. Verificalo e intentá de nuevo.',
    'cc_rejected_bad_filled_date': 'La fecha de vencimiento ingresada es incorrecta. Verificala e intentá de nuevo.',
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta. Usá otra tarjeta o contactá a tu banco.',
    'cc_rejected_call_for_authorize': 'Tu banco requiere que autorices este pago. Contactá a tu banco e intentá de nuevo.',
    'cc_rejected_card_disabled': 'La tarjeta está deshabilitada. Contactá a tu banco.',
    'cc_rejected_duplicated_payment': 'Este pago ya fue procesado anteriormente.',
    'cc_rejected_high_risk': 'El pago fue rechazado por razones de seguridad. Intentá con otra tarjeta.',
    'cc_rejected_max_attempts': 'Superaste el límite de intentos. Esperá un momento e intentá de nuevo.',
  };

  // Check if we have a mapped message for this specific detail
  if (detailMap[statusDetail]) {
    return detailMap[statusDetail];
  }

  // Check if the detail contains "token" and show a user-friendly message
  if (statusDetail?.includes('token')) {
    return 'Ocurrió un error al procesar tu tarjeta. Intentá ingresar los datos de nuevo.';
  }

  // Generic rejection message
  if (status === 'rejected') {
    return 'El pago fue rechazado. Verificá los datos de tu tarjeta e intentá de nuevo.';
  }

  // Fallback
  return 'Ocurrió un error al procesar el pago. Por favor intentá de nuevo.';
};

/**
 * MercadoPago Payment Brick Component
 * Renders MercadoPago's full payment form embedded directly on the page
 * Card fields (number, expiry, CVV, name, document) all inline — no redirects
 * Payment methods controlled by backend preference (cards only)
 */
export default function MercadoPagoBrick({ preferenceId, paymentId, amount, onPaymentSuccess, onPaymentError, treatmentId, payerEmail, packageId, isEvaluation }) {
  const brickRef = useRef(null);
  const brickControllerRef = useRef(null);
  const mountGenerationRef = useRef(0);

  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  const onPaymentErrorRef = useRef(onPaymentError);

  onPaymentSuccessRef.current = onPaymentSuccess;
  onPaymentErrorRef.current = onPaymentError;

  useEffect(() => {
    if (!preferenceId) return;

    const currentGeneration = ++mountGenerationRef.current;

    const waitForSDK = async () => {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        if (currentGeneration !== mountGenerationRef.current) return;

        if (window.mp && typeof window.mp.bricks === 'function') {
          await initBrick();
          return;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (currentGeneration === mountGenerationRef.current) {
        onPaymentErrorRef.current?.(new Error('SDK failed to load'));
      }
    };

    const initBrick = async () => {
      if (currentGeneration !== mountGenerationRef.current) return;

      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (currentGeneration !== mountGenerationRef.current) return;

        const container = document.getElementById('wallet_container');
        if (!container) throw new Error('Container wallet_container not found in DOM');

        if (brickControllerRef.current) {
          try {
            await brickControllerRef.current.unmount();
          } catch (e) {
            // Ignore cleanup errors
          }
          brickControllerRef.current = null;
        }

        if (currentGeneration !== mountGenerationRef.current) return;

        container.innerHTML = '';
        const bricksBuilder = window.mp.bricks();

        const controller = await bricksBuilder.create('payment', 'wallet_container', {
          locale: 'es-UY',
          initialization: {
            amount: amount,
            preferenceId: preferenceId,
          },
          appearance: {
            nodeStyles: {
              padding: '0px',
              margin: '0px',
            },
          },
          callbacks: {
            onReady: () => {
              // Brick is ready for input
            },
            onSubmit: async ({ selectedPaymentMethod, formData }) => {
              try {
                const paymentData = {
                  token: formData.token,
                  payment_method_id: formData.payment_method_id,
                  installments: formData.installments || 1,
                  amount: formData.transaction_amount || amount,
                  treatment_id: treatmentId,
                  payer_email: payerEmail,
                  is_evaluation: isEvaluation,
                };
                if (paymentId) {
                  paymentData.payment_id = paymentId;
                }
                if (packageId) {
                  paymentData.package_id = packageId;
                }
                const result = await paymentService.processPayment(paymentData);
                if (result.status === 'approved' || result.status === 'pending') {
                  onPaymentSuccessRef.current?.(result.payment_id);
                } else {
                  const friendlyErrorMsg = mapMpError(result.status, result.status_detail);
                  onPaymentErrorRef.current?.(new Error(friendlyErrorMsg));
                }
              } catch (error) {
                onPaymentErrorRef.current?.(error);
                throw error;
              }
            },
            onError: (error) => {
              if (error?.type === 'critical') {
                onPaymentErrorRef.current?.(error);
              }
            },
          },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              prepaidCard: 'all',
              mercadoPago: 'all',
            },
          },
        });

        if (currentGeneration === mountGenerationRef.current) {
          brickControllerRef.current = controller;
        } else {
          try { controller.unmount(); } catch (e) { /* ignore */ }
        }
      } catch (error) {
        if (currentGeneration === mountGenerationRef.current) {
          onPaymentErrorRef.current?.(error);
        }
      }
    };

    waitForSDK();

    return () => {
      if (currentGeneration === mountGenerationRef.current) {
        try {
          if (brickControllerRef.current) {
            brickControllerRef.current.unmount();
            brickControllerRef.current = null;
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [preferenceId]);

  if (!preferenceId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      id="wallet_container"
      ref={brickRef}
      sx={{
        width: '100%',
        '& iframe': {
          width: '100% !important',
          maxWidth: '100%',
          border: 'none',
        },
      }}
    />
  );
}
