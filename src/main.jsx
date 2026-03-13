import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'

// Suppress COOP warnings from MercadoPago SDK - they're harmless browser diagnostics
const originalWarn = console.warn
console.warn = function(...args) {
  const message = args[0]?.toString?.() || ''
  if (message.includes('Cross-Origin-Opener-Policy')) {
    return // Silently ignore COOP warnings
  }
  originalWarn.apply(console, args)
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
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
