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
  Menu,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import DepositRemainderModal from '../../../components/DepositRemainderModal';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import WarningIcon from '@mui/icons-material/Warning';
import adminService from '../../../services/admin_service';
import paymentService from '../../../services/payment_service';
import CreateAppointmentModal from '../../../components/CreateAppointmentModal';
import DateTimeSlotPicker from '../../../components/DateTimeSlotPicker';
import { filterSlotsForEmployee } from '../../../utils/slotUtils';
import {
  TEMPLATE_USAGES,
  formatTemplateMessage,
  normalizeTemplate,
  resolveConfirmationTemplate,
} from '../../../utils/messageTemplates';
import logger from '../../../utils/logger';

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

function AppointmentCard({ appointment, onConfirm, confirming, templates, categoryConfigs, onReschedule, onComplete, onNoShow, onConfirmPayment, onOpenDepositRemainder, pendingDeposit }) {
  const statusColor = STATUS_COLORS[appointment.status] || 'default';
  const statusLabel = STATUS_LABELS[appointment.status] || appointment.status;
  const borderColor = {
    pending: '#ed6c02',
    confirmed: '#2e7d32',
    completed: '#9e9e9e',
    cancelled: '#d32f2f',
  }[appointment.status] || '#9e9e9e';

  const [whatsappAnchor, setWhatsappAnchor] = useState(null);
  const [completarAnchor, setCompletarAnchor] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(appointment.total_amount || '');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const phone = formatPhoneForWhatsApp(appointment.customer_phone);
  const allowConfirmWithoutPayment =
    appointment.allow_confirm_without_payment === true ||
    appointment.payment_plan === 'pay_later' ||
    appointment.payment_plan === 'deposit';
  const canConfirmAppointment =
    appointment.status === 'pending' &&
    (
      appointment.payment_status !== 'awaiting_payment' ||
      allowConfirmWithoutPayment
    );

  const handleWhatsappMenuClick = (e) => {
    setWhatsappAnchor(e.currentTarget);
  };

  const handleWhatsappMenuClose = () => {
    setWhatsappAnchor(null);
  };

  const handleCompletarMenuClick = (e) => {
    setCompletarAnchor(e.currentTarget);
  };

  const handleCompletarMenuClose = () => {
    setCompletarAnchor(null);
  };

  const handleCompletarClick = () => {
    handleCompletarMenuClose();
    onComplete(appointment);
  };

  const handleNoShowClick = () => {
    handleCompletarMenuClose();
    onNoShow(appointment);
  };

  const handleWhatsappTemplateSelect = (template) => {
    const formattedMessage = formatTemplateMessage(template.message, appointment, categoryConfigs);
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(waLink, '_blank', 'noopener,noreferrer');
    handleWhatsappMenuClose();
  };

  const handlePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    setPaymentAmount(appointment.total_amount || '');
    setPaymentMethod('efectivo');
  };

  const handleConfirmPaymentClick = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }
    setConfirmingPayment(true);
    try {
      await onConfirmPayment(appointment.id, {
        method: paymentMethod,
        amount: parseFloat(paymentAmount)
      });
      handlePaymentModalClose();
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <Card sx={{ borderLeft: `4px solid ${borderColor}` }}>
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
      </CardContent>

      <CardActions sx={{ gap: 0.5, flexWrap: 'nowrap', overflow: 'auto' }}>
        {pendingDeposit && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => onOpenDepositRemainder(pendingDeposit)}
            sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Agregar Pago
          </Button>
        )}

        {appointment.payment_status === 'awaiting_payment' && (
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={handlePaymentModalOpen}
            sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Confirmar Pago
          </Button>
        )}

        {canConfirmAppointment && (
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => onConfirm(appointment.id)}
            disabled={confirming === appointment.id}
            sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            {confirming === appointment.id ? <CircularProgress size={16} /> : 'Confirmar'}
          </Button>
        )}

        {appointment.status === 'confirmed' && (
          <>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleCompletarMenuClick}
              sx={{ padding: '4px 12px' }}
            >
              <ArrowDropDownIcon sx={{ fontSize: '1.2rem' }} />
            </Button>
            <Menu
              anchorEl={completarAnchor}
              open={Boolean(completarAnchor)}
              onClose={handleCompletarMenuClose}
            >
              <MenuItem onClick={handleCompletarClick}>Completar</MenuItem>
              <MenuItem onClick={handleNoShowClick}>No-show</MenuItem>
            </Menu>
          </>
        )}

        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onReschedule(appointment)}
            sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Reagendar
          </Button>
        )}

        {phone && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<ArrowDropDownIcon sx={{ fontSize: '1rem' }} />}
              onClick={handleWhatsappMenuClick}
              sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              WA
            </Button>
            <Menu
              anchorEl={whatsappAnchor}
              open={!!whatsappAnchor}
              onClose={handleWhatsappMenuClose}
            >
              {templates.length > 0 ? (
                templates.map((template) => (
                  <MenuItem
                    key={template.id}
                    onClick={() => handleWhatsappTemplateSelect(template)}
                  >
                    {template.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No hay plantillas disponibles</MenuItem>
              )}
            </Menu>
          </>
        )}
      </CardActions>

      {/* Payment Confirmation Modal */}
      <Dialog
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Pago</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Cliente: {appointment.customer_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tratamiento: {appointment.treatment_name}
              </Typography>
            </Box>

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
              <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia Bancaria" />
              <FormControlLabel value="posnet" control={<Radio />} label="POSNet" />
            </RadioGroup>

            <TextField
              label="Monto ($)"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentModalClose}>Cancelar</Button>
          <Button
            onClick={handleConfirmPaymentClick}
            variant="contained"
            color="primary"
            disabled={confirmingPayment}
          >
            {confirmingPayment ? <CircularProgress size={20} /> : 'Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>
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

export default function AppointmentsTab({ activeTab }) {
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

  // Deposit remainder modal state

  // Payment confirmation modal state (for awaiting_payment appointments)
  const [paymentConfirmationModalOpen, setPaymentConfirmationModalOpen] = useState(false);
  const [appointmentForPaymentConfirm, setAppointmentForPaymentConfirm] = useState(null);
  const [depositRemainderModalOpen, setDepositRemainderModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [remainderMethod, setRemainderMethod] = useState('efectivo');
  const [remainderAmount, setRemainderAmount] = useState('');
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

    // Check if appointment has awaiting payment - show confirmation modal first
    if (existingAppointment?.payment_status === 'awaiting_payment') {
      setAppointmentForPaymentConfirm(existingAppointment);
      setPaymentConfirmationModalOpen(true);
      return;
    }

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
      window.open(waLink, '_blank', 'noopener,noreferrer');
    }

    setConfirming(appointmentId);
    try {
      await adminService.confirmAppointment(appointmentId);
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
    setCompleteModalOpen(true);
  };

  const closeCompleteModal = () => closeDialogSafely(() => {
    setCompleteModalOpen(false);
    setSelectedAppointmentForCompletion(null);
    setCompletionFeedback('');
  });

  const handlePaymentConfirmation = async (payAtSession) => {
    if (!appointmentForPaymentConfirm) return;

    setPaymentConfirmationModalOpen(false);

    if (payAtSession) {
      // User will pay at session - confirm appointment as normal
      const appointmentId = appointmentForPaymentConfirm.id;
      const phone = formatPhoneForWhatsApp(appointmentForPaymentConfirm.customer_phone);

      if (phone) {
        const confirmationTemplate = resolveConfirmationTemplate(
          normalizedTemplates,
          appointmentForPaymentConfirm.treatment_category
        );

        if (confirmationTemplate) {
          const formattedMessage = formatTemplateMessage(
            confirmationTemplate.message,
            appointmentForPaymentConfirm,
            categoryConfigs
          );

          if (formattedMessage.trim()) {
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
            window.open(waLink, '_blank', 'noopener,noreferrer');
          }
        }
      }

      setConfirming(appointmentId);
      try {
        await adminService.confirmAppointment(appointmentId);
        setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
        setSuccessMessage('Cita confirmada correctamente. Pago en sesión.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (err) {
        logger.error('Error confirming appointment', err);
        setError('No se pudo confirmar la cita');
      } finally {
        setConfirming(null);
      }
    } else {
      // Need to process payment first - for now show error
      setError('Procesamiento de pago no implementado aún');
    }

    setAppointmentForPaymentConfirm(null);
  };

  const handleNoShowClick = async (appointment) => {
    if (!window.confirm(`¿Marcar la cita de ${appointment.customer_name} como no presentado?`)) {
      return;
    }
    try {
      await adminService.markNoShow(appointment.id);
      setSuccessMessage('Cita marcada como no presentado');
      loadAppointments();
    } catch (error) {
      logger.error('Error marking no-show', error);
      setError('Error al marcar como no presentado');
    }
  };

  const handleConfirmPayment = async (appointmentId, paymentData) => {
    try {
      await paymentService.confirmAppointmentPayment(appointmentId, paymentData);
      await Promise.all([loadAppointments(), loadPendingDeposits()]);
      setSuccessMessage(`Pago confirmado (${paymentData.method})`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      logger.error('Error confirming payment', error);
      setError('No se pudo confirmar el pago');
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

  const handleOpenDepositRemainder = (deposit) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedDeposit(deposit);
    setRemainderAmount((deposit.remaining || 0).toString());
    setRemainderMethod('efectivo');
    setDepositRemainderModalOpen(true);
  };

  const handleRemainderModalClose = () =>
    closeDialogSafely(() => {
      setDepositRemainderModalOpen(false);
      setSelectedDeposit(null);
      setRemainderMethod('efectivo');
      setRemainderAmount('');
    });

  const handleAddDepositRemainder = async () => {
    if (!selectedDeposit || !remainderAmount || parseFloat(remainderAmount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }
    setSavingRemainder(true);
    try {
      await paymentService.addDepositRemainder(selectedDeposit.appointment_id, {
        method: remainderMethod,
        amount: parseFloat(remainderAmount),
      });
      setSuccessMessage(`Cobro de ${remainderMethod} registrado`);
      await Promise.all([loadAppointments(), loadPendingDeposits()]);
      handleRemainderModalClose();
    } catch (err) {
      logger.error('Error adding deposit remainder', err);
      setError('No se pudo registrar el cobro');
    } finally {
      setSavingRemainder(false);
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
                onConfirmPayment={handleConfirmPayment}
                onOpenDepositRemainder={handleOpenDepositRemainder}
                pendingDeposit={pendingDeposit}
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

      {/* Deposit Remainder Modal */}
      <DepositRemainderModal
        open={depositRemainderModalOpen}
        onClose={handleRemainderModalClose}
        selectedDeposit={selectedDeposit}
        remainderAmount={remainderAmount}
        setRemainderAmount={setRemainderAmount}
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

      {/* Payment Confirmation Modal - for awaiting_payment appointments */}
      <Dialog
        open={paymentConfirmationModalOpen}
        onClose={() => setPaymentConfirmationModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{fontWeight: 'bold', color: 'warning.main'}}>
          ¿Pago en la sesión?
        </DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <Typography>
            {appointmentForPaymentConfirm?.customer_name}, la cita aún no tiene pago confirmado.
          </Typography>
          <Typography sx={{mt: 2}}>
            ¿Esta persona pagará durante la sesión?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePaymentConfirmation(false)}>
            No, procesar pago primero
          </Button>
          <Button
            onClick={() => handlePaymentConfirmation(true)}
            variant="contained"
            color="success"
          >
            Sí, paga en la sesión
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
