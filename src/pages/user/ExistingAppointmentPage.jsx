import {useEffect, useState, useRef, useMemo, useCallback} from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import SlideToConfirm from "../../components/common/SlideToConfirm";
import {useNavigate, useLocation, Navigate} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import {useBusiness} from "../../contexts/BusinessContext";
import {filterSlotsForCustomer} from "../../utils/slotUtils";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaymentsIcon from "@mui/icons-material/Payments";
import PlaceIcon from "@mui/icons-material/Place";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import appointmentService from "../../services/appointment_service";
import paymentService from "../../services/payment_service";
import bankService from "../../services/bank_service";
import DateTimeSlotPicker from "../../components/DateTimeSlotPicker";
import AppointmentStatusBanner from "../../components/AppointmentStatusBanner";
import AppointmentDetailFields from "../../components/AppointmentDetailFields";
import LocationMapCard from "../../components/LocationMapCard";
import BeforeSessionChecklist from "../../components/BeforeSessionChecklist";
import TransferReceiptUpload from "../../components/TransferReceiptUpload";
import analytics from "../../utils/analytics";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");


const REGULAR_CATEGORIES = new Set(["body", "facial", "complementarios"]);

function treatmentFromAppointment(appt) {
  if (!appt) return null;
  const category = appt.treatment_category ?? null;
  const itemType = appt.treatment_item_type ?? null;
  return {
    item_type: itemType ?? (category && !REGULAR_CATEGORIES.has(category) ? category : null),
    category,
    duration_minutes: appt.duration_minutes ?? 90,
  };
}

function paymentLabel(method) {
  const labels = {
    tarjeta: "Tarjeta (MercadoPago)",
    seña: "Seña online",
    deposito: "Seña online",
    transferencia: "Transferencia bancaria",
    efectivo: "Efectivo en clínica",
    mercadopago: "Tarjeta (MercadoPago)",
  };
  return labels[method] || method || "—";
}

function formatPaymentDisplay(paymentData, fallbackMethod) {
  if (!paymentData || paymentData.status !== "completed") {
    return paymentLabel(fallbackMethod);
  }
  const method = paymentLabel(paymentData.payment_method);
  const amount = paymentData.amount ? `$ ${paymentData.amount.toLocaleString("es-UY")} UYU` : "";
  return amount ? `${method} · ${amount}` : method;
}

const PANEL = {
  bgcolor: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  p: 3,
  mb: 3,
};

