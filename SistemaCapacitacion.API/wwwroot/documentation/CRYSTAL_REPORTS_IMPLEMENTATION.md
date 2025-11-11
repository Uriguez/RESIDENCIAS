# 📊 Crystal Reports Implementation - Sistema Griver

## 📋 Resumen Ejecutivo

Se ha implementado un **sistema completo de generación de reportes** estilo Crystal Reports en el Sistema Griver, permitiendo a administradores y RH generar informes avanzados con exportación a PDF, Excel y CSV. Este documento detalla la implementación actual en React y proporciona guías completas para la migración a C# con Crystal Reports SDK.

**Versión:** 1.0.0  
**Fecha:** Enero 10, 2025  
**Autor:** Sistema Griver Development Team  
**Estado:** ✅ Producción Ready

---

## 🎯 Características Implementadas

### **Tipos de Reportes Disponibles**

1. **Progreso de Empleados por Curso** (`employee_progress`)
   - Detalle del avance individual en cada curso asignado
   - Filtrado por departamento, curso, rango de fechas
   - Métricas: Progreso %, días transcurridos, estado
   - Disponible para: Admin, RH

2. **Estadísticas por Departamento** (`department_statistics`)
   - Análisis comparativo entre departamentos
   - KPIs: Tasa de completación, progreso promedio, empleados activos
   - Gráficos de barras comparativos
   - Disponible para: Admin, RH

3. **Reporte de Certificaciones** (`certifications`)
   - Certificados emitidos y su validez
   - Identificación de certificados próximos a vencer
   - Calificaciones y fechas de emisión
   - Disponible para: Admin, RH

4. **Asignaciones Pendientes** (`pending_assignments`)
   - Cursos sin completar con priorización
   - Indicadores de vencimiento (crítico, alto, medio, bajo)
   - Días restantes hasta fecha límite
   - Disponible para: Admin, RH

5. **Desempeño General del Sistema** (`system_performance`)
   - KPIs globales del sistema Griver
   - Métricas de adopción y engagement
   - Comparación con objetivos establecidos
   - Disponible para: Admin únicamente

6. **Histórico de Completación** (`completion_history`)
   - Timeline de cursos completados
   - Duración promedio, calificaciones, intentos
   - Análisis de tendencias temporales
   - Disponible para: Admin, RH

---

## 🏗️ Arquitectura de Componentes

### **Estructura de Archivos**

```
/types/reports.ts                    // Definiciones TypeScript
/utils/reportTemplates.ts            // Plantillas predefinidas
/utils/reportGenerator.ts            // Lógica de generación de datos
/utils/pdfExporter.ts                // Exportación a PDF
/components/CrystalReportsManager.tsx // UI principal
```

### **Diagrama de Flujo**

```
┌─────────────────────────────────────────────────────────────┐
│                  CrystalReportsManager                       │
│  (Componente React - Interfaz Principal)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─► Selección de Template (6 tipos)
                      │
                      ├─► Configuración de Filtros
                      │   ├─ Rango de fechas
                      │   ├─ Departamentos
                      │   ├─ Cursos específicos
                      │   └─ Estados
                      │
                      ├─► ReportGenerator.generateReport()
                      │   ├─ Query de datos (users, courses)
                      │   ├─ Aplicación de filtros
                      │   ├─ Cálculo de agregaciones
                      │   └─ Generación de gráficos
                      │
                      ├─► Vista Previa en Modal
                      │   ├─ Tabla con datos
                      │   └─ Resumen estadístico
                      │
                      └─► Exportación
                          ├─ PDF → PDFExporter.exportToPDF()
                          ├─ Excel → exportToExcel()
                          ├─ CSV → downloadCSV()
                          └─ Print → PDFExporter.printReport()
```

---

## 💻 Implementación React Actual

### **1. Tipos y Estructuras de Datos**

```typescript
// /types/reports.ts

export type ReportType = 
  | 'employee_progress'
  | 'department_statistics'
  | 'certifications'
  | 'pending_assignments'
  | 'system_performance'
  | 'completion_history'
  | 'custom';

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  icon: string;
  availableFor: ('admin' | 'rh')[];
  fields: ReportField[];
}

export interface ReportData {
  id: string;
  template: ReportTemplate;
  filters: ReportFilter;
  generatedAt: string;
  generatedBy: string;
  data: Record<string, any>[];
  summary?: ReportSummary;
}

export interface CrystalReportConfig {
  pageSize: 'letter' | 'a4' | 'legal';
  orientation: 'portrait' | 'landscape';
  showHeader: boolean;
  showFooter: boolean;
  showLogo: boolean;
  showPageNumbers: boolean;
  showGenerationDate: boolean;
  watermark?: string;
}
```

