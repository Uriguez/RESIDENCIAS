# 🔄 Sistema Griver - Migración Detallada a C# / .NET

## 🎯 Guía Completa de Migración React → Blazor/.NET

### Versión: 2.0.0
### Fecha: Marzo 2025

---

## 🏗️ Arquitectura de Destino

### ✅ Stack Tecnológico Recomendado
```csharp
// Frontend
- Blazor Server (mejor para SEO y rapidez inicial)
- SignalR (real-time features)
- Bootstrap 5 + Custom CSS (responsive design)

// Backend  
- .NET 8 / ASP.NET Core
- Entity Framework Core 8
- SQL Server / PostgreSQL
- ASP.NET Core Identity
- AutoMapper (DTOs)
- MediatR (CQRS pattern)

// Testing
- xUnit + FluentAssertions
- Moq (mocking)
- Microsoft.AspNetCore.Mvc.Testing

// DevOps
- Docker + Docker Compose
- Azure App Service / AWS ECS
- Application Insights / Serilog
```

---

## 🔧 Mapeo de Componentes

### 1. Componentes React → Blazor

#### ✅ AuthContext.tsx → AuthenticationService.cs
```csharp
// React Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// C# Service
public interface IAuthenticationService
{
    Task<AuthResult> LoginAsync(LoginModel model);
    Task LogoutAsync();
    Task<UserInfo> GetCurrentUserAsync();
    bool IsAuthenticated { get; }
    UserInfo CurrentUser { get; }
}

[ScopedService]
public class AuthenticationService : IAuthenticationService
{
    private readonly HttpClient _httpClient;
    private readonly ILocalStorageService _localStorage;
    private readonly AuthenticationStateProvider _authStateProvider;

    public AuthenticationService(
        HttpClient httpClient,
        ILocalStorageService localStorage,
        AuthenticationStateProvider authStateProvider)
    {
        _httpClient = httpClient;
        _localStorage = localStorage;
        _authStateProvider = authStateProvider;
    }

    public async Task<AuthResult> LoginAsync(LoginModel model)
    {
        var response = await _httpClient.PostAsJsonAsync("/api/auth/login", model);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<AuthResult>();
            await _localStorage.SetItemAsync("authToken", result.Token);
            
            // Notify authentication state change
            await _authStateProvider.GetAuthenticationStateAsync();
            
            return result;
        }
        
        throw new AuthenticationException("Login failed");
    }
}
```

