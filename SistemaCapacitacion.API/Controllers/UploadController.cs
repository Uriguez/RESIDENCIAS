using Microsoft.AspNetCore.Mvc;

namespace SistemaCapacitacion.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    [HttpPost("content")]
    [RequestSizeLimit(200_000_000)] // ~200MB
    public async Task<IActionResult> UploadContent(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Archivo vacío.");
        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(uploads, fileName);
        using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }
        var url = $"/uploads/{fileName}";
        return Ok(new { url });
    }
}
