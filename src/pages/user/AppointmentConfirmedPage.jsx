import {useEffect} from "react";
import {Container, Box, Typography, Button, Stack} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import {useBusiness} from "../../contexts/BusinessContext";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SpaIcon from "@mui/icons-material/Spa";
import PaymentsIcon from "@mui/icons-material/Payments";
import PlaceIcon from "@mui/icons-material/Place";
import ChatIcon from "@mui/icons-material/Chat";
import FlowStepper from "../../components/booking/FlowStepper.jsx";
import AppointmentStatusBanner from "../../components/AppointmentStatusBanner";
import AppointmentDetailFields from "../../components/AppointmentDetailFields";

const PANEL = {
  bgcolor: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  p: 3,
  mb: 3,
};

function paymentLabel(method) {
  const labels = {
    tarjeta: "Tarjeta (MercadoPago)",
    seña: "Seña online",
    transferencia: "Transferencia bancaria",
    efectivo: "Efectivo en clínica",
    deposito: "Seña online",
  };
  return labels[method] || method;
}

export default function AppointmentConfirmedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useAuth();
  const {whatsappPhone, businessEmail} = useBusiness();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const appointment = location.state?.appointment;

  if (!appointment) {
    return (
      <Container sx={{py: 4, textAlign: "center"}}>
        <Typography color="error">No hay información de cita disponible</Typography>
        <Button variant="contained" onClick={() => navigate("/")} sx={{mt: 2}}>
          Volver a inicio
        </Button>
      </Container>
    );
  }

  const isTransfer = appointment.method === "transferencia";
  const isPaidOnline = appointment.method === "tarjeta" || appointment.method === "seña" || appointment.method === "deposito";
  const isCash = appointment.method === "efectivo";
  const contactMethod = user?.email ? "email" : "whatsapp";

  const reqId = (appointment.id || "")
    .replace("appt-", "FU-")
    .slice(0, 16)
    .toUpperCase();

  const whatsappDisplay = whatsappPhone
    ? `+${whatsappPhone.slice(0, 3)} ${whatsappPhone.slice(3, 4)} ${whatsappPhone.slice(4, 7)} ${whatsappPhone.slice(7)}`
    : "+598 98 123 456";

  const statusNote = isTransfer
    ? " · esperando comprobante de transferencia"
    : isPaidOnline
    ? " · pago recibido"
    : isCash
    ? " · pagás al llegar"
    : "";

  return (
    <Box sx={{minHeight: "100vh", bgcolor: "#fafaf7"}}>
      {/* Banner */}
      <Box sx={{bgcolor: "#14331b", color: "#fff", py: {xs: 4, md: 5}}}>
        <Container maxWidth="md">
          <Typography
            sx={{
              fontFamily: "'Work Sans'",
              fontWeight: 700,
              fontSize: {xs: 22, md: 28},
              color: "#fff",
              mb: 1,
            }}
          >
            Solicitud de cita recibida
          </Typography>
          <Typography sx={{color: "rgba(255,255,255,0.75)", fontSize: 15}}>
            Registramos tu reserva. Nuestro equipo la revisa y te confirma pronto.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{py: 4}}>
        <FlowStepper active={2} />

        {/* Hero */}
        <Box sx={{textAlign: "center", mb: 4}}>
          <HourglassTopIcon sx={{fontSize: 56, color: "#2e7d32", mb: 2}} />
          <Typography
            sx={{
              fontFamily: "'Work Sans'",
              fontWeight: 700,
              fontSize: {xs: 20, md: 24},
              color: "#141414",
              mb: 1.5,
            }}
          >
            Tu solicitud está en revisión
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              color: "#5b5b5b",
              maxWidth: 540,
              mx: "auto",
              lineHeight: 1.65,
            }}
          >
            Nuestras esteticistas revisan la disponibilidad y confirman tu horario.
            Suele tardar menos de 24hs hábiles.
          </Typography>
        </Box>

        {/* Status bar */}
        <Box sx={{mb: 4}}>
          <AppointmentStatusBanner status="pending" isAwaitingPayment={false} paymentMethodExpected={null} />
          <Typography sx={{fontSize: 14, color: "#141414"}}>
            <Box component="span" sx={{fontWeight: 700}}>Estado:</Box> Pendiente de confirmación por el equipo{statusNote}
          </Typography>
        </Box>

        {/* 2-col grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {xs: "1fr", md: "1fr 1fr"},
            gap: 3,
            mb: 4,
          }}
        >
          {/* Details panel */}
          <Box sx={{...PANEL, mb: 0}}>
            <Typography
              sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 2}}
            >
              Detalles de tu solicitud
            </Typography>

            <AppointmentDetailFields
              fields={[
                {
                  icon: <EventIcon />,
                  label: "Fecha solicitada",
                  value: appointment.date,
                },
                {
                  icon: <ScheduleIcon />,
                  label: "Hora solicitada",
                  value: appointment.time,
                },
                {
                  icon: <SpaIcon />,
                  label: "Servicio",
                  value: appointment.isEvaluation
                    ? `Sesión de evaluación — ${appointment.treatment}`
                    : appointment.treatment,
                },
                {
                  icon: <PaymentsIcon />,
                  label: "Pago",
                  value: paymentLabel(appointment.method),
                },
              ]}
            />

            {/* Request ID */}
            <Box sx={{pt: 1.5}}>
              <Typography sx={{fontSize: 12, color: "#8a8a8a", mb: 0.5}}>N.º de solicitud</Typography>
              <Box
                component="code"
                sx={{
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                  fontSize: 13,
                  bgcolor: "#f2f2f2",
                  px: 1,
                  py: 0.5,
                  borderRadius: "4px",
                  color: "#141414",
                }}
              >
                {reqId || appointment.id}
              </Box>
            </Box>
          </Box>

          {/* Contact panel */}
          <Box sx={{...PANEL, mb: 0}}>
            <Typography
              sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 2}}
            >
              Cómo te vamos a contactar
            </Typography>

            <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
              {contactMethod === "email" ? (
                <EmailIcon sx={{color: "#2e7d32", fontSize: 22, mt: "2px", flexShrink: 0}} />
              ) : (
                <PhoneIcon sx={{color: "#2e7d32", fontSize: 22, mt: "2px", flexShrink: 0}} />
              )}
              <Box>
                <Typography sx={{fontWeight: 700, fontSize: 15, color: "#141414", mb: 0.5}}>
                  {contactMethod === "email" ? "Correo electrónico" : "WhatsApp"}
                </Typography>
                <Typography sx={{fontSize: 15, color: "#141414", mb: 1}}>
                  {contactMethod === "email"
                    ? user?.email || "tu correo"
                    : user?.phone
                    ? `+${user.phone}`
                    : "tu WhatsApp"}
                </Typography>
                <Typography sx={{fontSize: 13, color: "#5b5b5b", lineHeight: 1.5}}>
                  Te avisamos cuando la cita quede confirmada o si necesitamos proponer otro horario.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Steps */}
        <Box sx={{...PANEL}}>
          <Typography
            sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 2.5}}
          >
            Próximos pasos
          </Typography>

          <Box component="ol" sx={{listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 2}}>
            {[
              {
                num: "1",
                title: "Dentro de las próximas 24hs hábiles",
                body: "Nuestras esteticistas revisan tu solicitud y te confirman la disponibilidad.",
                warn: false,
              },
              {
                num: "2",
                title: "Confirmación",
                body: `Te enviamos la confirmación con fecha y hora final por ${contactMethod === "email" ? "correo" : "WhatsApp"}.`,
                warn: false,
              },
              {
                num: "3",
                title: "Calendario y recordatorios",
                body: "Vas a poder agregar la cita a tu calendario. Te enviamos recordatorios 24hs y 1hr antes.",
                warn: false,
              },
              ...(isTransfer
                ? [
                    {
                      num: "!",
                      title: "Subí el comprobante",
                      body: 'En "Mis sesiones" podés adjuntar el comprobante de transferencia. Confirmamos apenas lo recibimos.',
                      warn: true,
                    },
                  ]
                : []),
            ].map(({num, title, body, warn}) => (
              <Box component="li" key={num} sx={{display: "flex", gap: 2, alignItems: "flex-start"}}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: warn ? "#c77700" : "#14331b",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Work Sans'",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                    mt: "2px",
                  }}
                >
                  {num}
                </Box>
                <Box>
                  <Typography sx={{fontWeight: 700, fontSize: 14, color: "#141414", mb: 0.5}}>
                    {title}
                  </Typography>
                  <Typography sx={{fontSize: 14, color: "#5b5b5b", lineHeight: 1.55}}>
                    {body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Aside cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {xs: "1fr", md: "1fr 1fr"},
            gap: 3,
            mb: 4,
          }}
        >
          <Box
            sx={{
              bgcolor: "#f2f8f3",
              border: "1px solid #c8e6c9",
              borderRadius: "12px",
              p: 3,
            }}
          >
            <Typography sx={{fontWeight: 700, fontSize: 15, color: "#141414", mb: 1}}>
              ¿Necesitamos cambiar el horario?
            </Typography>
            <Typography sx={{fontSize: 14, color: "#5b5b5b", lineHeight: 1.55}}>
              Si el horario solicitado no está disponible, te contactamos con alternativas. Respondé dentro de 24hs para confirmar la nueva fecha.
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "#f2f8f3",
              border: "1px solid #c8e6c9",
              borderRadius: "12px",
              p: 3,
            }}
          >
            <Typography sx={{fontWeight: 700, fontSize: 15, color: "#141414", mb: 1}}>
              ¿Necesitás ayuda o querés cambiar tu solicitud?
            </Typography>
            <Stack spacing={0.75} sx={{mt: 1, mb: 1.5}}>
              {[
                {icon: <EmailIcon sx={{fontSize: 14}} />, text: businessEmail || "hola@formaurbana.com.uy"},
                {icon: <ChatIcon sx={{fontSize: 14}} />, text: `WhatsApp ${whatsappDisplay}`},
                {icon: <PlaceIcon sx={{fontSize: 14}} />, text: "Montevideo Centro"},
              ].map(({icon, text}) => (
                <Box key={text} sx={{display: "flex", alignItems: "center", gap: 1, fontSize: 14, color: "#5b5b5b"}}>
                  <Box sx={{color: "#5b5b5b", display: "flex"}}>{icon}</Box>
                  <Typography sx={{fontSize: 14, color: "#5b5b5b"}}>{text}</Typography>
                </Box>
              ))}
            </Stack>
            <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
              Referencia:{" "}
              <Box
                component="code"
                sx={{
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                  bgcolor: "#f2f2f2",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: "4px",
                  fontSize: 12,
                }}
              >
                {reqId || appointment.id}
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction={{xs: "column", sm: "row"}} spacing={2} sx={{mb: 2}}>
          <Button
            variant="contained"
            size="large"
            startIcon={<EventIcon />}
            onClick={() => navigate("/my-appointments")}
            sx={{
              bgcolor: "#2e7d32",
              "&:hover": {bgcolor: "#3b8a3f"},
              "&:active": {bgcolor: "#1f4f29"},
              fontFamily: "'Work Sans'",
              fontWeight: 600,
              borderRadius: "8px",
              px: 4,
              py: 1.5,
              textTransform: "none",
            }}
          >
            Ver mis sesiones
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/")}
            sx={{
              borderColor: "#e0e0e0",
              color: "#141414",
              fontFamily: "'Work Sans'",
              fontWeight: 600,
              borderRadius: "8px",
              px: 4,
              py: 1.5,
              textTransform: "none",
              "&:hover": {borderColor: "#bdbdbd", bgcolor: "#f9f9f9"},
            }}
          >
            Volver al inicio
          </Button>
        </Stack>

        {/* Footnote */}
        <Typography sx={{fontSize: 12, color: "#8a8a8a", textAlign: "center", mt: 2, mb: 4}}>
          Podés cancelar o reprogramar hasta 24hs antes sin costo.
        </Typography>
      </Container>
    </Box>
  );
}
