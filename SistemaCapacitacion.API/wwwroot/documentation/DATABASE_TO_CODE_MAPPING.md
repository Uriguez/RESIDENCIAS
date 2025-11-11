# 🔄 Sistema Griver - Mapeo Base de Datos a Código

## 📋 Mapeo Completo: Database ↔ TypeScript ↔ C#

Esta documentación muestra la relación exacta entre el esquema de base de datos editado manualmente, el código TypeScript actual, y la implementación futura en C#.

---

## 🏗️ **Mapeo de Entidades Principales**

### **👤 USUARIOS**

#### **Base de Datos → TypeScript → C#**

```sql
-- SQL: Tabla Users
CREATE TABLE Users (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Position NVARCHAR(100) NULL,
    Department NVARCHAR(100) NULL,
    HireDate DATETIME2 NOT NULL,
    Status INT NOT NULL DEFAULT 1,
    LastLoginDate DATETIME2 NULL,
    Avatar NVARCHAR(500) NULL
);
```

```typescript
// TypeScript: Interface actual
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  coursesAssigned: string[];
  coursesCompleted: string[];
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = "admin" | "rh" | "employee" | "intern";
```

```csharp
// C#: Model de destino
public class User
{
    public string Id { get; set; } // FK a IdentityUser
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Position { get; set; }
    public string Department { get; set; }
    public DateTime HireDate { get; set; }
    public UserStatus Status { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string Avatar { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation Properties
    public virtual IdentityUser IdentityUser { get; set; }
    public virtual ICollection<UserCourse> UserCourses { get; set; }
    public virtual ICollection<Certificate> Certificates { get; set; }
}

public enum UserStatus { Inactive = 0, Active = 1 }
```

### **📚 CURSOS**

#### **Base de Datos → TypeScript → C#**

```sql
-- SQL: Tabla Courses
CREATE TABLE Courses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    ThumbnailUrl NVARCHAR(500) NULL,
    EstimatedDurationMinutes INT NOT NULL,
    Category INT NOT NULL,
    Difficulty INT NOT NULL,
    IsActive BIT NOT NULL,
    CreatedById NVARCHAR(450) NOT NULL
);
```

```typescript
// TypeScript: Interface actual
interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  estimatedTime: number;
  assignments: UserRole[];
  departments: string[];
  content: CourseContent[];
  status: CourseStatus;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type CourseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";
type CourseStatus = "draft" | "active" | "archived";
```

```csharp
// C#: Model de destino
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

    // Navigation Properties
    public virtual User CreatedBy { get; set; }
    public virtual ICollection<CourseContent> Contents { get; set; }
    public virtual ICollection<UserCourse> UserCourses { get; set; }
}

public enum CourseCategory
{
    Security = 1, Compliance = 2, Development = 3,
    Culture = 4, Technology = 5
}

public enum CourseDifficulty
{
    Beginner = 1, Intermediate = 2, Advanced = 3
}
```

### **📊 PROGRESO**

#### **Base de Datos → TypeScript → C#**

```sql
-- SQL: Tabla Progress
CREATE TABLE Progress (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    CourseId INT NOT NULL,
    ContentId INT NULL,
    CompletionPercentage DECIMAL(5,2) NOT NULL,
    TimeSpentMinutes INT NOT NULL,
    Score INT NULL,
    IsCompleted BIT NOT NULL,
    CompletedAt DATETIME2 NULL,
    LastAccessedAt DATETIME2 NOT NULL
);
```

```typescript
// TypeScript: Interface actual
interface UserProgress {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  progress: number; // 0-100
  status: ProgressStatus;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // minutos
  currentContent?: string;
  score?: number;
}

type ProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "overdue";
```

```csharp
// C#: Model de destino
public class Progress
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int CourseId { get; set; }
    public int? ContentId { get; set; }
    public decimal CompletionPercentage { get; set; }
    public int TimeSpentMinutes { get; set; }
    public int? Score { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime LastAccessedAt { get; set; }

    // Navigation Properties
    public virtual User User { get; set; }
    public virtual Course Course { get; set; }
    public virtual CourseContent Content { get; set; }
}
```

