// types/reports.ts
// Tipos específicos para el sistema de reportes estilo Crystal Reports
// MIGRACIÓN C#: Estos tipos se convertirán en clases POCO en C#

export type ReportType = 
  | 'employee_progress'      // Progreso de empleados por curso
  | 'department_statistics'  // Estadísticas por departamento
  | 'certifications'         // Reporte de certificaciones
  | 'pending_assignments'    // Asignaciones pendientes
  | 'system_performance'     // Desempeño general
  | 'completion_history'     // Histórico de completación
  | 'custom';                // Reporte personalizado

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'print';

export type DateRangePreset = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface ReportFilter {
  dateRange?: {
    preset: DateRangePreset;
    startDate?: string;
    endDate?: string;
  };
  departments?: string[];
  courseIds?: string[];
  userIds?: string[];
  status?: ('completed' | 'in_progress' | 'not_started' | 'overdue')[];
  minProgress?: number;
  maxProgress?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  icon: string;
  availableFor: ('admin' | 'rh')[];
  defaultFilters?: ReportFilter;
  fields: ReportField[];
}

export interface ReportField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'percentage' | 'status' | 'badge';
  sortable: boolean;
  filterable: boolean;
  width?: string;
}

export interface ReportData {
  id: string;
  template: ReportTemplate;
  filters: ReportFilter;
  generatedAt: string;
  generatedBy: string;
  data: Record<string, any>[];
  summary?: ReportSummary;
}

export interface ReportSummary {
  totalRecords: number;
  aggregations: Record<string, number | string>;
  charts?: ChartData[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
}

export interface CrystalReportConfig {
  pageSize: 'letter' | 'a4' | 'legal';
  orientation: 'portrait' | 'landscape';
  showHeader: boolean;
  showFooter: boolean;
  showLogo: boolean;
  showPageNumbers: boolean;
  showGenerationDate: boolean;
  watermark?: string;
  customStyles?: Record<string, any>;
}

// MIGRACIÓN C#: Estas interfaces se mapearán a clases en el namespace Griver.Reports
