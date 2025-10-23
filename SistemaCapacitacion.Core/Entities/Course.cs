using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Core.Entities
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
        public int EstimatedDurationMinutes { get; set; }
        public int Category { get; set; }
        public int Difficulty { get; set; }
        public bool IsActive { get; set; }
        public string CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Propiedades de navegación
        // public virtual User CreatedBy { get; set; }
        // public virtual ICollection<CourseContent> CourseContents { get; set; }
    }
}
