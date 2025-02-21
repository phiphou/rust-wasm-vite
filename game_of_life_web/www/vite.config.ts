import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), tailwindcss()],

  // Below is set according to https://github.com/Menci/vite-plugin-wasm#usage
  // to support top-level `await`s
  build: {
    target: 'esnext'
  },

  // For deployment to GH pages
  // https://vitejs.dev/guide/static-deploy.html#github-pages
  base: '/rust-wasm-vite/'
})
