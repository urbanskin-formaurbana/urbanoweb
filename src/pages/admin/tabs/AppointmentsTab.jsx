import { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  Typography,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import DepositRemainderModal from '../../../components/DepositRemainderModal';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import WarningIcon from '@mui/icons-material/Warning';
import adminService from '../../../services/admin_service';
import paymentService from '../../../services/payment_service';
import CreateAppointmentModal from '../../../components/CreateAppointmentModal';
import AppointmentDetailModal from '../../../components/AppointmentDetailModal';
import AppointmentActions from '../../../components/AppointmentActions';
import DateTimeSlotPicker from '../../../components/DateTimeSlotPicker';
import { filterSlotsForEmployee } from '../../../utils/slotUtils';
import {
  TEMPLATE_USAGES,
  normalizeTemplate,
  resolveConfirmationTemplate,
  formatTemplateMessage,
} from '../../../utils/messageTemplates';
import logger from '../../../utils/logger';
import analytics from '../../../utils/analytics';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const STATUS_FILTERS = {
  pending: 'pending',
  confirmed: 'confirmed',
  all: null,
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'error',
};

const PAYMENT_METHOD_LABELS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  posnet: 'POSNet',
};

function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, '');

  // Already in international format (7-15 digits, possibly with country code)
  if (digits.length >= 7 && digits.length <= 15) {
    return digits;
  }

  // Handle Uruguay legacy formats
  if (digits.startsWith('09')) {
    // 09XXXXXXXX (9-digit) -> 598 9XXXXXXXX (Uruguay)
    digits = '598' + digits.slice(1);
  } else if (digits.length === 8) {
    // 8-digit number -> assume Uruguay (598)
    digits = '598' + digits;
  }

  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

function formatAppointmentDate(isoString) {
  // Convert UTC to America/Montevideo timezone
  const utcDate = dayjs.utc(isoString);
  const localDate = utcDate.tz('America/Montevideo');
  return localDate.format('dddd, D [de] MMMM');
}

function formatAppointmentTime(isoString) {
  // Convert UTC to America/Montevideo timezone
  const utcDate = dayjs.utc(isoString);
  const localDate = utcDate.tz('America/Montevideo');
  return localDate.format('HH:mm');
}

function formatPaymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] || method || 'No definido';
}

const REGULAR_CATEGORIES = new Set(['body', 'facial', 'complementarios']);

function treatmentFromAppointment(appt) {
  if (!appt) return null;
  const category = appt.treatment_category ?? null;
  const itemType = appt.treatment_item_type ?? null;
  return {
    // If item_type not in API response yet, infer from category:
    // any category that isn't a regular one (body/facial/complementarios) is a campaign
    item_type: itemType ?? (category && !REGULAR_CATEGORIES.has(category) ? category : null),
    category,
    duration_minutes: appt.duration_minutes ?? 90,
  };
}

