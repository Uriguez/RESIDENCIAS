// utils/reportTemplates.ts
// Plantillas predefinidas de reportes para el sistema Griver
// MIGRACIÓN C#: Estas plantillas se almacenarán en la base de datos como ReportTemplate entities

import { ReportTemplate, ReportType } from '../types/reports';

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate> = {
  employee_progress: {
    id: 'rpt_employee_progress',
    name: 'Progreso de Empleados por Curso',
    type: 'employee_progress',
    description: 'Detalle del avance de cada empleado en los cursos asignados',
    icon: 'TrendingUp',
    availableFor: ['admin', 'rh'],
    fields: [
      { key: 'employeeName', label: 'Empleado', type: 'text', sortable: true, filterable: true, width: '200px' },
      { key: 'department', label: 'Departamento', type: 'text', sortable: true, filterable: true, width: '150px' },
      { key: 'courseName', label: 'Curso', type: 'text', sortable: true, filterable: true, width: '250px' },
      { key: 'progress', label: 'Progreso', type: 'percentage', sortable: true, filterable: false, width: '120px' },
      { key: 'status', label: 'Estado', type: 'status', sortable: true, filterable: true, width: '130px' },
      { key: 'assignedDate', label: 'Fecha Asignación', type: 'date', sortable: true, filterable: false, width: '150px' },
      { key: 'completionDate', label: 'Fecha Completado', type: 'date', sortable: true, filterable: false, width: '150px' },
      { key: 'daysElapsed', label: 'Días Transcurridos', type: 'number', sortable: true, filterable: false, width: '140px' }
    ]
  },

  department_statistics: {
    id: 'rpt_department_stats',
    name: 'Estadísticas por Departamento',
    type: 'department_statistics',
    description: 'Análisis comparativo del desempeño por departamento',
    icon: 'Building2',
    availableFor: ['admin', 'rh'],
    fields: [
      { key: 'department', label: 'Departamento', type: 'text', sortable: true, filterable: true, width: '180px' },
      { key: 'totalEmployees', label: 'Total Empleados', type: 'number', sortable: true, filterable: false, width: '140px' },
      { key: 'activeEmployees', label: 'Empleados Activos', type: 'number', sortable: true, filterable: false, width: '150px' },
      { key: 'coursesAssigned', label: 'Cursos Asignados', type: 'number', sortable: true, filterable: false, width: '150px' },
      { key: 'coursesCompleted', label: 'Cursos Completados', type: 'number', sortable: true, filterable: false, width: '160px' },
      { key: 'avgProgress', label: 'Progreso Promedio', type: 'percentage', sortable: true, filterable: false, width: '160px' },
      { key: 'completionRate', label: 'Tasa de Completación', type: 'percentage', sortable: true, filterable: false, width: '170px' },
      { key: 'onTimeRate', label: 'Completación a Tiempo', type: 'percentage', sortable: true, filterable: false, width: '180px' }
    ]
  },

  certifications: {
    id: 'rpt_certifications',
    name: 'Reporte de Certificaciones',
    type: 'certifications',
    description: 'Certificados emitidos y próximos a vencer',
    icon: 'Award',
    availableFor: ['admin', 'rh'],
    fields: [
      { key: 'employeeName', label: 'Empleado', type: 'text', sortable: true, filterable: true, width: '200px' },
      { key: 'courseName', label: 'Curso', type: 'text', sortable: true, filterable: true, width: '250px' },
      { key: 'completionDate', label: 'Fecha Completado', type: 'date', sortable: true, filterable: false, width: '150px' },
      { key: 'certificateId', label: 'ID Certificado', type: 'text', sortable: false, filterable: false, width: '180px' },
      { key: 'score', label: 'Calificación', type: 'percentage', sortable: true, filterable: false, width: '130px' },
      { key: 'validUntil', label: 'Válido Hasta', type: 'date', sortable: true, filterable: false, width: '140px' },
      { key: 'status', label: 'Estado', type: 'badge', sortable: true, filterable: true, width: '120px' }
    ]
  },

  pending_assignments: {
    id: 'rpt_pending_assignments',
    name: 'Asignaciones Pendientes',
    type: 'pending_assignments',
    description: 'Cursos asignados sin completar y próximos vencimientos',
    icon: 'AlertCircle',
    availableFor: ['admin', 'rh'],
    fields: [
      { key: 'employeeName', label: 'Empleado', type: 'text', sortable: true, filterable: true, width: '200px' },
      { key: 'department', label: 'Departamento', type: 'text', sortable: true, filterable: true, width: '150px' },
      { key: 'courseName', label: 'Curso', type: 'text', sortable: true, filterable: true, width: '250px' },
      { key: 'progress', label: 'Progreso', type: 'percentage', sortable: true, filterable: false, width: '120px' },
      { key: 'assignedDate', label: 'Fecha Asignación', type: 'date', sortable: true, filterable: false, width: '150px' },
      { key: 'dueDate', label: 'Fecha Límite', type: 'date', sortable: true, filterable: false, width: '140px' },
      { key: 'daysRemaining', label: 'Días Restantes', type: 'number', sortable: true, filterable: false, width: '140px' },
      { key: 'priority', label: 'Prioridad', type: 'badge', sortable: true, filterable: true, width: '110px' }
    ]
  },

  system_performance: {
    id: 'rpt_system_performance',
    name: 'Desempeño General del Sistema',
    type: 'system_performance',
    description: 'KPIs y métricas generales de Griver',
    icon: 'Activity',
    availableFor: ['admin'],
    fields: [
      { key: 'metric', label: 'Métrica', type: 'text', sortable: false, filterable: false, width: '250px' },
      { key: 'currentValue', label: 'Valor Actual', type: 'number', sortable: false, filterable: false, width: '150px' },
      { key: 'previousValue', label: 'Valor Anterior', type: 'number', sortable: false, filterable: false, width: '150px' },
      { key: 'change', label: 'Cambio', type: 'percentage', sortable: true, filterable: false, width: '120px' },
      { key: 'trend', label: 'Tendencia', type: 'badge', sortable: false, filterable: false, width: '120px' },
      { key: 'target', label: 'Objetivo', type: 'number', sortable: false, filterable: false, width: '130px' },
      { key: 'achievement', label: 'Logro vs Objetivo', type: 'percentage', sortable: true, filterable: false, width: '160px' }
    ]
  },

  completion_history: {
    id: 'rpt_completion_history',
    name: 'Histórico de Completación',
    type: 'completion_history',
    description: 'Timeline de cursos completados por período',
    icon: 'Calendar',
    availableFor: ['admin', 'rh'],
    fields: [
      { key: 'completionDate', label: 'Fecha Completado', type: 'date', sortable: true, filterable: false, width: '150px' },
      { key: 'employeeName', label: 'Empleado', type: 'text', sortable: true, filterable: true, width: '200px' },
      { key: 'department', label: 'Departamento', type: 'text', sortable: true, filterable: true, width: '150px' },
      { key: 'courseName', label: 'Curso', type: 'text', sortable: true, filterable: true, width: '250px' },
      { key: 'duration', label: 'Duración (días)', type: 'number', sortable: true, filterable: false, width: '140px' },
      { key: 'score', label: 'Calificación', type: 'percentage', sortable: true, filterable: false, width: '130px' },
      { key: 'attempts', label: 'Intentos', type: 'number', sortable: false, filterable: false, width: '100px' },
      { key: 'certificateIssued', label: 'Certificado', type: 'badge', sortable: false, filterable: false, width: '120px' }
    ]
  },

  custom: {
    id: 'rpt_custom',
    name: 'Reporte Personalizado',
    type: 'custom',
    description: 'Diseñe su propio reporte con campos personalizados',
    icon: 'Settings',
    availableFor: ['admin'],
    fields: []
  }
};

export const getTemplateByType = (type: ReportType): ReportTemplate => {
  return REPORT_TEMPLATES[type];
};

export const getAvailableTemplatesForRole = (role: string): ReportTemplate[] => {
  return Object.values(REPORT_TEMPLATES).filter(template => 
    template.availableFor.includes(role as 'admin' | 'rh')
  );
};

// MIGRACIÓN C#: 
// - Crear clase ReportTemplateService con método GetTemplateByType
// - Crear clase ReportTemplateRepository para acceso a BD
// - Implementar caché de plantillas en memoria