export default function ExistingAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {logout} = useAuth();
  const {whatsappPhone} = useBusiness();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const appointment = location.state?.appointment ?? null;
  const pendingIntent = location.state?.pendingIntent ?? null;

  if (typeof window !== "undefined") {
  }

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [appointmentData, setAppointmentData] = useState(appointment || (pendingIntent ? {} : null));
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const fileInputRef = useRef(null);
  const deleteTimerRef = useRef(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bankDetails, setBankDetails] = useState({bank_name: "", account_number: "", account_type: "", notes: ""});
  const [paymentData, setPaymentData] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    bankService.getBankDetails().then((data) => {
      setBankDetails({
        bank_name: data?.bank_name || "",
        account_number: data?.account_number || "",
        account_type: data?.account_type || "",
        notes: data?.notes || "",
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!appointment && !pendingIntent) {
      navigate("/");
    }
  }, [appointment, pendingIntent, navigate]);

  useEffect(() => {
    const id = appointment?._id || appointment?.id;
    if (!id) return;
    appointmentService.getAppointmentById(id).then((fresh) => {
      if (fresh) setAppointmentData(fresh);
    }).catch(() => {});
    paymentService.getPaymentByAppointment(id).then((payment) => {
      if (payment) setPaymentData(payment);
    }).catch(() => {});
  }, []);

  const rescheduleTreatment = useMemo(() => treatmentFromAppointment(appointmentData), [appointmentData]);
  const rescheduleFilterSlots = useCallback(
    (isoSlots) => {
      const cutoff = dayjs().tz("America/Montevideo").add(appointmentData?.status === "confirmed" ? 48 : 24, "hour");
      return isoSlots.filter(s => dayjs.utc(s).tz("America/Montevideo").isAfter(cutoff));
    },
    [appointmentData?.status],
  );

  const scheduleFilterSlots = useCallback((isoSlots) => {
    const cutoff = dayjs().tz("America/Montevideo").add(24, "hour");
    return isoSlots.filter(s => dayjs.utc(s).tz("America/Montevideo").isAfter(cutoff));
  }, []);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  // Populate appointmentData from pendingIntent in intent mode
  useEffect(() => {
    if (pendingIntent && appointmentData && Object.keys(appointmentData).length === 0) {
      setAppointmentData({
        _id: pendingIntent._id,
        treatment_name: pendingIntent.treatment_name,
        treatment_id: pendingIntent.treatment_id,
        amount: pendingIntent.amount,
        payment_method_expected: pendingIntent.payment_method,
        status: "pending",
        payment_status: "awaiting_payment",
        scheduled_at: null,
        duration_minutes: pendingIntent.duration_minutes || 90,
      });
    }
  }, [pendingIntent]);

  if (!appointment && !pendingIntent) {
    return <Navigate to="/" />;
  }

  const handleScheduleAppointment = async () => {
    if (!scheduleDate || !scheduleTime) {
      setScheduleError("Seleccioná fecha y hora");
      return;
    }
    setScheduling(true);
    setScheduleError("");
    try {
      const scheduledAt = dayjs.tz(`${scheduleDate.format("YYYY-MM-DD")} ${scheduleTime}`, "America/Montevideo").utc().toISOString();
      const result = await appointmentService.createAppointment({
        treatment_id: pendingIntent.treatment_id,
        scheduled_at: scheduledAt,
      });
      await paymentService.linkIntentToAppointment(pendingIntent._id, result.appointment_id);
      navigate("/my-appointments");
    } catch (err) {
      setScheduleError(err.message || "Error al agendar");
      setScheduling(false);
    }
  };

  if (appointment && !appointmentData) return null;

  const isIntentMode = !!pendingIntent && !appointment;

  const status = appointmentData?.status;
  const isPending = !isIntentMode && status === "pending";
  const isConfirmed = !isIntentMode && status === "confirmed";
  const isDone = !isIntentMode && (status === "completed" || status === "done");
  const isCancelled = !isIntentMode && status === "cancelled";
  const isAwaitingPayment = !isIntentMode && appointmentData?.payment_status === "awaiting_payment";
  const isTransferPending = isAwaitingPayment && appointmentData?.payment_method_expected === "transferencia";

  const canReschedule =
    !isDone &&
    !isCancelled &&
    (isPending ||
      (isConfirmed &&
        appointmentData.scheduled_at &&
        dayjs.utc(appointmentData.scheduled_at).isAfter(dayjs().add(48, "hour"))));

  const appointmentId = appointmentData.id || appointmentData._id;

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    return dayjs.utc(dateString).tz("America/Montevideo").format("dddd, D [de] MMMM [de] YYYY");
  };
  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return dayjs.utc(dateString).tz("America/Montevideo").format("HH:mm");
  };

  const handleWhatsAppContact = () => {
    const message = `Hola FORMA Urbana, tengo una consulta sobre mi cita #${appointmentId}`;
    analytics.trackWhatsAppClick({
      source: "appointment_detail",
      context: { appointmentId },
    });
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleComprobanteUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingComprobante(true);
    try {
      await paymentService.uploadTransferComprobante(appointmentId, file);
      setUploadedFile(file.name);
      setSnackbarMessage("Comprobante enviado exitosamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      const updated = await appointmentService.getAppointmentById(appointmentId);
      setAppointmentData(updated);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setSnackbarMessage(error.message || "Error al enviar el comprobante");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploadingComprobante(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (isIntentMode) {
        await paymentService.cancelPaymentIntent(pendingIntent._id);
        setSnackbarMessage("Solicitud cancelada correctamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        deleteTimerRef.current = setTimeout(() => navigate("/my-appointments"), 2000);
      } else {
        const wasHardDelete =
          appointmentData?.status === "pending" &&
          appointmentData?.payment_status === "awaiting_payment";
        const response = await appointmentService.deleteAppointment(appointmentId);
        analytics.trackAppointmentCancelled({
          appointmentId,
          actor: "customer",
          treatmentSlug: appointmentData?.treatment_slug,
        });
        if (!wasHardDelete) {
          setAppointmentData((prev) => ({...prev, status: "cancelled"}));
        }
        setSnackbarMessage(response?.message || "Cita cancelada correctamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        deleteTimerRef.current = setTimeout(() => navigate("/my-appointments"), 2000);
      }
    } catch (err) {
      const fallback = isIntentMode ? "Error al cancelar la solicitud" : "Error al cancelar la cita";
      setSnackbarMessage(err?.message || fallback);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Seleccioná fecha y hora");
      return;
    }
    setRescheduling(true);
    setRescheduleError("");
    try {
      const newDateTime = dayjs
        .tz(`${rescheduleDate.format("YYYY-MM-DD")} ${rescheduleTime}`, "America/Montevideo")
        .utc()
        .toISOString();
      const oldScheduledAt = appointmentData?.scheduled_at;
      const result = await appointmentService.rescheduleAppointment(appointmentId, newDateTime);
      analytics.trackAppointmentRescheduled({
        appointmentId,
        actor: "customer",
        treatmentSlug: appointmentData?.treatment_slug,
        oldScheduledAt,
        newScheduledAt: newDateTime,
      });
      setAppointmentData(prev => ({
        ...prev,
        scheduled_at: newDateTime,
        status: isConfirmed ? "pending" : (result.status || prev.status),
      }));
      setRescheduleOpen(false);
      setRescheduleDate(null);
      setRescheduleTime(null);
    } catch (err) {
      setRescheduleError(err.message || "Error al reprogramar");
    } finally {
      setRescheduling(false);
    }
  };

  const treatmentTitle = appointmentData.treatment_category_label
    ? `${appointmentData.treatment_category_label} — ${appointmentData.treatment_name || "Servicio"}`
    : appointmentData.is_evaluation
    ? `Sesión de evaluación — ${appointmentData.treatment_name || "Servicio"}`
    : appointmentData.treatment_name || "Servicio de estética";

  return (
    <Box sx={{minHeight: "100vh", bgcolor: "#fafaf7"}}>
      <Container maxWidth="lg" sx={{py: 3}}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/my-appointments")}
          sx={{
            color: "#5b5b5b",
            fontFamily: "'Work Sans'",
            fontWeight: 600,
            textTransform: "none",
            px: 0,
            mb: 2.5,
            "&:hover": {color: "#141414", bgcolor: "transparent"},
          }}
        >
          Volver a mi cuenta
        </Button>

        {/* Status banner */}
        <AppointmentStatusBanner
          status={status}
          isAwaitingPayment={isAwaitingPayment}
          paymentMethodExpected={appointmentData.payment_method_expected}
        />

        {/* Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {xs: "1fr", lg: "1fr 320px"},
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <Box>
            {/* Details panel */}
            <Box sx={PANEL}>
              {/* Treatment header */}
              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2.5, pb: 2.5, borderBottom: "1px solid #f2f2f2"}}>
                <Box>
                  {appointmentData.treatment_category_label && (
                    <Typography sx={{fontSize: 12, fontWeight: 700, color: "#2e7d32", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.5}}>
                      {appointmentData.treatment_category_label}
                    </Typography>
                  )}
                  <Typography sx={{fontFamily: "'Work Sans'", fontWeight: 800, fontSize: {xs: 22, md: 26}, color: "#141414"}}>
                    {appointmentData.treatment_name || "Servicio de estética"}
                  </Typography>
                  {appointmentData.is_evaluation && (
                    <Typography sx={{fontSize: 13, color: "#5b5b5b", mt: 0.25}}>Sesión de evaluación</Typography>
                  )}
                </Box>
                {(paymentData?.amount || appointmentData.amount || appointmentData.price) && (
                  <Typography sx={{fontWeight: 800, fontSize: {xs: 18, md: 20}, color: "#141414", flexShrink: 0, whiteSpace: "nowrap"}}>
                    ${(paymentData?.amount || appointmentData.amount || appointmentData.price).toLocaleString("es-UY")}
                  </Typography>
                )}
              </Box>

              {/* Field rows */}
              <AppointmentDetailFields
                fields={[
                  {
                    icon: <EventIcon />,
                    label: "Fecha",
                    value: formatDate(appointmentData.scheduled_at),
                  },
                  {
                    icon: <ScheduleIcon />,
                    label: "Hora",
                    value: `${formatTime(appointmentData.scheduled_at)}${appointmentData.duration_minutes ? ` · ${appointmentData.duration_minutes} min` : ""}`,
                  },
                  {
                    icon: <PaymentsIcon />,
                    label: "Pago",
                    value: paymentLabel(paymentData?.payment_method || appointmentData.payment_method_expected),
                  },
                  {
                    icon: <PlaceIcon />,
                    label: "Dirección",
                    value: "Convención 1378, Local 80",
                  },
                ]}
              />

              {/* Map card */}
              <LocationMapCard
                businessName="Forma Urbana"
                address="Convención 1378, Local 80 · Montevideo Centro"
                mapsUrl="https://maps.google.com/?q=Convención+1378+Montevideo"
              />
            </Box>

            {/* Transfer receipt upload */}
            {isTransferPending && (
              <Box sx={PANEL}>
                <Typography sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 0.75}}>
                  Comprobante de transferencia
                </Typography>
                <Typography sx={{fontSize: 14, color: "#5b5b5b", mb: 2}}>
                  Subilo acá o enviálo por WhatsApp.
                </Typography>

                {/* Bank info */}
                {bankDetails.bank_name && bankDetails.account_number && (
                  <Box sx={{bgcolor: "#fafaf7", border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, mb: 2, fontSize: 14, lineHeight: 1.8}}>
                    {bankDetails.bank_name && <Typography sx={{fontSize: 14}}><b>Banco:</b> {bankDetails.bank_name}</Typography>}
                    {bankDetails.account_type && <Typography sx={{fontSize: 14}}><b>Tipo:</b> {bankDetails.account_type}</Typography>}
                    {bankDetails.account_number && <Typography sx={{fontSize: 14}}><b>Cuenta:</b> {bankDetails.account_number}</Typography>}
                    {bankDetails.notes && <Typography sx={{fontSize: 14, color: "#5b5b5b"}}>{bankDetails.notes}</Typography>}
                  </Box>
                )}

                {/* Upload area */}
                <TransferReceiptUpload
                  hasFile={uploadedFile || appointmentData.comprobante_url}
                  fileName={uploadedFile || "Comprobante adjunto"}
                  onUpload={handleComprobanteUpload}
                  uploading={uploadingComprobante}
                />
              </Box>
            )}

            {/* Cuponera next-session prompt */}
            {appointmentData.purchased_package_id && appointmentData.remaining_sessions > 0 && (
              <Box
                sx={{
                  ...PANEL,
                  bgcolor: "#f2f8f3",
                  border: "1px solid #c8e6c9",
                }}
              >
                <Typography sx={{fontWeight: 700, fontSize: 15, color: "#141414", mb: 1}}>
                  ✓ Tenés {appointmentData.remaining_sessions} sesión{appointmentData.remaining_sessions === 1 ? "" : "es"} restante{appointmentData.remaining_sessions === 1 ? "" : "s"} en tu cuponera
                </Typography>
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/schedule", {
                      state: {
                        purchasedPackageId: appointmentData.purchased_package_id,
                        treatment: {slug: appointmentData.treatment_slug},
                      },
                    })
                  }
                  sx={{
                    bgcolor: "#2e7d32",
                    "&:hover": {bgcolor: "#3b8a3f"},
                    fontFamily: "'Work Sans'",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                  }}
                >
                  Agendar otra sesión
                </Button>
              </Box>
            )}

            {/* Actions panel */}
            {!isDone && !isCancelled && (
              <Box sx={PANEL}>
                <Typography sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 2}}>
                  Acciones
                </Typography>
                <Stack spacing={1.5}>
                  {isIntentMode && (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditCalendarIcon />}
                      onClick={() => {
                        setScheduleDate(null);
                        setScheduleTime(null);
                        setScheduleError("");
                        setScheduleOpen(true);
                      }}
                      sx={{
                        bgcolor: "#2e7d32",
                        color: "#fff",
                        fontFamily: "'Work Sans'",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textTransform: "none",
                        justifyContent: "flex-start",
                        px: 2,
                        py: 1.25,
                        "&:hover": {bgcolor: "#3b8a3f"},
                      }}
                    >
                      Agendar sesión
                    </Button>
                  )}
                  {canReschedule && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EditCalendarIcon />}
                      onClick={() => {
                        setRescheduleDate(null);
                        setRescheduleTime(null);
                        setRescheduleError("");
                        setRescheduleOpen(true);
                      }}
                      sx={{
                        borderColor: "#e0e0e0",
                        color: "#141414",
                        fontFamily: "'Work Sans'",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textTransform: "none",
                        justifyContent: "flex-start",
                        px: 2,
                        py: 1.25,
                        "&:hover": {borderColor: "#bdbdbd", bgcolor: "#fafaf7"},
                      }}
                    >
                      Reprogramar
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={handleWhatsAppContact}
                    sx={{
                      borderColor: "#e0e0e0",
                      color: "#141414",
                      fontFamily: "'Work Sans'",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      "&:hover": {borderColor: "#bdbdbd", bgcolor: "#fafaf7"},
                    }}
                  >
                    Consultar por WhatsApp
                  </Button>
                  <Button
                    fullWidth
                    startIcon={<DeleteOutlineIcon />}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setDeleteConfirmOpen(true);
                    }}
                    sx={{
                      color: "#b42a2a",
                      fontFamily: "'Work Sans'",
                      fontWeight: 600,
                      textTransform: "none",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      borderRadius: "8px",
                      "&:hover": {bgcolor: "#fff3f3"},
                    }}
                  >
                    Cancelar sesión
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>

          {/* RIGHT SIDEBAR */}
          <Box
            component="aside"
            sx={{
              position: {lg: "sticky"},
              top: {lg: 24},
            }}
          >
            <BeforeSessionChecklist />
          </Box>
        </Box>
      </Container>

      {/* Reschedule Dialog */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{fontFamily: "'Work Sans'", fontWeight: 700}}>Reprogramar sesión</DialogTitle>
          <DialogContent sx={{pt: 3}}>
            {rescheduleError && (
              <Alert severity="error" sx={{mb: 2}}>{rescheduleError}</Alert>
            )}
            <DateTimeSlotPicker
              treatment={rescheduleTreatment}
              paymentMode={null}
              filterSlots={rescheduleFilterSlots}
              selectedDate={rescheduleDate}
              onDateChange={(d) => { setRescheduleDate(d); setRescheduleTime(null); }}
              selectedTime={rescheduleTime}
              onTimeChange={setRescheduleTime}
              excludeAppointmentId={appointmentId}
            />
          </DialogContent>
          <DialogActions sx={{p: 2, gap: 1}}>
            <Button
              onClick={() => setRescheduleOpen(false)}
              sx={{color: "#5b5b5b", textTransform: "none", fontFamily: "'Work Sans'"}}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRescheduleConfirm}
              variant="contained"
              disabled={!rescheduleDate || !rescheduleTime || rescheduling}
              startIcon={rescheduling ? <CircularProgress size={16} /> : undefined}
              sx={{
                bgcolor: "#2e7d32",
                "&:hover": {bgcolor: "#3b8a3f"},
                fontFamily: "'Work Sans'",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              {rescheduling ? "Reprogramando…" : "Confirmar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule dialog (for pending intent) */}
        {isIntentMode && (
          <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{fontFamily: "'Work Sans'", fontWeight: 700}}>Agendar sesión</DialogTitle>
            <DialogContent sx={{pt: 3}}>
              {scheduleError && (
                <Alert severity="error" sx={{mb: 2}}>{scheduleError}</Alert>
              )}
              <DateTimeSlotPicker
                treatment={{ slug: pendingIntent.treatment_id, duration_minutes: pendingIntent.duration_minutes ?? 90 }}
                paymentMode={null}
                filterSlots={scheduleFilterSlots}
                selectedDate={scheduleDate}
                onDateChange={(d) => { setScheduleDate(d); setScheduleTime(null); }}
                selectedTime={scheduleTime}
                onTimeChange={setScheduleTime}
                excludeAppointmentId={null}
              />
            </DialogContent>
            <DialogActions sx={{p: 2, gap: 1}}>
              <Button
                onClick={() => setScheduleOpen(false)}
                sx={{color: "#5b5b5b", textTransform: "none", fontFamily: "'Work Sans'"}}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleScheduleAppointment}
                variant="contained"
                disabled={!scheduleDate || !scheduleTime || scheduling}
                startIcon={scheduling ? <CircularProgress size={16} /> : undefined}
                sx={{
                  bgcolor: "#2e7d32",
                  "&:hover": {bgcolor: "#3b8a3f"},
                  fontFamily: "'Work Sans'",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                {scheduling ? "Agendando…" : "Confirmar"}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Delete confirm dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{fontFamily: "'Work Sans'", fontWeight: 700, color: "#b42a2a"}}>
            Cancelar sesión
          </DialogTitle>
          <DialogContent sx={{pt: 2}}>
            <Typography sx={{fontSize: 15, color: "#141414"}}>
              ¿Estás seguro de que querés cancelar esta sesión? La cancelación es sin costo hasta 24hs antes.
            </Typography>
            <SlideToConfirm
              label="Deslizá para cancelar sesión"
              onConfirm={handleDeleteConfirm}
            />
          </DialogContent>
          <DialogActions sx={{p: 2, gap: 1}}>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              sx={{color: "#5b5b5b", textTransform: "none", fontFamily: "'Work Sans'"}}
            >
              Volver
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{width: "100%"}}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
