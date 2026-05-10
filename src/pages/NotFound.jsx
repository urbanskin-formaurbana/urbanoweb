import { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FormaUrbanaLogo from "../assets/images/FormaUrbanaLogo.svg";
import { useBusiness } from "../contexts/BusinessContext";
import analytics from "../utils/analytics";

const LANDING_LINKS = [
  {
    to: "/cinturon-orion",
    label: "Cinturón de Orión",
    description:
      "Lipo Láser + Maderoterapia + Radiofrecuencia para tallar abdomen y suavizar piel.",
  },
  {
    to: "/cinturon-titan",
    label: "Cinturón de Titán",
    description:
      "MSculpt + Lipo Láser que activa músculo y acelera el uso de grasa resistente.",
  },
  {
    to: "/cinturon-acero",
    label: "Cinturón de Acero",
    description:
      "Radiofrecuencia + MSculpt para firmeza, tono y definición en abdomen y core.",
  },
];

export default function NotFound() {
  const { whatsappPhone } = useBusiness();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const WHATSAPP_LINK = `https://wa.me/${whatsappPhone}`;

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 6, md: 10 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 8, md: 10 },
      }}
    >
      {/* Hero */}
      <Stack alignItems="center" spacing={2} textAlign="center">
        <Box
          component="img"
          src={FormaUrbanaLogo}
          alt="FORMA Urbana"
          sx={{ width: 120, opacity: 0.55, mb: 1 }}
        />
        <Typography
          variant="h1"
          color="primary.main"
          sx={{
            fontSize: "clamp(80px, 15vw, 140px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </Typography>
        <Typography variant="h2" color="text.primary">
          Esta página no existe
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
          Puede que la URL haya cambiado o el enlace esté roto.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
          >
            Ir al inicio
          </Button>
          <Button
            component="a"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => analytics.trackWhatsAppClick({ source: "not_found" })}
          >
            WhatsApp
          </Button>
        </Stack>
      </Stack>

      {/* Programme cards */}
      <Box component="section">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          sx={{ fontWeight: 600, mb: { xs: 3, md: 4 } }}
        >
          Programas activos
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "center", md: "stretch" }}
        >
          {LANDING_LINKS.map(({ to, label, description }) => (
            <Card
              key={to}
              elevation={2}
              sx={{
                width: { xs: "100%", sm: 320, md: "auto" },
                maxWidth: { xs: 400, md: "none" },
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                borderRadius: 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1, px: 3, pt: 3 }}>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  {label}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {description}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 3, pb: 3 }}>
                <Button
                  component={RouterLink}
                  to={to}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Ver detalles
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
