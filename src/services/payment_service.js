/**
 * Payment Service
 * Handles all payment-related API calls to MercadoPago integration
 */

import { apiCall } from './api.js';

export const paymentService = {
  /**
   * Create a payment preference for Checkout Pro (Wallet Brick)
   * Returns a preference_id that can be used in MercadoPago's hosted checkout
   * @param {object} data - { treatment_id, customer_name, customer_email, customer_phone }
   * @returns {Promise<object>} - { preference_id, init_point, sandbox_init_point }
   */
  async createPaymentPreference(data) {
    return apiCall('/payments/preference', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Process a card payment via Checkout API (Orders)
   * Called after MercadoPago SDK tokenizes the card on the frontend.
   * @param {object} data - { token, payment_method_id, installments, amount, treatment_id, payer_email }
   * @returns {Promise<object>} - { payment_id, status, status_detail }
   */
  async processPayment(data) {
    return apiCall('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID from MercadoPago
   * @returns {Promise<object>} - Payment status and details
   */
  async getPaymentStatus(paymentId) {
    return apiCall(`/payments/${paymentId}`, {
      method: 'GET',
    });
  },

  /**
   * Store payment ID in localStorage
   * @param {string} paymentId - Payment ID to store
   */
  savePaymentId(paymentId) {
    localStorage.setItem('payment_id', paymentId);
  },

  /**
   * Get stored payment ID from localStorage
   * @returns {string|null} - Payment ID or null
   */
  getPaymentId() {
    return localStorage.getItem('payment_id');
  },

  /**
   * Clear payment ID from localStorage (after appointment created)
   */
  clearPaymentId() {
    localStorage.removeItem('payment_id');
  },

  /**
   * Get first completed payment without a linked appointment
   * This detects customers who paid but haven't scheduled yet
   * @returns {Promise<object|null>} - Payment object with _id, or null if none found
   */
  async getUnscheduledPayment() {
    try {
      const response = await apiCall('/payments/?status=completed');
      const payments = response.payments || [];
      return payments.find(p => !p.appointment_id) || null;
    } catch {
      return null; // Fail silently — user can still pay normally
    }
  },
};

export default paymentService;