#### ✅ CourseManagement.tsx → CourseManagement.razor
```razor
@page "/admin/courses"
@using Griver.Application.Features.Courses
@inject ICourseService CourseService
@inject IDialogService DialogService
@inject ISnackbar Snackbar

<PageTitle>Gestión de Cursos - Sistema Griver</PageTitle>

<div class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0 text-griver-primary">Gestión de Cursos</h1>
            <p class="text-muted">Administra el catálogo de cursos de capacitación de Griver</p>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary" @onclick="ShowCreateCourseDialog">
                <i class="fas fa-plus me-2"></i>
                Nuevo Curso
            </button>
        </div>
    </div>

    <!-- Filters Card -->
    <div class="card mb-4">
        <div class="card-header">
            <h5 class="card-title mb-0">Filtros</h5>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Buscar cursos..."
                               @bind="searchTerm" @oninput="OnSearchChanged" />
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" id="filter-all" @bind="filterStatus" value="all" />
                        <label class="btn btn-outline-primary" for="filter-all">Todos</label>
                        
                        <input type="radio" class="btn-check" id="filter-active" @bind="filterStatus" value="active" />
                        <label class="btn btn-outline-primary" for="filter-active">Activos</label>
                        
                        <input type="radio" class="btn-check" id="filter-draft" @bind="filterStatus" value="draft" />
                        <label class="btn btn-outline-primary" for="filter-draft">Borradores</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-book text-primary fs-2"></i>
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <div class="fw-bold fs-4">@statistics.TotalCourses</div>
                            <small class="text-muted">Total Cursos</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- More statistics cards... -->
    </div>

    <!-- Courses Grid -->
    @if (isLoading)
    {
        <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    }
    else if (filteredCourses?.Any() == true)
    {
        <div class="row">
            @foreach (var course in filteredCourses)
            {
                <div class="col-lg-4 col-md-6 mb-4">
                    <CourseCard Course="course" 
                               OnEdit="() => ShowEditCourseDialog(course)"
                               OnDelete="() => ShowDeleteConfirmation(course)" />
                </div>
            }
        </div>
    }
    else
    {
        <EmptyState Icon="fas fa-book"
                   Title="No se encontraron cursos"
                   Description="No hay cursos que coincidan con los filtros actuales."
                   ActionText="Crear Primer Curso"
                   OnAction="ShowCreateCourseDialog" />
    }
</div>

@code {
    private List<CourseDto> courses = new();
    private List<CourseDto> filteredCourses = new();
    private CourseStatistics statistics = new();
    private string searchTerm = "";
    private string filterStatus = "all";
    private bool isLoading = true;

    protected override async Task OnInitializedAsync()
    {
        await LoadCoursesAsync();
        await LoadStatisticsAsync();
    }

    private async Task LoadCoursesAsync()
    {
        isLoading = true;
        try
        {
            courses = await CourseService.GetAllCoursesAsync();
            ApplyFilters();
        }
        catch (Exception ex)
        {
            Snackbar.Add($"Error al cargar cursos: {ex.Message}", Severity.Error);
        }
        finally
        {
            isLoading = false;
        }
    }

    private void ApplyFilters()
    {
        filteredCourses = courses.Where(course =>
        {
            var matchesSearch = string.IsNullOrEmpty(searchTerm) ||
                              course.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                              course.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase);

            var matchesStatus = filterStatus == "all" || course.Status == filterStatus;

            return matchesSearch && matchesStatus;
        }).ToList();

        StateHasChanged();
    }

    private async Task OnSearchChanged(ChangeEventArgs e)
    {
        searchTerm = e.Value?.ToString() ?? "";
        ApplyFilters();
    }

    private async Task ShowCreateCourseDialog()
    {
        var dialog = DialogService.Show<CreateCourseDialog>("Crear Nuevo Curso");
        var result = await dialog.Result;

        if (!result.Cancelled)
        {
            await LoadCoursesAsync();
            Snackbar.Add("Curso creado exitosamente", Severity.Success);
        }
    }
}
```

#### ✅ CourseCard Component
```razor
@* CourseCard.razor *@
<div class="card h-100 shadow-sm hover-card">
    <div class="card-header border-0 pb-0">
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h5 class="card-title mb-1">@Course.Title</h5>
                <div class="d-flex gap-2">
                    <span class="badge bg-light text-dark">@Course.Category</span>
                    <span class="badge @GetDifficultyBadgeClass(Course.Difficulty)">
                        @Course.Difficulty
                    </span>
                    <span class="badge @GetStatusBadgeClass(Course.Status)">
                        @GetStatusText(Course.Status)
                    </span>
                </div>
            </div>
        </div>
        <p class="text-muted small mt-2">@Course.Description</p>
    </div>
    
    <div class="card-body pt-0">
        <div class="row text-center small mb-3">
            <div class="col">
                <i class="fas fa-clock text-muted"></i>
                <div>@Course.Duration min</div>
            </div>
            <div class="col">
                <i class="fas fa-users text-muted"></i>
                <div>@Course.EnrolledStudents</div>
            </div>
            <div class="col">
                <i class="fas fa-chart-line text-muted"></i>
                <div>@Course.CompletionRate.ToString("F1")%</div>
            </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
                Creado: @Course.CreatedAt.ToString("dd/MM/yyyy")
            </small>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" @onclick="() => OnView.InvokeAsync(Course)">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-secondary" @onclick="() => OnEdit.InvokeAsync(Course)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger" @onclick="() => OnDelete.InvokeAsync(Course)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    </div>
</div>

@code {
    [Parameter] public CourseDto Course { get; set; } = default!;
    [Parameter] public EventCallback<CourseDto> OnView { get; set; }
    [Parameter] public EventCallback<CourseDto> OnEdit { get; set; }
    [Parameter] public EventCallback<CourseDto> OnDelete { get; set; }

    private string GetDifficultyBadgeClass(string difficulty) => difficulty switch
    {
        "Básico" => "bg-success",
        "Intermedio" => "bg-warning",
        "Avanzado" => "bg-danger",
        _ => "bg-secondary"
    };

    private string GetStatusBadgeClass(string status) => status switch
    {
        "active" => "bg-success",
        "draft" => "bg-secondary",
        "archived" => "bg-danger",
        _ => "bg-secondary"
    };

    private string GetStatusText(string status) => status switch
    {
        "active" => "Activo",
        "draft" => "Borrador",
        "archived" => "Archivado",
        _ => status
    };
}
```

