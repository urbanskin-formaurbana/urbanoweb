import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Cert paths: Try ../urbanoweb_backend/ first (local dev), then fallback to ./ (Docker)
const certPathBackend = path.join(__dirname, '../urbanoweb_backend/localhost+1.pem')
const certPathLocal = path.join(__dirname, 'localhost+1.pem')
const keyPathBackend = path.join(__dirname, '../urbanoweb_backend/localhost+1-key.pem')
const keyPathLocal = path.join(__dirname, 'localhost+1-key.pem')

const certPath = fs.existsSync(certPathBackend) ? certPathBackend : certPathLocal
const keyPath = fs.existsSync(keyPathBackend) ? keyPathBackend : keyPathLocal

// https://vite.dev/config/
// Custom middleware to add COOP header for MercadoPago compatibility
function coopHeaderMiddleware() {
  return {
    name: 'coop-header-middleware',
    apply: 'serve',
    enforce: 'pre',
    configResolved(config) {
      // Called when the config is resolved
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          // Add COOP header to allow MercadoPago SDK postMessage communication
          res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
          next();
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), coopHeaderMiddleware()],
  server: {
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: process.env.CHOKIDAR_INTERVAL ? Number(process.env.CHOKIDAR_INTERVAL) : undefined,
    },
    allowedHosts: ['localhost', '127.0.0.1'],
  },
})
