/**
 * Contact Service
 * Handles contact submission and lead capture
 */

import { apiCall } from './api.js';

export const contactService = {
  /**
   * Submit contact form
   * @param {object} data - Contact form data
   * @param {string} data.name - Customer name
   * @param {string} data.phone - Phone number (format: 59891234567)
   * @param {string} data.email - Email address
   * @param {string} data.message - Message (min 10 characters)
   * @param {string} data.source_page - Page where form was submitted
   * @param {string} [data.utm_source] - UTM source parameter
   * @param {string} [data.utm_medium] - UTM medium parameter
   * @param {string} [data.utm_campaign] - UTM campaign parameter
   * @returns {Promise<object>} - Submission response
   */
  async submitContact(data) {
    return apiCall('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Capture lead (minimal info for lead tracking)
   * @param {object} data - Lead capture data
   * @param {string} data.treatment_slug - Treatment slug
   * @param {string} data.source_page - Page where lead was captured
   * @param {string} data.cta_location - CTA location (e.g., 'header', 'footer', 'pricing')
   * @param {string} [data.utm_source] - UTM source parameter
   * @param {string} [data.utm_medium] - UTM medium parameter
   * @param {string} [data.utm_campaign] - UTM campaign parameter
   * @returns {Promise<object>} - Lead response with WhatsApp link
   */
  async captureLead(data) {
    return apiCall('/leads/capture', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default contactService;
