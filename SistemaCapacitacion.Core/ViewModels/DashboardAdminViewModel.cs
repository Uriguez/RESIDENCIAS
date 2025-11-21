using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Datos para el dashboard del Administrador.
    /// </summary>
    public sealed class DashboardAdminViewModel
    {
        public DateTime LastUpdated { get; set; } = DateTime.Now;

        public int TotalUsers { get; set; }
        public int ActiveCourses { get; set; }

        /// <summary>Porcentaje de finalización global (0..100).</summary>
        public double CompletionRate { get; set; }

        public int CertificatesIssued { get; set; }

        /// <summary>Últimas acciones realizadas en el sistema (sin nombres propios).</summary>
        public IReadOnlyList<ActivityDto> RecentActivities { get; set; } = Array.Empty<ActivityDto>();

        /// <summary>Cursos más populares / con mayor engagement.</summary>
        public IReadOnlyList<CourseRankDto> TopCourses { get; set; } = Array.Empty<CourseRankDto>();
    }
}
