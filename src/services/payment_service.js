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

  // ========== Transfer Comprobante Upload ==========

  /**
   * Upload bank transfer receipt (comprobante)
   * @param {string} appointmentId - Appointment ID
   * @param {File} file - Receipt file (image or PDF, max 5MB)
   * @returns {Promise<object>} - { payment_id, status, message }
   */
  async uploadTransferComprobante(appointmentId, file) {
    const formData = new FormData();
    formData.append('appointment_id', appointmentId);
    formData.append('file', file);

    return apiCall('/payments/transfer/comprobante', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type; fetch will set it with boundary
    });
  },

  // ========== Deposit Payment ==========

  /**
   * Create $500 deposit payment for campaign treatment
   * @param {object} data - { token, payment_method_id, installments, payer_email, treatment_id, full_amount }
   * @returns {Promise<object>} - { payment_id, amount, full_amount, remaining, checkout_url, status }
   */
  async createDepositPayment(data) {
    return apiCall('/payments/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ========== Admin: Payment Management ==========

  /**
   * Get pending transfer payments awaiting admin confirmation
   * @returns {Promise<object>} - { transfers: [...], total }
   */
  async getPendingTransfers() {
    return apiCall('/payments/?status=pending&method=transferencia', {
      method: 'GET',
    });
  },

  /**
   * Confirm payment for appointment (efectivo, transferencia, o posnet)
   * @param {string} appointmentId - Appointment ID
   * @param {object} data - { method: 'efectivo'|'transferencia'|'posnet', amount }
   * @returns {Promise<object>} - { payment_id, appointment_id, method, amount, status }
   */
  async confirmAppointmentPayment(appointmentId, data) {
    return apiCall(`/payments/admin/appointment/${appointmentId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Confirm transfer payment after reviewing comprobante
   * @param {string} paymentId - Payment ID
   * @returns {Promise<object>} - { payment_id, status, message }
   */
  async confirmTransferPayment(paymentId) {
    return apiCall(`/payments/admin/${paymentId}/confirm-transfer`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  /**
   * Get deposits awaiting remainder payment
   * @deprecated Use listPayments({ needs_attention: true }) instead.
   * @returns {Promise<object>} - { deposits: [...], total }
   */
  async getPendingDeposits() {
    return apiCall('/payments/admin/deposits', {
      method: 'GET',
    });
  },

  /**
   * Record an appointment payment (cash, transfer, posnet) with optional discount.
   * Works for deposits, cash, transfer, and posnet alike.
   * @param {string} appointmentId
   * @param {object} data - { method, amount, discount? }
   * @returns {Promise<object>} - { payment_id, appointment_id, amount, discount_applied, paid_amount, remaining_amount, method, status }
   */
  async addAppointmentPayment(appointmentId, data) {
    const payload = {
      method: data.method,
      amount: Number(data.amount) || 0,
      discount: Number(data.discount) || 0,
    };
    return apiCall(`/payments/admin/${appointmentId}/add-deposit-remainder`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Legacy alias kept for callers that haven't migrated yet.
  async addDepositRemainder(appointmentId, data) {
    return this.addAppointmentPayment(appointmentId, data);
  },

  /**
   * Create a payment intent (before scheduling)
   * @param {object} data - { treatmentId, treatmentName, amount, paymentMethod }
   * @returns {Promise<object>} - { payment_id, amount, payment_method }
   */
  async createPaymentIntent(data) {
    // Convert camelCase to snake_case for backend
    const payload = {
      treatment_id: data.treatmentId,
      treatment_name: data.treatmentName,
      amount: data.amount,
      payment_method: data.paymentMethod,
    };
    return apiCall('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get pending payment intents (unscheduled)
   * @returns {Promise<object>} - { intents: [...] }
   */
  async getPendingIntents() {
    return apiCall('/payments/intents', {
      method: 'GET',
    });
  },

  /**
   * Upload comprobante to a payment intent
   * @param {string} paymentId - Payment intent ID
   * @param {File} file - Receipt file
   * @returns {Promise<object>} - { payment_id, status, message }
   */
  async uploadComprobanteToIntent(paymentId, file) {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token for Authorization header
    const token = localStorage.getItem('access_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/transfer/comprobante?payment_id=${paymentId}`, {
      method: 'POST',
      headers,
      body: formData,
      // Don't set Content-Type; let browser set it with multipart/form-data boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload comprobante to intent');
    }

    return response.json();
  },

  /**
   * Link a payment intent to an appointment (after scheduling)
   * @param {string} paymentId - Payment intent ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - { status, payment_id, appointment_id }
   */
  async linkIntentToAppointment(paymentId, appointmentId) {
    return apiCall(`/payments/${paymentId}/link-appointment`, {
      method: 'PATCH',
      body: JSON.stringify({ appointment_id: appointmentId }),
    });
  },

  /**
   * Get all transfer payments with receipts (admin only)
   * @deprecated Use listPayments({ needs_attention: true }) instead.
   * @returns {Promise<object>} - { transfers: [...], total }
   */
  async getTransfersWithReceipt() {
    return apiCall('/payments/admin/transfers', {
      method: 'GET',
    });
  },

  /**
   * Unified admin payment ledger with filtering and pagination.
   * @param {object} params - { status, method, date_from, date_to, customer_search,
   *   has_comprobante, is_deposit, needs_attention, limit, skip, sort_by }
   * @returns {Promise<object>} - { items: [...], total, has_more }
   */
  async listPayments(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    return apiCall(`/payments/admin/list?${qs.toString()}`, { method: 'GET' });
  },

  /**
   * Full payment timeline for a single appointment.
   * @param {string} appointmentId
   * @returns {Promise<object>} - { appointment, payments, summary }
   */
  async getAppointmentPaymentHistory(appointmentId) {
    return apiCall(`/payments/admin/appointment/${appointmentId}/history`, { method: 'GET' });
  },

  /**
   * Hard-delete a payment record (admin only). Irreversible.
   * @param {string} paymentId
   * @returns {Promise<object>} - { success, deleted_id }
   */
  async deletePayment(paymentId) {
    return apiCall(`/payments/admin/${paymentId}`, { method: 'DELETE' });
  },

  /**
   * Reject a pending transfer comprobante.
   * @param {string} paymentId
   * @param {object} data - { reason: string }
   * @returns {Promise<object>}
   */
  async rejectTransfer(paymentId, data) {
    return apiCall(`/payments/admin/${paymentId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get payment by appointment ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - Payment details { id, amount, payment_method, status, paid_at }
   */
  async getPaymentByAppointment(appointmentId) {
    return apiCall(`/payments/by-appointment/${appointmentId}`, {
      method: 'GET',
    });
  },

  /**
   * Cancel/delete a pending payment intent
   * @param {string} paymentId - Payment intent ID
   * @returns {Promise<object>} - Cancellation response { success, message }
   */
  async cancelPaymentIntent(paymentId) {
    return apiCall(`/payments/intent/${paymentId}`, { method: 'DELETE' });
  },
};

export default paymentService;