---

## 📊 Servicios de Aplicación

### ✅ Course Service Implementation
```csharp
// ICourseService.cs
public interface ICourseService
{
    Task<List<CourseDto>> GetAllCoursesAsync();
    Task<CourseDto> GetCourseByIdAsync(int id);
    Task<CourseDto> CreateCourseAsync(CreateCourseCommand command);
    Task<CourseDto> UpdateCourseAsync(int id, UpdateCourseCommand command);
    Task DeleteCourseAsync(int id);
    Task<CourseStatistics> GetStatisticsAsync();
}

// CourseService.cs
[ScopedService]
public class CourseService : ICourseService
{
    private readonly IHttpClient _httpClient;
    private readonly IMapper _mapper;
    private readonly ILogger<CourseService> _logger;

    public CourseService(
        IHttpClient httpClient,
        IMapper mapper,
        ILogger<CourseService> logger)
    {
        _httpClient = httpClient;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<CourseDto>> GetAllCoursesAsync()
    {
        try
        {
            _logger.LogInformation("Fetching all courses");
            
            var response = await _httpClient.GetAsync("/api/courses");
            response.EnsureSuccessStatusCode();
            
            var courses = await response.Content.ReadFromJsonAsync<List<CourseDto>>();
            
            _logger.LogInformation("Successfully fetched {Count} courses", courses?.Count ?? 0);
            return courses ?? new List<CourseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching courses");
            throw new CourseServiceException("Failed to fetch courses", ex);
        }
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseCommand command)
    {
        try
        {
            _logger.LogInformation("Creating new course: {Title}", command.Title);
            
            var response = await _httpClient.PostAsJsonAsync("/api/courses", command);
            response.EnsureSuccessStatusCode();
            
            var course = await response.Content.ReadFromJsonAsync<CourseDto>();
            
            _logger.LogInformation("Successfully created course with ID: {Id}", course?.Id);
            return course!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course: {Title}", command.Title);
            throw new CourseServiceException("Failed to create course", ex);
        }
    }
}
```

### ✅ Authentication State Provider
```csharp
// GriverAuthenticationStateProvider.cs
public class GriverAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly ILocalStorageService _localStorage;
    private readonly HttpClient _httpClient;
    private readonly ILogger<GriverAuthenticationStateProvider> _logger;
    
    private ClaimsPrincipal _cachedUser = new(new ClaimsIdentity());

    public GriverAuthenticationStateProvider(
        ILocalStorageService localStorage,
        HttpClient httpClient,
        ILogger<GriverAuthenticationStateProvider> logger)
    {
        _localStorage = localStorage;
        _httpClient = httpClient;
        _logger = logger;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        try
        {
            var token = await _localStorage.GetItemAsync<string>("authToken");
            
            if (string.IsNullOrEmpty(token))
            {
                return new AuthenticationState(_cachedUser);
            }

            // Validate token and get user info
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", token);
            
            var response = await _httpClient.GetAsync("/api/auth/me");
            
            if (response.IsSuccessStatusCode)
            {
                var userInfo = await response.Content.ReadFromJsonAsync<UserInfo>();
                var identity = CreateClaimsIdentity(userInfo!);
                _cachedUser = new ClaimsPrincipal(identity);
            }
            else
            {
                await _localStorage.RemoveItemAsync("authToken");
                _cachedUser = new ClaimsPrincipal(new ClaimsIdentity());
            }

            return new AuthenticationState(_cachedUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting authentication state");
            return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
        }
    }

    private ClaimsIdentity CreateClaimsIdentity(UserInfo userInfo)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userInfo.Id.ToString()),
            new(ClaimTypes.Name, userInfo.Name),
            new(ClaimTypes.Email, userInfo.Email),
            new(ClaimTypes.Role, userInfo.Role),
            new("department", userInfo.Department ?? ""),
        };

        return new ClaimsIdentity(claims, "jwt");
    }

    public async Task LoginAsync(string token, UserInfo userInfo)
    {
        await _localStorage.SetItemAsync("authToken", token);
        
        var identity = CreateClaimsIdentity(userInfo);
        _cachedUser = new ClaimsPrincipal(identity);
        
        NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(_cachedUser)));
    }

    public async Task LogoutAsync()
    {
        await _localStorage.RemoveItemAsync("authToken");
        _cachedUser = new ClaimsPrincipal(new ClaimsIdentity());
        
        NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(_cachedUser)));
    }
}
```

