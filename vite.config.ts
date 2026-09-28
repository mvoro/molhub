import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Parallel dev servers can opt into separate dependency caches.
  cacheDir: process.env.AI_HUB_VITE_CACHE_DIR ?? 'node_modules/.vite',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // img-fx brings React in as a peer; one copy for the whole page, or its hooks break.
    dedupe: ['react', 'react-dom'],
  },
  // The file viewer and the picture reveal (img-fx + three) load these lazily; prebundled up front, so
  // the first opened PDF or the first drawn picture doesn't make the dev server re-optimize and reload
  // the page mid-reply.
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth', 'img-fx', 'three'],
  },
})
