import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';

// Analytics Events específicos para el sistema Griver
interface AnalyticsEvent {
  action: string;
  category: 'education' | 'navigation' | 'user_management' | 'system' | 'methodology';
  label?: string;
  value?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

// Métricas Kanban para tracking del desarrollo
interface KanbanMetrics {
  leadTime: number; // Tiempo total desde Backlog → Done
  cycleTime: number; // Tiempo desde Development → Done
  throughput: number; // Features completadas por sprint
  wipAge: number; // Tiempo promedio en cada columna
  flowEfficiency: number; // % tiempo de trabajo vs tiempo de espera
}

// Business metrics específicos de Griver
interface BusinessMetrics {
  userEngagement: number;
  courseCompletionRate: number;
  averageSessionTime: number;
  featureAdoptionRate: number;
  supportTicketRate: number;
  npsScore: number;
}

interface GriverAnalyticsData {
  kanbanMetrics: KanbanMetrics;
  businessMetrics: BusinessMetrics;
  events: AnalyticsEvent[];
  lastUpdated: string;
}

/**
 * Hook personalizado para analytics del sistema Griver
 * Integra métricas de desarrollo (Kanban + Scrum) con métricas de negocio
 */
export function useGriverAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<GriverAnalyticsData>({
    kanbanMetrics: {
      leadTime: 2.5, // días
      cycleTime: 1.2, // días
      throughput: 10, // features por sprint
      wipAge: 0.8, // días
      flowEfficiency: 85 // porcentaje
    },
    businessMetrics: {
      userEngagement: 87.5,
      courseCompletionRate: 92.3,
      averageSessionTime: 24.5, // minutos
      featureAdoptionRate: 78.2,
      supportTicketRate: 2.1,
      npsScore: 8.7
    },
    events: [],
    lastUpdated: new Date().toISOString()
  });

