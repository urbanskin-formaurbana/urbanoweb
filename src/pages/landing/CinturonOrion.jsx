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
          <Box sx={{ width: 120, height: 120, mx: 'auto', mb: 3, bgcolor: 'grey.200', borderRadius: 2 }} />
          <Typography variant="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
            Cinturón de Orión
          </Typography>
          <Typography variant="h5" gutterBottom>
            Cintura más definida, sin cirugía.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            <strong>Protocolo 3‑en‑1</strong> para reducir contorno abdominal y tensar la piel: <strong>Lipo Láser (635 nm) + Maderoterapia + Drenaje Linfático</strong>. Sesiones cómodas, sin downtime. Resultados que te motivan a mantener, no a empezar de cero. ({' '}
            <Link href="https://europepmc.org/article/PMC/3769994?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              JCAD
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
          En Montevideo. No invasivo. Sin agujas. Piel intacta. Apto como <strong>nivel inicial</strong> para personas poco activas físicamente.
        </Typography>
      </Container>

      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Por qué el Cinturón de Orión funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography>
            <strong>Desbloquea la grasa “resistente”</strong>: el Lipo Láser de baja intensidad (luz roja ≈635 nm) fotoactiva los adipocitos y <strong>abre poros transitorios</strong> en su membrana; así liberan triglicéridos y <strong>disminuye su volumen</strong> (no destruye la célula). ({' '}
            <Link href="https://europepmc.org/article/PMC/3769994?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              MDedge
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Moviliza y moldea</strong>: la <strong>Maderoterapia</strong> estimula la microcirculación y el tejido subcutáneo para mejorar textura y contorno. La evidencia formal es limitada, pero muchos pacientes refieren piel más uniforme cuando se combina con otros métodos. ({' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Drena lo liberado</strong>: el <strong>Drenaje Linfático Manual</strong> favorece el movimiento de fluidos y ayuda a bajar la hinchazón; es una técnica reconocida en protocolos de edema/linfedema y se usa como coadyuvante estético. ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            )
          </Typography>
        </Stack>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            <strong>Lo que dice la ciencia:</strong> En estudios controlados, la fotobiomodulación a 635–680 nm mostró <strong>reducciones de perímetro</strong> tras <strong>6 sesiones</strong> (2 semanas), manteniendo <strong>el mismo peso</strong>; es decir, <strong>contorneado</strong>, no “bajar kilos”. ({' '}
            <Link href="https://europepmc.org/article/MED/20014253?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
              JCAD
            </Link>
            )
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
          <li>Tenés agenda apretada y necesitás <strong>cero downtime</strong>.</li>
        </Box>
        <Typography align="center">
          <strong>No lo recomendamos</strong> si estás embarazada o en lactancia, usás marcapasos, tenés cáncer activo o una condición médica que contraindique fototerapia o masajes profundos. Ante dudas, consultá a tu médico. (Criterios similares se usan en los ensayos clínicos de Lipo Láser no invasivo). ({' '}
          <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
            JCAD
          </Link>
          )
        </Typography>
      </Container>

      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué incluye cada sesión
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>30 minutos de Lipo Láser</strong> (láser frío de baja intensidad, ≈635 nm) sobre abdomen. <strong>Sensación:</strong> indolora, sin calor significativo. ({' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
              JCAD
            </Link>
            )
          </li>
          <li>
            <strong>Maderoterapia</strong> específica para abdomen: maniobras para modelar, activar circulación y mejorar textura. <em>Evidencia clínica formal aún en desarrollo; se usa como coadyuvante.</em> ({' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            )
          </li>
          <li>
            <strong>Masaje de drenaje linfático</strong> para movilizar fluidos y favorecer la eliminación. ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            )
          </li>
        </Box>
      </Container>

      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Beneficios que vas a notar
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>
            <strong>Menos contorno</strong> en la zona tratada (cintura/abdomen) con progreso <strong>sesión a sesión</strong>. ({' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
              JCAD
            </Link>
            )
          </li>
          <li>
            <strong>Piel más firme</strong> y uniforme al combinar energía + técnica manual. ({' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            )
          </li>
          <li>
            <strong>Cero downtime</strong>: salís y seguís con tu día. ({' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
              JCAD
            </Link>
            )
          </li>
        </Box>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            En un <strong>estudio doble ciego</strong> en brazos, el grupo con 635 nm redujo <strong>3,7 cm</strong> de circunferencia combinada tras 6 sesiones (sin cambios en el IMC). Resultado <strong>progresivo y acumulativo</strong>. ({' '}
            <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
              JCAD
            </Link>
            )
          </Typography>
        </Box>
      </Container>

      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Precios y cuponeras (UYU)
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Sesión
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  1.500
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', border: 2, borderColor: 'success.main', position: 'relative', height: '100%' }}>
              <CardContent>
                <Chip label="Oferta de Apertura" color="success" size="small" sx={{ position: 'absolute', top: 16, right: 16 }} />
                <Typography variant="h5" gutterBottom>
                  Cuponera 6
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  5.500
                </Typography>
                <Typography variant="body2">≈917 por sesión; ahorrás 3.500 vs 6 sueltas — 39%.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 8
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  7.900
                </Typography>
                <Typography variant="body2">≈988 por sesión; ahorrás 4.100 vs 8 sueltas — 34%.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cuponera 10
                </Typography>
                <Typography variant="h4" color="success.main" gutterBottom>
                  9.800
                </Typography>
                <Typography variant="body2">980 por sesión; ahorrás 5.200 vs 10 sueltas — 35%.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación directa:</strong> si querés <strong>máxima relación precio/sesión hoy</strong>, la <strong>Cuponera 6</strong> está imbatible por la <strong>Oferta de Apertura</strong>. Si tu objetivo es <strong>acompañar varias semanas</strong> y bloquear precio, elegí <strong>8 o 10</strong>.
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
            <strong>Lipo Láser 30’</strong> en abdomen. ({' '}
            <Link href="https://europepmc.org/article/PMC/3769994?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            )
          </li>
          <li>
            <strong>Maderoterapia</strong> para moldear.
          </li>
          <li>
            <strong>Drenaje linfático</strong> para movilizar. ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            )
          </li>
          <li>
            <strong>Tips post</strong> (agua, breve caminata el mismo día).
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
              <Typography>No. Es <strong>indoloro</strong> y sin downtime. ({' '}
                <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
                  JCAD
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo resultados?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Muchas personas notan <strong>cambios en contorno</strong> desde las primeras sesiones; los estudios con 635 nm miden resultados <strong>a las 2 semanas</strong> (6 sesiones). Tu caso puede variar. ({' '}
                <Link href="https://europepmc.org/article/MED/20014253?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Europe PMC
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Sirve para bajar de peso?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                No es un tratamiento de “kilos”. Es <strong>contorneado</strong> (reducción de perímetro) y <strong>mejor textura</strong>; podés mantener y potenciar con hábitos básicos. ({' '}
                <Link href="https://europepmc.org/article/MED/20014253?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Europe PMC
                </Link>
                ,{' '}
                <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
                  JCAD
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Qué hace exactamente el Lipo Láser?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Emite <strong>luz roja de baja intensidad</strong> (≈635 nm) que <strong>fotoactiva</strong> al adipocito, genera <strong>poros transitorios</strong> en la membrana y permite <strong>liberar lípidos</strong>, reduciendo su volumen. ({' '}
                <Link href="https://europepmc.org/article/PMC/3769994?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Europe PMC
                </Link>
                ,{' '}
                <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  MDedge
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Para qué suman la Maderoterapia y el Drenaje?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                La primera <strong>modela y estimula</strong> la microcirculación; el segundo <strong>favorece el movimiento de fluidos</strong> y puede ayudar a bajar la hinchazón. (La evidencia de Maderoterapia es <strong>limitada</strong>; se usa como <strong>coadyuvante</strong>.) ({' '}
                <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Verywell Health
                </Link>
                ,{' '}
                <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  SpringerLink
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Hay contraindicaciones?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Embarazo, lactancia, marcapasos, cáncer activo u otras condiciones que desaconsejen fototerapia o masajes profundos. Si tenés dudas, <strong>consultá a tu médico</strong>. (Criterios alineados a ensayos clínicos). ({' '}
                <Link href="https://jcadonline.com/effect-of-635nm-low-level-laser-therapy-on-upper-arm-circumference-reduction-a-double-blind-randomized-sham-controlled-trial/" target="_blank" rel="noopener noreferrer" underline="always">
                  JCAD
                </Link>
                )
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
  )
}

