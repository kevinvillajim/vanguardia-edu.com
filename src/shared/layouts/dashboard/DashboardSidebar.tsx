import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../shared/store/authStore';
import { UserRole } from '../../../shared/types';
import { MediaImage } from '../../../shared/components/media/MediaImage';
import classNames from 'classnames';
import ThemeToggle from '../../../components/ui/ThemeToggle';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  roles?: UserRole[];
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isCollapsed);

  useEffect(() => {
    setSidebarOpen(!isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate navigation based on user role
  const getNavigationForRole = (userRole: UserRole): NavItem[] => {
    const baseNavigation: NavItem[] = [
      {
        name: 'Dashboard',
        href: userRole === UserRole.STUDENT ? '/student/dashboard' : 
              userRole === UserRole.TEACHER ? '/teacher/dashboard' : 
              '/admin/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
          </svg>
        ),
      },
      {
        name: userRole === UserRole.STUDENT ? 'Mis Cursos' : 'Cursos',
        href: userRole === UserRole.STUDENT ? '/student/courses' : 
              userRole === UserRole.TEACHER ? '/teacher/courses' : 
              '/admin/cursos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
    ];

    // Student-specific navigation
    if (userRole === UserRole.STUDENT) {
      baseNavigation.push(
        {
          name: 'Progreso',
          href: '/student/progress',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
        {
          name: 'Certificaciones',
          href: '/student/achievements',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        {
          name: 'Perfil',
          href: '/student/profile',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        }
      );
    }

    // Teacher-specific navigation
    if (userRole === UserRole.TEACHER) {
      baseNavigation.push(
        {
          name: 'Crear Curso',
          href: '/teacher/courses/create',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
        },
        {
          name: 'Estudiantes',
          href: '/teacher/students',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
        },
        {
          name: 'Analíticas',
          href: '/teacher/analytics',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: 'Perfil',
          href: '/teacher/profile',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        }
      );
    }

    // Admin-specific navigation
    if (userRole === UserRole.ADMIN) {
      baseNavigation.push(
        {
          name: 'Usuarios',
          href: '/admin/usuarios',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          ),
        },
        {
          name: 'Configuración',
          href: '/admin/configuracion',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          name: 'Reportes',
          href: '/admin/reportes',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        }
      );
    }

    // Common navigation for all authenticated users
    baseNavigation.push(
      {
        name: 'Notificaciones',
        href: userRole === UserRole.STUDENT ? '/student/notifications' : 
              userRole === UserRole.TEACHER ? '/teacher/notifications' : 
              '/admin/notifications',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 20H5a2 2 0 01-2-2V7a2 2 0 012-2h5.5M15 4v6m3-3l-3 3-3-3" />
          </svg>
        ),
        badge: '3',
      }
    );

    return baseNavigation;
  };

  const navigation = getNavigationForRole(user?.role as UserRole);

  const isActive = (href: string) => {
    // Handle dashboard routes for different roles
    if (href.includes('/dashboard')) {
      return location.pathname === href || 
             location.pathname === '/' ||
             (href.includes('/dashboard') && location.pathname === '/dashboard');
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleNavigation = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      // En móvil, cerrar completamente el sidebar
      onClose?.();
    } else if (onToggleCollapse) {
      // En desktop, colapsar/expandir
      onToggleCollapse();
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const sidebarVariants = {
    open: {
      width: "280px", 
      opacity: 1,
      x: 0
    },
    closed: isMobile ? {
      width: "280px", 
      opacity: 1,
      x: "-100%"
    } : {
      width: "80px", 
      opacity: 0.9,
      x: 0
    },
  };

  return (
    <motion.aside
      initial={isMobile ? "closed" : "open"}
      animate={sidebarOpen ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{duration: 0.3, ease: "easeInOut"}}
      className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 ${
        isMobile ? 'z-50' : 'z-40'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <motion.div
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{delay: 0.2}}
            className="flex items-center space-x-3"
          >
            <img src="/logoSimp.png" alt="Logo" className="w-8 h-8" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{opacity: 0, x: -20}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -20}}
                  transition={{duration: 0.2}}
                >
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    VanguardIA
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <MediaImage
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  fallbackStrategy="after-error"
                />
              ) : (
                <span className="text-white font-medium text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{opacity: 0, x: -20}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -20}}
                  transition={{duration: 0.2}}
                  className="flex-1"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === UserRole.ADMIN ? 'Administrador' : 
                     user?.role === UserRole.TEACHER ? 'Profesor' : 'Estudiante'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.href}
                onClick={handleNavigation}
                className={({ isActive: routerIsActive }) =>
                  classNames(
                    'group flex items-center p-3 rounded-xl transition-all duration-200 relative overflow-hidden',
                    sidebarOpen ? 'space-x-3' : 'justify-center',
                    isActive(item.href) || routerIsActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-600/10 dark:from-blue-400/20 dark:to-indigo-500/20 text-blue-700 dark:text-blue-200 shadow-lg backdrop-blur-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-white hover:backdrop-blur-sm'
                  )
                }
              >
                {/* Active indicator - solo mostrar cuando está expandido */}
                {(isActive(item.href)) && sidebarOpen && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <span
                  className={classNames(
                    'flex-shrink-0 transition-all duration-200 w-6 h-6 flex items-center justify-center',
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400 transform scale-110'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:scale-105'
                  )}
                >
                  {item.icon}
                </span>
                
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{opacity: 0, x: -10}}
                      animate={{opacity: 1, x: 0}}
                      exit={{opacity: 0, x: -10}}
                      transition={{duration: 0.2}}
                      className="flex-1 font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {item.badge && sidebarOpen && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className={`flex ${sidebarOpen ? "justify-between" : "flex-col space-y-2"} items-center`}>
            <ThemeToggle className={sidebarOpen ? "" : "w-full justify-center"} />
            <motion.button
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
              onClick={toggleSidebar}
              className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all flex duration-200 backdrop-blur-sm ${
                sidebarOpen ? "" : "w-full justify-center"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"}
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;