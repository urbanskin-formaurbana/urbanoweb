/**
 * Shared slot loading and filtering utilities
 * Used by both CreateAppointmentModal and SchedulingPage
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import appointmentService from '../services/appointment_service.js';
import laserCampaignService from '../services/laser_campaign_service.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Check if treatment is laser-based
 */
export function isLaserTreatment(treatment) {
  if (!treatment) return false;
  return treatment.gender != null || treatment.category === 'laser';
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
 * Fetch available slots for a given date and treatment
 * Handles both laser and regular treatments
 * Returns: raw ISO datetime strings
 */
export async function fetchAvailableSlots(date, treatment, paymentMode) {
  if (!treatment) return [];

  try {
    if (isLaserTreatment(treatment)) {
      const duration = getSlotDuration(treatment, paymentMode);
      return laserCampaignService.getAvailableSlots(duration);
    } else {
      const duration = getSlotDuration(treatment, paymentMode);
      return appointmentService.getAvailableSlots(date, duration);
    }
  } catch (err) {
    console.error('Error fetching available slots:', err);
    throw err;
  }
}
