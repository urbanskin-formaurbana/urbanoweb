import { useState } from 'react';
import { Box, Button, CircularProgress, Menu, MenuItem } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { formatTemplateMessage } from '../utils/messageTemplates';
import analytics from '../utils/analytics';

function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, '');

  if (digits.length >= 7 && digits.length <= 15) {
    return digits;
  }

  if (digits.startsWith('09')) {
    digits = '598' + digits.slice(1);
  } else if (digits.length === 8) {
    digits = '598' + digits;
  }

  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

function getPendingPaymentContext(appointment, pendingDeposit) {
  const isCuponeraSession =
    appointment.is_cuponera_session === true ||
    !!appointment.purchased_package_id;

  if (isCuponeraSession) return null;

  const totalFromAppt = Number(appointment.total_amount ?? 0);
  const paidFromAppt = Number(appointment.paid_amount ?? 0);
  const discountFromAppt = Number(appointment.discount_amount ?? 0);
  const remainingFromAppt =
    appointment.remaining_amount != null
      ? Number(appointment.remaining_amount)
      : Math.max(totalFromAppt - paidFromAppt - discountFromAppt, 0);

  if (remainingFromAppt > 0 && totalFromAppt > 0) {
    return {
      appointment_id: appointment.id,
      customer_name: appointment.customer_name,
      treatment_name: appointment.treatment_name,
      full_amount: totalFromAppt,
      paid_amount: paidFromAppt,
      discount_amount: discountFromAppt,
      remaining: remainingFromAppt,
    };
  }

  if (pendingDeposit) {
    return {
      ...pendingDeposit,
      paid_amount: pendingDeposit.paid_amount ?? pendingDeposit.paid ?? 0,
      discount_amount: pendingDeposit.discount_amount ?? 0,
    };
  }

  if (appointment.payment_status === 'awaiting_payment') {
    return {
      appointment_id: appointment.id,
      customer_name: appointment.customer_name,
      treatment_name: appointment.treatment_name,
      full_amount: totalFromAppt,
      paid_amount: 0,
      discount_amount: 0,
      remaining: totalFromAppt,
    };
  }

  return null;
}

export default function AppointmentActions({
  appointment,
  pendingDeposit,
  templates,
  categoryConfigs,
  confirming,
  onConfirm,
  onReschedule,
  onComplete,
  onNoShow,
  onOpenAddPayment,
  size = 'small',
  sx,
}) {
  const [whatsappAnchor, setWhatsappAnchor] = useState(null);
  const [completarAnchor, setCompletarAnchor] = useState(null);

  const phone = formatPhoneForWhatsApp(appointment.customer_phone);
  const pendingPaymentContext = getPendingPaymentContext(appointment, pendingDeposit);

  const payOnArrival =
    appointment.payment_method_expected === 'efectivo' ||
    appointment.payment_method_expected === 'posnet';
  const allowConfirmWithoutPayment =
    appointment.allow_confirm_without_payment === true || payOnArrival;
  const canConfirmAppointment =
    appointment.status === 'pending' &&
    (
      appointment.payment_status !== 'awaiting_payment' ||
      allowConfirmWithoutPayment
    );

  const handleWhatsappTemplateSelect = (template) => {
    const formattedMessage = formatTemplateMessage(template.message, appointment, categoryConfigs);
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
    analytics.trackWhatsAppClick({
      source: 'admin_template',
      context: {
        appointmentId: appointment.id,
        templateId: template.id,
      },
    });
    window.open(waLink, '_blank', 'noopener,noreferrer');
    setWhatsappAnchor(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        flexWrap: 'wrap',
        '& .MuiButton-root': {
          height: 32,
          fontSize: '0.75rem',
          lineHeight: 1,
        },
        ...sx,
      }}
    >
      {pendingPaymentContext && (payOnArrival || pendingDeposit) && (pendingPaymentContext.remaining > 0 || (payOnArrival && appointment.payment_status === 'awaiting_payment')) ? (
        <Button
          size={size}
          variant="contained"
          color="primary"
          onClick={() => onOpenAddPayment(pendingPaymentContext)}
          sx={{ px: 1 }}
        >
          Agregar Pago
        </Button>
      ) : null}

      {canConfirmAppointment && (
        <Button
          size={size}
          variant="contained"
          color="success"
          onClick={() => onConfirm(appointment.id)}
          disabled={confirming === appointment.id}
          sx={{ px: 1 }}
        >
          {confirming === appointment.id ? <CircularProgress size={16} /> : 'Confirmar'}
        </Button>
      )}

      {appointment.status === 'confirmed' && (
        <>
          <Button
            size={size}
            variant="contained"
            color="primary"
            onClick={(e) => setCompletarAnchor(e.currentTarget)}
            sx={{ minWidth: 0, px: 1 }}
            aria-label="Marcar cita como completada"
          >
            <TaskAltIcon sx={{ fontSize: '1.1rem' }} />
          </Button>
          <Menu
            anchorEl={completarAnchor}
            open={Boolean(completarAnchor)}
            onClose={() => setCompletarAnchor(null)}
          >
            <MenuItem onClick={() => { setCompletarAnchor(null); onComplete(appointment); }}>Completar</MenuItem>
            <MenuItem onClick={() => { setCompletarAnchor(null); onNoShow(appointment); }}>No-show</MenuItem>
          </Menu>
        </>
      )}

      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <Button
          size={size}
          variant="outlined"
          color="primary"
          onClick={() => onReschedule(appointment)}
          sx={{ px: 1 }}
        >
          Reagendar
        </Button>
      )}

      {phone && (
        <>
          <Button
            size={size}
            variant="outlined"
            color="success"
            onClick={(e) => setWhatsappAnchor(e.currentTarget)}
            sx={{ minWidth: 0, px: 1 }}
            aria-label="Enviar mensaje por WhatsApp"
          >
            <WhatsAppIcon sx={{ fontSize: '1.1rem' }} />
          </Button>
          <Menu
            anchorEl={whatsappAnchor}
            open={!!whatsappAnchor}
            onClose={() => setWhatsappAnchor(null)}
          >
            {templates.length > 0 ? (
              templates.map((template) => (
                <MenuItem
                  key={template.id}
                  onClick={() => handleWhatsappTemplateSelect(template)}
                >
                  {template.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay plantillas disponibles</MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
}