---

## 🗄️ Data Layer con Entity Framework

### ✅ Entities
```csharp
// Course.cs
[Table("Courses")]
public class Course : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int Duration { get; set; } // en minutos

    [Required]
    [MaxLength(50)]
    public string Difficulty { get; set; } = string.Empty; // Básico, Intermedio, Avanzado

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "draft"; // active, draft, archived

    public int EnrolledStudents => Enrollments?.Count ?? 0;
    
    public double CompletionRate => Enrollments?.Any() == true 
        ? (double)Enrollments.Count(e => e.CompletedAt.HasValue) / Enrollments.Count * 100 
        : 0;

    // Navigation properties
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public ICollection<CourseContent> Contents { get; set; } = new List<CourseContent>();
}

// User.cs
[Table("Users")]
public class User : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "employee"; // admin, hr, employee, intern

    [MaxLength(100)]
    public string? Department { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive

    public DateTime? LastActivityAt { get; set; }

    // Navigation properties
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}

// CourseEnrollment.cs
[Table("CourseEnrollments")]
public class CourseEnrollment : BaseEntity
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int CourseId { get; set; }
    
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    [Range(0, 100)]
    public int ProgressPercentage { get; set; } = 0;
    
    [Range(0, 100)]
    public int? Score { get; set; }

    // Navigation properties
    public User User { get; set; } = default!;
    public Course Course { get; set; } = default!;
}

// BaseEntity.cs
public abstract class BaseEntity
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    [MaxLength(100)]
    public string? CreatedBy { get; set; }
    
    [MaxLength(100)]
    public string? UpdatedBy { get; set; }
}
```

### ✅ DbContext
```csharp
// GriverDbContext.cs
public class GriverDbContext : DbContext
{
    public GriverDbContext(DbContextOptions<GriverDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
    public DbSet<CourseContent> CourseContents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<CourseEnrollment>()
            .HasOne(e => e.User)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CourseEnrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<CourseEnrollment>()
            .HasIndex(e => new { e.UserId, e.CourseId })
            .IsUnique();

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed admin user
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Administrador Griver",
                Email = "admin@griver.com",
                Role = "admin",
                Status = "active",
                CreatedAt = DateTime.UtcNow
            }
        );

        // Seed sample courses
        modelBuilder.Entity<Course>().HasData(
            new Course
            {
                Id = 1,
                Title = "Seguridad Laboral Básica",
                Description = "Fundamentos de seguridad en el lugar de trabajo para empleados de Griver",
                Duration = 120,
                Difficulty = "Básico",
                Category = "Seguridad",
                Status = "active",
                CreatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = 2,
                Title = "Cultura Organizacional Griver",
                Description = "Introducción a los valores y cultura empresarial de Griver",
                Duration = 90,
                Difficulty = "Básico",
                Category = "Cultura",
                Status = "active",
                CreatedAt = DateTime.UtcNow
            }
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Audit trail
        var entries = ChangeTracker.Entries<BaseEntity>();
        
        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

---

## 🎯 CQRS con MediatR

### ✅ Commands & Queries
```csharp
// Commands/CreateCourseCommand.cs
public record CreateCourseCommand(
    string Title,
    string Description,
    int Duration,
    string Difficulty,
    string Category
) : IRequest<CourseDto>;

