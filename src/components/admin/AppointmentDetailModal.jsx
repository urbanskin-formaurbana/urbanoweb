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
import SafeDialog, { useSafeClose } from "../common/SafeDialog";
import SlideToConfirm from "../common/SlideToConfirm";
import paymentService from "../../services/payment_service";

const APPT_STATUS_LABEL = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "No se presentó",
};
const APPT_STATUS_COLOR = {
  pending: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "default",
  no_show: "error",
};

const PAYMENT_STATUS_LABEL = {
  paid: "Pagado",
  awaiting_payment: "Pend. de pago",
  partial: "Pago parcial",
};
const PAYMENT_STATUS_COLOR = {
  paid: "success",
  awaiting_payment: "warning",
  partial: "warning",
};

const METHOD_LABEL = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  posnet: "POSNet",
  mercadopago: "MercadoPago",
  deposit: "Depósito",
};
const PLAN_LABEL = {
  full_now: "Pago completo",
  pay_later: "Pagar después",
  deposit: "Depósito",
};
const PAYMENT_STATUS_LABEL_FULL = {
  completed: "Confirmado",
  pending: "Pendiente",
  rejected: "Rechazado",
};
const PAYMENT_STATUS_COLOR_FULL = {
  completed: "success",
  pending: "warning",
  rejected: "default",
};

function fmt(raw, opts) {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("es-UY", opts);
}

function fmtFull(raw) {
  return fmt(raw, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShort(raw) {
  return fmt(raw, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// A label+value row inside a Section grid. Returns null if value is empty.
function Row({ label, value, valueColor, mono }) {
  if (value == null || value === "" || value === false) return null;
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        color={valueColor || "text.primary"}
        align="right"
        sx={mono ? { fontFamily: "monospace", fontSize: "0.8rem" } : {}}
      >
        {value}
      </Typography>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight="bold"
      sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.75 }}
    >
      {children}
    </Typography>
  );
}

function Grid({ children }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 2, rowGap: 0.5 }}>
      {children}
    </Box>
  );
}

function CloseButton() {
  const close = useSafeClose();
  return <Button onClick={close}>Cerrar</Button>;
}

