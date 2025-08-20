// src/hooks/useCoursesV2.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { coursesV2Service, StudentCourse, TeacherCourse, CourseDetailView } from '../services/courses/coursesV2Service';

// ============================================================================
// HOOK PARA ESTUDIANTES
// ============================================================================
export const useStudentCourses = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.student.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      console.error('Error fetching student courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  };
};

// ============================================================================
// HOOK PARA VISTA DE CURSO DEL ESTUDIANTE
// ============================================================================
export const useStudentCourseView = (courseId: number | null) => {
  const [courseView, setCourseView] = useState<CourseDetailView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseView = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.student.getCourseView(courseId);
      setCourseView(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar vista del curso');
      console.error('Error fetching course view:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const completeComponent = useCallback(async (componentId: number) => {
    if (!courseId) return;

    try {
      await coursesV2Service.student.completeComponent(courseId, componentId);
      // Refrescar la vista del curso
      await fetchCourseView();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar componente');
      console.error('Error completing component:', err);
    }
  }, [courseId, fetchCourseView]);

  const startQuiz = useCallback(async (quizId: number) => {
    try {
      const result = await coursesV2Service.student.startQuizAttempt(quizId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar quiz');
      console.error('Error starting quiz:', err);
      throw err;
    }
  }, []);

  const completeQuiz = useCallback(async (attemptId: number, answers: any) => {
    try {
      const result = await coursesV2Service.student.completeQuizAttempt(attemptId, answers);
      // Refrescar la vista del curso
      await fetchCourseView();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar quiz');
      console.error('Error completing quiz:', err);
      throw err;
    }
  }, [fetchCourseView]);

  const generateCertificate = useCallback(async (enrollmentId: number, type: 'virtual' | 'complete') => {
    try {
      const result = await coursesV2Service.student.generateCertificate(enrollmentId, type);
      // Refrescar la vista del curso
      await fetchCourseView();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar certificado');
      console.error('Error generating certificate:', err);
      throw err;
    }
  }, [fetchCourseView]);

  useEffect(() => {
    fetchCourseView();
  }, [fetchCourseView]);

  return {
    courseView,
    loading,
    error,
    refetch: fetchCourseView,
    completeComponent,
    startQuiz,
    completeQuiz,
    generateCertificate,
  };
};

// ============================================================================
// HOOK PARA PROFESORES
// ============================================================================
export const useTeacherCourses = () => {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.teacher.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      console.error('Error fetching teacher courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cloneCourse = useCallback(async (courseId: number, options?: any) => {
    try {
      const result = await coursesV2Service.teacher.cloneCourse(courseId, options);
      // Refrescar la lista de cursos
      await fetchCourses();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al clonar curso');
      console.error('Error cloning course:', err);
      throw err;
    }
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    cloneCourse,
  };
};

// ============================================================================
// HOOK PARA ADMINISTRADORES
// ============================================================================
export const useAdminDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.admin.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.admin.getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      console.error('Error fetching admin courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesV2Service.admin.getSystemSettings();
      setSystemSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
      console.error('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSystemSettings = useCallback(async (settings: any) => {
    try {
      const result = await coursesV2Service.admin.updateSystemSettings(settings);
      // Refrescar configuraciones
      await fetchSystemSettings();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuraciones');
      console.error('Error updating system settings:', err);
      throw err;
    }
  }, [fetchSystemSettings]);

  return {
    dashboard,
    courses,
    systemSettings,
    loading,
    error,
    fetchDashboard,
    fetchCourses,
    fetchSystemSettings,
    updateSystemSettings,
  };
};

// ============================================================================
// HOOK PRINCIPAL BASADO EN ROL
// ============================================================================
export const useCoursesV2 = () => {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  // Hooks condicionales basados en el rol
  const studentHook = useStudentCourses();
  const teacherHook = useTeacherCourses();
  const adminHook = useAdminDashboard();

  // Retornar el hook apropiado basado en el rol
  if (isStudent) {
    return {
      type: 'student' as const,
      ...studentHook,
    };
  }

  if (isTeacher) {
    return {
      type: 'teacher' as const,
      ...teacherHook,
    };
  }

  if (isAdmin) {
    return {
      type: 'admin' as const,
      ...adminHook,
    };
  }

  // Fallback si no hay rol válido
  return {
    type: 'unknown' as const,
    courses: [],
    loading: false,
    error: 'Rol de usuario no válido',
    refetch: () => {},
  };
};

export default useCoursesV2;