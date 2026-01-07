using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class CourseContent
{
    [Key]
    public int IdCourCont { get; set; }         // PK AUTOINCREMENT
    public int CourseId { get; set; }           // FK → Course.IdCourse
    [Required] public string Title { get; set; } = "";

    public int ContentType { get; set; }        // INTEGER (video=1, doc=2, quiz=3, etc.)
    public string? ContentUrl { get; set; }

    public int DurationMinutes { get; set; } = 0;
    public int OrderIndex { get; set; } = 0;
    public bool IsRequired { get; set; } = true;
    public int? MinimumScore { get; set; }

    // Navegación (opcional)
    public Course? Course { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? UpdateDate { get; set; }
}

