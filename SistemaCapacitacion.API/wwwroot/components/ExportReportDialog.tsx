import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Users, 
  Building, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useExcelExport } from '../utils/excelExport';
import { toast } from 'sonner@2.0.3';

interface ExportReportDialogProps {
  courseId?: string;
  courseName?: string;
  enrollments?: any[];
  allCoursesData?: any[];
  trigger?: React.ReactNode;
}

const DEPARTMENTS = [
  { id: 'all', name: 'Todos los Departamentos' },
  { id: 'development', name: 'Desarrollo de Software' },
  { id: 'design', name: 'Diseño y UX' },
  { id: 'marketing', name: 'Marketing y Comunicación' },
  { id: 'sales', name: 'Ventas' },
  { id: 'hr', name: 'Recursos Humanos' },
  { id: 'finance', name: 'Finanzas y Administración' },
  { id: 'operations', name: 'Operaciones' },
  { id: 'interns', name: 'Becarios' },
];

const STATUS_OPTIONS = [
  { id: 'all', name: 'Todos los Estados', icon: Users },
  { id: 'completed', name: 'Completados', icon: CheckCircle },
  { id: 'in-progress', name: 'En Progreso', icon: Clock },
  { id: 'not-started', name: 'No Iniciados', icon: AlertCircle },
];

export function ExportReportDialog({ 
  courseId, 
  courseName, 
  enrollments = [], 
  allCoursesData = [],
  trigger 
}: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<'single-course' | 'all-courses' | 'department-stats'>('single-course');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { exportCourseUsers, exportCoursesReport, exportDepartmentStats } = useExcelExport();

  // Calcular estadísticas para mostrar en la preview
  const getFilteredStats = () => {
    if (exportType === 'single-course' && enrollments.length > 0) {
      let filtered = enrollments;
      
      if (selectedDepartment !== 'all') {
        filtered = filtered.filter(e => e.user?.department === selectedDepartment);
      }
      
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(e => {
          switch (selectedStatus) {
            case 'completed': return e.completedAt;
            case 'in-progress': return e.startedAt && !e.completedAt;
            case 'not-started': return !e.startedAt;
            default: return true;
          }
        });
      }

      return {
        total: filtered.length,
        completed: filtered.filter(e => e.completedAt).length,
        inProgress: filtered.filter(e => e.startedAt && !e.completedAt).length,
        notStarted: filtered.filter(e => !e.startedAt).length,
      };
    }
    
    return { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let result;
      
      switch (exportType) {
        case 'single-course':
          if (!courseId || !courseName) {
            toast.error('Información del curso no disponible');
            return;
          }
          
          result = await exportCourseUsers(courseId, courseName, enrollments, {
            includePersonalData,
            filterByDepartment: selectedDepartment,
            filterByStatus: selectedStatus,
          });
          break;
          
        case 'all-courses':
          result = await exportCoursesReport(allCoursesData, {
            includePersonalData,
            filterByDepartment: selectedDepartment,
          });
          break;
          
        case 'department-stats':
          // Aquí calcularías las estadísticas por departamento
          const departmentStats = DEPARTMENTS.filter(d => d.id !== 'all').map(dept => ({
            department: dept.name,
            totalUsers: Math.floor(Math.random() * 50) + 10, // Datos de ejemplo
            enrolledUsers: Math.floor(Math.random() * 40) + 5,
            completedCourses: Math.floor(Math.random() * 30) + 2,
            averageProgress: Math.floor(Math.random() * 40) + 60,
            mostPopularCourse: 'Seguridad Laboral Básica',
          }));
          
          result = await exportDepartmentStats(departmentStats);
          break;
          
        default:
          toast.error('Tipo de exportación no válido');
          return;
      }
      
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error inesperado al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const stats = getFilteredStats();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Reporte
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar Reporte a Excel
          </DialogTitle>
          <DialogDescription>
            Genera y descarga reportes detallados en formato Excel con filtros personalizados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de reporte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={exportType}
                onValueChange={(value: 'single-course' | 'all-courses' | 'department-stats') => setExportType(value)}
                className="space-y-3"
              >
                {courseId && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                    <RadioGroupItem value="single-course" id="single-course" />
                    <Label htmlFor="single-course" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Usuarios de Curso Específico</div>
                        <div className="text-sm text-muted-foreground">
                          Lista detallada de usuarios inscritos en "{courseName}"
                        </div>
                      </div>
                    </Label>
                    <Badge variant="secondary">{enrollments.length} usuarios</Badge>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                  <RadioGroupItem value="all-courses" id="all-courses" />
                  <Label htmlFor="all-courses" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Reporte Completo de Cursos</div>
                      <div className="text-sm text-muted-foreground">
                        Resumen de todos los cursos y sus usuarios
                      </div>
                    </div>
                  </Label>
                  <Badge variant="secondary">{allCoursesData.length} cursos</Badge>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                  <RadioGroupItem value="department-stats" id="department-stats" />
                  <Label htmlFor="department-stats" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Estadísticas por Departamento</div>
                      <div className="text-sm text-muted-foreground">
                        Métricas de participación y progreso por área
                      </div>
                    </div>
                  </Label>
                  <Badge variant="secondary">{DEPARTMENTS.length - 1} departamentos</Badge>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros de Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtro por departamento */}
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado (solo para curso específico) */}
              {exportType === 'single-course' && (
                <div className="space-y-2">
                  <Label>Estado de Participación</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => {
                        const IconComponent = status.icon;
                        return (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {status.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Opciones de datos */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Incluir Datos Personales</Label>
                  <p className="text-sm text-muted-foreground">
                    Email y teléfono de los usuarios
                  </p>
                </div>
                <Switch
                  checked={includePersonalData}
                  onCheckedChange={setIncludePersonalData}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vista previa de estadísticas */}
          {exportType === 'single-course' && stats.total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Vista Previa
                </CardTitle>
                <CardDescription>
                  Datos que se incluirán en la exportación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-sm text-muted-foreground">En Progreso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
                    <div className="text-sm text-muted-foreground">No Iniciados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || (exportType === 'single-course' && stats.total === 0)}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}