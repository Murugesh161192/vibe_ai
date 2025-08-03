import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple SPA fallback plugin for root route
const spaFallbackPlugin = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use('/', (req, res, next) => {
        if (req.url === '/' || req.url === '') {
          // Redirect to index.html for root route
          res.writeHead(302, { 'Location': '/index.html' })
          res.end()
          return
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    port: 5173,
    host: true,
    // Open browser automatically
    open: true,
    // Configure middlewares to handle SPA routing
    middlewareMode: false,
    // Configure to serve index.html for all routes (SPA fallback)
    fs: {
      strict: true,
    }
  },
  // Configure preview server for production builds
  preview: {
    port: 4173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          d3: ['d3']
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.jsx'],
      exclude: [
        'src/test',
        'src/main.jsx',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.js',
      ],
    },
  }
}) 