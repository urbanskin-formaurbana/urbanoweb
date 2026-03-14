import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Grid,
  Paper
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import paymentService from '../../services/payment_service';
import appointmentService from '../../services/appointment_service';
import laserCampaignService from '../../services/laser_campaign_service';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const SESSION_DURATION = 30; // minutes

/**
 * Filter available slots for customers to enforce 24-hour advance booking rule:
 * - Same day is already blocked by DatePicker minDate
 * - Next day: only slots at or after current time of day
 * - All other days: no restrictions
 */
function filterSlotsForCustomer(slots) {
  const now = dayjs().tz('America/Montevideo');
  const tomorrow = now.add(1, 'day');

  return slots.filter(slot => {
    const slotTime = dayjs.utc(slot).tz('America/Montevideo');
    if (slotTime.isSame(tomorrow, 'day')) {
      // For tomorrow, only allow slots at or after current time of day
      return (
        slotTime.hour() > now.hour() ||
        (slotTime.hour() === now.hour() && slotTime.minute() >= now.minute())
      );
    }
    // All other days (day after tomorrow and beyond) have no restrictions
    return true;
  });
}

export default function SchedulingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginMethod } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentCreated, setAppointmentCreated] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const treatment = location.state?.treatment || { name: 'Evaluación', slug: 'evaluation' };
  const paymentId = location.state?.paymentId;
  const isEvaluation = location.state?.isEvaluation ?? false;

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Por favor, inicia sesión primero
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Container>
    );
  }

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      setError('');

      try {
        let slots = [];

        // Check if this is a laser treatment
        if (treatment.category === 'laser') {
          // For laser treatments, fetch from campaign
          const slotDuration = treatment.duration_minutes || 90;
          const laserSlots = await laserCampaignService.getAvailableSlots(slotDuration);
          slots = laserSlots.map((slotStr) =>
            dayjs.utc(slotStr).tz("America/Montevideo")
          );
        } else {
          // For regular treatments, fetch dynamic slots
          const slotDuration = isEvaluation ? 30 : (treatment.duration_minutes || 90);
          const slotStrings = await appointmentService.getAvailableSlots(
            selectedDate.toDate(),
            slotDuration
          );
          slots = slotStrings.map((slotStr) =>
            dayjs.utc(slotStr).tz("America/Montevideo")
          );
        }

        // Apply customer slot filtering (24-hour advance booking rule)
        slots = filterSlotsForCustomer(slots);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading available slots:', err);
        setError('Error loading available slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate]);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Por favor selecciona fecha y hora');
      return;
    }

    // Check if payment was completed
    const paymentId = paymentService.getPaymentId();
    if (!paymentId) {
      setError('Payment ID not found. Please complete the payment first.');
      navigate('/payment', { state: { treatment } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Merge date and time into UTC ISO string (explicitly build in America/Montevideo, then convert to UTC)
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const timeStr = selectedTime.format("HH:mm");
      const scheduled_at = dayjs
        .tz(`${dateStr} ${timeStr}`, "America/Montevideo")
        .utc()
        .toISOString();

      // Create appointment via API
      const appointmentData = {
        treatment_id: treatment.slug,
        scheduled_at,
        payment_id: paymentId,
        is_evaluation: isEvaluation,
      };

      // If we have a purchased_package_id from location state, include it
      if (location.state?.purchased_package_id) {
        appointmentData.purchased_package_id = location.state.purchased_package_id;
      }

      const result = await appointmentService.createAppointment(appointmentData);

      // Build appointment details for display
      // For evaluations, always use 30 min; for regular appointments, use treatment duration
      const appointmentDuration = isEvaluation ? 30 : (treatment.duration_minutes || SESSION_DURATION);
      const appointmentDetails = {
        id: result.appointment_id,
        date: selectedDate.format('DD/MM/YYYY'),
        time: selectedTime.format('HH:mm'),
        duration: appointmentDuration,
        treatment: treatment.name,
        customer: user.name,
        payment_id: paymentId,
        status: result.status,
        isEvaluation: isEvaluation,
      };

      setAppointmentDetails(appointmentDetails);
      setAppointmentCreated(true);

      // Clear payment ID from storage after successful appointment creation
      paymentService.clearPaymentId();
    } catch (err) {
      setError(err.message || 'Error creating appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndContinue = () => {
    // Send confirmation and redirect to home
    navigate('/appointment-confirmed', {
      state: {
        appointment: appointmentDetails,
        loginMethod
      }
    });
  };

  const steps = ['Autenticación', 'Pago', 'Agendar cita'];
  const activeStep = 2;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <>
        <Box sx={{ bgcolor: 'success.light', color: 'success.contrastText', py: 3, mb: 4 }}>
          <Container>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Agendar tu Cita
            </Typography>
            <Typography variant="body1">
              Selecciona el día y hora que te conviene
            </Typography>
          </Container>
        </Box>

        <Container sx={{ py: 4 }}>
          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {!appointmentCreated ? (
            <>
              {/* Treatment Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {treatment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duración: {SESSION_DURATION} minutos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ubicación: Montevideo Centro
                  </Typography>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Date Picker */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarMonthIcon color="success" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Selecciona la fecha
                      </Typography>
                    </Box>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      minDate={dayjs().add(1, 'day')} // Can't book today
                      maxDate={dayjs().add(30, 'days')} // 30 days in advance
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Time Picker / Slots */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccessTimeIcon color="success" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Selecciona la hora
                      </Typography>
                    </Box>

                    {selectedDate ? (
                      loadingSlots ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.format('HH:mm')}
                              variant={selectedTime?.format('HH:mm') === slot.format('HH:mm') ? 'contained' : 'outlined'}
                              onClick={() => setSelectedTime(slot)}
                              size="small"
                              sx={{
                                py: 1,
                                fontSize: '0.85rem'
                              }}
                            >
                              {slot.format('HH:mm')}
                            </Button>
                          ))}
                        </Box>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Selecciona una fecha para ver horarios disponibles
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <Card sx={{ mb: 4, bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ✓ Cita seleccionada
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {selectedDate.format('dddd, D [de] MMMM [de] YYYY')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hora:</strong> {selectedTime.format('HH:mm')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duración:</strong> {SESSION_DURATION} minutos
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ubicación:</strong> Montevideo Centro
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Important Notes */}
              <Card sx={{ mb: 4, bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Información importante
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Tu cita está sujeta a aprobación del administrador<br />
                    • Recibirás una confirmación por correo y {loginMethod === 'whatsapp' ? 'WhatsApp' : 'correo electrónico'}<br />
                    • Por favor, llega 5 minutos antes<br />
                    • En caso de no poder asistir, cancela con al menos 24 horas de anticipación
                  </Typography>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleCreateAppointment}
                  disabled={loading || !selectedDate || !selectedTime}
                  startIcon={loading ? <CircularProgress size={24} /> : <CheckCircleIcon />}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Creando cita...' : 'Confirmar cita'}
                </Button>
              </Stack>
            </>
          ) : (
            <>
              {/* Appointment Created Confirmation */}
              <Card sx={{ mb: 4, bgcolor: 'success.light', textAlign: 'center' }}>
                <CardContent sx={{ py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                    ¡Cita creada exitosamente!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Tu cita está pendiente de aprobación
                  </Typography>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Detalles de tu cita
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">Número de cita</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {appointmentDetails.id}
                      </Typography>
                    </Box>
                    <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">Tratamiento</Typography>
                      <Typography variant="body1">{appointmentDetails.treatment}</Typography>
                    </Box>
                    <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">Fecha y hora</Typography>
                      <Typography variant="body1">
                        {appointmentDetails.date} a las {appointmentDetails.time}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {appointmentDetails.status}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Próximos pasos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ol style={{ margin: '0 0 0 20px', paddingLeft: 0 }}>
                      <li>Recibirás una confirmación en {loginMethod === 'whatsapp' ? 'WhatsApp' : 'tu correo electrónico'}</li>
                      <li>Cuando el administrador apruebe tu cita, recibirás otra confirmación</li>
                      <li>Se agregará automáticamente a tu calendario de Google (si disponible)</li>
                      <li>Presenta 5 minutos antes de la hora programada</li>
                    </ol>
                  </Typography>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={handleConfirmAndContinue}
                sx={{ py: 2 }}
              >
                Ir a inicio
              </Button>
            </>
          )}
        </Container>
      </>
    </LocalizationProvider>
  );
}
