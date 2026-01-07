using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Core.ViewModels;
using System.Security.Claims;

public class EmpleadoController : Controller
{
    private readonly ApplicationDbContext _db;

    public EmpleadoController(ApplicationDbContext db)
    {
        _db = db;
    }

    // ===============================
    // DASHBOARD EMPLEADO
    // ===============================
    public async Task<IActionResult> Inicio()
    {
        // Id del usuario autenticado (Guid)
        var uidText = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid userId;

        if (!Guid.TryParse(uidText, out userId))
        {
            // Fallback (seguridad)
            userId = await _db.Users
                .Select(u => u.IdUser)
                .FirstOrDefaultAsync();
        }

        // Cursos asignados
        var myAssign = await _db.UserCourses
            .Where(uc => uc.UserId == userId)
            .ToListAsync();

        // Helpers de estado
        static bool IsCompleted(string? s) =>
            s != null && s.Equals("Completed", StringComparison.OrdinalIgnoreCase);

        static bool IsInProgress(string? s) =>
            s != null && (s.Equals("In Progress", StringComparison.OrdinalIgnoreCase)
                       || s.Equals("InProgress", StringComparison.OrdinalIgnoreCase));

        var totalAssigned = myAssign.Count;
        var inProgress = myAssign.Count(x => IsInProgress(x.Status));
        var completed = myAssign.Count(x => IsCompleted(x.Status));
        var certificates = await _db.Certificates.CountAsync(c => c.UserId == userId);

        var completionRate = totalAssigned == 0
            ? 0
            : Math.Round((double)completed / totalAssigned * 100, 1);

        // Cursos base
        var courses = await _db.Courses
            .Select(c => new { c.IdCourse, c.Title })
            .ToListAsync();

        var myCourses = myAssign
            .Join(
                courses,
                a => a.CourseId,
                c => c.IdCourse,
                (a, c) =>
                {
                    decimal progress =
                        IsCompleted(a.Status) ? 100m :
                        IsInProgress(a.Status) ? 50m : 0m;

                    var lastEvent =
                        a.CompletionDate ??
                        a.AssignedDate ??
                        DateTime.UtcNow;

                    return new MyCourseItem
                    {
                        CourseId = c.IdCourse,
                        Title = c.Title ?? "Curso",
                        Category = "General",
                        ProgressPercent = progress,
                        DueAt = a.DueDate,
                        Status = a.Status ?? "Assigned",
                        LastEventAt = lastEvent
                    };
                })
            .OrderByDescending(x => x.LastEventAt)
            .ToList();

        var recentActivity = myAssign
            .OrderByDescending(x => x.CompletionDate ?? x.AssignedDate ?? DateTime.UtcNow)
            .Take(6)
            .Select(uc => new ActivityDto(
                Actor: "Cursos",
                Action: IsCompleted(uc.Status) ? "completó"
                        : IsInProgress(uc.Status) ? "avanzó en"
                        : "fue asignado a",
                Target: "un curso",
                At: uc.CompletionDate ?? uc.AssignedDate ?? DateTime.UtcNow
            ))
            .ToList();

        var vm = new DashboardEmployeeViewModel
        {
            LastUpdated = DateTime.Now,
            AssignedCount = totalAssigned,
            InProgressCount = inProgress,
            CompletedCount = completed,
            CertificatesCount = certificates,
            CompletionRate = completionRate,
            MyCourses = myCourses,
            RecentActivity = recentActivity
        };

        return View(vm);
    }

    // ===============================
    // VER CONTENIDO DEL CURSO
    // ===============================

    [HttpGet]
    public async Task<IActionResult> VerCurso(int id)
    {
        // 1️⃣ Curso
        var course = await _db.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdCourse == id && c.IsActive);

        if (course == null)
            return NotFound();

        // 2️⃣ Contenido principal del curso
        var content = await _db.CourseContents
            .AsNoTracking()
            .Where(cc => cc.CourseId == id)
            .OrderBy(cc => cc.OrderIndex)
            .FirstOrDefaultAsync();

        if (content == null)
        {
            // Opcional: Retornar vista con lista vacía para que no de error 404 feo, 
            // o dejar el NotFound si prefieres.
            return NotFound("El curso no tiene contenido cargado.");
        }

        // 3️⃣ Crear el ViewModel del objeto único
        var vm = new CursoContenidoViewModel
        {
            CursoId = course.IdCourse,
            Titulo = course.Title ?? "Curso",
            Descripcion = course.Description ?? string.Empty,
            RutaContenido = content.ContentUrl ?? string.Empty,
    
            // AQUÍ EL CAMBIO IMPORTANTE:
            // Pasamos el tipo exacto (1, 2 o 3) directamente de la base de datos
            TipoContenido = content.ContentType, 
            EsVideo = content.ContentType == 1
        };

        // 4️⃣ SOLUCIÓN: Meter el objeto en una LISTA
        var listaContenidos = new List<CursoContenidoViewModel> { vm };

        // Enviamos la lista a la vista
        return View(listaContenidos);
    }
}
