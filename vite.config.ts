import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
          if (id.includes('src/services')) {
            return 'services';
          }
        }
      }
    },
    // Increase chunk size warning limit for large educational content
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for debugging if needed
    sourcemap: false,
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  
  // Development server config
  server: {
    port: 5173,
    open: true
  },
  
  // Preview server config
  preview: {
    port: 4173
  }
})