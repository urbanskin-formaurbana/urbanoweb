// api/health.js
// Endpoint de salud para monitoreo básico y metadatos de despliegue.
// Responde con JSON y NO se cachea, útil para checks externos.
/* eslint-env node */
/* global process */

export default function handler(req, res) {
  const payload = {
    status: 'ok',
    env: process.env.VERCEL_ENV || 'local',                 // production | preview | development
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,      // rama git
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,      // SHA del commit
    deployedAt: new Date().toISOString()
  };

  res.setHeader('Cache-Control', 'no-store');               // evitar respuestas obsoletas
  res.status(200).json(payload);
}
