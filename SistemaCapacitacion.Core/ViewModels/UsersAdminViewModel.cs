using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    public class UserCardViewModel
    {
        public Guid UserId { get; set; }
        public string Initials { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string DisplayRole { get; set; } = string.Empty;   // Empleado, Becario, Administrador, RH…
        public string Position { get; set; } = string.Empty;      // Puesto “decorativo”
        public bool IsActive { get; set; }
        public string Role { get; set; } = string.Empty;

        public int AssignedCourses { get; set; }                  // Inscritos
        public int CompletedCourses { get; set; }                 // Completados
        public double CompletionPercent { get; set; }             // 0..100
        // Estado del usuario (Active, Inactive, etc. desde la tabla User.Status)
        public string Status { get; set; } = string.Empty;

        // Cursos inscritos (conteo de UserCourse por usuario)
        public int CoursesEnrolled { get; set; }

        // Cursos completados (UserCourse.Status == "Completed")
        public int CoursesCompleted { get; set; }

        // Porcentaje de progreso general del usuario
        public double ProgressPercent { get; set; }
        public DateTime? LastActivity { get; set; }               // Última actividad

        public string? PhotoUrl { get; set; } // <--- AGREGA ESTO
    }

    public class UsersAdminViewModel
    {
        // Métricas superiores
        public int TotalUsers { get; set; }
        public int EmployeesCount { get; set; }
        public int InternsCount { get; set; }         // Becarios
        public int ActiveUsersCount { get; set; }
        public double AverageProgress { get; set; }   // Progreso promedio (%)
        public int ActiveUsers { get; set; }

        // Filtros actuales
        public string? Search { get; set; }
        public string? RoleFilter { get; set; }
        public string? StatusFilter { get; set; }

        // Listado de tarjetas
        public List<UserCardViewModel> Users { get; set; } = new();
    }
}
