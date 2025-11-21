using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Core.ViewModels;
using System.Security.Claims;

public class EmpleadoController : Controller
{
    private readonly ApplicationDbContext _db;
    public EmpleadoController(ApplicationDbContext db) => _db = db;

    public async Task<IActionResult> Inicio()
    {
        // Id del usuario autenticado (Guid)
        var uidText = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid userId;
        if (!Guid.TryParse(uidText, out userId))
        {
            // Fallback: primer usuario de la BD (IdUser debe ser Guid)
            userId = await _db.Users.Select(u => u.IdUser).FirstOrDefaultAsync();
        }

        // Mis asignaciones
        var myAssign = await _db.UserCourses
            .Where(uc => uc.UserId == userId)
            .ToListAsync();

        // Normalización de estados
        static bool IsCompleted(string? s) => s != null && s.Equals("Completed", StringComparison.OrdinalIgnoreCase);
        static bool IsInProgress(string? s) => s != null && (s.Equals("In Progress", StringComparison.OrdinalIgnoreCase) || s.Equals("InProgress", StringComparison.OrdinalIgnoreCase));
        static bool IsAssigned(string? s) => s != null && s.Equals("Assigned", StringComparison.OrdinalIgnoreCase);

        var totalAssigned = myAssign.Count;
        var inProg = myAssign.Count(x => IsInProgress(x.Status));
        var done = myAssign.Count(x => IsCompleted(x.Status));
        var certs = await _db.Certificates.CountAsync(c => c.UserId == userId);

        var rate = totalAssigned == 0 ? 0 : Math.Round((double)done / totalAssigned * 100, 1);

        // Títulos de curso (join por IdCourse)
        var courses = await _db.Courses
            .Select(c => new { c.IdCourse, c.Title })
            .ToListAsync();

        var myCourses = myAssign
            .Join(courses, a => a.CourseId, c => c.IdCourse, (a, c) =>
            {
                // “Progreso” derivado del estado (no existe campo Progress)
                decimal progress = IsCompleted(a.Status) ? 100m :
                                   IsInProgress(a.Status) ? 50m : 0m;

                // Último evento conocido (no existen UpdatedAt/CreatedAt)
                var lastEvent = a.CompletionDate
                                ?? a.AssignedDate
                                ?? DateTime.UtcNow;

                return new MyCourseItem
                {
                    CourseId = c.IdCourse,
                    Title = c.Title ?? "Curso",
                    Category = "General",         // si luego quieres la categoría real, agregamos JOIN
                    ProgressPercent = progress,
                    DueAt = a.DueDate,         // mapear DueAt <- DueDate
                    Status = a.Status ?? "Assigned",
                    LastEventAt = lastEvent
                };
            })
            .OrderByDescending(x => x.LastEventAt)
            .ToList();

        // Actividad reciente (derivada de UserCourse para tener fechas)
        var recent = myAssign
            .OrderByDescending(uc => uc.CompletionDate ?? uc.AssignedDate ?? DateTime.UtcNow)
            .Take(6)
            .Select(uc => new ActivityDto(
                Actor: "Cursos",
                Action: IsCompleted(uc.Status) ? "completó"
                        : IsInProgress(uc.Status) ? "avanzó en"
                        : "fue asignado a",
                Target: "un curso",
                At: (uc.CompletionDate ?? uc.AssignedDate ?? DateTime.UtcNow)
            ))
            .ToList();

        var vm = new DashboardEmployeeViewModel
        {
            LastUpdated = DateTime.Now,
            AssignedCount = totalAssigned,
            InProgressCount = inProg,
            CompletedCount = done,
            CertificatesCount = certs,
            CompletionRate = rate,
            MyCourses = myCourses,
            RecentActivity = recent
        };

        return View(vm);
    }
}
