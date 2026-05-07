import { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  TextField,
  Alert,
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import paymentService from '../services/payment_service';
import SafeDialog from './common/SafeDialog';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function ReceiptModal({
  open,
  receiptUrl,
  isPdf,
  onClose,
  canConfirm = false,
  onConfirm,
  paymentId,
  onReject,
}) {
  const [pdfPages, setPdfPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [rejectStep, setRejectStep] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!open || !receiptUrl || !isPdf) {
      setPdfPages([]);
      setError(null);
      return;
    }

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const pdf = await pdfjsLib.getDocument(receiptUrl).promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          pages.push(canvas.toDataURL('image/png'));
        }

        setPdfPages(pages);
      } catch {
        setError('No se pudo cargar el PDF');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [open, receiptUrl, isPdf]);

  const handleClose = () => {
    setConfirmStep(false);
    setRejectStep(false);
    setRejectReason('');
    setRejectError(null);
    onClose();
  };

  const handleConfirmClick = async () => {
    if (!confirmStep) {
      setConfirmStep(true);
    } else {
      try {
        await onConfirm?.();
      } finally {
        setConfirmStep(false);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectReason.trim().length < 5) {
      setRejectError('El motivo debe tener al menos 5 caracteres.');
      return;
    }
    setRejecting(true);
    setRejectError(null);
    try {
      await paymentService.rejectTransfer(paymentId, { reason: rejectReason.trim() });
      onReject?.();
      handleClose();
    } catch (err) {
      setRejectError(err?.message || 'No se pudo rechazar el pago. Intenta de nuevo.');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <SafeDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Comprobante de pago</DialogTitle>
      <DialogContent sx={{ p: 2, minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
        {isPdf ? (
          <>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center' }}>
                {pdfPages.map((page, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={page}
                    alt={`Page ${index + 1}`}
                    sx={{ maxWidth: '100%', boxShadow: 1, borderRadius: 1 }}
                  />
                ))}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img
              src={receiptUrl}
              alt="Comprobante"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </DialogContent>
      {/* Reject reason form — shown inline above actions */}
      {rejectStep && (
        <Box sx={{ px: 3, pb: 1 }}>
          <TextField
            label="Motivo del rechazo"
            multiline
            minRows={2}
            fullWidth
            size="small"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            error={!!rejectError}
            helperText={rejectError || ' '}
          />
          {rejectError && !rejectError.includes('caracteres') && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {rejectError}
            </Alert>
          )}
        </Box>
      )}

      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>

        {canConfirm && !rejectStep && (
          <>
            {/* Reject trigger */}
            {paymentId && (
              <Button
                onClick={() => { setConfirmStep(false); setRejectStep(true); }}
                color="error"
              >
                Rechazar
              </Button>
            )}

            {!confirmStep ? (
              <Button
                onClick={handleConfirmClick}
                variant="contained"
                color="success"
              >
                Confirmar pago
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setConfirmStep(false)}
                  sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleConfirmClick}
                  variant="contained"
                  color="error"
                >
                  Sí, confirmar →
                </Button>
              </>
            )}
          </>
        )}

        {rejectStep && (
          <>
            <Button onClick={() => { setRejectStep(false); setRejectError(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleRejectSubmit}
              variant="contained"
              color="error"
              disabled={rejecting}
            >
              {rejecting ? <CircularProgress size={20} /> : 'Confirmar rechazo'}
            </Button>
          </>
        )}
      </DialogActions>
    </SafeDialog>
  );
}
