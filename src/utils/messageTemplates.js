import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const APPOINTMENT_TIMEZONE = 'America/Montevideo';

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

const DEDICATED_SECTION_LABELS = {
  body: 'Tratamiento Corporal',
  facial: 'Tratamiento Facial',
  complementarios: 'Tratamiento Complementario',
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

function resolveCategoryLabel(category, categoryConfigs = []) {
  const categoryKey = toCategoryKey(category);
  if (!categoryKey) return '';

  if (DEDICATED_SECTION_LABELS[categoryKey]) {
    return DEDICATED_SECTION_LABELS[categoryKey];
  }

  const configMatch = (categoryConfigs || []).find(
    (config) => toCategoryKey(config?.category) === categoryKey
  );

  if (typeof configMatch?.label === 'string' && configMatch.label.trim()) {
    return configMatch.label.trim();
  }

  return category || '';
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

function normalizeLooseTimeValue(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  if (!text) return null;

  const parsedDateTime = dayjs.utc(text);
  if (parsedDateTime.isValid()) {
    return parsedDateTime.tz(APPOINTMENT_TIMEZONE).format('HH:mm');
  }

  const match = text.match(/^(\d{1,2})(?::(\d{1,2}))?(?::\d{1,2})?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = match[2] !== undefined ? Number(match[2]) : 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function resolveAppointmentTime(appointment) {
  const utcDate = dayjs.utc(appointment?.scheduled_at);
  if (utcDate.isValid()) {
    return utcDate.tz(APPOINTMENT_TIMEZONE).format('HH:mm');
  }

  const fallbackTimeKeys = ['time', 'hora', 'scheduled_time', 'appointment_time'];
  for (const key of fallbackTimeKeys) {
    const normalized = normalizeLooseTimeValue(appointment?.[key]);
    if (normalized) return normalized;
  }

  return '';
}

export function formatTemplateMessage(templateMessage, appointment, categoryConfigs = []) {
  if (!templateMessage) return '';

  const utcDate = dayjs.utc(appointment.scheduled_at);
  const localDate = utcDate.tz(APPOINTMENT_TIMEZONE);
  const dateStr = localDate.isValid() ? localDate.format('dddd, D [de] MMMM') : '';
  const timeStr = resolveAppointmentTime(appointment);
  const categoryLabel = resolveCategoryLabel(appointment.treatment_category, categoryConfigs);

  return templateMessage
    .replace(/{{nombre}}/g, appointment.customer_name || '')
    .replace(/{{tratamiento}}/g, appointment.treatment_name || '')
    .replace(/{{fecha}}/g, dateStr)
    .replace(/{{hora}}/g, timeStr)
    .replace(/{{categoria}}/g, categoryLabel)
    .replace(/{{producto}}/g, categoryLabel);
}
