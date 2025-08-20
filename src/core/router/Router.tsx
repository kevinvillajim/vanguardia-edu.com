import React, { useEffect, useRef, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../shared/components/Layout/Layout';
import { PublicLayout } from '../../shared/components/Layout/PublicLayout';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { UserRole } from '../types';
import { 
  HomePage,
  PublicCoursesPage,
  AboutPage,
  ContactPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  DashboardPage,
  AnalyticsPage,
  MyCoursesPage,
  CourseDetailPage,
  CreateCoursePage,
  CourseStudentsPage,
  LessonViewPage,
  TeacherDashboardPage,
  TeacherCoursesPage,
  ProfilePage,
  SettingsPage,
  StudentCertificatesPage,
  CourseGradesPage,
  AdminDashboardPage,
  UsersManagementPage,
  SystemSettingsPage,
  ReportsPage,
  NotificationsPage,
  NotFoundPage,
  UnauthorizedPage,
  ServerErrorPage,
  preloadCriticalComponents
} from './lazyComponents';

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  const { isAuthenticated, user, checkAuthStatus, isLoading } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez al montar
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkAuthStatus();
      preloadCriticalComponents();
    }
  }, []); // Array vacío para ejecutar solo una vez

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes with PublicLayout */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/home" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/cursos" element={<PublicLayout><PublicCoursesPage /></PublicLayout>} />
          <Route path="/acerca-de" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />
          
          {/* Auth routes without layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Error pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  {/* Student Routes - /user/* */}
                  <Route
                    path="/user/*"
                    element={
                      <RoleGuard allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route path="/cursos" element={<MyCoursesPage />} />
                          <Route path="/cursos/:id" element={<CourseDetailPage />} />
                          <Route path="/cursos/:id/leccion/:lessonId" element={<LessonViewPage />} />
                          <Route path="/calificaciones" element={<CourseGradesPage />} />
                          <Route path="/certificaciones" element={<StudentCertificatesPage />} />
                          <Route path="/perfil" element={<ProfilePage />} />
                          <Route path="/configuracion" element={<SettingsPage />} />
                        </Routes>
                      </RoleGuard>
                    }
                  />

                  {/* Teacher Routes - /profesor/* */}
                  <Route
                    path="/profesor/*"
                    element={
                      <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/profesor/dashboard" replace />} />
                          <Route path="/dashboard" element={<TeacherDashboardPage />} />
                          <Route path="/cursos" element={<TeacherCoursesPage />} />
                          <Route path="/cursos/crear" element={<CreateCoursePage />} />
                          <Route path="/cursos/:id/editar" element={<CreateCoursePage />} />
                          <Route path="/cursos/:id/estudiantes" element={<CourseStudentsPage />} />
                          <Route path="/calificaciones" element={<ReportsPage />} />
                          <Route path="/reportes" element={<ReportsPage />} />
                          <Route path="/perfil" element={<ProfilePage />} />
                          <Route path="/configuracion" element={<SettingsPage />} />
                        </Routes>
                      </RoleGuard>
                    }
                  />

                  {/* Admin Routes - /admin/* */}
                  <Route
                    path="/admin/*"
                    element={
                      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/admin/control" replace />} />
                          <Route path="/control" element={<AdminDashboardPage />} />
                          <Route path="/usuarios" element={<UsersManagementPage />} />
                          <Route path="/cursos" element={<TeacherCoursesPage />} />
                          <Route path="/configuracion" element={<SystemSettingsPage />} />
                          <Route path="/reportes" element={<ReportsPage />} />
                          <Route path="/certificaciones" element={<SystemSettingsPage />} />
                        </Routes>
                      </RoleGuard>
                    }
                  />

                  {/* Legacy routes redirect */}
                  <Route path="/dashboard" element={
                    user?.role === UserRole.STUDENT ? <Navigate to="/user/dashboard" /> :
                    user?.role === UserRole.TEACHER ? <Navigate to="/profesor/dashboard" /> :
                    user?.role === UserRole.ADMIN ? <Navigate to="/admin/control" /> :
                    <Navigate to="/login" />
                  } />
                  
                  <Route path="/courses" element={
                    user?.role === UserRole.STUDENT ? <Navigate to="/user/cursos" /> :
                    user?.role === UserRole.TEACHER ? <Navigate to="/profesor/cursos" /> :
                    <Navigate to="/admin/cursos" />
                  } />

                  {/* Common routes */}
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* 404 for protected routes */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />

          {/* 404 for public routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;