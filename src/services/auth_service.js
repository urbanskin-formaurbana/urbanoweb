/**
 * Auth Service
 * Handles authenticated API calls for the current user.
 * Session management (login, logout, refresh) is owned by SuperTokens.
 */

import { apiCall } from './api.js';

export const authService = {
  /**
   * Get current authenticated user profile
   * @returns {Promise<object>} - User profile data
   */
  async getCurrentUser() {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Update current user's personal profile data
   * @param {object} data - { first_name, last_name, birth_date, cedula }
   * @returns {Promise<object>} - Updated user profile
   */
  async updateProfile(data) {
    return apiCall('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Check if customer can purchase packages (after evaluation)
   * @returns {Promise<object>} - { can_purchase_packages: boolean }
   */
  async getPurchaseEligibility() {
    return apiCall('/auth/me/purchase-eligibility', {
      method: 'GET',
    });
  },
};

export default authService;
