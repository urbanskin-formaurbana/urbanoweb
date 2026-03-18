import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import { BusinessProvider } from './contexts/BusinessContext'

// Suppress harmless MercadoPago SDK warnings
const originalWarn = console.warn
console.warn = function(...args) {
  const fullMessage = args.map(arg => arg?.toString?.() || '').join(' ')
  if (
    fullMessage.includes('Cross-Origin-Opener-Policy') ||
    fullMessage.includes('onboarding_credits') ||
    fullMessage.includes('[BRICKS]')
  ) {
    return // Silently ignore these warnings
  }
  originalWarn.apply(console, args)
}

// Suppress 401 errors from Sentry's fetch instrumentation - auth flow handles these cleanly
const originalError = console.error
console.error = function(...args) {
  const message = args[0]?.toString?.() || ''
  if (message.includes('401')) {
    return // Silently ignore expired session 401 errors (handled by api.js & ProtectedAdminRoute)
  }
  originalError.apply(console, args)
}

// Initialize Sentry as early as possible
Sentry.init({
  dsn: "https://f23211fabd9b8828c17eafa356ff74c8@o4510857085386752.ingest.us.sentry.io/4510910936776704",
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  beforeSend: (event) => {
    // Filter out harmless MercadoPago SDK warnings
    if (event.message?.includes('Cross-Origin-Opener-Policy')) {
      return null;
    }
    if (event.message?.includes('Attempting to use "onMessage"')) {
      return null;
    }
    return event;
  },
})

const theme = createTheme()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