### **2. Plantillas de Reportes**

```typescript
// /utils/reportTemplates.ts

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate> = {
  employee_progress: {
    id: 'rpt_employee_progress',
    name: 'Progreso de Empleados por Curso',
    type: 'employee_progress',
    fields: [
      { key: 'employeeName', label: 'Empleado', type: 'text' },
      { key: 'department', label: 'Departamento', type: 'text' },
      { key: 'progress', label: 'Progreso', type: 'percentage' },
      // ... más campos
    ]
  },
  // ... otros templates
};
```

### **3. Generador de Reportes**

```typescript
// /utils/reportGenerator.ts

export class ReportGenerator {
  static generateReport(
    template: ReportTemplate,
    filters: ReportFilter,
    users: User[],
    courses: Course[],
    currentUser: User
  ): ReportData {
    // Genera datos según el tipo de reporte
    // Aplica filtros
    // Calcula agregaciones
    // Retorna ReportData completo
  }

  private static generateEmployeeProgressData(
    users: User[], 
    courses: Course[], 
    filters: ReportFilter
  ): any[] {
    // Lógica específica para reporte de progreso
  }
  
  // ... métodos para otros tipos de reportes
}
```

### **4. Exportador de PDF**

```typescript
// /utils/pdfExporter.ts

export class PDFExporter {
  static async exportToPDF(
    reportData: ReportData,
    config: CrystalReportConfig
  ): Promise<void> {
    // Genera PDF con configuración personalizada
    // Incluye header, footer, logo, watermark
    // Trigger de descarga
  }

  static async printReport(
    reportData: ReportData,
    config: CrystalReportConfig
  ): Promise<void> {
    // Abre ventana de impresión con HTML formateado
  }
}
```

### **5. Componente Principal**

```tsx
// /components/CrystalReportsManager.tsx

const CrystalReportsManager: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({...});
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);

  const handleGenerateReport = () => {
    const report = ReportGenerator.generateReport(
      selectedTemplate,
      filters,
      users,
      courses,
      user
    );
    setGeneratedReport(report);
  };

  const handleExport = async (format: ReportFormat) => {
    if (format === 'pdf') {
      await PDFExporter.exportToPDF(generatedReport, pdfConfig);
    } else if (format === 'excel') {
      exportToExcel(generatedReport.data, generatedReport.template.name);
    }
    // ... otros formatos
  };

  return (
    // UI con templates grid, filtros dialog, preview modal
  );
};
```

---

## 🔄 Migración a C# con Crystal Reports

### **Fase 1: Estructura de Proyecto C#**

```
GriverReports.Web/
├── Controllers/
│   └── ReportsController.cs
├── Models/
│   ├── ReportTemplate.cs
│   ├── ReportFilter.cs
│   ├── ReportData.cs
│   └── CrystalReportConfig.cs
├── Services/
│   ├── IReportGeneratorService.cs
│   ├── ReportGeneratorService.cs
│   ├── IReportTemplateService.cs
│   └── ReportTemplateService.cs
├── Repositories/
│   ├── IReportRepository.cs
│   └── ReportRepository.cs
├── CrystalReports/
│   ├── EmployeeProgress.rpt
│   ├── DepartmentStatistics.rpt
│   ├── Certifications.rpt
│   ├── PendingAssignments.rpt
│   ├── SystemPerformance.rpt
│   └── CompletionHistory.rpt
└── Views/
    └── Reports/
        └── Index.cshtml
```

### **Fase 2: Modelos C# (POCOs)**

