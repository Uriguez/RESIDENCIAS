using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Core.Entities
{
    public class User
    {
        public string Id { get; set; } // FK a AspNetUsers.Id 
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public DateTime HireDate { get; set; }
        public int Status { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string Avatar { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Propiedad de navegación para Identity (requerirá un paso extra)
        // public virtual AspNetUser AspNetUser { get; set; } 
    }
}
