import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'

export default function AuthErrorToast() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('fu.authError')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      setMessage(parsed.message)
      setOpen(true)
    } catch {
      setMessage('Error de autenticación. Intentá nuevamente.')
      setOpen(true)
    } finally {
      sessionStorage.removeItem('fu.authError')
    }
  }, [location.pathname])

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="error" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
