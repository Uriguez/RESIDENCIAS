using System;
using System.Linq;
using System.Threading.Tasks;
using SistemaCapacitacion.Data.Entities;

namespace SistemaCapacitacion.Data.Seeds;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        // Roles
        if (!db.Roles.Any())
        {
            db.Roles.AddRange(
                new Role { Name = "Admin", Description = "Administrador del sistema" },
                new Role { Name = "RH", Description = "Recursos Humanos" },
                new Role { Name = "Empleado", Description = "Usuario final" }
            );
        }

        // Departamento
        if (!db.Departments.Any())
        {
            db.Departments.Add(new Department { Name = "Capacitación", IsActive = true });
        }

        // Usuario admin
        if (!db.Users.Any())
        {
            var adminId = Guid.NewGuid();
            var deptoId = db.Departments.Select(d => d.IdDepartment).First();
            db.Users.Add(new User
            {
                IdUser = adminId,
                FirstName = "Admin",
                LastName = "Demo",
                Email = "admin@demo.com",
                Position = "Administrador",
                DepartmentId = deptoId,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            var adminRoleId = db.Roles.Where(r => r.Name == "Admin").Select(r => r.IdRole).First();
            db.UserRoles.Add(new UserRole { UserId = adminId, RoleId = adminRoleId });
        }

        // Categoría + Curso + Contenido de ejemplo
        if (!db.CourseCategory.Any())
        {
            db.CourseCategory.Add(new CourseCategory { Name = "Tecnología", Description = "Cursos de TI" });
        }

        await db.SaveChangesAsync();

        if (!db.Courses.Any())
        {
            var categId = db.CourseCategory.Select(c => c.IdCourCateg).First();
            var createdBy = db.Users.Select(u => u.IdUser).First();

            db.Courses.Add(new Course
            {
                Title = "Inducción",
                Description = "Curso de inducción para nuevos ingresos",
                CategoryId = categId,
                CreatedById = createdBy,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var courseId = db.Courses.Select(c => c.IdCourse).First();

            // Contenido de ejemplo (PDF ficticio); luego lo podrás reemplazar con UploadController
            db.CourseContents.Add(new CourseContent
            {
                CourseId = courseId,
                Title = "Bienvenida (PDF)",
                ContentType = 2, // 1=video, 2=doc, 3=quiz (tu convención)
                ContentUrl = "/uploads/demo.pdf",
                OrderIndex = 1,
                IsRequired = true,
                DurationMinutes = 10
            });
        }

        await db.SaveChangesAsync();
    }
}