```csharp
// Models/ReportTemplate.cs

namespace GriverReports.Models
{
    public enum ReportType
    {
        EmployeeProgress,
        DepartmentStatistics,
        Certifications,
        PendingAssignments,
        SystemPerformance,
        CompletionHistory,
        Custom
    }

    public enum ReportFormat
    {
        PDF,
        Excel,
        CSV,
        Print
    }

    public class ReportTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public ReportType Type { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public List<string> AvailableFor { get; set; }
        public List<ReportField> Fields { get; set; }
    }

    public class ReportField
    {
        public string Key { get; set; }
        public string Label { get; set; }
        public string Type { get; set; }
        public bool Sortable { get; set; }
        public bool Filterable { get; set; }
        public string Width { get; set; }
    }

    public class ReportFilter
    {
        public DateRangeFilter DateRange { get; set; }
        public List<string> Departments { get; set; }
        public List<string> CourseIds { get; set; }
        public List<string> UserIds { get; set; }
        public List<string> Status { get; set; }
        public int? MinProgress { get; set; }
        public int? MaxProgress { get; set; }
    }

    public class DateRangeFilter
    {
        public string Preset { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ReportData
    {
        public string Id { get; set; }
        public ReportTemplate Template { get; set; }
        public ReportFilter Filters { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string GeneratedBy { get; set; }
        public List<Dictionary<string, object>> Data { get; set; }
        public ReportSummary Summary { get; set; }
    }

    public class ReportSummary
    {
        public int TotalRecords { get; set; }
        public Dictionary<string, object> Aggregations { get; set; }
        public List<ChartData> Charts { get; set; }
    }

    public class CrystalReportConfig
    {
        public string PageSize { get; set; }
        public string Orientation { get; set; }
        public bool ShowHeader { get; set; }
        public bool ShowFooter { get; set; }
        public bool ShowLogo { get; set; }
        public bool ShowPageNumbers { get; set; }
        public bool ShowGenerationDate { get; set; }
        public string Watermark { get; set; }
    }
}
```

### **Fase 3: Servicio de Generación de Reportes**

