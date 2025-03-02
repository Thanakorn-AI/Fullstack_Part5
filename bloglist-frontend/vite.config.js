// bloglist-frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom', // Use jsdom to simulate browser
    globals: true, // No need to import test keywords (describe, test, expect)
    setupFiles: './testSetup.js', // Load test setup
  }
})
