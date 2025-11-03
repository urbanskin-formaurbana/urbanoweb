/* eslint-disable no-irregular-whitespace */
import SEO from "../../components/SEO.jsx";
import LipoLaserImg from "../../assets/images/Lipo-laser.jpg";
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
  "Hola Esteban, quiero agendar mi evaluación corporal. Me interesa el Cinturón de Orión"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonOrion() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cuánto dura la sesión?",
        acceptedAnswer: { "@type": "Answer", text: "Alrededor de 90 minutos." },
      },
      {
        "@type": "Question",
        name: "¿Es doloroso?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Es indoloro y no requiere reposo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuándo veo resultados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Muchas personas notan cambios en contorno desde las primeras sesiones; los estudios con Lipo Láser miden resultados a las 2 semanas (≈6 sesiones).",
        },
      },
      {
        "@type": "Question",
        name: "¿Sirve para bajar de peso?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No es un tratamiento de kilos. Trabajo el contorno (reducción de perímetro) y la textura; podés mantener con hábitos básicos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué hace exactamente el Lipo Láser?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Emite luz roja de baja intensidad (≈635 nm) que fotoactiva al adipocito, genera poros transitorios en la membrana y permite liberar lípidos, reduciendo su volumen.",
        },
      },
      {
        "@type": "Question",
        name: "¿Para qué suman la madera y la RF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La madera modela y estimula la microcirculación; la RF favorece la producción de colágeno y elastina, tensando la piel.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hay contraindicaciones?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Embarazo, lactancia, marcapasos, problemas cardíacos, cáncer activo u otras condiciones que desaconsejen fototerapia o masajes profundos.",
        },
      },
    ],
  };
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: "FORMA Urbana — Esteban Marmion",
    url: currentUrl || undefined,
    areaServed: "Montevideo",
    address: { addressLocality: "Montevideo", addressCountry: "UY" },
    telephone: "+59893770785",
    sameAs: [WHATSAPP_LINK],
  };
  return (
    <>
      <SEO
        title="Lipo Láser abdomen en Montevideo – Esteban Marmion"
        description="Menos contorno sin cirugía, sin agujas y sin reposo. Soy Esteban Marmion y trabajo tu abdomen con Lipo Láser 635 nm + Maderoterapia + Radiofrecuencia. Oferta de Primavera hasta 21/Dic/25. Escribime y vemos tu caso."
        keywords="lipo láser abdomen, Montevideo, Esteban Marmion, Cinturón de Orión, maderoterapia, radiofrecuencia, contorno, sin cirugía, Uruguay"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
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
            Cinturón de Orión
          </Typography>
          <Typography variant="h5" gutterBottom>
            90 minutos conmigo, sin agujas, menos contorno.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            Soy Esteban Marmion y te atiendo yo, de punta a punta. Quiero que te
            mires al espejo y notes menos contorno, piel más firme y un abdomen
            que se ve mejor vestido y sin ropa. ¿Cómo lo logramos? Con mi
            protocolo 3‑en‑1: Lipo Láser (635 nm) + Maderoterapia +
            Radiofrecuencia. Sin bisturí, sin agujas y{" "}
            <strong>sin reposo</strong>. Tu jean te cierra más cómodo, la remera
            calza mejor.
          </Typography>
          <Box sx={{ maxWidth: 800, mx: "auto", mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>
              Busco que notes 1–3 cm menos de contorno tras varias sesiones.
            </Typography>
          </Box>
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
          Trabajo en Montevideo Centro. No invasivo. Sin agujas. Piel intacta.
          Ideal como <strong>nivel inicial</strong> si venís con poca actividad
          física o querés un empujón visible para arrancar.
        </Typography>
        <Box
          component="img"
          src={LipoLaserImg}
          alt="Resultados del Cinturón de Orión"
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
          ¿Por qué funciona conmigo?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography>
            <strong>Desbloqueo la grasa “resistente”</strong>: uso Lipo Láser
            con luz roja (≈635 nm) para “despertar” al adipocito. Se abren poros
            transitorios y la célula libera lípidos, achicando su volumen sin
            romperla.
          </Typography>
          <Typography>
            <strong>Movilizo y modelo</strong>: con Maderoterapia activo la
            microcirculación y trabajo el tejido subcutáneo para mejorar textura
            y contorno. La evidencia formal es limitada, pero en combinación
            clínica con energía se ve una piel más uniforme.
          </Typography>
          <Typography>
            <strong>Tenso la piel</strong>: cierro la sesión con Radiofrecuencia
            para estimular colágeno y elastina. Resultado: mejor firmeza, mejor
            “agarre” de la piel.
          </Typography>
        </Stack>
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "success.light",
            borderLeft: 4,
            borderColor: "success.main",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Typography>
            Te hablo claro: la luz roja (635–680 nm) muestra reducción de
            centímetros tras ~6 sesiones en 2 semanas, sin cambios de peso. Esto
            es <strong>contorneado</strong>, no una “pérdida de kilos”.
          </Typography>
        </Box>
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
            Te lo recomiendo si:
          </Typography>

          <Typography align="left" sx={{ mb: 2 }}>
            <li>
              Venís peleando con el rollito del abdomen y no ves cambios pese a
              dieta y ejercicio.
            </li>
            <li>Querés algo cómodo y progresivo, sin quirófano ni agujas.</li>
            <li>
              Buscás un <em>impulso visible</em> que te anime a mantener (no a
              empezar de cero).
            </li>
            <li>Tenés la agenda apretada y no podés darte el lujo de parar.</li>
          </Typography>

          <Typography align="left">
            <strong>No lo realizo</strong> si estás embarazada o en lactancia,
            usás marcapasos, tenés cáncer activo o una condición médica que
            contraindique fototerapia o masajes profundos. Ante dudas, hablalo
            con tu médico y te asesoro.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Así trabajo cada sesión
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>Lipo Láser</strong> sobre abdomen. Sensación: indolora, sin
            calor significativo.
          </li>
          <li>
            <strong>Maderoterapia</strong> específica para abdomen: maniobras
            para modelar, activar la circulación y mejorar textura.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para favorecer la formación de
            nuevo colágeno, estimular el drenaje y la microcirculación.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Lo que vas a notar
        </Typography>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <li>
            <strong>Menos contorno</strong> en la zona tratada (cintura/abdomen)
            con avance sesión a sesión.
          </li>
          <li>
            <strong>Piel más firme</strong> y uniforme al combinar energía +
            técnica manual.
          </li>
          <li>
            <strong>Cero reposo</strong>: salís y seguís con tu rutina.
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
            En un ensayo doble ciego controlado, quienes recibieron Lipo Láser
            en brazos redujeron ~3,7 cm de circunferencia combinada tras 6
            sesiones, sin cambios de IMC. Es un resultado progresivo y
            acumulativo.
          </Typography>
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
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Sesión
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 1.500
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Box sx={{ position: "relative", height: "100%" }}>
              <Chip
                label="Oferta de Primavera hasta 21/Dic/25"
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
                    ahorrás $ 2.800 vs 6 sueltas.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 8.800
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 3.200 vs 8 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 10.500
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 4.500 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Mi consejo:</strong> si buscás la mejor relación
          precio/sesión, la <strong>Cuponera 6</strong> está imbatible por la
          Oferta de Primavera <strong>hasta 21/Dic/25</strong>. Si querés
          acompañar varias semanas y asegurar precio, elegí 8 o 10.
        </Typography>
        <Typography align="center" sx={{ mt: 1 }}>
          Opciones de pago: <strong>Efectivo</strong> y{" "}
          <strong>Transferencia</strong>.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Mi paso a paso
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 600, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>Evaluación rápida conmigo</strong> (zona + objetivos).
          </li>
          <li>
            <strong>Lipo Láser</strong> en abdomen y flancos.
          </li>
          <li>
            <strong>Maderoterapia</strong> para moldear.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para tensar la piel.
          </li>
          <li>
            <strong>Plan simple</strong> para sostener resultados con hábitos
            realistas.
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
              <Typography>¿Cuánto dura la sesión?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Alrededor de 90 minutos.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Es doloroso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>No. Es indoloro y no requiere reposo.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo resultados?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Muchas personas notan cambios en contorno desde las primeras
                sesiones; los estudios con Lipo Láser miden resultados a las 2
                semanas (≈6 sesiones). Tu caso puede variar.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Sirve para bajar de peso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                No es un tratamiento de “kilos”. Trabajo el contorno (reducción
                de perímetro) y la textura; podés mantener y potenciar con
                hábitos básicos.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente el Lipo Láser?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Emite luz roja de baja intensidad (≈635 nm) que fotoactiva al
                adipocito, genera poros transitorios en la membrana y permite
                liberar lípidos, reduciendo su volumen.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Para qué suman la madera y la RF?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                La madera modela y estimula la microcirculación; la RF favorece
                la producción de colágeno y elastina, tensando la piel.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Hay contraindicaciones?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo, lactancia, marcapasos, problemas cardíacos, cáncer
                activo u otras condiciones que desaconsejen fototerapia o
                masajes profundos. Si tenés dudas, charlalo con tu médico y te
                guío. (Criterios alineados a ensayos clínicos).
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <Container
        component="section"
        sx={{
          py: 2,
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
        }}
      >
        <Typography variant={isMobile ? "h4" : "h3"} gutterBottom>
          ¿Arrancamos hoy?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Escribime y vemos tu caso por WhatsApp. Reservá tu sesión o asegurá tu
          Cuponera 6 en Oferta de Primavera.
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
      <Container component="footer" sx={{ py: 2 }}>
        <Typography variant="body2" align="center">
          Los resultados varían de persona a persona. Este protocolo no
          reemplaza indicaciones médicas, dieta o ejercicio; los complementa. La
          bibliografía respalda la seguridad de 635–680 nm aplicada
          correctamente. Si te interesa leer más: ({" "}
          <Link
            href="https://europepmc.org/article/MED/20014253?utm_source=chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Europe PMC
          </Link>
          ,{" "}
          <Link
            href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            JCAD
          </Link>
          ,{" "}
          <Link
            href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            MDedge
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
            href="https://link.springer.com/article/10.1007/s11764-020-00928-1?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            SpringerLink
          </Link>
          )
        </Typography>
      </Container>
    </>
  );
}
