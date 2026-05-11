import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAndUp } from 'supertokens-auth-react/recipe/thirdparty'
import { Box, CircularProgress } from '@mui/material'
import { notifyAuth } from './notifyAuth'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    async function finalize() {
      try {
        const result = await signInAndUp()
        if (result.status === 'OK') {
          const returnPath = sessionStorage.getItem('fu.bookingReturn')
          sessionStorage.removeItem('fu.bookingReturn')
          navigate(returnPath || '/', { replace: true })
        } else {
          throw new Error(result.reason ?? `Status: ${result.status}`)
        }
      } catch (err) {
        notifyAuth('oauth_error', { detail: err?.message ?? null })
        const returnPath = sessionStorage.getItem('fu.bookingReturn')
        sessionStorage.removeItem('fu.bookingReturn')
        navigate(returnPath || '/', { replace: true })
      }
    }

    finalize()
  }, [navigate])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  )
}
