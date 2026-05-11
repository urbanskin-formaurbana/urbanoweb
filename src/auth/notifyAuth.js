const STORAGE_KEY = 'fu.authNotice'
const EVENT_NAME = 'auth:notice'

const DEFAULTS = {
  session_expired: {
    message: 'Tu sesión expiró. Por favor iniciá sesión nuevamente.',
    severity: 'warning',
  },
  access_denied: {
    message: 'Tenés que iniciar sesión para acceder a esta sección.',
    severity: 'info',
  },
  admin_only: {
    message: 'Esta sección es solo para personal autorizado.',
    severity: 'info',
  },
  oauth_error: {
    message: 'No pudimos iniciar sesión con Google. Intentá nuevamente.',
    severity: 'error',
  },
}

// UNAUTHORISED fires from SuperTokens and the route guard then fires
// access_denied on the same tick — suppress the follow-up so the user
// sees the real cause instead of a generic "log in" message.
const SUPPRESSED_BY = {
  access_denied: ['session_expired'],
}

const DEDUPE_WINDOW_MS = 1500
let lastNoticeType = null
let lastNoticeAt = 0

export function notifyAuth(type, override = {}) {
  const now = Date.now()
  const blockedBy = SUPPRESSED_BY[type] ?? []
  if (lastNoticeType && blockedBy.includes(lastNoticeType) && now - lastNoticeAt < DEDUPE_WINDOW_MS) {
    return
  }
  lastNoticeType = type
  lastNoticeAt = now

  const defaults = DEFAULTS[type] ?? { message: 'Error de autenticación.', severity: 'error' }
  const payload = {
    type,
    message: override.message ?? defaults.message,
    severity: override.severity ?? defaults.severity,
    detail: override.detail ?? null,
    at: new Date(now).toISOString(),
  }

  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
  try { window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload })) } catch {}
}

export function consumeStoredAuthNotice() {
  let raw
  try { raw = sessionStorage.getItem(STORAGE_KEY) } catch { return null }
  if (!raw) return null
  try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
  try { return JSON.parse(raw) } catch { return null }
}

export const AUTH_NOTICE_EVENT = EVENT_NAME
