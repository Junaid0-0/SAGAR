import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { geminiBackendPlugin } from './server/geminiPlugin'

// https://vite.dev/config/
// Reload trigger for SAGAR AI Gemini Plugin
export default defineConfig({
  plugins: [react(), geminiBackendPlugin()],
  server: {
    port: 3000,
    host: true,
    open: false
  }
})

