using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class SystemSetting
{
    [Key]
    public int IdSystemS { get; set; }          // PK AUTOINCREMENT
    [Required] public string SettingKey { get; set; } = ""; // UNIQUE
    public string? SettingValue { get; set; }
    public string? Category { get; set; }

    public Guid? UpdatedById { get; set; }      // FK → User.IdUser
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navegación (opcional)
    public User? UpdatedBy { get; set; }
}
