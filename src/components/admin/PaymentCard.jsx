import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import HistoryIcon from "@mui/icons-material/History";

function deriveVariant(payment) {
  if (payment.is_deposit && payment.is_remainder_owed) return "deposit_owed";
  if (
    payment.payment_method === "transferencia" &&
    payment.status === "pending" &&
    payment.comprobante_url
  )
    return "transfer_pending";
  if (payment.payment_method === "transferencia" && payment.appointment)
    return "transfer_scheduled";
  return "ledger";
}

const BORDER_COLOR = {
  deposit_owed: "#ed6c02",
  transfer_pending: "#ed6c02",
  transfer_scheduled: "#1976d2",
  ledger: {
    completed: "#2e7d32",
    rejected: "#9e9e9e",
    pending: "#ed6c02",
  },
};

const STATUS_LABEL = {
  deposit_owed: "Saldo pendiente",
  transfer_pending: "Pendiente verificación",
  completed: "Confirmado",
  rejected: "Rechazado",
  pending: "Pendiente",
};

function statusChipColor(status) {
  if (status === "completed") return "success";
  if (status === "rejected") return "default";
  return "warning";
}

function formatDate(raw, opts) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("es-UY", opts || {});
}

function formatDateTime(raw) {
  return formatDate(raw, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPdf(payment) {
  return (
    /\.pdf($|\?)/i.test(payment.comprobante_url || "") ||
    (payment.comprobante_filename || "").endsWith(".pdf")
  );
}

export default function PaymentCard({
  payment,
  variant: variantProp,
  onAddRemainder,
  onOpenComprobante,
  onOpenHistory,
}) {
  const variant = variantProp || deriveVariant(payment);

  const borderColor =
    variant === "ledger"
      ? BORDER_COLOR.ledger[payment.status] || "#9e9e9e"
      : BORDER_COLOR[variant];

  const chipLabel =
    variant === "deposit_owed"
      ? STATUS_LABEL.deposit_owed
      : variant === "transfer_pending"
        ? STATUS_LABEL.transfer_pending
        : STATUS_LABEL[payment.status] || payment.status;

  const chipColor =
    variant === "deposit_owed" || variant === "transfer_pending"
      ? "warning"
      : statusChipColor(payment.status);

  const customerName =
    payment.customer?.full_name || payment.customer_name || "—";

  const treatmentName =
    payment.treatment?.name || payment.treatment_name || "—";

  const hasComprobante = !!payment.comprobante_url;
  const hasPdf = hasComprobante && isPdf(payment);

  const openComprobanteItem = () => {
    if (!hasComprobante || !onOpenComprobante) return;
    onOpenComprobante({
      id: payment.id,
      url: payment.comprobante_url,
      isPdf: hasPdf,
      status: payment.status,
    });
  };

  return (
    <Card sx={{ borderLeft: `4px solid ${borderColor}` }}>
      <CardContent>
        {/* Header row: name + status chip */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {customerName}
          </Typography>
          <Chip label={chipLabel} color={chipColor} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {treatmentName}
        </Typography>

        {/* Amount summary */}
        <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          {variant === "deposit_owed" ? (
            <>
              <Typography variant="body2">
                <strong>Depósito</strong> • Total: $
                {(payment.full_amount || 0).toFixed(2)} • Pagado: $
                {(payment.paid_amount || payment.amount || 0).toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                color="error"
                fontWeight="bold"
                sx={{ mt: 0.5 }}
              >
                Falta: ${(payment.remaining || 0).toFixed(2)}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2">
                <strong>
                  {payment.payment_method === "transferencia"
                    ? "Transferencia"
                    : payment.payment_method === "efectivo"
                      ? "Efectivo"
                      : payment.payment_method === "posnet"
                        ? "POSNet"
                        : payment.payment_method === "mercadopago"
                          ? "MercadoPago"
                          : payment.payment_method || "—"}
                </strong>{" "}
                • Monto: ${(payment.amount || 0).toFixed(2)}
              </Typography>

              {variant === "transfer_scheduled" && payment.appointment && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Turno: {formatDateTime(payment.appointment.scheduled_at)}
                </Typography>
              )}

              {variant === "transfer_pending" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Subido: {formatDate(payment.created_at)}
                </Typography>
              )}

              {variant === "ledger" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Fecha: {formatDate(payment.created_at)}
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Appointment chip row for transfer_scheduled / ledger */}
        {(variant === "transfer_scheduled" || variant === "ledger") &&
          payment.appointment && (
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {payment.appointment.payment_status && (
                <Chip
                  label={payment.appointment.payment_status}
                  size="small"
                  color={
                    payment.appointment.payment_status === "paid"
                      ? "success"
                      : "default"
                  }
                />
              )}
            </Box>
          )}

        {/* Comprobante thumbnail / chip */}
        {hasComprobante && (
          <Box sx={{ mt: 1 }}>
            {hasPdf ? (
              <Chip
                icon={<PictureAsPdfIcon />}
                label="Ver comprobante PDF"
                size="small"
                clickable
                onClick={openComprobanteItem}
              />
            ) : (
              <Box
                component="img"
                src={payment.comprobante_url}
                alt="Comprobante"
                sx={{
                  maxWidth: "80px",
                  maxHeight: "80px",
                  objectFit: "contain",
                  cursor: onOpenComprobante ? "pointer" : "default",
                }}
                onClick={openComprobanteItem}
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ gap: 1, flexWrap: "wrap" }}>
        {/* Bandeja-only actions */}
        {variant === "deposit_owed" && onAddRemainder && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => onAddRemainder(payment)}
          >
            Agregar cobro
          </Button>
        )}

        {variant === "transfer_pending" && hasComprobante && onOpenComprobante && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={openComprobanteItem}
          >
            Ver comprobante
          </Button>
        )}

        {/* History button — shown when appointment present and handler provided */}
        {payment.appointment?.id && onOpenHistory && (
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => onOpenHistory(payment.appointment.id)}
          >
            Ver historial
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
