// Tipos globales para el sistema Griver
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'rh' | 'employee' | 'intern';
  assignedCourses?: string[];
  position?: string; // Solo para empleados
  department?: string;
  hireDate?: string;
  avatar?: string; // URL de la imagen de perfil
  profileImage?: string; // URL de la imagen de perfil (legacy support)
  status: 'active' | 'inactive';
  lastLogin?: string;
  completedCourses?: string[];
  certificatesEarned?: Certificate[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress?: number;
  status?: 'completed' | 'in-progress' | 'not-started';
  thumbnail: string;
  content: CourseContent[];
  category: CourseCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // en minutos
  prerequisites?: string[];
  instructor?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isActive: boolean;
  completionCriteria: CompletionCriteria;
}

export interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'interactive';
  duration?: string;
  completed: boolean;
  url?: string;
  description?: string;
  order: number;
  isRequired: boolean;
  minScore?: number; // Para quizzes
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface CompletionCriteria {
  minScore: number;
  requiredContent: string[];
  timeLimit?: number; // en días
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  issuedDate: string;
  expirationDate?: string;
  certificateUrl?: string;
  score: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedContent: string[];
  currentScore: number;
  timeSpent: number; // en minutos
  lastAccessed: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeCount: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'completion' | 'progress' | 'user-activity' | 'course-analytics';
  generatedBy: string;
  generatedAt: string;
  filters: Record<string, any>;
  data: any;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    courseReminders: boolean;
    certificateExpiry: boolean;
  };
  language: 'es' | 'en';
  timezone: string;
}