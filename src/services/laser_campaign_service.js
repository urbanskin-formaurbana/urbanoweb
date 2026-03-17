// Laser campaign management service
import { apiCall } from './api.js';

const BASE_URL = "/laser-campaigns";

const laserCampaignService = {
  // ========== Admin endpoints ==========

  /**
   * Create a new laser campaign (closes previous if active)
   */
  async createCampaign(name, startsOn, endsOn) {
    return await apiCall(`${BASE_URL}/admin`, {
      method: 'POST',
      body: JSON.stringify({
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
   * @param {string} campaignId
   * @param {string[]} days - ISO date strings (YYYY-MM-DD)
   * @param {string} startTime - HH:MM format
   * @param {string} endTime - HH:MM format
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
   * @param {string} [campaignId] - If provided, returns entries for that campaign. If not, returns open waitlist.
   */
  async getWaitlist(campaignId = null) {
    const url = campaignId
      ? `${BASE_URL}/admin/waitlist?campaign_id=${campaignId}`
      : `${BASE_URL}/admin/waitlist`;
    return await apiCall(url);
  },

  // ========== Public/Customer endpoints ==========

  /**
   * Get basic info about active campaign (no slot details) - for customers before payment
   * Returns null if no active campaign
   */
  async getActiveCampaign() {
    try {
      return await apiCall(`${BASE_URL}/active`);
    } catch (error) {
      return null; // No active campaign
    }
  },

  /**
   * Get available slot start times for a given duration
   * @param {number} durationMinutes
   * @returns {datetime[]} list of available start times
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

export default laserCampaignService;
