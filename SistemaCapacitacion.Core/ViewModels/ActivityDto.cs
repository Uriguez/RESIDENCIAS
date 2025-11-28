using System;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// DTO usado para la sección de "Actividad reciente" del dashboard
    /// del administrador.
    /// </summary>
    public class ActivityDto
    {
        // Propiedades existentes...
        public string Title { get; set; }
        public string Description { get; set; }
        public string TimeAgo { get; set; }
        public string UserName { get; set; } // Asumiendo que existe o puedes agregarlo

        // Nueva propiedad para las iniciales
        public string Initials
        {
            get
            {
                if (string.IsNullOrWhiteSpace(UserName))
                    return string.Empty;

                var parts = UserName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0)
                    return string.Empty;

                if (parts.Length == 1)
                    return parts[0].Substring(0, 1).ToUpper();

                return (parts[0].Substring(0, 1) + parts[parts.Length - 1].Substring(0, 1)).ToUpper();
            }
        }
    }
}