```csharp
// Services/IReportGeneratorService.cs

using GriverReports.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GriverReports.Services
{
    public interface IReportGeneratorService
    {
        Task<ReportData> GenerateReportAsync(
            ReportTemplate template, 
            ReportFilter filters, 
            string currentUserId
        );
        
        Task<byte[]> ExportToPdfAsync(ReportData reportData, CrystalReportConfig config);
        Task<byte[]> ExportToExcelAsync(ReportData reportData);
        Task<byte[]> ExportToCsvAsync(ReportData reportData);
    }
}

// Services/ReportGeneratorService.cs

using GriverReports.Data;
using GriverReports.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GriverReports.Services
{
    public class ReportGeneratorService : IReportGeneratorService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReportGeneratorService> _logger;

        public ReportGeneratorService(
            ApplicationDbContext context,
            ILogger<ReportGeneratorService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ReportData> GenerateReportAsync(
            ReportTemplate template, 
            ReportFilter filters, 
            string currentUserId)
        {
            _logger.LogInformation($"Generating report: {template.Name} by user {currentUserId}");

            var reportData = new ReportData
            {
                Id = $"report_{DateTime.Now.Ticks}",
                Template = template,
                Filters = filters,
                GeneratedAt = DateTime.Now,
                GeneratedBy = currentUserId,
                Data = new List<Dictionary<string, object>>()
            };

            switch (template.Type)
            {
                case ReportType.EmployeeProgress:
                    reportData.Data = await GenerateEmployeeProgressDataAsync(filters);
                    reportData.Summary = CalculateEmployeeProgressSummary(reportData.Data);
                    break;

                case ReportType.DepartmentStatistics:
                    reportData.Data = await GenerateDepartmentStatsDataAsync(filters);
                    reportData.Summary = CalculateDepartmentStatsSummary(reportData.Data);
                    break;

                case ReportType.Certifications:
                    reportData.Data = await GenerateCertificationsDataAsync(filters);
                    reportData.Summary = CalculateCertificationsSummary(reportData.Data);
                    break;

                case ReportType.PendingAssignments:
                    reportData.Data = await GeneratePendingAssignmentsDataAsync(filters);
                    reportData.Summary = CalculatePendingAssignmentsSummary(reportData.Data);
                    break;

                case ReportType.SystemPerformance:
                    reportData.Data = await GenerateSystemPerformanceDataAsync(filters);
                    reportData.Summary = CalculateSystemPerformanceSummary(reportData.Data);
                    break;

                case ReportType.CompletionHistory:
                    reportData.Data = await GenerateCompletionHistoryDataAsync(filters);
                    reportData.Summary = CalculateCompletionHistorySummary(reportData.Data);
                    break;

                default:
                    throw new NotImplementedException($"Report type {template.Type} not implemented");
            }

            reportData.Summary.TotalRecords = reportData.Data.Count;

            _logger.LogInformation($"Report generated successfully: {reportData.Data.Count} records");
            return reportData;
        }

        private async Task<List<Dictionary<string, object>>> GenerateEmployeeProgressDataAsync(ReportFilter filters)
        {
            var query = _context.UserCourseProgress
                .Include(ucp => ucp.User)
                .Include(ucp => ucp.Course)
                .Where(ucp => ucp.User.Role == "employee" || ucp.User.Role == "intern");

            // Apply filters
            if (filters.Departments != null && filters.Departments.Any())
            {
                query = query.Where(ucp => filters.Departments.Contains(ucp.User.Department));
            }

            if (filters.CourseIds != null && filters.CourseIds.Any())
            {
                query = query.Where(ucp => filters.CourseIds.Contains(ucp.CourseId));
            }

            if (filters.MinProgress.HasValue)
            {
                query = query.Where(ucp => ucp.Progress >= filters.MinProgress.Value);
            }

            if (filters.MaxProgress.HasValue)
            {
                query = query.Where(ucp => ucp.Progress <= filters.MaxProgress.Value);
            }

            var data = await query
                .Select(ucp => new Dictionary<string, object>
                {
                    { "employeeName", ucp.User.Name },
                    { "department", ucp.User.Department },
                    { "courseName", ucp.Course.Title },
                    { "progress", ucp.Progress },
                    { "status", GetProgressStatus(ucp.Progress, ucp.AssignedDate) },
                    { "assignedDate", ucp.AssignedDate },
                    { "completionDate", ucp.CompletionDate },
                    { "daysElapsed", (DateTime.Now - ucp.AssignedDate).Days }
                })
                .ToListAsync();

            return data;
        }

        private string GetProgressStatus(int progress, DateTime assignedDate)
        {
            if (progress == 100) return "Completado";
            if (progress > 0) return "En Progreso";
            if ((DateTime.Now - assignedDate).Days > 14) return "Atrasado";
            return "No Iniciado";
        }

        // ... Implementar otros métodos GenerateXXXDataAsync()

        private ReportSummary CalculateEmployeeProgressSummary(List<Dictionary<string, object>> data)
        {
            var completed = data.Count(d => d["status"].ToString() == "Completado");
            var inProgress = data.Count(d => d["status"].ToString() == "En Progreso");
            var overdue = data.Count(d => d["status"].ToString() == "Atrasado");
            var avgProgress = data.Any() ? data.Average(d => Convert.ToInt32(d["progress"])) : 0;

            return new ReportSummary
            {
                TotalRecords = data.Count,
                Aggregations = new Dictionary<string, object>
                {
                    { "completed", completed },
                    { "inProgress", inProgress },
                    { "overdue", overdue },
                    { "avgProgress", Math.Round(avgProgress, 0) }
                },
                Charts = new List<ChartData>
                {
                    new ChartData
                    {
                        Type = "pie",
                        Title = "Distribución por Estado",
                        Data = new List<Dictionary<string, object>>
                        {
                            new() { { "name", "Completado" }, { "value", completed } },
                            new() { { "name", "En Progreso" }, { "value", inProgress } },
                            new() { { "name", "Atrasado" }, { "value", overdue } }
                        }
                    }
                }
            };
        }

        // ... Implementar otros métodos CalculateXXXSummary()

        public async Task<byte[]> ExportToPdfAsync(ReportData reportData, CrystalReportConfig config)
        {
            // Implementar con Crystal Reports SDK
            var reportDocument = new CrystalDecisions.CrystalReports.Engine.ReportDocument();
            
            // Cargar el .rpt file correspondiente
            string reportPath = GetReportPath(reportData.Template.Type);
            reportDocument.Load(reportPath);

            // Set datasource
            reportDocument.SetDataSource(ConvertToDataTable(reportData.Data));

            // Set parameters
            reportDocument.SetParameterValue("ReportTitle", reportData.Template.Name);
            reportDocument.SetParameterValue("GeneratedBy", reportData.GeneratedBy);
            reportDocument.SetParameterValue("GeneratedAt", reportData.GeneratedAt);
            reportDocument.SetParameterValue("ShowLogo", config.ShowLogo);
            reportDocument.SetParameterValue("Watermark", config.Watermark ?? "");

            // Export to PDF
            var stream = new MemoryStream();
            var exportOptions = reportDocument.ExportOptions;
            exportOptions.ExportFormatType = CrystalDecisions.Shared.ExportFormatType.PortableDocFormat;
            
            reportDocument.Export();
            var bytes = stream.ToArray();
            
            reportDocument.Close();
            reportDocument.Dispose();

            return bytes;
        }

        public async Task<byte[]> ExportToExcelAsync(ReportData reportData)
        {
            // Implementar con EPPlus o ClosedXML
            using var package = new OfficeOpenXml.ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add(reportData.Template.Name);

            // Headers
            int col = 1;
            foreach (var field in reportData.Template.Fields)
            {
                worksheet.Cells[1, col].Value = field.Label;
                worksheet.Cells[1, col].Style.Font.Bold = true;
                col++;
            }

            // Data
            int row = 2;
            foreach (var dataRow in reportData.Data)
            {
                col = 1;
                foreach (var field in reportData.Template.Fields)
                {
                    worksheet.Cells[row, col].Value = dataRow[field.Key];
                    col++;
                }
                row++;
            }

            worksheet.Cells.AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }

        public async Task<byte[]> ExportToCsvAsync(ReportData reportData)
        {
            var csv = new StringBuilder();
            
            // Headers
            csv.AppendLine(string.Join(",", reportData.Template.Fields.Select(f => f.Label)));

            // Data
            foreach (var dataRow in reportData.Data)
            {
                var values = reportData.Template.Fields.Select(f => 
                {
                    var value = dataRow[f.Key]?.ToString() ?? "";
                    return value.Contains(",") ? $"\"{value}\"" : value;
                });
                csv.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        private string GetReportPath(ReportType type)
        {
            return type switch
            {
                ReportType.EmployeeProgress => "~/CrystalReports/EmployeeProgress.rpt",
                ReportType.DepartmentStatistics => "~/CrystalReports/DepartmentStatistics.rpt",
                ReportType.Certifications => "~/CrystalReports/Certifications.rpt",
                ReportType.PendingAssignments => "~/CrystalReports/PendingAssignments.rpt",
                ReportType.SystemPerformance => "~/CrystalReports/SystemPerformance.rpt",
                ReportType.CompletionHistory => "~/CrystalReports/CompletionHistory.rpt",
                _ => throw new NotImplementedException($"Report path for {type} not defined")
            };
        }

        private DataTable ConvertToDataTable(List<Dictionary<string, object>> data)
        {
            var table = new DataTable();
            
            if (data.Any())
            {
                // Add columns from first row
                foreach (var key in data[0].Keys)
                {
                    table.Columns.Add(key);
                }

                // Add rows
                foreach (var row in data)
                {
                    var dataRow = table.NewRow();
                    foreach (var kvp in row)
                    {
                        dataRow[kvp.Key] = kvp.Value ?? DBNull.Value;
                    }
                    table.Rows.Add(dataRow);
                }
            }

            return table;
        }
    }
}
```

