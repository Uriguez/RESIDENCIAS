# Guía de Migración: React/Tailwind → C# ASP.NET Core/Bootstrap

## Resumen Ejecutivo

Esta guía proporciona un roadmap detallado para migrar el sistema de gestión de cursos Griver de React/Tailwind a C# ASP.NET Core con Bootstrap, manteniendo la misma funcionalidad y apariencia visual.

## Arquitectura Objetivo

### Stack Tecnológico Recomendado

**Backend:**
- ASP.NET Core 7.0+ (Web API + MVC)
- Entity Framework Core (ORM)
- SQL Server / PostgreSQL (Base de datos)
- Identity Core (Autenticación/Autorización)
- SignalR (Notificaciones en tiempo real)
- AutoMapper (Mapeo de objetos)

**Frontend:**
- Razor Pages / MVC Views
- Bootstrap 5.3
- JavaScript (Vanilla/jQuery)
- Chart.js (Gráficas)
- Font Awesome (Íconos)

**Infraestructura:**
- Azure App Service / IIS
- Azure SQL Database / On-premise SQL Server
- Azure Blob Storage (Archivos)
- Azure Application Insights (Monitoring)

## Estructura del Proyecto

```
GriverTrainingSystem/
├── src/
│   ├── GriverTraining.Web/              # Aplicación web principal
│   │   ├── Controllers/
│   │   ├── Views/
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   ├── images/
│   │   │   └── lib/
│   │   ├── Models/
│   │   └── Areas/
│   │       ├── Admin/
│   │       ├── RH/
│   │       └── Identity/
│   ├── GriverTraining.Core/             # Lógica de negocio
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── DTOs/
│   ├── GriverTraining.Infrastructure/   # Acceso a datos
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Configurations/
│   └── GriverTraining.Tests/           # Pruebas unitarias
├── docs/
└── scripts/
```

## Mapeo de Componentes React → C# Views

### 1. Componentes Principales

| React Component | C# Equivalent | Ubicación |
|---|---|---|
| `App.tsx` | `_Layout.cshtml` + Controllers | Views/Shared/_Layout.cshtml |
| `LoginForm.tsx` | `Login.cshtml` | Areas/Identity/Views/Account/Login.cshtml |
| `ClientDashboard.tsx` | `Dashboard.cshtml` | Views/Student/Dashboard.cshtml |
| `AdminHeader.tsx` | `_AdminLayout.cshtml` | Views/Shared/_AdminLayout.cshtml |
| `Sidebar.tsx` | `_Sidebar.cshtml` | Views/Shared/_Sidebar.cshtml |
| `Dashboard.tsx` | `Index.cshtml` | Views/Admin/Index.cshtml |
| `CourseManagement.tsx` | `Courses/Index.cshtml` | Areas/Admin/Views/Courses/Index.cshtml |
| `StudentManagement.tsx` | `Users/Index.cshtml` | Areas/Admin/Views/Users/Index.cshtml |
| `NotificationCenter.tsx` | `_Notifications.cshtml` | Views/Shared/_Notifications.cshtml |
| `AdvancedAnalytics.tsx` | `Analytics.cshtml` | Areas/Admin/Views/Analytics/Index.cshtml |

### 2. Controladores y Acciones

```csharp
// Controllers/HomeController.cs
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index()
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole == "Employee" || userRole == "Intern")
            return RedirectToAction("Dashboard", "Student");
            
        return RedirectToAction("Index", "Admin");
    }
}

// Areas/Admin/Controllers/AdminController.cs
[Area("Admin")]
[Authorize(Roles = "Admin,RH")]
public class AdminController : Controller
{
    public IActionResult Index() => View();
}

// Areas/Admin/Controllers/CoursesController.cs
[Area("Admin")]
[Authorize(Roles = "Admin,RH")]
public class CoursesController : Controller
{
    public async Task<IActionResult> Index()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return View(courses);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(CreateCourseDto model)
    {
        if (ModelState.IsValid)
        {
            await _courseService.CreateCourseAsync(model);
            return RedirectToAction(nameof(Index));
        }
        return View(model);
    }
}
```

## Modelos de Datos (Entities)

