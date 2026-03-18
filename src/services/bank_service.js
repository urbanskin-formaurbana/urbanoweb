/**
 * Bank Settings Service
 * Handles bank details CRUD operations
 */

import { apiCall } from './api';

async function getBankDetails() {
  return await apiCall('/bank-settings');
}

async function updateBankDetails(details) {
  return await apiCall('/bank-settings', {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

export default { getBankDetails, updateBankDetails };
