import { useState, useCallback } from 'react';
import { courseService } from '../../services/courseService';
import { CreateCourseData, Course, CourseUnit, CourseModule, CourseComponent } from '../../domain/entities/Course';
import { CreateUnitData, CreateModuleData, CreateComponentData } from '../../domain/repositories/ICourseRepository';

interface CourseCreationState {
  isLoading: boolean;
  error: string | null;
  course: Course | null;
  courses: Course[];
}

interface NotificationFn {
  (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string): void;
}

export const useCourseCreation = (showNotification?: NotificationFn) => {
  const [state, setState] = useState<CourseCreationState>({
    isLoading: false,
    error: null,
    course: null,
    courses: []
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Course operations
  const createCourse = useCallback(async (courseData: CreateCourseData): Promise<{ success: boolean; courseId?: number }> => {
    setLoading(true);
    clearError();

    try {
      const result = await courseService.createCourse(courseData);
      
      if (result.success && result.course) {
        setState(prev => ({ 
          ...prev, 
          course: result.course!, 
          isLoading: false 
        }));
        
        showNotification?.('success', 'Éxito', 'Curso creado exitosamente');
        return { success: true, courseId: result.course.id };
      } else {
        setError(result.error || 'Error al crear el curso');
        showNotification?.('error', 'Error', result.error || 'Error al crear el curso');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al crear el curso';
      setError(errorMessage);
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, showNotification]);

  const updateCourse = useCallback(async (courseId: number, courseData: Partial<CreateCourseData>): Promise<{ success: boolean }> => {
    setLoading(true);
    clearError();

    try {
      const result = await courseService.updateCourse(courseId, courseData);
      
      if (result.success && result.course) {
        setState(prev => ({ 
          ...prev, 
          course: result.course!, 
          isLoading: false 
        }));
        
        showNotification?.('success', 'Éxito', 'Curso actualizado exitosamente');
        return { success: true };
      } else {
        setError(result.error || 'Error al actualizar el curso');
        showNotification?.('error', 'Error', result.error || 'Error al actualizar el curso');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al actualizar el curso';
      setError(errorMessage);
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, showNotification]);

  const publishCourse = useCallback(async (courseId: number): Promise<{ success: boolean }> => {
    setLoading(true);
    clearError();

    try {
      const result = await courseService.publishCourse(courseId);
      
      if (result.success && result.course) {
        setState(prev => ({ 
          ...prev, 
          course: result.course!, 
          isLoading: false 
        }));
        
        showNotification?.('success', 'Éxito', 'Curso publicado exitosamente');
        return { success: true };
      } else {
        setError(result.error || 'Error al publicar el curso');
        showNotification?.('error', 'Error', result.error || 'Error al publicar el curso');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al publicar el curso';
      setError(errorMessage);
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, showNotification]);

  // Unit operations
  const createUnit = useCallback(async (courseId: number, unitData: CreateUnitData): Promise<{ success: boolean; unitId?: number }> => {
    try {
      const result = await courseService.createUnit(courseId, unitData);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Unidad creada exitosamente');
        return { success: true, unitId: result.unitId };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al crear la unidad');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al crear la unidad';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  // Module operations
  const createModule = useCallback(async (unitId: number, moduleData: CreateModuleData): Promise<{ success: boolean; moduleId?: number }> => {
    try {
      const result = await courseService.createModule(unitId, moduleData);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Módulo creado exitosamente');
        return { success: true, moduleId: result.moduleId };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al crear el módulo');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al crear el módulo';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  // Component operations
  const createComponent = useCallback(async (moduleId: number, componentData: CreateComponentData): Promise<{ success: boolean; componentId?: number }> => {
    try {
      const result = await courseService.createComponent(moduleId, componentData);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Componente creado exitosamente');
        return { success: true, componentId: result.componentId };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al crear el componente');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al crear el componente';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  // File upload operations
  const uploadBanner = useCallback(async (courseId: number, file: File): Promise<{ success: boolean; bannerUrl?: string }> => {
    setLoading(true);

    try {
      const result = await courseService.uploadBanner(courseId, file);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Banner subido exitosamente');
        return { success: true, bannerUrl: result.bannerUrl };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al subir el banner');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al subir el banner';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, showNotification]);

  const uploadFile = useCallback(async (file: File): Promise<{ success: boolean; fileUrl?: string }> => {
    setLoading(true);

    try {
      const result = await courseService.uploadFile(file);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Archivo subido exitosamente');
        return { success: true, fileUrl: result.fileUrl };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al subir el archivo');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al subir el archivo';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, showNotification]);

  // Get teacher courses
  const getTeacherCourses = useCallback(async (filters?: any): Promise<{ success: boolean }> => {
    setLoading(true);
    clearError();

    try {
      const result = await courseService.getTeacherCourses(filters);
      
      if (result.success && result.courses) {
        setState(prev => ({ 
          ...prev, 
          courses: result.courses!, 
          isLoading: false 
        }));
        
        return { success: true };
      } else {
        setError(result.error || 'Error al obtener los cursos');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al obtener los cursos';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Delete operations
  const deleteUnit = useCallback(async (unitId: number): Promise<{ success: boolean }> => {
    try {
      const result = await courseService.deleteUnit(unitId);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Unidad eliminada exitosamente');
        return { success: true };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al eliminar la unidad');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al eliminar la unidad';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  const deleteModule = useCallback(async (moduleId: number): Promise<{ success: boolean }> => {
    try {
      const result = await courseService.deleteModule(moduleId);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Módulo eliminado exitosamente');
        return { success: true };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al eliminar el módulo');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al eliminar el módulo';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  const deleteComponent = useCallback(async (componentId: number): Promise<{ success: boolean }> => {
    try {
      const result = await courseService.deleteComponent(componentId);
      
      if (result.success) {
        showNotification?.('success', 'Éxito', 'Componente eliminado exitosamente');
        return { success: true };
      } else {
        showNotification?.('error', 'Error', result.error || 'Error al eliminar el componente');
        return { success: false };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al eliminar el componente';
      showNotification?.('error', 'Error', errorMessage);
      return { success: false };
    }
  }, [showNotification]);

  return {
    // State
    ...state,
    
    // Actions
    createCourse,
    updateCourse,
    publishCourse,
    createUnit,
    createModule,
    createComponent,
    uploadBanner,
    uploadFile,
    getTeacherCourses,
    
    // Delete actions
    deleteUnit,
    deleteModule,
    deleteComponent,
    
    // Utilities
    clearError,
  };
};