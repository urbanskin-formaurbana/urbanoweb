import * as Sentry from '@sentry/react'

// Error tracking
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    tags: context.tags || {},
    level: context.level || 'error',
    extra: context.extra || {},
  })
}

// Performance monitoring for async operations
export const startAsyncSpan = async (operationName, operationType, asyncFn) => {
  return Sentry.startSpan(
    {
      op: operationType,
      name: operationName,
    },
    async () => {
      try {
        const result = await asyncFn()
        return result
      } catch (error) {
        captureError(error, {
          tags: { operation: operationName },
        })
        throw error
      }
    }
  )
}

// API call monitoring
export const captureApiCall = async (method, endpoint, asyncFn) => {
  return startAsyncSpan(
    `${method} ${endpoint}`,
    'http.client',
    asyncFn
  )
}

// Component action monitoring
export const startUISpan = (actionName, callback) => {
  return Sentry.startSpan(
    {
      op: 'ui.action',
      name: actionName,
    },
    callback
  )
}

// Set user context for error tracking
export const setSentryUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    Sentry.setUser(null)
  }
}

// Add breadcrumb for debugging
export const addBreadcrumb = (message, data = {}, level = 'info') => {
  Sentry.addBreadcrumb({
    category: 'custom',
    message,
    level,
    data,
  })
}
