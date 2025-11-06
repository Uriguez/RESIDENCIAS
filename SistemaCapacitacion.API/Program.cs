using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Seeds;

var builder = WebApplication.CreateBuilder(args);

// >>> REGISTRO DEL DBCONTEXT <<<
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

var app = builder.Build();

//app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles();
//app.MapControllers();
//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Home}/{action=Index}/{id?}");

// Migrar y seed (si no quieres esto, coméntalo temporalmente)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    //db.Database.Migrate();
    await DbSeeder.SeedAsync(db);
}

app.Run();