function AppointmentCard({
  appointment,
  onConfirm,
  confirming,
  templates,
  categoryConfigs,
  onReschedule,
  onComplete,
  onNoShow,
  onOpenAddPayment,
  pendingDeposit,
  onGoToPagos,
  onApproveTransfer,
  approvingTransferId,
  onOpenDetail,
}) {
  const statusColor = STATUS_COLORS[appointment.status] || 'default';
  const statusLabel = STATUS_LABELS[appointment.status] || appointment.status;
  const borderColor = {
    pending: '#ed6c02',
    confirmed: '#2e7d32',
    completed: '#9e9e9e',
    cancelled: '#d32f2f',
  }[appointment.status] || '#9e9e9e';

  const payOnArrival =
    appointment.payment_method_expected === 'efectivo' ||
    appointment.payment_method_expected === 'posnet';
  const allowConfirmWithoutPayment =
    appointment.allow_confirm_without_payment === true || payOnArrival;
  const blockedAwaitingTransfer =
    appointment.status === 'pending' &&
    appointment.payment_status === 'awaiting_payment' &&
    !allowConfirmWithoutPayment;

  const stop = (e) => e.stopPropagation();

  return (
    <Card
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={() => onOpenDetail(appointment)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {appointment.customer_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {appointment.payment_status === 'awaiting_payment' && (
              <Chip
                icon={<WarningIcon />}
                label="Pago pendiente"
                color="warning"
                size="small"
              />
            )}
            <Chip label={statusLabel} color={statusColor} size="small" />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {appointment.treatment_name}
        </Typography>

        <Typography variant="body2">
          {formatAppointmentDate(appointment.scheduled_at)} • {formatAppointmentTime(appointment.scheduled_at)}
        </Typography>

        {appointment.duration_minutes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Duración: {appointment.duration_minutes} min
          </Typography>
        )}

        {appointment.reschedule_count > 0 && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            Reprogramada {appointment.reschedule_count} {appointment.reschedule_count === 1 ? 'vez' : 'veces'}
          </Typography>
        )}

        {appointment.assigned_employee_name && (
          <Chip
            size="small"
            label={`Asignada: ${appointment.assigned_employee_name}`}
            variant="outlined"
            color="primary"
            sx={{ mt: 0.5 }}
          />
        )}

        {appointment.payment_status === 'awaiting_payment' && (
          <Box sx={{ mt: 1, p: 1, backgroundColor: '#fff3cd', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Método esperado: {formatPaymentMethodLabel(appointment.payment_method_expected)}
            </Typography>
          </Box>
        )}

        {blockedAwaitingTransfer && (
          <Alert
            severity="warning"
            sx={{ mt: 1 }}
            onClick={stop}
            action={
              onGoToPagos ? (
                <Button color="inherit" size="small" onClick={(e) => { stop(e); onGoToPagos(); }}>
                  Ir a Pagos
                </Button>
              ) : null
            }
          >
            Confirmá el pago en la pestaña <strong>Pagos</strong> antes de
            confirmar el turno.
          </Alert>
        )}
      </CardContent>

      <CardActions
        onClick={stop}
        sx={{
          gap: 0.5,
          flexWrap: 'nowrap',
          overflow: 'auto',
        }}
      >
        <AppointmentActions
          appointment={appointment}
          pendingDeposit={pendingDeposit}
          templates={templates}
          categoryConfigs={categoryConfigs}
          confirming={confirming}
          onConfirm={onConfirm}
          onReschedule={onReschedule}
          onComplete={onComplete}
          onNoShow={onNoShow}
          onOpenAddPayment={onOpenAddPayment}
          onApproveTransfer={onApproveTransfer}
          approvingTransferId={approvingTransferId}
          sx={{ flexWrap: 'nowrap' }}
        />
      </CardActions>
    </Card>
  );
}

function closeDialogSafely(closerFn) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  const trap = (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.blur();
    }
  };
  document.addEventListener('focus', trap, true);
  requestAnimationFrame(() => {
    closerFn();
    setTimeout(() => document.removeEventListener('focus', trap, true), 100);
  });
}

