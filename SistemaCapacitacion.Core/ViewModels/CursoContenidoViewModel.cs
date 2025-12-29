public class CursoContenidoController : Controller
{
    private readonly ApplicationDbContext _db;

    public CursoContenidoController(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IActionResult> DetalleCurso(int cursoId)
    {
        // Obtener todos los contenidos del curso
        var contenidos = await _db.CourseContents
            .Where(c => c.CourseId == cursoId)
            .OrderBy(c => c.OrderIndex) // Orden del curso
            .Select(cc => new CursoContenidoViewModel
            {
                CursoId = cc.CourseId,
                Titulo = cc.Title,
                Descripcion = cc.Description,
                RutaContenido = cc.ContentUrl,
                EsVideo = cc.ContentType == 1 // 1 = Video, 2 = Documento / URL
            })
            .ToListAsync();

        if (!contenidos.Any()) return View("SinContenidos"); // Vista opcional si no hay contenidos

        return View(contenidos);
    }
}
