import React, { lazy, Suspense, ComponentType } from 'react';

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-lg">Cargando...</p>
    </div>
  </div>
);

// Error component
const ErrorFallback: React.FC = () => (
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
);

// Wrapper component for lazy loaded components
const LazyComponentWrapper: React.FC<{ Component: ComponentType<any>, props?: any }> = ({ Component, props = {} }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Safe lazy loading function
const safeLazy = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = lazy(() => 
    importFn().then(
      module => ({ default: module.default }),
      error => {
        console.error('Failed to load component:', error);
        return { default: ErrorFallback };
      }
    )
  );
  
  return LazyComponent;
};

// Public pages
export const HomePage = safeLazy(() => import('../../pages/public/Home/ModernHome'));
export const PublicCoursesPage = safeLazy(() => import('../../pages/public/Cursos/Cursos'));
export const AboutPage = safeLazy(() => import('../../components/layout/About/About'));
export const ContactPage = safeLazy(() => import('../../pages/public/Contact/Contact'));

// Auth pages
export const LoginPage = safeLazy(() => import('../../features/auth/pages/LoginPage'));
export const RegisterPage = safeLazy(() => import('../../features/auth/pages/RegisterPage'));
export const ForgotPasswordPage = safeLazy(() => import('../../features/auth/pages/ForgotPasswordPage'));

// Dashboard pages
export const DashboardPage = safeLazy(() => import('../../features/dashboard/pages/DashboardPage'));
export const AnalyticsPage = safeLazy(() => import('../../features/dashboard/pages/AnalyticsPage'));

// Courses pages (deprecated - now using specific pages for each context)
export const MyCoursesPage = safeLazy(() => import('../../features/courses/pages/MyCoursesPage'));
export const CourseDetailPage = safeLazy(() => import('../../features/courses/pages/CourseDetailPage'));
export const CreateCoursePage = safeLazy(() => import('../../features/courses/pages/CreateCoursePage'));
export const CourseStudentsPage = safeLazy(() => import('../../features/courses/pages/CourseStudentsPage'));
export const LessonViewPage = safeLazy(() => import('../../features/courses/pages/LessonViewPage'));

// Teacher pages
export const TeacherDashboardPage = safeLazy(() => import('../../features/teacher/pages/TeacherDashboardPage'));
export const TeacherCoursesPage = safeLazy(() => import('../../features/teacher/pages/TeacherCoursesPage'));

// Profile pages
export const ProfilePage = safeLazy(() => import('../../features/profile/pages/ProfilePage'));
export const SettingsPage = safeLazy(() => import('../../features/profile/pages/SettingsPage'));

// Student pages
export const StudentCertificatesPage = safeLazy(() => import('../../pages/student/Certificates/ModernCertificates'));
export const CourseGradesPage = safeLazy(() => import('../../pages/student/CourseGrades/CourseGrades'));

// Admin pages
export const AdminDashboardPage = safeLazy(() => import('../../features/admin/pages/AdminDashboardPage'));
export const UsersManagementPage = safeLazy(() => import('../../features/admin/pages/UsersManagementPage'));
export const SystemSettingsPage = safeLazy(() => import('../../features/admin/pages/SystemSettingsPage'));

// Reports pages
export const ReportsPage = safeLazy(() => import('../../features/reports/pages/ReportsPage'));

// Notifications pages
export const NotificationsPage = safeLazy(() => import('../../features/notifications/pages/NotificationsPage'));

// Error pages
export const NotFoundPage = safeLazy(() => import('../../shared/pages/NotFoundPage'));
export const UnauthorizedPage = safeLazy(() => import('../../shared/pages/UnauthorizedPage'));
export const ServerErrorPage = safeLazy(() => import('../../shared/pages/ServerErrorPage'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload frequently accessed components
  import('../../features/dashboard/pages/DashboardPage').catch(() => {});
  import('../../features/auth/pages/LoginPage').catch(() => {});
  import('../../pages/public/Home/ModernHome').catch(() => {});
};