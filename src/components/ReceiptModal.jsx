import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function ReceiptModal({ open, receiptUrl, isPdf, onClose, canConfirm = false, onConfirm }) {
  const [pdfPages, setPdfPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

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
      } catch (err) {
        setError('No se pudo cargar el PDF');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [open, receiptUrl, isPdf]);

  const handleClose = () => {
    setConfirmStep(false);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
        {canConfirm && (
          <>
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
      </DialogActions>
    </Dialog>
  );
}
