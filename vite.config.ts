import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// RAHUL.OS — static single-page build.
// Hash-based routing keeps deep links (e.g. #/projects/sameface) working on any
// static host without server rewrites.
export default defineConfig({
  plugins: [react()],
  // Hosted at a domain root by default. Set VITE_BASE=/repo-name/ when
  // deploying to a subdirectory (for example GitHub Pages project sites).
  base: process.env.VITE_BASE ?? '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // The Arena preview proxies the dev server under a *.e2b.app host, so the
    // allow-list has to stay open for that proxy origin.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    cssTarget: 'chrome100',
    assetsInlineLimit: 2048,
    reportCompressedSize: true,
  },
})
