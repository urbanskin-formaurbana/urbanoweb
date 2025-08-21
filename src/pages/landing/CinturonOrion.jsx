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

export default function CinturonOrion() {
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Orión | Lipo Láser 635 nm + Maderoterapia + Drenaje (Montevideo)"
        description="Reducí el contorno abdominal sin cirugía. Protocolo 3‑en‑1: Lipo Láser 635 nm + Maderoterapia + Drenaje Linfático. Sesión $1.500. Cuponera 6 a $5.500 (Oferta de Apertura)."
      />
        <Box component="header" sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', py: { xs: 6, md: 8 } }}>
          <Container>
            <Box
              component="img"
              src="/landings/cinturon-orion/placeholder-hero.svg"
              alt="Cinturón de Orión"
              sx={{ width: '100%', maxWidth: 400, height: 'auto', mx: 'auto', mb: 3, borderRadius: 2 }}
            />
            <Typography variant="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Cinturón de Orión
            </Typography>
          <Typography variant="h5" gutterBottom>
            Cintura más definida, sin cirugía.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            <strong>Protocolo 3‑en‑1</strong> para reducir contorno abdominal y tensar la piel: <strong>Lipo Láser (635 nm) + Maderoterapia + Radiofrecuencia</strong>. Sesiones cómodas, sin necesidad de reposo, ni afectar tu rutina en lo absoluto. Resultados que te motivan cuando te veas al espejo. Tu cambio empieza hoy.
          </Typography>
          <Button variant="contained" color="success" size="large" href={WHATSAPP_LINK} sx={{ fontWeight: 'bold' }}>
            Escribinos por WhatsApp
          </Button>
        </Container>
      </Box>
        <Container sx={{ py: 4 }}>
          <Typography align="center" sx={{ fontStyle: 'italic' }}>
            En Montevideo. No invasivo. Sin agujas. Piel intacta. Apto como <strong>nivel inicial</strong> para personas poco activas físicamente.
          </Typography>
          <Box
            component="img"
            src="/landings/cinturon-orion/placeholder-extra.svg"
            alt="Resultados del Cinturón de Orión"
            sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 2 }}
          />
        </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Por qué el Cinturón de Orión funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography>
            <strong>Desbloquea la grasa “resistente”</strong>: El lipo láser usa una luz roja suave para "despertar" las células de grasa. Esto hace que abran pequeños poros por un momento y liberen la grasa que tienen adentro. Así, las células se achican, <strong>pero no se destruyen.</strong>
          </Typography>
          <Typography>
            <strong>Moviliza y moldea</strong>: la <strong>Maderoterapia</strong> estimula la microcirculación y el tejido subcutáneo para mejorar textura y contorno. La evidencia formal es limitada, pero muchos pacientes refieren piel más uniforme cuando se combina con otros métodos.
          </Typography>
          <Typography>
            <strong>Estimula el colageno de tu piel</strong>: la <strong>Radiofrecuencia</strong> reafirma y rejuvenece tu piel, estimulando el colágeno y la elastina. Combate la flacidez y mejora la textura.
          </Typography>
        </Stack>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            Según estudios, la luz roja del lipo laser (entre 635 y 680 nm) ayuda a reducir centímetros después de 6 sesiones en 2 semanas, sin bajar de peso. Es para modelar el cuerpo, no para adelgazar.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Es para mí?
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Este protocolo está <strong>diseñado para vos</strong> si:
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>Luchás con el sobrepeso y <strong>no ves cambios</strong> en el abdomen pese a dieta/ejercicio.</li>
          <li>Querés <strong>algo cómodo y progresivo</strong>, sin quirófano ni agujas.</li>
          <li>Buscás un <strong>primer impulso visible</strong> que te anime a <strong>mantener</strong> (no a empezar de cero).</li>
          <li>Tenés agenda apretada y <strong>no podés darte el lujo de parar</strong>.</li>
        </Box>
        <Typography align="center">
          <strong>No lo recomendamos</strong> si estás embarazada o en lactancia, usás marcapasos, tenés cáncer activo o una condición médica que contraindique fototerapia o masajes profundos. Ante dudas, consultá a tu médico.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué incluye cada sesión
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>Lipo Láser</strong> sobre abdomen. <strong>Sensación:</strong> indolora, sin calor significativo.
          </li>
          <li>
            <strong>Maderoterapia</strong> específica para abdomen: maniobras para modelar, activar circulación y mejorar textura.
          </li>
          <li>
            <strong>Radiofrecuencia</strong> para favorecer la formación de nuevo colágeno. El drenaje linfático. La circulación de la piel y el tejido subcutáneo.
          </li>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Beneficios que vas a notar
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>
            <strong>Menos contorno</strong> en la zona tratada (cintura/abdomen) con progreso <strong>sesión a sesión</strong>.
          </li>
          <li>
            <strong>Piel más firme</strong> y uniforme al combinar energía + técnica manual.
          </li>
          <li>
            <strong>Cero reposo</strong>: salís y seguís con tu rutina.
          </li>
        </Box>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            En un <strong>estudio donde ni los pacientes ni los médicos saben quién está recibiendo el tratamiento real y quién no</strong>, el grupo que recibió tratamiento con Lipo Laser en brazos redujo <strong>3,7 cm</strong> de circunferencia combinada tras 6 sesiones (sin cambios en el IMC). Resultado <strong>progresivo y acumulativo</strong>.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Precios y cuponeras
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
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
              md: 3
            }}>
            <Card sx={{ textAlign: 'center', border: 2, borderColor: 'success.main', position: 'relative', height: '100%' }}>
              <CardContent>
                <Chip label="Oferta de Apertura" color="success" size="small" sx={{ position: 'absolute', top: 16, right: 16 }} />
                <Typography variant="h5" gutterBottom>
                  Cuponera 6
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $ 6.200
                </Typography>
                <Typography variant="body2">ahorrás 2.800 vs 6 sueltas.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  8.800
                </Typography>
                <Typography variant="body2">ahorrás 3.200 vs 8 sueltas.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  10.500
                </Typography>
                <Typography variant="body2">ahorrás 4.500 vs 10 sueltas.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación directa:</strong> si querés <strong>máxima relación precio/sesión</strong>, la <strong>Cuponera 6</strong> está imbatible por la <strong>Oferta de Apertura</strong>. Si tu objetivo es <strong>acompañar varias semanas</strong> y bloquear precio, elegí <strong>8 o 10</strong>.
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Cómo es el paso a paso
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
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
            <strong>Plan de mantenimiento</strong> sencillo para sostener resultados.
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
              <Typography>No. Es <strong>indoloro</strong> y no requiere de reposo.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo resultados?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Muchas personas notan <strong>cambios en contorno</strong> desde las primeras sesiones; los estudios con Lipo Laser miden resultados <strong>a las 2 semanas</strong> (6 sesiones). Tu caso puede variar.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Sirve para bajar de peso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                No es un tratamiento de “kilos”. Es <strong>contorneado</strong> (reducción de perímetro) y <strong>mejor textura</strong>; podés mantener y potenciar con hábitos básicos.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente el Lipo Láser?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Emite <strong>luz roja de baja intensidad</strong> (≈635 nm) que <strong>fotoactiva</strong> al adipocito, genera <strong>poros transitorios</strong> en la membrana y permite <strong>liberar lípidos</strong>, reduciendo su volumen.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Para qué suman la Maderoterapia y la Radiofrecuencia?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                La primera <strong>modela y estimula</strong> la microcirculación; el segundo <strong>favorece la producción de colágeno y elastina</strong>, tensando la piel.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Hay contraindicaciones?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo, lactancia, marcapasos, problemas cardíacos, cáncer activo u otras condiciones que desaconsejen fototerapia o masajes profundos. Si tenés dudas, <strong>consultá a tu médico</strong>. (Criterios alineados a ensayos clínicos).
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 6, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
        <Typography variant="h3" gutterBottom>
          ¿Listo para empezar?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Reservá tu <strong>sesión</strong> o asegurá tu <strong>Cuponera 6 — Oferta de Apertura</strong>.
        </Typography>
        <Button variant="contained" color="success" size="large" href={WHATSAPP_LINK} sx={{ fontWeight: 'bold' }}>
          Escribinos ahora
        </Button>
      </Container>
      <Container component="footer" sx={{ py: 4 }}>
        <Typography variant="body2" align="center">
          Los resultados individuales varían. Este protocolo <strong>no reemplaza</strong> indicaciones médicas, dieta o ejercicio; <strong>los potencia</strong>. Estudio tras estudio indica <strong>seguridad y confort</strong> en dispositivos 635–680 nm cuando se aplican correctamente. ({' '}
          <Link href="https://europepmc.org/article/MED/20014253?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Europe PMC
          </Link>
          ,{' '}
          <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
            JCAD
          </Link>
          )
        </Typography>
      </Container>
    </>
  );
}

