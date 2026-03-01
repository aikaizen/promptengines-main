import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/prototypes/flow-education/app/dist/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
