// src/components/StatusBadge.jsx
// Muestra entorno, rama y commit corto obtenidos desde /api/health.
// Pensado para ver rápidamente qué build está desplegado.

import { useEffect, useState } from 'react'
import { Box, Typography, Link } from '@mui/material'

export default function StatusBadge() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (alive) setData(json)
      } catch (e) {
        if (alive) setErr(e.message || 'error')
      }
    })()
    return () => { alive = false }
  }, [])

  const styles = {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      px: 1.25,
      py: 0.75,
      borderRadius: 999,
      fontSize: 12,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper'
    },
    dot: (color) => ({ width: 8, height: 8, borderRadius: 999, bgcolor: color }),
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
  }

  if (err) {
    return (
      <Box sx={styles.base} title={err}>
        <Box sx={styles.dot('#999')} />
        <Typography>Error status</Typography>
      </Box>
    )
  }
  if (!data) {
    return (
      <Box sx={styles.base}>
        <Box sx={styles.dot('#bbb')} />
        <Typography>Cargando…</Typography>
      </Box>
    )
  }

  const env = data.env || 'unknown'
  const branch = data.branch || '—'
  const commit = (data.commit || '').slice(0, 7) || '—'
  const color = env === 'production' ? '#16a34a' : env === 'preview' ? '#7c3aed' : '#6b7280'

  // Si configuras el repo, puedes enlazar el commit:
  const repo = import.meta.env.VITE_REPO_URL // opcional, ej: https://github.com/urbanskin-formaurbana/urbanoweb
  const commitUrl = repo ? `${repo}/commit/${data.commit}` : null

  return (
    <Box sx={styles.base} title={data.deployedAt}>
      <Box sx={styles.dot(color)} />
      <Typography>{env}</Typography>
      <Typography sx={{ mx: 0.5 }}>•</Typography>
      <Typography sx={styles.mono}>{branch}</Typography>
      <Typography>@</Typography>
      {commitUrl ? (
        <Link href={commitUrl} target="_blank" rel="noreferrer" sx={{ ...styles.mono, textDecoration: 'none' }}>
          {commit}
        </Link>
      ) : (
        <Typography sx={styles.mono}>{commit}</Typography>
      )}
    </Box>
  )
}