public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, CourseDto>
{
    private readonly GriverDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateCourseCommandHandler> _logger;

    public CreateCourseCommandHandler(
        GriverDbContext context,
        IMapper mapper,
        ILogger<CreateCourseCommandHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<CourseDto> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating new course: {Title}", request.Title);

        var course = new Course
        {
            Title = request.Title,
            Description = request.Description,
            Duration = request.Duration,
            Difficulty = request.Difficulty,
            Category = request.Category
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync(cancellationToken);

        var courseDto = _mapper.Map<CourseDto>(course);
        
        _logger.LogInformation("Successfully created course with ID: {Id}", course.Id);
        return courseDto;
    }
}

// Queries/GetCoursesQuery.cs
public record GetCoursesQuery(
    string? SearchTerm = null,
    string? Status = null,
    string? Category = null
) : IRequest<List<CourseDto>>;

public class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, List<CourseDto>>
{
    private readonly GriverDbContext _context;
    private readonly IMapper _mapper;

    public GetCoursesQueryHandler(GriverDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CourseDto>> Handle(GetCoursesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Courses
            .Include(c => c.Enrollments)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(c => 
                c.Title.Contains(request.SearchTerm) ||
                c.Description.Contains(request.SearchTerm) ||
                c.Category.Contains(request.SearchTerm));
        }

        if (!string.IsNullOrEmpty(request.Status))
        {
            query = query.Where(c => c.Status == request.Status);
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(c => c.Category == request.Category);
        }

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<CourseDto>>(courses);
    }
}
```

### ✅ API Controllers
```csharp
// Controllers/CoursesController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(IMediator mediator, ILogger<CoursesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseDto>>> GetCourses(
        [FromQuery] string? searchTerm,
        [FromQuery] string? status,
        [FromQuery] string? category)
    {
        try
        {
            var query = new GetCoursesQuery(searchTerm, status, category);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching courses");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,hr")]
    public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var course = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(int id)
    {
        try
        {
            var query = new GetCourseByIdQuery(id);
            var course = await _mediator.Send(query);
            
            if (course == null)
            {
                return NotFound($"Course with ID {id} not found");
            }

            return Ok(course);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching course {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
```

---

## 🔐 Authentication & Authorization

### ✅ JWT Configuration
```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("AdminOrHR", policy => policy.RequireRole("admin", "hr"));
    options.AddPolicy("AllEmployees", policy => policy.RequireRole("admin", "hr", "employee", "intern"));
});

// JWT Service
public interface IJwtService
{
    string GenerateToken(UserInfo user);
    ClaimsPrincipal? ValidateToken(string token);
}

[ScopedService]
public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtService> _logger;

    public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateToken(UserInfo user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("department", user.Department ?? "")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
            return null;
        }
    }
}
```

---

## 🧪 Testing Strategy

### ✅ Unit Tests
```csharp
// Tests/Services/CourseServiceTests.cs
public class CourseServiceTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public CourseServiceTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCoursesAsync_ShouldReturnCourses()
    {
        // Arrange
        var serviceProvider = _factory.Services;
        using var scope = serviceProvider.CreateScope();
        var courseService = scope.ServiceProvider.GetRequiredService<ICourseService>();

        // Act
        var courses = await courseService.GetAllCoursesAsync();

        // Assert
        courses.Should().NotBeNull();
        courses.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task CreateCourseAsync_ShouldCreateCourse()
    {
        // Arrange
        var serviceProvider = _factory.Services;
        using var scope = serviceProvider.CreateScope();
        var courseService = scope.ServiceProvider.GetRequiredService<ICourseService>();

        var command = new CreateCourseCommand(
            "Test Course",
            "Test Description",
            120,
            "Básico",
            "Test Category"
        );

        // Act
        var course = await courseService.CreateCourseAsync(command);

        // Assert
        course.Should().NotBeNull();
        course.Title.Should().Be(command.Title);
        course.Id.Should().BeGreaterThan(0);
    }
}

// Tests/Controllers/CoursesControllerTests.cs
public class CoursesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public CoursesControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetCourses_ShouldReturnOk()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/courses");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var courses = JsonSerializer.Deserialize<List<CourseDto>>(content, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        courses.Should().NotBeNull();
    }

    private async Task<string> GetAuthTokenAsync()
    {
        var loginRequest = new
        {
            email = "admin@griver.com",
            password = "AdminPassword123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        response.EnsureSuccessStatusCode();

        var authResult = await response.Content.ReadFromJsonAsync<AuthResult>();
        return authResult!.Token;
    }
}
```

---

## 🚀 Deployment Configuration

### ✅ Docker Configuration
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Griver.Web/Griver.Web.csproj", "Griver.Web/"]
COPY ["Griver.Application/Griver.Application.csproj", "Griver.Application/"]
COPY ["Griver.Infrastructure/Griver.Infrastructure.csproj", "Griver.Infrastructure/"]
COPY ["Griver.Domain/Griver.Domain.csproj", "Griver.Domain/"]

RUN dotnet restore "Griver.Web/Griver.Web.csproj"
COPY . .
WORKDIR "/src/Griver.Web"
RUN dotnet build "Griver.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Griver.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Griver.Web.dll"]
```

