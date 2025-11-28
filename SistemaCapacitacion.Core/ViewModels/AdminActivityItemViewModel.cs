using System;

namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Item que se muestra en la sección "Actividad reciente"
    /// del dashboard del administrador.
    /// </summary>
    public sealed class AdminActivityItemViewModel
    {
        /// <summary>
        /// Iniciales que se muestran en el circulito de la izquierda
        /// (por ahora algo genérico, luego puedes calcularlo a partir del usuario).
        /// </summary>
        public string Initials { get; set; } = string.Empty;

        /// <summary>
        /// Título corto de la actividad (usamos la columna Action de Activity).
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Descripción secundaria (columna Description de Activity).
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Texto tipo "hace 2 horas", calculado a partir de CreatedAt.
        /// </summary>
        public string TimeAgo { get; set; } = string.Empty;
    }
}
