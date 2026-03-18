import { apiCall } from './api.js';

const adminService = {
  async getAppointments(status = null) {
    const query = status ? `?status=${status}` : '';
    return apiCall(`/admin/appointments${query}`, { method: 'GET' });
  },

  async confirmAppointment(appointmentId) {
    const result = await apiCall(`/appointments/${appointmentId}/confirm`, { method: 'PATCH' });
    return result;
  },

  async rescheduleAppointment(appointmentId, newScheduledAt) {
    return apiCall(`/admin/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ new_scheduled_at: newScheduledAt }),
    });
  },

  async completeAppointment(appointmentId, feedback) {
    return apiCall(`/appointments/${appointmentId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
  },

  async markNoShow(appointmentId) {
    return apiCall(`/appointments/${appointmentId}/no-show`, {
      method: 'PATCH',
    });
  },

  async updateFeedback(appointmentId, feedback) {
    return apiCall(`/appointments/${appointmentId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
  },

  async getMessageTemplates() {
    return apiCall('/admin/message-templates', { method: 'GET' });
  },

  async createMessageTemplate(name, message) {
    return apiCall('/admin/message-templates', {
      method: 'POST',
      body: JSON.stringify({ name, message }),
    });
  },

  async updateMessageTemplate(templateId, name, message) {
    return apiCall(`/admin/message-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, message }),
    });
  },

  async deleteMessageTemplate(templateId) {
    return apiCall(`/admin/message-templates/${templateId}`, { method: 'DELETE' });
  },

  // ── Treatments ─────────────────────────────────────────────────

  async getTreatments() {
    return apiCall('/admin/treatments', { method: 'GET' });
  },

  async createTreatment(data) {
    return apiCall('/admin/treatments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTreatment(treatmentId, data) {
    return apiCall(`/admin/treatments/${treatmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getTreatmentPackages(treatmentId) {
    return apiCall(`/admin/treatments/${treatmentId}/packages`, { method: 'GET' });
  },

  async createPackage(data) {
    return apiCall('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePackage(packageId, data) {
    return apiCall(`/admin/packages/${packageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deletePackage(packageId) {
    return apiCall(`/admin/packages/${packageId}`, { method: 'DELETE' });
  },

  // ── Socios & Reports ────────────────────────────────────────────

  async getCustomers(status = null, skip = 0, limit = 50) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (skip) query.append('skip', skip);
    if (limit) query.append('limit', limit);
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return apiCall(`/admin/customers${queryStr}`, { method: 'GET' });
  },

  async getCustomerHistory(customerId) {
    return apiCall(`/admin/customers/${customerId}/history`, { method: 'GET' });
  },

  async approveCustomer(customerId) {
    return apiCall(`/admin/customers/${customerId}/approve`, { method: 'PATCH' });
  },

  async getMonthlyReports(months = 6, category = null) {
    const params = new URLSearchParams();
    params.append('months', months);
    if (category) params.append('category', category);
    return apiCall(`/admin/reports/monthly?${params.toString()}`, { method: 'GET' });
  },

  // ── Admin Create Appointment ────────────────────────────────────────

  async createCustomer(data) {
    return apiCall('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createManualPayment(data) {
    return apiCall('/admin/manual-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createAdminAppointment(data) {
    return apiCall('/admin/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Category configs
  async getCategoryConfigs() {
    return apiCall('/category-configs', { method: 'GET' });
  },

  async upsertCategoryConfig(category, label, description, isGenderSplit = false) {
    return apiCall(`/category-configs/${category}`, {
      method: 'PUT',
      body: JSON.stringify({ label, description, is_gender_split: isGenderSplit }),
    });
  },
};

export default adminService;