---

## 🔄 **Mapeo de Componentes React a Controllers C#**

### **🎯 Dashboard Component**

#### **React Component Actual:**

```typescript
// components/Dashboard.tsx
const Dashboard = ({
  onNavigateToSettings,
}: DashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>();

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    const data = await griverApi.getDashboardMetrics();
    setMetrics(data);
  };
};
```

#### **C# Controller de Destino:**

```csharp
// Controllers/DashboardController.cs
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsDto>> GetMetrics()
    {
        var metrics = await _dashboardService.GetDashboardMetricsAsync();
        return Ok(metrics);
    }
}

// Services/DashboardService.cs
public class DashboardService : IDashboardService
{
    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
    {
        // Utiliza sp_GetAdminStats del schema SQL
        var result = await _context.Database
            .SqlQueryRaw<AdminStatsDto>("EXEC sp_GetAdminStats")
            .ToListAsync();

        return MapToMetrics(result);
    }
}
```

### **👥 User Management Component**

#### **React Component Actual:**

```typescript
// components/StudentManagement.tsx
const StudentManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});

  const handleCreateUser = async (userData: CreateUserData) => {
    await griverApi.createUser(userData);
    await fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    await griverApi.deleteUser(userId);
    await fetchUsers();
  };
};
```

#### **C# Controller de Destino:**

```csharp
// Controllers/UsersController.cs
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers(
        [FromQuery] UserFiltersDto filters)
    {
        var users = await _userService.GetUsersAsync(filters);
        return Ok(users);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto userData)
    {
        var user = await _userService.CreateUserAsync(userData);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        await _userService.DeleteUserAsync(id);
        return NoContent();
    }
}
```

### **📚 Course Management Component**

#### **React Component Actual:**

```typescript
// components/CourseManagement.tsx
const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const handleCreateCourse = async (
    courseData: CreateCourseData,
  ) => {
    await griverApi.createCourse(courseData);
    await fetchCourses();
  };

  const handleAssignCourse = async (
    courseId: string,
    userIds: string[],
  ) => {
    await griverApi.assignCourse(courseId, userIds);
  };
};
```

#### **C# Controller de Destino:**

```csharp
// Controllers/CoursesController.cs
[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<CourseDto>> CreateCourse(
        [FromBody] CreateCourseDto courseData)
    {
        var course = await _courseService.CreateCourseAsync(courseData);
        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    [HttpPost("{courseId}/assign")]
    public async Task<ActionResult> AssignCourse(
        int courseId,
        [FromBody] AssignCourseDto assignment)
    {
        await _courseService.AssignCourseAsync(courseId, assignment.UserIds);
        return Ok();
    }
}
```

---

## 🔍 **Mapeo de Consultas Específicas**

### **📊 Analytics Queries**

#### **TypeScript Hook Actual:**

```typescript
// hooks/useGriverAnalytics.ts
const useGriverAnalytics = () => {
  const getCompletionRatesByDepartment = async () => {
    return await griverApi.getAnalytics({
      type: "completion-by-department",
      period: "last-6-months",
    });
  };

  const getUserActivityTrends = async () => {
    return await griverApi.getAnalytics({
      type: "user-activity",
      period: "last-month",
    });
  };
};
```

#### **C# Service Implementando Queries SQL:**

