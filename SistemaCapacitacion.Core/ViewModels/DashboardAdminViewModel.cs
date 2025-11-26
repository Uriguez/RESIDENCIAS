using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Datos para el dashboard del Administrador.
    /// </summary>
    public sealed class DashboardAdminViewModel
    {
        // Información general
        public DateTime LastUpdated { get; set; } = DateTime.Now;

        // ==== MÉTRICAS PRINCIPALES (fila superior) ====
        public int TotalUsers { get; set; }          // Usuarios Totales
        public int TotalCourses { get; set; }        // Cursos Totales (si lo usas en la vista)
        public int ActiveCourses { get; set; }       // Cursos Activos
        public double CompletionRate { get; set; }   // % de finalización global (0..100)
        public int CertificatesIssued { get; set; }  // Certificados emitidos

        // Deltas vs periodo anterior (para los textos verdes/rojos bajo cada métrica)
        public int UsersDelta { get; set; }              // Ej: +12
        public int CoursesDelta { get; set; }            // Ej: +3
        public string CompletionDeltaText { get; set; }  // Ej: "+5.2% vs mes anterior"
        public int CertificatesDelta { get; set; }       // Ej: "+18"

        // ==== MÉTRICAS AVANZADAS / METODOLOGÍA ====
        // Puedes ajustar los tipos a int si prefieres, pero double te deja poner decimales.
        public double EngagementScore { get; set; }          // Ej: 8.7 / 10
        public double CoursesPerSprint { get; set; }         // Cursos completados por sprint
        public double CoursesPerSprintPercent { get; set; }  // % objetivo cumplido en el sprint
        public double FlowEfficiency { get; set; }           // % de eficiencia de flujo
        public double GlobalProgress { get; set; }           // % de progreso global de capacitación

        // ==== LISTAS ====

        /// <summary>
        /// Últimas acciones realizadas en el sistema (sin nombres propios).
        /// OJO: usa el ActivityDto que ya tienes en CommonDtos.cs.
        /// </summary>
        
        public IReadOnlyList<DashboardActivityItemViewModel> RecentActivities { get; set; }
            = Array.Empty<DashboardActivityItemViewModel>();

        /// <summary>
        /// Cursos más populares / con mayor engagement.
        /// </summary>
        public IReadOnlyList<CourseRankDto> TopCourses { get; set; }
            = Array.Empty<CourseRankDto>();
    }
}
