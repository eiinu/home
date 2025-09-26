import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: resolve(__dirname, 'src'),
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json')
    })
  ],
  optimizeDeps: {
    include: ['@babel/runtime/helpers/extends']
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Creative',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    cssCodeSplit: false
  }
})
