import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress,
} from '@mui/material';

function formatMoney(value) {
  const n = Number(value);
  if (!isFinite(n)) return '0.00';
  return n.toFixed(2);
}

export default function DepositRemainderModal({
  open,
  onClose,
  selectedDeposit,
  remainderAmount,
  setRemainderAmount,
  remainderMethod,
  setRemainderMethod,
  remainderDiscount = '',
  setRemainderDiscount,
  savingRemainder,
  onConfirm,
  title = 'Agregar Pago',
}) {
  const total = Number(selectedDeposit?.full_amount ?? 0);
  const paid = Number(selectedDeposit?.paid_amount ?? 0);
  const existingDiscount = Number(selectedDeposit?.discount_amount ?? 0);
  const inputAmount = parseFloat(remainderAmount) || 0;
  const inputDiscount = parseFloat(remainderDiscount) || 0;
  const projectedRemaining = Math.max(
    total - paid - existingDiscount - inputAmount - inputDiscount,
    0,
  );
  const supportsDiscount = typeof setRemainderDiscount === 'function';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {selectedDeposit && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Cliente: {selectedDeposit.customer_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tratamiento: {selectedDeposit.treatment_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total contratado: ${formatMoney(total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ya pagado: ${formatMoney(paid)}
              </Typography>
              {existingDiscount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Descuento aplicado: ${formatMoney(existingDiscount)}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="error"
                sx={{ fontWeight: 'bold', mt: 1 }}
              >
                Resta tras este movimiento: ${formatMoney(projectedRemaining)}
              </Typography>
            </Box>

            <RadioGroup
              value={remainderMethod}
              onChange={(e) => setRemainderMethod(e.target.value)}
            >
              <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
              <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia Bancaria" />
              <FormControlLabel value="posnet" control={<Radio />} label="POSNet" />
            </RadioGroup>

            <TextField
              label="Monto a cobrar ($)"
              type="number"
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
              value={remainderAmount}
              onChange={(e) => setRemainderAmount(e.target.value)}
              fullWidth
            />

            {supportsDiscount && (
              <TextField
                label="Descuento ($)"
                type="number"
                size="small"
                inputProps={{ step: '0.01', min: '0' }}
                value={remainderDiscount}
                onChange={(e) => setRemainderDiscount(e.target.value)}
                helperText="Cierra parte del saldo sin contar como pago faltante."
                fullWidth
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={savingRemainder}
        >
          {savingRemainder ? <CircularProgress size={20} /> : 'Registrar Cobro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
