import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/store';
import { UserRole } from './shared/types';
import { useUserActivity } from './shared/hooks/useUserActivity';
import { logger } from './shared/utils/logger';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/public/HomePage';
import CoursesPage from './pages/public/CoursesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import CreateCoursePage from './pages/teacher/CreateCoursePage';
import EditCoursePage from './pages/teacher/EditCoursePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Layouts
import { PublicLayout } from './shared/layouts';

// Debug Components (only in development)
import ActivityDebugPanel from './components/debug/ActivityDebugPanel';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoute = getDashboardRoute(user.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

// Helper function to get dashboard route based on role
const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.TEACHER:
      return '/teacher/dashboard';
    case UserRole.STUDENT:
      return '/student/dashboard';
    default:
      return '/login';
  }
};

// App Component
const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // 🔍 Inicializar sistema inteligente de actividad y renovación de tokens
  const { isMonitoring, recordActivity } = useUserActivity({
    autoStart: true, // Iniciar automáticamente cuando hay autenticación
    statsUpdateInterval: 30000, // Actualizar estadísticas cada 30 segundos
  });

  // Log del estado del sistema de actividad (solo en debugging)
  React.useEffect(() => {
    if (isAuthenticated) {
      logger.debug('🎯 Activity monitoring status:', {
        isMonitoring,
        userRole: user?.role,
        isAuthenticated
      });
    }
  }, [isMonitoring, isAuthenticated, user?.role]);

  return (
    <Router>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/home" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/cursos" element={<PublicLayout><CoursesPage /></PublicLayout>} />
        <Route path="/acerca-de" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />
        
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute(user!.role)} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute(user!.role)} replace />
            ) : (
              <RegisterPage />
            )
          } 
        />

        {/* Protected Routes - Student */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole={UserRole.STUDENT}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Teacher */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole={UserRole.TEACHER}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute requiredRole={UserRole.TEACHER}>
              <TeacherCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/create"
          element={
            <ProtectedRoute requiredRole={UserRole.TEACHER}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/edit"
          element={
            <ProtectedRoute requiredRole={UserRole.TEACHER}>
              <EditCoursePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <div>Usuarios Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cursos"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <div>Cursos Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <div>Configuración Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <div>Reportes Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={getDashboardRoute(user.role)} replace />
            ) : (
              <PublicLayout><HomePage /></PublicLayout>
            )
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            isAuthenticated && user ? (
              <Navigate to={getDashboardRoute(user.role)} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      
      {/* Panel de debug de actividad (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <ActivityDebugPanel 
          defaultVisible={false}
          position="bottom-right"
        />
      )}
    </Router>
  );
};

export default App;