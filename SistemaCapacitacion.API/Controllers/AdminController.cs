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

            // Actividad reciente
            var recent = await _db.Activities
             .OrderByDescending(a => a.CreatedAt)
             .Take(6)
             .Select(a => new DashboardActivityItemViewModel
             {
                 Initials = "AG",  // TODO: calcular a partir del usuario real si lo necesitas
                 Title = a.Action,
                 Description = a.Description,
                 TimeAgo = ""      // luego puedes formatearlo con un helper
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
                    _db.Courses,
                    stats => stats.CourseId,
                    c => c.IdCourse,
                    (stats, c) => new CourseRankDto(
                        Title: c.Title ?? "Curso",
                        Category: (c.Category != null ? c.Category.Name : "General"),
                        Completed: stats.Completed,
                        Enrolled: stats.Enrolled
                    )
                )
                .ToListAsync();

            var totalCourses = await _db.Courses.CountAsync();

            var vm = new DashboardAdminViewModel
            {
                TotalUsers = totalUsers,
                TotalCourses = totalCourses,
                ActiveCourses = activeCourses,
                CompletionRate = completionRate,
                CertificatesIssued = certificates,

                UsersDelta = 0,
                CoursesDelta = 0,
                CompletionDeltaText = "Sin cambios respecto al periodo anterior",
                CertificatesDelta = 0,

                EngagementScore = 0,
                CoursesPerSprint = 0,
                CoursesPerSprintPercent = 0,
                FlowEfficiency = 0,
                GlobalProgress = completionRate,

                RecentActivities = recent,
                TopCourses = top
            };

            // Simular notificaciones por ahora
            ViewBag.UnreadNotifications = 0;
            ViewBag.Notifications = Array.Empty<object>();

            return View("Dashboard", vm);
        }

        /// <summary>
        /// Listado tipo "Gestión de Usuarios" con tarjetas por usuario.
        /// Muestra cursos inscritos/completados y asigna puestos decorativos.
        /// </summary>
        public async Task<IActionResult> Users(string roleFilter = "Todos", string statusFilter = "Todos")
        {
            // --- Estadísticas de cabecera ---
            var totalUsers = await _db.Users.CountAsync();
            var employeesCount = await _db.Users.CountAsync(u => u.DepartmentId == 3); // Departamento "Empleado"
            var internsCount = await _db.Users.CountAsync(u => u.DepartmentId == 4);   // Departamento "Trainee"
            var activeUsers = await _db.Users.CountAsync(u => u.Status == "Active");

            // Cursos por usuario (inscritos / completados)
            var userCourseStats = await _db.UserCourses
                .GroupBy(uc => uc.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    Enrolled = g.Count(),
                    Completed = g.Count(uc => uc.Status == "Completed")
                })
                .ToListAsync();

            var statsByUser = userCourseStats
                .ToDictionary(x => x.UserId, x => x);

            // Query base con usuario + departamento + rol
            var baseQuery =
                from u in _db.Users
                join d in _db.Departments on u.DepartmentId equals d.IdDepartment into deptJoin
                from d in deptJoin.DefaultIfEmpty()
                join ur in _db.UserRoles on u.IdUser equals ur.UserId into urJoin
                from ur in urJoin.DefaultIfEmpty()
                join r in _db.Roles on ur.RoleId equals r.IdRole into roleJoin
                from r in roleJoin.DefaultIfEmpty()
                select new
                {
                    u.IdUser,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Status,
                    DepartmentName = d != null ? d.Name : null,
                    RoleName = r != null ? r.Name : null,
                    u.Position
                };

            // Filtros de rol y estado (para los chips de filtros de la vista)
            if (!string.IsNullOrWhiteSpace(roleFilter) && roleFilter != "Todos")
            {
                baseQuery = baseQuery.Where(x => x.RoleName == roleFilter);
            }

            if (!string.IsNullOrWhiteSpace(statusFilter) && statusFilter != "Todos")
            {
                baseQuery = baseQuery.Where(x => x.Status == statusFilter);
            }

            var rawUsers = await baseQuery
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ToListAsync();

            // Puestos decorativos (si Position en BD viene nulo/vacío)
            string[] decorativePositions =
            {
                "Analista de sistemas",
                "Desarrollador de software",
                "Coordinador de capacitación",
                "Especialista en soporte",
                "Líder de proyecto",
                "Becario de TI"
            };

            var userCards = rawUsers
                .Select((u, index) =>
                {
                    statsByUser.TryGetValue(u.IdUser, out var st);
                    var enrolled = st?.Enrolled ?? 0;
                    var completed = st?.Completed ?? 0;
                    var progress = enrolled == 0
                        ? 0
                        : (int)Math.Round((double)completed / enrolled * 100);

                    var position = !string.IsNullOrWhiteSpace(u.Position)
                        ? u.Position
                        : decorativePositions[index % decorativePositions.Length];

                    return new UserCardViewModel
                    {
                        UserId = u.IdUser,
                        FullName = $"{u.FirstName} {u.LastName}",
                        Email = u.Email,
                        Department = u.DepartmentName ?? "Sin departamento",
                        Role = u.RoleName ?? "Empleado",
                        Status = u.Status,
                        Position = position,
                        CoursesEnrolled = enrolled,
                        CoursesCompleted = completed,
                        ProgressPercent = progress
                    };
                })
                .ToList();

            var averageProgress = userCards.Count == 0
                ? 0
                : Math.Round(userCards.Average(u => u.ProgressPercent), 1);

            var vm = new UsersAdminViewModel
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                EmployeesCount = employeesCount,
                InternsCount = internsCount,
                AverageProgress = averageProgress,
                Users = userCards
            };

            return View("Users", vm);
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
