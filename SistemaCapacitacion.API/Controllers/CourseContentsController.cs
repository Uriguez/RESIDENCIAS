using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Entities;

namespace SistemaCapacitacion.API.Controllers;

[ApiController]
[Route("api/courses/{courseId:int}/contents")]
public class CourseContentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CourseContentsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get(int courseId)
    {
        var list = await _db.CourseContents
            .Where(x => x.CourseId == courseId)
            .OrderBy(x => x.OrderIndex)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int courseId, [FromBody] CourseContent model)
    {
        model.CourseId = courseId;
        _db.CourseContents.Add(model);
        await _db.SaveChangesAsync();
        return Ok(model);
    }
}
