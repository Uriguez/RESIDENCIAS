using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net.Mime;

namespace SistemaCapacitacion.Core.ViewModels
{
    public class CreateCourseViewModel
    {
        public int IdCourse { get; set; }

        // ====== datos de Course ======
        [Required]
        [Display(Name = "Título del curso")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Descripción")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Categoría")]
        public int CategoryId { get; set; }

        [Display(Name = "Curso activo")]
        public bool IsActive { get; set; } = true;

        // ====== datos de CourseContent (un solo contenido principal) ======
        [Required]
        [Display(Name = "Título del contenido")]
        public string ContentTitle { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Tipo de contenido")]
        public int ContentType { get; set; }  // por defecto

        [Required]
        [Display(Name = "URL del contenido")]
        public string ContentUrl { get; set; } = string.Empty;

        [Display(Name = "Duración (minutos)")]
        public int DurationMinutes { get; set; }

        [Display(Name = "Es obligatorio")]
        public bool IsRequired { get; set; } = true;

        [Display(Name = "Puntaje mínimo")]
        public int? MinimumScore { get; set; }

        // ====== combos ======
        public List<SelectListItem> Categories { get; set; } = new();
        public List<SelectListItem> ContentTypes { get; set; } = new ();
    }
}
