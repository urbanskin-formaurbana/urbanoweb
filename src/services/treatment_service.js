/**
 * Treatment Service
 * Handles all treatment-related API calls
 */

import { apiCall } from './api.js';

export const treatmentService = {
  /**
   * Get treatment and its active packages
   * @param {string} slug - Treatment slug (e.g., 'orion', 'titan', 'acero')
   * @returns {Promise<object>} - Treatment with packages
   */
  async getTreatmentPackages(slug) {
    return apiCall(`/treatments/${slug}/packages`);
  },

  /**
   * Get all active treatments
   * @returns {Promise<array>} - List of treatments
   */
  async getAllTreatments() {
    return apiCall('/treatments');
  },
};

export default treatmentService;
