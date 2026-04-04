import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export const TEMPLATE_USAGES = {
  MANUAL_SEND: 'manual_send',
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
};

export const TEMPLATE_USAGE_LABELS = {
  [TEMPLATE_USAGES.MANUAL_SEND]: 'Envío manual',
  [TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION]: 'Confirmación de cita',
};

export const BUILTIN_CATEGORY_LABELS = {
  body: 'Corporal',
  facial: 'Facial',
  complementarios: 'Complementarios',
};

export function formatCategoryLabel(category) {
  if (!category) return '';
  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeUsageType(usageType) {
  return usageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
    ? TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
    : TEMPLATE_USAGES.MANUAL_SEND;
}

export function normalizeProductCategory(productCategory) {
  if (typeof productCategory !== 'string') return null;
  const normalized = productCategory.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeTemplate(template) {
  if (!template) return null;
  return {
    ...template,
    usage_type: normalizeUsageType(template.usage_type),
    product_category: normalizeProductCategory(template.product_category),
  };
}

export function toCategoryKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function resolveConfirmationTemplate(templates, appointmentCategory) {
  const normalizedTemplates = (templates || [])
    .map(normalizeTemplate)
    .filter(Boolean);
  const confirmationTemplates = normalizedTemplates.filter(
    (template) => template.usage_type === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
  );
  const categoryKey = toCategoryKey(appointmentCategory);

  const exactMatch = confirmationTemplates.find(
    (template) => toCategoryKey(template.product_category) === categoryKey && categoryKey
  );
  if (exactMatch) return exactMatch;

  return confirmationTemplates.find((template) => !template.product_category) || null;
}

export function formatTemplateMessage(templateMessage, appointment) {
  if (!templateMessage) return '';

  const utcDate = dayjs.utc(appointment.scheduled_at);
  const localDate = utcDate.tz('America/Montevideo');
  const dateStr = localDate.format('dddd, D [de] MMMM');
  const timeStr = localDate.format('HH:mm');

  return templateMessage
    .replace(/{{nombre}}/g, appointment.customer_name || '')
    .replace(/{{tratamiento}}/g, appointment.treatment_name || '')
    .replace(/{{fecha}}/g, dateStr)
    .replace(/{{hora}}/g, timeStr)
    .replace(/{{categoria}}/g, appointment.treatment_category || '')
    .replace(/{{producto}}/g, appointment.treatment_category || '');
}
