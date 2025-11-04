using System;
using System.Collections.Generic;
using System.Text;
using global::SistemaCapacitacion.Data.Entities;
using System.ComponentModel.DataAnnotations;
namespace SistemaCapacitacion.Core.Entities
{

    public class Course
    {
        public int IdCourse { get; set; }           // PK AUTOINCREMENT
        public string Title { get; set; } = "";
        public string? Description { get; set; }

        public int? CategoryId { get; set; }        // FK → CourseCategory.IdCourCateg
        public Guid? CreatedById { get; set; }      // FK → User.IdUser

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navegación (opcional)
        public CourseCategory? Category { get; set; }
        public User? CreatedBy { get; set; }
    }

}
}