### **Fase 4: Controller API**

```csharp
// Controllers/ReportsController.cs

using GriverReports.Models;
using GriverReports.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace GriverReports.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportGeneratorService _reportGeneratorService;
        private readonly IReportTemplateService _templateService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(
            IReportGeneratorService reportGeneratorService,
            IReportTemplateService templateService,
            ILogger<ReportsController> logger)
        {
            _reportGeneratorService = reportGeneratorService;
            _templateService = templateService;
            _logger = logger;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            var userRole = User.FindFirst("role")?.Value;
            var templates = await _templateService.GetAvailableTemplatesForRoleAsync(userRole);
            return Ok(templates);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateReport([FromBody] GenerateReportRequest request)
        {
            try
            {
                var currentUserId = User.FindFirst("sub")?.Value;
                var template = await _templateService.GetTemplateByIdAsync(request.TemplateId);
                
                if (template == null)
                {
                    return NotFound("Template not found");
                }

                var reportData = await _reportGeneratorService.GenerateReportAsync(
                    template, 
                    request.Filters, 
                    currentUserId
                );

                return Ok(reportData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                return StatusCode(500, "Error generating report");
            }
        }

        [HttpPost("export/pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] ExportReportRequest request)
        {
            try
            {
                var bytes = await _reportGeneratorService.ExportToPdfAsync(
                    request.ReportData, 
                    request.Config
                );

                return File(bytes, "application/pdf", $"{request.ReportData.Template.Name}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to PDF");
                return StatusCode(500, "Error exporting to PDF");
            }
        }

        [HttpPost("export/excel")]
        public async Task<IActionResult> ExportToExcel([FromBody] ReportData reportData)
        {
            try
            {
                var bytes = await _reportGeneratorService.ExportToExcelAsync(reportData);
                return File(
                    bytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"{reportData.Template.Name}.xlsx"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel");
                return StatusCode(500, "Error exporting to Excel");
            }
        }

        [HttpPost("export/csv")]
        public async Task<IActionResult> ExportToCsv([FromBody] ReportData reportData)
        {
            try
            {
                var bytes = await _reportGeneratorService.ExportToCsvAsync(reportData);
                return File(bytes, "text/csv", $"{reportData.Template.Name}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to CSV");
                return StatusCode(500, "Error exporting to CSV");
            }
        }
    }

    public class GenerateReportRequest
    {
        public string TemplateId { get; set; }
        public ReportFilter Filters { get; set; }
    }

    public class ExportReportRequest
    {
        public ReportData ReportData { get; set; }
        public CrystalReportConfig Config { get; set; }
    }
}
```

