// vite.config.js
export default {
  base: '/hora-prakash/',
  build: { outDir: 'dist' },
  optimizeDeps: {
    exclude: ['swisseph-wasm'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
}
