import { useEffect, useState } from 'react';
import {
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import AppointmentActions from './AppointmentActions';
import adminService from '../services/admin_service';
import logger from '../utils/logger';
import SafeDialog from './common/SafeDialog';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No presentado',
};

const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'error',
  no_show: 'error',
};

const PAYMENT_METHOD_LABELS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  posnet: 'POSNet',
  mercadopago: 'MercadoPago',
};

const PAYMENT_STATUS_LABELS = {
  paid: 'Pagado',
  awaiting_payment: 'Pago pendiente',
  partial: 'Parcial',
  refunded: 'Reembolsado',
};

function formatDate(iso) {
  if (!iso) return '—';
  return dayjs.utc(iso).tz('America/Montevideo').format('dddd, D [de] MMMM YYYY');
}

function formatTime(iso) {
  if (!iso) return '—';
  return dayjs.utc(iso).tz('America/Montevideo').format('HH:mm');
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return dayjs.utc(iso).tz('America/Montevideo').format('D MMM YYYY HH:mm');
}

function formatMoney(value) {
  if (value == null || isNaN(Number(value))) return '$0';
  return `$${Number(value).toLocaleString('es-UY', { minimumFractionDigits: 0 })}`;
}

function formatMethod(method) {
  return PAYMENT_METHOD_LABELS[method] || method || 'No definido';
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight: 700,
        color: 'text.secondary',
        display: 'block',
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

export default function AppointmentDetailModal({
  open,
  appointment,
  pendingDeposit,
  templates,
  categoryConfigs,
  confirming,
  onClose,
  onConfirm,
  onReschedule,
  onComplete,
  onNoShow,
  onOpenAddPayment,
}) {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (!open || !appointment?.id) {
      setPaymentHistory([]);
      setHistoryError(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const response = await adminService.getAppointmentPayments(appointment.id);
        if (!cancelled) setPaymentHistory(response.payments || []);
      } catch (err) {
        if (!cancelled) {
          if (!err.message?.includes('Session expired')) {
            logger.error('Error loading payment history', err);
          }
          setHistoryError('No se pudo cargar el historial de pagos');
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const statusColor = STATUS_COLORS[appointment.status] || 'default';
  const statusLabel = STATUS_LABELS[appointment.status] || appointment.status;

  const total = Number(appointment.total_amount ?? 0);
  const paid = Number(appointment.paid_amount ?? 0);
  const discount = Number(appointment.discount_amount ?? 0);
  const remaining = appointment.remaining_amount != null
    ? Number(appointment.remaining_amount)
    : Math.max(total - paid - discount, 0);

  const isCuponera =
    appointment.is_cuponera_session === true ||
    !!appointment.purchased_package_id;

  return (
    <SafeDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'relative', p: 3 }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ pr: 4, mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {appointment.customer_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appointment.treatment_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip label={statusLabel} color={statusColor} size="small" />
            {appointment.payment_status === 'awaiting_payment' && (
              <Chip
                icon={<WarningIcon />}
                label="Pago pendiente"
                color="warning"
                size="small"
              />
            )}
            {isCuponera && (
              <Chip label="Cuponera" color="info" size="small" variant="outlined" />
            )}
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
          <Box>
            <SectionTitle>Cliente</SectionTitle>
            <DetailRow label="Nombre" value={appointment.customer_name || '—'} />
            <DetailRow label="Teléfono" value={appointment.customer_phone || '—'} />
            <DetailRow label="Email" value={appointment.customer_email || '—'} />
          </Box>

          <Divider />

          <Box>
            <SectionTitle>Cita</SectionTitle>
            <DetailRow label="Fecha" value={formatDate(appointment.scheduled_at)} />
            <DetailRow label="Hora" value={formatTime(appointment.scheduled_at)} />
            <DetailRow
              label="Duración"
              value={appointment.duration_minutes ? `${appointment.duration_minutes} min` : '—'}
            />
            <DetailRow label="Tratamiento" value={appointment.treatment_name || '—'} />
            {appointment.treatment_category_label && (
              <DetailRow label="Categoría" value={appointment.treatment_category_label} />
            )}
            {appointment.assigned_employee_name && (
              <DetailRow label="Profesional" value={appointment.assigned_employee_name} />
            )}
            {appointment.is_evaluation && (
              <DetailRow label="Tipo" value="Evaluación inicial" />
            )}
            {appointment.session_number && appointment.total_sessions && (
              <DetailRow
                label="Sesión"
                value={`${appointment.session_number} de ${appointment.total_sessions}`}
              />
            )}
            {appointment.package_name && (
              <DetailRow label="Cuponera" value={appointment.package_name} />
            )}
            {appointment.reschedule_count > 0 && (
              <DetailRow
                label="Reprogramaciones"
                value={`${appointment.reschedule_count} ${appointment.reschedule_count === 1 ? 'vez' : 'veces'}`}
              />
            )}
            <DetailRow label="Creada" value={formatDateTime(appointment.created_at)} />
            {appointment.confirmation_sent_at && (
              <DetailRow label="Confirmada" value={formatDateTime(appointment.confirmation_sent_at)} />
            )}
          </Box>

          {!isCuponera && (
            <>
              <Divider />
              <Box>
                <SectionTitle>Resumen financiero</SectionTitle>
                <DetailRow
                  label="Estado de pago"
                  value={PAYMENT_STATUS_LABELS[appointment.payment_status] || appointment.payment_status || '—'}
                />
                {appointment.payment_method_expected && (
                  <DetailRow
                    label="Método esperado"
                    value={formatMethod(appointment.payment_method_expected)}
                  />
                )}
                <DetailRow label="Total" value={formatMoney(total)} />
                <DetailRow label="Pagado" value={formatMoney(paid)} />
                {discount > 0 && (
                  <DetailRow label="Descuento" value={formatMoney(discount)} />
                )}
                <DetailRow
                  label="Restante"
                  value={
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight={700}
                      color={remaining > 0 ? 'warning.main' : 'success.main'}
                    >
                      {formatMoney(remaining)}
                    </Typography>
                  }
                />
              </Box>
            </>
          )}

          <Divider />

          <Box>
            <SectionTitle>Historial de pagos</SectionTitle>
            {loadingHistory && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            {historyError && (
              <Alert severity="error" sx={{ mt: 1 }}>{historyError}</Alert>
            )}
            {!loadingHistory && !historyError && paymentHistory.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Sin pagos registrados aún.
              </Typography>
            )}
            {!loadingHistory && paymentHistory.length > 0 && (
              <Stack spacing={1}>
                {paymentHistory.map((p) => {
                  const isCompleted = p.status === 'completed' || p.status === 'paid';
                  const tag = p.is_deposit ? 'Seña' : p.is_remainder ? 'Saldo' : null;
                  return (
                    <Box
                      key={p.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1.25,
                        backgroundColor: 'background.default',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatMoney(p.amount)}
                          </Typography>
                          {tag && <Chip label={tag} size="small" variant="outlined" />}
                        </Box>
                        <Chip
                          size="small"
                          label={isCompleted ? 'Pagado' : (p.status || '—')}
                          color={isCompleted ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatMethod(p.payment_method)} · {formatDateTime(p.paid_at || p.created_at)}
                      </Typography>
                      {Number(p.discount_applied) > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Descuento aplicado: {formatMoney(p.discount_applied)}
                        </Typography>
                      )}
                      {p.mercadopago_payment_id && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          MP ID: {p.mercadopago_payment_id}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {appointment.admin_feedback && (
            <>
              <Divider />
              <Box>
                <SectionTitle>Feedback de la sesión</SectionTitle>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {appointment.admin_feedback}
                </Typography>
              </Box>
            </>
          )}

          {appointment.cancellation_reason && (
            <>
              <Divider />
              <Box>
                <SectionTitle>Motivo de cancelación</SectionTitle>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {appointment.cancellation_reason}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <Box sx={{ p: 2 }}>
        <AppointmentActions
          appointment={appointment}
          pendingDeposit={pendingDeposit}
          templates={templates}
          categoryConfigs={categoryConfigs}
          confirming={confirming}
          onConfirm={(id) => { onConfirm(id); onClose(); }}
          onReschedule={(appt) => { onClose(); onReschedule(appt); }}
          onComplete={(appt) => { onClose(); onComplete(appt); }}
          onNoShow={(appt) => { onClose(); onNoShow(appt); }}
          onOpenAddPayment={(ctx) => { onClose(); onOpenAddPayment(ctx); }}
        />
      </Box>
    </SafeDialog>
  );
}