export default function AppointmentDetailModal({ open, appointmentId, payment, onClose, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    paymentService
      .getAppointmentPaymentHistory(appointmentId)
      .then(setData)
      .catch(() => setError("No se pudieron cargar los datos del turno"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !appointmentId) return;
    setData(null);
    setError(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentId]);

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await paymentService.deletePayment(id);
      load();
      onDeleted?.();
    } catch {
      setError("No se pudo borrar el registro");
    }
  };

  const appt = data?.appointment;
  const payments = data?.payments || [];
  const summary = data?.summary;

  const customerName = payment?.customer?.full_name || payment?.customer_name || "Detalle del turno";
  // Payment carries the treatment name/category reliably; appointment doc may not have them denormalized.
  const treatmentName = appt?.treatment_name || payment?.treatment?.name || payment?.treatment_name;
  const categoryLabel = appt?.treatment_category_label || appt?.treatment_category;

  return (
    <SafeDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>{customerName}</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && appt && (
          <>
            {/* ── Status chips ──────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                label={APPT_STATUS_LABEL[appt.status] || appt.status}
                color={APPT_STATUS_COLOR[appt.status] || "default"}
                size="small"
              />
              <Chip
                label={PAYMENT_STATUS_LABEL[appt.payment_status] || appt.payment_status}
                color={PAYMENT_STATUS_COLOR[appt.payment_status] || "default"}
                size="small"
                variant="outlined"
              />
              {appt.is_evaluation && (
                <Chip label="Evaluación" size="small" color="info" variant="outlined" />
              )}
              {appt.is_cuponera_session && (
                <Chip label="Cuponera" size="small" color="secondary" variant="outlined" />
              )}
              {appt.allow_confirm_without_payment && (
                <Chip label="Confirmar sin pago" size="small" variant="outlined" />
              )}
            </Box>

            {/* ── Turno ────────────────────────────────────────────── */}
            <SectionLabel>Turno</SectionLabel>
            <Grid>
              <Row label="Tratamiento" value={treatmentName} />
              <Row label="Categoría" value={categoryLabel} />
              <Row label="Tipo" value={appt.treatment_item_type} />
              <Row label="Fecha y hora" value={fmtFull(appt.scheduled_at)} />
              <Row
                label="Duración"
                value={appt.duration_minutes ? `${appt.duration_minutes} min` : null}
              />
              <Row label="Agendado el" value={fmtShort(appt.created_at)} />
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* ── Pago ─────────────────────────────────────────────── */}
            <SectionLabel>Pago</SectionLabel>
            <Grid>
              <Row
                label="Método esperado"
                value={METHOD_LABEL[appt.payment_method_expected] || appt.payment_method_expected}
              />
              <Row label="Plan" value={PLAN_LABEL[appt.payment_plan] || appt.payment_plan} />
              {summary && (
                <>
                  <Row
                    label="Total contratado"
                    value={summary.total_amount > 0 ? `$${summary.total_amount.toFixed(2)}` : null}
                  />
                  <Row
                    label="Total pagado"
                    value={`$${summary.total_paid.toFixed(2)}`}
                    valueColor="success.main"
                  />
                  {summary.total_discounted > 0 && (
                    <Row
                      label="Descuento"
                      value={`-$${summary.total_discounted.toFixed(2)}`}
                      valueColor="text.secondary"
                    />
                  )}
                  <Row
                    label="Restante"
                    value={`$${summary.remaining.toFixed(2)}`}
                    valueColor={summary.remaining > 0 ? "error" : "success.main"}
                  />
                </>
              )}
            </Grid>

            {/* ── Pagos individuales ───────────────────────────────── */}
            {payments.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <SectionLabel>Registros de pago</SectionLabel>
                <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {payments.map((p, idx) => (
                    <Box
                      key={p.id || idx}
                      component="li"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1,
                        py: 0.75,
                        borderBottom: idx < payments.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {METHOD_LABEL[p.payment_method] || p.payment_method || "—"}
                          {" · "}
                          <span style={{ fontWeight: 400 }}>${(p.amount || 0).toFixed(2)}</span>
                        </Typography>
                        {p.discount_applied > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Descuento: ${p.discount_applied.toFixed(2)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {fmtShort(p.created_at) || "—"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip
                          label={PAYMENT_STATUS_LABEL_FULL[p.status] || p.status}
                          color={PAYMENT_STATUS_COLOR_FULL[p.status] || "default"}
                          size="small"
                        />
                        {p.id && (
                          <Tooltip title="Borrar registro">
                            <IconButton size="small" color="error" onClick={(e) => { e.currentTarget.blur(); setDeleteTarget(p); }}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* ── Cuponera ─────────────────────────────────────────── */}
            {appt.is_cuponera_session && (
              <>
                <Divider sx={{ my: 2 }} />
                <SectionLabel>Cuponera</SectionLabel>
                <Grid>
                  <Row label="Paquete" value={appt.package_name} />
                  <Row
                    label="Sesión"
                    value={
                      appt.session_number != null && appt.total_sessions != null
                        ? `${appt.session_number} de ${appt.total_sessions}`
                        : null
                    }
                  />
                  <Row
                    label="Restantes"
                    value={appt.remaining_sessions != null ? String(appt.remaining_sessions) : null}
                  />
                </Grid>
              </>
            )}

            {/* ── Agenda / confirmación ────────────────────────────── */}
            {(appt.confirmation_sent_at || appt.google_calendar_event_id || appt.calendar_added_by_user_at) && (
              <>
                <Divider sx={{ my: 2 }} />
                <SectionLabel>Comunicaciones</SectionLabel>
                <Grid>
                  <Row
                    label="Confirmación enviada"
                    value={fmtShort(appt.confirmation_sent_at)}
                  />
                  <Row
                    label="En Google Calendar"
                    value={appt.google_calendar_event_id ? "Sí" : null}
                  />
                  <Row
                    label="Ag. por cliente"
                    value={fmtShort(appt.calendar_added_by_user_at)}
                  />
                </Grid>
              </>
            )}

            {/* ── Cancelación ──────────────────────────────────────── */}
            {appt.cancellation_reason && (
              <>
                <Divider sx={{ my: 2 }} />
                <SectionLabel>Cancelación</SectionLabel>
                <Typography variant="body2">{appt.cancellation_reason}</Typography>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <CloseButton />
      </DialogActions>

      <SafeDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Borrar registro de pago</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Borrar{" "}
            <strong>
              {METHOD_LABEL[deleteTarget?.payment_method] || deleteTarget?.payment_method}
              {" · "}${(deleteTarget?.amount || 0).toFixed(2)}
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
