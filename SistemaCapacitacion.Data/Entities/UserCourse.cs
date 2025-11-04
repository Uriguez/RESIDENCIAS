using SistemaCapacitacion.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class UserCourse
{
    public int Id { get; set; }                 // PK AUTOINCREMENT
    public Guid UserId { get; set; }            // FK → User.IdUser
    public int CourseId { get; set; }           // FK → Course.IdCourse

    public DateTime? AssignedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "Assigned"; // 'Assigned' | 'In Progress' | 'Completed'

    public Guid? AssignedById { get; set; }     // FK → User.IdUser
    public DateTime? CompletionDate { get; set; }

    // Navegación (opcional)
    public User? User { get; set; }
    public Course? Course { get; set; }
}

