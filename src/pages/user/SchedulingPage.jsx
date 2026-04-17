import {useState, useMemo, useEffect, useCallback} from "react";
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
} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import LoginModal from "../../components/LoginModal";
import appointmentService from "../../services/appointment_service";
import treatmentService from "../../services/treatment_service";
import authService from "../../services/auth_service";
import {filterSlotsForCustomer} from "../../utils/slotUtils";
import DateTimeSlotPicker from "../../components/DateTimeSlotPicker";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const SESSION_DURATION = 30; // minutes
const DEFAULT_DEPOSIT_AMOUNT = 500;

function formatMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  if (Number.isInteger(parsed)) return parsed.toString();
  return parsed.toFixed(2);
}

function getValidDepositAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DEPOSIT_AMOUNT;
  }
  return parsed;
}

export default function SchedulingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [treatmentDescription, setTreatmentDescription] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);

  const productType = location.state?.productType; // preserve for navigation back to payment
  const rawTreatment = location.state?.treatment || {
    name: "Evaluación",
    slug: "evaluation",
  };

  // Restore previously selected date/time if coming back from payment
  const restoredDate = location.state?.selectedDate;
  const restoredTime = location.state?.selectedTime;
  const restoredPaymentMethod = location.state?.selectedPaymentMethod;
  // Ensure campaign treatments always have category set, using productType as fallback
  // useMemo prevents a new object reference on every render (which would cause infinite useEffect loops)
  const treatment = useMemo(
    () => ({
      ...rawTreatment,
      category: rawTreatment.category || productType,
    }),
    [
      rawTreatment.name,
      rawTreatment.slug,
      rawTreatment.item_type,
      rawTreatment.category,
      productType,
    ],
  );
  const purchasedPackageId = location.state?.purchased_package_id;
  const sessionInfo = location.state?.sessionInfo; // { sessionNumber, remainingSessions, totalSessions }
  const isEvaluation = location.state?.isEvaluation ?? false;
  const campaignItemType = location.state?.campaignItemType; // preserve for navigation back to payment
  const isPackageMode = !!purchasedPackageId; // subsequent session scheduling

  // Calculate deposit amounts for display
  const parsedBasePrice = Number(basePrice);
  const hasValidBasePrice = Number.isFinite(parsedBasePrice);
  const normalizedDepositAmount = getValidDepositAmount(DEFAULT_DEPOSIT_AMOUNT);
  const effectiveDepositAmount = hasValidBasePrice
    ? Math.min(normalizedDepositAmount, Math.max(parsedBasePrice, 0))
    : normalizedDepositAmount;
  const depositRemainderAmount = Math.max(
    (hasValidBasePrice ? parsedBasePrice : 0) - effectiveDepositAmount,
    0,
  );

  // Memoize filter function to prevent unnecessary API calls
  const memoizedFilterSlots = useCallback(filterSlotsForCustomer, []);

  // Restore previously selected date/time/payment method if coming back from payment
  useEffect(() => {
    if (restoredDate && restoredTime) {
      setSelectedDate(dayjs(restoredDate, "YYYY-MM-DD"));
      setSelectedTime(dayjs(restoredTime, "HH:mm"));
    }
    if (restoredPaymentMethod) {
      setPaymentMethod(restoredPaymentMethod);
    }
  }, []);

  // Load purchase eligibility
  useEffect(() => {
    if (user) {
      authService
        .getPurchaseEligibility()
        .then((data) => {
          setCanPurchasePackages(data.can_purchase_packages ?? false);
        })
        .catch(() => {
          setCanPurchasePackages(false);
        });
    }
  }, [user]);

  // Load treatment description and price
  useEffect(() => {
    if (treatment.slug && treatment.slug !== "evaluation") {
      setLoadingDescription(true);
      treatmentService
        .getTreatmentPackages(treatment.slug)
        .then((data) => {
          // If evaluation, use evaluation description; otherwise use treatment description
          if (isEvaluation) {
            setTreatmentDescription(
              "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti. Esta sesión de evaluación no garantiza el inicio de un tratamiento con nosotros.",
            );
          } else if (data?.description) {
            setTreatmentDescription(data.description);
          }

          // Get base price (without processing fee)
          if (isEvaluation && data?.evaluation_price != null) {
            setBasePrice(data.evaluation_price);
          } else if (data?.single_session_price != null) {
            setBasePrice(data.single_session_price);
          }

          // Get duration
          if (data?.duration_minutes) {
            setDuration(data.duration_minutes);
          }
        })
        .catch(() => {
          // Non-fatal: description and price just won't display
        })
        .finally(() => setLoadingDescription(false));
    } else if (treatment.slug === "evaluation") {
      setTreatmentDescription(
        "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti. Esta sesión de evaluación no garantiza el inicio de un tratamiento con nosotros.",
      );
    }
  }, [treatment.slug, isEvaluation]);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Por favor selecciona fecha y hora");
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

      // Build appointment data (will be created on PaymentPage after payment confirmation)
      const appointmentData = {
        treatment_id: treatment.slug,
        scheduled_at,
        is_evaluation: isEvaluation,
        ...(purchasedPackageId && { purchased_package_id: purchasedPackageId }),
      };

      // Navigate based on mode
      if (isPackageMode) {
        // Cuponera mode: create appointment immediately (no payment needed)
        const result = await appointmentService.createAppointment(appointmentData);
        navigate("/my-appointments");
      } else {
        // Regular mode: go to payment page, appointment will be created after payment
        navigate("/payment", {
          state: {
            treatment,
            campaignItemType,
            productType,
            isEvaluation,
            appointmentData, // Pass data to create appointment later
            selectedPaymentMethod: paymentMethod,
            selectedDate: selectedDate.format("YYYY-MM-DD"),
            selectedTime: selectedTime.format("HH:mm"),
          },
        });
      }
    } catch (err) {
      setError(err.message || "Error creating appointment");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Autenticación", "Agendar cita", "Pago"];
  const activeStep = 1;

  if (!user) {
    return (
      <>
        <LoginModal
          open={true}
          onClose={() => navigate("/")}
          onSuccess={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <>
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
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

          {/* Treatment Info - Consolidated */}
          <Card sx={{mb: 3}}>
            <CardContent>
              {/* Session Info Badge */}
              {sessionInfo && (
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{fontWeight: "bold", mb: 2, display: "block"}}
                >
                  Sesión {sessionInfo.sessionNumber} de{" "}
                  {sessionInfo.totalSessions}
                </Typography>
              )}

              {/* Treatment Title */}
              <Typography
                variant="h5"
                gutterBottom
                sx={{fontWeight: "bold", mb: 2}}
              >
                {treatment.name}
              </Typography>

              {/* Loading Description */}
              {loadingDescription && (
                <Box sx={{display: "flex", justifyContent: "center", my: 2}}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* Treatment Description */}
              {treatmentDescription && !loadingDescription && (
                <Box
                  sx={{
                    mb: 2,
                    "& p": {margin: 0, marginBottom: 1},
                    "& ul, & ol": {marginBottom: 1, paddingLeft: 2},
                    "& blockquote": {
                      borderLeft: "4px solid",
                      borderColor: "divider",
                      paddingLeft: 2,
                      marginLeft: 0,
                      color: "text.secondary",
                      marginBottom: 1,
                    },
                  }}
                  dangerouslySetInnerHTML={{__html: treatmentDescription}}
                />
              )}

              {/* Duration, Location, Price */}
              <Stack
                spacing={1}
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                {(duration || !loadingDescription) && (
                  <Typography variant="body2">
                    <strong>⏱️ Duración aproximada:</strong>{" "}
                    {duration || SESSION_DURATION} minutos
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>📍 Ubicación:</strong> Montevideo Centro
                </Typography>
                {basePrice && (
                  <Typography
                    variant="body2"
                    sx={{color: "success.main", fontWeight: "bold"}}
                  >
                    <strong>Precio:</strong> ${basePrice}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Box sx={{mb: 4}}>
            <DateTimeSlotPicker
              treatment={treatment}
              paymentMode={isEvaluation ? "evaluacion" : null}
              filterSlots={memoizedFilterSlots}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
            />
          </Box>

          {/* Payment Method Selection */}
          {selectedDate && selectedTime && (
            <Card sx={{mb: 4}}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{fontWeight: "bold", mb: 3}}
                >
                  Método de pago
                </Typography>
                <Grid container spacing={2}>
                  {/* Tarjeta / MercadoPago */}
                  <Grid size={{xs: 12, sm: 6}}>
                    <Box
                      onClick={() => setPaymentMethod("tarjeta")}
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor:
                          paymentMethod === "tarjeta"
                            ? "success.main"
                            : "divider",
                        borderRadius: 1,
                        bgcolor:
                          paymentMethod === "tarjeta"
                            ? "success.light"
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {borderColor: "success.main"},
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight:
                            paymentMethod === "tarjeta" ? "bold" : "normal",
                        }}
                      >
                        💳 Tarjeta / MercadoPago
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{display: "block", mt: 0.5}}
                      >
                        +7.29% procesamiento
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Transferencia */}
                  <Grid size={{xs: 12, sm: 6}}>
                    <Box
                      onClick={() => setPaymentMethod("transferencia")}
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor:
                          paymentMethod === "transferencia"
                            ? "success.main"
                            : "divider",
                        borderRadius: 1,
                        bgcolor:
                          paymentMethod === "transferencia"
                            ? "success.light"
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {borderColor: "success.main"},
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight:
                            paymentMethod === "transferencia"
                              ? "bold"
                              : "normal",
                        }}
                      >
                        🏦 Transferencia Bancaria
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{display: "block", mt: 0.5}}
                      >
                        Sin costo adicional
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Efectivo - only for socios */}
                  {canPurchasePackages && (
                    <Grid size={{xs: 12, sm: 6}}>
                      <Box
                        onClick={() => setPaymentMethod("efectivo")}
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor:
                            paymentMethod === "efectivo"
                              ? "success.main"
                              : "divider",
                          borderRadius: 1,
                          bgcolor:
                            paymentMethod === "efectivo"
                              ? "success.light"
                              : "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {borderColor: "success.main"},
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              paymentMethod === "efectivo" ? "bold" : "normal",
                          }}
                        >
                          💵 Efectivo
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{display: "block", mt: 0.5}}
                        >
                          Sin costo adicional
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Depósito - only for non-socios on campaign treatments */}
                  {(campaignItemType || productType) && basePrice && (
                    <Grid size={{xs: 12, sm: 6}}>
                      <Box
                        onClick={() => setPaymentMethod("deposito")}
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor:
                            paymentMethod === "deposito"
                              ? "success.main"
                              : "divider",
                          borderRadius: 1,
                          bgcolor:
                            paymentMethod === "deposito"
                              ? "success.light"
                              : "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {borderColor: "success.main"},
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              paymentMethod === "deposito" ? "bold" : "normal",
                          }}
                        >
                          💎 Reserva con ${formatMoney(effectiveDepositAmount)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{display: "block", mt: 0.5}}
                        >
                          ${formatMoney(effectiveDepositAmount)} ahora + $
                          {formatMoney(depositRemainderAmount)} en la cita
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Card sx={{mb: 4}}>
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
