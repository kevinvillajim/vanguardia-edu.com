import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
  plugins: [
    react({
      // Enable Fast Refresh in development
      fastRefresh: isDevelopment,
      // Optimize React production builds
      babel: {
        plugins: isProduction ? [
          ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
        ] : []
      }
    }),
    
    // Gzip compression for production
    isProduction && compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    
    // Brotli compression for production
    isProduction && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    
    // Bundle analyzer
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts-vendor';
            }
            if (id.includes('axios') || id.includes('api')) {
              return 'api-vendor';
            }
            // Other large libraries
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('src/features/courses/components/DynamicCourse')) {
            return 'dynamic-course';
          }
          if (id.includes('src/features/courses/components/TeacherCourseBuilder')) {
            return 'course-builder';
          }
          if (id.includes('src/features/teacher')) {
            return 'teacher-features';
          }
          if (id.includes('src/features/admin')) {
            return 'admin-features';
          }
          if (id.includes('src/features/dashboard')) {
            return 'dashboard-features';
          }
          if (id.includes('src/features/categories')) {
            return 'category-features';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
          if (id.includes('src/shared/cache')) {
            return 'cache-system';
          }
          if (id.includes('src/shared/monitoring')) {
            return 'monitoring-system';
          }
          if (id.includes('src/shared/security')) {
            return 'security-system';
          }
          if (id.includes('src/shared/workers')) {
            return 'worker-system';
          }
          if (id.includes('src/shared/offline')) {
            return 'offline-system';
          }
          if (id.includes('src/shared/performance')) {
            return 'performance-system';
          }
        }
      }
    },
    // Increase chunk size warning limit for large educational content
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for debugging if needed
    sourcemap: isDevelopment ? true : false,
    
    // Minification settings
    minify: isProduction ? 'terser' : false,
    terserOptions: isProduction ? {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        properties: {
          regex: /^_/ // Mangle private properties
        }
      },
      format: {
        comments: false // Remove all comments
      }
    } : {},
    
    // Target modern browsers for better optimization
    target: isProduction ? 'es2020' : 'modules',
    
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: isProduction
  },
  
  // Development server config
  server: {
    port: 5173,
    open: true,
    host: true, // Listen on all addresses
    cors: true,
    // Proxy API requests in development
    proxy: {
      '/api': {
        target: env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    },
    // Enable HMR optimizations
    hmr: {
      overlay: true
    }
  },
  
  // Preview server config
  preview: {
    port: 4173
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: isDevelopment,
    __PROD__: isProduction
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'framer-motion'
    ],
    exclude: [
      // Exclude large dev dependencies
      '@types/react',
      '@types/react-dom'
    ]
  },
  
  // Performance optimizations
  esbuild: {
    // Drop console.log in production
    drop: isProduction ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true,
    // Legal comments handling
    legalComments: isProduction ? 'none' : 'eof'
  },
  
  // Experimental features
  experimental: {
    // Enable build optimizations
    renderBuiltUrl: (filename) => {
      return isProduction ? `https://cdn.vanguardia.com/${filename}` : `/${filename}`
    }
  }
  
  }
})