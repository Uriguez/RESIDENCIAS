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

            // =========================================================
            // SOLUCIÓN APLICADA: VALIDAR SI ES EDICIÓN O CREACIÓN
            // =========================================================

            // Si trae ID mayor a 0, es que ya existe y solo vamos a actualizarlo
            if (model.IdCourse > 0)
            {
                // --- 1. Buscar el curso y el contenido existentes ---
                var course = await _db.Courses.FindAsync(model.IdCourse);
                if (course == null) return NotFound();

                var content = await _db.CourseContents
                    .FirstOrDefaultAsync(c => c.CourseId == model.IdCourse);

                // --- 2. Actualizar datos del Curso ---
                course.Title = model.Title; // Opcional: si permites editar título
                course.Description = model.Description;
                course.CategoryId = model.CategoryId;
                course.IsActive = model.IsActive;
                course.UpdatedAt = DateTime.UtcNow;

                // --- 3. Actualizar datos del Contenido ---
                if (content != null)
                {
                    content.Title = model.ContentTitle;
                    content.ContentType = model.ContentType;
                    content.ContentUrl = model.ContentUrl;
                    content.DurationMinutes = model.DurationMinutes;
                    content.IsRequired = model.IsRequired;
                    content.MinimumScore = model.MinimumScore ?? 0;

                    _db.CourseContents.Update(content);
                }

                _db.Courses.Update(course);
                await _db.SaveChangesAsync(); // Guardamos los cambios de la edición
            }
            else
            {

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
                await _db.SaveChangesAsync();   // Guardamos para obtener el IdCourse generado

                // ===== 2) Crear CourseContent principal =====
                var content = new CourseContent
                {
                    CourseId = course.IdCourse,
                    Title = model.ContentTitle,
                    ContentType = model.ContentType,
                    ContentUrl = model.ContentUrl,
                    DurationMinutes = model.DurationMinutes,
                    OrderIndex = 1,
                    IsRequired = model.IsRequired,
                    MinimumScore = model.MinimumScore ?? 0
                };

                _db.CourseContents.Add(content);
                await _db.SaveChangesAsync(); // Guardamos el contenido
            }

            // PRG: Post-Redirect-Get
            return RedirectToAction(nameof(Index));

        }
        [HttpGet("{id:int}")]

        //----PARA EDITAR EL CURSO----//
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _db.Courses
           .AsNoTracking()
           .FirstOrDefaultAsync(c => c.IdCourse == id);

            return entity is null ? NotFound() : Ok(entity);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Course model)
        {
            var entity = await _db.Courses.FindAsync(id);
            if (entity is null) return NotFound();

            // Title NO editable (se conserva el existente)
            entity.Description = model.Description;
            entity.CategoryId = model.CategoryId;
            entity.IsActive = model.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        
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

        // =========================
        // API: Obtener curso + contenido principal para EDITAR (JSON)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpGet("/api/Courses/{id:int}")]
        public async Task<IActionResult> ApiGetCourseForEdit(int id)
        {
            var course = await _db.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.IdCourse == id);

            if (course == null) return NotFound();

            var main = await _db.CourseContents
                .AsNoTracking()
                .Where(cc => cc.CourseId == id)
                .OrderBy(cc => cc.OrderIndex)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                idCourse = course.IdCourse,
                title = course.Title,
                description = course.Description ?? string.Empty,
                categoryId = course.CategoryId,
                isActive = course.IsActive,
                content = main == null ? null : new
                {
                    idCourCont = main.IdCourCont,
                    title = main.Title ?? string.Empty,
                    contentType = main.ContentType,
                    contentUrl = main.ContentUrl ?? string.Empty,
                    durationMinutes = main.DurationMinutes,
                    minimumScore = main.MinimumScore,
                    isRequired = main.IsRequired
                }
            });
        }

        // =========================
        // API: Guardar cambios (NO permite cambiar Title)
        // =========================
        public class CourseEditDto
        {
            public string? Description { get; set; }
            public int? CategoryId { get; set; }
            public bool IsActive { get; set; }

            public int? ContentId { get; set; }
            public string? ContentTitle { get; set; }
            public int ContentType { get; set; } // 1 Video, 2 Documento, 3 Enlace externo
            public string? ContentUrl { get; set; }
            public int DurationMinutes { get; set; }
            public int MinimumScore { get; set; }
            public bool IsRequired { get; set; }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("/api/Courses/{id:int}")]
       // REEMPLAZA TU MÉTODO ApiUpdateCourse CON ESTE:
