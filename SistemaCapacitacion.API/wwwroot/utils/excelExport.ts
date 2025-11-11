import { Course, User, CourseEnrollment } from '../types';

interface ExcelExportOptions {
  filename?: string;
  includePersonalData?: boolean;
  filterByDepartment?: string;
  filterByStatus?: string;
}

interface CourseReportData {
  course: Course;
  enrollments: (CourseEnrollment & { user: User })[];
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageScore: number;
}

export class ExcelExportService {
  /**
   * Exporta la lista de usuarios de un curso específico a Excel
   */
  static async exportCourseUsers(
    courseId: string,
    enrollments: (CourseEnrollment & { user: User })[],
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const {
      filename = `usuarios_curso_${courseId}_${new Date().toISOString().split('T')[0]}.xlsx`,
      includePersonalData = true,
      filterByDepartment,
      filterByStatus
    } = options;

    // Filtrar datos según los filtros especificados
    let filteredEnrollments = enrollments;

    if (filterByDepartment && filterByDepartment !== 'all') {
      filteredEnrollments = filteredEnrollments.filter(
        enrollment => enrollment.user.department === filterByDepartment
      );
    }

    if (filterByStatus && filterByStatus !== 'all') {
      filteredEnrollments = filteredEnrollments.filter(enrollment => {
        switch (filterByStatus) {
          case 'completed':
            return enrollment.completedAt !== null;
          case 'in-progress':
            return enrollment.startedAt && !enrollment.completedAt;
          case 'not-started':
            return !enrollment.startedAt;
          default:
            return true;
        }
      });
    }

    // Preparar datos para Excel
    const excelData = filteredEnrollments.map(enrollment => {
      const baseData = {
        'ID': enrollment.user.id,
        'Nombre': enrollment.user.name,
        'Departamento': enrollment.user.department || 'No asignado',
        'Rol': this.getRoleLabel(enrollment.user.role),
        'Estado de Inscripción': this.getEnrollmentStatus(enrollment),
        'Fecha de Inscripción': this.formatDate(enrollment.enrolledAt),
        'Fecha de Inicio': enrollment.startedAt ? this.formatDate(enrollment.startedAt) : 'No iniciado',
        'Fecha de Completación': enrollment.completedAt ? this.formatDate(enrollment.completedAt) : 'No completado',
        'Progreso (%)': enrollment.progressPercentage,
        'Puntuación': enrollment.score || 'N/A',
        'Tiempo Dedicado': this.calculateTimeSpent(enrollment),
      };

      // Agregar datos personales solo si está permitido
      if (includePersonalData) {
        return {
          ...baseData,
          'Email': enrollment.user.email,
          'Teléfono': enrollment.user.phone || 'No proporcionado',
        };
      }

      return baseData;
    });

    // Generar y descargar Excel
    await this.generateExcelFile(excelData, filename);
  }

  /**
   * Exporta un reporte completo de múltiples cursos
   */
  static async exportCoursesReport(
    coursesData: CourseReportData[],
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const {
      filename = `reporte_cursos_${new Date().toISOString().split('T')[0]}.xlsx`,
      filterByDepartment
    } = options;

    // Hoja 1: Resumen de cursos
    const courseSummary = coursesData.map(data => ({
      'ID del Curso': data.course.id,
      'Título': data.course.title,
      'Categoría': data.course.category?.name || 'Sin categoría',
      'Dificultad': this.getDifficultyLabel(data.course.difficulty),
      'Duración (min)': data.course.estimatedTime,
      'Total Inscritos': data.totalEnrolled,
      'Total Completados': data.totalCompleted,
      'Tasa de Completación (%)': Math.round(data.completionRate * 100) / 100,
      'Puntuación Promedio': Math.round(data.averageScore * 100) / 100,
      'Estado': data.course.isActive ? 'Activo' : 'Inactivo',
      'Fecha de Creación': this.formatDate(data.course.createdAt),
    }));

    // Hoja 2: Detalle de usuarios por curso
    const userDetails: any[] = [];
    coursesData.forEach(data => {
      let enrollments = data.enrollments;
      
      // Filtrar por departamento si se especifica
      if (filterByDepartment && filterByDepartment !== 'all') {
        enrollments = enrollments.filter(
          enrollment => enrollment.user.department === filterByDepartment
        );
      }

      enrollments.forEach(enrollment => {
        userDetails.push({
          'Curso ID': data.course.id,
          'Curso': data.course.title,
          'Usuario ID': enrollment.user.id,
          'Nombre': enrollment.user.name,
          'Email': enrollment.user.email,
          'Departamento': enrollment.user.department || 'No asignado',
          'Rol': this.getRoleLabel(enrollment.user.role),
          'Estado': this.getEnrollmentStatus(enrollment),
          'Progreso (%)': enrollment.progressPercentage,
          'Puntuación': enrollment.score || 'N/A',
          'Fecha Inscripción': this.formatDate(enrollment.enrolledAt),
          'Fecha Inicio': enrollment.startedAt ? this.formatDate(enrollment.startedAt) : 'No iniciado',
          'Fecha Completación': enrollment.completedAt ? this.formatDate(enrollment.completedAt) : 'No completado',
        });
      });
    });

    // Generar archivo con múltiples hojas
    await this.generateMultiSheetExcel([
      { name: 'Resumen de Cursos', data: courseSummary },
      { name: 'Detalle de Usuarios', data: userDetails }
    ], filename);
  }

