/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { apiCall } from './api.js';

export const authService = {
  /**
   * Login with Google OAuth token
   * @param {string} idToken - Google ID token from OAuth
   * @returns {Promise<object>} - Access and refresh tokens
   */
  async loginWithGoogle(idToken) {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
  },

  /**
   * Send OTP via WhatsApp
   * @param {string} phone - Phone number (format: 59891234567)
   * @returns {Promise<object>} - OTP sent confirmation
   */
  async sendOTP(phone) {
    return apiCall('/auth/whatsapp/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  /**
   * Verify OTP and authenticate user
   * @param {string} phone - Phone number
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise<object>} - Access and refresh tokens
   */
  async verifyOTP(phone, otpCode) {
    return apiCall('/auth/whatsapp/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp_code: otpCode }),
    });
  },

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
   * Refresh access token using refresh token
   * @returns {Promise<object>} - New access token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Save tokens to localStorage
   * @param {object} response - Auth response with tokens
   */
  saveTokens(response) {
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
  },

  /**
   * Get stored access token
   * @returns {string|null} - Access token or null
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if access token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Logout user (clear tokens)
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
