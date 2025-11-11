/**
 * Constantes globales del sistema Griver
 */

// Información de la empresa
export const COMPANY = {
  name: 'Griver',
  fullName: 'Griver Corporativo',
  slogan: 'Excelencia en Capacitación Empresarial',
  website: 'https://griver.com',
  supportEmail: 'soporte@griver.com',
  phone: '+52 (55) 1234-5678'
} as const;

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  RH: 'rh', 
  EMPLOYEE: 'employee',
  INTERN: 'intern'
} as const;

// Textos de roles para UI
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.RH]: 'Recursos Humanos',
  [USER_ROLES.EMPLOYEE]: 'Empleado',
  [USER_ROLES.INTERN]: 'Becario'
} as const;

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'view_all_users',
    'create_user',
    'edit_user', 
    'delete_user',
    'view_all_courses',
    'create_course',
    'edit_course',
    'delete_course',
    'view_analytics',
    'manage_system_settings',
    'export_data'
  ],
  [USER_ROLES.RH]: [
    'view_employees',
    'create_employee',
    'create_intern',
    'edit_employee',
    'edit_intern',
    'delete_employee',
    'delete_intern',
    'view_all_courses',
    'create_course',
    'edit_course',
    'assign_courses',
    'view_progress_reports'
  ],
  [USER_ROLES.EMPLOYEE]: [
    'view_assigned_courses',
    'complete_courses',
    'view_own_progress',
    'download_certificates'
  ],
  [USER_ROLES.INTERN]: [
    'view_assigned_courses',
    'complete_courses', 
    'view_own_progress',
    'download_certificates'
  ]
} as const;

// Estados de curso
export const COURSE_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
} as const;

export const COURSE_STATUS_LABELS = {
  [COURSE_STATUS.NOT_STARTED]: 'No Iniciado',
  [COURSE_STATUS.IN_PROGRESS]: 'En Progreso',
  [COURSE_STATUS.COMPLETED]: 'Completado',
  [COURSE_STATUS.EXPIRED]: 'Expirado'
} as const;

// Tipos de contenido
export const CONTENT_TYPES = {
  VIDEO: 'video',
  DOCUMENT: 'document',
  QUIZ: 'quiz',
  INTERACTIVE: 'interactive'
} as const;

export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.VIDEO]: 'Video',
  [CONTENT_TYPES.DOCUMENT]: 'Documento',
  [CONTENT_TYPES.QUIZ]: 'Cuestionario',
  [CONTENT_TYPES.INTERACTIVE]: 'Interactivo'
} as const;

// Categorías de curso
export const COURSE_CATEGORIES = [
  {
    id: 'seguridad',
    name: 'Seguridad Laboral',
    color: '#ef4444',
    icon: 'Shield'
  },
  {
    id: 'cumplimiento',
    name: 'Cumplimiento',
    color: '#3b82f6', 
    icon: 'FileCheck'
  },
  {
    id: 'desarrollo',
    name: 'Desarrollo Profesional',
    color: '#10b981',
    icon: 'TrendingUp'
  },
  {
    id: 'cultura',
    name: 'Cultura Organizacional',
    color: '#8b5cf6',
    icon: 'Users'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    color: '#f59e0b',
    icon: 'Monitor'
  }
] as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
} as const;

// Configuración de archivos
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
} as const;

// Configuración de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning', 
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Configuración de tiempo
export const TIME_FORMATS = {
  DATE_SHORT: 'DD/MM/YYYY',
  DATE_LONG: 'DD [de] MMMM [de] YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm'
} as const;

// URLs de navegación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  USERS: '/users',
  PROGRESS: '/progress',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  CERTIFICATES: '/certificates'
} as const;

// Configuración de tema
export const THEME = {
  PRIMARY_COLOR: '#030213',
  SECONDARY_COLOR: '#e9ebef',
  SUCCESS_COLOR: '#10b981',
  WARNING_COLOR: '#f59e0b',
  ERROR_COLOR: '#ef4444',
  INFO_COLOR: '#3b82f6'
} as const;

// Mensajes del sistema
export const MESSAGES = {
  LOGIN_SUCCESS: 'Bienvenido al sistema Griver',
  LOGIN_ERROR: 'Credenciales incorrectas',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  COURSE_COMPLETED: 'Felicitaciones, has completado el curso',
  COURSE_ASSIGNED: 'Nuevo curso asignado',
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado correctamente',
  COURSE_CREATED: 'Curso creado exitosamente',
  COURSE_UPDATED: 'Curso actualizado exitosamente',
  COURSE_DELETED: 'Curso eliminado correctamente',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado',
  NETWORK_ERROR: 'Error de conexión, intenta nuevamente'
} as const;

// Configuración de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\+]?[0-9\s\-\(\)]{10,}$/
} as const;