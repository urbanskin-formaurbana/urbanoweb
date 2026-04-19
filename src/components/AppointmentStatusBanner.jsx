import {Box, Typography} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InfoIcon from "@mui/icons-material/Info";

export default function AppointmentStatusBanner({status, isAwaitingPayment, paymentMethodExpected}) {
  const getStatusStyle = () => {
    if (isAwaitingPayment && paymentMethodExpected === "transferencia") {
      return {
        bg: "#fff6e0",
        border: "#f0d9a3",
        color: "#7a5210",
        icon: <HourglassTopIcon sx={{fontSize: 22, color: "#7a5210", flexShrink: 0}} />,
        title: "Esperando tu comprobante de transferencia",
        sub: "Subí el comprobante y confirmamos en el día.",
      };
    }
    if (status === "reserved") {
      return {
        bg: "#e8f2fb",
        border: "#cadff1",
        color: "#1e4d7b",
        icon: <EventAvailableIcon sx={{fontSize: 22, color: "#1e4d7b", flexShrink: 0}} />,
        title: "Reservada — pago al llegar a la clínica",
        sub: "Te esperamos el día y hora agendados. Podés pagar en efectivo, tarjeta o cuponera.",
      };
    }
    if (status === "confirmed") {
      return {
        bg: "#e4f0e5",
        border: "#cfe1d1",
        color: "#14331b",
        icon: <CheckCircleIcon sx={{fontSize: 22, color: "#14331b", flexShrink: 0}} />,
        title: "Sesión confirmada",
        sub: "Todo listo. Recordá llegar 10 min antes.",
      };
    }
    if (status === "completed" || status === "done") {
      return {
        bg: "#fafaf7",
        border: "#e0e0e0",
        color: "#2a2a2a",
        icon: <DoneAllIcon sx={{fontSize: 22, color: "#2a2a2a", flexShrink: 0}} />,
        title: "Sesión realizada",
        sub: "¡Gracias por tu sesión!",
      };
    }
    if (status === "pending") {
      return {
        bg: "#fff6e0",
        border: "#f0d9a3",
        color: "#7a5210",
        icon: <HourglassTopIcon sx={{fontSize: 22, color: "#7a5210", flexShrink: 0}} />,
        title: "Pendiente de confirmación",
        sub: "Nuestro equipo revisa tu solicitud y te confirma en las próximas 24hs hábiles.",
      };
    }
    if (status === "cancelled") {
      return {
        bg: "#fbe9e9",
        border: "#f1caca",
        color: "#7a1010",
        icon: <InfoIcon sx={{fontSize: 22, color: "#7a1010", flexShrink: 0}} />,
        title: "Cancelada",
        sub: "",
      };
    }
    return {
      bg: "#f5f5f5",
      border: "#e0e0e0",
      color: "#8a8a8a",
      icon: null,
      title: status,
      sub: "",
    };
  };

  const style = getStatusStyle();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "12px",
        p: 2.5,
        mb: 3,
      }}
    >
      {style.icon}
      <Box>
        <Typography sx={{fontWeight: 700, fontSize: 15, color: style.color, mb: 0.25}}>
          {style.title}
        </Typography>
        {style.sub && (
          <Typography sx={{fontSize: 13, color: "#5b5b5b"}}>
            {style.sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