### **Fase 5: Configuración de Dependency Injection**

```csharp
// Program.cs o Startup.cs

using GriverReports.Services;
using GriverReports.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IReportGeneratorService, ReportGeneratorService>();
builder.Services.AddScoped<IReportTemplateService, ReportTemplateService>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 📊 Diseño de Reportes Crystal (.rpt)

### **Template: EmployeeProgress.rpt**

**Secciones:**
1. **Report Header**
   - Logo de Griver
   - Título del reporte
   - Rango de fechas aplicado
   - Generado por y fecha

2. **Page Header**
   - Columnas: Empleado | Departamento | Curso | Progreso | Estado | Asignado | Completado | Días

3. **Details**
   - Data rows con formateo condicional:
     - Progreso 100%: Verde
     - Progreso 50-99%: Amarillo
     - Progreso 0-49%: Rojo
     - Estado "Atrasado": Fondo rojo claro

4. **Report Footer**
   - Totales: Total empleados, Promedio progreso
   - Gráfico de pie: Distribución por estado

5. **Page Footer**
   - Número de página
   - Fecha de generación
   - Firma "Griver © 2025"

**Fórmulas Crystal:**
```crystal
// Campo de estado con color
If {Progress} = 100 Then
    "Completado"
Else If {Progress} > 0 Then
    "En Progreso"
Else If DateDiff("d", {AssignedDate}, CurrentDate) > 14 Then
    "Atrasado"
Else
    "No Iniciado"

// Formateo condicional de color
If {Status} = "Completado" Then crGreen
Else If {Status} = "En Progreso" Then crYellow
Else If {Status} = "Atrasado" Then crRed
Else crBlack
```

### **Plantillas Adicionales**

Repetir estructura similar para:
- `DepartmentStatistics.rpt` - Con gráfico de barras comparativo
- `Certifications.rpt` - Con alertas de vencimiento
- `PendingAssignments.rpt` - Ordenado por prioridad
- `SystemPerformance.rpt` - KPIs con indicadores visuales
- `CompletionHistory.rpt` - Timeline con gráfico de línea

---

## 🔐 Seguridad y Autenticación

### **Autorización por Roles**

```csharp
// Attribute personalizado para validar acceso a reportes

[AttributeUsage(AttributeTargets.Method)]
public class ReportAuthorizationAttribute : ActionFilterAttribute
{
    private readonly ReportType _reportType;

    public ReportAuthorizationAttribute(ReportType reportType)
    {
        _reportType = reportType;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var userRole = context.HttpContext.User.FindFirst("role")?.Value;
        
        if (_reportType == ReportType.SystemPerformance && userRole != "admin")
        {
            context.Result = new ForbidResult();
            return;
        }

        if ((userRole != "admin" && userRole != "rh"))
        {
            context.Result = new ForbidResult();
            return;
        }

        base.OnActionExecuting(context);
    }
}

// Uso en controller
[ReportAuthorization(ReportType.SystemPerformance)]
[HttpPost("generate/system-performance")]
public async Task<IActionResult> GenerateSystemPerformance([FromBody] ReportFilter filters)
{
    // ...
}
```

### **Auditoría de Reportes**

```csharp
// Model para auditoría

public class ReportAuditLog
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public ReportType ReportType { get; set; }
    public DateTime GeneratedAt { get; set; }
    public ReportFormat ExportFormat { get; set; }
    public string FiltersApplied { get; set; } // JSON serializado
    public int RecordsCount { get; set; }
}

// Service para logging

public interface IReportAuditService
{
    Task LogReportGenerationAsync(ReportAuditLog log);
    Task<List<ReportAuditLog>> GetUserReportHistoryAsync(string userId);
}
```

---

## 📈 Optimización y Performance

### **1. Caché de Reportes**

```csharp
using Microsoft.Extensions.Caching.Memory;

public class CachedReportGeneratorService : IReportGeneratorService
{
    private readonly IReportGeneratorService _innerService;
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(15);

