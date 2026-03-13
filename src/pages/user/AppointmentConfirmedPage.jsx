import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function AppointmentConfirmedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);

  const appointment = location.state?.appointment;
  const method = location.state?.loginMethod;

  useEffect(() => {
    if (method === 'whatsapp') {
      setShowWhatsAppMessage(true);
      // In production, would send WhatsApp message here
    }
  }, [method]);

  if (!appointment) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          No hay información de cita disponible
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Volver a inicio
        </Button>
      </Container>
    );
  }

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Box sx={{ bgcolor: 'info.light', color: 'info.contrastText', py: 3, mb: 4 }}>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Solicitud de cita recibida
          </Typography>
          <Typography variant="body1">
            Hemos registrado tu evaluación. Te contactaremos pronto.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {/* Status Message */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <HourglassTopIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Tu solicitud está en revisión
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nuestros esteticistas revisarán tu disponibilidad y se comunicarán contigo pronto para confirmar.
          </Typography>
        </Box>

        {/* Status Badge */}
        <Alert severity="info" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            <strong>Estado:</strong> Pendiente de confirmación
          </Typography>
        </Alert>

        {/* Appointment Details */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Detalles de tu solicitud
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarMonthIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Fecha solicitada
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', pl: 4 }}>
                  {appointment.date}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccessTimeIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Hora solicitada
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', pl: 4 }}>
                  {appointment.time}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Duración estimada
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {appointment.duration} minutos
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Servicio
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {appointment.treatment}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Número de solicitud
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    mt: 1
                  }}
                >
                  {appointment.id}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Cómo nos pondremos en contacto
            </Typography>

            <Stack spacing={2}>
              {method === 'whatsapp' ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="info" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        WhatsApp
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Te contactaremos por WhatsApp para confirmar o ajustar el horario
                      </Typography>
                    </Box>
                  </Box>
                  {showWhatsAppMessage && (
                    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="caption" color="success.dark">
                        ✓ Hemos registrado tu número {user?.phone}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon color="info" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Correo electrónico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Te contactaremos al correo {user?.email} para confirmar o ajustar el horario
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card sx={{ mb: 4, bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Próximos pasos
            </Typography>

            <Typography variant="body2" component="div" color="text.secondary">
              <ol style={{ margin: '0', paddingLeft: '20px' }}>
                <li><strong>Dentro de 24 horas:</strong> Nuestros esteticistas revisarán tu solicitud</li>
                <li><strong>Confirmación:</strong> Recibirás una confirmación con la fecha y hora final por {method === 'whatsapp' ? 'WhatsApp' : 'correo'}</li>
                <li><strong>Calendario:</strong> Si lo tienes, se agregará a tu calendario de Google</li>
                <li><strong>Recordatorios:</strong> Te enviaremos recordatorios 24 horas y 1 hora antes</li>
              </ol>
            </Typography>
          </CardContent>
        </Card>

        {/* What if reschedule is needed */}
        <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              ¿Necesitamos cambiar el horario?
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Si el horario que solicitaste no está disponible, nuestros esteticistas te contactarán para ofrecerte alternativas.
              Por favor responde dentro de 24 horas para confirmar la nueva fecha.
            </Typography>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              ¿Necesitas ayuda o deseas cambiar tu solicitud?
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                📧 correo@formaurbana.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                💬 WhatsApp: +598 9 1234 5678
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 Montevideo Centro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Número de solicitud (para referencia):</strong> {appointment.id}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="info"
            size="large"
            onClick={handleGoHome}
            sx={{ py: 1.5 }}
          >
            Ir a inicio
          </Button>
        </Stack>
      </Container>
    </>
  );
}
