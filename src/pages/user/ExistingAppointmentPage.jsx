import {useEffect, useState, useRef} from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Grid,
  Snackbar,
} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import { useBusiness } from "../../contexts/BusinessContext";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import appointmentService from "../../services/appointment_service";
import paymentService from "../../services/payment_service";
import {isCampaignTreatment} from "../../utils/slotUtils";
import bankService from "../../services/bank_service";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

/**
 * Filter available slots for customers (same as SchedulingPage)
 */
function filterSlotsForCustomer(slots) {
  const now = dayjs().tz("America/Montevideo");
  const tomorrow = now.add(1, "day");

  return slots.filter((slot) => {
    const slotTime = dayjs.utc(slot).tz("America/Montevideo");
    if (slotTime.isSame(tomorrow, "day")) {
      return (
        slotTime.hour() > now.hour() ||
        (slotTime.hour() === now.hour() && slotTime.minute() >= now.minute())
      );
    }
    return true;
  });
}

export default function ExistingAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, logout} = useAuth();
  const { whatsappPhone } = useBusiness();

  const appointment = location.state?.appointment;

  // Reschedule state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [appointmentData, setAppointmentData] = useState(appointment);

  // Comprobante upload state
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const fileInputRef = useRef(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_type: "",
    notes: "",
  });

  // Load bank details on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const data = await bankService.getBankDetails();
        setBankDetails({
          bank_name: data.bank_name || "",
          account_number: data.account_number || "",
          account_type: data.account_type || "",
          notes: data.notes || "",
        });
      } catch (error) {
        console.error("Error loading bank details:", error);
      }
    };
    fetchBankDetails();
  }, []);

  // Redirect if no appointment data
  useEffect(() => {
    if (!appointment) {
      navigate("/");
    }
  }, [appointment, navigate]);

  if (!appointment) {
    return null; // Will redirect in useEffect
  }

  const isPending = appointmentData.status === "pending";
  const isAwaitingPayment =
    appointmentData.payment_status === "awaiting_payment";
  const headerBgColor = isAwaitingPayment
    ? "warning.light"
    : isPending
      ? "info.light"
      : "success.light";
  const headerTextColor = isAwaitingPayment
    ? "warning.contrastText"
    : isPending
      ? "info.contrastText"
      : "success.contrastText";
  const headerIcon = isAwaitingPayment ? (
    <HourglassTopIcon
      sx={{
        fontSize: 80,
        color: "warning.main",
        mb: 2,
      }}
    />
  ) : isPending ? (
    <HourglassTopIcon
      sx={{
        fontSize: 80,
        color: "info.main",
        mb: 2,
      }}
    />
  ) : (
    <CheckCircleIcon sx={{fontSize: 80, color: "success.main", mb: 2}} />
  );

  // Format date and time (always convert UTC → America/Montevideo)
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return dayjs
        .utc(dateString)
        .tz("America/Montevideo")
        .format("dddd, D [de] MMMM [de] YYYY");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Hora no disponible";
    try {
      return dayjs.utc(dateString).tz("America/Montevideo").format("HH:mm");
    } catch {
      return dateString;
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hola FORMA Urbana, tengo una consulta sobre mi cita #${appointment.id}`;
    const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Comprobante upload handler
  const handleComprobanteUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingComprobante(true);
    try {
      await paymentService.uploadTransferComprobante(appointmentData.id, file);
      setSnackbarMessage("Comprobante enviado exitosamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Reload appointment to show updated state
      const updated = await appointmentService.getAppointmentById(
        appointmentData.id,
      );
      setAppointmentData(updated);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading comprobante:", error);
      setSnackbarMessage(error.message || "Error al enviar el comprobante");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploadingComprobante(false);
    }
  };

  // Reschedule handlers
  const handleRescheduleClick = () => {
    // Pre-fill with next valid day
    setRescheduleDate(dayjs().add(1, "day"));
    setRescheduleSlots([]);
    setRescheduleTime(null);
    setRescheduleError("");
    setRescheduleOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleOpen(false);
    setRescheduleDate(null);
    setRescheduleSlots([]);
    setRescheduleTime(null);
    setRescheduleError("");
  };

  // Load available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleOpen || !rescheduleDate) return;

    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      setRescheduleError("");
      setRescheduleTime(null);

      try {
        // Fetch available slots, excluding current appointment
        const slotStrings = await appointmentService.getAvailableSlots(
          rescheduleDate.toDate(),
          appointmentData.duration_minutes || 90,
          appointmentData.id,
        );
        // Convert ISO strings to dayjs objects with America/Montevideo timezone and apply customer filter
        let slots = slotStrings.map((slotStr) =>
          dayjs.utc(slotStr).tz("America/Montevideo"),
        );
        slots = filterSlotsForCustomer(slots);
        setRescheduleSlots(slots);
      } catch (err) {
        setRescheduleError("Error loading available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [
    rescheduleOpen,
    rescheduleDate,
    appointmentData.duration_minutes,
    appointmentData.id,
  ]);

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please select both date and time");
      return;
    }

    setRescheduling(true);
    setRescheduleError("");

    try {
      // Merge date and time into UTC ISO string (explicitly build in America/Montevideo, then convert to UTC)
      const dateStr = rescheduleDate.format("YYYY-MM-DD");
      const timeStr = rescheduleTime.format("HH:mm");
      const newDateTime = dayjs
        .tz(`${dateStr} ${timeStr}`, "America/Montevideo")
        .utc()
        .toISOString();

      // Call reschedule API
      const result = await appointmentService.rescheduleAppointment(
        appointmentData.id,
        newDateTime,
      );

      // Update local appointment state
      const updatedAppointment = {
        ...appointmentData,
        scheduled_at: newDateTime,
        status: result.status || appointmentData.status,
      };
      setAppointmentData(updatedAppointment);

      // Close dialog
      handleRescheduleClose();
    } catch (err) {
      setRescheduleError(err.message || "Error rescheduling appointment");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <>
      <Container>
        {/* Status Message */}
        <Box sx={{textAlign: "center"}}>{headerIcon}</Box>

        {/* Status Badge */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={isPending ? "Pendiente de confirmación" : "Cita confirmada"}
            color={isPending ? "info" : "success"}
            variant="filled"
          />
          {isAwaitingPayment && (
            <Chip
              label="Pago pendiente"
              color="warning"
              variant="filled"
              icon={<WarningIcon />}
            />
          )}
        </Box>

        {/* Appointment Details */}
        <Card sx={{mb: 4}}>
          <CardContent>
            <Typography variant="h6" sx={{fontWeight: "bold", mb: 3}}>
              Detalles de tu cita
            </Typography>

            <Stack spacing={3}>
              {/* Date */}
              <Box>
                <Box
                  sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}
                >
                  <CalendarMonthIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{fontWeight: "bold", pl: 4}}>
                  {formatDate(appointmentData.scheduled_at)}
                </Typography>
              </Box>

              {/* Time */}
              <Box>
                <Box
                  sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}
                >
                  <AccessTimeIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Hora
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{fontWeight: "bold", pl: 4}}>
                  {formatTime(appointmentData.scheduled_at)}
                </Typography>
              </Box>

              {/* Duration */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Duración estimada
                </Typography>
                <Typography variant="body1" sx={{fontWeight: "bold"}}>
                  {appointmentData.duration_minutes || 30} minutos
                </Typography>
              </Box>

              {/* Treatment */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Servicio
                </Typography>
                {isCampaignTreatment(appointmentData) ? (
                  <Box sx={{mt: 0.5}}>
                    <Typography variant="body2" color="text.secondary">
                      {appointmentData.purchased_package_id
                        ? "Paquete"
                        : "Zona"}
                    </Typography>
                    <Typography variant="body1" sx={{fontWeight: "bold"}}>
                      {appointmentData.treatment_name || "Servicio de estética"}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{fontWeight: "bold"}}>
                    {appointmentData.is_evaluation
                      ? `Sesión de evaluación — ${appointmentData.treatment_name || "Servicio de estética"}`
                      : appointmentData.treatment_name ||
                        "Servicio de estética"}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Confirmation Number */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Número de cita
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    p: 1,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    mt: 1,
                    wordBreak: "break-all",
                  }}
                >
                  {appointmentData._id}
                </Typography>
              </Box>

              <Divider />

              {/* Confirmation Number */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dirección
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    p: 1,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    mt: 1,
                    wordBreak: "break-all",
                  }}
                >
                  Convención 1378, Local 80
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Awaiting Payment Info */}
        {isAwaitingPayment && (
          <Card sx={{mb: 4, bgcolor: "warning.light"}}>
            <CardContent>
              <Typography variant="h6" sx={{fontWeight: "bold", mb: 2}}>
                Próximos pasos
              </Typography>

              {appointmentData.payment_method_expected === "efectivo" && (
                <>
                  <Typography variant="body2" sx={{mb: 2}}>
                    Tu cita está reservada. Pagarás{" "}
                    <strong>
                      $
                      {appointmentData.treatment_name
                        ? "según tarifa"
                        : "el monto acordado"}
                    </strong>{" "}
                    en efectivo al momento de tu sesión.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => {
                      const message = `Hola! Quiero confirmar mi turno de ${appointmentData.treatment_name} para ${formatDate(appointmentData.scheduled_at)} a las ${formatTime(appointmentData.scheduled_at)}. Pagaré en efectivo. Ref: #${appointmentData.id}`;
                      window.open(
                        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
                        "_blank",
                      );
                    }}
                    fullWidth
                    sx={{mb: 1}}
                  >
                    Confirmar por WhatsApp
                  </Button>
                </>
              )}

              {appointmentData.payment_method_expected === "transferencia" && (
                <>
                  <Typography variant="body2" sx={{mb: 2}}>
                    Tu cita está reservada. Realiza una transferencia bancaria
                    por el monto acordado y sube el comprobante aquí.
                  </Typography>
                  {bankDetails.bank_name && bankDetails.account_number ? (
                    <Box
                      sx={{p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2}}
                    >
                      <Typography variant="caption" sx={{display: "block"}}>
                        <strong>Datos bancarios:</strong>
                        <br />
                        {bankDetails.bank_name && (
                          <>
                            Banco: {bankDetails.bank_name}
                            <br />
                          </>
                        )}
                        {bankDetails.account_type && (
                          <>
                            Tipo: {bankDetails.account_type}
                            <br />
                          </>
                        )}
                        {bankDetails.account_number && (
                          <>
                            Cuenta: {bankDetails.account_number}
                            <br />
                          </>
                        )}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{mb: 2}}>
                      Los datos bancarios no están configurados. Por favor,
                      contáctanos por WhatsApp.
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{mb: 1}}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingComprobante}
                  >
                    {uploadingComprobante ? "Enviando..." : "Subir Comprobante"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleComprobanteUpload}
                    style={{display: "none"}}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cuponera next-session prompt */}
        {appointmentData.purchased_package_id &&
          appointmentData.remaining_sessions > 0 && (
            <Card sx={{mb: 4, bgcolor: "success.light"}}>
              <CardContent>
                <Typography variant="h6" sx={{fontWeight: "bold", mb: 2}}>
                  ✓ Tenés {appointmentData.remaining_sessions} sesion
                  {appointmentData.remaining_sessions === 1 ? "" : "es"}{" "}
                  restante{appointmentData.remaining_sessions === 1 ? "" : "s"}{" "}
                  en tu cuponera
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      navigate("/schedule", {
                        state: {
                          purchasedPackageId:
                            appointmentData.purchased_package_id,
                          treatment: {slug: appointmentData.treatment_slug},
                        },
                      })
                    }
                  >
                    Agendar otra sesión
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => navigate("/")}
                  >
                    Ir al inicio
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

        {/* Status-Specific Info */}
        {isPending ? (
          <Card sx={{mb: 4, bgcolor: "info.light"}}>
            <CardContent>
              <Typography variant="h6" sx={{fontWeight: "bold", mb: 2}}>
                Próximos pasos
              </Typography>

              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
              >
                <ol style={{margin: "0", paddingLeft: "20px"}}>
                  <li>
                    <strong>Dentro de 24 horas:</strong> Nuestros esteticistas
                    revisarán tu solicitud
                  </li>
                  <li>
                    <strong>Confirmación:</strong> Recibirás una confirmación
                    con la fecha y hora final por WhatsApp
                  </li>
                  <li>
                    <strong>Calendario:</strong> Se agregará a tu calendario de
                    Google
                  </li>
                  <li>
                    <strong>Recordatorios:</strong> Te enviaremos recordatorios
                    24 horas y 1 hora antes
                  </li>
                </ol>
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{mb: 4, bgcolor: "success.light"}}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Tu cita ha sido agregada a tu calendario de Google. Recibirás
                recordatorios automáticos 24 horas y 1 hora antes de tu cita.
              </Typography>

              {appointmentData.google_calendar_event_id && (
                <Alert severity="success" sx={{mt: 2}}>
                  ✓ Se sincronizó con tu calendario de Google
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
          {isPending && (
            <Button
              fullWidth
              variant="contained"
              color="warning"
              startIcon={<EditIcon />}
              onClick={handleRescheduleClick}
            >
              Reagendar turno
            </Button>
          )}
          <Button fullWidth variant="outlined" onClick={handleLogout}>
            Cerrar sesión
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="info"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsAppContact}
          >
            Contacta por WhatsApp
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{py: 1.5}}
          >
            Ir a inicio
          </Button>
        </Stack>

        {/* Reschedule Dialog */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Dialog
            open={rescheduleOpen}
            onClose={handleRescheduleClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Reagendar tu cita</DialogTitle>
            <DialogContent sx={{pt: 3}}>
              {rescheduleError && (
                <Alert severity="error" sx={{mb: 2}}>
                  {rescheduleError}
                </Alert>
              )}

              {/* Date Picker */}
              <Box sx={{mb: 3}}>
                <Typography
                  variant="subtitle2"
                  sx={{fontWeight: "bold", mb: 1}}
                >
                  Selecciona la fecha
                </Typography>
                <DatePicker
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  minDate={dayjs().add(1, "day")}
                  maxDate={dayjs().add(30, "days")}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      size: "small",
                    },
                  }}
                />
              </Box>

              {/* Time Slots */}
              {rescheduleDate && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{fontWeight: "bold", mb: 1}}
                  >
                    Selecciona la hora
                  </Typography>
                  {loadingSlots ? (
                    <Box
                      sx={{display: "flex", justifyContent: "center", py: 2}}
                    >
                      <CircularProgress size={32} />
                    </Box>
                  ) : rescheduleSlots.length > 0 ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1,
                      }}
                    >
                      {rescheduleSlots.map((slot) => (
                        <Button
                          key={slot.format("HH:mm")}
                          variant={
                            rescheduleTime?.format("HH:mm") ===
                            slot.format("HH:mm")
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => setRescheduleTime(slot)}
                          size="small"
                          sx={{py: 1, fontSize: "0.85rem"}}
                        >
                          {slot.format("HH:mm")}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay horarios disponibles para esta fecha
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRescheduleClose}>Cancelar</Button>
              <Button
                onClick={handleRescheduleConfirm}
                variant="contained"
                disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                startIcon={
                  rescheduling ? <CircularProgress size={20} /> : undefined
                }
              >
                {rescheduling ? "Reagendando..." : "Confirmar"}
              </Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        />
      </Container>
    </>
  );
}
