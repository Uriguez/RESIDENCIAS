using SistemaCapacitacion.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Progress
{
    public int IdProgress { get; set; }         // PK AUTOINCREMENT
    public Guid UserId { get; set; }            // FK → User.IdUser
    public int CourseId { get; set; }           // FK → Course.IdCourse
    public int ContentId { get; set; }          // FK → CourseContent.IdCourCont

    public double CompletionPercentage { get; set; } = 0;
    public int TimeSpentMinutes { get; set; } = 0;
    public double? Score { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime LastAccessed { get; set; } = DateTime.UtcNow;

    // Navegación (opcional)
    public Course? Course { get; set; }
    public CourseContent? Content { get; set; }
    public User? User { get; set; }
}

