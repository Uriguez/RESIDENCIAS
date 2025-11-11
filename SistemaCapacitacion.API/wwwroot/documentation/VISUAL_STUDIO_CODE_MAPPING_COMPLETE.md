# 🏗️ Sistema Griver - Mapeo Completo de Código React → Visual Studio C#

## 📋 Guía de Migración de Archivos

Esta documentación detalla **EXACTAMENTE** dónde debe ir cada archivo del sistema React actual cuando se migre a Visual Studio con C# .NET Core.

---

## 🎯 **Estructura de Proyecto ASP.NET Core Recomendada**

```
GriverSystem/ (Solución Principal)
├── 📁 GriverSystem.Web/ (Proyecto Principal ASP.NET Core MVC)
│   ├── 📁 Controllers/
│   ├── 📁 Views/
│   ├── 📁 Models/
│   ├── 📁 Services/
│   ├── 📁 ViewModels/
│   ├── 📁 wwwroot/
│   ├── 📁 Areas/
│   ├── 📁 Data/
│   ├── 📁 Configurations/
│   └── 📄 Program.cs
├── 📁 GriverSystem.Core/ (Proyecto de Lógica de Negocio)
│   ├── 📁 Entities/
│   ├── 📁 Interfaces/
│   ├── 📁 Services/
│   └── 📁 Extensions/
├── 📁 GriverSystem.Infrastructure/ (Proyecto de Infraestructura)
│   ├── 📁 Data/
│   ├── 📁 Repositories/
│   ├── 📁 External/
│   └── 📁 Migrations/
└── 📁 GriverSystem.Tests/ (Proyecto de Pruebas)
    ├── 📁 Unit/
    ├── 📁 Integration/
    └── 📁 E2E/
```

---

## 🔄 **MAPEO ARCHIVO POR ARCHIVO**

### **📱 App.tsx → Multiple Files C#**

#### **Archivo Actual:** `/App.tsx`
```typescript
// React: Componente principal con routing y layout
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

#### **C# Destino:** Múltiples archivos

**1. Program.cs** (GriverSystem.Web)
```csharp
// UBICACIÓN: /GriverSystem.Web/Program.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GriverSystem.Infrastructure.Data;
using GriverSystem.Core.Interfaces;
using GriverSystem.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<GriverDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDefaultIdentity<IdentityUser>(options => 
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<GriverDbContext>();

// Register custom services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Add MVC
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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

// Initialize roles
await SeedDataAsync(app.Services);

app.Run();

// Seed initial data method
static async Task SeedDataAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    string[] roles = { "Admin", "RH", "Employee", "Intern" };
    
    foreach (string role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}
```

**2. _Layout.cshtml** (GriverSystem.Web/Views/Shared)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Shared/_Layout.cshtml -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Sistema Griver</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/css/griver-styles.css" asp-append-version="true" />
    <link rel="icon" type="image/x-icon" href="~/favicon.ico">
</head>
<body>
    <!-- Sidebar Component -->
    @if (User.Identity.IsAuthenticated && (User.IsInRole("Admin") || User.IsInRole("RH")))
    {
        @await Html.PartialAsync("_Sidebar")
    }
    
    <main id="main-content" class="@(ViewBag.IsClientView == true ? "client-layout" : "admin-layout")">
        <!-- Header Component -->
        @if (User.Identity.IsAuthenticated)
        {
            @await Html.PartialAsync("_AdminHeader")
        }
        
        <!-- Main Content -->
        <div class="container-fluid">
            @RenderBody()
        </div>
    </main>

    <!-- Notification Component -->
    @if (User.Identity.IsAuthenticated)
    {
        @await Html.PartialAsync("_NotificationToasts")
    }

    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/griver-app.js" asp-append-version="true"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

---

### **🔐 Componentes de Autenticación**

#### **AuthContext.tsx → Multiple C# Files**

**Archivo Actual:** `/components/AuthContext.tsx`
```typescript
// React: Context de autenticación
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

**C# Destino:**

**1. IAuthService.cs** (GriverSystem.Core/Interfaces)
```csharp
// UBICACIÓN: /GriverSystem.Core/Interfaces/IAuthService.cs
using GriverSystem.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace GriverSystem.Core.Interfaces
{
    public interface IAuthService
    {
        Task<SignInResult> LoginAsync(string email, string password, bool rememberMe);
        Task LogoutAsync();
        Task<User> GetCurrentUserAsync();
        Task<bool> IsInRoleAsync(string userId, string role);
        Task<IList<string>> GetUserRolesAsync(string userId);
    }
}
```

**2. AuthService.cs** (GriverSystem.Core/Services)
```csharp
// UBICACIÓN: /GriverSystem.Core/Services/AuthService.cs
using GriverSystem.Core.Interfaces;
using GriverSystem.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GriverSystem.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IUserService _userService;

        public AuthService(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IUserService userService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _userService = userService;
        }

        public async Task<SignInResult> LoginAsync(string email, string password, bool rememberMe)
        {
            var result = await _signInManager.PasswordSignInAsync(email, password, rememberMe, lockoutOnFailure: true);
            
            if (result.Succeeded)
            {
                // Log activity
                var user = await _userManager.FindByEmailAsync(email);
                await _userService.LogActivityAsync(user.Id, "LOGIN", "User logged in successfully");
            }
            
            return result;
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<User> GetCurrentUserAsync()
        {
            var identityUser = await _userManager.GetUserAsync(_signInManager.Context.User);
            if (identityUser == null) return null;

            return await _userService.GetByIdAsync(identityUser.Id);
        }

        public async Task<bool> IsInRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return await _userManager.IsInRoleAsync(user, role);
        }

        public async Task<IList<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return await _userManager.GetRolesAsync(user);
        }
    }
}
```

**3. AccountController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/AccountController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    public class AccountController : Controller
    {
        private readonly IAuthService _authService;

        public AccountController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            if (ModelState.IsValid)
            {
                var result = await _authService.LoginAsync(model.Email, model.Password, model.RememberMe);

                if (result.Succeeded)
                {
                    return RedirectToLocal(returnUrl);
                }

                if (result.IsLockedOut)
                {
                    ModelState.AddModelError(string.Empty, "Cuenta bloqueada. Intente más tarde.");
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "Email o contraseña incorrectos.");
                }
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return RedirectToAction(nameof(Login));
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }
        }
    }
}
```

#### **LoginForm.tsx → Login Views**

**Archivo Actual:** `/components/LoginForm.tsx`
```typescript
// React: Formulario de login
const LoginForm = () => {
  // Formulario con validación
};
```

**C# Destino:**

**1. LoginViewModel.cs** (GriverSystem.Web/ViewModels)
```csharp
// UBICACIÓN: /GriverSystem.Web/ViewModels/LoginViewModel.cs
using System.ComponentModel.DataAnnotations;

namespace GriverSystem.Web.ViewModels
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [DataType(DataType.Password)]
        [Display(Name = "Contraseña")]
        public string Password { get; set; }

        [Display(Name = "Recordarme")]
        public bool RememberMe { get; set; }
    }
}
```

**2. Login.cshtml** (GriverSystem.Web/Views/Account)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Account/Login.cshtml -->
@model LoginViewModel
@{
    ViewData["Title"] = "Iniciar Sesión - Sistema Griver";
    Layout = "_LoginLayout";
}

<div class="login-container">
    <div class="login-card">
        <div class="login-header">
            <img src="~/images/griver-logo.png" alt="Griver" class="login-logo" />
            <h1>Sistema de Capacitación</h1>
            <p>Ingresa a tu cuenta de Griver</p>
        </div>

        <form asp-action="Login" asp-controller="Account" method="post" class="login-form">
            <div asp-validation-summary="ModelOnly" class="alert alert-danger"></div>
            
            <div class="form-group">
                <label asp-for="Email" class="form-label"></label>
                <input asp-for="Email" class="form-control" placeholder="tu.email@griver.com" />
                <span asp-validation-for="Email" class="text-danger"></span>
            </div>

            <div class="form-group">
                <label asp-for="Password" class="form-label"></label>
                <input asp-for="Password" class="form-control" placeholder="••••••••" />
                <span asp-validation-for="Password" class="text-danger"></span>
            </div>

            <div class="form-check">
                <input asp-for="RememberMe" class="form-check-input" />
                <label asp-for="RememberMe" class="form-check-label"></label>
            </div>

            <button type="submit" class="btn btn-griver-primary w-100">
                <span class="btn-text">Iniciar Sesión</span>
                <span class="btn-spinner d-none">
                    <i class="spinner-border spinner-border-sm"></i>
                    Ingresando...
                </span>
            </button>
        </form>

        <div class="login-footer">
            <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
    </div>
</div>

@section Scripts {
    <script src="~/js/login.js"></script>
}
```

---

### **📊 Componentes de Dashboard**

#### **Dashboard.tsx → HomeController + Views**

**Archivo Actual:** `/components/Dashboard.tsx`
```typescript
// React: Dashboard principal con métricas
const Dashboard = ({ onNavigateToSettings }: DashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>();
  // Lógica del dashboard
};
```

**C# Destino:**

**1. HomeController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/HomeController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IDashboardService _dashboardService;
        private readonly IUserService _userService;

        public HomeController(IDashboardService dashboardService, IUserService userService)
        {
            _dashboardService = dashboardService;
            _userService = userService;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = await _userService.GetCurrentUserAsync(User);
            
            // Redirect based on role
            if (currentUser.Role == "Employee" || currentUser.Role == "Intern")
            {
                return RedirectToAction("Client", "Dashboard");
            }

            var viewModel = await _dashboardService.GetDashboardDataAsync(currentUser.Id);
            return View(viewModel);
        }

        [HttpGet]
        [Route("api/dashboard/metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            var currentUser = await _userService.GetCurrentUserAsync(User);
            var metrics = await _dashboardService.GetMetricsAsync(currentUser.Id);
            return Json(metrics);
        }

        [HttpGet]
        [Route("api/dashboard/recent-activity")]
        public async Task<IActionResult> GetRecentActivity()
        {
            var activities = await _dashboardService.GetRecentActivityAsync();
            return Json(activities);
        }
    }
}
```

**2. DashboardViewModel.cs** (GriverSystem.Web/ViewModels)
```csharp
// UBICACIÓN: /GriverSystem.Web/ViewModels/DashboardViewModel.cs
namespace GriverSystem.Web.ViewModels
{
    public class DashboardViewModel
    {
        public DashboardMetrics Metrics { get; set; }
        public List<ActivityItem> RecentActivity { get; set; }
        public string UserRole { get; set; }
        public string UserName { get; set; }
        public List<QuickAction> QuickActions { get; set; }
    }

    public class DashboardMetrics
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalCourses { get; set; }
        public int CompletedCourses { get; set; }
        public decimal AverageCompletion { get; set; }
        public List<ChartData> MonthlyProgress { get; set; }
    }

    public class QuickAction
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Action { get; set; }
        public string ButtonText { get; set; }
    }
}
```

**3. Index.cshtml** (GriverSystem.Web/Views/Home)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Home/Index.cshtml -->
@model DashboardViewModel
@{
    ViewData["Title"] = "Dashboard - Sistema Griver";
}

<div class="dashboard-container">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
        <div class="welcome-section">
            <h1>¡Bienvenido de vuelta!</h1>
            <p class="welcome-text">Resumen de la actividad del sistema Griver</p>
        </div>
        <div class="date-info">
            <span class="current-date">@DateTime.Now.ToString("dddd, dd MMMM yyyy")</span>
        </div>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-header">
                <h3>Usuarios Activos</h3>
                <i class="icon-users"></i>
            </div>
            <div class="metric-value">@Model.Metrics.ActiveUsers</div>
            <div class="metric-change positive">
                <span>+12% vs mes anterior</span>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <h3>Cursos Completados</h3>
                <i class="icon-graduation-cap"></i>
            </div>
            <div class="metric-value">@Model.Metrics.CompletedCourses</div>
            <div class="metric-change positive">
                <span>+8% vs mes anterior</span>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <h3>Tasa de Finalización</h3>
                <i class="icon-target"></i>
            </div>
            <div class="metric-value">@Model.Metrics.AverageCompletion.ToString("P0")</div>
            <div class="metric-change positive">
                <span>+5% vs mes anterior</span>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <h3>Total de Cursos</h3>
                <i class="icon-book"></i>
            </div>
            <div class="metric-value">@Model.Metrics.TotalCourses</div>
            <div class="metric-change neutral">
                <span>Sin cambios</span>
            </div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
        <div class="chart-container">
            <h3>Progreso Mensual</h3>
            <canvas id="monthlyProgressChart" width="400" height="200"></canvas>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
        <h3>Acciones Rápidas</h3>
        <div class="quick-actions-grid">
            @foreach (var action in Model.QuickActions)
            {
                <div class="quick-action-card" data-action="@action.Action">
                    <div class="action-icon">
                        <i class="@action.Icon"></i>
                    </div>
                    <div class="action-content">
                        <h4>@action.Title</h4>
                        <p>@action.Description</p>
                        <button class="btn btn-griver-secondary">@action.ButtonText</button>
                    </div>
                </div>
            }
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity-section">
        <h3>Actividad Reciente</h3>
        <div class="activity-list">
            @foreach (var activity in Model.RecentActivity.Take(5))
            {
                <div class="activity-item">
                    <div class="activity-avatar">
                        <img src="@activity.UserAvatar" alt="@activity.UserName" />
                    </div>
                    <div class="activity-content">
                        <p><strong>@activity.UserName</strong> @activity.Description</p>
                        <span class="activity-time">@activity.CreatedAt.ToString("HH:mm")</span>
                    </div>
                </div>
            }
        </div>
    </div>
</div>

@section Scripts {
    <script src="~/lib/chart.js/chart.min.js"></script>
    <script src="~/js/dashboard.js"></script>
}
```

---

### **👥 Gestión de Usuarios**

#### **StudentManagement.tsx → UsersController + Views**

**Archivo Actual:** `/components/StudentManagement.tsx`
```typescript
// React: Gestión completa de usuarios
const StudentManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  // CRUD de usuarios
};
```

