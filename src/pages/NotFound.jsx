import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FormaUrbanaLogo from "../assets/images/FormaUrbanaLogo.svg";

const WHATSAPP_LINK = "https://wa.me/59893770785";

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
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, md: 10 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 6, md: 8 },
      }}
    >
      <Stack alignItems="center" spacing={{ xs: 4, md: 5 }} textAlign="center">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 860,
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: "success.light",
            color: "success.contrastText",
          }}
        >
          <Stack spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "center", md: "stretch" }}
            >
              <Box
                component="img"
                src={FormaUrbanaLogo}
                alt="FORMA Urbana"
                sx={{
                  width: { xs: "60vw", sm: "40vw", md: "100%" },
                  flexBasis: { xs: "auto", md: "40%" },
                  flexGrow: 1,
                  maxWidth: { xs: 260, md: 360 },
                  filter: "brightness(0) invert(1)",
                  mx: { xs: "auto", md: 0 },
                }}
              />
              <Stack
                spacing={1.5}
                justifyContent="center"
                sx={{ flexBasis: { xs: "100%", md: "60%" }, flexGrow: 1 }}
              >
                <Typography
                  component="div"
                  variant="overline"
                  sx={{ textTransform: "uppercase" }}
                  textAlign="center"
                >
                  Error 404
                </Typography>
                <Typography
                  component="div"
                  variant="h4"
                  sx={{ textTransform: "uppercase" }}
                  textAlign="center"
                >
                  Parece que esta web no existe
                </Typography>
                <Typography>
                  Exploramos todas las páginas de FORMA Urbana y no encontramos
                  la página que buscabas. Elegí uno de nuestros programas o
                  escribinos al WhatsApp.
                </Typography>
              </Stack>
            </Stack>
            <Button
              component="a"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="inherit"
              size="large"
              sx={{ alignSelf: "center" }}
            >
              Hablar por WhatsApp
            </Button>
          </Stack>
        </Paper>
      </Stack>

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
          sx={{
            pb: 1,
            justifyContent: { xs: "center", lg: "center" },
            alignItems: "center",
          }}
        >
          {LANDING_LINKS.map(({ to, label, description }) => (
            <Card
              key={to}
              elevation={10}
              sx={{
                minWidth: { xs: 260, md: 320 },
                maxWidth: { xs: 320, md: "none" },
                flex: { xs: "0 0 auto", md: "1 1 0" },
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                bgcolor: "common.white",
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
                <Typography color="text.secondary" variant="subtitle2">
                  {description}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 3, pb: 3 }}>
                <Button
                  component={RouterLink}
                  to={to}
                  variant="contained"
                  sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
                  color="success"
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
