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

const WHATSAPP_LINK = "https://wa.me/59893770785";

export default function CinturonAcero() {
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Acero | MSculpt + Radiofrecuencia (Montevideo)"
        description="Definí y tensá abdomen en 60’: MSculpt (HIFEM + RF) + RF de piel + Maderoterapia + Drenaje. Sesión $1.900. Cuponera 6 a $6.200 (Oferta de Apertura). Reservá por WhatsApp."
      />
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
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            Cinturón de Acero
          </Typography>
          <Typography variant="h5" gutterBottom>
            Llevá tu abdomen a su <strong>máximo potencial</strong>.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            <strong>Protocolo 4‑en‑1</strong>:{" "}
            <strong>30’ MSculpt (HIFEM®)</strong> +{" "}
            <strong>Radiofrecuencia</strong> + <strong>Maderoterapia</strong> +{" "}
            <strong>Masaje Modelador</strong>. En una sola visita:{" "}
            <strong>más tono, menos contorno y piel más firme</strong>.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            href={WHATSAPP_LINK}
            sx={{ fontWeight: "bold" }}
          >
            Escribinos por WhatsApp
          </Button>
        </Container>
      </Box>
      <Container sx={{ py: 4 }}>
        <Typography align="center" sx={{ fontStyle: "italic" }}>
          En <strong>Montevideo Centro</strong>. <strong>Nivel avanzado</strong>
          , para quienes ya vienen cuidándose y quieren{" "}
          <strong>seguir tonificando músculo y piel</strong>.{" "}
          <strong>No invasivo. Sin cirujías.</strong>
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
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Por qué funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            1. MSculpt: músculo <strong>y</strong> grasa, al mismo tiempo
          </Typography>
          <Typography>
            Utiliza Tecnología <strong>HIFEM®</strong> (contracciones
            supramáximas que ningún entrenamiento reproduce). La{" "}
            <strong>sinergia</strong> logra{" "}
            <strong>aumento de masa/espesor muscular</strong> y{" "}
            <strong>reducción de grasa subcutánea</strong> en{" "}
            <strong>30 minutos</strong>.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            2. Radiofrecuencia (RF): <strong>tensión de la piel</strong> que se
            nota
          </Typography>
          <Typography>
            La RF <strong>calienta el colágeno dérmico</strong> hasta el rango
            terapéutico (
            <strong>~40–42 °C en superficie / ≈50 °C en tejidos blandos</strong>
            ), lo que provoca <strong>
              contracción inmediata de fibras
            </strong> y <strong>neocolagénesis</strong> en semanas. Resultado:{" "}
            <strong>mejor firmeza y textura</strong> en la cubierta cutánea del
            abdomen.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            3. Maderoterapia + drenaje
          </Typography>
          <Typography>
            <strong>Drenaje linfático manual</strong>: técnica suave que ayuda a{" "}
            <strong>mover fluidos</strong> y a sentirse menos hinchado como{" "}
            <strong>coadyuvante</strong> estético.
          </Typography>
          <Typography>
            <strong>Maderoterapia</strong>: popular para{" "}
            <strong>moldear</strong>; la usamos como <strong>apoyo</strong>,
            ajustando intensidad a tu caso.
          </Typography>
        </Stack>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: "grey.50" }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Es para mí?
        </Typography>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <Typography align="left" sx={{ mb: 2 }}>
            Elegí <strong>Cinturón de Acero</strong> SI:
          </Typography>
          <Typography align="left" sx={{ mb: 2 }}>
            <li>
              Querés <strong>seguir definiendo</strong> y{" "}
              <strong>quemar la grasa rebelde</strong> del abdomen sin parar tu
              rutina.
            </li>
            <li>
              Buscás <strong>tono real</strong> (músculo) +{" "}
              <strong>mejor piel</strong> (tensión){" "}
              <strong>en la misma sesión</strong>.
            </li>
            <li>
              Preferís <strong>resultados acumulativos</strong> en pocas
              semanas, con protocolo claro y medible.
            </li>
          </Typography>

          <Typography align="left">
            <strong>No recomendado</strong> si estás embarazada/lactando o tenés{" "}
            <strong>marcapasos, implantes metálicos/electrónicos</strong>,
            problemas cardíacos, tumores activos, fiebre/infección local o{" "}
            <strong>músculos lesionados</strong>. Evaluamos tu caso antes de
            iniciar.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué incluye cada sesión
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>MSculpt — 30’ (HIFEM)</strong> Sensación:{" "}
            <strong>contracciones intensas</strong>; no invasivo, sin reposo.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> Objetivo: <strong>firmeza</strong>.
            Trabajamos en el <strong>colágeno dérmico</strong> (tensión
            inmediata + remodelación en sesiones).
          </li>
          <li>
            <strong>Maderoterapia y Masaje Modelador</strong> Objetivo:
            Continuar con el tensado de la piel, y la definición de la figura.
            <strong>modelador + maderoterapia</strong> (contorno),{" "}
            <strong>dosificado</strong> según tu respuesta del día.
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
            <strong>Diferencia clave con los otros paquetes:</strong> acá nos
            enfocamos en la <strong>tonificación muscular avanzada</strong> y
            usamos <strong>Radiofrecuencia para seguir tenzando la piel</strong>
            ; el masaje se ajusta para rematar el acabado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: "grey.50" }}>
        <Typography variant="h3" align="center" gutterBottom>
          Resultados y ritmo recomendado
        </Typography>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <li>
            <strong>Serie inicial típica:</strong>{" "}
            <strong>2 o 3 sesiones</strong> por semana, con 1 o 2 días de
            descanso entre sesiones, según el caso; la definición y el contorno
            siguen <strong>mejorando hasta ~3 meses</strong> después de terminar
            la serie. Luego, <strong>mantenimiento</strong> según objetivo.
          </li>
          <li>
            <strong>Expectativa realista:</strong>{" "}
            <strong>menos contorno</strong>,{" "}
            <strong>más tono, mejor definición</strong>; <strong>no</strong> es
            un tratamiento de “kilos”.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
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
                label="Oferta de Apertura"
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
                  <Typography variant="h4" color="success.main" gutterBottom>
                    $ 6.200
                  </Typography>
                  <Typography variant="body2">
                    ahorrás $ 5.200 vs 6 sueltas.
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
                  ahorrás $ 6.000 vs 8 sueltas.
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
                  ahorrás $ 8.000 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación:</strong>
          <br />
          <strong>Mejor precio por sesión:</strong> <strong>Cuponera 6</strong>{" "}
          por Oferta de Apertura.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: "grey.50" }}>
        <Typography variant="h3" align="center" gutterBottom>
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
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Preguntas frecuentes
        </Typography>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuál es la duración de la sesión?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Tiene una duración aproximada de{" "}
                <strong>60 a 70 minutos</strong>.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Es doloroso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Sentís <strong>contracciones fuertes</strong> y{" "}
                <strong>calor tolerable</strong>; salís y seguís con tu día.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿En cuánto tiempo se ven cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando <strong>más tono</strong> y{" "}
                <strong>menos contorno</strong> <strong>sesión a sesión</strong>
                .
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
                Genera <strong>calentamiento controlado</strong> que{" "}
                <strong>contrae</strong> colágeno y <strong>estimula</strong>{" "}
                nueva producción (neocolagénesis) →{" "}
                <strong>mejor firmeza/elasticidad</strong>.
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
                El <strong>drenaje</strong> ayuda a{" "}
                <strong>mover fluidos</strong> (útil como coadyuvante); la{" "}
                <strong>maderoterapia</strong> se usa para{" "}
                <strong>modelar</strong>, la aplicamos{" "}
                <strong>con criterio</strong>.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Existe alguna contraindicación?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo/lactancia; <strong>marcapasos</strong> u otros{" "}
                <strong>implantes metálicos/electrónicos</strong>; problemas
                cardíacos; tumores activos; fiebre/infecciones locales;{" "}
                <strong>músculos lesionados</strong>. Siempre evaluamos tu caso.
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
        <Typography variant="h3" gutterBottom>
          ¿Listo para esculpir y tensar en la misma sesión?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Asegurá tu <strong>Cuponera 6 en Oferta de Apertura</strong> o reservá{" "}
          <strong>1 sesión</strong> para arrancar.
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          href={WHATSAPP_LINK}
          sx={{ fontWeight: "bold" }}
        >
          Escribinos ahora
        </Button>
      </Container>
      <Container component="footer" sx={{ py: 4 }}>
        <Typography variant="body2" align="center">
          Los resultados varían según composición corporal y hábitos. Este
          protocolo <strong>no reemplaza</strong> nutrición/entrenamiento ni
          indicación médica; <strong>los potencia</strong>.{" "}
          <strong>MSculpt (HIFEM)</strong> cuenta con publicaciones; la{" "}
          <strong>Radiofrecuencia en piel</strong> tiene base fisiológica y
          revisiones clínicas; el <strong>drenaje y la maderoterapia</strong> se
          usan como acompañamiento. Evaluación previa obligatoria. Si seguís con
          curiosidad, podés revisar los siguientes estudios:{" "}
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
