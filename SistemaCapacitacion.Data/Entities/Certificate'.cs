using SistemaCapacitacion.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class Certificate
{
    [Key]
    public int IdCertificate { get; set; }      // PK AUTOINCREMENT
    public Guid UserId { get; set; }            // FK → User.IdUser
    public int CourseId { get; set; }           // FK → Course.IdCourse

    [Required] public string CertificateNumber { get; set; } = ""; // UNIQUE
    public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpirationDate { get; set; }
    public double? Score { get; set; }
    public string? CertificateUrl { get; set; }
    public bool IsValid { get; set; } = true;

    public Guid? IssuedById { get; set; }       // FK → User.IdUser

    // Navegación (opcional)
    public User? User { get; set; }
    public Course? Course { get; set; }
    public User? IssuedBy { get; set; }
}
