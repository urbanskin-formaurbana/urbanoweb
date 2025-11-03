/* eslint-disable no-irregular-whitespace */
import SEO from "../../components/SEO.jsx";
import RadiofrecuenciaImg from "../../assets/images/radiofrecuencia.jpg";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const WHATSAPP_PHONE = "59893770785";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola Esteban, quiero agendar mi evaluación corporal. Me interesa el Cinturón de Acero"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonAcero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SEO
        title="Cinturón de Acero | MSculpt + Radiofrecuencia — Esteban Marmion (Montevideo Centro)"
        description="Abdomen más firme en 60–70 min: MSculpt + Radiofrecuencia + Maderoterapia. Montevideo Centro. Sesión $1.900. Cuponera 6 $6.200 (hasta 21/Dic/25). Reservá por WhatsApp."
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
            Cinturón de Acero
          </Typography>
          <Typography variant="h5" gutterBottom>
            Abdomen más firme y definido en 60–70 minutos
          </Typography>
          <Typography sx={{ mb: 4 }}>
            Protocolo 4‑en‑1: MSculpt + Radiofrecuencia + Maderoterapia +
            Modelador. Sin cirugías. Sin reposo. En una sola visita: más tono,
            menos contorno y piel más firme.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: "bold", mb: isMobile ? 2 : 0 }}
          >
            Quiero que Esteban revise mi caso
          </Button>
        </Container>
      </Box>
      <Container sx={{ py: 2 }}>
        <Typography align="center" sx={{ fontStyle: "italic" }}>
          Estoy en Montevideo Centro y te atiendo yo.{" "}
          <strong>Nivel avanzado</strong>: si ya venís cuidándote y querés
          seguir tonificando músculo y tensando piel, este es tu plan. No
          invasivo y sin cirugías. Atiendo gente de Centro, Cordón, Parque Rodó
          y Pocitos.
        </Typography>
        <Box
          component="img"
          src={RadiofrecuenciaImg}
          alt="Radiofrecuencia + MSculpt — Cinturón de Acero"
          sx={{
            width: "100%",
            display: "block",
            mt: 4,
            borderRadius: 2,
          }}
        />
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Por qué mi Cinturón de Acero funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            1. MSculpt: músculo + grasa, a la vez
          </Typography>
          <Typography>
            Con HIFEM® provoco contracciones supramáximas que no lográs en el
            gimnasio. Ese estímulo construye músculo y ayuda a reducir grasa
            subcutánea en la misma sesión de 30 minutos.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            2. Radiofrecuencia (RF): tensión de piel que se nota
          </Typography>
          <Typography>
            Caliento el colágeno dérmico al rango terapéutico (~40–42 °C en
            superficie / ≈50 °C en tejidos blandos). Logro contracción inmediata
            de fibras y neocolagénesis en semanas. Traducción: firmeza y mejor
            textura en la piel del abdomen.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            3. Maderoterapia + drenaje
          </Typography>
          <Typography>
            Drenaje linfático manual para mover fluidos y que te sientas menos
            hinchado como coadyuvante estético.
          </Typography>
          <Typography>
            Maderoterapia para modelar: la uso como apoyo, ajustando intensidad
            a tu caso.
          </Typography>
        </Stack>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Es para vos?
        </Typography>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <Typography align="left" sx={{ mb: 2 }}>
            Te va a servir si:
          </Typography>
          <Typography align="left" sx={{ mb: 2 }}>
            <li>
              Venís cuidándote y querés quemar la grasa rebelde del abdomen sin
              frenar tu rutina.
            </li>
            <li>
              Buscás tono real (músculo) + piel más tensa en la misma sesión.
            </li>
            <li>
              Querés resultados acumulativos en pocas semanas, con protocolo
              claro y medible.
            </li>
          </Typography>
          <Typography align="left">
            <strong>Contraindicaciones:</strong> embarazo/lactancia; marcapasos
            u otros implantes metálicos/electrónicos; problemas cardíacos;
            tumores activos; fiebre/infección local; músculos lesionados. Te
            evalúo personalmente antes de empezar.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Qué hacemos en cada sesión?
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>MSculpt — 30’</strong> (HIFEM). Vas a sentir contracciones
            intensas; no es invasivo y no requiere reposo.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para firmeza: trabajo sobre el
            colágeno dérmico (tensión inmediata + remodelación en sesiones).
          </li>
          <li>
            <strong>Maderoterapia y Masaje Modelador</strong>: continúo el
            tensado de piel y la definición del contorno; dosifico según tu
            respuesta del día.
          </li>
        </Box>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "success.light",
            borderLeft: 4,
            borderColor: "success.main",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Typography>
            Diferencia clave vs. otros paquetes: acá me enfoco en la
            tonificación muscular avanzada y uso Radiofrecuencia para seguir
            tensando la piel; el masaje lo ajusto para rematar el acabado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Resultados y ritmo que te propongo
        </Typography>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <li>
            <strong>Serie inicial típica:</strong> 2 o 3 sesiones por semana,
            dejando 1 o 2 días de por medio según tu caso. La definición y el
            contorno siguen mejorando hasta ~3 meses después de terminar la
            serie. Luego, mantenimiento simple.
          </li>
          <li>
            <strong>Expectativa realista:</strong> menos contorno, más tono y
            mejor definición. No es un tratamiento de “kilos”.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Precios y cuponeras
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Sesión
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 1.900
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ position: "relative", height: "100%" }}>
              <Chip
                label="Oferta de Primavera"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                  boxShadow: 1,
                }}
              />
              <Card
                sx={{
                  textAlign: "center",
                  border: 2,
                  borderColor: "success.main",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Cuponera 6
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textDecoration: "line-through",
                      my: -1,
                      fontSize: 12,
                    }}
                    color="text.secondary"
                  >
                    $ 7.200
                  </Typography>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    $ 6.200
                  </Typography>
                  <Typography variant="body2">
                    ≈ $ 1.033/sesión · ahorrás $ 5.200 vs 6 sueltas.
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Oferta válida hasta 21/Dic/25
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 9.200
                </Typography>
                <Typography variant="body2">
                  ≈ $ 1.150/sesión · ahorrás $ 6.000 vs 8 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 11.000
                </Typography>
                <Typography variant="body2">
                  ≈ $ 1.100/sesión · ahorrás $ 8.000 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación:</strong>
          <br />
          Mejor precio por sesión: Cuponera 6 por Oferta de Primavera.
        </Typography>
        <Typography align="center" sx={{ mt: 1 }}>
          Opciones de pago: Efectivo y Transferencia.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Paso a paso
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 600, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>Evaluación rápida</strong> (objetivos, antecedentes,
            contraindicaciones).
          </li>
          <li>
            <strong>MSculpt 30’</strong> (músculo + grasa).
          </li>
          <li>
            <strong>Radiofrecuencia</strong> (piel).
          </li>
          <li>
            <strong>Masaje modelador</strong> (pulido/drenaje).
          </li>
          <li>
            <strong>Plan de mantenimiento</strong> sencillo para sostener
            resultados.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Preguntas frecuentes
        </Typography>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuál es la duración de la sesión?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Aproximadamente 60 a 70 minutos. Puede variar según tu respuesta
                ese día.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Es doloroso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas a sentir contracciones fuertes y un calor tolerable. Salís y
                seguís con tu día; a veces queda una fatiga leve tipo gimnasio.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿En cuánto tiempo se ven cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando más tono y menos contorno sesión a sesión. El pico
                se ve semanas después de completar la serie.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿Qué hace exactamente la Radiofrecuencia en la piel?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Genera calentamiento controlado que contrae colágeno y estimula
                nueva producción (neocolagénesis) → mejor firmeza y elasticidad.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿Para qué suman la maderoterapia y el drenaje?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                El drenaje ayuda a mover fluidos (útil como coadyuvante); la
                maderoterapia la uso para modelar, aplicada con criterio.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Existe alguna contraindicación?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo/lactancia; marcapasos u otros implantes
                metálicos/electrónicos; problemas cardíacos; tumores activos;
                fiebre/infecciones locales; músculos lesionados. Siempre te
                evalúo personalmente.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <Container
        component="section"
        sx={{
          py: 6,
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
        }}
      >
        <Typography variant={isMobile ? "h4" : "h3"} gutterBottom>
          ¿Agendamos tu evaluación y te dejo el abdomen más firme?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Asegurá tu <strong>Cuponera 6</strong> (Oferta de Primavera hasta
          21/Dic/25) o reservá una sesión para empezar. Yo me encargo del resto.
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: "bold" }}
        >
          Escribime por WhatsApp
        </Button>
      </Container>
      {/* JSON-LD SEO: Service and FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Cinturón de Acero",
              serviceType:
                "MSculpt (HIFEM) + Radiofrecuencia + Maderoterapia + Masaje Modelador",
              areaServed: "Montevideo Centro",
              provider: {
                "@type": "Person",
                name: "Esteban Marmion",
                telephone: "+59893770785",
              },
              offers: [
                {
                  "@type": "Offer",
                  price: "1900",
                  priceCurrency: "UYU",
                  availability: "https://schema.org/InStock",
                },
                {
                  "@type": "Offer",
                  name: "Cuponera 6",
                  price: "6200",
                  priceCurrency: "UYU",
                  priceValidUntil: "2025-12-21",
                  availability: "https://schema.org/InStock",
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "¿Cuál es la duración de la sesión?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Tiene una duración aproximada de 60 a 70 minutos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Es doloroso?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Vas a sentir contracciones fuertes y un calor tolerable. Salís y seguís con tu día; a veces queda una fatiga leve tipo gimnasio.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿En cuánto tiempo se ven cambios?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Vas notando más tono y menos contorno sesión a sesión. El pico se ve semanas después de completar la serie.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué hace exactamente la Radiofrecuencia en la piel?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Genera calentamiento controlado que contrae colágeno y estimula nueva producción (neocolagénesis) para mejorar la firmeza y elasticidad.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Para qué suman la maderoterapia y el drenaje?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "El drenaje ayuda a mover fluidos como coadyuvante estético; la maderoterapia se usa para modelar, aplicada con criterio según el caso.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Existe alguna contraindicación?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Embarazo o lactancia; marcapasos u otros implantes metálicos/electrónicos; problemas cardíacos; tumores activos; fiebre o infecciones locales; músculos lesionados. Siempre evalúo el caso personalmente.",
                  },
                },
              ],
            },
          ]),
        }}
      />
      <Container component="footer" sx={{ py: 2 }}>
        <Typography variant="body2" align="center">
          Los resultados dependen de tu composición corporal y tus hábitos. Este
          protocolo no reemplaza nutrición, entrenamiento ni indicación médica;
          los potencia. MSculpt (HIFEM) cuenta con publicaciones; la
          Radiofrecuencia en piel tiene base fisiológica y revisiones clínicas;
          el drenaje y la maderoterapia los uso como acompañamiento. Realizo
          evaluación previa obligatoria. Si sos de leer, te dejo algunos
          estudios:{" "}
          <Link
            href="https://europepmc.org/article/PMC/PMC9028295?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Europe PMC
          </Link>
          ,{" "}
          <Link
            href="https://351face.com/wp-content/uploads/2020/11/Emsculpt-NEO_CLIN_MRI-study_Jacob_summary_ENUS100.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Advanced Cosmetic Surgery
          </Link>
          ,{" "}
          <Link
            href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            advancesincosmeticsurgery.com
          </Link>
          ,{" "}
          <Link
            href="https://www.oaepublish.com/articles/2347-9264.2021.60?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            OAE Publish
          </Link>
          ,{" "}
          <Link
            href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Cleveland Clinic
          </Link>
          ,{" "}
          <Link
            href="https://www.verywellhealth.com/wood-therapy-6362588?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Verywell Health
          </Link>
          ,{" "}
          <Link
            href="https://www.wolterskluwer.com/en/news/radiofrequency-heating-plus-electromagnetic-stimulation-reduces-belly-fat-and-increases-muscle?"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            Wolters Kluwer
          </Link>
          ,{" "}
          <Link
            href="https://medicalxpress.com/news/2022-04-radiofrequency-electromagnetic-belly-fat-muscle.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Medical Xpress
          </Link>
          ,{" "}
          <Link
            href="https://academic.oup.com/asj/article/44/8/850/7626230?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Oxford Academic
          </Link>
          ,{" "}
          <Link
            href="https://www.thieme-connect.com/products/ejournals/pdf/10.1055/s-0033-1363756.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Thieme
          </Link>
          ,{" "}
          <Link
            href="https://www.nhs.uk/conditions/lymphoedema/treatment/?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            nhs.uk
          </Link>
          ,{" "}
          <Link
            href="https://wendyreganmd.com/wp-content/uploads/2024/10/Emsculpt-Neo-Pre-and-Post-Care-Instructions.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Harbour Direct Primary Care Inc.
          </Link>
          ,{" "}
          <Link
            href="https://norcaldermatology.com/procedure/emsculpt-neo/?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Dermatology Center NorCal
          </Link>
        </Typography>
      </Container>
    </>
  );
}
