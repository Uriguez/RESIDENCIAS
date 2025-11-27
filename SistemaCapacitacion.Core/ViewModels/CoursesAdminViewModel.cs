using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Modelo de datos para la pantalla de Gestión de Cursos del administrador.
    /// Solo usa columnas que existen en la base de datos.
    /// </summary>
    public sealed class CoursesAdminViewModel
    {
        // Filtros de la parte superior
        public string SearchTerm { get; set; } = string.Empty;

        /// <summary>
        /// Filtro de estado actual: "all", "active" o "inactive".
        /// (En el diseño se muestran pestañas: Todos, Activos, Borradores, Archivados;
        /// por ahora mapeamos Borradores/Archivados a "inactive" si en el futuro agregas columnas).
        /// </summary>
        public string StateFilter { get; set; } = "all";

        // Métricas superiores (tarjetas)
        public int TotalCourses { get; set; }
        public int ActiveCourses { get; set; }
        public int TotalStudents { get; set; }

        /// <summary>
        /// Porcentaje promedio de finalización de todos los cursos (0..100).
        /// </summary>
        public double AverageCompletion { get; set; }

        /// <summary>
        /// Lista de cursos mostrados en la grilla principal.
        /// </summary>
        public IReadOnlyList<CourseCardViewModel> Courses { get; set; }
            = Array.Empty<CourseCardViewModel>();
    }

    /// <summary>
    /// Datos que necesita cada tarjeta de curso en la grilla inferior.
    /// </summary>
    public sealed class CourseCardViewModel
    {
        public int IdCourse { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Estado actual del curso (IsActive en la BD).
        /// </summary>
        public bool IsActive { get; set; }

        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Duración total aproximada del curso en minutos
        /// (suma de DurationMinutes de CourseContent).
        /// </summary>
        public int DurationMinutes { get; set; }

        /// <summary>
        /// Número de estudiantes inscritos al curso
        /// (conteo en UserCourse).
        /// </summary>
        public int StudentsCount { get; set; }

        /// <summary>
        /// Porcentaje de usuarios que han completado el curso (0..100).
        /// Calculado usando UserCourse.Status = "Completed".
        /// </summary>
        public double CompletionPercent { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
