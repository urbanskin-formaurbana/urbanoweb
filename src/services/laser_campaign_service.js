// Laser campaign management service
import axiosInstance from "./axios_config";

const BASE_URL = "/api/v1/laser-campaigns";

const laserCampaignService = {
  // ========== Admin endpoints ==========

  /**
   * Create a new laser campaign (closes previous if active)
   */
  async createCampaign(name, startsOn, endsOn) {
    const response = await axiosInstance.post(`${BASE_URL}/admin/laser-campaigns`, {
      name,
      starts_on: startsOn,
      ends_on: endsOn,
    });
    return response.data;
  },

  /**
   * List all campaigns
   */
  async listCampaigns(limit = 10, skip = 0) {
    const response = await axiosInstance.get(`${BASE_URL}/admin/laser-campaigns`, {
      params: { limit, skip },
    });
    return response.data;
  },

  /**
   * Get active campaign with all slots and booking details (admin view)
   */
  async getActiveCampaignAdmin() {
    const response = await axiosInstance.get(`${BASE_URL}/admin/laser-campaigns/active`);
    return response.data;
  },

  /**
   * Get specific campaign with slots
   */
  async getCampaignDetail(campaignId) {
    const response = await axiosInstance.get(`${BASE_URL}/admin/laser-campaigns/${campaignId}`);
    return response.data;
  },

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updates) {
    const response = await axiosInstance.patch(
      `${BASE_URL}/admin/laser-campaigns/${campaignId}`,
      updates
    );
    return response.data;
  },

  /**
   * Bulk-generate slots for campaign
   * @param {string} campaignId
   * @param {string[]} days - ISO date strings (YYYY-MM-DD)
   * @param {string} startTime - HH:MM format
   * @param {string} endTime - HH:MM format
   */
  async addBulkSlots(campaignId, days, startTime, endTime) {
    const response = await axiosInstance.post(
      `${BASE_URL}/admin/laser-campaigns/${campaignId}/slots/bulk`,
      {
        days,
        start_time: startTime,
        end_time: endTime,
      }
    );
    return response.data;
  },

  /**
   * Delete a slot (only if unbooked)
   */
  async deleteSlot(campaignId, slotId) {
    const response = await axiosInstance.delete(
      `${BASE_URL}/admin/laser-campaigns/${campaignId}/slots/${slotId}`
    );
    return response.data;
  },

  /**
   * Get all waitlisted customers
   */
  async getWaitlist() {
    const response = await axiosInstance.get(`${BASE_URL}/admin/laser-campaigns/waitlist`);
    return response.data;
  },

  // ========== Public/Customer endpoints ==========

  /**
   * Get basic info about active campaign (no slot details) - for customers before payment
   * Throws 404 if no active campaign
   */
  async getActiveCampaign() {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/active`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No active campaign
      }
      throw error;
    }
  },

  /**
   * Get available slot start times for a given duration
   * @param {number} durationMinutes
   * @returns {datetime[]} list of available start times
   */
  async getAvailableSlots(durationMinutes) {
    const response = await axiosInstance.get(`${BASE_URL}/active/slots`, {
      params: { duration_minutes: durationMinutes },
    });
    return response.data.slots;
  },

  /**
   * Join the waitlist (auth required)
   */
  async joinWaitlist() {
    const response = await axiosInstance.post(`${BASE_URL}/waitlist`, {});
    return response.data;
  },

  /**
   * Check if current user is on waitlist
   */
  async checkWaitlistStatus() {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/waitlist/me`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null; // Not authenticated
      }
      throw error;
    }
  },
};

export default laserCampaignService;
