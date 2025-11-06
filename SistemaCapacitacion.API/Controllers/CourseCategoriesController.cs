using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Entities;

namespace SistemaCapacitacion.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CourseCategoriesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _db.CourseCategories.ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CourseCategory model)
    {
        if (string.IsNullOrWhiteSpace(model.Name))
            return BadRequest("Name es requerido.");
        _db.CourseCategories.Add(model);
        await _db.SaveChangesAsync();
        return Ok(model);
    }
}
