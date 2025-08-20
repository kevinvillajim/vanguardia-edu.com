import { StateCreator } from 'zustand';
import { Course, Progress } from '../../types';

export interface CourseState {
  courses: Course[];
  selectedCourse: Course | null;
  userProgress: Record<number, Progress[]>; // courseId -> Progress[]
  coursesLoading: boolean;
  coursesError: string | null;
}

export interface CourseActions {
  fetchCourses: () => Promise<void>;
  selectCourse: (course: Course | null) => void;
  updateProgress: (courseId: number, unitId: number, progress: number) => Promise<void>;
  fetchUserProgress: (userId?: number) => Promise<void>;
  downloadCertificate: (courseId: number) => Promise<{ success: boolean; error?: string }>;
  clearCoursesError: () => void;
}

export interface CourseSlice extends CourseState, CourseActions {}

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  userProgress: {},
  coursesLoading: false,
  coursesError: null,
};

export const createCourseSlice: StateCreator<CourseSlice, [], [], CourseSlice> = (set, get) => ({
  // Initial state
  ...initialState,

  // Actions
  fetchCourses: async () => {
    set((state) => {
      state.coursesLoading = true;
      state.coursesError = null;
    });

    try {
      // Mock courses data for now - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: 1,
          title: 'Ciberseguridad Básica',
          description: 'Introducción a la ciberseguridad para principiantes',
          units: [
            {
              id: 1,
              course_id: 1,
              title: 'Introducción a la Ciberseguridad',
              description: 'Conceptos básicos de seguridad informática',
              content_type: 'video',
              content_data: { video_url: '/videos/curso1unidad1.mp4' },
              order: 1,
              is_required: true,
            },
            {
              id: 2,
              course_id: 1,
              title: 'Amenazas Comunes',
              description: 'Tipos de amenazas en línea',
              content_type: 'video',
              content_data: { video_url: '/videos/curso1unidad2.mp4' },
              order: 2,
              is_required: true,
            },
          ],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Protección de Datos Personales',
          description: 'Aprende a proteger tu información personal',
          units: [
            {
              id: 3,
              course_id: 2,
              title: 'Importancia de los Datos Personales',
              description: 'Por qué debemos proteger nuestra información',
              content_type: 'video',
              content_data: { video_url: '/videos/curso2unidad1.mp4' },
              order: 1,
              is_required: true,
            },
          ],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Phishing y Ingeniería Social',
          description: 'Cómo identificar y evitar ataques de phishing',
          units: [
            {
              id: 4,
              course_id: 3,
              title: 'Qué es el Phishing',
              description: 'Conceptos básicos del phishing',
              content_type: 'video',
              content_data: { video_url: '/videos/curso3unidad1.mp4' },
              order: 1,
              is_required: true,
            },
            {
              id: 5,
              course_id: 3,
              title: 'Técnicas de Ingeniería Social',
              description: 'Métodos usados por los atacantes',
              content_type: 'video',
              content_data: { video_url: '/videos/curso3unidad2.mp4' },
              order: 2,
              is_required: true,
            },
          ],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      set((state) => {
        state.courses = mockCourses;
        state.coursesLoading = false;
        state.coursesError = null;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch courses';
      
      set({
        coursesLoading: false,
        coursesError: errorMessage,
      });
    }
  },

  selectCourse: (course) => {
    set({ selectedCourse: course });
  },

  updateProgress: async (courseId, unitId, progress) => {
    try {
      // Mock API call - replace with actual implementation
      const mockProgress: Progress = {
        id: Date.now(),
        user_id: 1, // Should come from auth context
        course_id: courseId,
        unit_id: unitId,
        progress_percentage: progress,
        completed_at: progress >= 100 ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => {
        const updatedProgress = { ...state.userProgress };
        
        if (!updatedProgress[courseId]) {
          updatedProgress[courseId] = [];
        }
        
        // Update or add progress for this unit
        const existingIndex = updatedProgress[courseId].findIndex(
          p => p.unit_id === unitId
        );
        
        if (existingIndex !== -1) {
          updatedProgress[courseId][existingIndex] = mockProgress;
        } else {
          updatedProgress[courseId].push(mockProgress);
        }
        
        return { userProgress: updatedProgress };
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  },

  fetchUserProgress: async (userId) => {
    set((state) => {
      state.coursesLoading = true;
      state.coursesError = null;
    });

    try {
      // Mock API call - replace with actual implementation
      const mockProgressData: Record<number, Progress[]> = {
        1: [
          {
            id: 1,
            user_id: userId || 1,
            course_id: 1,
            unit_id: 1,
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            user_id: userId || 1,
            course_id: 1,
            unit_id: 2,
            progress_percentage: 75,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        2: [
          {
            id: 3,
            user_id: userId || 1,
            course_id: 2,
            unit_id: 3,
            progress_percentage: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      set({
        userProgress: mockProgressData,
        coursesLoading: false,
        coursesError: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch progress';
      
      set({
        coursesLoading: false,
        coursesError: errorMessage,
      });
    }
  },

  downloadCertificate: async (courseId) => {
    try {
      // Check if course is completed
      const courseProgress = get().userProgress[courseId];
      if (!courseProgress) {
        return { success: false, error: 'No progress found for this course' };
      }

      const course = get().courses.find(c => c.id === courseId);
      if (!course) {
        return { success: false, error: 'Course not found' };
      }

      // Calculate completion percentage
      const totalUnits = course.units.length;
      const completedUnits = courseProgress.filter(p => p.progress_percentage >= 100).length;
      const completionPercentage = (completedUnits / totalUnits) * 100;

      if (completionPercentage < 100) {
        return { success: false, error: 'Course must be 100% completed to download certificate' };
      }

      // Mock certificate download - replace with actual implementation
      console.log(`Downloading certificate for course ${courseId}`);
      
      // Update progress to mark certificate as downloaded
      set((state) => {
        const updatedProgress = { ...state.userProgress };
        if (updatedProgress[courseId]) {
          updatedProgress[courseId] = updatedProgress[courseId].map(progress => ({
            ...progress,
            certificate_downloaded: true,
          }));
        }
        return { userProgress: updatedProgress };
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download certificate';
      return { success: false, error: errorMessage };
    }
  },

  clearCoursesError: () => {
    set({ coursesError: null });
  },
});