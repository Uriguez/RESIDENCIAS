using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Activity
{

    public int IdActivity { get; set; }         // PK AUTOINCREMENT
    public Guid UserId { get; set; }            // FK → User.IdUser

    public string? Action { get; set; }         // ej. "Login", "Course Created"
    public string? EntityType { get; set; }     // ej. "Course", "User"
    public int? EntityId { get; set; }          // id del registro afectado
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navegación (opcional)
    public User? User { get; set; }
}