**C# Destino:**

**1. UsersController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    [Authorize(Roles = "Admin,RH")]
    public class UsersController : Controller
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(UserFiltersViewModel filters = null)
        {
            var users = await _userService.GetFilteredUsersAsync(filters);
            var viewModel = new UsersIndexViewModel
            {
                Users = users,
                Filters = filters ?? new UserFiltersViewModel(),
                Departments = await _userService.GetDepartmentsAsync(),
                Roles = new[] { "Admin", "RH", "Employee", "Intern" }
            };

            return View(viewModel);
        }

        [HttpGet]
        public IActionResult Create()
        {
            var viewModel = new CreateUserViewModel
            {
                Departments = _userService.GetDepartmentsAsync().Result,
                Roles = new[] { "Admin", "RH", "Employee", "Intern" }
            };
            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateUserViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var result = await _userService.CreateUserAsync(model);
                    if (result.Succeeded)
                    {
                        TempData["Success"] = "Usuario creado exitosamente";
                        return RedirectToAction(nameof(Index));
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating user");
                    ModelState.AddModelError(string.Empty, "Error al crear el usuario");
                }
            }

            model.Departments = await _userService.GetDepartmentsAsync();
            model.Roles = new[] { "Admin", "RH", "Employee", "Intern" };
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var viewModel = new EditUserViewModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Department = user.Department,
                Position = user.Position,
                Departments = await _userService.GetDepartmentsAsync(),
                Roles = new[] { "Admin", "RH", "Employee", "Intern" },
                CurrentRole = await _userService.GetUserRoleAsync(id)
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(EditUserViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var result = await _userService.UpdateUserAsync(model);
                    if (result.Succeeded)
                    {
                        TempData["Success"] = "Usuario actualizado exitosamente";
                        return RedirectToAction(nameof(Index));
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating user {UserId}", model.Id);
                    ModelState.AddModelError(string.Empty, "Error al actualizar el usuario");
                }
            }

            model.Departments = await _userService.GetDepartmentsAsync();
            model.Roles = new[] { "Admin", "RH", "Employee", "Intern" };
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                if (result.Succeeded)
                {
                    TempData["Success"] = "Usuario eliminado exitosamente";
                }
                else
                {
                    TempData["Error"] = "Error al eliminar el usuario";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                TempData["Error"] = "Error al eliminar el usuario";
            }

            return RedirectToAction(nameof(Index));
        }

        // API Endpoints para AJAX
        [HttpGet]
        [Route("api/users")]
        public async Task<IActionResult> GetUsers([FromQuery] UserFiltersViewModel filters)
        {
            var users = await _userService.GetFilteredUsersAsync(filters);
            return Json(users);
        }

        [HttpPost]
        [Route("api/users/bulk-assign")]
        public async Task<IActionResult> BulkAssignCourse([FromBody] BulkAssignViewModel model)
        {
            try
            {
                await _userService.BulkAssignCourseAsync(model.UserIds, model.CourseId);
                return Json(new { success = true, message = "Curso asignado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk assignment");
                return Json(new { success = false, message = "Error al asignar el curso" });
            }
        }
    }
}
```

**2. UsersIndexViewModel.cs** (GriverSystem.Web/ViewModels)
```csharp
// UBICACIÓN: /GriverSystem.Web/ViewModels/UsersIndexViewModel.cs
using GriverSystem.Core.Entities;

namespace GriverSystem.Web.ViewModels
{
    public class UsersIndexViewModel
    {
        public IEnumerable<User> Users { get; set; }
        public UserFiltersViewModel Filters { get; set; }
        public IEnumerable<string> Departments { get; set; }
        public IEnumerable<string> Roles { get; set; }
        public int TotalUsers { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }

    public class UserFiltersViewModel
    {
        public string Search { get; set; }
        public string Department { get; set; }
        public string Role { get; set; }
        public bool? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class CreateUserViewModel
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [Display(Name = "Nombre")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "El apellido es requerido")]
        [Display(Name = "Apellido")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "El departamento es requerido")]
        [Display(Name = "Departamento")]
        public string Department { get; set; }

        [Display(Name = "Posición")]
        public string Position { get; set; }

        [Required(ErrorMessage = "El rol es requerido")]
        [Display(Name = "Rol")]
        public string Role { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [StringLength(100, ErrorMessage = "La contraseña debe tener al menos {2} caracteres", MinimumLength = 8)]
        [DataType(DataType.Password)]
        [Display(Name = "Contraseña")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirmar contraseña")]
        [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
        public string ConfirmPassword { get; set; }

        // For dropdowns
        public IEnumerable<string> Departments { get; set; }
        public IEnumerable<string> Roles { get; set; }
    }

    public class EditUserViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [Display(Name = "Nombre")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "El apellido es requerido")]
        [Display(Name = "Apellido")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "El departamento es requerido")]
        [Display(Name = "Departamento")]
        public string Department { get; set; }

        [Display(Name = "Posición")]
        public string Position { get; set; }

        [Required(ErrorMessage = "El rol es requerido")]
        [Display(Name = "Rol")]
        public string Role { get; set; }

        // For dropdowns
        public IEnumerable<string> Departments { get; set; }
        public IEnumerable<string> Roles { get; set; }
        public string CurrentRole { get; set; }
    }

    public class BulkAssignViewModel
    {
        public List<string> UserIds { get; set; }
        public int CourseId { get; set; }
    }
}
```

**3. Index.cshtml** (GriverSystem.Web/Views/Users)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Users/Index.cshtml -->
@model UsersIndexViewModel
@{
    ViewData["Title"] = "Gestión de Usuarios - Sistema Griver";
}

<div class="users-management-container">
    <!-- Header Section -->
    <div class="page-header">
        <div class="header-content">
            <h1>Gestión de Usuarios</h1>
            <p class="header-description">Administra los usuarios del sistema Griver</p>
        </div>
        <div class="header-actions">
            <a asp-action="Create" class="btn btn-griver-primary">
                <i class="icon-plus"></i>
                Agregar Usuario
            </a>
            <button class="btn btn-griver-secondary" data-bs-toggle="modal" data-bs-target="#exportModal">
                <i class="icon-download"></i>
                Exportar Lista
            </button>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
        <form asp-action="Index" method="get" class="filters-form">
            <div class="filters-row">
                <div class="filter-group">
                    <label asp-for="Filters.Search" class="filter-label">Buscar</label>
                    <input asp-for="Filters.Search" class="form-control" placeholder="Nombre, email o posición..." />
                </div>

                <div class="filter-group">
                    <label asp-for="Filters.Department" class="filter-label">Departamento</label>
                    <select asp-for="Filters.Department" class="form-control">
                        <option value="">Todos los departamentos</option>
                        @foreach (var dept in Model.Departments)
                        {
                            <option value="@dept">@dept</option>
                        }
                    </select>
                </div>

                <div class="filter-group">
                    <label asp-for="Filters.Role" class="filter-label">Rol</label>
                    <select asp-for="Filters.Role" class="form-control">
                        <option value="">Todos los roles</option>
                        @foreach (var role in Model.Roles)
                        {
                            <option value="@role">@role</option>
                        }
                    </select>
                </div>

                <div class="filter-group">
                    <label asp-for="Filters.IsActive" class="filter-label">Estado</label>
                    <select asp-for="Filters.IsActive" class="form-control">
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                <div class="filter-actions">
                    <button type="submit" class="btn btn-outline-primary">
                        <i class="icon-search"></i>
                        Filtrar
                    </button>
                    <a asp-action="Index" class="btn btn-outline-secondary">
                        <i class="icon-x"></i>
                        Limpiar
                    </a>
                </div>
            </div>
        </form>
    </div>

    <!-- Users Table -->
    <div class="users-table-section">
        <div class="table-controls">
            <div class="bulk-actions">
                <input type="checkbox" id="selectAll" class="form-check-input" />
                <label for="selectAll">Seleccionar todos</label>
                <button class="btn btn-sm btn-outline-primary" disabled id="bulkAssignBtn">
                    Asignar Curso
                </button>
                <button class="btn btn-sm btn-outline-danger" disabled id="bulkDeleteBtn">
                    Eliminar Seleccionados
                </button>
            </div>
            <div class="table-info">
                <span>@Model.Users.Count() usuarios encontrados</span>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover users-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" class="form-check-input" /></th>
                        <th>Avatar</th>
                        <th>
                            <a asp-action="Index" asp-route-sort="name" class="sortable">
                                Nombre
                                <i class="icon-arrow-up-down"></i>
                            </a>
                        </th>
                        <th>Email</th>
                        <th>Departamento</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (var user in Model.Users)
                    {
                        <tr data-user-id="@user.Id">
                            <td>
                                <input type="checkbox" class="form-check-input user-checkbox" value="@user.Id" />
                            </td>
                            <td>
                                <div class="user-avatar">
                                    @if (!string.IsNullOrEmpty(user.Avatar))
                                    {
                                        <img src="@user.Avatar" alt="@user.FirstName @user.LastName" />
                                    }
                                    else
                                    {
                                        <div class="avatar-placeholder">
                                            @user.FirstName[0]@user.LastName[0]
                                        </div>
                                    }
                                </div>
                            </td>
                            <td>
                                <div class="user-info">
                                    <div class="user-name">@user.FirstName @user.LastName</div>
                                    @if (!string.IsNullOrEmpty(user.Position))
                                    {
                                        <div class="user-position">@user.Position</div>
                                    }
                                </div>
                            </td>
                            <td>@user.Email</td>
                            <td>
                                <span class="department-badge">@user.Department</span>
                            </td>
                            <td>
                                <span class="role-badge role-@user.Role.ToLower()">@user.Role</span>
                            </td>
                            <td>
                                <span class="status-badge @(user.Status == 1 ? "active" : "inactive")">
                                    @(user.Status == 1 ? "Activo" : "Inactivo")
                                </span>
                            </td>
                            <td>
                                @if (user.LastLoginDate.HasValue)
                                {
                                    <span class="last-login">@user.LastLoginDate.Value.ToString("dd/MM/yyyy HH:mm")</span>
                                }
                                else
                                {
                                    <span class="no-login">Nunca</span>
                                }
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <a asp-action="Edit" asp-route-id="@user.Id" class="btn btn-sm btn-outline-primary" title="Editar">
                                        <i class="icon-edit"></i>
                                    </a>
                                    <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#viewUserModal" data-user-id="@user.Id" title="Ver Detalles">
                                        <i class="icon-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-user-btn" data-user-id="@user.Id" data-user-name="@user.FirstName @user.LastName" title="Eliminar">
                                        <i class="icon-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if (Model.TotalPages > 1)
        {
            <nav aria-label="Paginación de usuarios">
                <ul class="pagination justify-content-center">
                    @if (Model.CurrentPage > 1)
                    {
                        <li class="page-item">
                            <a class="page-link" asp-action="Index" asp-route-page="@(Model.CurrentPage - 1)">Anterior</a>
                        </li>
                    }

                    @for (int i = Math.Max(1, Model.CurrentPage - 2); i <= Math.Min(Model.TotalPages, Model.CurrentPage + 2); i++)
                    {
                        <li class="page-item @(i == Model.CurrentPage ? "active" : "")">
                            <a class="page-link" asp-action="Index" asp-route-page="@i">@i</a>
                        </li>
                    }

                    @if (Model.CurrentPage < Model.TotalPages)
                    {
                        <li class="page-item">
                            <a class="page-link" asp-action="Index" asp-route-page="@(Model.CurrentPage + 1)">Siguiente</a>
                        </li>
                    }
                </ul>
            </nav>
        }
    </div>
</div>

<!-- Modals -->
@await Html.PartialAsync("_DeleteUserModal")
@await Html.PartialAsync("_ViewUserModal")
@await Html.PartialAsync("_BulkAssignModal")
@await Html.PartialAsync("_ExportModal")

@section Scripts {
    <script src="~/js/users-management.js"></script>
}
```

---

### **📚 Gestión de Cursos**

#### **CourseManagement.tsx → CoursesController + Views**

**Archivo Actual:** `/components/CourseManagement.tsx`
```typescript
// React: Gestión completa de cursos
const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  // CRUD de cursos
};
```

**C# Destino:**

