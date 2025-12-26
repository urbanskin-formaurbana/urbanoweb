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
import {useTheme} from "@mui/material/styles";

const WHATSAPP_PHONE = "59893770785";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Quiero agendar mi evaluación corporal. Me interesa el cinturón de Acero"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonAcero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Acero | MSculpt + Radiofrecuencia (Montevideo)"
        description="Definí y tensá abdomen en 60’: MSculpt (HIFEM + RF) + RF de piel + Maderoterapia + Drenaje. Sesión $1.900. Cuponera 6 a $8.400. Reservá por WhatsApp."
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
            Cinturón de Acero
          </Typography>
          <Typography variant="h5" gutterBottom>
            Llevá tu abdomen a su máximo potencial.
          </Typography>
          <Typography sx={{mb: 4}}>
            Protocolo 4‑en‑1: 30’ MSculpt (HIFEM®) + Radiofrecuencia +
            Maderoterapia + Masaje Modelador. En una sola visita: más tono,
            menos contorno y piel más firme.
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
          En Montevideo Centro. <strong>Nivel avanzado</strong> , para quienes
          ya vienen cuidándose y quieren seguir tonificando músculo y piel. No
          invasivo. Sin cirujías.
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
      <Container component="section" sx={{py: 2}}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Por qué funciona?
        </Typography>
        <Stack spacing={2} sx={{maxWidth: 700, mx: "auto"}}>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            1. MSculpt: músculo y grasa, al mismo tiempo
          </Typography>
          <Typography>
            Utiliza Tecnología HIFEM® (contracciones supramáximas que ningún
            entrenamiento reproduce). La sinergia logra aumento de masa/espesor
            muscular y reducción de grasa subcutánea en 30 minutos.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            2. Radiofrecuencia (RF): tensión de la piel que se nota
          </Typography>
          <Typography>
            La RF calienta el colágeno dérmico hasta el rango terapéutico (
            ~40–42 °C en superficie / ≈50 °C en tejidos blandos ), lo que
            provoca contracción inmediata de fibras y neocolagénesis en semanas.
            Resultado: mejor firmeza y textura en la cubierta cutánea del
            abdomen.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{mt: 2}}>
            3. Maderoterapia + drenaje
          </Typography>
          <Typography>
            Drenaje linfático manual: técnica suave que ayuda a mover fluidos y
            a sentirse menos hinchado como coadyuvante estético.
          </Typography>
          <Typography>
            Maderoterapia: popular para moldear; la usamos como apoyo, ajustando
            intensidad a tu caso.
          </Typography>
        </Stack>
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
            Elegí Cinturón de Acero SI:
          </Typography>
          <Typography align="left" sx={{mb: 2}}>
            <li>
              Querés seguir definiendo y quemar la grasa rebelde del abdomen sin
              parar tu rutina.
            </li>
            <li>
              Buscás tono real (músculo) + mejor piel (tensión) en la misma
              sesión.
            </li>
            <li>
              Preferís resultados acumulativos en pocas semanas, con protocolo
              claro y medible.
            </li>
          </Typography>

          <Typography align="left">
            No recomendado si estás embarazada/lactando o tenés marcapasos,
            implantes metálicos/electrónicos, problemas cardíacos, tumores
            activos, fiebre/infección local o músculos lesionados. Evaluamos tu
            caso antes de iniciar.
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
            MSculpt — 30’ (HIFEM) Sensación: contracciones intensas; no
            invasivo, sin reposo.
          </li>
          <li>
            Radiofrecuencia Objetivo: firmeza. Trabajamos en el colágeno dérmico
            (tensión inmediata + remodelación en sesiones).
          </li>
          <li>
            Maderoterapia y Masaje Modelador Objetivo: Continuar con el tensado
            de la piel, y la definición de la figura. modelador + maderoterapia
            (contorno), dosificado según tu respuesta del día.
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
            Diferencia clave con los otros paquetes: acá nos enfocamos en la
            tonificación muscular avanzada y usamos Radiofrecuencia para seguir
            tenzando la piel ; el masaje se ajusta para rematar el acabado.
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
            <strong>Serie inicial típica:</strong> 2 o 3 sesiones por semana,
            con 1 o 2 días de descanso entre sesiones, según el caso; la
            definición y el contorno siguen mejorando hasta ~3 meses después de
            terminar la serie. Luego, mantenimiento según objetivo.
          </li>
          <li>
            <strong>Expectativa realista:</strong> menos contorno, más tono,
            mejor definición; no es un tratamiento de “kilos”.
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
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{textAlign: "center", height: "100%"}}>
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
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Box sx={{position: "relative", height: "100%"}}>
              <Card sx={{textAlign: "center", height: "100%"}}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Cuponera 6
                  </Typography>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    $ 8.400
                  </Typography>
                  <Typography variant="body2">
                    ahorrás $ 3.000 vs 6 sueltas.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{textAlign: "center", height: "100%"}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 10.000
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 5.200 vs 8 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{textAlign: "center", height: "100%"}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 11.500
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 7.500 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{mt: 3}}>
          <strong>Recomendación:</strong>
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
          Paso a paso
        </Typography>
        <Box component="ol" sx={{maxWidth: 600, mx: "auto", textAlign: "left"}}>
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
                Tiene una duración aproximada de 60 a 70 minutos.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Es doloroso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Sentís contracciones fuertes y calor tolerable; salís y seguís
                con tu día.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿En cuánto tiempo se ven cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando más tono y menos contorno sesión a sesión .
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>
                ¿Qué hace exactamente la Radiofreciencia en la piel?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Genera calentamiento controlado que contrae colágeno y estimula{" "}
                nueva producción (neocolagénesis) → mejor firmeza/elasticidad.
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
                El drenaje ayuda a mover fluidos (útil como coadyuvante); la{" "}
                maderoterapia se usa para modelar, la aplicamos con criterio.
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
                fiebre/infecciones locales; músculos lesionados. Siempre
                evaluamos tu caso.
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
          ¿Listo para esculpir y tensar en la misma sesión?
        </Typography>
        <Typography sx={{mb: 3}}>
          Asegurá tu Cuponera o reservá 1 sesión para arrancar.
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
          protocolo no reemplaza nutrición/entrenamiento ni indicación médica;
          los potencia. MSculpt (HIFEM) cuenta con publicaciones; la{" "}
          Radiofrecuencia en piel tiene base fisiológica y revisiones clínicas;
          el drenaje y la maderoterapia se usan como acompañamiento. Evaluación
          previa obligatoria. Si seguís con curiosidad, podés revisar los
          siguientes estudios:{" "}
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
