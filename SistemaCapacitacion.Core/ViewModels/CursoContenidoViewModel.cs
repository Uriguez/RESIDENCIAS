namespace SistemaCapacitacion.Core.ViewModels
{
    public class CursoContenidoViewModel
    {
        public int CursoId { get; set; }

        public string Titulo { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        /// <summary>
        /// Ruta del archivo (video MP4 o documento PDF)
        /// </summary>
        public string RutaContenido { get; set; } = string.Empty;
        
        public int TipoContenido { get; set; } // 1=Video, 2=PDF, 3=Link
        /// <summary>
        /// true = Video | false = Documento
        /// </summary>
        public bool EsVideo { get; set; }
    }
}
