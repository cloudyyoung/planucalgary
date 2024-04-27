import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@vituum/vite-plugin-tailwindcss'
import postcss from '@vituum/vite-plugin-postcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), postcss()],
})