### User Entity
```csharp
public class User : IdentityUser
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public string? Position { get; set; }
    public string? Department { get; set; }
    public DateTime HireDate { get; set; }
    public UserStatus Status { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string? Avatar { get; set; }
    
    // Navigation Properties
    public virtual ICollection<UserCourse> AssignedCourses { get; set; }
    public virtual ICollection<Certificate> Certificates { get; set; }
    public virtual ICollection<Progress> CourseProgress { get; set; }
    public virtual ICollection<Notification> Notifications { get; set; }
}

public enum UserStatus
{
    Active = 1,
    Inactive = 0
}
```

### Course Entity
```csharp
public class Course
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string ThumbnailUrl { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public CourseCategory Category { get; set; }
    public CourseDifficulty Difficulty { get; set; }
    public bool IsActive { get; set; }
    public string CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public virtual User CreatedBy { get; set; }
    public virtual ICollection<CourseContent> Contents { get; set; }
    public virtual ICollection<UserCourse> UserCourses { get; set; }
    public virtual ICollection<Progress> Progress { get; set; }
}

public enum CourseCategory
{
    Security = 1,
    Compliance = 2,
    Development = 3,
    Culture = 4,
    Technology = 5
}

public enum CourseDifficulty
{
    Beginner = 1,
    Intermediate = 2,
    Advanced = 3
}
```

### CourseContent Entity
```csharp
public class CourseContent
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public ContentType Type { get; set; }
    public string? ContentUrl { get; set; }
    public int DurationMinutes { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public int? MinimumScore { get; set; }
    
    public virtual Course Course { get; set; }
}

public enum ContentType
{
    Video = 1,
    Document = 2,
    Quiz = 3,
    Interactive = 4
}
```

## Configuración de Base de Datos

### ApplicationDbContext
```csharp
public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }
    
    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseContent> CourseContents { get; set; }
    public DbSet<UserCourse> UserCourses { get; set; }
    public DbSet<Progress> Progress { get; set; }
    public DbSet<Certificate> Certificates { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Activity> Activities { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configuraciones específicas
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Datos iniciales
        SeedData(builder);
    }
    
    private void SeedData(ModelBuilder builder)
    {
        // Roles
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = "2", Name = "RH", NormalizedName = "RH" },
            new IdentityRole { Id = "3", Name = "Employee", NormalizedName = "EMPLOYEE" },
            new IdentityRole { Id = "4", Name = "Intern", NormalizedName = "INTERN" }
        );
    }
}
```

### Migraciones Iniciales
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Servicios de Negocio

### Interface y Service Pattern
```csharp
// Interfaces/ICourseService.cs
public interface ICourseService
{
    Task<IEnumerable<CourseDto>> GetAllCoursesAsync();
    Task<CourseDto> GetCourseByIdAsync(int id);
    Task<CourseDto> CreateCourseAsync(CreateCourseDto courseDto);
    Task<CourseDto> UpdateCourseAsync(int id, UpdateCourseDto courseDto);
    Task DeleteCourseAsync(int id);
    Task<IEnumerable<CourseDto>> GetUserCoursesAsync(string userId);
}

// Services/CourseService.cs
public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    
    public CourseService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<IEnumerable<CourseDto>> GetAllCoursesAsync()
    {
        var courses = await _context.Courses
            .Include(c => c.Contents)
            .Include(c => c.CreatedBy)
            .Where(c => c.IsActive)
            .OrderBy(c => c.Title)
            .ToListAsync();
            
        return _mapper.Map<IEnumerable<CourseDto>>(courses);
    }
}
```

## Vistas Razor con Bootstrap

### Layout Principal (_Layout.cshtml)
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Griver Training System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="~/css/griver-theme.css" rel="stylesheet" />
</head>
<body class="griver-theme">
    @if (User.Identity.IsAuthenticated)
    {
        @await Html.PartialAsync("_Navigation")
    }
    
    <main class="@(User.Identity.IsAuthenticated ? "main-content" : "")">
        @RenderBody()
    </main>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/griver-app.js"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