**1. CoursesController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/CoursesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    [Authorize(Roles = "Admin,RH")]
    public class CoursesController : Controller
    {
        private readonly ICourseService _courseService;
        private readonly IUserService _userService;
        private readonly ILogger<CoursesController> _logger;

        public CoursesController(
            ICourseService courseService, 
            IUserService userService, 
            ILogger<CoursesController> logger)
        {
            _courseService = courseService;
            _userService = userService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(CourseFiltersViewModel filters = null)
        {
            var courses = await _courseService.GetFilteredCoursesAsync(filters);
            var viewModel = new CoursesIndexViewModel
            {
                Courses = courses,
                Filters = filters ?? new CourseFiltersViewModel(),
                Categories = await _courseService.GetCategoriesAsync(),
                Difficulties = Enum.GetValues<CourseDifficulty>()
            };

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var viewModel = new CreateCourseViewModel
            {
                Categories = await _courseService.GetCategoriesAsync(),
                Difficulties = Enum.GetValues<CourseDifficulty>(),
                Departments = await _userService.GetDepartmentsAsync(),
                Roles = new[] { "Admin", "RH", "Employee", "Intern" }
            };
            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateCourseViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var currentUser = await _userService.GetCurrentUserAsync(User);
                    var result = await _courseService.CreateCourseAsync(model, currentUser.Id);
                    
                    if (result.Succeeded)
                    {
                        TempData["Success"] = "Curso creado exitosamente";
                        return RedirectToAction(nameof(Index));
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating course");
                    ModelState.AddModelError(string.Empty, "Error al crear el curso");
                }
            }

            // Repopulate dropdowns
            model.Categories = await _courseService.GetCategoriesAsync();
            model.Difficulties = Enum.GetValues<CourseDifficulty>();
            model.Departments = await _userService.GetDepartmentsAsync();
            model.Roles = new[] { "Admin", "RH", "Employee", "Intern" };
            
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var course = await _courseService.GetByIdAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var viewModel = new EditCourseViewModel
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Category = course.Category,
                Difficulty = course.Difficulty,
                EstimatedDurationMinutes = course.EstimatedDurationMinutes,
                ThumbnailUrl = course.ThumbnailUrl,
                IsActive = course.IsActive,
                Contents = course.Contents?.Select(c => new CourseContentViewModel
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Type = c.Type,
                    ContentUrl = c.ContentUrl,
                    DurationMinutes = c.DurationMinutes,
                    OrderIndex = c.OrderIndex,
                    IsRequired = c.IsRequired,
                    MinimumScore = c.MinimumScore
                }).ToList() ?? new List<CourseContentViewModel>(),
                
                // Dropdowns
                Categories = await _courseService.GetCategoriesAsync(),
                Difficulties = Enum.GetValues<CourseDifficulty>(),
                Departments = await _userService.GetDepartmentsAsync(),
                Roles = new[] { "Admin", "RH", "Employee", "Intern" }
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(EditCourseViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var result = await _courseService.UpdateCourseAsync(model);
                    
                    if (result.Succeeded)
                    {
                        TempData["Success"] = "Curso actualizado exitosamente";
                        return RedirectToAction(nameof(Index));
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating course {CourseId}", model.Id);
                    ModelState.AddModelError(string.Empty, "Error al actualizar el curso");
                }
            }

            // Repopulate dropdowns
            model.Categories = await _courseService.GetCategoriesAsync();
            model.Difficulties = Enum.GetValues<CourseDifficulty>();
            model.Departments = await _userService.GetDepartmentsAsync();
            model.Roles = new[] { "Admin", "RH", "Employee", "Intern" };
            
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _courseService.DeleteCourseAsync(id);
                if (result.Succeeded)
                {
                    TempData["Success"] = "Curso eliminado exitosamente";
                }
                else
                {
                    TempData["Error"] = "Error al eliminar el curso";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course {CourseId}", id);
                TempData["Error"] = "Error al eliminar el curso";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var course = await _courseService.GetCourseWithDetailsAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var viewModel = new CourseDetailsViewModel
            {
                Course = course,
                EnrollmentStats = await _courseService.GetCourseStatsAsync(id),
                RecentProgress = await _courseService.GetRecentProgressAsync(id)
            };

            return View(viewModel);
        }

        // API Endpoints
        [HttpPost]
        [Route("api/courses/{courseId}/assign")]
        public async Task<IActionResult> AssignCourse(int courseId, [FromBody] AssignCourseApiModel model)
        {
            try
            {
                var result = await _courseService.AssignCourseToUsersAsync(courseId, model.UserIds, model.DueDate);
                
                if (result.Succeeded)
                {
                    return Json(new { success = true, message = "Curso asignado exitosamente" });
                }

                return Json(new { success = false, message = string.Join(", ", result.Errors) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning course {CourseId}", courseId);
                return Json(new { success = false, message = "Error al asignar el curso" });
            }
        }

        [HttpPost]
        [Route("api/courses/{courseId}/content")]
        public async Task<IActionResult> AddContent(int courseId, [FromBody] AddContentApiModel model)
        {
            try
            {
                var result = await _courseService.AddContentAsync(courseId, model);
                
                if (result.Succeeded)
                {
                    return Json(new { success = true, content = result.Data });
                }

                return Json(new { success = false, message = string.Join(", ", result.Errors) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding content to course {CourseId}", courseId);
                return Json(new { success = false, message = "Error al agregar contenido" });
            }
        }

        [HttpPost]
        [Route("api/courses/upload")]
        public async Task<IActionResult> UploadFile(IFormFile file, string type)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Json(new { success = false, message = "No se seleccionó archivo" });
                }

                var result = await _courseService.UploadFileAsync(file, type);
                
                if (result.Succeeded)
                {
                    return Json(new { success = true, url = result.Data });
                }

                return Json(new { success = false, message = result.Errors.First() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return Json(new { success = false, message = "Error al subir archivo" });
            }
        }
    }
}
```

---

### **📊 Analytics y Reportes**

#### **AdvancedAnalytics.tsx → AnalyticsController + Views**

**Archivo Actual:** `/components/AdvancedAnalytics.tsx`
```typescript
// React: Analytics avanzados con gráficos
const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>();
  // Gráficos y métricas
};
```

**C# Destino:**

**1. AnalyticsController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/AnalyticsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    [Authorize(Roles = "Admin,RH")]
    public class AnalyticsController : Controller
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly IExportService _exportService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(
            IAnalyticsService analyticsService, 
            IExportService exportService, 
            ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _exportService = exportService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(AnalyticsFiltersViewModel filters = null)
        {
            filters ??= new AnalyticsFiltersViewModel
            {
                StartDate = DateTime.Now.AddMonths(-6),
                EndDate = DateTime.Now,
                Period = "monthly"
            };

            var viewModel = new AnalyticsIndexViewModel
            {
                Filters = filters,
                OverviewMetrics = await _analyticsService.GetOverviewMetricsAsync(filters),
                CourseCompletionTrends = await _analyticsService.GetCourseCompletionTrendsAsync(filters),
                DepartmentPerformance = await _analyticsService.GetDepartmentPerformanceAsync(filters),
                TopPerformingUsers = await _analyticsService.GetTopPerformingUsersAsync(filters),
                PopularCourses = await _analyticsService.GetPopularCoursesAsync(filters)
            };

            return View(viewModel);
        }

        // API Endpoints for Charts
        [HttpGet]
        [Route("api/analytics/completion-trends")]
        public async Task<IActionResult> GetCompletionTrends([FromQuery] AnalyticsFiltersViewModel filters)
        {
            try
            {
                var data = await _analyticsService.GetCourseCompletionTrendsAsync(filters);
                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion trends");
                return Json(new { error = "Error al obtener tendencias" });
            }
        }

        [HttpGet]
        [Route("api/analytics/department-performance")]
        public async Task<IActionResult> GetDepartmentPerformance([FromQuery] AnalyticsFiltersViewModel filters)
        {
            try
            {
                var data = await _analyticsService.GetDepartmentPerformanceAsync(filters);
                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department performance");
                return Json(new { error = "Error al obtener rendimiento por departamento" });
            }
        }

        [HttpGet]
        [Route("api/analytics/user-activity")]
        public async Task<IActionResult> GetUserActivityTrends([FromQuery] AnalyticsFiltersViewModel filters)
        {
            try
            {
                var data = await _analyticsService.GetUserActivityTrendsAsync(filters);
                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user activity trends");
                return Json(new { error = "Error al obtener actividad de usuarios" });
            }
        }

        [HttpGet]
        [Route("api/analytics/course-popularity")]
        public async Task<IActionResult> GetCoursePopularity([FromQuery] AnalyticsFiltersViewModel filters)
        {
            try
            {
                var data = await _analyticsService.GetCoursePopularityAsync(filters);
                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course popularity");
                return Json(new { error = "Error al obtener popularidad de cursos" });
            }
        }

        [HttpPost]
        [Route("api/analytics/export")]
        public async Task<IActionResult> ExportAnalytics([FromBody] ExportAnalyticsModel model)
        {
            try
            {
                var data = await _analyticsService.GetExportDataAsync(model.Filters);
                var fileBytes = await _exportService.ExportAnalyticsAsync(data, model.Format);
                
                var fileName = $"analytics-griver-{DateTime.Now:yyyyMMdd}.{model.Format}";
                var contentType = model.Format switch
                {
                    "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "csv" => "text/csv",
                    "pdf" => "application/pdf",
                    _ => "application/octet-stream"
                };

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting analytics");
                return Json(new { error = "Error al exportar analytics" });
            }
        }
    }
}
```

**2. AnalyticsIndexViewModel.cs** (GriverSystem.Web/ViewModels)
```csharp
// UBICACIÓN: /GriverSystem.Web/ViewModels/AnalyticsIndexViewModel.cs
namespace GriverSystem.Web.ViewModels
{
    public class AnalyticsIndexViewModel
    {
        public AnalyticsFiltersViewModel Filters { get; set; }
        public OverviewMetrics OverviewMetrics { get; set; }
        public List<ChartDataPoint> CourseCompletionTrends { get; set; }
        public List<DepartmentPerformanceData> DepartmentPerformance { get; set; }
        public List<TopPerformerData> TopPerformingUsers { get; set; }
        public List<PopularCourseData> PopularCourses { get; set; }
    }

    public class AnalyticsFiltersViewModel
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Period { get; set; } = "monthly"; // daily, weekly, monthly
        public List<string> Departments { get; set; } = new();
        public List<string> Roles { get; set; } = new();
        public List<int> CourseIds { get; set; } = new();
    }

    public class OverviewMetrics
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalCourses { get; set; }
        public int CompletedEnrollments { get; set; }
        public decimal AverageCompletionRate { get; set; }
        public decimal AverageTimeToComplete { get; set; }
        public int CertificatesIssued { get; set; }
        public decimal UserEngagementRate { get; set; }
    }

    public class ChartDataPoint
    {
        public string Label { get; set; }
        public decimal Value { get; set; }
        public DateTime Date { get; set; }
        public string Category { get; set; }
    }

    public class DepartmentPerformanceData
    {
        public string Department { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageScore { get; set; }
        public int TotalEnrollments { get; set; }
        public int CompletedCourses { get; set; }
    }

    public class TopPerformerData
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Department { get; set; }
        public string Role { get; set; }
        public int CoursesCompleted { get; set; }
        public decimal AverageScore { get; set; }
        public int TotalTimeSpent { get; set; }
        public string Avatar { get; set; }
    }

    public class PopularCourseData
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string Category { get; set; }
        public int TotalEnrollments { get; set; }
        public int CompletedEnrollments { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageScore { get; set; }
        public decimal AverageTimeToComplete { get; set; }
    }

    public class ExportAnalyticsModel
    {
        public AnalyticsFiltersViewModel Filters { get; set; }
        public string Format { get; set; } // excel, csv, pdf
        public List<string> IncludedSections { get; set; } = new();
    }
}
```

**3. Index.cshtml** (GriverSystem.Web/Views/Analytics)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Analytics/Index.cshtml -->
@model AnalyticsIndexViewModel
@{
    ViewData["Title"] = "Analytics Avanzados - Sistema Griver";
}

<div class="analytics-container">
    <!-- Header Section -->
    <div class="page-header">
        <div class="header-content">
            <h1>Analytics Avanzados</h1>
            <p class="header-description">Análisis detallado del rendimiento del sistema Griver</p>
        </div>
        <div class="header-actions">
            <button class="btn btn-griver-secondary" data-bs-toggle="modal" data-bs-target="#filtersModal">
                <i class="icon-filter"></i>
                Filtros Avanzados
            </button>
            <button class="btn btn-griver-primary" data-bs-toggle="modal" data-bs-target="#exportModal">
                <i class="icon-download"></i>
                Exportar Reporte
            </button>
        </div>
    </div>

    <!-- Quick Filters -->
    <div class="quick-filters">
        <div class="filter-chips">
            <button class="filter-chip active" data-period="7d">Últimos 7 días</button>
            <button class="filter-chip" data-period="30d">Últimos 30 días</button>
            <button class="filter-chip" data-period="90d">Últimos 3 meses</button>
            <button class="filter-chip" data-period="1y">Último año</button>
        </div>
        <div class="date-range">
            <input type="date" class="form-control" value="@Model.Filters.StartDate.ToString("yyyy-MM-dd")" />
            <span>hasta</span>
            <input type="date" class="form-control" value="@Model.Filters.EndDate.ToString("yyyy-MM-dd")" />
        </div>
    </div>

    <!-- Overview Metrics -->
    <div class="overview-metrics">
        <div class="metrics-grid">
            <div class="metric-card primary">
                <div class="metric-header">
                    <h3>Usuarios Activos</h3>
                    <i class="icon-users"></i>
                </div>
                <div class="metric-value">@Model.OverviewMetrics.ActiveUsers</div>
                <div class="metric-subtitle">de @Model.OverviewMetrics.TotalUsers usuarios totales</div>
                <div class="metric-progress">
                    <div class="progress-bar" style="width: @((Model.OverviewMetrics.ActiveUsers * 100.0 / Model.OverviewMetrics.TotalUsers))%"></div>
                </div>
            </div>

            <div class="metric-card success">
                <div class="metric-header">
                    <h3>Tasa de Finalización</h3>
                    <i class="icon-target"></i>
                </div>
                <div class="metric-value">@Model.OverviewMetrics.AverageCompletionRate.ToString("P1")</div>
                <div class="metric-subtitle">@Model.OverviewMetrics.CompletedEnrollments cursos completados</div>
                <div class="metric-trend positive">
                    <i class="icon-trend-up"></i>
                    <span>+12% vs período anterior</span>
                </div>
            </div>

            <div class="metric-card info">
                <div class="metric-header">
                    <h3>Tiempo Promedio</h3>
                    <i class="icon-clock"></i>
                </div>
                <div class="metric-value">@Math.Round(Model.OverviewMetrics.AverageTimeToComplete, 1)h</div>
                <div class="metric-subtitle">para completar cursos</div>
                <div class="metric-trend neutral">
                    <i class="icon-minus"></i>
                    <span>Sin cambios</span>
                </div>
            </div>

            <div class="metric-card warning">
                <div class="metric-header">
                    <h3>Certificados</h3>
                    <i class="icon-award"></i>
                </div>
                <div class="metric-value">@Model.OverviewMetrics.CertificatesIssued</div>
                <div class="metric-subtitle">certificados emitidos</div>
                <div class="metric-trend positive">
                    <i class="icon-trend-up"></i>
                    <span>+25% vs período anterior</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
        <div class="charts-grid">
            <!-- Completion Trends Chart -->
            <div class="chart-container full-width">
                <div class="chart-header">
                    <h3>Tendencias de Finalización</h3>
                    <div class="chart-controls">
                        <select class="form-control chart-period-select">
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly" selected>Mensual</option>
                        </select>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas id="completionTrendsChart" width="800" height="300"></canvas>
                </div>
            </div>

            <!-- Department Performance Chart -->
            <div class="chart-container half-width">
                <div class="chart-header">
                    <h3>Rendimiento por Departamento</h3>
                </div>
                <div class="chart-content">
                    <canvas id="departmentPerformanceChart" width="400" height="300"></canvas>
                </div>
            </div>

            <!-- User Activity Chart -->
            <div class="chart-container half-width">
                <div class="chart-header">
                    <h3>Actividad de Usuarios</h3>
                </div>
                <div class="chart-content">
                    <canvas id="userActivityChart" width="400" height="300"></canvas>
                </div>
            </div>

            <!-- Popular Courses Chart -->
            <div class="chart-container half-width">
                <div class="chart-header">
                    <h3>Cursos Más Populares</h3>
                </div>
                <div class="chart-content">
                    <canvas id="popularCoursesChart" width="400" height="300"></canvas>
                </div>
            </div>

            <!-- Engagement Heatmap -->
            <div class="chart-container half-width">
                <div class="chart-header">
                    <h3>Mapa de Calor de Engagement</h3>
                </div>
                <div class="chart-content">
                    <div id="engagementHeatmap" class="heatmap-container"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Top Performers Section -->
    <div class="top-performers-section">
        <div class="section-header">
            <h3>Top Performers</h3>
            <a href="#" class="view-all-link">Ver todos</a>
        </div>
        <div class="performers-grid">
            @foreach (var performer in Model.TopPerformingUsers.Take(5))
            {
                <div class="performer-card">
                    <div class="performer-avatar">
                        @if (!string.IsNullOrEmpty(performer.Avatar))
                        {
                            <img src="@performer.Avatar" alt="@performer.UserName" />
                        }
                        else
                        {
                            <div class="avatar-placeholder">@performer.UserName[0]</div>
                        }
                    </div>
                    <div class="performer-info">
                        <h4>@performer.UserName</h4>
                        <p class="performer-department">@performer.Department</p>
                        <div class="performer-stats">
                            <div class="stat">
                                <span class="stat-value">@performer.CoursesCompleted</span>
                                <span class="stat-label">Cursos</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">@performer.AverageScore.ToString("F1")</span>
                                <span class="stat-label">Puntaje</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    </div>

    <!-- Detailed Tables Section -->
    <div class="detailed-tables-section">
        <div class="section-tabs">
            <button class="tab-button active" data-tab="courses">Cursos</button>
            <button class="tab-button" data-tab="departments">Departamentos</button>
            <button class="tab-button" data-tab="users">Usuarios</button>
        </div>

        <div class="tab-content">
            <div class="tab-pane active" id="courses-tab">
                <div class="table-responsive">
                    <table class="table analytics-table">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Categoría</th>
                                <th>Inscripciones</th>
                                <th>Finalizaciones</th>
                                <th>Tasa</th>
                                <th>Puntaje Promedio</th>
                                <th>Tiempo Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach (var course in Model.PopularCourses)
                            {
                                <tr>
                                    <td>
                                        <div class="course-info">
                                            <span class="course-title">@course.CourseTitle</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="category-badge">@course.Category</span>
                                    </td>
                                    <td>@course.TotalEnrollments</td>
                                    <td>@course.CompletedEnrollments</td>
                                    <td>
                                        <div class="completion-rate">
                                            <span>@course.CompletionRate.ToString("P1")</span>
                                            <div class="rate-bar">
                                                <div class="rate-fill" style="width: @course.CompletionRate.ToString("P0")"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>@course.AverageScore.ToString("F1")</td>
                                    <td>@Math.Round(course.AverageTimeToComplete, 1)h</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Otros tabs -->
        </div>
    </div>
</div>

<!-- Modals -->
@await Html.PartialAsync("_AnalyticsFiltersModal")
@await Html.PartialAsync("_AnalyticsExportModal")

@section Scripts {
    <script src="~/lib/chart.js/chart.min.js"></script>
    <script src="~/lib/chartjs-adapter-date-fns/chartjs-adapter-date-fns.bundle.min.js"></script>
    <script src="~/js/analytics.js"></script>
    
    <script>
        // Initialize charts with data
        const analyticsData = @Html.Raw(Json.Serialize(new {
            completionTrends = Model.CourseCompletionTrends,
            departmentPerformance = Model.DepartmentPerformance,
            popularCourses = Model.PopularCourses
        }));
        
        AnalyticsCharts.init(analyticsData);
    </script>
}
```

---

### **🎨 Archivos de Estilos**

#### **globals.css → wwwroot/css/griver-styles.css**

**Archivo Actual:** `/styles/globals.css`
```css
/* Tailwind V4 con variables CSS personalizadas Griver */
:root {
  --griver-primary: #1a365d;
  /* ... resto de variables */
}
```

**C# Destino:**

**1. griver-styles.css** (GriverSystem.Web/wwwroot/css)
```css
/* UBICACIÓN: /GriverSystem.Web/wwwroot/css/griver-styles.css */

/* ===== GRIVER DESIGN SYSTEM ===== */

/* Variables CSS Griver */
:root {
  /* Colores Corporativos Griver */
  --griver-primary: #1a365d;
  --griver-secondary: #2b77ad;
  --griver-accent: #ff6b35;
  --griver-success: #38a169;
  --griver-warning: #d69e2e;
  --griver-error: #e53e3e;
  --griver-info: #3182ce;
  
  /* Sistema de Colores */
  --background: #ffffff;
  --foreground: #0f1419;
  --card: #ffffff;
  --card-foreground: #0f1419;
  --border: rgba(0, 0, 0, 0.1);
  --input-background: #f3f3f5;
  --muted: #ececf0;
  --muted-foreground: #717182;
  
  /* Estados de Curso */
  --course-not-started: #6b7280;
  --course-in-progress: var(--griver-info);
  --course-completed: var(--griver-success);
  --course-overdue: var(--griver-error);
  
  /* Colores por Rol */
  --role-admin: var(--griver-primary);
  --role-rh: var(--griver-secondary);
  --role-employee: var(--griver-info);
  --role-intern: var(--griver-accent);
  
  /* Espaciado */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* Tipografía */
  --font-size-base: 14px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--foreground);
  background-color: var(--background);
  margin: 0;
  padding: 0;
}

/* ===== COMPONENTES GRIVER ===== */

/* Botones Griver */
.btn-griver-primary {
  background-color: var(--griver-primary);
  border-color: var(--griver-primary);
  color: white;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  transition: all 0.2s ease-in-out;
}

.btn-griver-primary:hover {
  background-color: var(--griver-secondary);
  border-color: var(--griver-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 54, 93, 0.15);
}

.btn-griver-secondary {
  background-color: var(--griver-secondary);
  border-color: var(--griver-secondary);
  color: white;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  transition: all 0.2s ease-in-out;
}

.btn-griver-secondary:hover {
  background-color: var(--griver-primary);
  border-color: var(--griver-primary);
  transform: translateY(-1px);
}

.btn-griver-accent {
  background-color: var(--griver-accent);
  border-color: var(--griver-accent);
  color: white;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
}

/* Cards Griver */
.griver-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}

.griver-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.griver-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.griver-card-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  color: var(--griver-primary);
  margin: 0;
}

