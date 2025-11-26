namespace SistemaCapacitacion.Core.ViewModels
{
    /// <summary>
    /// Elemento que se mostrará en la lista de "Actividad reciente"
    /// del dashboard del administrador.
    /// </summary>
    public sealed class DashboardActivityItemViewModel
    {
        public string Initials { get; set; } = string.Empty;     // EJ: "AG"
        public string Title { get; set; } = string.Empty;        // EJ: "Nuevo curso creado"
        public string Description { get; set; } = string.Empty;  // EJ: "RH creó el curso Seguridad..."
        public string TimeAgo { get; set; } = string.Empty;      // EJ: "hace 2 horas"
    }
}
