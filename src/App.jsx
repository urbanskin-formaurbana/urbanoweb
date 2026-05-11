import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from './router/routes.jsx'
import AuthErrorToast from './auth/AuthErrorToast.jsx'

const mpPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
const mpScript = document.createElement('script')
mpScript.src = `https://sdk.mercadopago.com/js/v2?publicKey=${mpPublicKey}`
mpScript.async = true

mpScript.onload = () => {
  if (window.MercadoPago) {
    window.mp = new window.MercadoPago(mpPublicKey, { locale: 'es-UY' })
  }
}

mpScript.onerror = () => {
}

document.head.appendChild(mpScript)

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleEmployeeLogin = () => {
      navigate('/admin')
    }

    window.addEventListener('auth:employee_login', handleEmployeeLogin)
    return () => {
      window.removeEventListener('auth:employee_login', handleEmployeeLogin)
    }
  }, [navigate])

  return (
    <>
      <AppRoutes />
      <AuthErrorToast />
    </>
  )
}
