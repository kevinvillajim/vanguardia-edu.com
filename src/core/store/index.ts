import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { UserSlice, createUserSlice } from './slices/userSlice';
import { CourseSlice, createCourseSlice } from './slices/courseSlice';

// Combined store interface
export interface AppStore extends AuthSlice, UISlice, UserSlice, CourseSlice {
  // Global actions
  reset: () => void;
  hydrate: () => void;
}

// Create the main store without immer to avoid proxy issues
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, get, api) => ({
          // Combine all slices
          ...createAuthSlice(set, get, api),
          ...createUISlice(set, get, api),
          ...createUserSlice(set, get, api),
          ...createCourseSlice(set, get, api),

          // Global actions
          reset: () => {
            set({
              // Auth
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              passwordChangeRequired: false,
              lastActivity: Date.now(),
              error: null,
              
              // UI
              theme: 'light',
              isDarkMode: false,
              sidebarOpen: false,
              notifications: [],
              isGlobalLoading: false,
              breadcrumbs: [],
              
              // Users
              users: [],
              selectedUser: null,
              usersLoading: false,
              usersError: null,
              currentPage: 1,
              totalPages: 1,
              totalUsers: 0,
              searchQuery: '',
              filters: {},
              
              // Courses
              courses: [],
              selectedCourse: null,
              userProgress: {},
              coursesLoading: false,
              coursesError: null,
            });
          },

          hydrate: () => {
            // Rehydrate logic if needed
            const token = localStorage.getItem('vanguardia_auth_token');
            if (token) {
              get().checkAuthStatus();
            }
          },
        })
      ),
      {
        name: 'vanguardia-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          theme: state.theme,
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'VanguardiaStore',
    }
  )
);

// Simple hooks that select only what they need with null guards
export const useAuth = () => {
  const user = useAppStore(state => state?.user || null);
  const token = useAppStore(state => state?.token || null);
  const isAuthenticated = useAppStore(state => state?.isAuthenticated || false);
  const isLoading = useAppStore(state => state?.isLoading || false);
  const error = useAppStore(state => state?.error || null);
  const passwordChangeRequired = useAppStore(state => state?.passwordChangeRequired || false);
  const lastActivity = useAppStore(state => state?.lastActivity || Date.now());
  const login = useAppStore(state => state?.login);
  const logout = useAppStore(state => state?.logout);
  const register = useAppStore(state => state?.register);
  const changePassword = useAppStore(state => state?.changePassword);
  const updateProfile = useAppStore(state => state?.updateProfile);
  const checkAuthStatus = useAppStore(state => state?.checkAuthStatus);
  const initialize = useAppStore(state => state?.initialize);
  const checkAuth = useAppStore(state => state?.checkAuth);
  const forgotPassword = useAppStore(state => state?.forgotPassword);
  const refreshToken = useAppStore(state => state?.refreshToken);
  const clearError = useAppStore(state => state?.clearError);
  const updateLastActivity = useAppStore(state => state?.updateLastActivity);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    passwordChangeRequired,
    lastActivity,
    login,
    logout,
    register,
    changePassword,
    updateProfile,
    checkAuthStatus,
    initialize,
    checkAuth,
    forgotPassword,
    refreshToken,
    clearError,
    updateLastActivity,
  };
};