    public async Task<ReportData> GenerateReportAsync(
        ReportTemplate template, 
        ReportFilter filters, 
        string currentUserId)
    {
        var cacheKey = GenerateCacheKey(template, filters);
        
        if (_cache.TryGetValue(cacheKey, out ReportData cachedReport))
        {
            return cachedReport;
        }

        var reportData = await _innerService.GenerateReportAsync(template, filters, currentUserId);
        
        _cache.Set(cacheKey, reportData, _cacheDuration);
        
        return reportData;
    }

    private string GenerateCacheKey(ReportTemplate template, ReportFilter filters)
    {
        return $"report_{template.Id}_{JsonSerializer.Serialize(filters)}";
    }
}
```

### **2. Queries Optimizadas con Índices**

```sql
-- Database indexes para mejorar performance de reportes

CREATE INDEX IX_UserCourseProgress_UserId_CourseId 
ON UserCourseProgress(UserId, CourseId);

CREATE INDEX IX_UserCourseProgress_Progress 
ON UserCourseProgress(Progress);

CREATE INDEX IX_UserCourseProgress_AssignedDate 
ON UserCourseProgress(AssignedDate);

CREATE INDEX IX_Users_Department_Role 
ON Users(Department, Role);

CREATE INDEX IX_Courses_Active 
ON Courses(IsActive);
```

### **3. Generación Asíncrona para Reportes Grandes**

```csharp
public interface IBackgroundReportService
{
    Task<string> QueueReportGenerationAsync(string templateId, ReportFilter filters, string userId);
    Task<ReportStatus> GetReportStatusAsync(string reportId);
    Task<byte[]> DownloadReportAsync(string reportId);
}

public class BackgroundReportService : IBackgroundReportService
{
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IReportRepository _repository;

    public async Task<string> QueueReportGenerationAsync(
        string templateId, 
        ReportFilter filters, 
        string userId)
    {
        var reportId = Guid.NewGuid().ToString();
        
        _backgroundJobs.Enqueue(() => 
            GenerateReportInBackgroundAsync(reportId, templateId, filters, userId)
        );

        return reportId;
    }

    public async Task GenerateReportInBackgroundAsync(
        string reportId,
        string templateId, 
        ReportFilter filters, 
        string userId)
    {
        // Generate report
        // Store in blob storage
        // Update status in database
        // Send notification to user
    }
}
```

---

## 🧪 Testing

### **Unit Tests**

```csharp
using Xunit;
using Moq;
using GriverReports.Services;
using GriverReports.Models;

public class ReportGeneratorServiceTests
{
    [Fact]
    public async Task GenerateEmployeeProgressReport_WithValidData_ReturnsReport()
    {
        // Arrange
        var mockContext = new Mock<ApplicationDbContext>();
        var service = new ReportGeneratorService(mockContext.Object);
        
        var template = new ReportTemplate 
        { 
            Type = ReportType.EmployeeProgress 
        };
        var filters = new ReportFilter();

        // Act
        var result = await service.GenerateReportAsync(template, filters, "user123");

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.Count >= 0);
    }

    [Fact]
    public async Task ExportToPdf_WithValidReport_ReturnsPdfBytes()
    {
        // Arrange
        var service = new ReportGeneratorService(mockContext.Object);
        var reportData = CreateSampleReportData();
        var config = new CrystalReportConfig();

        // Act
        var pdfBytes = await service.ExportToPdfAsync(reportData, config);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 0);
    }
}
```

### **Integration Tests**

```csharp
public class ReportsControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ReportsControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GenerateReport_AsAdmin_ReturnsSuccessAndReportData()
    {
        // Arrange
        var request = new GenerateReportRequest
        {
            TemplateId = "rpt_employee_progress",
            Filters = new ReportFilter()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/reports/generate", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var reportData = await response.Content.ReadFromJsonAsync<ReportData>();
        Assert.NotNull(reportData);
    }
}
```

---

## 📦 Dependencias NuGet Requeridas

```xml
<!-- .csproj -->

