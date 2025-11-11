// components/CrystalReportsManager.tsx
// Componente principal del sistema de reportes estilo Crystal Reports
// MIGRACIÓN C#: Formulario WPF/WinForms con Crystal Reports Viewer integrado

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Building2,
  BookOpen,
  Printer,
  Eye,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { useAuth } from './AuthContext';
import { 
  ReportTemplate, 
  ReportType, 
  ReportFilter, 
  ReportData,
  DateRangePreset,
  ReportFormat,
  CrystalReportConfig
} from '../types/reports';
import { getAvailableTemplatesForRole } from '../utils/reportTemplates';
import { ReportGenerator } from '../utils/reportGenerator';
import { PDFExporter } from '../utils/pdfExporter';
import { exportToExcel } from '../utils/excelExport';

const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Building2,
  Award,
  AlertCircle,
  Activity,
  Calendar,
  FileText
};

const CrystalReportsManager: React.FC = () => {
  const { user, users, courses } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Report Filters State
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      preset: 'this_month'
    },
    departments: [],
    courseIds: [],
    userIds: [],
    status: []
  });

  // PDF Config State
  const [pdfConfig, setPdfConfig] = useState<CrystalReportConfig>({
    pageSize: 'letter',
    orientation: 'portrait',
    showHeader: true,
    showFooter: true,
    showLogo: true,
    showPageNumbers: true,
    showGenerationDate: true
  });

  // Get available templates based on user role
  const availableTemplates = useMemo(() => {
    if (!user) return [];
    return getAvailableTemplatesForRole(user.role);
  }, [user]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    if (!users || users.length === 0) return [];
    return [...new Set(users.map(u => u.department))].filter(Boolean);
  }, [users]);

  const handleGenerateReport = () => {
    if (!selectedTemplate || !user || !users || !courses) return;

    setIsGenerating(true);
    
    // Simulate async generation
    setTimeout(() => {
      try {
        const report = ReportGenerator.generateReport(
          selectedTemplate,
          filters,
          users,
          courses,
          user
        );
        
        setGeneratedReport(report);
        setShowPreviewDialog(true);
        toast.success('Reporte generado exitosamente', {
          description: `${report.data.length} registros encontrados`
        });
      } catch (error) {
        toast.error('Error al generar reporte', {
          description: 'Por favor intente nuevamente'
        });
      } finally {
        setIsGenerating(false);
        setShowFilterDialog(false);
      }
    }, 1000);
  };

  const handleExport = async (format: ReportFormat) => {
    if (!generatedReport) return;

    try {
      toast.loading(`Exportando reporte como ${format.toUpperCase()}...`);
      
      switch (format) {
        case 'pdf':
          await PDFExporter.exportToPDF(generatedReport, pdfConfig);
          toast.success('PDF generado exitosamente');
          break;
        
        case 'excel':
          const excelData = generatedReport.data.map(row => {
            const formatted: Record<string, any> = {};
            generatedReport.template.fields.forEach(field => {
              formatted[field.label] = row[field.key];
            });
            return formatted;
          });
          exportToExcel(excelData, generatedReport.template.name);
          toast.success('Excel generado exitosamente');
          break;
        
        case 'csv':
          downloadCSV(generatedReport);
          toast.success('CSV generado exitosamente');
          break;
        
        case 'print':
          await PDFExporter.printReport(generatedReport, pdfConfig);
          toast.success('Abriendo vista de impresión');
          break;
      }
    } catch (error) {
      toast.error('Error al exportar reporte');
    }
  };

  const downloadCSV = (report: ReportData) => {
    const headers = report.template.fields.map(f => f.label).join(',');
    const rows = report.data.map(row => 
      report.template.fields.map(field => {
        const value = row[field.key];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.template.name}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openFilterDialog = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFilters({
      dateRange: { preset: 'this_month' },
      departments: [],
      courseIds: [],
      userIds: [],
      status: []
    });
    setShowFilterDialog(true);
  };

  // Validar que los datos necesarios estén disponibles
  if (!user || users === undefined || courses === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Cargando sistema de reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl">Reportes Crystal Reports</h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Sistema avanzado de generación de reportes con exportación a PDF, Excel y CSV
              </p>
            </div>
          </div>
        </div>
        
        {generatedReport && (
          <Badge variant="outline" className="gap-2 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5" />
            Último reporte: {new Date(generatedReport.generatedAt).toLocaleDateString('es-MX')}
          </Badge>
        )}
      </div>

      {/* Templates Grid mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {availableTemplates.map(template => {
          const IconComponent = ICON_MAP[template.icon] || FileText;
          
          return (
            <Card 
              key={template.id} 
              className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-background to-muted/20"
            >
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <CardHeader className="relative">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {template.availableFor.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs px-2 py-0.5">
                        {role === 'admin' ? 'Admin' : 'RH'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>{template.fields.length} campos de datos</span>
                </div>

                <Button 
                  onClick={() => openFilterDialog(template)}
                  className="w-full gap-2 group-hover:bg-primary group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  Generar Reporte
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports Section */}
      {generatedReport && (
        <Card className="mt-6">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Último Reporte Generado</CardTitle>
                <CardDescription>
                  {generatedReport.template.name} - {new Date(generatedReport.generatedAt).toLocaleString('es-MX')}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreviewDialog(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Reporte
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Filter Dialog mejorado */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Configurar Reporte</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedTemplate?.name} - Seleccione los filtros para generar el reporte
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Date Range Filter mejorado */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Rango de Fechas
              </Label>
              <Select 
                value={filters.dateRange?.preset}
                onValueChange={(value) => setFilters({
                  ...filters,
                  dateRange: { preset: value as DateRangePreset }
                })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">📅 Hoy</SelectItem>
                  <SelectItem value="this_week">📆 Esta Semana</SelectItem>
                  <SelectItem value="this_month">📊 Este Mes</SelectItem>
                  <SelectItem value="last_month">⏮️ Mes Anterior</SelectItem>
                  <SelectItem value="this_quarter">📈 Este Trimestre</SelectItem>
                  <SelectItem value="this_year">🗓️ Este Año</SelectItem>
                  <SelectItem value="custom">⚙️ Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter mejorado */}
            {selectedTemplate?.type !== 'system_performance' && departments.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Departamentos
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.departments?.length || 0} seleccionados
                  </Badge>
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-36 overflow-y-auto border-2 rounded-lg p-4 bg-muted/20">
                  {departments.map(dept => (
                    <div key={dept} className="flex items-center space-x-2.5">
                      <Checkbox 
                        id={`dept-${dept}`}
                        checked={filters.departments?.includes(dept)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({
                              ...filters,
                              departments: [...(filters.departments || []), dept]
                            });
                          } else {
                            setFilters({
                              ...filters,
                              departments: filters.departments?.filter(d => d !== dept)
                            });
                          }
                        }}
                        className="border-2"
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer font-medium">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Filter mejorado */}
            {selectedTemplate?.type !== 'system_performance' && courses.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Filtrar por Cursos
                  <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                </Label>
                <Select 
                  value={filters.courseIds?.[0] || 'all'}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      courseIds: value === 'all' ? [] : [value]
                    });
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Todos los cursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        📚 Todos los cursos
                      </span>
                    </SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        <span className="flex items-center gap-2">
                          📖 {course.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator className="my-4" />

            {/* Actions mejoradas */}
            <div className="flex items-center justify-between pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfigDialog(true)}
                className="gap-2 hover:bg-primary/5"
              >
                <FileText className="h-4 w-4" />
                Configuración PDF
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilterDialog(false)}
                  className="min-w-24"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="gap-2 min-w-40 shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Config Dialog mejorado */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Configuración de Exportación PDF</DialogTitle>
                <DialogDescription className="mt-1">
                  Personalice el formato y apariencia del documento
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Configuración de página */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                📄 Configuración de Página
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tamaño de Página</Label>
                  <Select 
                    value={pdfConfig.pageSize}
                    onValueChange={(value: any) => setPdfConfig({ ...pdfConfig, pageSize: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">📄 Carta (8.5" × 11")</SelectItem>
                      <SelectItem value="a4">📄 A4 (210 × 297 mm)</SelectItem>
                      <SelectItem value="legal">📄 Legal (8.5" × 14")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Orientación</Label>
                  <Select 
                    value={pdfConfig.orientation}
                    onValueChange={(value: any) => setPdfConfig({ ...pdfConfig, orientation: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">📱 Vertical (Portrait)</SelectItem>
                      <SelectItem value="landscape">🖥️ Horizontal (Landscape)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Elementos del documento */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                🎨 Elementos del Documento
              </h4>
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors">
                  <Checkbox 
                    id="show-header"
                    checked={pdfConfig.showHeader}
                    onCheckedChange={(checked) => setPdfConfig({ ...pdfConfig, showHeader: !!checked })}
                    className="border-2"
                  />
                  <label htmlFor="show-header" className="text-sm cursor-pointer font-medium flex-1">
                    Mostrar encabezado con información del reporte
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors">
                  <Checkbox 
                    id="show-footer"
                    checked={pdfConfig.showFooter}
                    onCheckedChange={(checked) => setPdfConfig({ ...pdfConfig, showFooter: !!checked })}
                    className="border-2"
                  />
                  <label htmlFor="show-footer" className="text-sm cursor-pointer font-medium flex-1">
                    Mostrar pie de página con detalles
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors">
                  <Checkbox 
                    id="show-logo"
                    checked={pdfConfig.showLogo}
                    onCheckedChange={(checked) => setPdfConfig({ ...pdfConfig, showLogo: !!checked })}
                    className="border-2"
                  />
                  <label htmlFor="show-logo" className="text-sm cursor-pointer font-medium flex-1">
                    Incluir logo corporativo de Griver
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors">
                  <Checkbox 
                    id="show-pages"
                    checked={pdfConfig.showPageNumbers}
                    onCheckedChange={(checked) => setPdfConfig({ ...pdfConfig, showPageNumbers: !!checked })}
                    className="border-2"
                  />
                  <label htmlFor="show-pages" className="text-sm cursor-pointer font-medium flex-1">
                    Numerar páginas automáticamente
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Marca de agua */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                💧 Marca de Agua
              </h4>
              <div className="space-y-2">
                <Label htmlFor="watermark" className="text-sm">
                  Texto de marca de agua (Opcional)
                </Label>
                <Input 
                  id="watermark"
                  placeholder="Ej: CONFIDENCIAL, BORRADOR, etc."
                  value={pdfConfig.watermark || ''}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, watermark: e.target.value || undefined })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  El texto aparecerá diagonalmente en todas las páginas
                </p>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPdfConfig({
                    pageSize: 'letter',
                    orientation: 'portrait',
                    showHeader: true,
                    showFooter: true,
                    showLogo: true,
                    showPageNumbers: true,
                    showGenerationDate: true
                  });
                }}
                className="gap-2"
              >
                Restablecer
              </Button>
              <Button 
                onClick={() => setShowConfigDialog(false)}
                className="gap-2 min-w-28"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog mejorado */}
      {generatedReport && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-7xl max-h-[92vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    {generatedReport.template.name}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Generado: {new Date(generatedReport.generatedAt).toLocaleString('es-MX')}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Por: {generatedReport.generatedBy}
                    </span>
                  </DialogDescription>
                </div>

                {/* Export Buttons destacados */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('pdf')}
                    className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('excel')}
                    className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  >
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleExport('print')}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto flex-1 py-4">
              {/* Summary mejorado */}
              {generatedReport.summary && (
                <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-2 border-primary/10 p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Resumen
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Registros</p>
                      <p className="text-3xl font-bold text-primary">{generatedReport.summary.totalRecords}</p>
                    </div>
                    {Object.entries(generatedReport.summary.aggregations).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-3xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métricas adicionales */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Registros</p>
                        <p className="text-2xl font-bold mt-1">{generatedReport.data.length}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Campos</p>
                        <p className="text-2xl font-bold mt-1">{generatedReport.template.fields.length}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="text-sm font-semibold mt-1 text-green-600">Completado</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <Activity className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table mejorada */}
              <div className="border-2 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Datos del Reporte
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-[400px] relative">
                  <table className="w-full">
                    <thead className="bg-muted/80 sticky top-0 z-10 backdrop-blur-sm">
                      <tr className="border-b-2">
                        {generatedReport.template.fields.map(field => (
                          <th key={field.key} className="px-4 py-3.5 text-left font-semibold text-sm whitespace-nowrap">
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {generatedReport.data.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-primary/5 transition-colors group"
                        >
                          {generatedReport.template.fields.map(field => {
                            let value = row[field.key];
                            if (typeof value === 'number' && field.type === 'percentage') {
                              value = `${value}%`;
                            }
                            
                            return (
                              <td key={field.key} className="px-4 py-3.5 text-sm">
                                {field.type === 'status' || field.type === 'badge' ? (
                                  <Badge 
                                    variant={value === 'Positivo' || value === 'Completado' ? 'default' : 'secondary'}
                                    className="shadow-sm"
                                  >
                                    {value || 'N/A'}
                                  </Badge>
                                ) : field.type === 'percentage' ? (
                                  <span className="font-medium text-primary">{value || 'N/A'}</span>
                                ) : (
                                  <span className="text-foreground/90">{value || 'N/A'}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CrystalReportsManager;

// MIGRACIÓN C#:
// - Crear formulario WinForms/WPF CrystalReportsManagerForm
// - Integrar Crystal Reports Viewer control
// - Implementar ReportController con endpoints API
// - Añadir autenticación y autorización por roles
// - Implementar caché de reportes en Redis/MemoryCache
// - Añadir logging de generación de reportes para auditoría