  /**
   * Tracking de eventos específicos del sistema Griver
   */
  const track = useCallback((event: AnalyticsEvent) => {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      userId: user?.id,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
        userRole: user?.role,
        sessionId: getSessionId(),
        buildVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Griver Analytics Event:', enrichedEvent);
    }

    // Integración con servicios externos (Google Analytics, Mixpanel, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: user?.id,
        custom_map: {
          methodology: 'kanban_scrum_hybrid',
          company: 'griver'
        }
      });
    }

    // Actualizar estado local
    setAnalyticsData(prev => ({
      ...prev,
      events: [...prev.events.slice(-99), enrichedEvent], // Mantener últimos 100 eventos
      lastUpdated: new Date().toISOString()
    }));
  }, [user?.id, user?.role]);

  /**
   * Eventos específicos de educación/capacitación
   */
  const trackEducation = useMemo(() => ({
    courseStart: (courseId: string, courseTitle: string) => track({
      action: 'course_start',
      category: 'education',
      label: courseId,
      metadata: { courseTitle, startTime: new Date().toISOString() }
    }),

    courseProgress: (courseId: string, progress: number) => track({
      action: 'course_progress',
      category: 'education',
      label: courseId,
      value: progress,
      metadata: { milestone: getMilestone(progress) }
    }),

    courseComplete: (courseId: string, score: number, timeSpent: number) => track({
      action: 'course_complete',
      category: 'education',
      label: courseId,
      value: score,
      metadata: { 
        timeSpent, 
        completionTime: new Date().toISOString(),
        isFirstCompletion: true 
      }
    }),

    certificateDownload: (courseId: string, certificateId: string) => track({
      action: 'certificate_download',
      category: 'education',
      label: courseId,
      metadata: { certificateId }
    }),

    quizAttempt: (courseId: string, quizId: string, score: number, attempts: number) => track({
      action: 'quiz_attempt',
      category: 'education',
      label: `${courseId}_${quizId}`,
      value: score,
      metadata: { attempts, isRetake: attempts > 1 }
    })
  }), [track]);

  /**
   * Eventos de navegación y UX
   */
  const trackNavigation = useMemo(() => ({
    sectionChange: (fromSection: string, toSection: string) => track({
      action: 'section_change',
      category: 'navigation',
      label: `${fromSection}_to_${toSection}`,
      metadata: { navigationTime: new Date().toISOString() }
    }),

    searchPerformed: (query: string, results: number) => track({
      action: 'search_performed',
      category: 'navigation',
      label: query,
      value: results,
      metadata: { hasResults: results > 0 }
    }),

    featureUsed: (feature: string, context?: string) => track({
      action: 'feature_used',
      category: 'navigation',
      label: feature,
      metadata: { context, featureAdoption: true }
    })
  }), [track]);

  /**
   * Eventos de gestión de usuarios (solo admin/RH)
   */
  const trackUserManagement = useMemo(() => ({
    userCreated: (newUserId: string, role: string) => track({
      action: 'user_created',
      category: 'user_management',
      label: role,
      metadata: { newUserId, createdBy: user?.id }
    }),

    courseAssigned: (targetUserId: string, courseId: string) => track({
      action: 'course_assigned',
      category: 'user_management',
      label: courseId,
      metadata: { targetUserId, assignedBy: user?.id }
    }),

    reportGenerated: (reportType: string, filters: any) => track({
      action: 'report_generated',
      category: 'user_management',
      label: reportType,
      metadata: { filters, generatedAt: new Date().toISOString() }
    })
  }), [track, user?.id]);

  /**
   * Métricas de metodología ágil (Kanban + Scrum)
   */
  const trackMethodology = useMemo(() => ({
    sprintStarted: (sprintId: string, goals: string[], teamSize: number) => track({
      action: 'sprint_started',
      category: 'methodology',
      label: sprintId,
      value: teamSize,
      metadata: { 
        goals, 
        methodology: 'kanban_scrum_hybrid',
        sprintDuration: 14 // días
      }
    }),

    storyCompleted: (storyId: string, storyPoints: number, leadTime: number) => track({
      action: 'story_completed',
      category: 'methodology',
      label: storyId,
      value: storyPoints,
      metadata: { 
        leadTime,
        cycleTime: leadTime * 0.6, // Estimación
        completedInSprint: true
      }
    }),

    wipLimitExceeded: (column: string, currentWip: number, limit: number) => track({
      action: 'wip_limit_exceeded',
      category: 'methodology',
      label: column,
      value: currentWip - limit,
      metadata: { currentWip, limit, needsAttention: true }
    }),

    retrospectiveCompleted: (sprintId: string, improvements: string[]) => track({
      action: 'retrospective_completed',
      category: 'methodology',
      label: sprintId,
      metadata: { 
        improvements,
        retrospectiveType: 'start_stop_continue',
        actionItems: improvements.length
      }
    })
  }), [track]);

  /**
   * Actualizar métricas Kanban basadas en eventos
   */
  const updateKanbanMetrics = useCallback((newMetrics: Partial<KanbanMetrics>) => {
    setAnalyticsData(prev => ({
      ...prev,
      kanbanMetrics: { ...prev.kanbanMetrics, ...newMetrics },
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  /**
   * Calcular métricas de flujo en tiempo real
   */
  const calculateFlowMetrics = useCallback(() => {
    // Simulación de cálculo de métricas basadas en eventos reales
    const recentEvents = analyticsData.events.slice(-50);
    const completedStories = recentEvents.filter(e => e.action === 'story_completed');
    
    if (completedStories.length > 0) {
      const avgLeadTime = completedStories.reduce((acc, event) => 
        acc + (event.metadata?.leadTime || 0), 0) / completedStories.length;
      
      const avgCycleTime = avgLeadTime * 0.6; // Estimación
      const throughput = completedStories.length;
      
      updateKanbanMetrics({
        leadTime: avgLeadTime,
        cycleTime: avgCycleTime,
        throughput,
        flowEfficiency: Math.min(95, (avgCycleTime / avgLeadTime) * 100)
      });
    }
  }, [analyticsData.events, updateKanbanMetrics]);

  /**
   * Obtener métricas de rendimiento del equipo
   */
  const getTeamPerformance = useCallback(() => {
    const { kanbanMetrics } = analyticsData;
    
    return {
      velocity: kanbanMetrics.throughput,
      predictability: kanbanMetrics.flowEfficiency > 80 ? 'Alta' : 'Media',
      efficiency: kanbanMetrics.flowEfficiency,
      bottleneck: kanbanMetrics.wipAge > 1.5 ? 'Detectado' : 'Ninguno',
      trend: 'Positiva', // Basado en histórico
      recommendations: generateRecommendations(kanbanMetrics)
    };
  }, [analyticsData.kanbanMetrics]);

  // Stabilize helper functions
  const getKanbanHealth = useCallback(() => calculateKanbanHealth(analyticsData.kanbanMetrics), [analyticsData.kanbanMetrics]);
  const getBusinessHealth = useCallback(() => calculateBusinessHealth(analyticsData.businessMetrics), [analyticsData.businessMetrics]);
  const exportData = useCallback(() => exportAnalyticsData(analyticsData), [analyticsData]);

  return {
    // Datos
    analyticsData,
    
    // Tracking methods (now stable with useMemo/useCallback)
    track,
    trackEducation,
    trackNavigation,
    trackUserManagement,
    trackMethodology,
    
    // Metrics
    updateKanbanMetrics,
    getTeamPerformance,
    calculateFlowMetrics,
    
    // Helpers
    getKanbanHealth,
    getBusinessHealth,
    exportData
  };
}

// Helper functions
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('griver_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('griver_session_id', sessionId);
  }
  return sessionId;
}

function getMilestone(progress: number): string {
  if (progress >= 100) return 'completed';
  if (progress >= 75) return 'almost_done';
  if (progress >= 50) return 'halfway';
  if (progress >= 25) return 'getting_started';
  return 'just_started';
}

function generateRecommendations(metrics: KanbanMetrics): string[] {
  const recommendations: string[] = [];
  
  if (metrics.leadTime > 3) {
    recommendations.push('Considerar dividir stories más grandes');
  }
  
  if (metrics.flowEfficiency < 70) {
    recommendations.push('Revisar cuellos de botella en el proceso');
  }
  
  if (metrics.wipAge > 2) {
    recommendations.push('Reducir límites WIP para mejorar flujo');
  }
  
  if (metrics.throughput < 8) {
    recommendations.push('Evaluar capacidad del equipo');
  }
  
  return recommendations;
}

function calculateKanbanHealth(metrics: KanbanMetrics): 'excellent' | 'good' | 'needs_attention' {
  const score = (
    (metrics.flowEfficiency > 80 ? 25 : 0) +
    (metrics.leadTime < 3 ? 25 : 0) +
    (metrics.cycleTime < 1.5 ? 25 : 0) +
    (metrics.throughput >= 8 ? 25 : 0)
  );
  
  if (score >= 75) return 'excellent';
  if (score >= 50) return 'good';
  return 'needs_attention';
}

function calculateBusinessHealth(metrics: BusinessMetrics): 'excellent' | 'good' | 'needs_attention' {
  const score = (
    (metrics.userEngagement > 85 ? 20 : 0) +
    (metrics.courseCompletionRate > 90 ? 20 : 0) +
    (metrics.featureAdoptionRate > 75 ? 20 : 0) +
    (metrics.supportTicketRate < 5 ? 20 : 0) +
    (metrics.npsScore > 8 ? 20 : 0)
  );
  
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'needs_attention';
}

function exportAnalyticsData(data: GriverAnalyticsData): string {
  return JSON.stringify({
    ...data,
    exportedAt: new Date().toISOString(),
    exportedBy: 'griver_analytics_system'
  }, null, 2);
}