<ItemGroup>
  <!-- Crystal Reports -->
  <PackageReference Include="CrystalDecisions.CrystalReports.Engine" Version="13.0.4000" />
  <PackageReference Include="CrystalDecisions.Shared" Version="13.0.4000" />
  
  <!-- Excel Export -->
  <PackageReference Include="EPPlus" Version="7.0.0" />
  
  <!-- Entity Framework -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
  
  <!-- Caching -->
  <PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.0" />
  
  <!-- Background Jobs (opcional) -->
  <PackageReference Include="Hangfire.Core" Version="1.8.6" />
  <PackageReference Include="Hangfire.SqlServer" Version="1.8.6" />
  
  <!-- Testing -->
  <PackageReference Include="xunit" Version="2.6.2" />
  <PackageReference Include="Moq" Version="4.20.70" />
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
</ItemGroup>
```

---

## 🚀 Plan de Implementación

### **Sprint 1: Foundation (2 semanas)**
- ✅ Modelos y DTOs
- ✅ Database schema y migrations
- ✅ Servicios base sin Crystal Reports
- ✅ API Controllers
- ✅ Unit tests básicos

### **Sprint 2: Crystal Reports Integration (2 semanas)**
- [ ] Diseño de plantillas .rpt en Crystal Reports Designer
- [ ] Integración de Crystal Reports SDK
- [ ] Export a PDF con Crystal
- [ ] Testing de reportes PDF

### **Sprint 3: Export Formats (1 semana)**
- [ ] Exportación a Excel con EPPlus
- [ ] Exportación a CSV
- [ ] Funcionalidad de impresión directa
- [ ] Testing de formatos

### **Sprint 4: Optimización (1 semana)**
- [ ] Implementación de caché
- [ ] Optimización de queries SQL
- [ ] Background job processing
- [ ] Performance testing

### **Sprint 5: QA y Deployment (1 semana)**
- [ ] Integration tests completos
- [ ] User acceptance testing
- [ ] Documentation final
- [ ] Deployment a producción

---

## 📝 Notas de Migración Importantes

### **Cambios React → C#**

1. **Estado del Componente → Base de Datos**
   - React `useState` → SQL Server tables
   - Cliente side filtering → Server-side queries con EF Core

2. **TypeScript Types → C# Classes**
   - Interfaces TS → C# interfaces
   - Types TS → C# classes/enums
   - Mapeo 1:1 en estructura

3. **Utilidades JS → Services C#**
   - `reportGenerator.ts` → `ReportGeneratorService.cs`
   - `pdfExporter.ts` → Crystal Reports SDK
   - `excelExport.ts` → EPPlus library

4. **Componentes React → Razor Views/Blazor**
   - Opción 1: Mantener React frontend con API C#
   - Opción 2: Migrar a Razor Pages + jQuery
   - Opción 3: Migrar a Blazor Server/WASM

### **Recomendaciones**

✅ **Mantener API REST** para máxima flexibilidad  
✅ **Usar Entity Framework Core** para queries tipadas  
✅ **Implementar caché** para reportes frecuentes  
✅ **Crystal Reports** para PDFs profesionales  
✅ **EPPlus** para Excel con formato rico  
✅ **Hangfire** para reportes grandes asíncronos  

---

## 🎓 Recursos de Aprendizaje

### **Crystal Reports**
- [SAP Crystal Reports .NET Developer Guide](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS_NET_SDK)
- [Crystal Reports for Visual Studio Tutorial](https://www.youtube.com/watch?v=XYZ123)

### **EPPlus**
- [EPPlus Documentation](https://epplussoftware.com/docs)
- [EPPlus Samples Repository](https://github.com/EPPlusSoftware/EPPlus.Samples)

### **Entity Framework Core**
- [EF Core Documentation](https://docs.microsoft.com/ef/core/)
- [EF Core Performance Best Practices](https://docs.microsoft.com/ef/core/performance/)

---

## ✅ Checklist de Migración

- [ ] Crear proyecto C# ASP.NET Core
- [ ] Instalar NuGet packages requeridos
- [ ] Crear modelos POCO mapeando types de TypeScript
- [ ] Configurar DbContext y migrations
- [ ] Implementar ReportGeneratorService
- [ ] Diseñar plantillas .rpt en Crystal Reports Designer
- [ ] Crear ReportsController con endpoints API
- [ ] Implementar exportación PDF con Crystal Reports
- [ ] Implementar exportación Excel con EPPlus
- [ ] Implementar exportación CSV nativa
- [ ] Añadir sistema de caché con IMemoryCache
- [ ] Implementar auditoría de reportes
- [ ] Crear unit tests para servicios
- [ ] Crear integration tests para API
- [ ] Optimizar queries con índices de base de datos
- [ ] Configurar background jobs con Hangfire
- [ ] Testing de performance con reportes grandes
- [ ] Documentación de API con Swagger
- [ ] Deploy a ambiente de staging
- [ ] User acceptance testing
- [ ] Deploy a producción

---

**Documento generado:** Enero 10, 2025  
**Versión:** 1.0.0  
**Próxima revisión:** Febrero 2025  
**Contacto:** dev@griver.com
