import { lazy } from 'react';

// Simple lazy loading with error boundaries built into React.lazy
const createLazyComponent = (importFn: () => Promise<any>) => {
  return lazy(() => 
    importFn().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a minimal error component
      return {
        default: () => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la página</h3>
              <p className="text-gray-600 mb-4">Ha ocurrido un error al cargar este componente.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      };
    })
  );
};

// Public pages
export const HomePage = createLazyComponent(() => import('../../pages/public/Home/ModernHome'));
export const PublicCoursesPage = createLazyComponent(() => import('../../pages/public/Cursos/Cursos'));

// Auth feature lazy components
export const LoginPage = createLazyComponent(() => import('../../features/auth/pages/LoginPage'));
export const RegisterPage = createLazyComponent(() => import('../../features/auth/pages/RegisterPage'));
export const ForgotPasswordPage = createLazyComponent(() => import('../../features/auth/pages/ForgotPasswordPage'));

// Dashboard feature lazy components
export const DashboardPage = createLazyComponent(() => import('../../features/dashboard/pages/DashboardPage'));
export const AnalyticsPage = createLazyComponent(() => import('../../features/dashboard/pages/AnalyticsPage'));

// Courses feature lazy components
export const CoursesCatalogPage = createLazyComponent(() => import('../../features/courses/pages/CoursesCatalogPage'));
export const CourseDetailPage = createLazyComponent(() => import('../../features/courses/pages/CourseDetailPage'));

export const CreateCoursePage = createLazyComponent(() => import('../../features/courses/pages/CreateCoursePage'));
export const LessonViewPage = createLazyComponent(() => import('../../features/courses/pages/LessonViewPage'));

// Teacher feature lazy components
export const TeacherDashboardPage = createLazyComponent(() => import('../../features/teacher/pages/TeacherDashboardPage'));

// Profile feature lazy components
export const ProfilePage = createLazyComponent(() => import('../../features/profile/pages/ProfilePage'));
export const SettingsPage = createLazyComponent(() => import('../../features/profile/pages/SettingsPage'));

// Admin feature lazy components
export const AdminDashboardPage = createLazyComponent(() => import('../../features/admin/pages/AdminDashboardPage'));
export const UsersManagementPage = createLazyComponent(() => import('../../features/admin/pages/UsersManagementPage'));
export const SystemSettingsPage = createLazyComponent(() => import('../../features/admin/pages/SystemSettingsPage'));

// Reports feature lazy components
export const ReportsPage = createLazyComponent(() => import('../../features/reports/pages/ReportsPage'));
export const SecurityReportsPage = createLazyComponent(() => import('../../features/reports/pages/SecurityReportsPage'));

// Notifications feature lazy components
export const NotificationsPage = createLazyComponent(() => import('../../features/notifications/pages/NotificationsPage'));

// Error pages
export const NotFoundPage = createLazyComponent(() => import('../../shared/pages/NotFoundPage'));
export const UnauthorizedPage = createLazyComponent(() => import('../../shared/pages/UnauthorizedPage'));
export const ServerErrorPage = createLazyComponent(() => import('../../shared/pages/ServerErrorPage'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard, login and home as they are frequently accessed
  import('../../features/dashboard/pages/DashboardPage');
  import('../../features/auth/pages/LoginPage');
  import('../../pages/public/Home/ModernHome');
};