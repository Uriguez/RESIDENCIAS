using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;

public class AdminController : Controller
{
    private readonly ApplicationDbContext _db;
    public AdminController(ApplicationDbContext db) => _db = db;

    public async Task<IActionResult> Inicio()
    {
        // Totales
        var totalUsers = await _db.Users.CountAsync();
        var activeCourses = await _db.Courses.CountAsync(c => c.IsActive); // usa tu bool real
        var certificates = await _db.Certificates.CountAsync();

        // Tasa de finalización global (mejor desde UserCourse)
        var totalAssign = await _db.UserCourses.CountAsync();
        var completedUC = await _db.UserCourses.CountAsync(uc => uc.Status == "Completed");
        var completionRate = totalAssign == 0 ? 0 : Math.Round((double)completedUC / totalAssign * 100, 1);

        // Actividad reciente (tabla Activity existe en tu solución)
        var recent = await _db.Activities
            .OrderByDescending(a => a.CreatedAt)
            .Take(6)
            .Select(a => new ActivityDto(
                Actor: "Sistema",
                Action: "actualizó",
                Target: "registro",
                At: a.CreatedAt
            ))
            .ToListAsync();

        // Cursos más populares: LEFT JOIN explícito a CourseCategories
        // (tu Course tiene CategoryId y navegación Category; el PK sugerido en CourseCategory es IdCourCateg y nombre Name)
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
            .Join(_db.Courses, x => x.CourseId, c => c.IdCourse, (x, c) => new { x, c })
            .GroupJoin(
                _db.CourseCategories,                 // si tu DbSet se llama distinto, cámbialo aquí
                xc => xc.c.CategoryId,                // FK en Course
                cc => cc.IdCourCateg,                 // PK en CourseCategory (ajusta si tu propiedad se llama distinto)
                (xc, cc) => new { xc, cc }
            )
            .SelectMany(y => y.cc.DefaultIfEmpty(), (y, cat) => new CourseRankDto(
                Title: y.xc.c.Title ?? "Curso",
                Category: cat != null ? cat.Name : "General",
                Completed: y.xc.x.Completed,
                Enrolled: y.xc.x.Enrolled
            ))
            .ToListAsync();

        var vm = new DashboardAdminViewModel
        {
            TotalUsers = totalUsers,
            ActiveCourses = activeCourses,
            CompletionRate = completionRate,
            CertificatesIssued = certificates,
            RecentActivities = recent,
            TopCourses = top
        };

        return View(vm); // Views/Admin/Inicio.cshtml
    }
}