### Vista de Dashboard de Empleados
```html
@model StudentDashboardViewModel
@{
    ViewData["Title"] = "Mi Dashboard";
}

<!-- Header -->
<header class="bg-white border-bottom p-3 mb-4">
    <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
            <img src="~/images/griver-logo.png" alt="Griver" height="32" class="me-3">
            <div>
                <h4 class="mb-0">Griver - Portal de Capacitación</h4>
                <small class="text-muted">Bienvenido, @Model.User.FullName (@Model.User.RoleDisplay)</small>
            </div>
        </div>
        <div class="d-flex align-items-center gap-3">
            <div class="dropdown">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-bell"></i>
                    @if(Model.UnreadNotifications > 0)
                    {
                        <span class="badge bg-danger">@Model.UnreadNotifications</span>
                    }
                </button>
                <ul class="dropdown-menu dropdown-menu-end" style="width: 300px;">
                    @await Html.PartialAsync("_NotificationsList", Model.Notifications)
                </ul>
            </div>
            <a href="/Account/Logout" class="btn btn-outline-danger">
                <i class="fas fa-sign-out-alt me-1"></i>Cerrar Sesión
            </a>
        </div>
    </div>
</header>

<!-- Stats Cards -->
<div class="row mb-4">
    <div class="col-md-4">
        <div class="card bg-primary text-white">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <h6 class="card-title opacity-75">Cursos Asignados</h6>
                        <h2 class="mb-0">@Model.AssignedCoursesCount</h2>
                    </div>
                    <i class="fas fa-book fa-2x opacity-75"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card bg-success text-white">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <h6 class="card-title opacity-75">Completados</h6>
                        <h2 class="mb-0">@Model.CompletedCoursesCount</h2>
                    </div>
                    <i class="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card bg-warning text-white">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <h6 class="card-title opacity-75">Progreso Total</h6>
                        <h2 class="mb-0">@Model.OverallProgress%</h2>
                    </div>
                    <i class="fas fa-chart-line fa-2x opacity-75"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Courses Grid -->
<div class="row">
    <div class="col-12">
        <h3 class="mb-4">Mis Cursos</h3>
        @if (!Model.Courses.Any())
        {
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-book fa-4x text-muted mb-3"></i>
                    <h5>No tienes cursos asignados</h5>
                    <p class="text-muted">Contacta al departamento de Recursos Humanos para que te asigne cursos.</p>
                </div>
            </div>
        }
        else
        {
            <div class="row">
                @foreach (var course in Model.Courses)
                {
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100 course-card">
                            <div class="position-relative">
                                <img src="@course.ThumbnailUrl" class="card-img-top" alt="@course.Title" style="height: 200px; object-fit: cover;">
                                <span class="badge position-absolute top-0 end-0 m-2 @course.StatusBadgeClass">
                                    @course.StatusText
                                </span>
                                <div class="card-img-overlay d-flex align-items-center justify-content-center course-overlay">
                                    <button class="btn btn-light btn-sm" onclick="openCourse(@course.Id)">
                                        <i class="fas fa-play me-1"></i>Ver Curso
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">@course.Title</h5>
                                <p class="card-text text-muted">@course.Description</p>
                                <div class="d-flex align-items-center text-muted mb-3">
                                    <i class="fas fa-clock me-1"></i>
                                    <small>@course.Duration</small>
                                </div>
                                @if (course.Progress > 0)
                                {
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between mb-1">
                                            <small>Progreso</small>
                                            <small>@course.Progress%</small>
                                        </div>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar" style="width: @course.Progress%"></div>
                                        </div>
                                    </div>
                                }
                                <button class="btn @course.ActionButtonClass w-100" onclick="openCourse(@course.Id)">
                                    <i class="fas @course.ActionIcon me-1"></i>@course.ActionText
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        }
    </div>
</div>
```

## Configuración de Startup/Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDefaultIdentity<User>(options => {
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<ApplicationDbContext>();

// Add services
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// SignalR para notificaciones
builder.Services.AddSignalR();

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Areas routing
app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

// Default routing
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
```

## CSS Personalizado (Bootstrap Theme)

```css
/* wwwroot/css/griver-theme.css */
:root {
  --griver-primary: #030213;
  --griver-secondary: #e9ebef;
  --griver-success: #10b981;
  --griver-warning: #f59e0b;
  --griver-danger: #ef4444;
  --griver-info: #3b82f6;
}

.griver-theme {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
}

.btn-primary {
  background-color: var(--griver-primary);
  border-color: var(--griver-primary);
}

