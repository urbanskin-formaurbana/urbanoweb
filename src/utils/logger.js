/**
 * Frontend Logger - sends production errors to backend
 * In development: prints to console normally
 * In production: sends error/warn to backend via /api/v1/logs
 */

import { apiCall } from '../services/api';

const isDev = import.meta.env.DEV;

/**
 * Send logs to backend (fire-and-forget)
 */
async function sendToBackend(level, message, extra) {
  try {
    await apiCall('/logs', 'POST', {
      level,
      message,
      extra: extra?.toString?.() || extra,
      url: window.location.href,
    }, { suppressErrorLog: true });
  } catch (_) {
    // Silently ignore log send failures
  }
}

const logger = {
  debug: (msg, ...args) => {
    if (isDev) console.debug(msg, ...args);
  },

  info: (msg, ...args) => {
    if (isDev) console.info(msg, ...args);
  },

  warn: (msg, ...args) => {
    if (isDev) {
      console.warn(msg, ...args);
    } else {
      sendToBackend('warning', msg, args[0]);
    }
  },

  error: (msg, err) => {
    if (isDev) {
      console.error(msg, err);
    } else {
      const errorMsg = err?.message || String(err);
      sendToBackend('error', msg, errorMsg);
    }
  },
};

export default logger;
