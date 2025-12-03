using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Entities; // Course, CourseContent, CourseCategory, UserCourse, etc.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
namespace SistemaCapacitacion.API.Controllers
{
    public class CoursesController : Controller
    {
        private readonly ApplicationDbContext _db;
        public CoursesController(ApplicationDbContext db)
        {
            _db = db;
        }
        // =========================================================
        //  HELPER 1: construye el ViewModel principal del listado
        // =========================================================
        private async Task<CoursesAdminViewModel> BuildCoursesAdminViewModel(
            string? state = "all",
            string? search = null)
        {
            // ----------------------------
            // 1. Consulta base de cursos
            // ----------------------------
            var query = _db.Courses
                .Include(c => c.Category)
                .AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c => c.Title.Contains(term));
            }
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
                // Nº de usuarios distintos con al menos un curso asignado
                totalStudents = await _db.UserCourses
                    .Select(uc => uc.UserId)
                    .Distinct()
                    .CountAsync();
                // Promedio de finalización global
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
                    // Duración total: suma de contenidos del curso
                    DurationMinutes = _db.CourseContents
                        .Where(cc => cc.CourseId == c.IdCourse)
                        .Sum(cc => (int?)cc.DurationMinutes) ?? 0,
                    StudentsCount = _db.UserCourses
                        .Count(uc => uc.CourseId == c.IdCourse),
                    CompletionPercent = 0, // se recalcula abajo
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
            // Compleción por curso
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
            // 4. Armar ViewModel
            // ----------------------------
            var vm = new CoursesAdminViewModel
            {
                SearchTerm = search ?? string.Empty,
                StateFilter = state,
                TotalCourses = totalCourses,
                ActiveCourses = activeCourses,
                TotalStudents = totalStudents,
                AverageCompletion = averageCompletion,
                Courses = coursesList,
                // AllUsers se llena en Index, porque depende del rol RH
            };
            return vm;
        }
        // =========================================================
        //  HELPER 2: llena combos del modal Crear Curso
        // =========================================================
        private async Task FillCreateCourseLists(CreateCourseViewModel model)
        {
            var categories = await _db.CourseCategory
                .OrderBy(c => c.Name)
                .Select(c => new SelectListItem
                {
                    Value = c.IdCourCateg.ToString(),
                    Text = c.Name
                })
                .ToListAsync();
            model.Categories = categories;
            // Tipos de contenido (se guardan como int en CourseContent.ContentType)
            model.ContentTypes = new List<SelectListItem>
            {
                new SelectListItem { Value = "1", Text = "Video" },
                new SelectListItem { Value = "2", Text = "Documento" },
                new SelectListItem { Value = "3", Text = "Enlace externo" }
            };
        }
        // =========================================================
        //  INDEX (Gestión de cursos)
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> Index(string? state = "all", string? search = null)
        {
            // ---------------------------------------------------
            // Usuarios disponibles para asignar a cursos (se usan
            // en el modal de Asignar cuando el rol es RH)
            // ---------------------------------------------------
            var allUsers = await _db.Users
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Select(u => new AssignUserItemViewModel
                {
                    UserId = u.IdUser,
                    FullName = (u.FirstName + " " + u.LastName).Trim(),
                    Email = u.Email ?? string.Empty
                })
                .ToListAsync();
            // ViewModel principal (cursos, métricas, etc.)
            var vm = await BuildCoursesAdminViewModel(state, search);
            // Inyectar la lista de usuarios en el VM
            vm.AllUsers = allUsers;
            // ViewModel inicial del modal "Nuevo curso"
            var createVm = new CreateCourseViewModel
            {
                IsActive = true,
                IsRequired = true
            };
            await FillCreateCourseLists(createVm);
            ViewBag.CreateCourseVm = createVm;
            // Vista de administración de cursos
            return View("~/Views/Admin/Courses.cshtml", vm);
        }
        // =========================================================
        //  Asignar usuarios (GET opcional / placeholder)
        //  Si todo lo haces vía modal, podrías incluso eliminar este GET.
        // =========================================================
        [HttpGet]
        [Authorize(Roles = "RH")]
        public async Task<IActionResult> AssignUsers(int id)
        {
            var course = await _db.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.IdCourse == id);
            if (course == null)
                return NotFound();
            return View("AssignUsers", course);
        }
        // =========================================================
        //  CREAR CURSO (POST desde el modal)
        // =========================================================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateCourse(CreateCourseViewModel model)
        {
            if (!ModelState.IsValid)
            {
                // Recargar combos del modal
                await FillCreateCourseLists(model);
                // Reconstruir el listado principal
                var vm = await BuildCoursesAdminViewModel("all", null);
                // Volver a mandar el VM del modal a la vista
                ViewBag.CreateCourseVm = model;
                return View("~/Views/Admin/Courses.cshtml", vm);
            }
            // ===== 1) Crear Course =====
            var course = new Course
            {
                Title = model.Title,
                Description = model.Description,
                CategoryId = model.CategoryId,
                IsActive = model.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            // si tienes CreatedById en la tabla Course
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userIdStr) &&
                Guid.TryParse(userIdStr, out var userId))
            {
                course.CreatedById = userId;
            }
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();   // ya tenemos course.IdCourse
            // ===== 2) Crear CourseContent principal =====
            var content = new CourseContent
            {
                CourseId = course.IdCourse,
                Title = model.ContentTitle,
                ContentType = model.ContentType,          // int ya mapeado
                ContentUrl = model.ContentUrl,
                DurationMinutes = model.DurationMinutes,
                OrderIndex = 1,
                IsRequired = model.IsRequired,
                MinimumScore = model.MinimumScore ?? 0
            };
            _db.CourseContents.Add(content);
            await _db.SaveChangesAsync();
            // PRG: Post-Redirect-Get
            return RedirectToAction(nameof(Index));
        }
        // =========================================================
        //  ASIGNAR USUARIOS A UN CURSO (POST desde el modal RH)
        // =========================================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "RH,Admin")]
        public async Task<IActionResult> AssignUsers(AssignUsersPostModel model)
        {
            if (model.CourseId <= 0)
                return BadRequest();
            // Normalizar lista (puede venir null)
            var selectedIds = model.SelectedUserIds ?? new List<Guid>();
            // Asignaciones actuales de ese curso
            var existing = await _db.UserCourses
                .Where(uc => uc.CourseId == model.CourseId)
                .ToListAsync();
            var existingUserIds = existing.Select(e => e.UserId).ToHashSet();
            // 1) Agregar nuevas asignaciones (evitar duplicados)
            var toAddIds = selectedIds
                .Where(id => !existingUserIds.Contains(id))
                .ToList();
            foreach (var userId in toAddIds)
            {
                var uc = new UserCourse
                {
                    CourseId = model.CourseId,
                    UserId = userId,
                    Status = "Assigned"   // o "Pending", según tu dominio
                };
                _db.UserCourses.Add(uc);
            }
            // 2) (Opcional) quitar asignaciones que se desmarcaron
            var selectedSet = selectedIds.ToHashSet();
            var toRemove = existing
                .Where(e => !selectedSet.Contains(e.UserId))
                .ToList();
            if (toRemove.Any())
            {
                _db.UserCourses.RemoveRange(toRemove);
            }
            await _db.SaveChangesAsync();
            // Volvemos a la lista de cursos
            return RedirectToAction(nameof(Index));
        }
    }
}