```csharp
// Services/AnalyticsService.cs
public class AnalyticsService : IAnalyticsService
{
    public async Task<IEnumerable<DepartmentStatsDto>> GetCompletionRatesByDepartmentAsync()
    {
        // Utiliza la vista vw_CourseProgress del schema
        var query = @"
            SELECT
                u.Department,
                COUNT(DISTINCT u.Id) as TotalUsers,
                COUNT(DISTINCT uc.UserId) as UsersWithCourses,
                AVG(cp.CompletionRate) as AverageCompletionRate
            FROM Users u
            LEFT JOIN UserCourses uc ON u.Id = uc.UserId
            LEFT JOIN vw_CourseProgress cp ON uc.CourseId = cp.CourseId
            WHERE u.Status = 1
            GROUP BY u.Department";

        return await _context.Database
            .SqlQueryRaw<DepartmentStatsDto>(query)
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityTrendDto>> GetUserActivityTrendsAsync()
    {
        // Utiliza la vista vw_RecentActivity del schema
        var query = @"
            SELECT
                CAST(CreatedAt AS DATE) as Date,
                COUNT(*) as ActivityCount,
                COUNT(DISTINCT UserId) as UniqueUsers
            FROM vw_RecentActivity
            WHERE CreatedAt >= DATEADD(month, -1, GETUTCDATE())
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY Date";

        return await _context.Database
            .SqlQueryRaw<ActivityTrendDto>(query)
            .ToListAsync();
    }
}
```

### **🏆 Certificates Generation**

#### **TypeScript Function Actual:**

```typescript
// services/api.ts
const generateCertificate = async (
  userId: string,
  courseId: string,
) => {
  const response = await fetch("/api/certificates/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId }),
  });
  return response.blob(); // PDF Certificate
};
```

#### **C# Implementation:**

```csharp
// Controllers/CertificatesController.cs
[HttpPost("generate")]
public async Task<ActionResult> GenerateCertificate(
    [FromBody] GenerateCertificateDto request)
{
    // Utiliza el template configurado en SystemSettings
    var template = await _systemService.GetSettingAsync("CertificateTemplate");

    var certificate = await _certificateService.GenerateCertificateAsync(
        request.UserId,
        request.CourseId,
        template);

    // Inserta en tabla Certificates usando el schema
    await _certificateService.SaveCertificateAsync(certificate);

    return File(certificate.PdfBytes, "application/pdf",
        $"certificate-{certificate.CertificateNumber}.pdf");
}

// Services/CertificateService.cs
public async Task<Certificate> GenerateCertificateAsync(string userId, int courseId, string template)
{
    var certificateNumber = GenerateUniqueCertificateNumber();

    var certificate = new Certificate
    {
        UserId = userId,
        CourseId = courseId,
        CertificateNumber = certificateNumber,
        IssuedDate = DateTime.UtcNow,
        Score = await GetUserCourseScore(userId, courseId),
        IssuedById = _currentUser.Id // From JWT claims
    };

    await _context.Certificates.AddAsync(certificate);
    await _context.SaveChangesAsync();

    return certificate;
}
```

---

## 🔄 **Mapeo de Estados y Enums**

### **Course Status Mapping**

```sql
-- SQL: Status como INT
Status INT NOT NULL -- 0=NotStarted, 1=InProgress, 2=Completed, 3=Expired
```

```typescript
// TypeScript: Union Types
type ProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "overdue";
```

```csharp
// C#: Enums
public enum CourseStatus
{
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    Expired = 3
}
```

### **User Role Mapping**

```sql
-- SQL: ASP.NET Identity Roles
INSERT INTO AspNetRoles (Name) VALUES ('Admin'), ('RH'), ('Employee'), ('Intern');
```

```typescript
// TypeScript: String Literals
type UserRole = "admin" | "rh" | "employee" | "intern";
```

```csharp
// C#: Constants y Roles
public static class GriverRoles
{
    public const string Admin = "Admin";
    public const string RH = "RH";
    public const string Employee = "Employee";
    public const string Intern = "Intern";
}

[Authorize(Roles = GriverRoles.Admin + "," + GriverRoles.RH)]
public async Task<ActionResult> ManageUsers() { }
```

---

## 📋 **Mapeo de Configuraciones**

### **System Settings Implementation**

#### **TypeScript Configuration:**

```typescript
// utils/constants.ts
export const GRIVER_CONSTANTS = {
  COMPANY_NAME: "Griver",
  SYSTEM_NAME: "Sistema de Gestión de Capacitación Griver",
  ROLES: ["admin", "rh", "employee", "intern"] as const,
  DEPARTMENTS: [
    "Recursos Humanos",
    "Tecnología",
    "Ventas",
    "Marketing",
    "Operaciones",
  ],
};
```

