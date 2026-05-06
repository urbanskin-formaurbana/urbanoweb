/**
 * Category Config Service
 * Public read access to category configuration metadata.
 */

import { apiCall } from './api.js';

export const categoryConfigService = {
  /**
   * Get configuration for a specific category by slug.
   * @param {string} category - Category slug (e.g. 'laser', 'hifu')
   * @returns {Promise<object>} - Category config including card_description and subtitle
   */
  async getByCategory(category) {
    return apiCall(`/category-configs/${encodeURIComponent(category)}`);
  },
};

export default categoryConfigService;
