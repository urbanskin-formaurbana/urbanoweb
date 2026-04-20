import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'
import './styles/landing.css'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import { BusinessProvider } from './contexts/BusinessContext'
import { ColdStartProvider } from './contexts/ColdStartContext'


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

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      dark: '#1f4f29',
      light: '#3b8a3f',
      contrastText: '#fff',
    },
    background: {
      default: '#fafaf7',
      paper: '#ffffff',
    },
    text: {
      primary: '#141414',
      secondary: '#5b5b5b',
    },
    success: { main: '#2e7d32' },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: "'Work Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: 'clamp(32px, 4.2vw, 48px)',
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
    },
    h2: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 600,
      fontSize: 'clamp(26px, 3vw, 36px)',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 600,
      fontSize: '22px',
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 600,
      fontSize: '16px',
    },
    h6: {
      fontFamily: "'Work Sans', system-ui, -apple-system, sans-serif",
      fontWeight: 600,
      fontSize: '14px',
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.45,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.45,
    },
    caption: {
      fontSize: '12px',
      lineHeight: 1.45,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ColdStartProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
          <BrowserRouter>
            <AuthProvider>
              <BusinessProvider>
                <App />
              </BusinessProvider>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ColdStartProvider>
    </ThemeProvider>
  </React.StrictMode>
)
