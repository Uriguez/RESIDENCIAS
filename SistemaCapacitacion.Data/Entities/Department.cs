using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Department
{
    public int IdDepartment { get; set; }
    public string Name { get; set; } = "";
    public Guid? ManagerId { get; set; }        // FK → User.IdUser
    public bool IsActive { get; set; } = true;
    // Navegación (opcional)
    public User? Manager { get; set; }

}


