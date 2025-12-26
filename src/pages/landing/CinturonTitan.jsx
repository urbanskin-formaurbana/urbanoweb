/* eslint-disable no-irregular-whitespace */
import SEO from "../../components/SEO.jsx";
import EmsculptImg from "../../assets/images/emsculpt.jpg";
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
  "Quiero agendar mi evaluación corporal. Me interesa el cinturón de Titán"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonTitan() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Titán | MSculpt + Lipo Láser (Montevideo)"
        description="Definí y reducí abdomen en la misma sesión: MSculpt (HIFEM + RF) + Lipo Láser 635 nm + Maderoterapia + Pulido. Sesión $2.000. Cuponera 6 a $6.600 (Oferta de Primavera). Reservá por WhatsApp."
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
            Cinturón de Titán
          </Typography>
          <Typography variant="h5" gutterBottom>
            Reduce y tonifica en la misma sesión.
          </Typography>
          <Typography sx={{mb: 4}}>
            Protocolo 4‑en‑1: MSculpt (HIFEM) + Lipo Láser 635 nm +
            Maderoterapia + Pulido (drenaje/modelador) . No invasivo, sin
            reposo, pensado para marcar abdomen y bajar contorno de forma
            eficiente.
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
            Escribinos por WhatsApp
          </Button>
        </Container>
      </Box>
      <Container sx={{py: 2}}>
        <Typography align="center" sx={{fontStyle: "italic"}}>
          En Montevideo Centro. <strong>Nivel intermedio</strong> (ideal para
          quienes ya vienen cuidándose y quieren quemar la grasa rebelde del
          abdomen y flancos). Sin agujas, y sin cirugías.
        </Typography>
        <Box
          component="img"
          src={EmsculptImg}
          alt="MSculpt + Lipo Láser — Cinturón de Titán"
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
          ¿Por qué el Cinturón de Titán funciona?
        </Typography>
        <Stack spacing={2} sx={{maxWidth: 800, mx: "auto"}}>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            1. MSculpt: músculo + grasa, a la vez
          </Typography>
          <Typography>
            Tecnología HIFEM® que genera 25.000 contracciones musculares,
            imposibles de lograr con ejercicios convencionales, en solo 30
            minutos. El resultado es sinergia: construcción muscular + reducción
            de grasa en una sesión.
          </Typography>
          <Typography>
            Evidencia clínica: Reportes promedian ≈30% menos grasa y ≈25% más
            músculo, medidos con MRI/US (promedios, no promesas individuales).
          </Typography>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            2. Lipo Láser: contorno y piel más tensa
          </Typography>
          <Typography>
            El lipo láser usa una luz roja suave para "despertar" las células de
            grasa. Esto hace que abran pequeños poros por un momento y liberen
            la grasa que tienen adentro. Así, las células se achican, pero no se
            destruyen. Es contorneado, no “bajar kilos”.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            3. Maderoterapia + Pulido (drenaje/modelador)
          </Typography>
          <Typography>
            Drenaje linfático manual: técnica reconocida para movilizar fluidos;
            se usa como acompañamiento de otros protocolos estéticos para
            potenciar los resultados.
          </Typography>
          <Typography>
            Masaje modelador/maderoterapia: maniobras para romper adiposidad
            localizada.
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
            Es simple: MSculpt activa y define el músculo mientras reduce grasa
            al mismo tiempo; el Lipo Láser afina contorno; el Pulido drena y
            perfila el acabado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Box
          component="ul"
          sx={{maxWidth: 800, mx: "auto", textAlign: "left", mb: 2}}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            align="center"
            gutterBottom
          >
            ¿Es para mí?
          </Typography>
          <Typography align="left" sx={{mb: 2}}>
            Este protocolo es para vos si:
          </Typography>
          <Typography align="left" sx={{mb: 2}}>
            <li>
              Ya probaste dieta/ejercicio y querés sacar la última grasa
              localizada del abdomen.
            </li>
            <li>Buscás definición muscular visible sin parar tu agenda.</li>
            <li>
              Querés resultados acumulativos en pocas semanas (serie corta
              inicial).
            </li>
          </Typography>
          <Typography align="left">
            <strong>Contraindicaciones:</strong> embarazo/lactancia; implantes
            metálicos o electrónicos (p. ej., marcapasos, ciertos DIU/cobre) en
            zonas cercanas; problemas cardíacos; tumores activos; fiebre,
            infecciones locales, trastornos hemorrágicos; músculos lesionados.
            Siempre evaluamos tu caso antes de iniciar.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Qué incluye cada sesión?
        </Typography>
        <Box component="ol" sx={{maxWidth: 800, mx: "auto", textAlign: "left"}}>
          <li>
            <strong>MSculpt — 30’</strong> sobre abdomen y flancos (HIFEM).
            Sensación: contracciones intensas; no invasivo, sin reposo.
          </li>
          <li>
            <strong>Lipo Láser</strong> (láser frío 635 nm). Indoloro.
          </li>
          <li>
            <strong>Maderoterapia + Pulido</strong>: combinamos maderoterapia y{" "}
            masaje modelador según tu respuesta del día para bajar retención y{" "}
            mejorar el acabado.
          </li>
        </Box>
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
            <strong>Diferencia vs. Cinturón de Orión:</strong> Titán añade
            MSculpt que reduce y tonifica con 25mil contracciones en una sesión.
            Sí! 25mil contracciones musculares.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Resultados y ritmo recomendado
        </Typography>
        <Box
          component="ul"
          sx={{maxWidth: 800, mx: "auto", textAlign: "left", mb: 2}}
        >
          <li>
            <strong>Series iniciales habituales:</strong> 2 o 3 sesiones por
            semana descansando con un día de por medio, según cada caso; Los
            cambios siguen mejorando luego de la última sesión.
          </li>
          <li>
            <strong>Objetivo realista:</strong> menos contorno abdominal + más
            definición; no es un tratamiento de “bajar kilos”.
          </li>
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
                  $ 2.000
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
                    $ 8.700
                  </Typography>
                  <Typography variant="body2">
                    ahorrás $ 3.300 vs 6 sueltas.
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
                  $ 10.400
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 5.600 vs 8 sueltas.
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
                  $ 12.300
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 7.700 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{mt: 3}}>
          <strong>Recomendación directa:</strong>{" "}
          <strong>Mejor precio por sesión:</strong> <strong>Cuponera 6</strong>{" "}
          en Oferta de Primavera (ideal para completar una serie inicial y
          validar resultados sin gastar de más).
        </Typography>
      </Container>
      <Container component="section" sx={{py: 2, bgcolor: "grey.50"}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Paso a paso
        </Typography>
        <Box component="ol" sx={{maxWidth: 600, mx: "auto", textAlign: "left"}}>
          <li>
            <strong>Evaluación</strong> (objetivo y zona).
          </li>
          <li>
            <strong>MSculpt 30’</strong> (definición + grasa).
          </li>
          <li>
            <strong>Lipo Láser</strong> (contorno).
          </li>
          <li>
            <strong>Maderoterapia</strong> y Pulido (drenaje/modelador
            personalizado).
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
              <Typography>
                Se sienten contracciones intensas y calor tolerable; salís y
                seguís con tu día.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando más tono y menos contorno sesión a sesión ; el pico
                se observa semanas después al completar la serie (el cuerpo
                sigue eliminando grasa y el músculo sigue adaptándose).
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente el Lipo Láser?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Es un láser frío de baja intensidad (≈635 nm) que fotoactiva
                adipocitos y abre poros transitorios en su membrana; así liberan
                lípidos y disminuyen de volumen.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿MSculpt es mejor que otras opciones no invasivas?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Para abdomen combina músculo + grasa en una sola sesión, con{" "}
                evidencia de imagen (MRI/US) y ensayo aleatorizado. Esa
                combinación simultánea no la ofrecen tecnologías de “grasa sola”
                o “músculo solo”.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Sirve para bajar de peso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                No. Es contorneado y definición muscular; el peso puede no
                cambiar aunque baje el perímetro y suba la firmeza.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Hay contraindicaciones?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo/lactancia, marcapasos o implantes
                metálicos/electrónicos cercanos, problemas cardíacos, tumores
                activos, fiebre/infecciones, músculos lesionados. Te asesoramos
                antes de empezar.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿En qué se diferencia del Cinturón de Orión?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Titán: Suma MSculpt, con respaldo en estudios (músculo + grasa).
                La maderoterapia y el Pulido son personalizados. <br />
                Orión: Es un protocolo de entrada.
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
          ¿Listo para definir abdomen y quemar esa grasa rebelde?
        </Typography>
        <Typography sx={{mb: 3}}>
          Asegurá tu Cuponera 6 — Oferta de Primavera o reservá 1 sesión para
          comenzar.
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
          Los resultados varían según composición corporal y hábitos. Este
          protocolo no reemplaza indicación médica, entrenamiento o nutrición;
          los potencia. MSculpt y Lipo Láser cuentan con publicaciones revisadas
          por pares sobre reducción de grasa y/o aumento muscular; la
          maderoterapia es un complemento. Siempre realizamos evaluación previa.
          Si seguís con curiosidad podés revisar estos estudios:{" "}
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
            href="https://europepmc.org/article/MED/34001694?"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            Europe PMC II
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
            href="https://onlinelibrary.wiley.com/doi/pdf/10.1002/lsm.22153?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Wiley Online Library
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
            href="https://arvivaesthetics.com/wp-content/uploads/2021/01/Emsculpt_Neo_DOC_Product-Fact-Sheet_ENUS100.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Arviv Medical Aesthetics
          </Link>
          ,{" "}
          <Link
            href="https://cdn-links.lww.com/permalink/prs/d/prs_149_5_2022_04_27_editorialoffice_may-2022-toc_sdc1.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            LWW
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
          ,{" "}
          <Link
            href="https://academic.oup.com/asjopenforum/article/doi/10.1093/asjof/ojad023/7059228?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Oxford Academic
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
            href="https://www.healthline.com/health/beauty-skin-care/wood-therapy?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Healthline
          </Link>
          ,{" "}
          <Link
            href="https://uploads.teachablecdn.com/attachments/ArBU8tV9TIujyDiBhiyu_Emsculpt_GUIDE_Clinical-guide_A4_EN101_preview.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            Teachable
          </Link>
          ,{" "}
          <Link
            href="https://sa1s3.patientpop.com/assets/docs/290920.pdf?"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            PatientPop
          </Link>
        </Typography>
      </Container>
    </>
  );
}
