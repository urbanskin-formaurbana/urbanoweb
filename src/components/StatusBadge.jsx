// src/components/StatusBadge.jsx
// Muestra entorno, rama y commit corto obtenidos desde /api/health.
// Pensado para ver rápidamente qué build está desplegado.

import { useEffect, useState } from 'react'

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
      gap: 8,
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 12,
      border: '1px solid #ddd',
      background: '#fff'
    },
    dot: (color) => ({
      width: 8, height: 8, borderRadius: 999, background: color
    }),
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
  }

  if (err) {
    return (
      <span style={styles.base} title={err}>
        <span style={styles.dot('#999')} />
        <span>Error status</span>
      </span>
    )
  }
  if (!data) {
    return (
      <span style={styles.base}>
        <span style={styles.dot('#bbb')} />
        <span>Cargando…</span>
      </span>
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
    <span style={styles.base} title={data.deployedAt}>
      <span style={styles.dot(color)} />
      <span>{env}</span>
      <span>•</span>
      <span style={styles.mono}>{branch}</span>
      <span>@</span>
      {commitUrl ? (
        <a href={commitUrl} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
          <span style={styles.mono}>{commit}</span>
        </a>
      ) : (
        <span style={styles.mono}>{commit}</span>
      )}
    </span>
  )
}
