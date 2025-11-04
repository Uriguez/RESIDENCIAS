using System;
using System.Collections.Generic;
using System.Text;

using System.ComponentModel.DataAnnotations;

namespace SistemaCapacitacion.Data.Entities;

public class Role
{
    public int IdRole { get; set; }             // PK AUTOINCREMENT
    public string Name { get; set; } = ""; // UNIQUE
    public string? Description { get; set; }
}

