import { StateCreator } from 'zustand';
import { Notification } from '../../types';

export interface UIState {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  sidebarOpen: boolean;
  notifications: Notification[];
  isGlobalLoading: boolean;
  breadcrumbs: Array<{ label: string; path?: string }>;
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
}

export interface UISlice extends UIState, UIActions {}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('vanguardia_theme') as 'light' | 'dark') || 'light';
};

const getSidebarOpenDefault = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

const initialState: UIState = {
  theme: getInitialTheme(),
  isDarkMode: getInitialTheme() === 'dark',
  sidebarOpen: getSidebarOpenDefault(),
  notifications: [],
  isGlobalLoading: false,
  breadcrumbs: [],
};

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set, get) => ({
  // Initial state
  ...initialState,

  // Actions
  setTheme: (theme) => {
    localStorage.setItem('vanguardia_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    set({
      theme: theme,
      isDarkMode: theme === 'dark',
    });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  toggleDarkMode: () => {
    get().toggleTheme();
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    
    const newNotification: Notification = {
      id,
      timestamp,
      dismissible: true,
      duration: 5000, // 5 seconds default
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setGlobalLoading: (loading) => {
    set({ isGlobalLoading: loading });
  },

  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },
});