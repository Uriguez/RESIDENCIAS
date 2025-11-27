using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;

namespace SistemaCapacitacion.API.Controllers
{
    public class CoursesController : Controller
    {
        private readonly ApplicationDbContext _db;

        public CoursesController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Pantalla de Gestión de Cursos (vista: Views/Admin/Courses.cshtml).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Index(string? state = "all", string? search = null)
        {
            // ----------------------------
            // 1. Consulta base de cursos
            // ----------------------------
            var query = _db.Courses
                .Include(c => c.Category)   // navegación Course.Category (CourseCategory)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c => c.Title.Contains(term));
            }

            // Filtro de estado: "all", "active", "inactive"
            state = string.IsNullOrWhiteSpace(state) ? "all" : state.ToLowerInvariant();

            if (state == "active")
            {
                query = query.Where(c => c.IsActive);
            }
            else if (state == "inactive")
            {
                query = query.Where(c => !c.IsActive);
            }

            // ----------------------------
            // 2. Métricas superiores
            // ----------------------------
            var totalCourses = await _db.Courses.CountAsync();
            var activeCourses = await _db.Courses.CountAsync(c => c.IsActive);

            int totalStudents = 0;
            double averageCompletion = 0;

            if (_db.UserCourses != null)
            {
                // # estudiantes únicos.
                totalStudents = await _db.UserCourses
                    .Select(uc => uc.UserId)
                    .Distinct()
                    .CountAsync();

                // Promedio de finalización global usando Status = "Completed"
                var totalAssignments = await _db.UserCourses.CountAsync();
                if (totalAssignments > 0)
                {
                    var completed = await _db.UserCourses
                        .CountAsync(uc => uc.Status == "Completed");

                    averageCompletion = Math.Round(
                        100.0 * completed / totalAssignments,
                        1
                    );
                }
            }

            // ----------------------------
            // 3. Proyección a tarjetas
            // ----------------------------
            var coursesList = await query
                .OrderBy(c => c.Title)
                .Select(c => new CourseCardViewModel
                {
                    IdCourse = c.IdCourse,
                    Title = c.Title,
                    Category = c.Category != null ? c.Category.Name : "Sin categoría",
                    IsActive = c.IsActive,
                    Description = c.Description ?? string.Empty,
                    // Duración total: suma de CourseContent.DurationMinutes
                    DurationMinutes = _db.CourseContents
                        .Where(cc => cc.CourseId == c.IdCourse)
                        .Sum(cc => (int?)cc.DurationMinutes) ?? 0,
                    StudentsCount = _db.UserCourses
                        .Count(uc => uc.CourseId == c.IdCourse),
                    // Por ahora 0; abajo lo recalculamos con UserCourse.
                    CompletionPercent = 0,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            // Compleción por curso si existe UserCourse
            if (_db.UserCourses != null && coursesList.Count > 0)
            {
                var courseIds = coursesList.Select(c => c.IdCourse).ToList();

                var completionByCourse = await _db.UserCourses
                    .Where(uc => courseIds.Contains(uc.CourseId))
                    .GroupBy(uc => uc.CourseId)
                    .Select(g => new
                    {
                        CourseId = g.Key,
                        Total = g.Count(),
                        Completed = g.Count(uc => uc.Status == "Completed")
                    })
                    .ToListAsync();

                foreach (var item in completionByCourse)
                {
                    var vmCourse = coursesList.First(c => c.IdCourse == item.CourseId);
                    vmCourse.CompletionPercent = item.Total == 0
                        ? 0
                        : Math.Round(100.0 * item.Completed / item.Total, 1);
                }
            }

            // ----------------------------
            // 4. Armar ViewModel y devolver vista
            // ----------------------------
            var vm = new CoursesAdminViewModel
            {
                SearchTerm = search ?? string.Empty,
                StateFilter = state,
                TotalCourses = totalCourses,
                ActiveCourses = activeCourses,
                TotalStudents = totalStudents,
                AverageCompletion = averageCompletion,
                Courses = coursesList
            };

            // Vista: Views/Admin/Courses.cshtml
            return View("~/Views/Admin/Courses.cshtml", vm);
        }

        // Otras acciones (Create/Edit/Delete/Details) pueden ir aquí después.
    }
}
