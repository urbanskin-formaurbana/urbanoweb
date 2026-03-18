import {useState, useEffect} from "react";
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
  Paper,
} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import appointmentService from "../../services/appointment_service";
import paymentService from "../../services/payment_service";
import transferReceiptStore from "../../utils/transferReceiptStore";
import {
  filterSlotsForCustomer,
  fetchAvailableSlots,
} from "../../utils/slotUtils";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const SESSION_DURATION = 30; // minutes

export default function SchedulingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, loginMethod} = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const treatment = location.state?.treatment || {
    name: "Evaluación",
    slug: "evaluation",
  };
  const paymentId = location.state?.paymentId;
  const purchasedPackageId = location.state?.purchased_package_id;
  const sessionInfo = location.state?.sessionInfo; // { sessionNumber, remainingSessions, totalSessions }
  const isEvaluation = location.state?.isEvaluation ?? false;
  const paymentMethod = location.state?.paymentMethod || "tarjeta"; // tarjeta | efectivo | transferencia | deposito
  const campaignItemType = location.state?.campaignItemType; // preserve for navigation back to payment
  const productType = location.state?.productType; // preserve for navigation back to payment
  const intentPaymentId = location.state?.intentPaymentId; // Link to payment intent if created at PaymentPage
  const isPackageMode = !!purchasedPackageId && !paymentId; // subsequent session scheduling
  const isCashOrTransferMode =
    paymentMethod === "efectivo" || paymentMethod === "transferencia"; // payment pending flow

  if (!user) {
    return (
      <Container sx={{py: 4, textAlign: "center"}}>
        <Alert severity="warning">Por favor, inicia sesión primero</Alert>
        <Button variant="contained" onClick={() => navigate("/")} sx={{mt: 2}}>
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
      setError("");

      try {
        // Fetch slots using shared utility
        const paymentMode = isEvaluation ? "evaluacion" : null;
        const slotStrings = await fetchAvailableSlots(
          selectedDate.toDate(),
          treatment,
          paymentMode,
        );

        // Apply customer slot filtering (24-hour advance booking rule)
        const filteredSlots = filterSlotsForCustomer(slotStrings);

        // Convert to dayjs objects for rendering
        const slots = filteredSlots.map((slotStr) =>
          dayjs.utc(slotStr).tz("America/Montevideo"),
        );

        setAvailableSlots(slots);
      } catch (err) {
        console.error("Error loading available slots:", err);
        setError("Error loading available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, treatment, isEvaluation]);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Por favor selecciona fecha y hora");
      return;
    }

    // Check if payment was completed (not required for package mode or cash/transfer)
    let paymentIdToUse = paymentService.getPaymentId();
    if (!paymentIdToUse && !isPackageMode && !isCashOrTransferMode) {
      setError("Payment ID not found. Please complete the payment first.");
      navigate("/payment", {state: {treatment, campaignItemType, productType}});
      return;
    }

    setLoading(true);
    setError("");

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
        is_evaluation: isEvaluation,
      };

      // Add payment_id if available (not required for package mode or cash/transfer)
      if (paymentIdToUse) {
        appointmentData.payment_id = paymentIdToUse;
      }

      // Add payment_method_expected for cash/transfer flows
      if (isCashOrTransferMode) {
        appointmentData.payment_method_expected = paymentMethod;
      }

      // If we have a purchased_package_id from location state, include it
      if (purchasedPackageId) {
        appointmentData.purchased_package_id = purchasedPackageId;
      }

      const result =
        await appointmentService.createAppointment(appointmentData);

      // Build appointment details for ExistingAppointmentPage
      const appointmentDuration = isEvaluation
        ? 30
        : treatment.duration_minutes || SESSION_DURATION;
      const appointmentDetails = {
        id: result.appointment_id,
        scheduled_at: scheduled_at,
        duration_minutes: appointmentDuration,
        treatment_name: treatment.name,
        treatment_slug: treatment.slug,
        item_type: treatment.item_type || null,
        customer: user.name,
        payment_id: paymentIdToUse,
        status: result.status,
        payment_status: isCashOrTransferMode ? "awaiting_payment" : "paid",
        payment_method_expected: isCashOrTransferMode ? paymentMethod : null,
        is_evaluation: isEvaluation,
        session_number: result.session_number,
        remaining_sessions: result.remaining_sessions,
        purchased_package_id: purchasedPackageId || null,
      };

      // Clear payment ID from storage after successful appointment creation (only for online flow)
      if (!isPackageMode) {
        paymentService.clearPaymentId();
      }

      // Link payment intent to appointment if intent was created
      if (intentPaymentId) {
        try {
          await paymentService.linkIntentToAppointment(
            intentPaymentId,
            result.appointment_id,
          );
          transferReceiptStore.file = null; // Clear store after linking
        } catch (linkErr) {
          console.warn("Failed to link intent to appointment:", linkErr);
          // Continue anyway - intent is still there, just not linked yet
        }
      }

      // Navigate to appointments overview
      navigate("/my-appointments");
    } catch (err) {
      setError(err.message || "Error creating appointment");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Autenticación", "Pago", "Agendar cita"];
  const activeStep = 2;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <>
        <Box
          sx={{
            bgcolor: "success.light",
            color: "success.contrastText",
            py: 3,
            mb: 4,
          }}
        >
          <Container>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{fontWeight: "bold"}}
            >
              Agendar tu Cita
            </Typography>
            <Typography variant="body1">
              Selecciona el día y hora que te conviene
            </Typography>
          </Container>
        </Box>

        <Container sx={{py: 4}}>
          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} sx={{mb: 4}}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{mb: 3}}>
              {error}
            </Alert>
          )}

          {/* Treatment Info */}
          <Card sx={{mb: 3}}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{fontWeight: "bold"}}>
                {treatment.name}
              </Typography>
              {sessionInfo && (
                <Typography
                  variant="subtitle2"
                  color="success.main"
                  sx={{fontWeight: "bold", mb: 1}}
                >
                  Sesión {sessionInfo.sessionNumber} de{" "}
                  {sessionInfo.totalSessions}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Duración: {SESSION_DURATION} minutos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                Ubicación: Montevideo Centro
              </Typography>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Grid container spacing={3} sx={{mb: 4}}>
            {/* Date Picker */}
            <Grid size={{xs: 12, sm: 6}}>
              <Paper sx={{p: 2}}>
                <Box
                  sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}
                >
                  <CalendarMonthIcon color="success" />
                  <Typography variant="subtitle1" sx={{fontWeight: "bold"}}>
                    Selecciona la fecha
                  </Typography>
                </Box>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={dayjs().add(1, "day")} // Can't book today
                  maxDate={dayjs().add(30, "days")} // 30 days in advance
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
              </Paper>
            </Grid>

            {/* Time Picker / Slots */}
            <Grid size={{xs: 12, sm: 6}}>
              <Paper sx={{p: 2}}>
                <Box
                  sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}
                >
                  <AccessTimeIcon color="success" />
                  <Typography variant="subtitle1" sx={{fontWeight: "bold"}}>
                    Selecciona la hora
                  </Typography>
                </Box>

                {selectedDate ? (
                  loadingSlots ? (
                    <Box
                      sx={{display: "flex", justifyContent: "center", py: 2}}
                    >
                      <CircularProgress size={32} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1,
                      }}
                    >
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.format("HH:mm")}
                          variant={
                            selectedTime?.format("HH:mm") ===
                            slot.format("HH:mm")
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => setSelectedTime(slot)}
                          size="small"
                          sx={{
                            py: 1,
                            fontSize: "0.85rem",
                          }}
                        >
                          {slot.format("HH:mm")}
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
            <Card sx={{mb: 4, bgcolor: "success.light"}}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{fontWeight: "bold", color: "success.main"}}
                >
                  ✓ Cita seleccionada
                </Typography>
                <Stack spacing={1} sx={{mt: 2}}>
                  <Typography variant="body2">
                    <strong>Fecha:</strong>{" "}
                    {selectedDate.format("dddd, D [de] MMMM [de] YYYY")}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora:</strong> {selectedTime.format("HH:mm")}
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
          <Card sx={{mb: 4, bgcolor: "info.light"}}>
            <CardContent>
              <Typography variant="subtitle2" sx={{fontWeight: "bold", mb: 1}}>
                Información importante
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Tu cita está sujeta a aprobación del administrador
                <br />
                • Recibirás una confirmación por whatsapp y correo electrónico
                <br />
                • Por favor, llega 5 minutos antes
                <br />• En caso de no poder asistir, cancela con al menos 24
                horas de anticipación
              </Typography>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{mt: 4}}>
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
              startIcon={
                loading ? <CircularProgress size={24} /> : <CheckCircleIcon />
              }
              sx={{py: 1.5}}
            >
              {loading ? "Creando cita..." : "Solicitar cita"}
            </Button>
          </Stack>
        </Container>
      </>
    </LocalizationProvider>
  );
}