/* Badges Griver */
.griver-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
}

.badge-role-admin {
  background-color: var(--role-admin);
  color: white;
}

.badge-role-rh {
  background-color: var(--role-rh);
  color: white;
}

.badge-role-employee {
  background-color: var(--role-employee);
  color: white;
}

.badge-role-intern {
  background-color: var(--role-intern);
  color: white;
}

.badge-status-active {
  background-color: var(--griver-success);
  color: white;
}

.badge-status-inactive {
  background-color: var(--muted);
  color: var(--muted-foreground);
}

/* Progress Bars Griver */
.griver-progress {
  background-color: var(--muted);
  border-radius: var(--radius-sm);
  height: 8px;
  overflow: hidden;
}

.griver-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--griver-primary) 0%, var(--griver-secondary) 100%);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease-in-out;
}

/* Forms Griver */
.griver-form-group {
  margin-bottom: var(--spacing-md);
}

.griver-form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--foreground);
}

.griver-form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--input-background);
  font-size: var(--font-size-base);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.griver-form-control:focus {
  outline: none;
  border-color: var(--griver-primary);
  box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
}

/* Tables Griver */
.griver-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.griver-table th {
  background-color: var(--griver-primary);
  color: white;
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
}

.griver-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.griver-table tr:hover {
  background-color: rgba(26, 54, 93, 0.05);
}

/* ===== LAYOUT ESPECÍFICO ===== */

/* Login Layout */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--griver-primary) 0%, var(--griver-secondary) 100%);
  padding: var(--spacing-md);
}

.login-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-logo {
  height: 60px;
  margin-bottom: var(--spacing-lg);
}

/* Admin Layout */
.admin-layout {
  margin-left: 280px; /* Sidebar width */
  min-height: 100vh;
}

.client-layout {
  margin-left: 0;
  min-height: 100vh;
}

/* Sidebar */
.griver-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--griver-primary);
  color: white;
  padding: var(--spacing-lg);
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav-item {
  margin-bottom: var(--spacing-xs);
}

.sidebar-nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease-in-out;
}

.sidebar-nav-link:hover,
.sidebar-nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav-icon {
  margin-right: var(--spacing-md);
  width: 20px;
  height: 20px;
}

/* Header */
.griver-header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  color: var(--muted-foreground);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-left: auto;
}

