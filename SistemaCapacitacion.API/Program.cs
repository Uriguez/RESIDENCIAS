using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
// using SistemaCapacitacion.Core.Abstractions;   // si registras interfaces
// using SistemaCapacitacion.Data.Repositories;    // si registras repos

var builder = WebApplication.CreateBuilder(args);

// MVC / API
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();   // <-- necesario para Swagger
builder.Services.AddSwaggerGen();             // <-- registra ISwaggerProvider

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repos (opcional; quita si aún no existen)
// builder.Services.AddScoped<ICourseRepository, CourseRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GRIVER API v1");
    });
}

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Inicio}/{id?}");

app.MapControllers();
app.Run();
