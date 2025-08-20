import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../ui/Notification/NotificationContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useReducedMotion } from '../../hooks/useAccessibility';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const prefersReducedMotion = useReducedMotion();

  const sidebarVariants = prefersReducedMotion ? {} : {
    hidden: { x: -300 },
    visible: { x: 0 },
    exit: { x: -300 }
  };

  const contentVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const overlayVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile/Tablet Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (isMobile || isTablet) && (
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 z-50 ${
                isMobile ? 'w-72' : 'w-64'
              }`}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        {isDesktop && (
          <div className="flex flex-shrink-0">
            <div className="w-64">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className={`${isMobile ? 'py-4' : 'py-6'}`}>
              <div className={`max-w-7xl mx-auto ${
                isMobile ? 'px-2' : 
                isTablet ? 'px-4' : 
                'px-4 sm:px-6 md:px-8'
              }`}>
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </div>
          </main>
        </div>

        {/* Sidebar overlay for mobile/tablet */}
        <AnimatePresence>
          {sidebarOpen && (isMobile || isTablet) && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSidebarOpen(false);
                }
              }}
              aria-label="Cerrar menú lateral"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Global notifications */}
      <div className={`${isMobile ? 'px-2' : 'px-4'}`}>
        <NotificationContainer />
      </div>
    </div>
  );
};

export default Layout;