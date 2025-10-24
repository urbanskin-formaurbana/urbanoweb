import SEO from "../../components/SEO.jsx";
import { Link as RouterLink } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const WHATSAPP_LINK = "https://wa.me/59893770785";

// Program data used across the landing
const PROGRAMS = [
  {
    name: "Cinturón de Orión",
    path: "/cinturon-orion",
    description:
      "Iniciá el cambio: menos contorno y piel más firme, sin agujas.",
    features: [
      "30 minutos de Lipo Láser (635 nm)",
      "Maderoterapia",
      "Drenaje linfático",
    ],
    prices: [
      { label: "Sesión", value: "1500" },
      { label: "Cuponera 6", value: "5500 (Oferta de Apertura)" },
      { label: "Cuponera 8", value: "7900" },
      { label: "Cuponera 10", value: "9800" },
    ],
    level: "Nivel inicial",
  },
  {
    name: "Cinturón de Titán",
    path: "/cinturon-titan",
    description: "Reducí y tonificá a la vez con MSculpt + Lipo Láser.",
    features: [
      "30 minutos de MSculpt (HIFEM + RF)",
      "30 minutos de Lipo Láser",
      "Maderoterapia",
      "Pulido (drenaje/modelador)",
    ],
    prices: [
      { label: "Sesión", value: "2000" },
      { label: "Cuponera 6", value: "6600 (Oferta de Apertura)" },
      { label: "Cuponera 8", value: "8900" },
      { label: "Cuponera 10", value: "10900" },
    ],
    level: "Nivel intermedio",
  },
  {
    name: "Cinturón de Acero",
    path: "/cinturon-acero",
    description:
      "Tono muscular avanzado y piel más firme con NEO + radiofrecuencia.",
    features: [
      "30 minutos de MSculpt",
      "Radiofrecuencia (piel)",
      "Maderoterapia",
      "Drenaje linfático",
    ],
    prices: [
      { label: "Sesión", value: "1900" },
      { label: "Cuponera 6", value: "6200 (Oferta de Apertura)" },
      { label: "Cuponera 8", value: "8200" },
      { label: "Cuponera 10", value: "10200" },
    ],
    level: "Nivel avanzado",
  },
];

// Quick selector cards
const SELECTION = [
  {
    question: "¿Sos principiante o volviste al ruedo?",
    program: PROGRAMS[0],
    text: "Iniciá reducción de contorno y tensión de piel con una sesión cómoda y sin agujas.",
  },
  {
    question: "¿Querés reducir y tonificar a la vez?",
    program: PROGRAMS[1],
    text: "Músculo + grasa en la misma sesión con MSculpt y afinado de contorno.",
  },
  {
    question: "¿Ya tenés base y querés seguir definiendo?",
    program: PROGRAMS[2],
    text: "Tono muscular avanzado + radiofrecuencia para firmeza de la piel.",
  },
];

function ProgramCard({ program }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {program.name}
        </Typography>
        <Typography sx={{ mb: 1 }}>{program.description}</Typography>
        <Box component="ul" sx={{ m: 0, pl: 2, mb: 1 }}>
          {program.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </Box>
        <Stack spacing={0.5}>
          {program.prices.map((p) => (
            <Box
              key={p.label}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography>
                {p.label}: {p.value}
              </Typography>
              {p.label === "Cuponera 6" && (
                <Chip color="success" size="small" label="Oferta de Apertura" />
              )}
            </Box>
          ))}
        </Stack>
        <Typography sx={{ mt: 1 }}>{program.level}</Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button component={RouterLink} to={program.path} variant="contained">
          Ver protocolo
        </Button>
        <Button href={WHATSAPP_LINK} variant="outlined">
          WhatsApp
        </Button>
      </CardActions>
    </Card>
  );
}

function SelectionCard({ entry }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" display="block" sx={{ mb: 1 }}>
          {entry.question}
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {entry.program.name}
        </Typography>
        <Typography>{entry.text}</Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button
          component={RouterLink}
          to={entry.program.path}
          variant="contained"
        >
          Ver protocolo
        </Button>
      </CardActions>
    </Card>
  );
}

