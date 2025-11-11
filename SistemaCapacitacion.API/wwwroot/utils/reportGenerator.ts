// utils/reportGenerator.ts
// Generador de datos para reportes - Simula la lógica de Crystal Reports
// MIGRACIÓN C#: Esta lógica se moverá a ReportGeneratorService con queries SQL optimizadas

import { 
  ReportData, 
  ReportFilter, 
  ReportTemplate, 
  ReportType,
  ChartData 
} from '../types/reports';
import { Course, User } from '../types';

// Mock data generator - En producción esto consultará la base de datos
export class ReportGenerator {
  
  static generateReport(
    template: ReportTemplate,
    filters: ReportFilter,
    users: User[],
    courses: Course[],
    currentUser: User
  ): ReportData {
    
    const reportData: ReportData = {
      id: `report_${Date.now()}`,
      template,
      filters,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.name,
      data: [],
      summary: {
        totalRecords: 0,
        aggregations: {},
        charts: []
      }
    };

    // Generar datos según el tipo de reporte
    switch (template.type) {
      case 'employee_progress':
        reportData.data = this.generateEmployeeProgressData(users, courses, filters);
        reportData.summary = this.calculateEmployeeProgressSummary(reportData.data);
        break;
      
      case 'department_statistics':
        reportData.data = this.generateDepartmentStatsData(users, courses, filters);
        reportData.summary = this.calculateDepartmentStatsSummary(reportData.data);
        break;
      
      case 'certifications':
        reportData.data = this.generateCertificationsData(users, courses, filters);
        reportData.summary = this.calculateCertificationsSummary(reportData.data);
        break;
      
      case 'pending_assignments':
        reportData.data = this.generatePendingAssignmentsData(users, courses, filters);
        reportData.summary = this.calculatePendingAssignmentsSummary(reportData.data);
        break;
      
      case 'system_performance':
        reportData.data = this.generateSystemPerformanceData(users, courses, filters);
        reportData.summary = this.calculateSystemPerformanceSummary(reportData.data);
        break;
      
      case 'completion_history':
        reportData.data = this.generateCompletionHistoryData(users, courses, filters);
        reportData.summary = this.calculateCompletionHistorySummary(reportData.data);
        break;
      
      default:
        reportData.data = [];
    }

    reportData.summary!.totalRecords = reportData.data.length;
    return reportData;
  }

  private static generateEmployeeProgressData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const data: any[] = [];
    
