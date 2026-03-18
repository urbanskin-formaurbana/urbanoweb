import { useState, useEffect } from 'react';
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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import WarningIcon from '@mui/icons-material/Warning';
import adminService from '../../../services/admin_service';
import appointmentService from '../../../services/appointment_service';
import paymentService from '../../../services/payment_service';
import CreateAppointmentModal from '../../../components/CreateAppointmentModal';

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

function buildConfirmationMessage(appointment) {
  const phone = formatPhoneForWhatsApp(appointment.customer_phone);
  if (!phone) return null;

  // Convert UTC to America/Montevideo timezone and format date
  const utcDate = dayjs.utc(appointment.scheduled_at);
  const localDate = utcDate.tz('America/Montevideo');

  // Check if appointment is tomorrow
  const today = dayjs().tz('America/Montevideo');
  const tomorrow = today.add(1, 'day');
  const appointmentDate = localDate.clone().startOf('day');

  let dateStr;
  if (appointmentDate.isSame(tomorrow, 'day')) {
    dateStr = 'Mañana';
  } else {
    dateStr = localDate.format('dddd, D [de] MMMM');
  }

  // Format time as "HHhs" (e.g., "11hs")
  const timeStr = localDate.format('HH[hs]');

  const message = `¡Hola, como estas?

Te espero para tu ${appointment.treatment_name}:

Cuándo: ${dateStr}
A qué hora: ${timeStr}
Dónde: Convención y 18 de julio (Galería Libertador local 80)

Recomendaciones:
• Consumir mínimo 2 litros de agua antes de la sesión.
• Luego tomar un TE VERDE.

Por favor, llega puntual para que podamos trabajar sin contratiempos y garantizarte la mejor atención.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

function formatTemplateMessage(template, appointment) {
  // Convert UTC to America/Montevideo timezone
  const utcDate = dayjs.utc(appointment.scheduled_at);
  const localDate = utcDate.tz('America/Montevideo');
  const dateStr = localDate.format('dddd, D [de] MMMM');
  const timeStr = localDate.format('HH:mm');

  return template.message
    .replace(/{{nombre}}/g, appointment.customer_name)
    .replace(/{{tratamiento}}/g, appointment.treatment_name)
    .replace(/{{fecha}}/g, dateStr)
    .replace(/{{hora}}/g, timeStr);
}

function filterSlotsForEmployee(slots) {
  const now = dayjs().tz('America/Montevideo');
  return slots.filter(slot =>
    dayjs.utc(slot).tz('America/Montevideo').isAfter(now)
  );
}

function AppointmentCard({ appointment, onConfirm, confirming, templates, onReschedule, onComplete, onNoShow, onConfirmPayment }) {
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
    const formattedMessage = formatTemplateMessage(template, appointment);
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
              Método esperado: {appointment.payment_method_expected === 'efectivo' ? 'Efectivo' : 'Transferencia bancaria'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ gap: 0.5, flexWrap: 'nowrap', overflow: 'auto' }}>
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

        {appointment.status === 'pending' && appointment.payment_status !== 'awaiting_payment' && (
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(null);

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  // Complete appointment modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedAppointmentForCompletion, setSelectedAppointmentForCompletion] = useState(null);
  const [completionFeedback, setCompletionFeedback] = useState('');
  const [completing, setCompleting] = useState(false);

  // Create appointment modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Payments/PAGOS tab state

  const tabStatuses = [STATUS_FILTERS.pending, STATUS_FILTERS.confirmed, STATUS_FILTERS.all];
  const currentStatus = tabStatuses[activeTab];

  useEffect(() => {
    loadTemplates();
    loadAppointments();
  }, [currentStatus]);

  // Load available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleDate) {
      setAvailableRescheduleSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingRescheduleSlots(true);
      try {
        const slotStrings = await appointmentService.getAvailableSlots(
          rescheduleDate.toDate(),
          selectedAppointmentForReschedule?.duration_minutes || 90,
          selectedAppointmentForReschedule?.id
        );
        let slots = slotStrings.map((slotStr) => dayjs(slotStr));
        slots = filterSlotsForEmployee(slots);
        setAvailableRescheduleSlots(slots);
      } catch (err) {
        console.error('Error loading reschedule slots:', err);
        setAvailableRescheduleSlots([]);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    };

    loadSlots();
  }, [rescheduleDate, selectedAppointmentForReschedule]);

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
        console.error('Error loading appointments:', err);
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
        console.error('Error loading templates:', err);
      }
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    const existingAppointment = appointments.find(a => a.id === appointmentId);
    const whatsappUrl = existingAppointment ? buildConfirmationMessage(existingAppointment) : null;

    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setConfirming(appointmentId);
    try {
      await adminService.confirmAppointment(appointmentId);
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      setSuccessMessage('Cita confirmada correctamente.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error confirming appointment:', err);
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
      console.error('Error rescheduling appointment:', err);
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

  const handleNoShowClick = async (appointment) => {
    if (!window.confirm(`¿Marcar la cita de ${appointment.customer_name} como no presentado?`)) {
      return;
    }
    try {
      await adminService.markNoShow(appointment.id);
      setSuccessMessage('Cita marcada como no presentado');
      loadAppointments();
    } catch (error) {
      console.error('Error marking no-show:', error);
      setError('Error al marcar como no presentado');
    }
  };

  const handleConfirmPayment = async (appointmentId, paymentData) => {
    setConfirmingPayment(appointmentId);
    try {
      await paymentService.confirmAppointmentPayment(appointmentId, paymentData);
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      setSuccessMessage(`Pago confirmado (${paymentData.method})`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError('No se pudo confirmar el pago');
    } finally {
      setConfirmingPayment(null);
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
      console.error('Error completing appointment:', err);
      setError('No se pudo completar la cita');
    } finally {
      setCompleting(false);
    }
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

          {appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onConfirm={handleConfirmAppointment}
              confirming={confirming}
              templates={templates}
              onReschedule={handleRescheduleClick}
              onComplete={handleCompleteClick}
              onNoShow={handleNoShowClick}
              onConfirmPayment={handleConfirmPayment}
            />
          ))}
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

                {/* Date Picker */}
                <DatePicker
                  label="Nueva fecha"
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  autoFocus
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        readOnly: true,
                        onBlur: () => {
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        },
                      },
                    },
                    popper: {
                      disablePortal: true,
                      modifiers: [{ name: 'flip', enabled: false }],
                    },
                    openPickerButton: {
                      tabIndex: -1,
                    },
                  }}
                  reduceAnimations
                  disableClearable
                />

                {/* Time Slots Grid */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Nueva hora
                  </Typography>
                  {!rescheduleDate ? (
                    <Typography variant="body2" color="text.secondary">
                      Selecciona una fecha para ver horarios disponibles
                    </Typography>
                  ) : loadingRescheduleSlots ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={32} />
                    </Box>
                  ) : availableRescheduleSlots.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, maxHeight: '250px', overflowY: 'auto', pr: 1 }}>
                      {availableRescheduleSlots.map((slot) => (
                        <Button
                          key={slot.format('HH:mm')}
                          variant={rescheduleTime?.format('HH:mm') === slot.format('HH:mm') ? 'contained' : 'outlined'}
                          onClick={() => setRescheduleTime(slot)}
                          size="small"
                          sx={{ py: 1, fontSize: '0.85rem' }}
                        >
                          {slot.format('HH:mm')}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="error">
                      No hay horarios disponibles para esta fecha
                    </Typography>
                  )}
                </Box>
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

      {/* Success Message */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={loadAppointments}
        prefilledCustomer={null}
      />

    </>
  );
}
