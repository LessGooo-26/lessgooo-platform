import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  base: process.env.PAGES_BUILD === '1' ? '/lessgooo-platform/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src/campus', import.meta.url)) } },
  server: { host: '127.0.0.1', proxy: { '/api': { target: 'http://127.0.0.1:4174', changeOrigin: true } } },
  build: { rollupOptions: { input: { website: 'index.html', campus: 'campus.html' } } },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', exclude: [...configDefaults.exclude, '.reference-*/**', '.local-data/**', 'dist/**'] },
})
