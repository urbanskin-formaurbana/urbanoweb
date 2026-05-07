import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

const METHOD_LABEL = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  posnet: "POSNet",
  mercadopago: "MercadoPago",
  deposit: "Depósito",
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

// Summary grid shared by single and grouped ledger cards
function ApptSummaryGrid({ contracted, paid, discounted }) {
  const remaining = Math.max(0, contracted - discounted - paid);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        rowGap: 0.25,
      }}
    >
      <Typography variant="caption" color="text.secondary">Contratado</Typography>
      <Typography variant="caption" align="right">${contracted.toFixed(2)}</Typography>

      <Typography variant="caption" color="text.secondary">Total pagado</Typography>
      <Typography variant="caption" color="success.main" fontWeight="bold" align="right">
        ${paid.toFixed(2)}
      </Typography>

      {discounted > 0 && (
        <>
          <Typography variant="caption" color="text.secondary">Descuento</Typography>
          <Typography variant="caption" color="text.secondary" align="right">
            -${discounted.toFixed(2)}
          </Typography>
        </>
      )}

      <Typography variant="caption" fontWeight="bold">Restante</Typography>
      <Typography
        variant="caption"
        fontWeight="bold"
        align="right"
        color={remaining > 0 ? "error" : "success.main"}
      >
        ${remaining.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default function PaymentCard({
  payment,
  allPayments,          // all payments for this appointment (may be >1)
  variant: variantProp,
  onAddRemainder,
  onOpenComprobante,
  onDelete,
  onViewAppointment,
}) {
  const variant = variantProp || deriveVariant(payment);
  const grouped = variant === "ledger" && allPayments && allPayments.length > 1;

  // Border colour: for grouped, drive off appointment payment_status
  let borderColor;
  if (grouped) {
    borderColor = payment.appointment?.payment_status === "paid" ? "#2e7d32" : "#ed6c02";
  } else {
    borderColor =
      variant === "ledger"
        ? BORDER_COLOR.ledger[payment.status] || "#9e9e9e"
        : BORDER_COLOR[variant];
  }

  // Header chip
  let chipLabel, chipColor;
  if (grouped) {
    const apptStatus = payment.appointment?.payment_status;
    chipLabel = apptStatus === "paid" ? "Pagado" : "Pend. de pago";
    chipColor = apptStatus === "paid" ? "success" : "warning";
  } else {
    chipLabel =
      variant === "deposit_owed"
        ? STATUS_LABEL.deposit_owed
        : variant === "transfer_pending"
          ? STATUS_LABEL.transfer_pending
          : STATUS_LABEL[payment.status] || payment.status;
    chipColor =
      variant === "deposit_owed" || variant === "transfer_pending"
        ? "warning"
        : statusChipColor(payment.status);
  }

  const customerName = payment.customer?.full_name || payment.customer_name || "—";
  const treatmentName = payment.treatment?.name || payment.treatment_name || "—";

  const hasComprobante = !!payment.comprobante_url;
  const hasPdf = hasComprobante && isPdf(payment);

  const canViewAppointment = !!onViewAppointment && !!payment.appointment?.id;

  const openComprobanteItem = (e) => {
    e?.stopPropagation();
    if (!hasComprobante || !onOpenComprobante) return;
    onOpenComprobante({
      id: payment.id,
      url: payment.comprobante_url,
      isPdf: hasPdf,
      status: payment.status,
    });
  };

  // Appointment-level totals (same across all payments in group)
  const contracted = payment.appointment?.total_amount || payment.full_amount || payment.amount || 0;
  const paid = payment.appt_total_paid || 0;
  const discounted = payment.appt_total_discounted || 0;

  return (
    <Card
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        ...(canViewAppointment && {
          cursor: "pointer",
          "&:hover": { boxShadow: 4 },
          transition: "box-shadow 0.15s",
        }),
      }}
      onClick={canViewAppointment ? () => onViewAppointment(payment.appointment.id) : undefined}
    >
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Chip label={chipLabel} color={chipColor} size="small" />
            {/* Delete only on standalone payments (no appointment); grouped cards delete via modal */}
            {onDelete && !payment.appointment?.id && (
              <Tooltip title="Borrar registro">
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); onDelete(payment); }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {treatmentName}
        </Typography>

        {/* ── GROUPED: multiple payments for the same appointment ── */}
        {grouped ? (
          <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            {/* Appointment date */}
            {payment.appointment?.scheduled_at && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Turno: {formatDateTime(payment.appointment.scheduled_at)}
              </Typography>
            )}

            {/* Individual payment rows (oldest first) */}
            {[...allPayments].reverse().map((p, idx) => (
              <Box
                key={p.id || idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.5,
                  borderTop: idx > 0 ? "1px solid #e8e8e8" : "none",
                }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>{METHOD_LABEL[p.payment_method] || p.payment_method}</strong>
                    {" · "}${(p.amount || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(p.created_at)}
                  </Typography>
                </Box>
                <Chip
                  label={STATUS_LABEL[p.status] || p.status}
                  color={statusChipColor(p.status)}
                  size="small"
                />
              </Box>
            ))}

            {/* Totals */}
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #e0e0e0" }}>
              <ApptSummaryGrid contracted={contracted} paid={paid} discounted={discounted} />
            </Box>
          </Box>
        ) : (
          /* ── SINGLE payment ── */
          <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            {variant === "deposit_owed" ? (
              <>
                <Typography variant="body2">
                  <strong>Depósito</strong> • Total: $
                  {(payment.full_amount || 0).toFixed(2)} • Pagado: $
                  {(payment.paid_amount || payment.amount || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="error" fontWeight="bold" sx={{ mt: 0.5 }}>
                  Falta: ${(payment.remaining || 0).toFixed(2)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2">
                  <strong>{METHOD_LABEL[payment.payment_method] || payment.payment_method || "—"}</strong>
                  {" "}• Monto: ${(payment.amount || 0).toFixed(2)}
                </Typography>

                {variant === "transfer_scheduled" && payment.appointment && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Turno: {formatDateTime(payment.appointment.scheduled_at)}
                  </Typography>
                )}

                {variant === "transfer_pending" && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Subido: {formatDate(payment.created_at)}
                  </Typography>
                )}

                {variant === "ledger" && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Fecha: {formatDate(payment.created_at)}
                  </Typography>
                )}

                {variant === "ledger" && payment.appointment && payment.appt_total_paid != null && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #e0e0e0" }}>
                    <ApptSummaryGrid contracted={contracted} paid={paid} discounted={discounted} />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* Appointment chip row for transfer_scheduled / single ledger */}
        {!grouped && (variant === "transfer_scheduled" || variant === "ledger") && payment.appointment && (
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {payment.appointment.payment_status && (
              <Chip
                label={payment.appointment.payment_status}
                size="small"
                color={payment.appointment.payment_status === "paid" ? "success" : "default"}
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
                onClick={(e) => openComprobanteItem(e)}
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ gap: 1, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
        {variant === "deposit_owed" && onAddRemainder && (
          <Button size="small" variant="contained" color="primary" onClick={() => onAddRemainder(payment)}>
            Agregar cobro
          </Button>
        )}
        {variant === "transfer_pending" && hasComprobante && onOpenComprobante && (
          <Button size="small" variant="contained" color="primary" onClick={openComprobanteItem}>
            Ver comprobante
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