    users.forEach(user => {
      if (user.role === 'employee' || user.role === 'intern') {
        user.assignedCourses?.forEach(courseId => {
          const course = courses.find(c => c.id === courseId);
          if (!course) return;

          const progress = user.progress?.find(p => p.courseId === courseId);
          const progressValue = progress?.progress || 0;
          
          // Aplicar filtros
          if (filters.departments && !filters.departments.includes(user.department)) return;
          if (filters.courseIds && !filters.courseIds.includes(courseId)) return;
          if (filters.minProgress && progressValue < filters.minProgress) return;
          if (filters.maxProgress && progressValue > filters.maxProgress) return;

          const assignedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          const completionDate = progressValue === 100 ? 
            new Date(assignedDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000) : null;
          
          const daysElapsed = Math.floor((Date.now() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          let status = 'No Iniciado';
          if (progressValue === 100) status = 'Completado';
          else if (progressValue > 0) status = 'En Progreso';
          else if (daysElapsed > 14) status = 'Atrasado';

          data.push({
            employeeName: user.name,
            department: user.department,
            courseName: course.title,
            progress: progressValue,
            status,
            assignedDate: assignedDate.toISOString().split('T')[0],
            completionDate: completionDate ? completionDate.toISOString().split('T')[0] : 'N/A',
            daysElapsed
          });
        });
      }
    });

    return data;
  }

  private static generateDepartmentStatsData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const departments = [...new Set(users.map(u => u.department))];
    const data: any[] = [];

    departments.forEach(dept => {
      const deptUsers = users.filter(u => u.department === dept && (u.role === 'employee' || u.role === 'intern'));
      
      if (filters.departments && !filters.departments.includes(dept)) return;
      
      const totalEmployees = deptUsers.length;
      const activeEmployees = deptUsers.filter(u => u.assignedCourses && u.assignedCourses.length > 0).length;
      
      let coursesAssigned = 0;
      let coursesCompleted = 0;
      let totalProgress = 0;
      let progressCount = 0;
      let onTimeCompletions = 0;

      deptUsers.forEach(user => {
        user.assignedCourses?.forEach(courseId => {
          coursesAssigned++;
          const progress = user.progress?.find(p => p.courseId === courseId);
          const progressValue = progress?.progress || 0;
          
          totalProgress += progressValue;
          progressCount++;
          
          if (progressValue === 100) {
            coursesCompleted++;
            if (Math.random() > 0.3) onTimeCompletions++;
          }
        });
      });

      const avgProgress = progressCount > 0 ? totalProgress / progressCount : 0;
      const completionRate = coursesAssigned > 0 ? (coursesCompleted / coursesAssigned) * 100 : 0;
      const onTimeRate = coursesCompleted > 0 ? (onTimeCompletions / coursesCompleted) * 100 : 0;

      data.push({
        department: dept,
        totalEmployees,
        activeEmployees,
        coursesAssigned,
        coursesCompleted,
        avgProgress: Math.round(avgProgress),
        completionRate: Math.round(completionRate),
        onTimeRate: Math.round(onTimeRate)
      });
    });

    return data;
  }

  private static generateCertificationsData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const data: any[] = [];

