/**
 * API Service - Base API Call Function
 * Centralized fetch helper for all backend API calls
 * Uses VITE_API_URL from environment variables
 * Includes cold-start queue for backend wake-up
 */

import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8443/api/v1';

// Cold-start queue state
let backendReady = sessionStorage.getItem('backend_warmed') === '1';
const pendingQueue = [];

/**
 * Execute a single API call without queuing
 * @private
 */
async function rawApiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const { suppressErrorLog, ...fetchOptions } = options;

  const config = {
    method: fetchOptions.method || 'GET',
    headers: { ...defaultHeaders, ...fetchOptions.headers },
    ...fetchOptions,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 - token expired or invalid, force re-login
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_method');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      const err = new Error('Session expired - please log in again');
      err._silent = true;
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      const detail = Array.isArray(error.detail)
        ? error.detail.map(e => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`).join('; ')
        : error.detail;
      throw new Error(detail || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (!suppressErrorLog && !error._silent) {
      logger.error(`API Error [${endpoint}]`, error);
    }
    throw error;
  }
}

/**
 * Main API call function with cold-start queue support
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, body, headers, suppressErrorLog)
 * @returns {Promise<object>} - JSON response
 */
export async function apiCall(endpoint, options = {}) {
  if (!backendReady) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject, endpoint, options });
    });
  }

  return rawApiCall(endpoint, options);
}

/**
 * Check backend health (bypasses queue)
 * @returns {Promise<boolean>} - true if backend is healthy
 */
export async function checkHealth() {
  try {
    const healthUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/api/health';
    const response = await fetch(healthUrl, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Drain the pending API call queue after backend is ready
 * @returns {Promise<void>}
 */
export async function setBackendReady() {
  backendReady = true;
  sessionStorage.setItem('backend_warmed', '1');

  const queuedCalls = pendingQueue.splice(0, pendingQueue.length);

  const promises = queuedCalls.map(({ resolve, reject, endpoint, options }) => {
    return rawApiCall(endpoint, options)
      .then(resolve)
      .catch(reject);
  });

  return Promise.allSettled(promises);
}

export default apiCall;
