using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Entities;

namespace SistemaCapacitacion.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CoursesController(ApplicationDbContext db) => _db = db;

    // GET: api/courses
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Courses
            .Include(c => c.Category)
            .ToListAsync();
        return Ok(list);
    }

    // POST: api/courses
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Course model)
    {
        if (string.IsNullOrWhiteSpace(model.Title))
            return BadRequest("Title es requerido.");
        _db.Courses.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = model.IdCourse }, model);
    }

    // PUT: api/courses/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Course model)
    {
        var entity = await _db.Courses.FindAsync(id);
        if (entity is null) return NotFound();

        entity.Title = model.Title;
        entity.Description = model.Description;
        entity.CategoryId = model.CategoryId;
        entity.IsActive = model.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/courses/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Courses.FindAsync(id);
        if (entity is null) return NotFound();
        _db.Courses.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