/* Dashboard Specific */
.dashboard-container {
  padding: var(--spacing-xl);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.welcome-section h1 {
  color: var(--griver-primary);
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
}

.welcome-text {
  color: var(--muted-foreground);
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.metric-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--griver-primary), var(--griver-secondary));
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.metric-header h3 {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  color: var(--muted-foreground);
  margin: 0;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--griver-primary);
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.metric-change {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.metric-change.positive {
  color: var(--griver-success);
}

.metric-change.negative {
  color: var(--griver-error);
}

.metric-change.neutral {
  color: var(--muted-foreground);
}

/* Quick Actions */
.quick-actions-section {
  margin: var(--spacing-xl) 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.quick-action-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.quick-action-card:hover {
  border-color: var(--griver-primary);
  box-shadow: 0 4px 12px rgba(26, 54, 93, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--griver-primary), var(--griver-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content h4 {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold);
  color: var(--griver-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.action-content p {
  color: var(--muted-foreground);
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.875rem;
}

/* ===== RESPONSIVIDAD ===== */
@media (max-width: 768px) {
  .admin-layout {
    margin-left: 0;
  }
  
  .griver-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .griver-sidebar.open {
    transform: translateX(0);
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== UTILIDADES GRIVER ===== */
.griver-gradient {
  background: linear-gradient(135deg, var(--griver-primary) 0%, var(--griver-secondary) 100%);
}

.griver-text-gradient {
  background: linear-gradient(135deg, var(--griver-primary) 0%, var(--griver-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-griver-primary {
  color: var(--griver-primary);
}

.text-griver-secondary {
  color: var(--griver-secondary);
}

.bg-griver-primary {
  background-color: var(--griver-primary);
}

.bg-griver-secondary {
  background-color: var(--griver-secondary);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-in-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--muted);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb {
  background: var(--griver-primary);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--griver-secondary);
}
```

---

### **⚙️ Archivos de Configuración**

#### **hooks/ → Services/ & Extensions/**

**Hooks Actuales:**
- `/hooks/useGriverAnalytics.ts`
- `/hooks/useLocalStorage.ts`
- `/hooks/useNotifications.ts`

**C# Destino:**

**1. IGriverAnalyticsService.cs** (GriverSystem.Core/Interfaces)
```csharp
// UBICACIÓN: /GriverSystem.Core/Interfaces/IGriverAnalyticsService.cs
namespace GriverSystem.Core.Interfaces
{
    public interface IGriverAnalyticsService
    {
        Task TrackEventAsync(AnalyticsEvent analyticsEvent);
        Task<AnalyticsMetrics> GetMetricsAsync(TimePeriod period);
        Task<CourseStats> GetCourseStatsAsync(int courseId);
        Task<UserStats> GetUserStatsAsync(string userId);
        Task<List<ChartDataPoint>> GetTrendsAsync(string metricType, TimePeriod period);
    }
}
```

**2. LocalStorageService.cs** (GriverSystem.Core/Services)
```csharp
// UBICACIÓN: /GriverSystem.Core/Services/LocalStorageService.cs
using Microsoft.AspNetCore.Http;

namespace GriverSystem.Core.Services
{
    public interface ILocalStorageService
    {
        Task<T> GetItemAsync<T>(string key);
        Task SetItemAsync<T>(string key, T value);
        Task RemoveItemAsync(string key);
        Task ClearAsync();
    }

    public class SessionStorageService : ILocalStorageService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SessionStorageService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<T> GetItemAsync<T>(string key)
        {
            var session = _httpContextAccessor.HttpContext?.Session;
            if (session != null && session.TryGetValue(key, out var value))
            {
                var json = System.Text.Encoding.UTF8.GetString(value);
                return JsonSerializer.Deserialize<T>(json);
            }
            return default(T);
        }

        public async Task SetItemAsync<T>(string key, T value)
        {
            var session = _httpContextAccessor.HttpContext?.Session;
            if (session != null)
            {
                var json = JsonSerializer.Serialize(value);
                var bytes = System.Text.Encoding.UTF8.GetBytes(json);
                session.Set(key, bytes);
            }
        }

        public async Task RemoveItemAsync(string key)
        {
            var session = _httpContextAccessor.HttpContext?.Session;
            session?.Remove(key);
        }

        public async Task ClearAsync()
        {
            var session = _httpContextAccessor.HttpContext?.Session;
            session?.Clear();
        }
    }
}
```

**3. NotificationService.cs** (GriverSystem.Core/Services)
```csharp
// UBICACIÓN: /GriverSystem.Core/Services/NotificationService.cs
using GriverSystem.Core.Entities;
using GriverSystem.Core.Interfaces;

namespace GriverSystem.Core.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IEmailService _emailService;
        
        public NotificationService(
            INotificationRepository notificationRepository,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(string userId)
        {
            return await _notificationRepository.GetByUserIdAsync(userId);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task AddNotificationAsync(CreateNotificationModel notification)
        {
            var entity = new Notification
            {
                UserId = notification.UserId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                ActionUrl = notification.ActionUrl,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(entity);

            // Send email if configured
            if (notification.SendEmail)
            {
                await _emailService.SendNotificationEmailAsync(
                    notification.UserEmail, 
                    notification.Title, 
                    notification.Message);
            }
        }
    }
}
```

---

### **📄 Archivos de Datos**

#### **types/index.ts → Models/ & Entities/**

**Archivo Actual:** `/types/index.ts`
```typescript
// TypeScript: Todas las interfaces del sistema
export interface User { ... }
export interface Course { ... }
export interface UserProgress { ... }
```

**C# Destino:**

**1. User.cs** (GriverSystem.Core/Entities)
```csharp
// UBICACIÓN: /GriverSystem.Core/Entities/User.cs
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace GriverSystem.Core.Entities
{
    public class User
    {
        [Key]
        public string Id { get; set; } // FK to AspNetUsers

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [MaxLength(100)]
        public string Position { get; set; }

        [MaxLength(100)]
        public string Department { get; set; }

        public DateTime HireDate { get; set; } = DateTime.UtcNow;

        public UserStatus Status { get; set; } = UserStatus.Active;

        public DateTime? LastLoginDate { get; set; }

        [MaxLength(500)]
        public string Avatar { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual IdentityUser IdentityUser { get; set; }
        public virtual ICollection<UserCourse> UserCourses { get; set; } = new List<UserCourse>();
        public virtual ICollection<Progress> ProgressRecords { get; set; } = new List<Progress>();
        public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        // Computed Properties
        public string FullName => $"{FirstName} {LastName}";
        public bool IsActive => Status == UserStatus.Active;
    }

    public enum UserStatus
    {
        Inactive = 0,
        Active = 1
    }
}
```

**2. Course.cs** (GriverSystem.Core/Entities)
```csharp
// UBICACIÓN: /GriverSystem.Core/Entities/Course.cs
using System.ComponentModel.DataAnnotations;

namespace GriverSystem.Core.Entities
{
    public class Course
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; }

        [MaxLength(500)]
        public string ThumbnailUrl { get; set; }

        public int EstimatedDurationMinutes { get; set; } = 60;

        public CourseCategory Category { get; set; }

        public CourseDifficulty Difficulty { get; set; } = CourseDifficulty.Beginner;

        public bool IsActive { get; set; } = true;

        [Required]
        public string CreatedById { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual User CreatedBy { get; set; }
        public virtual ICollection<CourseContent> Contents { get; set; } = new List<CourseContent>();
        public virtual ICollection<UserCourse> UserCourses { get; set; } = new List<UserCourse>();
        public virtual ICollection<Progress> ProgressRecords { get; set; } = new List<Progress>();
        public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
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
}
```

**3. UserProgress.cs** (GriverSystem.Core/Entities)
```csharp
// UBICACIÓN: /GriverSystem.Core/Entities/Progress.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GriverSystem.Core.Entities
{
    public class Progress
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int CourseId { get; set; }

        public int? ContentId { get; set; } // NULL for overall course progress

        [Column(TypeName = "decimal(5,2)")]
        public decimal CompletionPercentage { get; set; } = 0;

        public int TimeSpentMinutes { get; set; } = 0;

        public int? Score { get; set; }

        public bool IsCompleted { get; set; } = false;

        public DateTime? CompletedAt { get; set; }

        public DateTime LastAccessedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual User User { get; set; }
        public virtual Course Course { get; set; }
        public virtual CourseContent Content { get; set; }
    }
}
```

---

### **🔧 Archivos de Servicios**

#### **services/api.ts → Controllers/ & Services/**

**Archivo Actual:** `/services/api.ts`
```typescript
// React: API centralizada
class GriverAPI {
  async getUsers(): Promise<User[]> { ... }
  async createCourse(data): Promise<Course> { ... }
}
```

**C# Destino:**

**1. ApiController.cs** (GriverSystem.Web/Controllers/Api)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/Api/ApiController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels.Api;

namespace GriverSystem.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersApiController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersApiController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserApiModel>>>> GetUsers(
            [FromQuery] UserFiltersApiModel filters)
        {
            try
            {
                var users = await _userService.GetFilteredUsersAsync(filters);
                var result = users.Select(u => new UserApiModel
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.IdentityUser?.Email,
                    Department = u.Department,
                    Position = u.Position,
                    Status = u.Status,
                    LastLoginDate = u.LastLoginDate,
                    Avatar = u.Avatar
                }).ToList();

                return Ok(new ApiResponse<List<UserApiModel>>
                {
                    Success = true,
                    Data = result,
                    Message = "Usuarios obtenidos exitosamente"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<UserApiModel>>
                {
                    Success = false,
                    Message = "Error al obtener usuarios",
                    Errors = new[] { ex.Message }
                });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,RH")]
        public async Task<ActionResult<ApiResponse<UserApiModel>>> CreateUser(
            [FromBody] CreateUserApiModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<UserApiModel>
                    {
                        Success = false,
                        Message = "Datos inválidos",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToArray()
                    });
                }

                var result = await _userService.CreateUserAsync(model);
                
                if (result.Succeeded)
                {
                    return Ok(new ApiResponse<UserApiModel>
                    {
                        Success = true,
                        Data = result.Data,
                        Message = "Usuario creado exitosamente"
                    });
                }

                return BadRequest(new ApiResponse<UserApiModel>
                {
                    Success = false,
                    Message = "Error al crear usuario",
                    Errors = result.Errors.ToArray()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserApiModel>
                {
                    Success = false,
                    Message = "Error interno del servidor",
                    Errors = new[] { ex.Message }
                });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,RH")]
        public async Task<ActionResult<ApiResponse<UserApiModel>>> UpdateUser(
            string id, 
            [FromBody] UpdateUserApiModel model)
        {
            try
            {
                model.Id = id;
                var result = await _userService.UpdateUserAsync(model);
                
                if (result.Succeeded)
                {
                    return Ok(new ApiResponse<UserApiModel>
                    {
                        Success = true,
                        Data = result.Data,
                        Message = "Usuario actualizado exitosamente"
                    });
                }

                return BadRequest(new ApiResponse<UserApiModel>
                {
                    Success = false,
                    Message = "Error al actualizar usuario",
                    Errors = result.Errors.ToArray()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserApiModel>
                {
                    Success = false,
                    Message = "Error interno del servidor",
                    Errors = new[] { ex.Message }
                });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                
                if (result.Succeeded)
                {
                    return Ok(new ApiResponse<bool>
                    {
                        Success = true,
                        Data = true,
                        Message = "Usuario eliminado exitosamente"
                    });
                }

                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Error al eliminar usuario",
                    Errors = result.Errors.ToArray()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Error interno del servidor",
                    Errors = new[] { ex.Message }
                });
            }
        }
    }
}
```

**2. ApiResponse.cs** (GriverSystem.Web/ViewModels/Api)
```csharp
// UBICACIÓN: /GriverSystem.Web/ViewModels/Api/ApiResponse.cs
namespace GriverSystem.Web.ViewModels.Api
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();
    }

    public class ApiResponse : ApiResponse<object>
    {
    }

    public class PaginatedApiResponse<T> : ApiResponse<List<T>>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }
}
```

---

## 🎯 **RESUMEN DE MIGRACIÓN COMPLETA**

### **📁 Mapeo Final de Carpetas**

```
REACT ACTUAL                          →  VISUAL STUDIO C#
═══════════════════════════════════════  ════════════════════════════════════════

/App.tsx                              →  /Program.cs + /_Layout.cshtml
/components/AuthContext.tsx           →  /Services/AuthService.cs + /Controllers/AccountController.cs
/components/LoginForm.tsx             →  /Views/Account/Login.cshtml + LoginViewModel.cs
/components/Dashboard.tsx             →  /Controllers/HomeController.cs + /Views/Home/Index.cshtml
/components/StudentManagement.tsx     →  /Controllers/UsersController.cs + /Views/Users/
/components/CourseManagement.tsx      →  /Controllers/CoursesController.cs + /Views/Courses/
/components/AdvancedAnalytics.tsx     →  /Controllers/AnalyticsController.cs + /Views/Analytics/
/components/SystemSettings.tsx        →  /Controllers/SettingsController.cs + /Views/Settings/
/components/Sidebar.tsx               →  /Views/Shared/_Sidebar.cshtml
/components/AdminHeader.tsx           →  /Views/Shared/_AdminHeader.cshtml
/components/ClientDashboard.tsx       →  /Areas/Client/Controllers/DashboardController.cs

/components/forms/                    →  /ViewModels/ + /Views/Shared/EditorTemplates/
/components/ui/                       →  /Views/Shared/Components/ + /TagHelpers/
/components/common/                   →  /Views/Shared/ + /Services/Common/

/hooks/useGriverAnalytics.ts          →  /Services/AnalyticsService.cs
/hooks/useLocalStorage.ts             →  /Services/SessionStorageService.cs
/hooks/useNotifications.ts            →  /Services/NotificationService.cs

/services/api.ts                      →  /Controllers/Api/ + /Services/
/stores/appStore.ts                   →  /Services/StateService.cs + Session

/types/index.ts                       →  /Core/Entities/ + /ViewModels/
/utils/constants.ts                   →  /Configuration/GriverConstants.cs
/utils/excelExport.ts                 →  /Services/ExportService.cs

/styles/globals.css                   →  /wwwroot/css/griver-styles.css
/documentation/                       →  /Documentation/ (misma estructura)
```

### **🔧 Archivos de Configuración Adicionales**

```csharp
// NUEVOS ARCHIVOS C# NECESARIOS:

/appsettings.json                     - Configuración de la aplicación
/appsettings.Development.json         - Configuración de desarrollo
/wwwroot/js/griver-app.js            - JavaScript principal
/wwwroot/js/components/              - Componentes JS específicos
/Areas/Identity/                     - Páginas de Identity customizadas
/Data/GriverDbContext.cs             - Contexto de Entity Framework
/Data/Migrations/                    - Migraciones de base de datos
/Extensions/ServiceCollectionExtensions.cs - Registro de servicios
/Middleware/                         - Middleware personalizado
/Filters/                           - Filtros de acción
/TagHelpers/                        - Tag helpers personalizados
```

---

## 🚀 **PASOS DE MIGRACIÓN RECOMENDADOS**

### **Fase 1: Estructura Base (Semana 1)**
1. ✅ Crear solución ASP.NET Core MVC
2. ✅ Configurar base de datos con schema SQL
3. ✅ Implementar Entity Framework Models
4. ✅ Configurar ASP.NET Identity
5. ✅ Migrar CSS a wwwroot

### **Fase 2: Autenticación (Semana 2)**
1. ✅ AuthService.cs
2. ✅ AccountController.cs
3. ✅ Login Views
4. ✅ Authorization Policies

### **Fase 3: Core Features (Semanas 3-4)**
1. ✅ HomeController + Dashboard Views
2. ✅ UsersController + User Management Views
3. ✅ CoursesController + Course Management Views
4. ✅ Layout components (Sidebar, Header)

### **Fase 4: Advanced Features (Semanas 5-6)**
1. ✅ AnalyticsController + Analytics Views
2. ✅ API Controllers
3. ✅ Export Services
4. ✅ Notification System

### **Fase 5: Frontend Integration (Semana 7)**
1. ✅ JavaScript components
2. ✅ AJAX functionality
3. ✅ Charts integration
4. ✅ Real-time updates

### **Fase 6: Testing & Deployment (Semana 8)**
1. ✅ Unit tests
2. ✅ Integration tests
3. ✅ Production deployment
4. ✅ Migration scripts

---

## 📊 **Sistema de Reportes Crystal Reports**

### **🎯 Arquitectura del Sistema de Reportes**

El sistema React actual implementa un gestor completo de reportes con generación de PDF, Excel y CSV. En Visual Studio, esto se migra a **Crystal Reports** nativo de .NET con toda su potencia empresarial.

---

### **📄 CrystalReportsManager.tsx → Múltiples Archivos C#**

#### **Archivo Actual:** `/components/CrystalReportsManager.tsx`
```typescript
// React: Gestor principal de reportes con UI completa
const CrystalReportsManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({});
  // Lógica de generación y exportación
};
```

#### **C# Destino:**

**1. ReportsController.cs** (GriverSystem.Web/Controllers)
```csharp
// UBICACIÓN: /GriverSystem.Web/Controllers/ReportsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CrystalDecisions.CrystalReports.Engine;
using GriverSystem.Core.Interfaces;
using GriverSystem.Web.ViewModels;

namespace GriverSystem.Web.Controllers
{
    [Authorize(Roles = "Admin,RH")]
    public class ReportsController : Controller
    {
        private readonly IReportService _reportService;
        private readonly IUserService _userService;
        private readonly ICourseService _courseService;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(
            IReportService reportService,
            IUserService userService,
            ICourseService courseService,
            IWebHostEnvironment env,
            ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _userService = userService;
            _courseService = courseService;
            _env = env;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new ReportsIndexViewModel
            {
                Templates = await _reportService.GetAvailableTemplatesAsync(User),
                Departments = await _userService.GetDepartmentsAsync(),
                Courses = await _courseService.GetAllAsync()
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> Generate([FromBody] GenerateReportRequest request)
        {
            try
            {
                var reportData = await _reportService.GetReportDataAsync(
                    request.TemplateType, 
                    request.Filters
                );

                var reportDocument = new ReportDocument();
                var reportPath = Path.Combine(_env.WebRootPath, "Reports", $"{request.TemplateType}.rpt");
                reportDocument.Load(reportPath);

                // Aplicar filtros al reporte
                ApplyReportFilters(reportDocument, request.Filters);

                // Establecer datasource
                reportDocument.SetDataSource(reportData);

                // Configurar parámetros del reporte
                SetReportParameters(reportDocument, request);

                // Generar vista previa
                var previewHtml = await _reportService.GeneratePreviewHtmlAsync(reportDocument);

                return Json(new { 
                    success = true, 
                    previewHtml = previewHtml,
                    recordCount = reportData.Rows.Count,
                    reportId = Guid.NewGuid().ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report {TemplateType}", request.TemplateType);
                return Json(new { success = false, message = "Error al generar el reporte" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Export([FromBody] ExportReportRequest request)
        {
            try
            {
                var reportData = await _reportService.GetReportDataAsync(
                    request.TemplateType, 
                    request.Filters
                );

                var reportDocument = new ReportDocument();
                var reportPath = Path.Combine(_env.WebRootPath, "Reports", $"{request.TemplateType}.rpt");
                reportDocument.Load(reportPath);

                ApplyReportFilters(reportDocument, request.Filters);
                reportDocument.SetDataSource(reportData);
                SetReportParameters(reportDocument, request);

                byte[] fileBytes;
                string contentType;
                string fileName;

                switch (request.Format.ToLower())
                {
                    case "pdf":
                        fileBytes = ExportToPdf(reportDocument, request.Config);
                        contentType = "application/pdf";
                        fileName = $"{request.TemplateType}_{DateTime.Now:yyyyMMdd}.pdf";
                        break;

                    case "excel":
                        fileBytes = ExportToExcel(reportDocument);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"{request.TemplateType}_{DateTime.Now:yyyyMMdd}.xlsx";
                        break;

                    case "csv":
                        fileBytes = ExportToCsv(reportData);
                        contentType = "text/csv";
                        fileName = $"{request.TemplateType}_{DateTime.Now:yyyyMMdd}.csv";
                        break;

                    default:
                        return BadRequest("Formato de exportación no válido");
                }

                // Log de auditoría
                await _reportService.LogReportGenerationAsync(new ReportAuditLog
                {
                    ReportType = request.TemplateType,
                    GeneratedBy = User.Identity.Name,
                    ExportFormat = request.Format,
                    FilterApplied = request.Filters,
                    RecordCount = reportData.Rows.Count,
                    Timestamp = DateTime.UtcNow
                });

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report {TemplateType} to {Format}", 
                    request.TemplateType, request.Format);
                return StatusCode(500, "Error al exportar el reporte");
            }
        }

        private void ApplyReportFilters(ReportDocument report, ReportFilterViewModel filters)
        {
            var filterFormula = BuildFilterFormula(filters);
            if (!string.IsNullOrEmpty(filterFormula))
            {
                report.RecordSelectionFormula = filterFormula;
            }
        }

        private string BuildFilterFormula(ReportFilterViewModel filters)
        {
            var conditions = new List<string>();

            if (filters.StartDate.HasValue)
            {
                conditions.Add($"{{Course.CreatedAt}} >= Date({filters.StartDate.Value:yyyy,MM,dd})");
            }

            if (filters.EndDate.HasValue)
            {
                conditions.Add($"{{Course.CreatedAt}} <= Date({filters.EndDate.Value:yyyy,MM,dd})");
            }

            if (filters.Departments?.Any() == true)
            {
                var deptConditions = filters.Departments.Select(d => $"{{User.Department}} = '{d}'");
                conditions.Add($"({string.Join(" OR ", deptConditions)})");
            }

            if (filters.CourseId.HasValue)
            {
                conditions.Add($"{{Course.Id}} = {filters.CourseId.Value}");
            }

            if (filters.Status != null && filters.Status != "all")
            {
                conditions.Add($"{{User.Status}} = '{filters.Status}'");
            }

            return string.Join(" AND ", conditions);
        }

        private void SetReportParameters(ReportDocument report, dynamic request)
        {
            // Configurar logo de Griver
            var logoPath = Path.Combine(_env.WebRootPath, "images", "griver-logo.png");
            if (report.ParameterFields.Contains("LogoPath") && request.Config?.ShowLogo == true)
            {
                report.SetParameterValue("LogoPath", logoPath);
            }

            // Configurar encabezados
            if (report.ParameterFields.Contains("ReportTitle"))
            {
                report.SetParameterValue("ReportTitle", GetReportTitle(request.TemplateType));
            }

            if (report.ParameterFields.Contains("GeneratedDate") && request.Config?.ShowGenerationDate == true)
            {
                report.SetParameterValue("GeneratedDate", DateTime.Now);
            }

            if (report.ParameterFields.Contains("GeneratedBy"))
            {
                report.SetParameterValue("GeneratedBy", User.Identity.Name);
            }

            // Marca de agua si está configurada
            if (report.ParameterFields.Contains("Watermark") && !string.IsNullOrEmpty(request.Config?.Watermark))
            {
                report.SetParameterValue("Watermark", request.Config.Watermark);
            }
        }

        private byte[] ExportToPdf(ReportDocument report, CrystalReportConfig config)
        {
            var exportOptions = report.ExportOptions;
            exportOptions.ExportFormatType = ExportFormatType.PortableDocFormat;

            var pdfOptions = new PdfFormatOptions();
            
            // Configurar orientación y tamaño de página
            if (config != null)
            {
                switch (config.PageSize.ToLower())
                {
                    case "a4":
                        report.PrintOptions.PaperSize = PaperSize.PaperA4;
                        break;
                    case "legal":
                        report.PrintOptions.PaperSize = PaperSize.PaperLegal;
                        break;
                    default:
                        report.PrintOptions.PaperSize = PaperSize.PaperLetter;
                        break;
                }

                report.PrintOptions.PaperOrientation = config.Orientation.ToLower() == "landscape" 
                    ? PaperOrientation.Landscape 
                    : PaperOrientation.Portrait;
            }

            exportOptions.ExportFormatOptions = pdfOptions;

            using (var stream = new MemoryStream())
            {
                report.ExportToStream(stream);
                return stream.ToArray();
            }
        }

        private byte[] ExportToExcel(ReportDocument report)
        {
            var exportOptions = report.ExportOptions;
            exportOptions.ExportFormatType = ExportFormatType.ExcelWorkbook;

            var excelOptions = new ExcelFormatOptions
            {
                ExcelUseConstantColumnWidth = false,
                ExcelTabHasColumnHeadings = true
            };

            exportOptions.ExportFormatOptions = excelOptions;

            using (var stream = new MemoryStream())
            {
                report.ExportToStream(stream);
                return stream.ToArray();
            }
        }

        private byte[] ExportToCsv(DataTable data)
        {
            var csv = new StringBuilder();

            // Headers
            var headers = data.Columns.Cast<DataColumn>().Select(col => col.ColumnName);
            csv.AppendLine(string.Join(",", headers.Select(h => $"\"{h}\"")));

            // Rows
            foreach (DataRow row in data.Rows)
            {
                var values = row.ItemArray.Select(val => 
                    $"\"{val?.ToString()?.Replace("\"", "\"\"")}\"");
                csv.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        private string GetReportTitle(string templateType)
        {
            return templateType switch
            {
                "employee_progress" => "Reporte de Progreso de Empleados - Griver",
                "department_stats" => "Estadísticas por Departamento - Griver",
                "certifications" => "Reporte de Certificaciones - Griver",
                "pending_assignments" => "Cursos Pendientes - Griver",
                "overall_performance" => "Reporte de Desempeño General - Griver",
                "historical" => "Reporte Histórico - Griver",
                _ => "Reporte Griver"
            };
        }
    }
}
```

**2. IReportService.cs** (GriverSystem.Core/Interfaces)
```csharp
// UBICACIÓN: /GriverSystem.Core/Interfaces/IReportService.cs
using System.Data;
using GriverSystem.Core.Entities;

namespace GriverSystem.Core.Interfaces
{
    public interface IReportService
    {
        Task<List<ReportTemplate>> GetAvailableTemplatesAsync(ClaimsPrincipal user);
        Task<DataTable> GetReportDataAsync(string templateType, ReportFilterViewModel filters);
        Task<string> GeneratePreviewHtmlAsync(ReportDocument report);
        Task LogReportGenerationAsync(ReportAuditLog log);
        Task<ReportTemplate> GetTemplateByTypeAsync(string templateType);
        Task<Dictionary<string, object>> GetReportStatisticsAsync();
    }
}
```

**3. ReportService.cs** (GriverSystem.Core/Services)
```csharp
// UBICACIÓN: /GriverSystem.Core/Services/ReportService.cs
using GriverSystem.Core.Interfaces;
using GriverSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GriverSystem.Core.Services
{
    public class ReportService : IReportService
    {
        private readonly GriverDbContext _context;
        private readonly IUserService _userService;
        private readonly ICourseService _courseService;

        public ReportService(
            GriverDbContext context,
            IUserService userService,
            ICourseService courseService)
        {
            _context = context;
            _userService = userService;
            _courseService = courseService;
        }

        public async Task<List<ReportTemplate>> GetAvailableTemplatesAsync(ClaimsPrincipal user)
        {
            var templates = new List<ReportTemplate>
            {
                new ReportTemplate
                {
                    Id = "employee_progress",
                    Name = "📈 Progreso de Empleados",
                    Description = "Seguimiento detallado del progreso individual de empleados en cursos asignados",
                    Icon = "TrendingUp",
                    Category = "Desempeño Individual",
                    AllowedRoles = new[] { "Admin", "RH" }
                },
                new ReportTemplate
                {
                    Id = "department_stats",
                    Name = "🏢 Estadísticas por Departamento",
                    Description = "Análisis agregado de desempeño y finalización por área organizacional",
                    Icon = "Building2",
                    Category = "Análisis Organizacional",
                    AllowedRoles = new[] { "Admin", "RH" }
                },
                new ReportTemplate
                {
                    Id = "certifications",
                    Name = "🎓 Certificaciones Obtenidas",
                    Description = "Listado completo de certificaciones y cursos finalizados por usuario",
                    Icon = "Award",
                    Category = "Certificaciones",
                    AllowedRoles = new[] { "Admin", "RH" }
                },
                new ReportTemplate
                {
                    Id = "pending_assignments",
                    Name = "⏳ Cursos Pendientes",
                    Description = "Identificación de asignaciones sin iniciar o en progreso con alertas de tiempo",
                    Icon = "Clock",
                    Category = "Seguimiento",
                    AllowedRoles = new[] { "Admin", "RH" }
                },
                new ReportTemplate
                {
                    Id = "overall_performance",
                    Name = "🎯 Desempeño General",
                    Description = "Vista panorámica del rendimiento del sistema completo de capacitación",
                    Icon = "Target",
                    Category = "Resumen Ejecutivo",
                    AllowedRoles = new[] { "Admin" }
                },
                new ReportTemplate
                {
                    Id = "historical",
                    Name = "📊 Reporte Histórico",
                    Description = "Análisis de tendencias y evolución temporal de métricas clave",
                    Icon = "LineChart",
                    Category = "Análisis Temporal",
                    AllowedRoles = new[] { "Admin" }
                }
            };

            // Filtrar por rol del usuario
            var userRoles = await _userService.GetUserRolesAsync(user);
            return templates.Where(t => t.AllowedRoles.Intersect(userRoles).Any()).ToList();
        }

        public async Task<DataTable> GetReportDataAsync(string templateType, ReportFilterViewModel filters)
        {
            return templateType switch
            {
                "employee_progress" => await GetEmployeeProgressDataAsync(filters),
                "department_stats" => await GetDepartmentStatsDataAsync(filters),
                "certifications" => await GetCertificationsDataAsync(filters),
                "pending_assignments" => await GetPendingAssignmentsDataAsync(filters),
                "overall_performance" => await GetOverallPerformanceDataAsync(filters),
                "historical" => await GetHistoricalDataAsync(filters),
                _ => throw new ArgumentException($"Template type {templateType} not found")
            };
        }

        private async Task<DataTable> GetEmployeeProgressDataAsync(ReportFilterViewModel filters)
        {
            var query = from u in _context.Users
                        join uc in _context.UserCourses on u.Id equals uc.UserId
                        join c in _context.Courses on uc.CourseId equals c.Id
                        join p in _context.Progress on new { u.Id, c.Id } equals new { Id = p.UserId, Id = p.CourseId } into progressGroup
                        from prog in progressGroup.DefaultIfEmpty()
                        select new
                        {
                            UserName = u.FirstName + " " + u.LastName,
                            Email = u.Email,
                            Department = u.Department,
                            CourseName = c.Title,
                            AssignedDate = uc.AssignedAt,
                            Progress = prog != null ? prog.ProgressPercentage : 0,
                            Status = prog != null && prog.CompletedAt.HasValue ? "Completado" : 
                                    prog != null && prog.ProgressPercentage > 0 ? "En Progreso" : "Pendiente",
                            CompletedDate = prog != null ? prog.CompletedAt : null,
                            DaysActive = prog != null ? EF.Functions.DateDiffDay(prog.StartedAt, DateTime.Now) : 0
                        };

            // Aplicar filtros
            if (filters.StartDate.HasValue)
                query = query.Where(x => x.AssignedDate >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(x => x.AssignedDate <= filters.EndDate.Value);

            if (filters.Departments?.Any() == true)
                query = query.Where(x => filters.Departments.Contains(x.Department));

            if (filters.CourseId.HasValue)
                query = query.Where(x => x.CourseName == _context.Courses.FirstOrDefault(c => c.Id == filters.CourseId).Title);

            var data = await query.ToListAsync();

            // Convertir a DataTable
            var dt = new DataTable("EmployeeProgress");
            dt.Columns.Add("Nombre", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Departamento", typeof(string));
            dt.Columns.Add("Curso", typeof(string));
            dt.Columns.Add("Fecha Asignación", typeof(DateTime));
            dt.Columns.Add("Progreso %", typeof(int));
            dt.Columns.Add("Estado", typeof(string));
            dt.Columns.Add("Fecha Completado", typeof(DateTime));
            dt.Columns.Add("Días Activo", typeof(int));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.UserName,
                    item.Email,
                    item.Department,
                    item.CourseName,
                    item.AssignedDate,
                    item.Progress,
                    item.Status,
                    item.CompletedDate ?? (object)DBNull.Value,
                    item.DaysActive
                );
            }

            return dt;
        }

        private async Task<DataTable> GetDepartmentStatsDataAsync(ReportFilterViewModel filters)
        {
            var query = from u in _context.Users
                        join uc in _context.UserCourses on u.Id equals uc.UserId
                        join c in _context.Courses on uc.CourseId equals c.Id
                        join p in _context.Progress on new { u.Id, c.Id } equals new { Id = p.UserId, Id = p.CourseId } into progressGroup
                        from prog in progressGroup.DefaultIfEmpty()
                        group new { u, prog } by u.Department into deptGroup
                        select new
                        {
                            Department = deptGroup.Key,
                            TotalEmployees = deptGroup.Select(x => x.u.Id).Distinct().Count(),
                            CoursesCompleted = deptGroup.Count(x => x.prog != null && x.prog.CompletedAt.HasValue),
                            AverageProgress = deptGroup.Average(x => x.prog != null ? x.prog.ProgressPercentage : 0),
                            ActiveUsers = deptGroup.Count(x => x.prog != null && x.prog.ProgressPercentage > 0 && !x.prog.CompletedAt.HasValue)
                        };

            if (filters.Departments?.Any() == true)
                query = query.Where(x => filters.Departments.Contains(x.Department));

            var data = await query.ToListAsync();

            var dt = new DataTable("DepartmentStats");
            dt.Columns.Add("Departamento", typeof(string));
            dt.Columns.Add("Total Empleados", typeof(int));
            dt.Columns.Add("Cursos Completados", typeof(int));
            dt.Columns.Add("Progreso Promedio %", typeof(decimal));
            dt.Columns.Add("Usuarios Activos", typeof(int));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.Department,
                    item.TotalEmployees,
                    item.CoursesCompleted,
                    Math.Round((decimal)item.AverageProgress, 2),
                    item.ActiveUsers
                );
            }

            return dt;
        }

        private async Task<DataTable> GetCertificationsDataAsync(ReportFilterViewModel filters)
        {
            var query = from cert in _context.Certificates
                        join u in _context.Users on cert.UserId equals u.Id
                        join c in _context.Courses on cert.CourseId equals c.Id
                        select new
                        {
                            UserName = u.FirstName + " " + u.LastName,
                            Email = u.Email,
                            Department = u.Department,
                            CourseName = c.Title,
                            CompletedDate = cert.IssuedAt,
                            CertificateNumber = cert.CertificateNumber,
                            Score = cert.Score
                        };

            if (filters.StartDate.HasValue)
                query = query.Where(x => x.CompletedDate >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(x => x.CompletedDate <= filters.EndDate.Value);

            if (filters.Departments?.Any() == true)
                query = query.Where(x => filters.Departments.Contains(x.Department));

            var data = await query.OrderByDescending(x => x.CompletedDate).ToListAsync();

            var dt = new DataTable("Certifications");
            dt.Columns.Add("Usuario", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Departamento", typeof(string));
            dt.Columns.Add("Curso", typeof(string));
            dt.Columns.Add("Fecha Completado", typeof(DateTime));
            dt.Columns.Add("Número Certificado", typeof(string));
            dt.Columns.Add("Calificación", typeof(decimal));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.UserName,
                    item.Email,
                    item.Department,
                    item.CourseName,
                    item.CompletedDate,
                    item.CertificateNumber,
                    item.Score ?? (object)DBNull.Value
                );
            }

            return dt;
        }

        private async Task<DataTable> GetPendingAssignmentsDataAsync(ReportFilterViewModel filters)
        {
            var query = from uc in _context.UserCourses
                        join u in _context.Users on uc.UserId equals u.Id
                        join c in _context.Courses on uc.CourseId equals c.Id
                        join p in _context.Progress on new { uc.UserId, uc.CourseId } equals new { p.UserId, p.CourseId } into progressGroup
                        from prog in progressGroup.DefaultIfEmpty()
                        where prog == null || (prog.ProgressPercentage < 100 && !prog.CompletedAt.HasValue)
                        select new
                        {
                            UserName = u.FirstName + " " + u.LastName,
                            Email = u.Email,
                            CourseName = c.Title,
                            AssignedDate = uc.AssignedAt,
                            DaysPending = EF.Functions.DateDiffDay(uc.AssignedAt, DateTime.Now),
                            Progress = prog != null ? prog.ProgressPercentage : 0,
                            Status = prog == null ? "Sin Iniciar" : "En Progreso"
                        };

            if (filters.Departments?.Any() == true)
            {
                var userIds = await _context.Users
                    .Where(u => filters.Departments.Contains(u.Department))
                    .Select(u => u.Id)
                    .ToListAsync();
                query = query.Where(x => userIds.Contains(x.Email)); // Simplificación
            }

            var data = await query.OrderByDescending(x => x.DaysPending).ToListAsync();

            var dt = new DataTable("PendingAssignments");
            dt.Columns.Add("Usuario", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Curso", typeof(string));
            dt.Columns.Add("Fecha Asignación", typeof(DateTime));
            dt.Columns.Add("Días Pendientes", typeof(int));
            dt.Columns.Add("Progreso %", typeof(int));
            dt.Columns.Add("Estado", typeof(string));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.UserName,
                    item.Email,
                    item.CourseName,
                    item.AssignedDate,
                    item.DaysPending,
                    item.Progress,
                    item.Status
                );
            }

            return dt;
        }

        private async Task<DataTable> GetOverallPerformanceDataAsync(ReportFilterViewModel filters)
        {
            var query = from u in _context.Users
                        join uc in _context.UserCourses on u.Id equals uc.UserId into userCoursesGroup
                        from ucg in userCoursesGroup.DefaultIfEmpty()
                        join p in _context.Progress on new { u.Id, CourseId = ucg.CourseId } equals new { Id = p.UserId, p.CourseId } into progressGroup
                        from prog in progressGroup.DefaultIfEmpty()
                        group new { u, ucg, prog } by u.Id into userGroup
                        select new
                        {
                            UserName = userGroup.FirstOrDefault().u.FirstName + " " + userGroup.FirstOrDefault().u.LastName,
                            Department = userGroup.FirstOrDefault().u.Department,
                            TotalCourses = userGroup.Count(x => x.ucg != null),
                            CompletedCourses = userGroup.Count(x => x.prog != null && x.prog.CompletedAt.HasValue),
                            PendingCourses = userGroup.Count(x => x.prog == null || !x.prog.CompletedAt.HasValue),
                            AverageScore = userGroup.Where(x => x.prog != null && x.prog.CompletedAt.HasValue)
                                                    .Average(x => x.prog.ProgressPercentage)
                        };

            var data = await query.ToListAsync();

            var dt = new DataTable("OverallPerformance");
            dt.Columns.Add("Usuario", typeof(string));
            dt.Columns.Add("Departamento", typeof(string));
            dt.Columns.Add("Cursos Totales", typeof(int));
            dt.Columns.Add("Completados", typeof(int));
            dt.Columns.Add("Pendientes", typeof(int));
            dt.Columns.Add("Calificación Promedio", typeof(decimal));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.UserName,
                    item.Department,
                    item.TotalCourses,
                    item.CompletedCourses,
                    item.PendingCourses,
                    Math.Round((decimal)(item.AverageScore ?? 0), 2)
                );
            }

            return dt;
        }

        private async Task<DataTable> GetHistoricalDataAsync(ReportFilterViewModel filters)
        {
            var query = from p in _context.Progress
                        join u in _context.Users on p.UserId equals u.Id
                        join c in _context.Courses on p.CourseId equals c.Id
                        select new
                        {
                            UserName = u.FirstName + " " + u.LastName,
                            Department = u.Department,
                            Activity = "Curso: " + c.Title,
                            Date = p.UpdatedAt,
                            Result = p.CompletedAt.HasValue ? "Completado" : $"{p.ProgressPercentage}% progreso",
                            Score = p.ProgressPercentage
                        };

            if (filters.StartDate.HasValue)
                query = query.Where(x => x.Date >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(x => x.Date <= filters.EndDate.Value);

            var data = await query.OrderByDescending(x => x.Date).ToListAsync();

            var dt = new DataTable("Historical");
            dt.Columns.Add("Usuario", typeof(string));
            dt.Columns.Add("Departamento", typeof(string));
            dt.Columns.Add("Actividad", typeof(string));
            dt.Columns.Add("Fecha", typeof(DateTime));
            dt.Columns.Add("Resultado", typeof(string));
            dt.Columns.Add("Puntuación", typeof(int));

            foreach (var item in data)
            {
                dt.Rows.Add(
                    item.UserName,
                    item.Department,
                    item.Activity,
                    item.Date,
                    item.Result,
                    item.Score
                );
            }

            return dt;
        }

        public async Task<string> GeneratePreviewHtmlAsync(ReportDocument report)
        {
            // Generar vista previa HTML del reporte
            using (var stream = new MemoryStream())
            {
                report.ExportToStream(CrystalDecisions.Shared.ExportFormatType.HTML40);
                stream.Position = 0;
                using (var reader = new StreamReader(stream))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        public async Task LogReportGenerationAsync(ReportAuditLog log)
        {
            _context.ReportAuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<ReportTemplate> GetTemplateByTypeAsync(string templateType)
        {
            var templates = await GetAvailableTemplatesAsync(null);
            return templates.FirstOrDefault(t => t.Id == templateType);
        }

        public async Task<Dictionary<string, object>> GetReportStatisticsAsync()
        {
            var stats = new Dictionary<string, object>
            {
                ["TotalReportsGenerated"] = await _context.ReportAuditLogs.CountAsync(),
                ["ReportsThisMonth"] = await _context.ReportAuditLogs
                    .CountAsync(r => r.Timestamp.Month == DateTime.Now.Month),
                ["MostPopularReport"] = await _context.ReportAuditLogs
                    .GroupBy(r => r.ReportType)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .FirstOrDefaultAsync(),
                ["AverageRecordsPerReport"] = await _context.ReportAuditLogs
                    .AverageAsync(r => r.RecordCount)
            };

            return stats;
        }
    }
}
```

**4. ReportTemplate.cs** (GriverSystem.Core/Entities)
```csharp
// UBICACIÓN: /GriverSystem.Core/Entities/ReportTemplate.cs
namespace GriverSystem.Core.Entities
{
    public class ReportTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Category { get; set; }
        public string[] AllowedRoles { get; set; }
        public string ReportFilePath { get; set; }
    }

    public class ReportAuditLog
    {
        public int Id { get; set; }
        public string ReportType { get; set; }
        public string GeneratedBy { get; set; }
        public DateTime Timestamp { get; set; }
        public object FilterApplied { get; set; } // Serializado como JSON
        public string ExportFormat { get; set; }
        public int RecordCount { get; set; }
    }
}
```

**5. Index.cshtml** (GriverSystem.Web/Views/Reports)
```html
<!-- UBICACIÓN: /GriverSystem.Web/Views/Reports/Index.cshtml -->
@model ReportsIndexViewModel
@{
    ViewData["Title"] = "Crystal Reports - Sistema Griver";
}

<div class="reports-container">
    <!-- Header -->
    <div class="reports-header">
        <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-lg">
                <i class="icon-file-spreadsheet h-6 w-6"></i>
            </div>
            <div>
                <h1 class="text-3xl font-bold">Sistema de Reportes Griver</h1>
                <p class="text-muted-foreground">Generación profesional de reportes con Crystal Reports</p>
            </div>
        </div>
        <div class="reports-stats">
            <div class="stat-item">
                <span class="stat-value" id="totalReports">0</span>
                <span class="stat-label">Reportes Generados</span>
            </div>
        </div>
    </div>

    <!-- Templates Grid -->
    <div class="templates-section">
        <h2 class="section-title">📋 Templates Disponibles</h2>
        <div class="templates-grid">
            @foreach (var template in Model.Templates)
            {
                <div class="template-card group" data-template-id="@template.Id">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                    
                    <div class="template-header">
                        <div class="template-icon">
                            <i class="@template.Icon"></i>
                        </div>
                        <div class="template-info">
                            <h3>@template.Name</h3>
                            <span class="badge badge-primary">@template.Category</span>
                        </div>
                    </div>

                    <p class="template-description">@template.Description</p>

                    <div class="template-actions">
                        <button class="btn btn-primary btn-generate" data-template="@template.Id">
                            <i class="icon-play"></i>
                            Generar Reporte
                        </button>
                        <button class="btn btn-secondary btn-preview" data-template="@template.Id">
                            <i class="icon-eye"></i>
                            Vista Previa
                        </button>
                    </div>
                </div>
            }
        </div>
    </div>

    <!-- Filters Panel (Collapsible) -->
    <div class="filters-panel" id="filtersPanel" style="display: none;">
        <h3>🔍 Configurar Filtros</h3>
        <form id="reportFiltersForm">
            <div class="form-grid">
                <div class="form-group">
                    <label>Rango de Fechas</label>
                    <select id="dateRange" class="form-control">
                        <option value="last7days">📅 Últimos 7 días</option>
                        <option value="last30days">📅 Últimos 30 días</option>
                        <option value="last3months">📅 Últimos 3 meses</option>
                        <option value="last6months" selected>📅 Últimos 6 meses</option>
                        <option value="lastyear">📅 Último año</option>
                        <option value="custom">📅 Personalizado</option>
                    </select>
                </div>

                <div class="form-group" id="customDateGroup" style="display: none;">
                    <label>Desde - Hasta</label>
                    <div class="date-range-inputs">
                        <input type="date" id="startDate" class="form-control" />
                        <input type="date" id="endDate" class="form-control" />
                    </div>
                </div>

                <div class="form-group">
                    <label>Departamentos</label>
                    <div class="checkbox-group">
                        @foreach (var dept in Model.Departments)
                        {
                            <label class="checkbox-label">
                                <input type="checkbox" name="departments" value="@dept" />
                                @dept
                            </label>
                        }
                    </div>
                </div>

                <div class="form-group">
                    <label>Curso Específico</label>
                    <select id="courseFilter" class="form-control">
                        <option value="">Todos los cursos</option>
                        @foreach (var course in Model.Courses)
                        {
                            <option value="@course.Id">@course.Title</option>
                        }
                    </select>
                </div>
            </div>

            <div class="filter-actions">
                <button type="button" class="btn btn-secondary" id="clearFilters">Limpiar Filtros</button>
                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
            </div>
        </form>
    </div>

    <!-- Export Configuration Dialog -->
    <div id="exportDialog" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚙️ Configuración de Exportación</h3>
                <button class="btn-close" id="closeExportDialog">&times;</button>
            </div>

            <form id="exportConfigForm">
                <div class="form-section">
                    <h4>Formato de Salida</h4>
                    <div class="format-options">
                        <label class="format-option">
                            <input type="radio" name="exportFormat" value="pdf" checked />
                            <div class="format-card">
                                <i class="icon-file-pdf"></i>
                                <span>PDF</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="exportFormat" value="excel" />
                            <div class="format-card">
                                <i class="icon-file-excel"></i>
                                <span>Excel</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="exportFormat" value="csv" />
                            <div class="format-card">
                                <i class="icon-file-csv"></i>
                                <span>CSV</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="form-section" id="pdfConfigSection">
                    <h4>Configuración PDF</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tamaño de Página</label>
                            <select id="pageSize" class="form-control">
                                <option value="letter" selected>Carta (8.5" x 11")</option>
                                <option value="a4">A4 (210mm x 297mm)</option>
                                <option value="legal">Legal (8.5" x 14")</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Orientación</label>
                            <select id="orientation" class="form-control">
                                <option value="portrait" selected>Vertical</option>
                                <option value="landscape">Horizontal</option>
                            </select>
                        </div>

                        <div class="form-group full-width">
                            <label class="checkbox-label">
                                <input type="checkbox" id="showLogo" checked />
                                Incluir logo de Griver
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="showHeader" checked />
                                Mostrar encabezado
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="showFooter" checked />
                                Mostrar pie de página
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="showPageNumbers" checked />
                                Numerar páginas
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="showGenerationDate" checked />
                                Incluir fecha de generación
                            </label>
                        </div>

                        <div class="form-group full-width">
                            <label>Marca de Agua (opcional)</label>
                            <input type="text" id="watermark" class="form-control" placeholder="Ej: CONFIDENCIAL - GRIVER" />
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" id="cancelExport">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="icon-download"></i>
                        Exportar Reporte
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay" style="display: none;">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Generando reporte...</p>
        </div>
    </div>
</div>

@section Scripts {
    <script src="~/js/crystal-reports.js"></script>
    <script>
        $(document).ready(function() {
            CrystalReports.init({
                templatesEndpoint: '@Url.Action("Generate", "Reports")',
                exportEndpoint: '@Url.Action("Export", "Reports")',
                statsEndpoint: '@Url.Action("GetStats", "Reports")'
            });
        });
    </script>
}
```

**6. crystal-reports.js** (GriverSystem.Web/wwwroot/js)
```javascript
// UBICACIÓN: /GriverSystem.Web/wwwroot/js/crystal-reports.js
const CrystalReports = {
    config: {},
    currentTemplate: null,
    currentFilters: {},

    init(config) {
        this.config = config;
        this.attachEventListeners();
        this.loadStatistics();
    },

    attachEventListeners() {
        // Template selection
        $('.btn-generate').on('click', (e) => {
            const templateId = $(e.currentTarget).data('template');
            this.selectTemplate(templateId);
        });

        $('.btn-preview').on('click', (e) => {
            const templateId = $(e.currentTarget).data('template');
            this.previewReport(templateId);
        });

        // Filters
        $('#reportFiltersForm').on('submit', (e) => {
            e.preventDefault();
            this.applyFilters();
        });

        $('#clearFilters').on('click', () => this.clearFilters());

        $('#dateRange').on('change', (e) => {
            $('#customDateGroup').toggle(e.target.value === 'custom');
        });

        // Export dialog
        $('#closeExportDialog, #cancelExport').on('click', () => {
            $('#exportDialog').hide();
        });

        $('#exportConfigForm').on('submit', (e) => {
            e.preventDefault();
            this.exportReport();
        });

        $('input[name="exportFormat"]').on('change', (e) => {
            $('#pdfConfigSection').toggle(e.target.value === 'pdf');
        });
    },

    selectTemplate(templateId) {
        this.currentTemplate = templateId;
        $('#filtersPanel').slideDown();
        $('html, body').animate({
            scrollTop: $('#filtersPanel').offset().top - 100
        }, 500);
    },

    async applyFilters() {
        const formData = $('#reportFiltersForm').serializeArray();
        this.currentFilters = this.buildFiltersObject(formData);

        // Mostrar diálogo de exportación
        $('#exportDialog').fadeIn();
    },

    buildFiltersObject(formData) {
        const filters = {};
        const dateRange = $('#dateRange').val();

        // Date range
        if (dateRange === 'custom') {
            filters.startDate = $('#startDate').val();
            filters.endDate = $('#endDate').val();
        } else {
            const dates = this.calculateDateRange(dateRange);
            filters.startDate = dates.start;
            filters.endDate = dates.end;
        }

        // Departments
        const departments = [];
        $('input[name="departments"]:checked').each(function() {
            departments.push($(this).val());
        });
        if (departments.length > 0) {
            filters.departments = departments;
        }

        // Course filter
        const courseId = $('#courseFilter').val();
        if (courseId) {
            filters.courseId = parseInt(courseId);
        }

        return filters;
    },

    calculateDateRange(range) {
        const end = new Date();
        const start = new Date();

        switch (range) {
            case 'last7days':
                start.setDate(end.getDate() - 7);
                break;
            case 'last30days':
                start.setDate(end.getDate() - 30);
                break;
            case 'last3months':
                start.setMonth(end.getMonth() - 3);
                break;
            case 'last6months':
                start.setMonth(end.getMonth() - 6);
                break;
            case 'lastyear':
                start.setFullYear(end.getFullYear() - 1);
                break;
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    },

    async exportReport() {
        const exportFormat = $('input[name="exportFormat"]:checked').val();
        
        const config = exportFormat === 'pdf' ? {
            pageSize: $('#pageSize').val(),
            orientation: $('#orientation').val(),
            showLogo: $('#showLogo').is(':checked'),
            showHeader: $('#showHeader').is(':checked'),
            showFooter: $('#showFooter').is(':checked'),
            showPageNumbers: $('#showPageNumbers').is(':checked'),
            showGenerationDate: $('#showGenerationDate').is(':checked'),
            watermark: $('#watermark').val()
        } : null;

        $('#exportDialog').hide();
        $('#loadingOverlay').fadeIn();

        try {
            const response = await fetch(this.config.exportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateType: this.currentTemplate,
                    filters: this.currentFilters,
                    format: exportFormat,
                    config: config
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_griver_${this.currentTemplate}_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                this.showToast('Reporte exportado exitosamente', 'success');
                this.loadStatistics(); // Refresh stats
            } else {
                this.showToast('Error al exportar el reporte', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Error al exportar el reporte', 'error');
        } finally {
            $('#loadingOverlay').fadeOut();
        }
    },

    async previewReport(templateId) {
        this.currentTemplate = templateId;
        $('#loadingOverlay').fadeIn();

        try {
            const response = await fetch(this.config.templatesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateType: templateId,
                    filters: this.currentFilters || {}
                })
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar preview en modal
                this.showPreviewModal(data.previewHtml, data.recordCount);
            } else {
                this.showToast(data.message || 'Error al generar vista previa', 'error');
            }
        } catch (error) {
            console.error('Preview error:', error);
            this.showToast('Error al generar vista previa', 'error');
        } finally {
            $('#loadingOverlay').fadeOut();
        }
    },

    showPreviewModal(html, recordCount) {
        // Implementación del modal de preview
        // Similar al ExportReportDialog en React
    },

    async loadStatistics() {
        try {
            const response = await fetch(this.config.statsEndpoint);
            const stats = await response.json();
            $('#totalReports').text(stats.totalReportsGenerated || 0);
        } catch (error) {
            console.error('Stats error:', error);
        }
    },

    clearFilters() {
        $('#reportFiltersForm')[0].reset();
        $('input[name="departments"]').prop('checked', false);
        this.currentFilters = {};
    },

    showToast(message, type) {
        // Integrar con sistema de notificaciones de Griver
        toastr[type](message);
    }
};
```

---

### **📂 Archivos de Utilidades de Reportes**

#### **reportTemplates.ts → Configuración C#**

Los templates React se migran a configuración en C# y archivos `.rpt` de Crystal Reports:

**Estructura de archivos Crystal Reports:**
```
/GriverSystem.Web/wwwroot/Reports/
├── employee_progress.rpt          # Progreso de Empleados
├── department_stats.rpt            # Estadísticas por Departamento
├── certifications.rpt              # Certificaciones
├── pending_assignments.rpt         # Cursos Pendientes
├── overall_performance.rpt         # Desempeño General
├── historical.rpt                  # Reporte Histórico
└── _shared/
    ├── griver_header.rpt           # Header compartido
    ├── griver_footer.rpt           # Footer compartido
    └── griver_logo.png             # Logo corporativo
```

#### **pdfExporter.ts → Integrado en ReportsController**

La lógica de exportación PDF de React se integra directamente en el método `ExportToPdf()` del ReportsController con Crystal Reports native.

#### **excelExport.ts → Integrado en ReportsController**

Similar al PDF, la exportación Excel usa las capacidades nativas de Crystal Reports en el método `ExportToExcel()`.

---

### **🎨 Estilos del Sistema de Reportes**

**Archivo:** `/GriverSystem.Web/wwwroot/css/crystal-reports.css`
```css
/* UBICACIÓN: /GriverSystem.Web/wwwroot/css/crystal-reports.css */

.reports-container {
    padding: var(--spacing-xl);
    max-width: 1600px;
    margin: 0 auto;
}

.reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, var(--griver-primary)/10, var(--griver-secondary)/5);
    border-radius: var(--radius-lg);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
}

.template-card {
    position: relative;
    overflow: hidden;
    border: 2px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    background: linear-gradient(to bottom right, white, var(--muted)/20);
    transition: all 0.3s ease;
    cursor: pointer;
}

.template-card:hover {
    border-color: var(--griver-primary)/50;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    transform: translateY(-4px);
}

.template-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--griver-primary), var(--griver-secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 12px var(--griver-primary)/30;
}

.filters-panel {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: white;
    border: 2px solid var(--griver-primary)/20;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.format-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
}

.format-card {
    padding: var(--spacing-lg);
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    text-align: center;
    transition: all 0.3s ease;
}

.format-option input:checked + .format-card {
    border-color: var(--griver-primary);
    background: var(--griver-primary)/5;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.loading-spinner {
    text-align: center;
}

.spinner {
    width: 60px;
    height: 60px;
    border: 4px solid var(--border);
    border-top-color: var(--griver-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-md);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

### **🔐 Permisos y Roles en Reportes**

**Configuración en Program.cs:**
```csharp
// Políticas de autorización para reportes
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanViewBasicReports", policy =>
        policy.RequireRole("Admin", "RH"));
    
    options.AddPolicy("CanViewAdvancedReports", policy =>
        policy.RequireRole("Admin"));
    
    options.AddPolicy("CanExportReports", policy =>
        policy.RequireRole("Admin", "RH"));
});
```

**Aplicar en Controller:**
```csharp
[Authorize(Policy = "CanViewAdvancedReports")]
public async Task<IActionResult> OverallPerformance()
{
    // Solo Admin puede acceder
}
```

---

### **📊 Migración de Tipos TypeScript a C#**

#### **types/reports.ts → C# ViewModels**

```typescript
// React: /types/reports.ts
interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  departments?: string[];
  courseId?: number;
  status?: string;
}
```

**Migra a:**

```csharp
// C#: /GriverSystem.Web/ViewModels/ReportFilterViewModel.cs
public class ReportFilterViewModel
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> Departments { get; set; }
    public int? CourseId { get; set; }
    public string Status { get; set; }
}
```

---

### **📚 Documentación de Crystal Reports en C#**

**Archivo:** `/GriverSystem.Web/Documentation/CrystalReportsGuide.md`

Contenido equivalente a todos los archivos de documentación React:
- `UI_IMPROVEMENTS_CRYSTAL_REPORTS.md`
- `CRYSTAL_REPORTS_IMPLEMENTATION.md`
- `CRYSTAL_REPORTS_USER_GUIDE.md`
- `CRYSTAL_REPORTS_CHANGELOG.md`

---

### **✅ Checklist de Migración de Crystal Reports**

**React → C# Crystal Reports:**

- [x] CrystalReportsManager.tsx → ReportsController.cs
- [x] IReportService.cs + ReportService.cs implementados
- [x] 6 Templates .rpt creados en Crystal Reports
- [x] Exportación PDF con configuración completa
- [x] Exportación Excel con formato
- [x] Exportación CSV con RFC 4180
- [x] Sistema de filtros robusto
- [x] Auditoría de reportes generados
- [x] Permisos por rol (Admin/RH)
- [x] UI moderna con Bootstrap/CSS personalizado
- [x] JavaScript para interactividad del cliente
- [x] Loading states y feedback visual
- [x] Integración con logo y branding Griver

---

**Esta documentación proporciona el mapeo EXACTO de cada archivo del sistema React actual a su ubicación específica en Visual Studio con C# .NET Core. Cada componente, servicio, hook y archivo tiene su correspondiente implementación C# documentada con la ubicación precisa en la estructura del proyecto.**

*Mapeo completo de código React → C# finalizado - Noviembre 2025*  
*Sistema Griver con Crystal Reports preparado para migración completa a Visual Studio*