[Authorize(Roles = "Admin")]
[HttpPut("/api/Courses/{id:int}")]
public async Task<IActionResult> ApiUpdateCourse(int id, [FromBody] CourseEditDto dto)
{
    try
    {
        // 1. Buscamos el curso (Validamos que exista)
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.IdCourse == id);
        if (course == null) return NotFound("El curso no existe.");

        // 2. Actualizamos datos del Curso (Este sí tiene fechas)
        course.Description = dto.Description;
        course.CategoryId = dto.CategoryId;
        course.IsActive = dto.IsActive;
        course.UpdatedAt = DateTime.UtcNow;

        // 3. Buscamos si ya tiene contenido
        var content = await _db.CourseContents.FirstOrDefaultAsync(cc => cc.CourseId == id);

        // === ZONA DE MAGIA: CREAR O ACTUALIZAR (UPSERT) ===
        if (content == null)
        {
            // CASO A: No tiene contenido -> LO CREAMOS
            content = new CourseContent
            {
                CourseId = id,
                Title = dto.ContentTitle ?? "Contenido del Curso",
                // CreationDate ELIMINADO porque no existe en tu BD
                OrderIndex = 1
            };
            // Importante: Avisar a la BD que vamos a AGREGAR
            _db.CourseContents.Add(content);
        }
        else
        {
            // CASO B: Ya tiene contenido -> SOLO ACTUALIZAMOS TÍTULO
            if (!string.IsNullOrEmpty(dto.ContentTitle)) 
                content.Title = dto.ContentTitle;
                
            // Importante: Avisar a la BD que vamos a MODIFICAR
            _db.CourseContents.Update(content);
        }

        // 4. Asignamos los valores comunes (para ambos casos)
        content.ContentUrl = dto.ContentUrl;
        content.DurationMinutes = dto.DurationMinutes;
        content.MinimumScore = dto.MinimumScore;
        content.IsRequired = dto.IsRequired;
        // UpdateDate ELIMINADO porque no existe en tu BD

        // 5. Lógica para detectar Tipo (Video/PDF/Link)
        // Si viene > 0, usamos lo que eligió el usuario
        if (dto.ContentType > 0)
        {
            content.ContentType = dto.ContentType;
        }
        // Si es 0 o null, intentamos adivinar por la extensión del archivo
        else if (!string.IsNullOrEmpty(dto.ContentUrl))
        {
            var url = dto.ContentUrl.ToLower();
            if (url.EndsWith(".mp4") || url.EndsWith(".mov")) content.ContentType = 1;
            else if (url.EndsWith(".pdf")) content.ContentType = 2;
            else content.ContentType = 3;
        }
        
        // Si aun así es 0, forzamos Link (3) para evitar error de BD
        if (content.ContentType == 0) content.ContentType = 3;

        // 6. Guardamos los cambios
        await _db.SaveChangesAsync();
        return NoContent();
    }
    catch (Exception ex)
    {
        // Esto mostrará el error real en la consola del navegador si falla
        return StatusCode(500, "Error interno: " + ex.Message);
    }
}

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _db.Courses
                .FirstOrDefaultAsync(c => c.IdCourse == id);

            if (course == null)
                return NotFound();

            // 1) Eliminar dependencias (si no tienes cascade delete)
            var contents = await _db.CourseContents
                .Where(cc => cc.CourseId == id)
                .ToListAsync();

            if (contents.Any())
                _db.CourseContents.RemoveRange(contents);

            var assignments = await _db.UserCourses
                .Where(uc => uc.CourseId == id)
                .ToListAsync();

            if (assignments.Any())
                _db.UserCourses.RemoveRange(assignments);

            // 2) Eliminar el curso
            _db.Courses.Remove(course);

            await _db.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }
    }
}