### ✅ Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  griver-web:
    build: .
    ports:
      - "8080:80"
      - "8443:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=GriverDb;User=sa;Password=YourPassword123!;TrustServerCertificate=true
      - Jwt__Key=YourSuperSecretKeyForJWTWhichShouldBe32Characters!
      - Jwt__Issuer=GriverSystem
      - Jwt__Audience=GriverUsers
    depends_on:
      - db
    networks:
      - griver-network

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - griver-db:/var/opt/mssql
    networks:
      - griver-network

volumes:
  griver-db:

networks:
  griver-network:
    driver: bridge
```

### ✅ appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GriverDb;Trusted_Connection=true;TrustServerCertificate=true"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTWhichShouldBe32Characters!",
    "Issuer": "GriverSystem",
    "Audience": "GriverUsers",
    "ExpiryHours": 8
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Griver": {
    "CompanyName": "Griver",
    "SupportEmail": "soporte@griver.com",
    "AdminEmail": "admin@griver.com"
  }
}
```

---

## 📋 Migration Checklist

### ✅ Pre-Migration Tasks
- [ ] **Data audit**: Exportar datos actuales del sistema React
- [ ] **API documentation**: Documentar todos los endpoints existentes
- [ ] **User requirements**: Confirmar funcionalidades críticas
- [ ] **Performance baseline**: Métricas actuales de rendimiento
- [ ] **Security audit**: Revisar vulnerabilidades existentes

### ✅ Development Phase
- [ ] **Setup infrastructure**: .NET 8 project structure
- [ ] **Database migration**: Entity Framework migrations
- [ ] **Authentication system**: JWT + Identity integration
- [ ] **Core entities**: User, Course, Enrollment models
- [ ] **CRUD operations**: Complete admin functionality
- [ ] **User interfaces**: Blazor components migration
- [ ] **API endpoints**: RESTful services implementation
- [ ] **Testing suite**: Unit + Integration + E2E tests

### ✅ Testing Phase
- [ ] **Unit tests**: >80% code coverage
- [ ] **Integration tests**: API endpoints validation
- [ ] **Performance tests**: Load testing scenarios
- [ ] **Security tests**: Penetration testing
- [ ] **User acceptance**: Stakeholder validation
- [ ] **Cross-browser**: Compatibility testing

### ✅ Deployment Phase
- [ ] **Production environment**: Server provisioning
- [ ] **Database deployment**: Migration scripts
- [ ] **SSL certificates**: HTTPS configuration
- [ ] **Monitoring setup**: Application Insights/Logging
- [ ] **Backup strategy**: Database + files backup
- [ ] **Load balancing**: High availability setup

### ✅ Post-Migration Tasks
- [ ] **Data validation**: Verify all data migrated correctly
- [ ] **Performance monitoring**: System health checks
- [ ] **User training**: Admin and end-user documentation
- [ ] **Support documentation**: Troubleshooting guides
- [ ] **Maintenance plan**: Update and patch strategy

---

## 🎯 Success Metrics

### ✅ Performance Targets
- **Page load time**: <2 seconds
- **API response time**: <500ms average
- **Database queries**: <100ms average
- **Memory usage**: <512MB per instance
- **CPU usage**: <70% under normal load

### ✅ Quality Targets
- **Code coverage**: >80%
- **Bug density**: <1 bug per 1000 lines of code
- **Security score**: A+ grade
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO score**: >90 Lighthouse

### ✅ Business Targets
- **User satisfaction**: >4.5/5 rating
- **System uptime**: >99.5%
- **Training completion**: >85% course completion rate
- **Support tickets**: <5% of total users per month
- **Feature adoption**: >80% new feature usage

---

**Migración a C#/.NET - Guía Completa** ✅

*Siguiente fase: Implementación gradual con MVP funcional*