import { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import paymentService from "../../services/payment_service";
import SafeDialog from "../common/SafeDialog";
import SlideToConfirm from "../common/SlideToConfirm";

const METHOD_LABEL = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  posnet: "POSNet",
  mercadopago: "MercadoPago",
  deposit: "Depósito",
};

function statusChipColor(status) {
  if (status === "completed") return "success";
  if (status === "rejected") return "default";
  return "warning";
}

function statusLabel(status) {
  if (status === "completed") return "Confirmado";
  if (status === "rejected") return "Rechazado";
  if (status === "pending") return "Pendiente";
  return status;
}

function formatDateTime(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("es-UY", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentHistoryModal({ open, onClose, appointmentId, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    paymentService
      .getAppointmentPaymentHistory(appointmentId)
      .then(setData)
      .catch(() => setError("No se pudo cargar el historial"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !appointmentId) return;
    setData(null);
    setError(null);
    setLoading(true);
    paymentService
      .getAppointmentPaymentHistory(appointmentId)
      .then(setData)
      .catch(() => setError("No se pudo cargar el historial"))
      .finally(() => setLoading(false));
  }, [open, appointmentId]);

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await paymentService.deletePayment(id);
      reload();
      if (onDeleted) onDeleted(id);
    } catch {
      setError("No se pudo borrar el registro");
    }
  };

  const appt = data?.appointment;
  const payments = data?.payments || [];
  const summary = data?.summary;

  return (
    <SafeDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Historial de pagos del turno</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && data && (
          <>
            {/* Appointment header */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Turno: {formatDateTime(appt?.scheduled_at)}
              </Typography>
              {appt?.treatment_name && (
                <Typography variant="body2" color="text.secondary">
                  Tratamiento: {appt.treatment_name}
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Payment timeline */}
            {payments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                Sin registros de pago
              </Typography>
            ) : (
              <Box
                component="ol"
                sx={{ listStyle: "none", p: 0, m: 0 }}
              >
                {payments.map((p, idx) => (
                  <Box
                    key={p.id || idx}
                    component="li"
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      mb: 1.5,
                      pl: 1,
                      borderLeft: "2px solid #e0e0e0",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {METHOD_LABEL[p.payment_method] ||
                            p.payment_method ||
                            "—"}{" "}
                          • ${(p.amount || 0).toFixed(2)}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Chip
                            label={statusLabel(p.status)}
                            color={statusChipColor(p.status)}
                            size="small"
                          />
                          {p.id && (
                            <Tooltip title="Borrar este registro">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(p)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      {p.discount_applied > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Descuento: ${p.discount_applied.toFixed(2)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatDateTime(p.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Summary footer */}
            {summary && (
              <>
                <Divider sx={{ mt: 2, mb: 1.5 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total contratado
                  </Typography>
                  <Typography variant="body2" align="right">
                    ${summary.total_amount.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Pagado
                  </Typography>
                  <Typography variant="body2" color="success.main" align="right">
                    ${summary.total_paid.toFixed(2)}
                  </Typography>

                  {summary.total_discounted > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Descontado
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="right"
                      >
                        ${summary.total_discounted.toFixed(2)}
                      </Typography>
                    </>
                  )}

                  <Typography variant="body2" fontWeight="bold">
                    Restante
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={summary.remaining > 0 ? "error" : "success.main"}
                    align="right"
                  >
                    ${summary.remaining.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>

      {/* Delete confirmation */}
      <SafeDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Borrar registro de pago</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Borrar{" "}
            <strong>
              {METHOD_LABEL[deleteTarget?.payment_method] || deleteTarget?.payment_method}
              {" "}• ${(deleteTarget?.amount || 0).toFixed(2)}
            </strong>
            ? Esta acción es irreversible.
          </Typography>
          <SlideToConfirm
            key={deleteTarget?.id}
            label="Deslizá para borrar"
            onConfirm={handleDeleteConfirmed}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        </DialogActions>
      </SafeDialog>
    </SafeDialog>
  );
}
