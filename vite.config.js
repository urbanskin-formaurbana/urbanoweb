import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Make the dev server reachable from outside the container
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    // Improve file watching reliability over bind mounts
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: process.env.CHOKIDAR_INTERVAL ? Number(process.env.CHOKIDAR_INTERVAL) : undefined,
    },
    // Ensure HMR client connects correctly when forwarded
    hmr: {
      clientPort: Number(process.env.HMR_CLIENT_PORT || process.env.PORT || 5173),
    },
  },
})
