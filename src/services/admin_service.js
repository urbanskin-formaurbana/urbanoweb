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

  async getAppointmentPayments(appointmentId) {
    return apiCall(`/admin/appointments/${appointmentId}/payments`, { method: 'GET' });
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

  async createMessageTemplate(nameOrPayload, messageArg) {
    const payload =
      typeof nameOrPayload === 'object' && nameOrPayload !== null
        ? {
            name: nameOrPayload.name,
            message: nameOrPayload.message,
            usage_type: nameOrPayload.usage_type,
            product_category: nameOrPayload.product_category,
          }
        : {
            name: nameOrPayload,
            message: messageArg,
          };
    return apiCall('/admin/message-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateMessageTemplate(templateId, nameOrPayload, messageArg) {
    const payload =
      typeof nameOrPayload === 'object' && nameOrPayload !== null
        ? {
            name: nameOrPayload.name,
            message: nameOrPayload.message,
            usage_type: nameOrPayload.usage_type,
            product_category: nameOrPayload.product_category,
          }
        : {
            name: nameOrPayload,
            message: messageArg,
          };
    return apiCall(`/admin/message-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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

  async updateCustomer(customerId, data) {
    return apiCall(`/admin/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  async upsertCategoryConfig(
    category,
    label,
    description,
    isGenderSplit = false,
    imageUrl = null,
    cardDescription = null,
    subtitle = null,
  ) {
    const body = { label, description, is_gender_split: isGenderSplit };
    if (imageUrl) {
      body.image_url = imageUrl;
    }
    if (cardDescription !== null) {
      body.card_description = cardDescription;
    }
    if (subtitle !== null) {
      body.subtitle = subtitle;
    }
    return apiCall(`/category-configs/${category}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // Image uploads
  async uploadTreatmentImage(treatmentId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:8443/api/v1';
    const response = await fetch(`${baseUrl}/admin/treatments/${treatmentId}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Image upload failed');
    }
    return response.json();
  },

  async uploadCategoryImage(category, file, gender = null) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:8443/api/v1';
    const genderParam = gender ? `?gender=${gender}` : '';
    const response = await fetch(`${baseUrl}/category-configs/${category}/image${genderParam}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Image upload failed');
    }
    return response.json();
  },
};

export default adminService;