.btn-primary:hover {
  background-color: #1a1625;
  border-color: #1a1625;
}

.course-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.course-overlay {
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .course-overlay {
  opacity: 1;
}

.sidebar {
  width: 250px;
  background-color: var(--griver-primary);
  color: white;
  min-height: 100vh;
}

.main-content {
  margin-left: 250px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 1000;
    transition: transform 0.3s ease;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}
```

## Plan de Migración por Fases

### Fase 1: Infraestructura Base (2-3 semanas)
1. ✅ Configurar proyecto ASP.NET Core
2. ✅ Configurar Entity Framework y base de datos
3. ✅ Implementar Identity y autenticación
4. ✅ Crear estructura de carpetas y Areas
5. ✅ Configurar Bootstrap y CSS personalizado

### Fase 2: Funcionalidad Core (3-4 semanas)
1. ✅ Migrar modelos de datos y DTOs
2. ✅ Implementar servicios de negocio
3. ✅ Crear controladores principales
4. ✅ Implementar vistas básicas con Bootstrap
5. ✅ Sistema de roles y permisos

### Fase 3: Features Avanzadas (2-3 semanas)
1. ✅ Sistema de notificaciones con SignalR
2. ✅ Upload de archivos y gestión de contenido
3. ✅ Reportes y analíticas con Chart.js
4. ✅ Certificados y progreso de cursos
5. ✅ API REST para integraciones futuras

### Fase 4: Optimización y Deploy (1-2 semanas)
1. ✅ Pruebas unitarias e integración
2. ✅ Optimización de performance
3. ✅ Configuración de producción
4. ✅ Deploy en Azure/IIS
5. ✅ Documentación y capacitación

## Consideraciones de Performance

### Base de Datos
- Indexar campos de búsqueda frecuente
- Configurar paginación en listas grandes
- Usar proyecciones (Select específicos) en lugar de entidades completas
- Implementar caché para datos estáticos

### Frontend
- Minificar y comprimir CSS/JS
- Lazy loading para imágenes
- CDN para assets estáticos
- Optimizar consultas AJAX

### Servidor
- Configurar compresión GZIP
- Habilitar caché de respuestas
- Pool de conexiones optimizado
- Monitoreo con Application Insights

## Testing Strategy

```csharp
// Ejemplo de prueba unitaria
[TestClass]
public class CourseServiceTests
{
    private ApplicationDbContext _context;
    private CourseService _service;
    
    [TestInitialize]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _context = new ApplicationDbContext(options);
        _service = new CourseService(_context, new MapperConfiguration(cfg => {
            cfg.AddProfile<MappingProfile>();
        }).CreateMapper());
    }
    
    [TestMethod]
    public async Task GetAllCoursesAsync_ShouldReturnActiveCourses()
    {
        // Arrange
        _context.Courses.AddRange(
            new Course { Title = "Course 1", IsActive = true },
            new Course { Title = "Course 2", IsActive = false }
        );
        await _context.SaveChangesAsync();
        
        // Act
        var result = await _service.GetAllCoursesAsync();
        
        // Assert
        Assert.AreEqual(1, result.Count());
        Assert.AreEqual("Course 1", result.First().Title);
    }
}
```

## Deployment y DevOps

### Azure App Service
```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'windows-latest'

variables:
  buildConfiguration: 'Release'

steps:
- task: DotNetCoreCLI@2
  displayName: 'Restore packages'
  inputs:
    command: 'restore'
    projects: '**/*.csproj'

- task: DotNetCoreCLI@2
  displayName: 'Build application'
  inputs:
    command: 'build'
    projects: '**/*.csproj'
    arguments: '--configuration $(buildConfiguration)'

- task: DotNetCoreCLI@2
  displayName: 'Run tests'
  inputs:
    command: 'test'
    projects: '**/*Tests/*.csproj'

- task: DotNetCoreCLI@2
  displayName: 'Publish application'
  inputs:
    command: 'publish'
    publishWebProjects: true
    arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: '$(Build.ArtifactStagingDirectory)'
    ArtifactName: 'drop'
```

Esta guía proporciona una base sólida para la migración completa del sistema Griver de React a C# ASP.NET Core, manteniendo toda la funcionalidad y mejorando la arquitectura empresarial.
