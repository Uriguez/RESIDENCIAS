using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Data.Entities;

public class CourseCategory
{
    public int IdCourCateg { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
}

