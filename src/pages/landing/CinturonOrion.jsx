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
import {useTheme} from "@mui/material/styles";

const WHATSAPP_PHONE = "59893770785";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Quiero agendar mi evaluación corporal. Me interesa el cinturón de Orión"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonOrion() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Orión | Lipo Láser 635 nm + Maderoterapia + Drenaje (Montevideo)"
        description="Reducí el contorno abdominal sin cirugía. Protocolo 3‑en‑1: Lipo Láser 635 nm + Maderoterapia + Drenaje Linfático. Sesión $1.500. Cuponera 6 a $5.500 (Oferta de Primavera)."
      />
      <Box
        component="header"
        sx={{
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
          py: {xs: 2, md: 4},
        }}
      >
        <Container>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{fontWeight: "bold"}}
            gutterBottom
          >
            Cinturón de Orión
          </Typography>
          <Typography variant="h5" gutterBottom>
            Cintura más definida, sin cirugía.
          </Typography>
          <Typography sx={{mb: 4}}>
            Protocolo 3‑en‑1 para reducir contorno abdominal y tensar la piel:{" "}
            Lipo Láser (635 nm) + Maderoterapia + Radiofrecuencia . Sesiones
            cómodas, sin afectar tu rutina en lo absoluto. Resultados que te
            motivan cuando te veas al espejo. Tu cambio empieza hoy.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            sx={{fontWeight: "bold", mb: isMobile ? 2 : 0}}
          >
            Escribinos por WhatsApp
          </Button>
        </Container>
      </Box>
      <Container sx={{py: 2}}>
        <Typography align="center" sx={{fontStyle: "italic"}}>
          En Montevideo Centro. No invasivo. Sin agujas. Piel intacta. Apto como{" "}
          <strong>nivel inicial</strong> para personas poco activas físicamente.
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
      <Container component="section" sx={{py: 2}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Por qué el Cinturón de Orión funciona?
        </Typography>
        <Stack spacing={2} sx={{maxWidth: 800, mx: "auto"}}>
          <Typography>
            <strong>Desbloquea la grasa “resistente”</strong>: El lipo láser usa
            una luz roja suave para "despertar" las células de grasa. Esto hace
            que abran pequeños poros por un momento y liberen la grasa que
            tienen adentro. Así, las células se achican, pero no se destruyen.
          </Typography>
          <Typography>
            <strong>Moviliza y moldea</strong>: La Maderoterapia estimula la
            microcirculación y el tejido subcutáneo para mejorar textura y
            contorno. La evidencia formal es limitada, pero muchos pacientes
            refieren piel más uniforme cuando se combina con otros métodos.
          </Typography>
          <Typography>
            <strong>Estimula el colageno de tu piel</strong>: La Radiofrecuencia
            reafirma y rejuvenece tu piel, estimulando el colágeno y la
            elastina. Combate la flacidez y mejora la textura.
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
            Según estudios, la luz roja del lipo laser (entre 635 y 680 nm)
            ayuda a reducir centímetros después de 6 sesiones en 2 semanas, sin
            bajar de peso. Es para modelar el cuerpo, no para adelgazar.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Es para mí?
        </Typography>
        <Box
          component="ul"
          sx={{maxWidth: 800, mx: "auto", textAlign: "left", mb: 2}}
        >
          <Typography align="left" sx={{mb: 2}}>
            Este protocolo está diseñado para vos SI:
          </Typography>

          <Typography align="left" sx={{mb: 2}}>
            <li>
              Luchás con el sobrepeso y no ves cambios en el abdomen pese a
              dieta/ejercicio.
            </li>
            <li>Querés algo cómodo y progresivo, sin quirófano, ni agujas.</li>
            <li>
              Buscás un primer impulso visible que te anime a mantener (no a
              empezar de cero).
            </li>
            <li>Tenés agenda apretada y no podés darte el lujo de parar.</li>
          </Typography>

          <Typography align="left">
            <strong>No lo recomendamos</strong> si estás embarazada o en
            lactancia, usás marcapasos, tenés cáncer activo o una condición
            médica que contraindique fototerapia o masajes profundos. Ante
            dudas, consultá a tu médico.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Qué incluye cada sesión
        </Typography>
        <Box component="ol" sx={{maxWidth: 800, mx: "auto", textAlign: "left"}}>
          <li>
            <strong>Lipo Láser</strong> sobre abdomen. Sensación: indolora, sin
            calor significativo.
          </li>
          <li>
            <strong>Maderoterapia</strong> específica para abdomen: maniobras
            para modelar, activar circulación y mejorar textura.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para favorecer la formación de
            nuevo colágeno. El drenaje linfático. La circulación de la piel y el
            tejido subcutáneo.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Beneficios que vas a notar
        </Typography>
        <Box
          component="ul"
          sx={{maxWidth: 800, mx: "auto", textAlign: "left", mb: 2}}
        >
          <li>
            <strong>Menos contorno</strong> en la zona tratada (cintura/abdomen)
            con progreso sesión a sesión.
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
            En un estudio donde ni los pacientes ni los médicos saben quién está
            recibiendo el tratamiento real y quién no , el grupo que recibió
            tratamiento con Lipo Laser en brazos redujo 3,7 cm de circunferencia
            combinada tras 6 sesiones (sin cambios en el IMC). Resultado{" "}
            progresivo y acumulativo.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2}}>
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
            <Card sx={{textAlign: "center", height: "100%"}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Sesión
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 1.700
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
            <Box sx={{position: "relative", height: "100%"}}>
              <Card sx={{textAlign: "center", height: "100%"}}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Cuponera 6
                  </Typography>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    $ 7.200
                  </Typography>
                  <Typography variant="body2">
                    ahorrás $ 3.000 vs 6 sueltas.
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
            <Card sx={{textAlign: "center", height: "100%"}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 8.800
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 4.800 vs 8 sueltas.
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
            <Card sx={{textAlign: "center", height: "100%"}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 10.500
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 6.500 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{mt: 3}}>
          <strong>Recomendación directa:</strong>
          <br />
          Mejor precio por sesión: Cuponera 10 al tener la sesión más económica.
        </Typography>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Cómo es el paso a paso
        </Typography>
        <Box component="ol" sx={{maxWidth: 600, mx: "auto", textAlign: "left"}}>
          <li>
            <strong>Evaluación rápida</strong> (zona + objetivos).
          </li>
          <li>
            <strong>Lipo Láser</strong> en abdomen in flancos.
          </li>
          <li>
            <strong>Maderoterapia</strong> para moldear.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para tensar la piel.
          </li>
          <li>
            <strong>Plan de mantenimiento</strong> sencillo para sostener
            resultados.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Preguntas frecuentes
        </Typography>
        <Box sx={{maxWidth: 800, mx: "auto"}}>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuál es la duración de la sesión?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Tiene una duración aproximada de 90 minutos.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Es doloroso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>No. Es indoloro y no requiere de reposo.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo resultados?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Muchas personas notan cambios en contorno desde las primeras
                sesiones; los estudios con Lipo Laser miden resultados a las 2
                semanas (6 sesiones). Tu caso puede variar.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Sirve para bajar de peso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                No es un tratamiento de “kilos”. Es contorneado (reducción de
                perímetro) y mejor textura; podés mantener y potenciar con
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
                adipocito, genera poros transitorios en la membrana y permite{" "}
                liberar lípidos, reduciendo su volumen.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿Para qué suman la Maderoterapia y la Radiofrecuencia?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                La primera modela y estimula la microcirculación; el segundo{" "}
                favorece la producción de colágeno y elastina, tensando la piel.
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
                masajes profundos. Si tenés dudas, consultá a tu médico.
                (Criterios alineados a ensayos clínicos).
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
          ¿Listo para empezar?
        </Typography>
        <Typography sx={{mb: 3}}>
          Reservá tu sesión o asegurá tu Cuponera 6 en Oferta de Primavera.
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          sx={{fontWeight: "bold"}}
        >
          Escribinos ahora
        </Button>
      </Container>
      <Container component="footer" sx={{py: 2}}>
        <Typography variant="body2" align="center">
          Los resultados individuales varían. Este protocolo no reemplaza
          indicaciones médicas, dieta o ejercicio; los potencia. Estudio tras
          estudio indica seguridad y confort en dispositivos 635–680 nm cuando
          se aplican correctamente. Puedes revisar los siguientes estudios si
          aún tienes curiosidad: ({" "}
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
