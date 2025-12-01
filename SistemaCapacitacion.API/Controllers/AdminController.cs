using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

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
                    u.Position,
                    u.PhotoUrl 
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
                        ProgressPercent = progress,
                        PhotoUrl = u.PhotoUrl
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


// ...

public async Task<IActionResult> Analytics()
    {
        var vm = new AdvancedAnalyticsViewModel();

        var now = DateTime.UtcNow;
        var today = now.Date;

        // ───────────────── Tarjetas superiores ─────────────────

        vm.TotalUsers = await _db.Users.CountAsync();

        // Usuarios activos = con progreso en últimos 30 días
        var startCurrent = today.AddDays(-30);
        var startPrevious = today.AddDays(-60);
        var endPrevious = startCurrent.AddDays(-1);

        var activeCurrent = await _db.Progress
            .Where(p => p.LastAccessed >= startCurrent)
            .Select(p => p.UserId)
            .Distinct()
            .CountAsync();

        var activePrevious = await _db.Progress
            .Where(p => p.LastAccessed >= startPrevious && p.LastAccessed < startCurrent)
            .Select(p => p.UserId)
            .Distinct()
            .CountAsync();

        vm.ActiveUsersLast30Days = activeCurrent;
        vm.ActiveUsersDeltaPercent = activePrevious == 0
            ? 0
            : Math.Round(((double)activeCurrent - activePrevious) / activePrevious * 100, 1);

        // Tasa global de finalización
        var totalAssignments = await _db.UserCourses.CountAsync();
        var completedAssignments = await _db.UserCourses
            .CountAsync(uc => uc.Status == "Completed");

        vm.GlobalCompletionRate = totalAssignments == 0
            ? 0
            : Math.Round((double)completedAssignments / totalAssignments * 100, 1);

        // Para el delta, comparamos últimos 30 días vs 30 días previos
        var completedCurrentPeriod = await _db.UserCourses
            .Where(uc => uc.CompletionDate != null && uc.CompletionDate >= startCurrent)
            .CountAsync();

        var completedPreviousPeriod = await _db.UserCourses
            .Where(uc => uc.CompletionDate != null &&
                         uc.CompletionDate >= startPrevious &&
                         uc.CompletionDate < startCurrent)
            .CountAsync();

        vm.CompletionDeltaPercent = completedPreviousPeriod == 0
            ? 0
            : Math.Round(((double)completedCurrentPeriod - completedPreviousPeriod) /
                         completedPreviousPeriod * 100, 1);

        // Satisfacción promedio: usamos Progress.Score como "calificación" 0–100
        var scoresCurrent = await _db.Progress
            .Where(p => p.Score != null)
            .Select(p => p.Score!.Value)
            .ToListAsync();

        vm.AverageScore = scoresCurrent.Count == 0
            ? 0
            : Math.Round(scoresCurrent.Average(), 1);

        // Delta de score entre últimos 30 días y 30 previos
        var scoresPrevWindow = await _db.Progress
            .Where(p => p.Score != null &&
                        p.LastAccessed >= startPrevious &&
                        p.LastAccessed < startCurrent)
            .Select(p => p.Score!.Value)
            .ToListAsync();

        var avgCurrentScore = scoresCurrent.Count == 0 ? 0 : scoresCurrent.Average();
        var avgPrevScore = scoresPrevWindow.Count == 0 ? 0 : scoresPrevWindow.Average();

        vm.ScoreDeltaPercent = avgPrevScore == 0
            ? 0
            : Math.Round((avgCurrentScore - avgPrevScore) / avgPrevScore * 100, 1);

        // Horas de aprendizaje = sum(TimeSpentMinutes) / 60
        var minutesCurrent = await _db.Progress
            .Where(p => p.LastAccessed >= startCurrent)
            .Select(p => p.TimeSpentMinutes)
            .ToListAsync();

        vm.TotalLearningHours = minutesCurrent.Sum() / 60.0;

        var minutesPrev = await _db.Progress
            .Where(p => p.LastAccessed >= startPrevious &&
                        p.LastAccessed < startCurrent)
            .Select(p => p.TimeSpentMinutes)
            .ToListAsync();

        var hoursCurrent = minutesCurrent.Sum() / 60.0;
        var hoursPrev = minutesPrev.Sum() / 60.0;

        vm.LearningHoursDeltaPercent = hoursPrev == 0
            ? 0
            : Math.Round((hoursCurrent - hoursPrev) / hoursPrev * 100, 1);

        // ───────────────── Resumen general (últimos 6 meses) ─────────────────

        var start6Months = new DateTime(today.Year, today.Month, 1).AddMonths(-5);

        // Inscripciones / finalizaciones por mes
        var rawMonthlyEnrollments = await _db.UserCourses
            .Where(uc => uc.AssignedDate != null && uc.AssignedDate >= start6Months)
            .GroupBy(uc => new { uc.AssignedDate!.Value.Year, uc.AssignedDate!.Value.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Enrolled = g.Count(),
                Completed = g.Count(uc => uc.Status == "Completed")
            })
            .ToListAsync();

        var monthlyEnrollments = new List<MonthlyEnrollmentPoint>();
        for (int i = 0; i < 6; i++)
        {
            var date = start6Months.AddMonths(i);
            var data = rawMonthlyEnrollments
                .FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);

            monthlyEnrollments.Add(new MonthlyEnrollmentPoint
            {
                Label = $"{CultureInfo.GetCultureInfo("es-MX").DateTimeFormat.GetAbbreviatedMonthName(date.Month)} {date.Year}",
                Enrolled = data?.Enrolled ?? 0,
                Completed = data?.Completed ?? 0
            });
        }
        vm.MonthlyEnrollments = monthlyEnrollments;

        // Crecimiento de usuarios por mes
        var rawMonthlyUsers = await _db.Users
            .Where(u => u.CreatedAt >= start6Months)
            .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                NewUsers = g.Count()
            })
            .ToListAsync();

        var monthlyUsers = new List<MonthlyUserGrowthPoint>();
        int accumulated = 0;

        for (int i = 0; i < 6; i++)
        {
            var date = start6Months.AddMonths(i);
            var data = rawMonthlyUsers
                .FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);

            var newUsers = data?.NewUsers ?? 0;
            accumulated += newUsers;

            monthlyUsers.Add(new MonthlyUserGrowthPoint
            {
                Label = $"{CultureInfo.GetCultureInfo("es-MX").DateTimeFormat.GetAbbreviatedMonthName(date.Month)} {date.Year}",
                NewUsers = newUsers,
                AccumulatedUsers = accumulated
            });
        }
        vm.MonthlyUserGrowth = monthlyUsers;

        // ───────────────── Análisis por curso ─────────────────

        var coursePerf = await _db.UserCourses
            .Include(uc => uc.Course)
            .GroupBy(uc => uc.CourseId)
            .Select(g => new CoursePerformanceItem
            {
                CourseTitle = g.Select(x => x.Course.Title).FirstOrDefault() ?? "Curso",
                Enrolled = g.Count(),
                Completed = g.Count(x => x.Status == "Completed")
            })
            .OrderByDescending(x => x.Enrolled)
            .ToListAsync();

        vm.CoursePerformance = coursePerf;

        // "Satisfacción" por curso = promedio de Score del progreso de ese curso
        var courseScores = await _db.Progress
            .Where(p => p.Score != null)
            .Include(p => p.Course)
            .GroupBy(p => p.CourseId)
            .Select(g => new CourseScoreItem
            {
                CourseTitle = g.Select(x => x.Course.Title).FirstOrDefault() ?? "Curso",
                AverageScore = g.Average(x => x.Score) ?? 0
            })
            .OrderByDescending(x => x.AverageScore)
            .ToListAsync();

        vm.CourseScores = courseScores;

        // ───────────────── Participación por departamento ─────────────────

        var totalUsersForDept = await _db.Users.CountAsync();

        var deptData = await _db.Users
            .Include(u => u.Department)
            .Where(u => u.DepartmentId != null)
            .GroupBy(u => new { u.DepartmentId, u.Department.Name })
            .Select(g => new DepartmentParticipationItem
            {
                DepartmentName = g.Key.Name,
                UsersCount = g.Count()
            })
            .ToListAsync();

        foreach (var d in deptData)
        {
            d.Percent = totalUsersForDept == 0
                ? 0
                : Math.Round((double)d.UsersCount / totalUsersForDept * 100, 1);
        }

        vm.DepartmentParticipation = deptData;

        // ───────────────── Progreso temporal (últimas 6 semanas) ─────────────────

        // Tomamos las últimas 6 semanas completas
        // referenciando lunes como inicio de semana
        int diffToMonday = ((int)today.DayOfWeek + 6) % 7; // 0=lunes, ..., 6=domingo
        var thisWeekStart = today.AddDays(-diffToMonday);
        var start6Weeks = thisWeekStart.AddDays(-7 * 5); // 6 semanas incluyendo la actual

        var progressLastWeeks = await _db.Progress
            .Where(p => p.LastAccessed >= start6Weeks)
            .Select(p => new { p.LastAccessed, p.CompletionPercentage })
            .ToListAsync();

        var weeklyPoints = new List<WeeklyProgressPoint>();

        for (int i = 0; i < 6; i++)
        {
            var weekStart = start6Weeks.AddDays(7 * i);
            var weekEnd = weekStart.AddDays(7);

            var weekData = progressLastWeeks
                .Where(p => p.LastAccessed >= weekStart && p.LastAccessed < weekEnd)
                .Select(p => p.CompletionPercentage)
                .ToList();

            double avg = weekData.Count == 0 ? 0 : weekData.Average();

            weeklyPoints.Add(new WeeklyProgressPoint
            {
                Label = $"Sem {i + 1}",
                AvgProgressPercent = Math.Round(avg, 1)
            });
        }

        vm.WeeklyProgress = weeklyPoints;

        // Resumen semanal
        if (weeklyPoints.Count > 0)
        {
            var last = weeklyPoints[^1];
            vm.WeeklySummary.ThisWeekPercent = last.AvgProgressPercent;

            var best = weeklyPoints.OrderByDescending(p => p.AvgProgressPercent).First();
            vm.WeeklySummary.BestWeekPercent = best.AvgProgressPercent;
            vm.WeeklySummary.BestWeekLabel = best.Label;

            var prev = weeklyPoints.Count >= 2 ? weeklyPoints[^2].AvgProgressPercent : 0;
            vm.WeeklySummary.TrendPercent = Math.Round(last.AvgProgressPercent - prev, 1);
        }

        ViewBag.UnreadNotifications = 0;
        ViewBag.Notifications = Array.Empty<object>();

        return View("Analytics", vm);
    }

}
}
