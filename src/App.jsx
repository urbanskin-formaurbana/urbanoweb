import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Snackbar } from '@mui/material'
import AppRoutes from './router/routes.jsx'

// Load MercadoPago SDK with public key
const mpPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
const mpScript = document.createElement('script')
mpScript.src = `https://sdk.mercadopago.com/js/v2?publicKey=${mpPublicKey}`
mpScript.async = true

mpScript.onload = () => {
  // Instantiate MercadoPago - it's a class!
  if (window.MercadoPago) {
    window.mp = new window.MercadoPago(mpPublicKey, { locale: 'es-UY' })
  }
}

mpScript.onerror = () => {
  console.error('Failed to load MercadoPago SDK')
}

document.head.appendChild(mpScript)

export default function App() {
  const navigate = useNavigate()
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    // Listen for forced logout due to token expiration or invalid token
    const handleLogout = () => {
      setSessionExpired(true)
      navigate('/')
    }

    // Listen for employee login to redirect to admin panel
    const handleEmployeeLogin = () => {
      navigate('/admin')
    }

    window.addEventListener('auth:logout', handleLogout)
    window.addEventListener('auth:employee_login', handleEmployeeLogin)
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
      window.removeEventListener('auth:employee_login', handleEmployeeLogin)
    }
  }, [navigate])

  return (
    <>
      <AppRoutes />
      <Snackbar
        open={sessionExpired}
        autoHideDuration={3000}
        onClose={() => setSessionExpired(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          Tu sesión ha expirado. Por favor inicia sesión nuevamente.
        </Alert>
      </Snackbar>
    </>
  )
}