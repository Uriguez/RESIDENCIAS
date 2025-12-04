using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace SistemaCapacitacion.Core.ViewModels
{
    public class CreateUserViewModel
    {
        [Required]
        [Display(Name = "Nombre completo")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Display(Name = "Email corporativo")]
        public string Email { get; set; } = string.Empty;

        [Display(Name = "Teléfono (opcional)")]
        public string? Phone { get; set; }

        // ---- Contraseña que escribe el admin ----
        [Display(Name = "Contraseña")]
        public string? Password { get; set; }

        // ===== Información organizacional =====

        [Required]
        [Display(Name = "Rol en el sistema")]
        public int? RoleId { get; set; }

        [Required]
        [Display(Name = "Departamento")]
        public int? DepartmentId { get; set; }

        // ===== Configuración de acceso =====

        [Display(Name = "Generar contraseña temporal")]
        public bool GenerateTempPassword { get; set; } = true;

        [Display(Name = "Enviar email de bienvenida")]
        public bool SendWelcomeEmail { get; set; } = true;

        [Display(Name = "Requerir cambio de contraseña")]
        public bool RequirePasswordChange { get; set; } = true;

        [Display(Name = "Usuario activo")]
        public bool IsActive { get; set; } = true;

        // Combos
        public List<SelectListItem> Departments { get; set; } = new();
        public List<SelectListItem> Roles { get; set; } = new();
    }
}
