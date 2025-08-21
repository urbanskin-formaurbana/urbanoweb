/* eslint-disable no-irregular-whitespace */
import SEO from '../../components/SEO.jsx'
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
} from '@mui/material'

const WHATSAPP_LINK = 'https://wa.me/59893770785'

export default function CinturonAcero() {
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Acero | Body Sculpt + Radiofrecuencia (Montevideo)"
        description="Definí y tensá abdomen en 60’: Body Sculpt (HIFEM + RF) + RF de piel + Maderoterapia + Drenaje. Sesión $1.900. Cuponera 6 a $6.200 (Oferta de Apertura). Reservá por WhatsApp."
      />
        <Box component="header" sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', py: { xs: 6, md: 8 } }}>
          <Container>
            <Box
              component="img"
              src="/landings/cinturon-acero/placeholder-hero.svg"
              alt="Cinturón de Acero"
              sx={{ width: '100%', maxWidth: 400, height: 'auto', mx: 'auto', mb: 3, borderRadius: 2 }}
            />
            <Typography variant="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Cinturón de Acero
            </Typography>
          <Typography variant="h5" gutterBottom>
            Llevá tu abdomen a su <strong>máximo potencial</strong>.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            <strong>Protocolo 4‑en‑1</strong>: <strong>30’ Body Sculpt (HIFEM® + RF)</strong> + <strong>Radiofrecuencia focal de piel</strong> + <strong>Maderoterapia</strong> + <strong>Drenaje linfático</strong>. En una sola visita: <strong>más tono, menos contorno y piel más firme</strong>, sin downtime. ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://www.wolterskluwer.com/en/news/radiofrequency-heating-plus-electromagnetic-stimulation-reduces-belly-fat-and-increases-muscle?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              Wolters Kluwer
            </Link>
            )
          </Typography>
          <Button variant="contained" color="success" size="large" href={WHATSAPP_LINK} sx={{ fontWeight: 'bold' }}>
            Escribinos por WhatsApp
          </Button>
        </Container>
      </Box>
        <Container sx={{ py: 4 }}>
          <Typography align="center" sx={{ fontStyle: 'italic' }}>
            En <strong>Montevideo</strong>. <strong>Nivel avanzado</strong> (para quienes ya vienen cuidándose y quieren <strong>seguir tonificando músculo y piel</strong>). <strong>No invasivo. Sin agujas. Agenda activa.</strong>
          </Typography>
          <Box
            component="img"
            src="/landings/cinturon-acero/placeholder-extra.svg"
            alt="Resultados del Cinturón de Acero"
            sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 2 }}
          />
        </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Por qué funciona (lo esencial y sin humo)?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            1) Body Sculpt: músculo <strong>y</strong> grasa, a la vez
          </Typography>
          <Typography>
            Combina <strong>HIFEM®</strong> (contracciones supramáximas que ningún entrenamiento reproduce) con <strong>radiofrecuencia sincronizada</strong> que calienta el tejido de forma segura. La <strong>sinergia</strong> logra <strong>aumento de masa/espesor muscular</strong> y <strong>reducción de grasa subcutánea</strong> en <strong>30 minutos</strong>. ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Respaldo clínico</strong>: estudios con <strong>MRI/ultrasonido</strong> y un <strong>ensayo aleatorizado controlado “sham”</strong> reportan <strong>disminución de grasa</strong> y <strong>engrosamiento muscular</strong> tras una serie corta; también se han publicado datos positivos en <strong>abdomen lateral</strong>. <em>(Promedios poblacionales; no promesas individuales.)</em> ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://medicalxpress.com/news/2022-04-radiofrequency-electromagnetic-belly-fat-muscle.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Medical Xpress
            </Link>
            ,{' '}
            <Link href="https://351face.com/wp-content/uploads/2020/11/Emsculpt-NEO_CLIN_MRI-study_Jacob_summary_ENUS100.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Advanced Cosmetic Surgery
            </Link>
            ,{' '}
            <Link href="https://academic.oup.com/asj/article/44/8/850/7626230?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Oxford Academic
            </Link>
            )
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            2) Radiofrecuencia (RF) focal: <strong>tensión de la piel</strong> que se nota
          </Typography>
          <Typography>
            La RF <strong>calienta el colágeno dérmico</strong> hasta el rango terapéutico (<strong>~40–42 °C en superficie / ≈50 °C en tejidos blandos</strong>), lo que provoca <strong>contracción inmediata de fibras</strong> y <strong>neocolagénesis</strong> en semanas. Resultado: <strong>mejor firmeza y textura</strong> en la cubierta cutánea del abdomen. ({' '}
            <Link href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              advancesincosmeticsurgery.com
            </Link>
            ,{' '}
            <Link href="https://www.oaepublish.com/articles/2347-9264.2021.60?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              OAE Publish
            </Link>
            ,{' '}
            <Link href="https://www.thieme-connect.com/products/ejournals/pdf/10.1055/s-0033-1363756.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Thieme
            </Link>
            )
          </Typography>
          <Typography>
            Es el <strong>complemento ideal</strong> a Body Sculpt: el NEO actúa <strong>en músculo y grasa</strong>; la RF focal acá se dirige <strong>a la piel</strong> para un <strong>acabado más terso</strong>. ({' '}
            <Link href="https://www.oaepublish.com/articles/2347-9264.2021.60?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              OAE Publish
            </Link>
            )
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            3) Pulido manual: madero + drenaje (con transparencia)
          </Typography>
          <Typography>
            <strong>Drenaje linfático manual</strong>: técnica suave con uso establecido en <strong>linfedema/edemas</strong>; ayuda a <strong>mover fluidos</strong> y a sentirse menos hinchado como <strong>coadyuvante</strong> estético. ({' '}
            <Link href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Cleveland Clinic
            </Link>
            ,{' '}
            <Link href="https://www.nhs.uk/conditions/lymphoedema/treatment/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              nhs.uk
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Maderoterapia/modelador</strong>: popular para <strong>moldear</strong>; la <strong>evidencia científica es limitada</strong>, por eso la usamos como <strong>apoyo</strong> post‑energía, ajustando intensidad a tu caso. ({' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            )
          </Typography>
        </Stack>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Es para mí?
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Elegí <strong>Cinturón de Acero</strong> si:
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>Querés <strong>seguir definiendo</strong> y <strong>cerrar la grasa rebelde</strong> del abdomen sin parar tu rutina.</li>
          <li>Buscás <strong>tono real</strong> (músculo) + <strong>mejor piel</strong> (tensión) <strong>en la misma sesión</strong>.</li>
          <li>Preferís <strong>resultados acumulativos</strong> en pocas semanas, con protocolo claro y medible.</li>
        </Box>
        <Typography align="center">
          <strong>No recomendado</strong> si estás embarazada/lactando o tenés <strong>marcapasos, implantes metálicos/electrónicos</strong>, tumores activos, fiebre/infección local o <strong>músculos lesionados</strong>. Evaluamos tu caso antes de iniciar. (<em>Resumen de contraindicaciones del fabricante/guías.</em> ({' '}
          <Link href="https://ptacts.uspto.gov/ptacts/public-informations/petitions/1547819/download-documents?artifactId=knpgWL0skoQUU64yKWvHzhQ4yOnmHT-Gk5P4siWLAhCGBUExhgE74Zs&utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            PTACTS
          </Link>
          ))
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué incluye cada sesión (60–70 min)
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>Body Sculpt — 30’ (HIFEM + RF sincronizada)</strong> Sensación: <strong>contracciones intensas</strong> con <strong>calor tolerable</strong>; no invasivo, sin downtime. ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://www.folkplasticsurgery.com/procedures/emsculpt-neo?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Folk Plastic Surgery
            </Link>
            )
          </li>
          <li>
            <strong>Radiofrecuencia focal de piel — 15–20’</strong> Objetivo: <strong>firmeza</strong>. Trabajamos en el <strong>colágeno dérmico</strong> (tensión inmediata + remodelación en semanas). ({' '}
            <Link href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              advancesincosmeticsurgery.com
            </Link>
            ,{' '}
            <Link href="https://www.oaepublish.com/articles/2347-9264.2021.60?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              OAE Publish
            </Link>
            )
          </li>
          <li>
            <strong>Pulido manual — 10–15’</strong> <strong>Drenaje linfático</strong> (descongestión) + <strong>modelador/maderoterapia</strong> (contorno), <strong>dosificado</strong> según tu respuesta del día. ({' '}
            <Link href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Cleveland Clinic
            </Link>
            ,{' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            )
          </li>
        </Box>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            <strong>Diferencia clave vs. paquetes “entry‑level”:</strong> acá sumás <strong>tonificación muscular avanzada</strong> (NEO) <strong>más</strong> una <strong>pasada específica de RF para piel</strong>; el pulido se ajusta <strong>a medida</strong> para rematar el acabado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Resultados y ritmo recomendado
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>
            <strong>Serie inicial típica:</strong> <strong>4 sesiones</strong> separadas <strong>5–10 días</strong>; la definición y el contorno siguen <strong>mejorando hasta ~3 meses</strong> después de terminar la serie. Luego, <strong>mantenimiento</strong> según objetivo. ({' '}
            <Link href="https://wendyreganmd.com/wp-content/uploads/2024/10/Emsculpt-Neo-Pre-and-Post-Care-Instructions.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Harbour Direct Primary Care Inc.
            </Link>
            ,{' '}
            <Link href="https://norcaldermatology.com/procedure/emsculpt-neo/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Dermatology Center NorCal
            </Link>
            )
          </li>
          <li>
            <strong>Expectativa realista:</strong> <strong>menos contorno</strong> + <strong>más tono/definición</strong>; <strong>no</strong> es un tratamiento de “kilos”. ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            )
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Precios y cuponeras (UYU)
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Sesión
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  1.900
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: 'center', border: 2, borderColor: 'success.main', position: 'relative', height: '100%' }}>
              <CardContent>
                <Chip label="Oferta de Apertura" color="success" size="small" sx={{ position: 'absolute', top: 16, right: 16 }} />
                <Typography variant="h5" gutterBottom>
                  Cuponera 6
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  6.200
                </Typography>
                <Typography variant="body2">≈1.033 por sesión; ahorrás 5.200 vs 6 sueltas — 45,6%.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  8.200
                </Typography>
                <Typography variant="body2">≈1.025 por sesión; ahorrás 7.000 vs 8 sueltas — 46,1%.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  10.200
                </Typography>
                <Typography variant="body2">≈1.020 por sesión; ahorrás 8.800 vs 10 sueltas — 46,3%.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación ejecutiva:</strong>
          <br />
          <strong>Mejor precio por sesión:</strong> <strong>Cuponera 10</strong>.
          <br />
          <strong>Entrada inteligente + descuento agresivo hoy:</strong> <strong>Cuponera 6 — Oferta de Apertura</strong> (cerrás la serie inicial y dejás 2 sesiones para consolidar, sin sobrepagar).
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Paso a paso
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>Evaluación rápida</strong> (objetivos, antecedentes, contraindicaciones). ({' '}
            <Link href="https://ptacts.uspto.gov/ptacts/public-informations/petitions/1547819/download-documents?artifactId=knpgWL0skoQUU64yKWvHzhQ4yOnmHT-Gk5P4siWLAhCGBUExhgE74Zs&utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              PTACTS
            </Link>
            )
          </li>
          <li>
            <strong>Body Sculpt 30’</strong> (músculo + grasa). ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            )
          </li>
          <li>
            <strong>RF focal 15–20’</strong> (piel). ({' '}
            <Link href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              advancesincosmeticsurgery.com
            </Link>
            )
          </li>
          <li>
            <strong>Pulido</strong> (drenaje/modelador). ({' '}
            <Link href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Cleveland Clinic
            </Link>
            )
          </li>
          <li>
            <strong>Tips post:</strong> hidratación + mini‑caminata el mismo día.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Preguntas frecuentes
        </Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Duele?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Sentís <strong>contracciones fuertes</strong> y <strong>calor tolerable</strong>; salís y seguís con tu día. ({' '}
                <Link href="https://www.folkplasticsurgery.com/procedures/emsculpt-neo?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Folk Plastic Surgery
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿En cuánto tiempo se ven cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando <strong>más tono</strong> y <strong>menos contorno</strong> <strong>sesión a sesión</strong>; el pico suele verse <strong>~3 meses</strong> después de completar la serie. ({' '}
                <Link href="https://norcaldermatology.com/procedure/emsculpt-neo/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Dermatology Center NorCal
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente la RF en la piel?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Genera <strong>calentamiento controlado</strong> que <strong>contrae</strong> colágeno y <strong>estimula</strong> nueva producción (neocolagénesis) → <strong>mejor firmeza/elasticidad</strong>. ({' '}
                <Link href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  advancesincosmeticsurgery.com
                </Link>
                ,{' '}
                <Link href="https://www.oaepublish.com/articles/2347-9264.2021.60?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  OAE Publish
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Para qué suman la maderoterapia y el drenaje?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                El <strong>drenaje</strong> ayuda a <strong>mover fluidos</strong> (útil como coadyuvante); la <strong>maderoterapia</strong> se usa para <strong>modelar</strong>, pero su <strong>evidencia es limitada</strong> — la aplicamos <strong>con criterio</strong>. ({' '}
                <Link href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Cleveland Clinic
                </Link>
                ,{' '}
                <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Verywell Health
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Quiénes no deberían hacerlo?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo/lactancia; <strong>marcapasos</strong> u otros <strong>implantes metálicos/electrónicos</strong>; tumores activos; fiebre/infecciones locales; <strong>músculos lesionados</strong>. Siempre evaluamos tu caso. ({' '}
                <Link href="https://ptacts.uspto.gov/ptacts/public-informations/petitions/1547819/download-documents?artifactId=knpgWL0skoQUU64yKWvHzhQ4yOnmHT-Gk5P4siWLAhCGBUExhgE74Zs&utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  PTACTS
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 6, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
        <Typography variant="h3" gutterBottom>
          ¿Listo para esculpir y tensar en la misma sesión?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Asegurá tu <strong>Cuponera 6 — Oferta de Apertura</strong> o reservá <strong>1 sesión</strong> para arrancar.
        </Typography>
        <Button variant="contained" color="success" size="large" href={WHATSAPP_LINK} sx={{ fontWeight: 'bold' }}>
          Escribinos ahora
        </Button>
      </Container>
      <Container component="footer" sx={{ py: 4 }}>
        <Typography variant="body2" align="center">
          Los resultados varían según composición corporal y hábitos. Este protocolo <strong>no reemplaza</strong> nutrición/entrenamiento ni indicación médica; <strong>los potencia</strong>. <strong>Body Sculpt (HIFEM+RF)</strong> cuenta con publicaciones (incluido <strong>ensayo aleatorizado</strong>); la <strong>RF en piel</strong> tiene base fisiológica y revisiones clínicas; el <strong>drenaje</strong> se usa como coadyuvante; la <strong>maderoterapia</strong> es complementaria con evidencia limitada. Evaluación previa obligatoria. ({' '}
          <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Europe PMC
          </Link>
          ,{' '}
          <Link href="https://351face.com/wp-content/uploads/2020/11/Emsculpt-NEO_CLIN_MRI-study_Jacob_summary_ENUS100.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Advanced Cosmetic Surgery
          </Link>
          ,{' '}
          <Link href="https://www.advancesincosmeticsurgery.com/article/S2542-4327%2821%2900016-3/fulltext?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            advancesincosmeticsurgery.com
          </Link>
          ,{' '}
          <Link href="https://www.oaepublish.com/articles/2347-9264.2021.60?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            OAE Publish
          </Link>
          ,{' '}
          <Link href="https://my.clevelandclinic.org/health/treatments/21768-lymphatic-drainage-massage?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Cleveland Clinic
          </Link>
          ,{' '}
          <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Verywell Health
          </Link>
          )
        </Typography>
      </Container>
    </>
  )
}

