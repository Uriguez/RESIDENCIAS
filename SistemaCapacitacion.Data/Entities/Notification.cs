using SistemaCapacitacion.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Notification
{
    [Key]
    public int IdNotification { get; set; }     // PK AUTOINCREMENT
    public Guid UserId { get; set; }            // FK → User.IdUser

    [Required] public string Title { get; set; } = "";
    [Required] public string Message { get; set; } = "";
    public string Type { get; set; } = "Info";  // "Info" | "Warning" | "Reminder"
    public bool IsRead { get; set; } = false;
    public string? ActionUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navegación (opcional)
    public User? User { get; set; }
}

