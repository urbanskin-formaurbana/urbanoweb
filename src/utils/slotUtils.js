/**
 * Shared slot loading and filtering utilities
 * Used by both CreateAppointmentModal and SchedulingPage
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import appointmentService from '../services/appointment_service.js';
import { createCampaignService } from '../services/campaign_service.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Check if treatment is a campaign product (data-driven)
 * Campaign treatments have item_type field (zona, paquete, etc.)
 */
export function isCampaignTreatment(treatment) {
  if (!treatment) return false;
  return treatment.item_type != null;
}

/**
 * Alias for backward compatibility
 * @deprecated Use isCampaignTreatment instead
 */
export function isLaserTreatment(treatment) {
  return isCampaignTreatment(treatment);
}

/**
 * Filter slots for employee (admin) — keep only those strictly after now
 * Input: raw ISO datetime strings
 */
export function filterSlotsForEmployee(slots) {
  const now = dayjs().tz('America/Montevideo');
  return slots.filter(slot =>
    dayjs.utc(slot).tz('America/Montevideo').isAfter(now)
  );
}

/**
 * Filter slots for customer — enforce 24-hour advance booking for tomorrow only
 * Input: raw ISO datetime strings
 */
export function filterSlotsForCustomer(slots) {
  const now = dayjs().tz('America/Montevideo');
  const tomorrow = now.add(1, 'day');

  return slots.filter(slot => {
    const slotTime = dayjs.utc(slot).tz('America/Montevideo');
    // For tomorrow: only allow slots at or after current time of day
    if (slotTime.isSame(tomorrow, 'day')) {
      return (
        slotTime.hour() > now.hour() ||
        (slotTime.hour() === now.hour() && slotTime.minute() >= now.minute())
      );
    }
    // All other days: no restriction
    return true;
  });
}

/**
 * Resolve appointment duration based on treatment and payment mode
 */
export function getSlotDuration(treatment, paymentMode) {
  return paymentMode === 'evaluacion' ? 30 : (treatment?.duration_minutes || 90);
}

/**
 * Fetch all available slots for a campaign treatment (no date filter)
 * Used to populate the date list in the UI
 * Returns: raw ISO datetime strings
 */
export async function fetchAllCampaignSlots(treatment, paymentMode) {
  if (!treatment || !isCampaignTreatment(treatment)) return [];

  try {
    const duration = getSlotDuration(treatment, paymentMode);
    const productType = treatment.category; // e.g., 'laser', 'hifu'
    if (!productType) return [];
    const campaignService = createCampaignService(productType);
    return await campaignService.getAvailableSlots(duration);
  } catch (err) {
    console.error('Error fetching all campaign slots:', err);
    throw err;
  }
}

/**
 * Fetch available slots for a given date and treatment
 * Handles both campaign (laser, hifu) and regular treatments
 * Returns: raw ISO datetime strings
 */
export async function fetchAvailableSlots(date, treatment, paymentMode) {
  if (!treatment) return [];

  try {
    if (isCampaignTreatment(treatment)) {
      const duration = getSlotDuration(treatment, paymentMode);
      const productType = treatment.category; // e.g., 'laser', 'hifu'
      const campaignService = createCampaignService(productType);
      const allSlots = await campaignService.getAvailableSlots(duration);

      // Filter slots to only those matching the requested date
      const targetDate = dayjs(date).tz('America/Montevideo').format('YYYY-MM-DD');
      return allSlots.filter(slot =>
        dayjs.utc(slot).tz('America/Montevideo').format('YYYY-MM-DD') === targetDate
      );
    } else {
      const duration = getSlotDuration(treatment, paymentMode);
      return appointmentService.getAvailableSlots(date, duration);
    }
  } catch (err) {
    console.error('Error fetching available slots:', err);
    throw err;
  }
}
