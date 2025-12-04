using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Datos para el inicio del Empleado/Becario.
    /// </summary>
    public sealed class DashboardEmployeeViewModel
    {
        public string FullName { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.Now;
        public int AssignedCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedCount { get; set; }
        public int CertificatesCount { get; set; }

        public double CompletionRate { get; set; }

        public IReadOnlyList<MyCourseItem> MyCourses { get; set; }
            = Array.Empty<MyCourseItem>();

        public IReadOnlyList<ActivityDto> RecentActivity { get; set; }
            = Array.Empty<ActivityDto>();

       
    }

    /// <summary>Ítem de curso asignado al usuario.</summary>
    public sealed class MyCourseItem
    {
        public long CourseId { get; set; }
        public string Title { get; set; } = "Curso";
        public string Category { get; set; } = "General";

        /// <summary>Progreso en porcentaje (0..100).</summary>
        public decimal ProgressPercent { get; set; }

        /// <summary>Fecha límite (opcional).</summary>
        public DateTime? DueAt { get; set; }

        /// <summary>Assigned | InProgress | Completed</summary>
        public string Status { get; set; } = "Assigned";

        /// <summary>Último evento relevante (asignación, avance, finalización).</summary>
        public DateTime LastEventAt { get; set; } = DateTime.Now;
    }

}
