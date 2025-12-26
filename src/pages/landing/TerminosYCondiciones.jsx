import SEO from "../../components/SEO.jsx";
import {
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function TerminosYCondiciones() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <SEO
        title="FORMA Urbana — Términos y condiciones"
        description="Términos y condiciones de servicios estéticos en FORMA Urbana: uso de cuponeras, reservas, cancelaciones y recomendaciones."
      />
      <Box
        component="header"
        sx={{
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            Términos y condiciones
          </Typography>
          <Typography variant="h5" gutterBottom>
            Información clara para tu experiencia en FORMA Urbana.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Estos términos aplican a las sesiones y cuponeras de servicios
            estéticos ofrecidos en nuestro local de Montevideo. Si tenés dudas,
            consultanos antes de agendar.
          </Typography>
        </Container>
      </Box>

      <Container component="section" sx={{ py: 3 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Acerca de la Cuponera
        </Typography>
        <Box component="ul" sx={{ maxWidth: 800, mx: "auto", textAlign: "left" }}>
          <li>
            Las cuponeras tienen validez de 60 días desde el primer uso.
          </li>
          <li>
            Las sesiones previamente agendadas solo se pueden cancelar con 48
            horas de anticipación.
          </li>
          <li>
            Para obtener el beneficio de las cuponeras se debe abonar su
            totalidad en un pago.
          </li>
          <li>
            Las cuponeras son personales e intransferibles.
          </li>
          <li>
            La vigencia no se congela por ausencias o reprogramaciones fuera de
            plazo.
          </li>
        </Box>
      </Container>

      <Container component="section" sx={{ py: 3, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Acerca de las sesiones
        </Typography>
        <Box component="ul" sx={{ maxWidth: 800, mx: "auto", textAlign: "left" }}>
          <li>Se tienen 15 minutos de tolerancia con la hora agendada.</li>
          <li>
            La reprogramación está sujeta a disponibilidad y puede realizarse
            solo dentro del período de vigencia.
          </li>
          <li>
            Llegar tarde puede reducir el tiempo efectivo de la sesión para no
            afectar al siguiente cliente.
          </li>
        </Box>
      </Container>

      <Container component="section" sx={{ py: 3 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Reservas y cancelaciones
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography>
            Las reservas se confirman por WhatsApp o por el canal indicado al
            momento de la compra. Si no se recibe confirmación, la agenda no se
            considera cerrada.
          </Typography>
          <Typography>
            Las cancelaciones fuera de las 48 horas pueden considerarse como
            sesión tomada. En casos justificados, evaluamos alternativas.
          </Typography>
        </Stack>
      </Container>

      <Container component="section" sx={{ py: 3, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Salud y seguridad
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography>
            Nuestros servicios son estéticos y no sustituyen la atención médica.
            Informanos de condiciones de salud, embarazo, marcapasos u otras
            contraindicaciones antes de iniciar.
          </Typography>
          <Typography>
            Nos reservamos el derecho de reprogramar o no realizar una sesión
            si detectamos riesgos para tu bienestar.
          </Typography>
        </Stack>
      </Container>

      <Container component="section" sx={{ py: 3 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Resultados y expectativas
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography>
            Los resultados varían según hábitos, constancia y características
            individuales. Las fotos o testimonios son referenciales y no
            garantizan resultados idénticos.
          </Typography>
          <Typography>
            Recomendamos mantener hidratación y hábitos saludables para
            optimizar los beneficios del tratamiento.
          </Typography>
        </Stack>
      </Container>
    </>
  );
}
