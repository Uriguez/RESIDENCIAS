using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    // Usuario mostrado en la lista de asignación
    public class AssignUserItemViewModel
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    // ViewModel para el modal de asignar usuarios a un curso
    public class AssignUsersToCourseViewModel
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;

        // Lista de usuarios que se pueden asignar
        public List<AssignUserItemViewModel> Users { get; set; } = new();
        public List<string> SelectedUserIds { get; set; } = new List<string>();
    }

    // Modelo que recibe el POST del formulario del modal
    public class AssignUsersPostModel
    {
        public int CourseId { get; set; }

        // Checkboxes: name="SelectedUserIds"
        public List<Guid> SelectedUserIds { get; set; } = new();
    }
}