export const useUI = () => {
  const theme = useAppStore(state => state?.theme || 'light');
  const isDarkMode = useAppStore(state => state?.isDarkMode || false);
  const sidebarOpen = useAppStore(state => state?.sidebarOpen || false);
  const notifications = useAppStore(state => state?.notifications || []);
  const isGlobalLoading = useAppStore(state => state?.isGlobalLoading || false);
  const breadcrumbs = useAppStore(state => state?.breadcrumbs || []);
  const setTheme = useAppStore(state => state?.setTheme);
  const toggleTheme = useAppStore(state => state?.toggleTheme);
  const toggleDarkMode = useAppStore(state => state?.toggleDarkMode);
  const setSidebarOpen = useAppStore(state => state?.setSidebarOpen);
  const toggleSidebar = useAppStore(state => state?.toggleSidebar);
  const addNotification = useAppStore(state => state?.addNotification);
  const removeNotification = useAppStore(state => state?.removeNotification);
  const clearNotifications = useAppStore(state => state?.clearNotifications);
  const setGlobalLoading = useAppStore(state => state?.setGlobalLoading);
  const setBreadcrumbs = useAppStore(state => state?.setBreadcrumbs);

  return {
    theme,
    isDarkMode,
    sidebarOpen,
    notifications,
    isGlobalLoading,
    breadcrumbs,
    setTheme,
    toggleTheme,
    toggleDarkMode,
    setSidebarOpen,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    setGlobalLoading,
    setBreadcrumbs,
  };
};

export const useUsers = () => {
  const users = useAppStore(state => state?.users || []);
  const selectedUser = useAppStore(state => state?.selectedUser || null);
  const usersLoading = useAppStore(state => state?.usersLoading || false);
  const usersError = useAppStore(state => state?.usersError || null);
  const currentPage = useAppStore(state => state?.currentPage || 1);
  const totalPages = useAppStore(state => state?.totalPages || 1);
  const totalUsers = useAppStore(state => state?.totalUsers || 0);
  const searchQuery = useAppStore(state => state?.searchQuery || '');
  const filters = useAppStore(state => state?.filters || {});
  const fetchUsers = useAppStore(state => state?.fetchUsers);
  const createUser = useAppStore(state => state?.createUser);
  const updateUser = useAppStore(state => state?.updateUser);
  const deleteUser = useAppStore(state => state?.deleteUser);
  const resetUserPassword = useAppStore(state => state?.resetUserPassword);
  const setUserActive = useAppStore(state => state?.setUserActive);
  const searchUsers = useAppStore(state => state?.searchUsers);
  const selectUser = useAppStore(state => state?.selectUser);
  const setFilters = useAppStore(state => state?.setFilters);
  const clearUsersError = useAppStore(state => state?.clearUsersError);
  const importUsers = useAppStore(state => state?.importUsers);

  return {
    users,
    selectedUser,
    usersLoading,
    usersError,
    currentPage,
    totalPages,
    totalUsers,
    searchQuery,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    setUserActive,
    searchUsers,
    selectUser,
    setFilters,
    clearUsersError,
    importUsers,
  };
};

export const useCourses = () => {
  const courses = useAppStore(state => state?.courses || []);
  const selectedCourse = useAppStore(state => state?.selectedCourse || null);
  const userProgress = useAppStore(state => state?.userProgress || {});
  const coursesLoading = useAppStore(state => state?.coursesLoading || false);
  const coursesError = useAppStore(state => state?.coursesError || null);
  const fetchCourses = useAppStore(state => state?.fetchCourses);
  const selectCourse = useAppStore(state => state?.selectCourse);
  const updateProgress = useAppStore(state => state?.updateProgress);
  const fetchUserProgress = useAppStore(state => state?.fetchUserProgress);
  const downloadCertificate = useAppStore(state => state?.downloadCertificate);
  const clearCoursesError = useAppStore(state => state?.clearCoursesError);

  return {
    courses,
    selectedCourse,
    userProgress,
    coursesLoading,
    coursesError,
    fetchCourses,
    selectCourse,
    updateProgress,
    fetchUserProgress,
    downloadCertificate,
    clearCoursesError,
  };
};

// Subscribe to auth changes for side effects
useAppStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      // Clear sensitive data when user logs out
      localStorage.removeItem('vanguardia_auth_token');
      localStorage.removeItem('vanguardia_user_data');
    }
  }
);

// Subscribe to theme changes
useAppStore.subscribe(
  (state) => state.theme,
  (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  }
);

export default useAppStore;