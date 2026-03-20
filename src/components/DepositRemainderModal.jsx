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

export default function DepositRemainderModal({
  open,
  onClose,
  selectedDeposit,
  remainderAmount,
  setRemainderAmount,
  remainderMethod,
  setRemainderMethod,
  savingRemainder,
  onConfirm,
  title = 'Agregar Pago',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
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
                Total contratado: ${selectedDeposit.full_amount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ya pagado: ${selectedDeposit.paid_amount.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                color="error"
                sx={{ fontWeight: 'bold', mt: 1 }}
              >
                Resta: ${selectedDeposit.remaining.toFixed(2)}
              </Typography>
            </Box>

            <RadioGroup
              value={remainderMethod}
              onChange={(e) => setRemainderMethod(e.target.value)}
            >
              <FormControlLabel
                value="efectivo"
                control={<Radio />}
                label="Efectivo"
              />
              <FormControlLabel
                value="transferencia"
                control={<Radio />}
                label="Transferencia Bancaria"
              />
              <FormControlLabel
                value="posnet"
                control={<Radio />}
                label="POSNet"
              />
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
          {savingRemainder ? (
            <CircularProgress size={20} />
          ) : (
            'Registrar Cobro'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