    users.forEach(user => {
      if (user.role === 'employee' || user.role === 'intern') {
        user.progress?.forEach(progress => {
          if (progress.progress === 100) {
            const course = courses.find(c => c.id === progress.courseId);
            if (!course) return;

            if (filters.courseIds && !filters.courseIds.includes(course.id)) return;

            const completionDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
            const validUntil = new Date(completionDate.getTime() + 365 * 24 * 60 * 60 * 1000);
            const score = 75 + Math.random() * 25;
            
            let status = 'Vigente';
            if (validUntil < new Date()) status = 'Vencido';
            else if ((validUntil.getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000) status = 'Próximo a Vencer';

            data.push({
              employeeName: user.name,
              courseName: course.title,
              completionDate: completionDate.toISOString().split('T')[0],
              certificateId: `GRIVER-${course.id.slice(0, 4).toUpperCase()}-${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
              score: Math.round(score),
              validUntil: validUntil.toISOString().split('T')[0],
              status
            });
          }
        });
      }
    });

    return data;
  }

  private static generatePendingAssignmentsData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const data: any[] = [];

    users.forEach(user => {
      if (user.role === 'employee' || user.role === 'intern') {
        user.assignedCourses?.forEach(courseId => {
          const course = courses.find(c => c.id === courseId);
          if (!course) return;

          const progress = user.progress?.find(p => p.courseId === courseId);
          const progressValue = progress?.progress || 0;

          if (progressValue === 100) return; // Skip completed courses

          if (filters.departments && !filters.departments.includes(user.department)) return;
          if (filters.courseIds && !filters.courseIds.includes(courseId)) return;

          const assignedDate = new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000);
          const dueDate = new Date(assignedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const daysRemaining = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          let priority = 'Baja';
          if (daysRemaining < 0) priority = 'Crítica';
          else if (daysRemaining < 7) priority = 'Alta';
          else if (daysRemaining < 14) priority = 'Media';

          data.push({
            employeeName: user.name,
            department: user.department,
            courseName: course.title,
            progress: progressValue,
            assignedDate: assignedDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            daysRemaining,
            priority
          });
        });
      }
    });

    return data.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  private static generateSystemPerformanceData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const totalUsers = users.filter(u => u.role === 'employee' || u.role === 'intern').length;
    const activeUsers = users.filter(u => 
      (u.role === 'employee' || u.role === 'intern') && 
      u.assignedCourses && 
      u.assignedCourses.length > 0
    ).length;

    const totalAssignments = users.reduce((sum, u) => sum + (u.assignedCourses?.length || 0), 0);
    const completedCourses = users.reduce((sum, u) => 
      sum + (u.progress?.filter(p => p.progress === 100).length || 0), 0
    );

    const metrics = [
      {
        metric: 'Total de Empleados Activos',
        currentValue: activeUsers,
        previousValue: Math.round(activeUsers * 0.92),
        change: 8,
        trend: 'Positivo',
        target: totalUsers,
        achievement: Math.round((activeUsers / totalUsers) * 100)
      },
      {
        metric: 'Cursos Totales Disponibles',
        currentValue: courses.length,
        previousValue: courses.length - 2,
        change: Math.round((2 / (courses.length - 2)) * 100),
        trend: 'Positivo',
        target: 50,
        achievement: Math.round((courses.length / 50) * 100)
      },
      {
        metric: 'Asignaciones Totales',
        currentValue: totalAssignments,
        previousValue: Math.round(totalAssignments * 0.88),
        change: 12,
        trend: 'Positivo',
        target: totalUsers * 5,
        achievement: Math.round((totalAssignments / (totalUsers * 5)) * 100)
      },
      {
        metric: 'Cursos Completados',
        currentValue: completedCourses,
        previousValue: Math.round(completedCourses * 0.85),
        change: 15,
        trend: 'Positivo',
        target: totalAssignments,
        achievement: Math.round((completedCourses / totalAssignments) * 100)
      },
      {
        metric: 'Tasa de Completación Global',
        currentValue: Math.round((completedCourses / totalAssignments) * 100),
        previousValue: Math.round((completedCourses / totalAssignments) * 100 * 0.9),
        change: 10,
        trend: 'Positivo',
        target: 85,
        achievement: Math.round(((completedCourses / totalAssignments) * 100) / 85 * 100)
      },
      {
        metric: 'Promedio de Progreso',
        currentValue: 67,
        previousValue: 62,
        change: 5,
        trend: 'Positivo',
        target: 75,
        achievement: 89
      }
    ];

    return metrics;
  }

  private static generateCompletionHistoryData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    const data: any[] = [];

    users.forEach(user => {
      if (user.role === 'employee' || user.role === 'intern') {
        user.progress?.forEach(progress => {
          if (progress.progress === 100) {
            const course = courses.find(c => c.id === progress.courseId);
            if (!course) return;

            if (filters.courseIds && !filters.courseIds.includes(course.id)) return;
            if (filters.departments && !filters.departments.includes(user.department)) return;

            const completionDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
            const duration = Math.floor(Math.random() * 30) + 1;
            const score = 75 + Math.random() * 25;
            const attempts = Math.floor(Math.random() * 3) + 1;

            data.push({
              completionDate: completionDate.toISOString().split('T')[0],
              employeeName: user.name,
              department: user.department,
              courseName: course.title,
              duration,
              score: Math.round(score),
              attempts,
              certificateIssued: score >= 80 ? 'Sí' : 'No'
            });
          }
        });
      }
    });

    return data.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
  }

  private static calculateEmployeeProgressSummary(data: any[]) {
    const completed = data.filter(d => d.status === 'Completado').length;
    const inProgress = data.filter(d => d.status === 'En Progreso').length;
    const overdue = data.filter(d => d.status === 'Atrasado').length;
    const avgProgress = data.reduce((sum, d) => sum + d.progress, 0) / data.length || 0;

    return {
      totalRecords: data.length,
      aggregations: {
        completed,
        inProgress,
        overdue,
        avgProgress: Math.round(avgProgress)
      },
      charts: [
        {
          type: 'pie' as const,
          title: 'Distribución por Estado',
          data: [
            { name: 'Completado', value: completed },
            { name: 'En Progreso', value: inProgress },
            { name: 'Atrasado', value: overdue },
            { name: 'No Iniciado', value: data.length - completed - inProgress - overdue }
          ]
        }
      ]
    };
  }

  private static calculateDepartmentStatsSummary(data: any[]) {
    return {
      totalRecords: data.length,
      aggregations: {
        totalEmployees: data.reduce((sum, d) => sum + d.totalEmployees, 0),
        totalCoursesAssigned: data.reduce((sum, d) => sum + d.coursesAssigned, 0),
        totalCoursesCompleted: data.reduce((sum, d) => sum + d.coursesCompleted, 0),
        avgCompletionRate: Math.round(data.reduce((sum, d) => sum + d.completionRate, 0) / data.length || 0)
      },
      charts: [
        {
          type: 'bar' as const,
          title: 'Tasa de Completación por Departamento',
          data: data.map(d => ({ department: d.department, completionRate: d.completionRate })),
          xKey: 'department',
          yKey: 'completionRate'
        }
      ]
    };
  }

  private static calculateCertificationsSummary(data: any[]) {
    const vigente = data.filter(d => d.status === 'Vigente').length;
    const proxVencer = data.filter(d => d.status === 'Próximo a Vencer').length;
    const vencido = data.filter(d => d.status === 'Vencido').length;

    return {
      totalRecords: data.length,
      aggregations: {
        vigente,
        proximoAVencer: proxVencer,
        vencido,
        avgScore: Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length || 0)
      },
      charts: [
        {
          type: 'pie' as const,
          title: 'Estado de Certificaciones',
          data: [
            { name: 'Vigente', value: vigente },
            { name: 'Próximo a Vencer', value: proxVencer },
            { name: 'Vencido', value: vencido }
          ]
        }
      ]
    };
  }

  private static calculatePendingAssignmentsSummary(data: any[]) {
    const critica = data.filter(d => d.priority === 'Crítica').length;
    const alta = data.filter(d => d.priority === 'Alta').length;
    const media = data.filter(d => d.priority === 'Media').length;
    const baja = data.filter(d => d.priority === 'Baja').length;

    return {
      totalRecords: data.length,
      aggregations: {
        critica,
        alta,
        media,
        baja,
        avgProgress: Math.round(data.reduce((sum, d) => sum + d.progress, 0) / data.length || 0)
      },
      charts: [
        {
          type: 'pie' as const,
          title: 'Distribución por Prioridad',
          data: [
            { name: 'Crítica', value: critica },
            { name: 'Alta', value: alta },
            { name: 'Media', value: media },
            { name: 'Baja', value: baja }
          ]
        }
      ]
    };
  }

  private static calculateSystemPerformanceSummary(data: any[]) {
    return {
      totalRecords: data.length,
      aggregations: {
        metricsAboveTarget: data.filter(d => d.achievement >= 100).length,
        avgAchievement: Math.round(data.reduce((sum, d) => sum + d.achievement, 0) / data.length || 0)
      },
      charts: []
    };
  }

  private static calculateCompletionHistorySummary(data: any[]) {
    return {
      totalRecords: data.length,
      aggregations: {
        certificatesIssued: data.filter(d => d.certificateIssued === 'Sí').length,
        avgDuration: Math.round(data.reduce((sum, d) => sum + d.duration, 0) / data.length || 0),
        avgScore: Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length || 0)
      },
      charts: []
    };
  }
}

// MIGRACIÓN C#:
// - Crear ReportGeneratorService con inyección de dependencias
// - Implementar queries SQL optimizadas con Entity Framework Core
// - Añadir caché de reportes generados recientemente
// - Implementar generación asíncrona para reportes grandes
