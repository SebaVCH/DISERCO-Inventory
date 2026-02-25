import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/primereact') || id.includes('node_modules/primeicons')) {
            return 'vendor-ui'
          }
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/axios')) {
            return 'vendor-query'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/zustand')) {
            return 'vendor-state'
          }
        },
      },
    },
  },
})