  /**
   * Exporta estadísticas por departamento
   */
  static async exportDepartmentStats(
    departmentData: Array<{
      department: string;
      totalUsers: number;
      enrolledUsers: number;
      completedCourses: number;
      averageProgress: number;
      mostPopularCourse: string;
    }>,
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const {
      filename = `estadisticas_departamentos_${new Date().toISOString().split('T')[0]}.xlsx`
    } = options;

    const excelData = departmentData.map(dept => ({
      'Departamento': dept.department,
      'Total de Usuarios': dept.totalUsers,
      'Usuarios Inscritos': dept.enrolledUsers,
      'Tasa de Participación (%)': Math.round((dept.enrolledUsers / dept.totalUsers) * 100),
      'Cursos Completados': dept.completedCourses,
      'Progreso Promedio (%)': Math.round(dept.averageProgress),
      'Curso Más Popular': dept.mostPopularCourse,
    }));

    await this.generateExcelFile(excelData, filename);
  }

  /**
   * Genera un archivo Excel simple con una sola hoja
   */
  private static async generateExcelFile(data: any[], filename: string): Promise<void> {
    try {
      // Simular generación de Excel (en implementación real usarías una librería como xlsx)
      const csvContent = this.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Descargar archivo
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.replace('.xlsx', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Archivo exportado: ${filename}`);
    } catch (error) {
      console.error('Error al generar archivo Excel:', error);
      throw new Error('No se pudo generar el archivo de exportación');
    }
  }

  /**
   * Genera un archivo Excel con múltiples hojas
   */
  private static async generateMultiSheetExcel(
    sheets: Array<{ name: string; data: any[] }>,
    filename: string
  ): Promise<void> {
    try {
      // En una implementación real, aquí usarías una librería como xlsx para crear múltiples hojas
      // Por ahora, creamos un archivo CSV combinado
      let combinedContent = '';
      
      sheets.forEach((sheet, index) => {
        if (index > 0) combinedContent += '\n\n';
        combinedContent += `=== ${sheet.name} ===\n`;
        combinedContent += this.convertToCSV(sheet.data);
      });

      const blob = new Blob([combinedContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.replace('.xlsx', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Archivo multi-hoja exportado: ${filename}`);
    } catch (error) {
      console.error('Error al generar archivo Excel multi-hoja:', error);
      throw new Error('No se pudo generar el archivo de exportación');
    }
  }

  /**
   * Convierte datos a formato CSV
   */
  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar headers
    csvRows.push(headers.join(','));

    // Agregar filas de datos
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar comillas y manejar valores nulos
        const stringValue = value === null || value === undefined ? '' : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Obtiene el label legible para el rol de usuario
   */
  private static getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      'admin': 'Administrador',
      'hr': 'Recursos Humanos',
      'employee': 'Empleado',
      'intern': 'Becario'
    };
    return roleLabels[role] || role;
  }

  /**
   * Obtiene el label legible para la dificultad del curso
   */
  private static getDifficultyLabel(difficulty: string): string {
    const difficultyLabels: Record<string, string> = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return difficultyLabels[difficulty] || difficulty;
  }

  /**
   * Obtiene el estado de inscripción del usuario
   */
  private static getEnrollmentStatus(enrollment: CourseEnrollment): string {
    if (enrollment.completedAt) {
      return 'Completado';
    } else if (enrollment.startedAt) {
      return 'En Progreso';
    } else {
      return 'No Iniciado';
    }
  }

  /**
   * Formatea una fecha para mostrar
   */
  private static formatDate(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  /**
   * Calcula el tiempo dedicado al curso
   */
  private static calculateTimeSpent(enrollment: CourseEnrollment): string {
    if (!enrollment.startedAt) return 'No iniciado';
    
    const startDate = new Date(enrollment.startedAt);
    const endDate = enrollment.completedAt ? new Date(enrollment.completedAt) : new Date();
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} días, ${diffHours} horas`;
    } else {
      return `${diffHours} horas`;
    }
  }
}

/**
 * Función simple para exportar datos a Excel/CSV
 * Usado por CrystalReportsManager
 */
export function exportToExcel(data: any[], filename: string): void {
  try {
    if (data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar headers
    csvRows.push(headers.join(','));

    // Agregar filas de datos
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Descargar archivo
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Archivo exportado: ${filename}.csv`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('No se pudo generar el archivo de exportación');
  }
}

// Hook personalizado para usar el servicio de exportación
export function useExcelExport() {
  const exportCourseUsers = async (
    courseId: string,
    courseName: string,
    enrollments: any[],
    options: Partial<ExcelExportOptions> = {}
  ) => {
    try {
      const filename = `usuarios_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      await ExcelExportService.exportCourseUsers(courseId, enrollments, {
        filename,
        ...options
      });
      return { success: true, message: 'Archivo exportado exitosamente' };
    } catch (error) {
      console.error('Error exporting course users:', error);
      return { success: false, message: 'Error al exportar el archivo' };
    }
  };

  const exportCoursesReport = async (
    coursesData: CourseReportData[],
    options: Partial<ExcelExportOptions> = {}
  ) => {
    try {
      await ExcelExportService.exportCoursesReport(coursesData, options);
      return { success: true, message: 'Reporte exportado exitosamente' };
    } catch (error) {
      console.error('Error exporting courses report:', error);
      return { success: false, message: 'Error al exportar el reporte' };
    }
  };

  const exportDepartmentStats = async (
    departmentData: any[],
    options: Partial<ExcelExportOptions> = {}
  ) => {
    try {
      await ExcelExportService.exportDepartmentStats(departmentData, options);
      return { success: true, message: 'Estadísticas exportadas exitosamente' };
    } catch (error) {
      console.error('Error exporting department stats:', error);
      return { success: false, message: 'Error al exportar las estadísticas' };
    }
  };

  return {
    exportCourseUsers,
    exportCoursesReport,
    exportDepartmentStats
  };
}