/**
 * Appointment Service
 * Handles all appointment-related API calls
 */

import { apiCall } from './api.js';

export const appointmentService = {
  /**
   * Get available time slots for a specific date
   * @param {Date} date - Date to check availability
   * @param {number} durationMinutes - Appointment duration in minutes (default 90)
   * @param {string} excludeAppointmentId - Optional appointment ID to exclude (for rescheduling)
   * @returns {Promise<string[]>} - Array of available time slots in ISO format
   */
  async getAvailableSlots(date, durationMinutes = 90, excludeAppointmentId = null) {
    try {
      const body = {
        date: date.toISOString(),
        duration_minutes: durationMinutes,
      };
      if (excludeAppointmentId) {
        body.exclude_appointment_id = excludeAppointmentId;
      }
      const response = await apiCall('/appointments/available-slots', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return response; // Array of ISO datetime strings
    } catch (err) {
      console.error('Error fetching available slots:', err);
      throw err;
    }
  },

  /**
   * Create a new appointment after payment is completed
   * @param {object} data - { treatment_id, scheduled_at, payment_id }
   * @returns {Promise<object>} - Created appointment details with appointment_id
   */
  async createAppointment(data) {
    try {
      const response = await apiCall('/appointments/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  },

  /**
   * Get customer's current active appointment (pending or confirmed)
   * @returns {Promise<object|null>} - Most recent pending or confirmed appointment, or null if none exists
   */
  async getCustomerAppointments() {
    try {
      const response = await apiCall('/appointments/', {
        method: 'GET',
        suppressErrorLog: true, // 401 is expected if user not authenticated
      });

      if (!response || !response.appointments) {
        return null;
      }

      // Filter for pending or confirmed status
      const activeAppointments = response.appointments.filter(
        (a) => a.status === 'pending' || a.status === 'confirmed'
      );

      // Return most recent appointment
      if (activeAppointments.length > 0) {
        // Sort by created_at descending and return the first (most recent)
        activeAppointments.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        return activeAppointments[0];
      }

      return null;
    } catch (err) {
      // If 401 (unauthorized/session expired), return null instead of throwing
      // This means user is not authenticated or token is invalid
      // App.jsx will handle the logout event and redirect
      if (err.message && (err.message.includes('Unauthorized') || err.message.includes('Session expired'))) {
        return null;
      }

      console.error('Error fetching appointments:', err);
      throw err;
    }
  },

  /**
   * Get all customer appointments (full history)
   * @returns {Promise<object[]>} - All appointments sorted by scheduled_at descending
   */
  async getAllCustomerAppointments() {
    try {
      const response = await apiCall('/appointments/', {
        method: 'GET',
        suppressErrorLog: true,
      });

      if (!response || !response.appointments) {
        return [];
      }

      // Sort by scheduled_at descending (newest first)
      const sorted = response.appointments.sort(
        (a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)
      );

      return sorted;
    } catch (err) {
      if (err.message && (err.message.includes('Unauthorized') || err.message.includes('Session expired'))) {
        return [];
      }

      console.error('Error fetching all appointments:', err);
      throw err;
    }
  },

  /**
   * Get single appointment details
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - Appointment details
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await apiCall(`/appointments/${appointmentId}`, {
        method: 'GET',
      });
      return response;
    } catch (err) {
      console.error('Error fetching appointment:', err);
      throw err;
    }
  },

  /**
   * Reschedule an existing appointment to a new date/time
   * @param {string} appointmentId - Appointment ID to reschedule
   * @param {string} newScheduledAt - New datetime in ISO format (UTC)
   * @returns {Promise<object>} - Updated appointment details
   */
  async rescheduleAppointment(appointmentId, newScheduledAt) {
    try {
      const response = await apiCall(`/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ new_scheduled_at: newScheduledAt }),
      });
      return response;
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      throw err;
    }
  },

  /**
   * Mark appointment as manually added by customer to Google Calendar
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - Updated appointment details
   */
  async markCalendarAdded(appointmentId) {
    try {
      const response = await apiCall(`/appointments/${appointmentId}/calendar-added`, {
        method: 'PATCH',
        body: JSON.stringify({ added: true }),
      });
      return response;
    } catch (err) {
      console.error('Error marking calendar added:', err);
      throw err;
    }
  },

  /**
   * Get available packages for a treatment
   * @param {string} slug - Treatment slug
   * @returns {Promise<object>} - { packages: [...] }
   */
  async getTreatmentPackages(slug) {
    return apiCall(`/treatments/${slug}/packages`);
  },
};

export default appointmentService;
