using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;

namespace SistemaCapacitacion.API.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _db;

        public AdminController(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Dashboard()
        {
            // Totales
            var totalUsers = await _db.Users.CountAsync();
            var activeCourses = await _db.Courses.CountAsync(c => c.IsActive);
            var certificates = await _db.Certificates.CountAsync();

            var totalAssign = await _db.UserCourses.CountAsync();
            var completedUC = await _db.UserCourses.CountAsync(uc => uc.Status == "Completed");
            var completionRate = totalAssign == 0
                ? 0
                : Math.Round((double)completedUC / totalAssign * 100, 1);
            
            var now = DateTime.UtcNow;

            // Actividad reciente -> aquí sigues usando tu proyección a ActivityDto
            var recent = await _db.Activities
             .OrderByDescending(a => a.CreatedAt)
             .Take(6)
             .Select(a => new DashboardActivityItemViewModel
             {
                 // Si tuvieras el nombre del usuario podrías calcular las iniciales aquí.
                 Initials = "AG",  // TODO: calcular a partir del usuario real si lo necesitas

                 // En tu tabla Activity (según la captura) tienes columnas:
                 // Action, Description, CreatedAt, etc.
                 Title = a.Action,               // título corto (lo que se muestra en negritas)
                 Description = a.Description,    // texto debajo
                 TimeAgo = ""                    // luego puedes formatearlo con un helper
             })
             .ToListAsync();

            // TOP COURSES
            var top = await _db.UserCourses
                .GroupBy(uc => uc.CourseId)
                .Select(g => new
                {
                    CourseId = g.Key,
                    Enrolled = g.Count(),
                    Completed = g.Count(uc => uc.Status == "Completed")
                })
                .OrderByDescending(x => x.Enrolled)
                .Take(4)
                .Join(
                    _db.Courses,                 // tabla de cursos
                    stats => stats.CourseId,
                    c => c.IdCourse,
                    (stats, c) => new CourseRankDto(
                        Title: c.Title ?? "Curso",
                        // AQUÍ ESTÁ LA CORRECCIÓN:
                        Category: (c.Category != null ? c.Category.Name : "General"),
                        Completed: stats.Completed,
                        Enrolled: stats.Enrolled
                    )
                )
                .ToListAsync();


            // Si usas TotalCourses en la vista
            var totalCourses = await _db.Courses.CountAsync();

            // NOTA: por ahora los "delta" y métricas avanzadas los dejamos como valores
            // de ejemplo. Más adelante los calculas bien (último mes vs anterior, etc.)
            var vm = new DashboardAdminViewModel
            {
                TotalUsers = totalUsers,
                TotalCourses = totalCourses,
                ActiveCourses = activeCourses,
                CompletionRate = completionRate,
                CertificatesIssued = certificates,

                // Deltas de ejemplo (no rompen nada y luego los mejoras)
                UsersDelta = 0,
                CoursesDelta = 0,
                CompletionDeltaText = "Sin cambios respecto al periodo anterior",
                CertificatesDelta = 0,

                // Métricas avanzadas de ejemplo
                EngagementScore = 0,
                CoursesPerSprint = 0,
                CoursesPerSprintPercent = 0,
                FlowEfficiency = 0,
                GlobalProgress = completionRate, // por ahora puedes usar el mismo %

                RecentActivities = recent,
                TopCourses = top
            };
           // Simular notificaciones por ahora(o luego las sacas de la tabla Notification).
            ViewBag.UnreadNotifications = 0;
            ViewBag.Notifications = Array.Empty<object>();

            return View("Dashboard", vm);
        }

        /// <summary>
        /// Convierte un DateTime (CreatedAt) en un texto tipo "hace 2 horas".
        /// </summary>
        private static string HumanizeTimeAgo(DateTime createdAt)
        {
            var now = DateTime.UtcNow;
            var diff = now - createdAt.ToUniversalTime();

            if (diff.TotalMinutes < 1)
                return "hace unos segundos";

            if (diff.TotalHours < 1)
                return $"hace {diff.Minutes} min";

            if (diff.TotalDays < 1)
                return $"hace {diff.Hours} h";

            if (diff.TotalDays < 7)
                return $"hace {diff.Days} días";

            return createdAt.ToString("dd/MM/yyyy");
        }
    }
}
