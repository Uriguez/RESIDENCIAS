using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

// Clave compuesta (UserId + RoleId) se configura en el DbContext
public class UserRole
{
    public Guid UserId { get; set; }            // FK → User.IdUser
    public int RoleId { get; set; }            // FK → Role.IdRole

    // Navegación (opcional)
    public User? User { get; set; }
    public Role? Role { get; set; }
}
