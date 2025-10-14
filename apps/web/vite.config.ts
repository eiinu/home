import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true
  },
  optimizeDeps: {
    exclude: ['@eiinu/editor', '@eiinu/tools', '@eiinu/creative']
  },
  server: {
    fs: {
      // 允许访问整个工作区
      allow: [resolve(__dirname, '../../')]
    }
  }
})
