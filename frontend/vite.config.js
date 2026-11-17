import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // En GitHub Pages la app vive en /Herramienta-de-desarrollo-biblioteca/:
  // el pipeline de CD define VITE_BASE; en local se queda en la raiz.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
