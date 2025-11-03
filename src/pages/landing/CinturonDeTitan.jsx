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
import { useTheme } from "@mui/material/styles";

const WHATSAPP_PHONE = "59893770785";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola Esteban, quiero agendar mi evaluación corporal. Me interesa el cinturón de Titán"
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

export default function CinturonTitan() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SEO
        title="Marcá tu abdomen en 90’ — Cinturón de Titán por Esteban Marmion (Montevideo Centro)"
        description="Marcá tu abdomen en 90’ sin cirugías. Soy Esteban Marmion en Montevideo Centro. Cinturón de Titán: MSculpt + Lipo Láser 635 nm + Maderoterapia + Pulido. Oferta de Primavera hasta 21/Dic/25. Pago en efectivo o transferencia. Escribime por WhatsApp."
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
            Cinturón de Titán
          </Typography>
          <Typography variant="h5" gutterBottom>
            Marcá tu abdomen en 90’ conmigo — Esteban Marmion
          </Typography>
          <Typography sx={{ mb: 1 }}>
            ¿Entrenás y comés bien pero esa grasa del abdomen no se va? Te
            entiendo. Con mi Cinturón de Titán empiezo a marcar tu abdomen sin
            que frenes tu laburo ni tu rutina.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Mi protocolo 4 en 1 combina MSculpt (HIFEM) + Lipo Láser 635 nm +
            Maderoterapia + Pulido drenante/modelador.
          </Typography>
          <Box
            component="ul"
            sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 3 }}
          >
            <Typography component="li">Marcás abdomen sin cirugías.</Typography>
            <Typography component="li">
              Menos contorno desde las primeras sesiones.
            </Typography>
            <Typography component="li">
              Sesiones cortas, cero reposo.
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
          Estoy en Montevideo Centro y te recibo personalmente.{" "}
          <strong>Nivel intermedio</strong>: ideal si ya venís cuidándote y
          querés bajar esa grasa rebelde del abdomen y los flancos. Sin agujas
          ni cirugías. Atiendo gente de Centro, Cordón, Parque Rodó y Pocitos.
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
      <Container component="section" sx={{ py: 2 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          ¿Por qué mi Cinturón de Titán funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            1. MSculpt: músculo + grasa al mismo tiempo
          </Typography>
          <Typography>
            Con HIFEM provoco hasta 25.000 contracciones en 30 minutos, algo
            imposible de lograr en el gimnasio. Ese estímulo construye músculo y
            a la vez ayuda a reducir grasa en la misma sesión.
          </Typography>
          <Typography>
            Respaldos publicados reportan promedios cercanos a 30% menos grasa y
            25% más músculo medidos con imágenes (MRI/US). Son referencias, no
            promesas individuales; te explico expectativas reales en tu
            evaluación.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            2. Lipo Láser: afino contorno y tenso la piel
          </Typography>
          <Typography>
            Uso una luz roja suave (≈635 nm) que fotoactiva el adipocito y abre
            poros transitorios; libera lípidos y achica volumen. Es contorneado,
            no para bajar kilos.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            3. Maderoterapia + Pulido (drenaje/modelador)
          </Typography>
          <Typography>
            Drenaje linfático manual para movilizar fluidos y maniobras
            modeladoras para trabajar la adiposidad localizada.
          </Typography>
          <Typography>
            Personalizo la presión y el ritmo para que salgas con un acabado más
            definido.
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
            Es simple y directo: combino lo que realmente mueve la aguja.
            MSculpt activa y define el músculo mientras reduce grasa; el Lipo
            Láser afina el contorno; el Pulido drena y marca el resultado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Box
          component="ul"
          sx={{ maxWidth: 800, mx: "auto", textAlign: "left", mb: 2 }}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            align="center"
            gutterBottom
          >
            ¿Es para vos?
          </Typography>
          <Typography align="left" sx={{ mb: 2 }}>
            Te va a servir si:
          </Typography>
          <Typography align="left" sx={{ mb: 2 }}>
            <li>
              Venís con dieta y entrenamiento y querés sacar esa grasa rebelde
              del abdomen y los flancos.
            </li>
            <li>
              Buscás definición visible sin frenar tu laburo ni tu rutina.
            </li>
            <li>
              Querés resultados acumulativos en pocas semanas (serie inicial
              corta).
            </li>
          </Typography>
          <Typography align="left">
            <strong>Contraindicaciones:</strong> embarazo/lactancia; implantes
            metálicos o electrónicos cercanos (por ejemplo marcapasos, ciertos
            DIU/cobre); problemas cardíacos; tumores activos; fiebre,
            infecciones locales, trastornos hemorrágicos; músculos lesionados.
            Antes de empezar te evalúo personalmente.
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
            <strong>MSculpt — 30'</strong> sobre abdomen y flancos (HIFEM). Vas
            a sentir contracciones potentes; no invasivo, sin reposo.
          </li>
          <li>
            <strong>Lipo Láser</strong> (láser frío 635 nm). Indoloro.
          </li>
          <li>
            <strong>Maderoterapia + Pulido</strong>: combino maderoterapia y
            masaje modelador según tu respuesta del día para bajar retención y
            mejorar el acabado.
          </li>
          <li>
            <strong>Duración total:</strong> 90 minutos aproximados.
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
            <strong>Diferencia vs. Cinturón de Orión:</strong> Titán suma
            MSculpt y juega en otra liga para abdomen: trabajamos músculo y
            grasa a la vez. Orión es un protocolo de entrada; con Titán vamos
            por definición real.
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
            dejando 1 día de por medio según tu caso. El cuerpo sigue mejorando
            semanas después de la última sesión.
          </li>
          <li>
            <strong>Objetivo realista:</strong> menos contorno abdominal + más
            definición. No es un tratamiento para bajar kilos.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 2 }}>
        <Typography align="center" sx={{ mb: 1 }}>
          <strong>Oferta de Primavera vigente hasta el 21/Dic/25</strong>
        </Typography>
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
                    $ 7.600
                  </Typography>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    $ 6.600
                  </Typography>
                  <Typography variant="body2">
                    ahorrás $ 5.400 vs 6 sueltas.
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Vigente hasta el 21/Dic/25
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
                  $ 9.200
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 6.800 vs 8 sueltas.
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
                  $ 11.900
                </Typography>
                <Typography variant="body2">
                  ahorrás $ 8.100 vs 10 sueltas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Mi recomendación:</strong> mejor relación precio/resultado,
          <strong> Cuponera 6</strong> en Oferta de Primavera. Te alcanza para
          una serie inicial sin gastar de más.
        </Typography>
        <Typography align="center" sx={{ mt: 1 }}>
          <strong>Opciones de pago:</strong> Efectivo y Transferencia.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 2, bgcolor: "grey.50" }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          gutterBottom
        >
          Así te acompaño
        </Typography>
        <Box
          component="ol"
          sx={{ maxWidth: 600, mx: "auto", textAlign: "left" }}
        >
          <li>
            <strong>Evaluación personalizada</strong>: objetivos, zona y
            contraindicaciones.
          </li>
          <li>
            <strong>MSculpt 30'</strong>: definición + grasa.
          </li>
          <li>
            <strong>Lipo Láser</strong>: contorno.
          </li>
          <li>
            <strong>Maderoterapia</strong> y Pulido: drenaje/modelador ajustado
            a tu respuesta del día.
          </li>
          <li>
            <strong>Plan de mantenimiento</strong> simple para sostener lo
            conseguido.
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
                Aproximadamente 90 minutos. Puede variar según tu respuesta ese
                día.
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
              <Typography>¿Cuándo veo cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                La mayoría nota más tono y menos contorno sesión a sesión. El
                pico se ve semanas después de completar la serie: el cuerpo
                sigue eliminando grasa y el músculo se adapta.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente el Lipo Láser?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Es un láser frío de baja intensidad (≈635 nm) que fotoactiva
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
                Para abdomen lo elijo porque combina músculo + grasa en una sola
                sesión, con respaldo de imágenes (MRI/US) y ensayo aleatorizado.
                No todas las tecnologías hacen las dos cosas a la vez.
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
                Embarazo/lactancia; marcapasos o implantes
                metálicos/electrónicos cercanos; problemas cardíacos; tumores
                activos; fiebre o infecciones; músculos lesionados. Te asesoro y
                evaluamos juntos antes de empezar.
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
                Titán: suma MSculpt y trabaja músculo + grasa en paralelo, con
                respaldo en estudios. Personalizo maderoterapia y Pulido según
                tu respuesta. <br /> Orión: protocolo de entrada.
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
          ¿Agendamos tu evaluación y empezamos a marcar abdomen?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Asegurá tu <strong>Cuponera 6</strong> (Oferta de Primavera hasta el
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
      <Container component="footer" sx={{ py: 2 }}>
        <Typography variant="body2" align="center">
          Los resultados dependen de tu composición corporal y tus hábitos. Este
          protocolo no reemplaza indicación médica, entrenamiento o nutrición;
          los potencia. MSculpt y Lipo Láser tienen publicaciones revisadas por
          pares sobre reducción de grasa y/o aumento muscular; la maderoterapia
          es un complemento. Siempre realizo evaluación previa. Si sos de leer
          estudios, te dejo algunos:{" "}
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
