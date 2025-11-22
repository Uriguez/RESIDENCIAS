using System;
using System.Collections.Generic;
using System.Text;

using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaCapacitacion.Data.Entities;

public class User
{
    [Key]
    public Guid IdUser { get; set; }            // TEXT/UUID (PK)
    [Required] public string FirstName { get; set; } = "";
    [Required] public string LastName { get; set; } = "";
    [Required] public string Email { get; set; } = ""; // UNIQUE
    public string? Position { get; set; }

    public int? DepartmentId { get; set; }      // FK → Department.IdDepartment
    public string Status { get; set; } = "Active";
    public DateTime? HireDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navegación (opcional)
    public Department? Department { get; set; }
    public string? Passwords { get; set; }
}
