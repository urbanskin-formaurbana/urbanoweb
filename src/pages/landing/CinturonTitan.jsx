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

export default function CinturonTitan() {
  return (
    <>
      <SEO
        title="FORMA Urbana — Cinturón de Titán | EMSCULPT NEO + Lipo Láser (Montevideo)"
        description="Definí y reducí abdomen en la misma sesión: EMSCULPT NEO (HIFEM + RF) + Lipo Láser 635 nm + Maderoterapia + Pulido. Sesión $2.000. Cuponera 6 a $6.600 (Oferta de Apertura). Reservá por WhatsApp."
      />
        <Box component="header" sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', py: { xs: 6, md: 8 } }}>
          <Container>
            <Box
              component="img"
              src="/landings/cinturon-titan/placeholder-hero.svg"
              alt="Cinturón de Titán"
              sx={{ width: '100%', maxWidth: 400, height: 'auto', mx: 'auto', mb: 3, borderRadius: 2 }}
            />
            <Typography variant="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Cinturón de Titán
            </Typography>
          <Typography variant="h5" gutterBottom>
            Reduce <strong>y</strong> tonifica en la misma sesión.
          </Typography>
          <Typography sx={{ mb: 4 }}>
            <strong>Protocolo 4‑en‑1</strong>: <strong>30’ EMSCULPT NEO (HIFEM + RF) + 30’ Lipo Láser 635 nm + Maderoterapia + Pulido (drenaje/modelador)</strong>. No invasivo, sin downtime, pensado para <strong>marcar abdomen</strong> y <strong>bajar contorno</strong> de forma eficiente. ({' '}
            <Link href="https://btlaesthetics.com/en/for-providers/emsculpt-neo-providers?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              BTL Aesthetics
            </Link>
            ,{' '}
            <Link href="https://europepmc.org/article/MED/34001694?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" color="inherit" underline="always">
              MDedge
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
            En <strong>Montevideo</strong>. <strong>Nivel intermedio</strong> (ideal para quienes ya vienen cuidándose y quieren <strong>rematar la grasa rebelde</strong> del abdomen). <strong>Sin agujas, sin quirófano.</strong>
          </Typography>
          <Box
            component="img"
            src="/landings/cinturon-titan/placeholder-extra.svg"
            alt="Resultados del Cinturón de Titán"
            sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 2 }}
          />
        </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Por qué el Cinturón de Titán funciona?
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            1) EMSCULPT NEO: músculo + grasa, a la vez
          </Typography>
          <Typography>
            Tecnología que <strong>combina simultáneamente</strong> <strong>HIFEM®</strong> (contracciones supramáximas) con <strong>radiofrecuencia (RF)</strong> que calienta tejido subcutáneo y músculo. El resultado es <strong>sinergia</strong>: <strong>construcción muscular</strong> + <strong>reducción de grasa</strong> en una sesión de <strong>30 minutos</strong>. ({' '}
            <Link href="https://btlaesthetics.com/en/for-providers/emsculpt-neo-providers?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              BTL Aesthetics
            </Link>
            ,{' '}
            <Link href="https://arvivaesthetics.com/wp-content/uploads/2021/01/Emsculpt_Neo_DOC_Product-Fact-Sheet_ENUS100.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Arviv Medical Aesthetics
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Evidencia clínica</strong>: estudios multicéntricos y un <strong>ensayo aleatorizado con grupo “sham”</strong> muestran <strong>reducción de grasa</strong> subcutánea y <strong>aumento del grosor muscular</strong> con el protocolo NEO. Reportes promedian <strong>≈30% menos grasa</strong> y <strong>≈25% más músculo</strong>, medidos con <strong>MRI/US</strong> (promedios, no promesas individuales). ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            ,{' '}
            <Link href="https://cdn-links.lww.com/permalink/prs/d/prs_149_5_2022_04_27_editorialoffice_may-2022-toc_sdc1.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              LWW
            </Link>
            )
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            2) Lipo Láser 635 nm: contorno y piel más tensa
          </Typography>
          <Typography>
            <strong>Láser frío de baja intensidad (≈635 nm)</strong> que <strong>fotoactiva adipocitos</strong> y abre <strong>poros transitorios</strong> en su membrana; así <strong>liberan lípidos</strong> y <strong>disminuyen de volumen</strong>. Es contorneado, no “bajar kilos”. ({' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              MDedge
            </Link>
            ,{' '}
            <Link href="https://onlinelibrary.wiley.com/doi/pdf/10.1002/lsm.22153?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Wiley Online Library
            </Link>
            )
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            3) Maderoterapia + Pulido (drenaje/modelador)
          </Typography>
          <Typography>
            <strong>Drenaje linfático manual</strong>: técnica reconocida para <strong>movilizar fluidos</strong>; se usa como coadyuvante en protocolos estéticos y de edema. ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            ,{' '}
            <Link href="https://academic.oup.com/asjopenforum/article/doi/10.1093/asjof/ojad023/7059228?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Oxford Academic
            </Link>
            )
          </Typography>
          <Typography>
            <strong>Masaje modelador</strong>: maniobras para <strong>estilizar el contorno</strong> y <strong>mejorar la textura</strong> percibida tras las energías. <strong>Transparencia</strong>: la evidencia científica específica de <strong>maderoterapia</strong> es <strong>limitada</strong>; se emplea como <strong>complemento</strong> y muchos pacientes refieren mejoras estéticas. ({' '}
            <Link href="https://www.verywellhealth.com/wood-therapy-6362588?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Verywell Health
            </Link>
            ,{' '}
            <Link href="https://www.healthline.com/health/beauty-skin-care/wood-therapy?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Healthline
            </Link>
            )
          </Typography>
        </Stack>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            <strong>En simple:</strong> EMSCULPT NEO <strong>activa y define</strong> el músculo mientras <strong>reduce grasa</strong>; el Lipo Láser <strong>afina contorno</strong>; el Pulido <strong>drena y perfila</strong> el acabado.
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Es para mí?
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Este protocolo es para vos si:
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>Ya probaste dieta/ejercicio y querés <strong>sacar la última grasa localizada</strong> del abdomen.</li>
          <li>Buscás <strong>definición muscular visible</strong> sin parar tu agenda.</li>
          <li>Querés <strong>resultados acumulativos</strong> en pocas semanas (serie corta inicial). ({' '}
            <Link href="https://bodycontouringacademy.com/emsculpt-neo-facts/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              bodycontouringacademy.com
            </Link>
            )
          </li>
        </Box>
        <Typography align="center">
          <strong>Contraindicaciones (resumen):</strong> embarazo/lactancia; <strong>implantes metálicos o electrónicos</strong> (p. ej., marcapasos, ciertos DIU/cobre) en zonas cercanas; tumores activos; fiebre, infecciones locales, trastornos hemorrágicos; músculos lesionados. Siempre evaluamos tu caso antes de iniciar. ({' '}
          <Link href="https://uploads.teachablecdn.com/attachments/ArBU8tV9TIujyDiBhiyu_Emsculpt_GUIDE_Clinical-guide_A4_EN101_preview.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Teachable
          </Link>
          ,{' '}
          <Link href="https://winterparkfamilyphysicians.com/wp-content/uploads/2023/04/Emsculpt_NEO_CLIN_General_Patient_Record_ENUS104.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Winter Park Family Physicians
          </Link>
          )
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Qué incluye cada sesión (60–70 minutos aprox.)
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>EMSCULPT NEO — 30’</strong> sobre abdomen (RF + HIFEM simultáneo). Sensación: <strong>contracciones intensas</strong> con <strong>calor tipo “piedras calientes”</strong>; no invasivo, sin downtime. ({' '}
            <Link href="https://btlaesthetics.com/en/for-providers/emsculpt-neo-providers?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              BTL Aesthetics
            </Link>
            )
          </li>
          <li>
            <strong>Lipo Láser — 30’</strong> (láser frío 635 nm). <strong>Indoloro</strong>. ({' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              MDedge
            </Link>
            )
          </li>
          <li>
            <strong>Maderoterapia + Pulido</strong>: combinamos <strong>drenaje linfático</strong> y <strong>masaje modelador</strong> según tu respuesta del día para <strong>bajar retención</strong> y <strong>mejorar el acabado</strong>. ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            )
          </li>
        </Box>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderLeft: 4, borderColor: 'success.main' }}>
          <Typography>
            <strong>Diferencia vs. Cinturón de Orión:</strong> Titán <strong>añade EMSCULPT NEO</strong> (músculo + grasa con evidencia sólida) y el <strong>Pulido</strong> es <strong>100% a medida</strong> según tu caso (no un flujo fijo). ({' '}
            <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Europe PMC
            </Link>
            )
          </Typography>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Resultados y ritmo recomendado
        </Typography>
        <Box component="ul" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <li>
            <strong>Series iniciales habituales:</strong> <strong>4 sesiones</strong> separadas 5–10 días; luego <strong>mantenimiento</strong> según objetivo. Los cambios siguen mejorando varias semanas tras la última sesión. ({' '}
            <Link href="https://bodycontouringacademy.com/emsculpt-neo-facts/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              bodycontouringacademy.com
            </Link>
            ,{' '}
            <Link href="https://skintightmedicalspa.com/body-sculpting/emsculpt-neo-results-timeline/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              Skin Tight MedSpa
            </Link>
            )
          </li>
          <li>
            <strong>Objetivo realista:</strong> <strong>menos contorno abdominal</strong> + <strong>más definición</strong>; <strong>no</strong> es un tratamiento de “bajar kilos”. ({' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              MDedge
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
                  2.000
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
                  6.600
                </Typography>
                <Typography variant="body2">≈1.100 por sesión; ahorrás 5.400 vs 6 sueltas — 45%.</Typography>
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
                  8.900
                </Typography>
                <Typography variant="body2">≈1.113 por sesión; ahorrás 7.100 vs 8 sueltas — 44%.</Typography>
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
                  10.900
                </Typography>
                <Typography variant="body2">≈1.090 por sesión; ahorrás 9.100 vs 10 sueltas — 46%.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography align="center" sx={{ mt: 3 }}>
          <strong>Recomendación directa:</strong>{' '}
          <strong>Mejor precio por sesión:</strong> <strong>Cuponera 10</strong>. <br />
          <strong>Mejor ticket de entrada + descuento agresivo hoy:</strong> <strong>Cuponera 6 — Oferta de Apertura</strong> (ideal para completar la serie inicial y validar resultados sin gastar de más).
        </Typography>
      </Container>
      <Container component="section" sx={{ py: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h3" align="center" gutterBottom>
          Paso a paso
        </Typography>
        <Box component="ol" sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <li>
            <strong>Evaluación</strong> (objetivo y zona).
          </li>
          <li>
            <strong>EMSCULPT NEO 30’</strong> (definición + grasa). ({' '}
            <Link href="https://btlaesthetics.com/en/for-providers/emsculpt-neo-providers?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              BTL Aesthetics
            </Link>
            )
          </li>
          <li>
            <strong>Lipo Láser 30’</strong> (contorno). ({' '}
            <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              MDedge
            </Link>
            )
          </li>
          <li>
            <strong>Pulido</strong> (drenaje/modelador personalizado). ({' '}
            <Link href="https://link.springer.com/article/10.1007/s11764-020-00928-1?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
              SpringerLink
            </Link>
            )
          </li>
          <li>
            <strong>Tips post</strong>: hidratación y mini‑caminata el mismo día.
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
                Se sienten <strong>contracciones intensas</strong> y <strong>calor tolerable</strong>; salís y seguís con tu día. ({' '}
                <Link href="https://sa1s3.patientpop.com/assets/docs/290920.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  PatientPop
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿Cuándo veo cambios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Vas notando <strong>más tono</strong> y <strong>menos contorno</strong> <strong>sesión a sesión</strong>; el pico se observa <strong>semanas</strong> después al completar la serie (el cuerpo sigue eliminando grasa y el músculo sigue adaptándose). ({' '}
                <Link href="https://skintightmedicalspa.com/body-sculpting/emsculpt-neo-results-timeline/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Skin Tight MedSpa
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿EMSCULPT NEO es mejor que otras opciones no invasivas?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Para abdomen combina <strong>músculo + grasa</strong> en <strong>una sola sesión</strong>, con <strong>evidencia de imagen</strong> (MRI/US) y <strong>ensayo aleatorizado</strong>. Esa combinación simultánea <strong>no la ofrecen</strong> tecnologías de “grasa sola” o “músculo solo”. ({' '}
                <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
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
                No. Es <strong>contorneado</strong> y <strong>definición muscular</strong>; el peso puede no cambiar aunque baje el perímetro y suba la firmeza. ({' '}
                <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Europe PMC
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
                Embarazo/lactancia, <strong>marcapasos o implantes metálicos/electrónicos</strong> cercanos, tumores activos, fiebre/infecciones, músculos lesionados. Te asesoramos antes de empezar. ({' '}
                <Link href="https://uploads.teachablecdn.com/attachments/ArBU8tV9TIujyDiBhiyu_Emsculpt_GUIDE_Clinical-guide_A4_EN101_preview.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Teachable
                </Link>
                ,{' '}
                <Link href="https://winterparkfamilyphysicians.com/wp-content/uploads/2023/04/Emsculpt_NEO_CLIN_General_Patient_Record_ENUS104.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Winter Park Family Physicians
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<Box>+</Box>}>
              <Typography>¿En qué se diferencia de Cinturón de Orión?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Titán</strong>: suma <strong>EMSCULPT NEO</strong>, con respaldo en <strong>estudios</strong> (músculo + grasa). El <strong>Pulido</strong> es <strong>a medida</strong>. <br />
                <strong>Orión</strong>: protocolo <strong>entry‑level</strong> sin HIFEM+RF; flujo fijo (Lipo Láser + Maderoterapia + Drenaje). ({' '}
                <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
                  Europe PMC
                </Link>
                )
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <Container component="section" sx={{ py: 6, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
        <Typography variant="h3" gutterBottom>
          ¿Listo para definir abdomen y cerrar esa grasa rebelde?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Asegurá tu <strong>Cuponera 6 — Oferta de Apertura</strong> o reservá <strong>1 sesión</strong> para comenzar.
        </Typography>
        <Button variant="contained" color="success" size="large" href={WHATSAPP_LINK} sx={{ fontWeight: 'bold' }}>
          Escribinos ahora
        </Button>
      </Container>
      <Container component="footer" sx={{ py: 4 }}>
        <Typography variant="body2" align="center">
          Los resultados varían según composición corporal y hábitos. Este protocolo <strong>no reemplaza</strong> indicación médica, entrenamiento o nutrición; <strong>los potencia</strong>. EMSCULPT NEO y Lipo Láser cuentan con <strong>publicaciones revisadas por pares</strong> sobre <strong>reducción de grasa</strong> y/o <strong>aumento muscular</strong>; la <strong>maderoterapia</strong> es un <strong>complemento</strong> con evidencia formal limitada. Siempre realizamos evaluación previa. ({' '}
          <Link href="https://europepmc.org/article/PMC/PMC9028295?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Europe PMC
          </Link>
          ,{' '}
          <Link href="https://cdn.mdedge.com/files/s3fs-public/issues/articles/SCMS_Vol_32_No_1_Body_Contouring.pdf?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            MDedge
          </Link>
          ,{' '}
          <Link href="https://onlinelibrary.wiley.com/doi/pdf/10.1002/lsm.22153?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" underline="always">
            Wiley Online Library
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
