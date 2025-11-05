using global::SistemaCapacitacion.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Course
{
    [Key]
    public int IdCourse { get; set; }           // PK AUTOINCREMENT
    [Required] public string Title { get; set; } = "";
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

