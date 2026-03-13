import { useEffect, useRef } from 'react';
import { CircularProgress, Box } from '@mui/material';
import paymentService from '../services/payment_service';

/**
 * MercadoPago Payment Brick Component
 * Renders MercadoPago's full payment form embedded directly on the page
 * Card fields (number, expiry, CVV, name, document) all inline — no redirects
 * Payment methods controlled by backend preference (cards only)
 */
export default function MercadoPagoBrick({ preferenceId, amount, onPaymentSuccess, onPaymentError, treatmentId, payerEmail, packageId, isEvaluation }) {
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
          console.log('SDK ready, rendering Payment Brick');
          await initBrick();
          return;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (currentGeneration === mountGenerationRef.current) {
        console.error('SDK failed to load after max attempts');
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
            console.log('Previous instance cleanup:', e);
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
          callbacks: {
            onReady: () => {
              console.log('Payment Brick ready');
            },
            onSubmit: async ({ selectedPaymentMethod, formData }) => {
              console.log('Payment Brick submitted:', selectedPaymentMethod, formData);
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
                if (packageId) {
                  paymentData.package_id = packageId;
                }
                const result = await paymentService.processPayment(paymentData);
                console.log('Payment processed:', result);
                if (result.status === 'approved' || result.status === 'pending') {
                  onPaymentSuccessRef.current?.(result.payment_id);
                } else {
                  onPaymentErrorRef.current?.(new Error(`Payment ${result.status}: ${result.status_detail}`));
                }
              } catch (error) {
                console.error('Payment processing error:', error);
                onPaymentErrorRef.current?.(error);
                throw error;
              }
            },
            onError: (error) => {
              console.error('Payment Brick error:', error);
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
          console.log('Payment Brick rendered successfully');
        } else {
          try { controller.unmount(); } catch (e) { /* ignore */ }
        }
      } catch (error) {
        if (currentGeneration === mountGenerationRef.current) {
          console.error('Error initializing Payment Brick:', error);
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
          console.log('Cleanup error (ignored):', e);
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
        minHeight: { xs: 'auto', sm: '500px' },
        '& iframe': {
          width: '100% !important',
          maxWidth: '100%',
          border: 'none',
        },
      }}
    />
  );
}