export default function OfertaApertura() {
  return (
    <>
      <SEO
        title="FORMA Urbana — Oferta de Apertura | Cinturón de Orión, Titán y Acero (Montevideo)"
        description="Tres rutas para esculpir abdomen sin cirugía. Elegí entre Orión (contorno+firmeza), Titán (músculo+grasa) o Acero (tono+radiofrecuencia). Cuponera 6 en Oferta de Apertura. Reservá por WhatsApp."
      />

      {/* HERO */}
      <Box
        component="header"
        sx={{
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container>
          <Typography variant="h1" sx={{ fontWeight: "bold" }} gutterBottom>
            Programas Cinturón
          </Typography>
          <Typography variant="h5" gutterBottom>
            Tres rutas, un objetivo: contorno más definido sin cirugía. Elegí el
            protocolo que mejor calza con <strong>tu punto de partida</strong> y{" "}
            <strong>tu objetivo</strong> en abdomen.
          </Typography>
          <Typography sx={{ mb: 4, fontStyle: "italic" }}>
            En Montevideo Centro · No invasivo · Agenda activa · Resultados
            acumulativos
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            href="#cual-elegir"
            sx={{ fontWeight: "bold" }}
          >
            Descubrí tu cinturón
          </Button>
        </Container>
      </Box>

      {/* SUB-HERO */}
      <Container sx={{ py: 4 }}>
        <Stack
          spacing={2}
          sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}
        >
          <Typography>
            <strong>
              Lo que te frena no es falta de voluntad, es falta de estrategia.
            </strong>
          </Typography>
          <Typography>
            Con nuestros protocolos en serie,{" "}
            <strong>arrancás a ver cambios</strong> y te enfocás en{" "}
            <strong>mantenerlos</strong>, no en empezar de cero.
          </Typography>
        </Stack>
      </Container>

      {/* ¿Cuál elijo? */}
      <Box
        component="section"
        id="cual-elegir"
        sx={{ py: 4, bgcolor: "grey.50" }}
      >
        <Container>
          <Typography variant="h3" align="center" gutterBottom>
            ¿Cuál elijo?
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {SELECTION.map((entry) => (
              <Grid
                key={entry.program.name}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <SelectionCard entry={entry} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Comparador rápido */}
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Comparador rápido
        </Typography>
        <Stack spacing={3} sx={{ maxWidth: 900, mx: "auto" }}>
          <Box>
            <Typography variant="h5">Objetivo principal</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Orión:</strong> contorno + firmeza de piel (nivel{" "}
                <strong>inicial</strong>).
              </li>
              <li>
                <strong>Titán:</strong> contorno +{" "}
                <strong>definición muscular simultánea</strong> (nivel{" "}
                <strong>intermedio</strong>).
              </li>
              <li>
                <strong>Acero:</strong> <strong>tonificación muscular</strong> +{" "}
                <strong>tensión cutánea</strong> (nivel{" "}
                <strong>avanzado</strong>).
              </li>
            </Box>
          </Box>
          <Box>
            <Typography variant="h5">Tecnología protagonista</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Orión:</strong> <strong>Lipo Láser 635 nm</strong> +
                maderoterapia + drenaje. Evidencia en reducción de perímetro en
                ensayos controlados (no es “bajar kilos”).
              </li>
              <li>
                <strong>Titán:</strong>{" "}
                <strong>MSculpt (HIFEM + RF simultánea)</strong> + Lipo Láser +
                “Pulido”. Ensayos aleatorizados con “sham” y evaluaciones por
                MRI/US respaldan reducción de grasa y aumento de espesor
                muscular.
              </li>
              <li>
                <strong>Acero:</strong> <strong>MSculpt</strong> para
                músculo/grasa + <strong>radiofrecuencia</strong> focal en piel
                para firmeza.
              </li>
            </Box>
          </Box>
          <Box>
            <Typography variant="h5">Sensación / Downtime</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Orión:</strong> indoloro, relajado; salís y seguís con
                tu día.
              </li>
              <li>
                <strong>Titán:</strong> contracciones intensas + calor
                tolerable; sin downtime.
              </li>
              <li>
                <strong>Acero:</strong> contracciones + pasada de RF en piel;
                sin downtime.
              </li>
            </Box>
          </Box>
          <Box>
            <Typography variant="h5">¿A quién se recomienda?</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Orión:</strong> quienes no ven progreso con
                dieta/ejercicio y buscan <strong>primer impulso visible</strong>
                .
              </li>
              <li>
                <strong>Titán:</strong> quienes quieren{" "}
                <strong>reducir grasa localizada y marcar</strong> a la vez.
              </li>
              <li>
                <strong>Acero:</strong> quienes desean{" "}
                <strong>seguir tonificando</strong> y{" "}
                <strong>mejorar firmeza</strong> del abdomen.
              </li>
            </Box>
          </Box>
          <Box>
            <Typography variant="h5">Transparencia sobre manuales</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Drenaje linfático</strong>: coadyuvante reconocido para
                movilizar fluidos; se integra aquí por confort y acabado.
              </li>
              <li>
                <strong>Maderoterapia/modelador</strong>: complemento para
                moldear y textura; evidencia formal limitada; se usa{" "}
                <em>con criterio</em>. (Sin claims médicos.)
              </li>
            </Box>
          </Box>
        </Stack>
      </Container>

      {/* Precios y Ofertas */}
      <Box component="section" sx={{ py: 4, bgcolor: "grey.50" }}>
        <Container>
          <Typography variant="h3" align="center" gutterBottom>
            Precios y Ofertas (UYU)
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {PROGRAMS.map((program) => (
              <Grid
                key={program.name}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <ProgramCard program={program} />
              </Grid>
            ))}
          </Grid>
          <Typography align="center" sx={{ mt: 2, fontStyle: "italic" }}>
            Ofertas de Apertura activas por tiempo limitado.{" "}
            <strong>Cupos acotados por agenda.</strong>
          </Typography>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              href={WHATSAPP_LINK}
              variant="contained"
              color="success"
              sx={{ fontWeight: "bold" }}
            >
              Reservar por WhatsApp
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Qué contiene cada programa */}
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué contiene cada programa
        </Typography>
        <Stack spacing={3} sx={{ maxWidth: 900, mx: "auto" }}>
          <Box>
            <Typography variant="h5">Cinturón de Orión</Typography>
            <Typography>
              30’ Lipo Láser 635 nm → <strong>contorno</strong> · Maderoterapia
              → <strong>moldear</strong> · Drenaje →{" "}
              <strong>descongestionar</strong>.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5">Cinturón de Titán</Typography>
            <Typography>
              30’ <strong>MSculpt (HIFEM + RF)</strong> →{" "}
              <strong>músculo + grasa</strong> · 30’ Lipo Láser →{" "}
              <strong>afinado</strong> · Maderoterapia + Pulido →{" "}
              <strong>acabado</strong>.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5">Cinturón de Acero</Typography>
            <Typography>
              30’ <strong>MSculpt</strong> → <strong>tono real</strong> ·{" "}
              <strong>Radiofrecuencia</strong> focal en piel →{" "}
              <strong>firmeza</strong> · Maderoterapia + Drenaje →{" "}
              <strong>perfilado</strong>.
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Evidencia */}
      <Box component="section" sx={{ py: 4, bgcolor: "grey.50" }}>
        <Container>
          <Typography variant="h3" align="center" gutterBottom>
            Evidencia en 30 segundos
          </Typography>
          <Box
            component="ul"
            sx={{ maxWidth: 900, mx: "auto", textAlign: "left" }}
          >
            <li>
              <strong>HIFEM + RF simultánea (NEO)</strong>: ensayo aleatorizado
              con “sham” y estudios por MRI/US muestran reducción de grasa
              subcutánea y aumento de espesor muscular en abdomen.{" "}
              <em>Promedios poblacionales; resultados individuales varían.</em>
            </li>
            <li>
              <strong>Lipo Láser 635 nm</strong>: doble ciego, aleatorizado y
              “sham-controlled” con reducción de circunferencia como marcador de
              contorno.
            </li>
            <li>
              <strong>Radiofrecuencia en piel</strong>: revisiones clínicas
              describen <em>neocolagénesis</em> y <em>tensión cutánea</em> por
              calentamiento controlado de dermis.
            </li>
            <li>
              <strong>Drenaje linfático</strong>: parte del manejo conservador
              en linfedema; aquí se usa como coadyuvante estético.
            </li>
          </Box>
        </Container>
      </Box>

      {/* FAQ corto */}
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          FAQ corto
        </Typography>
        <Accordion>
          <AccordionSummary>
            ¿Esto reemplaza dieta o entrenamiento?
          </AccordionSummary>
          <AccordionDetails>
            No. Te da <strong>contorno y tono</strong> para que{" "}
            <strong>mantener</strong> sea más fácil.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>¿Voy a “bajar kilos”?</AccordionSummary>
          <AccordionDetails>
            No es un tratamiento de peso. Es <strong>moldeado</strong> y{" "}
            <strong>definición</strong>.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Contraindicaciones generales</AccordionSummary>
          <AccordionDetails>
            Embarazo/lactancia, marcapasos o implantes electrónicos/metálicos
            cercanos, tumores activos, fiebre/infección local, lesiones
            musculares. Evaluamos cada caso antes de empezar.
          </AccordionDetails>
        </Accordion>
      </Container>

      {/* CTA global sticky for mobile */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.paper",
          boxShadow: 3,
          py: 1,
          display: { xs: "block", md: "none" },
        }}
      >
        <Container>
          <Typography align="center" sx={{ mb: 1 }}>
            ¿Listo para elegir?
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              to={PROGRAMS[0].path}
              fullWidth
              variant="contained"
              color="success"
            >
              Quiero Orión
            </Button>
            <Button
              component={RouterLink}
              to={PROGRAMS[1].path}
              fullWidth
              variant="contained"
              color="success"
            >
              Quiero Titán
            </Button>
            <Button
              component={RouterLink}
              to={PROGRAMS[2].path}
              fullWidth
              variant="contained"
              color="success"
            >
              Quiero Acero
            </Button>
          </Stack>
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Button href={WHATSAPP_LINK} size="small" variant="text">
              Escribinos por WhatsApp
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Repetición CTA final para desktop */}
      <Container
        sx={{
          py: 6,
          textAlign: "center",
          display: { xs: "none", md: "block" },
        }}
      >
        <Typography variant="h4" gutterBottom>
          ¿Listo para elegir?
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <Button
            component={RouterLink}
            to={PROGRAMS[0].path}
            variant="contained"
            color="success"
          >
            Quiero Orión
          </Button>
          <Button
            component={RouterLink}
            to={PROGRAMS[1].path}
            variant="contained"
            color="success"
          >
            Quiero Titán
          </Button>
          <Button
            component={RouterLink}
            to={PROGRAMS[2].path}
            variant="contained"
            color="success"
          >
            Quiero Acero
          </Button>
        </Stack>
        <Button href={WHATSAPP_LINK} variant="outlined">
          Escribinos por WhatsApp
        </Button>
      </Container>
    </>
  );
}