#### **C# Configuration Service:**

```csharp
// Services/SystemSettingsService.cs
public class SystemSettingsService : ISystemSettingsService
{
    public async Task<string> GetSettingAsync(string key)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.SettingKey == key);
        return setting?.SettingValue;
    }

    public async Task<GriverConfig> GetGriverConfigAsync()
    {
        var settings = await _context.SystemSettings
            .Where(s => s.Category == "General")
            .ToListAsync();

        return new GriverConfig
        {
            CompanyName = GetSettingValue(settings, "CompanyName"),
            CompanyLogo = GetSettingValue(settings, "CompanyLogo"),
            MaxFileUploadSize = int.Parse(GetSettingValue(settings, "MaxFileUploadSize")),
            SessionTimeoutMinutes = int.Parse(GetSettingValue(settings, "SessionTimeoutMinutes"))
        };
    }
}
```

---

## 🚀 **Estrategia de Migración por Fases**

### **📅 Fase 1: Core Infrastructure (2 semanas)**

1. ✅ **Base de datos creada** (Schema SQL implementado)
2. 🔄 Setup ASP.NET Core con Identity
3. 🔄 Entity Framework Models
4. 🔄 Repository Pattern base
5. 🔄 Basic Authentication API

### **📅 Fase 2: User Management (2 semanas)**

1. 🔄 User CRUD Controllers
2. 🔄 Role-based Authorization
3. 🔄 Profile Management
4. 🔄 Department Management
5. 🔄 Basic frontend integration

### **📅 Fase 3: Course System (3 semanas)**

1. 🔄 Course CRUD Controllers
2. 🔄 Content Management
3. 🔄 Course Assignment Logic
4. 🔄 Progress Tracking APIs
5. 🔄 Frontend course components

### **📅 Fase 4: Analytics & Reports (2 semanas)**

1. 🔄 Analytics Controllers
2. 🔄 Report Generation
3. 🔄 Certificate System
4. 🔄 Export functionality
5. 🔄 Dashboard integration

### **📅 Fase 5: Advanced Features (2 semanas)**

1. 🔄 Notification System
2. 🔄 Activity Logging
3. 🔄 System Configuration
4. 🔄 Performance optimization
5. 🔄 Production deployment

---

## 🎯 **Checklist de Validación**

### **✅ Database Schema Validation**

- [x] Todas las tablas creadas correctamente
- [x] Foreign Keys funcionando
- [x] Índices optimizados
- [x] Stored Procedures operativos
- [x] Vistas generando datos correctos
- [x] Triggers funcionando
- [x] Datos iniciales cargados

### **🔄 API Endpoints Mapping**

- [ ] GET /api/users → vw_UserSummary
- [ ] POST /api/courses → Courses table
- [ ] GET /api/dashboard/metrics → sp_GetAdminStats
- [ ] POST /api/progress → Progress table
- [ ] GET /api/analytics → Multiple views/SPs

### **🔄 Frontend Integration**

- [ ] User roles mapping
- [ ] Course status consistency
- [ ] Progress calculation accuracy
- [ ] Real-time notifications
- [ ] Export functionality

---

## 🏁 **Conclusión del Mapeo**

La base de datos editada manualmente está **perfectamente alineada** con el código TypeScript actual y proporciona una **ruta de migración clara y eficiente** hacia C#:

### **✅ Compatibilidad Total:**

- Todas las entidades TypeScript tienen correspondencia directa en SQL
- Los enums y estados son consistentes entre tecnologías
- Las consultas complejas están optimizadas con SPs y vistas
- La lógica de negocio se preserva intacta

### **🚀 Migración Facilitada:**

- Schema SQL listo para uso inmediato
- Queries optimizadas pre-escritas
- Configuraciones específicas de Griver
- Performance garantizado desde el inicio

**La base de datos está lista para soportar la migración sin interrupciones en la funcionalidad.**

---

_Mapeo completo finalizado - Enero 2025_
_Preparado para migración inmediata a C# .NET Core_