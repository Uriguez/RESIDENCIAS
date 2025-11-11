import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Course, Notification } from '../types';

/**
 * Store global de la aplicación usando Zustand
 * Maneja estado global que necesita persistir entre sesiones
 */

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // User preferences
  language: 'es' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    courseReminders: boolean;
  };
  
  // Cache
  cachedCourses: Course[];
  lastCacheUpdate: string | null;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'es' | 'en') => void;
  updateNotificationSettings: (settings: Partial<AppState['notifications']>) => void;
  setCachedCourses: (courses: Course[]) => void;
  clearCache: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      theme: 'system',
      language: 'es',
      notifications: {
        email: true,
        push: true,
        courseReminders: true,
      },
      cachedCourses: [],
      lastCacheUpdate: null,
      
      // Actions
      setSidebarCollapsed: (collapsed) => 
        set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => 
        set({ theme }),
      
      setLanguage: (language) => 
        set({ language }),
      
      updateNotificationSettings: (settings) => 
        set((state) => ({
          notifications: { ...state.notifications, ...settings }
        })),
      
      setCachedCourses: (courses) => 
        set({ 
          cachedCourses: courses, 
          lastCacheUpdate: new Date().toISOString() 
        }),
      
      clearCache: () => 
        set({ 
          cachedCourses: [], 
          lastCacheUpdate: null 
        }),
    }),
    {
      name: 'griver-app-storage',
      // Solo persistir estas propiedades
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
      }),
    }
  )
);

/**
 * Store para manejo de modales y overlays
 */
interface ModalState {
  modals: {
    courseDetails: { isOpen: boolean; courseId: string | null };
    userProfile: { isOpen: boolean; userId: string | null };
    createCourse: { isOpen: boolean };
    editCourse: { isOpen: boolean; courseId: string | null };
    confirmDialog: { 
      isOpen: boolean; 
      title: string; 
      message: string; 
      onConfirm: (() => void) | null;
    };
  };
  
  // Actions
  openCourseDetails: (courseId: string) => void;
  closeCourseDetails: () => void;
  openUserProfile: (userId: string) => void;
  closeUserProfile: () => void;
  openCreateCourse: () => void;
  closeCreateCourse: () => void;
  openEditCourse: (courseId: string) => void;
  closeEditCourse: () => void;
  openConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {
    courseDetails: { isOpen: false, courseId: null },
    userProfile: { isOpen: false, userId: null },
    createCourse: { isOpen: false },
    editCourse: { isOpen: false, courseId: null },
    confirmDialog: { 
      isOpen: false, 
      title: '', 
      message: '', 
      onConfirm: null 
    },
  },
  
  openCourseDetails: (courseId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        courseDetails: { isOpen: true, courseId }
      }
    })),
  
  closeCourseDetails: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        courseDetails: { isOpen: false, courseId: null }
      }
    })),
  
  openUserProfile: (userId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        userProfile: { isOpen: true, userId }
      }
    })),
  
  closeUserProfile: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        userProfile: { isOpen: false, userId: null }
      }
    })),
  
  openCreateCourse: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        createCourse: { isOpen: true }
      }
    })),
  
  closeCreateCourse: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        createCourse: { isOpen: false }
      }
    })),
  
  openEditCourse: (courseId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        editCourse: { isOpen: true, courseId }
      }
    })),
  
  closeEditCourse: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        editCourse: { isOpen: false, courseId: null }
      }
    })),
  
  openConfirmDialog: (title, message, onConfirm) =>
    set((state) => ({
      modals: {
        ...state.modals,
        confirmDialog: { isOpen: true, title, message, onConfirm }
      }
    })),
  
  closeConfirmDialog: () =>
    set((state) => ({
      modals: {
        ...state.modals,
        confirmDialog: { 
          isOpen: false, 
          title: '', 
          message: '', 
          onConfirm: null 
        }
      }
    })),
  
  closeAllModals: () =>
    set({
      modals: {
        courseDetails: { isOpen: false, courseId: null },
        userProfile: { isOpen: false, userId: null },
        createCourse: { isOpen: false },
        editCourse: { isOpen: false, courseId: null },
        confirmDialog: { 
          isOpen: false, 
          title: '', 
          message: '', 
          onConfirm: null 
        },
      }
    }),
}));

/**
 * Store para manejo de búsquedas y filtros
 */
interface SearchState {
  filters: {
    courses: {
      search: string;
      category: string;
      difficulty: string;
      status: string;
    };
    users: {
      search: string;
      role: string;
      department: string;
      status: string;
    };
  };
  
  // Actions
  setCourseFilters: (filters: Partial<SearchState['filters']['courses']>) => void;
  setUserFilters: (filters: Partial<SearchState['filters']['users']>) => void;
  clearCourseFilters: () => void;
  clearUserFilters: () => void;
  clearAllFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {
    courses: {
      search: '',
      category: '',
      difficulty: '',
      status: '',
    },
    users: {
      search: '',
      role: '',
      department: '',
      status: '',
    },
  },
  
  setCourseFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        courses: { ...state.filters.courses, ...filters }
      }
    })),
  
  setUserFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        users: { ...state.filters.users, ...filters }
      }
    })),
  
  clearCourseFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        courses: {
          search: '',
          category: '',
          difficulty: '',
          status: '',
        }
      }
    })),
  
  clearUserFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        users: {
          search: '',
          role: '',
          department: '',
          status: '',
        }
      }
    })),
  
  clearAllFilters: () =>
    set({
      filters: {
        courses: {
          search: '',
          category: '',
          difficulty: '',
          status: '',
        },
        users: {
          search: '',
          role: '',
          department: '',
          status: '',
        },
      }
    }),
}));