export default function AppointmentsTab({ activeTab, onGoToPagos }) {
  const [appointments, setAppointments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categoryConfigs, setCategoryConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const rescheduleTreatment = useMemo(
    () => treatmentFromAppointment(selectedAppointmentForReschedule),
    [selectedAppointmentForReschedule]
  );

  // Complete appointment modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedAppointmentForCompletion, setSelectedAppointmentForCompletion] = useState(null);
  const [completionFeedback, setCompletionFeedback] = useState('');
  const [completing, setCompleting] = useState(false);

  // Create appointment modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Appointment detail modal state
  const [detailModalAppointment, setDetailModalAppointment] = useState(null);

  // Deposit remainder modal state

  const [depositRemainderModalOpen, setDepositRemainderModalOpen] = useState(false);
  const [completeAfterPayment, setCompleteAfterPayment] = useState(false);
  const [approvingTransferId, setApprovingTransferId] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [remainderMethod, setRemainderMethod] = useState('efectivo');
  const [remainderAmount, setRemainderAmount] = useState('');
  const [remainderDiscount, setRemainderDiscount] = useState('');
  const [savingRemainder, setSavingRemainder] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const normalizedTemplates = useMemo(
    () => (templates || []).map(normalizeTemplate).filter(Boolean),
    [templates]
  );
  const manualTemplates = useMemo(
    () => normalizedTemplates.filter((template) => template.usage_type === TEMPLATE_USAGES.MANUAL_SEND),
    [normalizedTemplates]
  );

  // Payments/PAGOS tab state

  const tabStatuses = [STATUS_FILTERS.pending, STATUS_FILTERS.confirmed, STATUS_FILTERS.all];
  const currentStatus = tabStatuses[activeTab];

  useEffect(() => {
    loadTemplates();
    loadAppointments();
    loadPendingDeposits();
  }, [currentStatus]);

  useEffect(() => {
    loadCategoryConfigs();
  }, []);

  const loadPendingDeposits = async () => {
    try {
      const response = await paymentService.getPendingDeposits();
      setPendingDeposits(response.deposits || []);
    } catch (err) {
      // Only log if it's not a session expiration error
      if (!err.message?.includes('Session expired')) {
        logger.error('Error loading pending deposits', err);
      }
    }
  };


  // Prevent icon buttons from receiving focus when dialog is open
  useEffect(() => {
    if (!rescheduleModalOpen) return;

    const handleFocus = (e) => {
      if (e.target.closest('[class*="MuiIconButton"]')) {
        e.target.blur();
      }
    };

    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, [rescheduleModalOpen]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAppointments(currentStatus);
      setAppointments(response.appointments || []);
    } catch (err) {
      // Only log if it's not a session expiration error
      if (!err.message?.includes('Session expired')) {
        logger.error('Error loading appointments', err);
      }
      setError('No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };


  const loadTemplates = async () => {
    try {
      const response = await adminService.getMessageTemplates();
      setTemplates(response.templates || []);
    } catch (err) {
      // Only log if it's not a session expiration error
      if (!err.message?.includes('Session expired')) {
        logger.error('Error loading templates', err);
      }
    }
  };

  const loadCategoryConfigs = async () => {
    try {
      const configs = await adminService.getCategoryConfigs();
      setCategoryConfigs(configs || []);
    } catch (err) {
      if (!err.message?.includes('Session expired')) {
        logger.error('Error loading category configs', err);
      }
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    const existingAppointment = appointments.find(a => a.id === appointmentId);

    // Normal confirmation flow
    const phone = existingAppointment
      ? formatPhoneForWhatsApp(existingAppointment.customer_phone)
      : null;

    if (existingAppointment && phone) {
      const confirmationTemplate = resolveConfirmationTemplate(
        normalizedTemplates,
        existingAppointment.treatment_category
      );

      if (!confirmationTemplate) {
        setError(
          'No hay plantilla de confirmación para este producto ni plantilla por defecto. Configúrala en Plantillas.'
        );
        return;
      }

      const formattedMessage = formatTemplateMessage(
        confirmationTemplate.message,
        existingAppointment,
        categoryConfigs
      );

      if (!formattedMessage.trim()) {
        setError('La plantilla de confirmación seleccionada está vacía');
        return;
      }

      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
      analytics.trackWhatsAppClick({
        source: 'admin_confirm',
        context: { appointmentId },
      });
      window.open(waLink, '_blank', 'noopener,noreferrer');
    }

    setConfirming(appointmentId);
    try {
      await adminService.confirmAppointment(appointmentId);
      analytics.trackAppointmentConfirmed({
        appointmentId,
        treatmentSlug: existingAppointment?.treatment_slug,
      });
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      setSuccessMessage('Cita confirmada correctamente.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      logger.error('Error confirming appointment', err);
      setError('No se pudo confirmar la cita');
    } finally {
      setConfirming(null);
    }
  };

  const handleRescheduleClick = (appointment) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedAppointmentForReschedule(appointment);
    const utcTime = dayjs.utc(appointment.scheduled_at);
    const localTime = utcTime.tz('America/Montevideo');
    setRescheduleDate(localTime);
    const roundedMinute = localTime.minute() < 15 ? 0 : localTime.minute() < 45 ? 30 : 0;
    const roundedHour = localTime.minute() >= 45 ? localTime.hour() + 1 : localTime.hour();
    setRescheduleTime(dayjs.tz(`${localTime.format('YYYY-MM-DD')} ${String(roundedHour).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`, 'YYYY-MM-DD HH:mm', 'America/Montevideo'));
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => closeDialogSafely(() => {
    setRescheduleModalOpen(false);
    setRescheduleDate(null);
    setRescheduleTime(null);
  });

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setError('Por favor selecciona una nueva fecha y hora');
      return;
    }

    setRescheduling(true);
    try {
      const dateStr = rescheduleDate.format('YYYY-MM-DD');
      const timeStr = rescheduleTime.format('HH:mm');
      const localTime = dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'America/Montevideo');
      const utcTime = localTime.utc();
      const newDateTime = utcTime.toISOString();
      await adminService.rescheduleAppointment(selectedAppointmentForReschedule.id, newDateTime);
      analytics.trackAppointmentRescheduled({
        appointmentId: selectedAppointmentForReschedule.id,
        actor: 'admin',
        treatmentSlug: selectedAppointmentForReschedule.treatment_slug,
        oldScheduledAt: selectedAppointmentForReschedule.scheduled_at,
        newScheduledAt: newDateTime,
      });

      setAppointments(prev => prev.filter(appt => appt.id !== selectedAppointmentForReschedule.id));
      setSuccessMessage('Cita reagendada correctamente.');
      closeRescheduleModal();
      setSelectedAppointmentForReschedule(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      logger.error('Error rescheduling appointment', err);
      setError('No se pudo reagendar la cita');
    } finally {
      setRescheduling(false);
    }
  };

  const handleCompleteClick = (appointment) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedAppointmentForCompletion(appointment);
    setCompletionFeedback('');

    // Confirmed cash/transfer/posnet appointments still owe a payment when the
    // customer arrives. Route through the same "Agregar Pago" modal the card
    // exposes so the admin records the cobro before logging session feedback.
    if (appointment.payment_status === 'awaiting_payment') {
      const total = Number(appointment.total_amount ?? 0);
      const paid = Number(appointment.paid_amount ?? 0);
      const discount = Number(appointment.discount_amount ?? 0);
      const remaining =
        appointment.remaining_amount != null
          ? Number(appointment.remaining_amount)
          : Math.max(total - paid - discount, 0);
      handleOpenAddPayment(
        {
          appointment_id: appointment.id,
          customer_name: appointment.customer_name,
          treatment_name: appointment.treatment_name,
          full_amount: total,
          paid_amount: paid,
          discount_amount: discount,
          remaining,
        },
        {
          method: appointment.payment_method_expected || 'efectivo',
          completeAfter: true,
        },
      );
      return;
    }

    setCompleteModalOpen(true);
  };

  const closeCompleteModal = () => closeDialogSafely(() => {
    setCompleteModalOpen(false);
    setSelectedAppointmentForCompletion(null);
    setCompletionFeedback('');
  });

  const handleNoShowClick = async (appointment) => {
    if (!window.confirm(`¿Marcar la cita de ${appointment.customer_name} como no presentado?`)) {
      return;
    }
    try {
      await adminService.markNoShow(appointment.id);
      analytics.trackAppointmentNoShow({
        appointmentId: appointment.id,
        treatmentSlug: appointment.treatment_slug,
      });
      setSuccessMessage('Cita marcada como no presentado');
      loadAppointments();
    } catch (error) {
      logger.error('Error marking no-show', error);
      setError('Error al marcar como no presentado');
    }
  };



  const handleCompleteAppointment = async () => {
    if (!completionFeedback.trim()) {
      setError('Por favor agrega feedback sobre la sesión');
      return;
    }

    setCompleting(true);
    try {
      await adminService.completeAppointment(
        selectedAppointmentForCompletion.id,
        completionFeedback
      );
      analytics.trackAppointmentCompleted({
        appointmentId: selectedAppointmentForCompletion.id,
        treatmentSlug: selectedAppointmentForCompletion.treatment_slug,
      });

      setAppointments(prev =>
        prev.filter(appt => appt.id !== selectedAppointmentForCompletion.id)
      );

      setSuccessMessage('Cita marcada como completada.');
      closeCompleteModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      logger.error('Error completing appointment', err);
      setError('No se pudo completar la cita');
    } finally {
      setCompleting(false);
    }
  };

  const handleOpenAddPayment = (paymentContext, options = {}) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedDeposit(paymentContext);
    setRemainderAmount((paymentContext.remaining || 0).toString());
    setRemainderMethod(options.method || 'efectivo');
    setRemainderDiscount('');
    setCompleteAfterPayment(options.completeAfter === true);
    setDepositRemainderModalOpen(true);
  };

  const handleRemainderModalClose = () =>
    closeDialogSafely(() => {
      setDepositRemainderModalOpen(false);
      setSelectedDeposit(null);
      setRemainderMethod('efectivo');
      setRemainderAmount('');
      setRemainderDiscount('');
      setCompleteAfterPayment(false);
    });

  const handleAddDepositRemainder = async () => {
    if (!selectedDeposit) return;
    const amountValue = parseFloat(remainderAmount) || 0;
    const discountValue = parseFloat(remainderDiscount) || 0;
    if (amountValue < 0 || discountValue < 0) {
      setError('Los valores no pueden ser negativos');
      return;
    }
    if (amountValue === 0 && discountValue === 0) {
      setError('Ingresa un monto a cobrar o un descuento');
      return;
    }
    setSavingRemainder(true);
    try {
      await paymentService.addAppointmentPayment(selectedDeposit.appointment_id, {
        method: remainderMethod,
        amount: amountValue,
        discount: discountValue,
      });
      analytics.trackOfflinePaymentConfirmed({
        appointmentId: selectedDeposit.appointment_id,
        paymentMethod: remainderMethod,
        amount: amountValue,
      });
      const summary = discountValue > 0
        ? `Cobro de ${remainderMethod} registrado (descuento $${discountValue.toFixed(2)})`
        : `Cobro de ${remainderMethod} registrado`;
      setSuccessMessage(summary);
      await Promise.all([loadAppointments(), loadPendingDeposits()]);

      const shouldComplete =
        completeAfterPayment && !!selectedAppointmentForCompletion;
      handleRemainderModalClose();

      if (shouldComplete) {
        // Re-open the completion dialog so the admin can log session feedback
        // now that the cobro has been recorded.
        setCompletionFeedback('');
        setCompleteModalOpen(true);
      }
    } catch (err) {
      logger.error('Error adding payment', err);
      setError('No se pudo registrar el cobro');
    } finally {
      setSavingRemainder(false);
    }
  };

  const handleApproveTransfer = async (appointmentId, paymentId) => {
    if (!paymentId) return;
    setApprovingTransferId(paymentId);
    try {
      await paymentService.confirmTransferPayment(paymentId);
      analytics.trackOfflinePaymentConfirmed({
        appointmentId,
        paymentMethod: 'transferencia',
        amount: 0,
      });
      setSuccessMessage('Transferencia aprobada');
      await Promise.all([loadAppointments(), loadPendingDeposits()]);
    } catch (err) {
      logger.error('Error approving transfer', err);
      setError('No se pudo aprobar la transferencia');
    } finally {
      setApprovingTransferId(null);
    }
  };

  const handleAppointmentCreated = async () => {
    await Promise.all([loadAppointments(), loadPendingDeposits()]);
  };

  return (
    <>
      {loading && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Appointments View */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={() => setCreateModalOpen(true)}>
            + Nueva sesión
          </Button>
        </Box>

        <Stack spacing={2}>
          {appointments.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay citas en esta categoría
            </Typography>
          )}

          {appointments.map(appointment => {
            const pendingDeposit = pendingDeposits.find(d => d.appointment_id === appointment.id);
            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={handleConfirmAppointment}
                confirming={confirming}
                templates={manualTemplates}
                categoryConfigs={categoryConfigs}
                onReschedule={handleRescheduleClick}
                onComplete={handleCompleteClick}
                onNoShow={handleNoShowClick}
                onOpenAddPayment={handleOpenAddPayment}
                pendingDeposit={pendingDeposit}
                onGoToPagos={onGoToPagos}
                onApproveTransfer={handleApproveTransfer}
                approvingTransferId={approvingTransferId}
                onOpenDetail={setDetailModalAppointment}
              />
            );
          })}
        </Stack>
      </Box>


      {/* Reschedule Modal */}
      <Dialog
        open={rescheduleModalOpen}
        onClose={closeRescheduleModal}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={false}
        onMouseDown={(e) => {
          if (e.target.closest('[class*="MuiIconButton"]')) {
            setTimeout(() => {
              if (document.activeElement instanceof HTMLElement &&
                  document.activeElement.closest('[class*="MuiIconButton"]')) {
                document.activeElement.blur();
              }
            }, 0);
          }
        }}
      >
        <DialogTitle>Reagendar Cita</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAppointmentForReschedule && (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cliente: {selectedAppointmentForReschedule.customer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tratamiento: {selectedAppointmentForReschedule.treatment_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha actual: {formatAppointmentDate(selectedAppointmentForReschedule.scheduled_at)} a las{' '}
                    {formatAppointmentTime(selectedAppointmentForReschedule.scheduled_at)}
                  </Typography>
                </Box>

                {/* Date & Time Slot Picker */}
                <DateTimeSlotPicker
                  treatment={rescheduleTreatment}
                  paymentMode={null}
                  filterSlots={filterSlotsForEmployee}
                  selectedDate={rescheduleDate}
                  onDateChange={setRescheduleDate}
                  selectedTime={rescheduleTime}
                  onTimeChange={setRescheduleTime}
                  excludeAppointmentId={selectedAppointmentForReschedule?.id}
                />
              </Stack>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRescheduleModal}>Cancelar</Button>
          <Button
            onClick={handleRescheduleConfirm}
            variant="contained"
            color="primary"
            disabled={rescheduling}
          >
            {rescheduling ? <CircularProgress size={20} /> : 'Confirmar Reagendado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Appointment Modal */}
      <Dialog
        open={completeModalOpen}
        onClose={closeCompleteModal}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={false}
      >
        <DialogTitle>Completar Cita</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAppointmentForCompletion && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {selectedAppointmentForCompletion.customer_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tratamiento: {selectedAppointmentForCompletion.treatment_name}
                </Typography>
              </Box>

              <TextField
                label="Feedback de la sesión"
                size="small"
                multiline
                rows={4}
                value={completionFeedback}
                onChange={(e) => setCompletionFeedback(e.target.value)}
                placeholder="Describe cómo fue la sesión, notas importantes, recomendaciones, etc."
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCompleteModal}>Cancelar</Button>
          <Button
            onClick={handleCompleteAppointment}
            variant="contained"
            color="primary"
            disabled={completing}
          >
            {completing ? <CircularProgress size={20} /> : 'Completar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agregar Pago Modal (cuponera sessions are excluded upstream) */}
      <DepositRemainderModal
        open={depositRemainderModalOpen}
        onClose={handleRemainderModalClose}
        selectedDeposit={selectedDeposit}
        remainderAmount={remainderAmount}
        setRemainderAmount={setRemainderAmount}
        remainderDiscount={remainderDiscount}
        setRemainderDiscount={setRemainderDiscount}
        remainderMethod={remainderMethod}
        setRemainderMethod={setRemainderMethod}
        savingRemainder={savingRemainder}
        onConfirm={handleAddDepositRemainder}
        title="Agregar Pago"
      />

      {/* Success Message */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleAppointmentCreated}
        prefilledCustomer={null}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        open={!!detailModalAppointment}
        appointment={detailModalAppointment}
        pendingDeposit={
          detailModalAppointment
            ? pendingDeposits.find(d => d.appointment_id === detailModalAppointment.id)
            : null
        }
        templates={manualTemplates}
        categoryConfigs={categoryConfigs}
        confirming={confirming}
        onClose={() => setDetailModalAppointment(null)}
        onConfirm={handleConfirmAppointment}
        onReschedule={handleRescheduleClick}
        onComplete={handleCompleteClick}
        onNoShow={handleNoShowClick}
        onOpenAddPayment={handleOpenAddPayment}
        onApproveTransfer={handleApproveTransfer}
        approvingTransferId={approvingTransferId}
      />

    </>
  );
}
