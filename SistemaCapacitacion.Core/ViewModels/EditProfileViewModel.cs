using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace SistemaCapacitacion.Core.ViewModels
{
    public class EditProfileViewModel
    {
        public string UserId { get; set; } = string.Empty;

        // Datos editables
        public string FullName { get; set; } = string.Empty;

        // FK al catálogo de Department
        public int? DepartmentId { get; set; }

        // Para mostrar nombre en chips / badges
        public string Department { get; set; } = string.Empty;

        // Solo lectura
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime? JoinDate { get; set; }
        public bool IsActive { get; set; }

        public string? CurrentPhotoUrl { get; set; }
        public IFormFile? NewPhoto { get; set; }

        public string? PhotoUrl { get; set; }
        // Items del combo de departamentos
        public List<SelectListItem> Departments { get; set; } = new();
    }
}
