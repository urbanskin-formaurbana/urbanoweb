/**
 * Generic campaign service factory
 * Creates a service instance for a specific campaign product type (laser, hifu, etc.)
 * Usage:
 *   const laserService = createCampaignService('laser');
 *   const hifuService = createCampaignService('hifu');
 */
import { apiCall } from './api.js';

function createCampaignService(productType) {
  const BASE_URL = `/campaigns/${productType}`;

  return {
    // ========== Admin endpoints ==========

    /**
     * Create a new campaign (closes previous if active)
     */
    async createCampaign(name, productLabel, startsOn, endsOn) {
      return await apiCall(`${BASE_URL}/admin`, {
        method: 'POST',
        body: JSON.stringify({
          product_type: productType,
          product_label: productLabel,
          name,
          starts_on: startsOn,
          ends_on: endsOn,
        }),
      });
    },

    /**
     * List all campaigns
     */
    async listCampaigns(limit = 10, skip = 0) {
      const params = new URLSearchParams({ limit, skip });
      return await apiCall(`${BASE_URL}/admin?${params}`);
    },

    /**
     * Get active campaign with all slots and booking details (admin view)
     */
    async getActiveCampaignAdmin() {
      return await apiCall(`${BASE_URL}/admin/active`);
    },

    /**
     * Get specific campaign with slots
     */
    async getCampaignDetail(campaignId) {
      return await apiCall(`${BASE_URL}/admin/${campaignId}`);
    },

    /**
     * Update campaign
     */
    async updateCampaign(campaignId, updates) {
      return await apiCall(`${BASE_URL}/admin/${campaignId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    /**
     * Bulk-generate slots for campaign
     */
    async addBulkSlots(campaignId, days, startTime, endTime) {
      return await apiCall(`${BASE_URL}/admin/${campaignId}/slots/bulk`, {
        method: 'POST',
        body: JSON.stringify({
          days,
          start_time: startTime,
          end_time: endTime,
        }),
      });
    },

    /**
     * Delete a slot (only if unbooked)
     */
    async deleteSlot(campaignId, slotId) {
      return await apiCall(`${BASE_URL}/admin/${campaignId}/slots/${slotId}`, {
        method: 'DELETE',
      });
    },

    /**
     * Get waitlisted customers, optionally filtered by campaign
     */
    async getWaitlist(campaignId = null) {
      const url = campaignId
        ? `${BASE_URL}/admin/waitlist?campaign_id=${campaignId}`
        : `${BASE_URL}/admin/waitlist`;
      return await apiCall(url);
    },

    // ========== Public/Customer endpoints ==========

    /**
     * Get basic info about active campaign (no slot details)
     * Returns null if no active campaign
     */
    async getActiveCampaign() {
      return await apiCall(`${BASE_URL}/active`);
    },

    /**
     * Get available slot start times for a given duration
     */
    async getAvailableSlots(durationMinutes) {
      const params = new URLSearchParams({ duration_minutes: durationMinutes });
      const response = await apiCall(`${BASE_URL}/active/slots?${params}`);
      return response.slots;
    },

    /**
     * Join the waitlist (auth required)
     */
    async joinWaitlist() {
      return await apiCall(`${BASE_URL}/waitlist`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },

    /**
     * Check if current user is on waitlist
     */
    async checkWaitlistStatus() {
      try {
        return await apiCall(`${BASE_URL}/waitlist/me`);
      } catch (error) {
        return null; // Not authenticated or not on waitlist
      }
    },
  };
}

// Get all registered campaign product types
async function getProductTypes() {
  try {
    return await apiCall('/campaigns/product-types');
  } catch (error) {
    console.error('Error fetching product types:', error);
    return [];
  }
}

// Pre-configured instances for common product types
export const laserCampaignService = createCampaignService('laser');
export const hifuCampaignService = createCampaignService('hifu');
export { getProductTypes, createCampaignService };

// Factory function and service methods
const campaignService = {
  getProductTypes,
  createCampaignService,
};

export default campaignService;
