import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 61146,
    proxy: {
      '/api': {
        target: 'http://localhost:61145',
        changeOrigin: true
      }
    }
  }
})

