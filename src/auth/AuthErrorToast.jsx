import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'
import { AUTH_NOTICE_EVENT, consumeStoredAuthNotice } from './notifyAuth'

export default function AuthErrorToast() {
  const location = useLocation()
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const stored = consumeStoredAuthNotice()
    if (stored) setNotice(stored)
  }, [location.pathname])

  useEffect(() => {
    function handle(e) {
      // The dispatching site also writes to sessionStorage so a redirect can carry
      // the notice across mounts; clear it here so the next location change doesn't
      // re-trigger the same notice we're about to show.
      consumeStoredAuthNotice()
      setNotice(e.detail)
    }
    window.addEventListener(AUTH_NOTICE_EVENT, handle)
    return () => window.removeEventListener(AUTH_NOTICE_EVENT, handle)
  }, [])

  return (
    <Snackbar
      open={notice !== null}
      autoHideDuration={6000}
      onClose={() => setNotice(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={notice?.severity ?? 'error'}
        onClose={() => setNotice(null)}
        sx={{ width: '100%' }}
      >
        {notice?.message}
      </Alert>
    </Snackbar>
  )
}
