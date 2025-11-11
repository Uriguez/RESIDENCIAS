import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { CourseForm } from './forms/CourseForm';
import { ExportReportDialog } from './ExportReportDialog';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  category: string;
  enrolledStudents: number;
  completionRate: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  targetDepartments?: string[];
  enrollments?: any[];
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Seguridad Laboral Básica',
    description: 'Fundamentos de seguridad en el lugar de trabajo para empleados de Griver',
    duration: 120,
    difficulty: 'Básico',
    category: 'Seguridad',
    enrolledStudents: 95,
    completionRate: 87.5,
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Cultura Organizacional Griver',
    description: 'Introducción a los valores y cultura empresarial de Griver',
    duration: 90,
    difficulty: 'Básico',
    category: 'Cultura',
    enrolledStudents: 78,
    completionRate: 92.3,
    status: 'active',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Procedimientos de Emergencia',
    description: 'Protocolos de actuación en situaciones de emergencia',
    duration: 150,
    difficulty: 'Intermedio',
    category: 'Seguridad',
    enrolledStudents: 62,
    completionRate: 78.2,
    status: 'active',
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Desarrollo Profesional',
    description: 'Habilidades de crecimiento y desarrollo profesional continuo',
    duration: 200,
    difficulty: 'Avanzado',
    category: 'Desarrollo',
    enrolledStudents: 45,
    completionRate: 71.1,
    status: 'draft',
    createdAt: '2024-02-01'
  }
];

interface CourseCardProps {
  course: Course;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onExport: (course: Course) => void;
}

function CourseCard({ course, onView, onEdit, onDelete, onExport }: CourseCardProps) {
  const getDifficultyColor = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'Básico': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {course.category}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getDifficultyColor(course.difficulty)}`}
              >
                {course.difficulty}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(course.status)}`}
              >
                {course.status === 'active' ? 'Activo' : 
                 course.status === 'draft' ? 'Borrador' : 'Archivado'}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm mt-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{course.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{course.enrolledStudents} estudiantes</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.completionRate}% completado</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Creado: {new Date(course.createdAt).toLocaleDateString('es-ES')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onView(course)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport(course)}>
                <Download className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El curso "{course.title}" será eliminado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(course)} className="bg-destructive text-destructive-foreground">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CourseManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Course['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handlers para las acciones de los cursos
  const handleCreateCourse = async (courseData: any) => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCourse: Course = {
        id: Date.now().toString(),
        title: courseData.title,
        description: courseData.description,
        duration: courseData.estimatedTime,
        difficulty: courseData.difficulty === 'beginner' ? 'Básico' : 
                   courseData.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado',
        category: courseData.category,
        enrolledStudents: 0,
        completionRate: 0,
        status: courseData.isActive ? 'active' : 'draft',
        createdAt: new Date().toISOString(),
        targetDepartments: courseData.targetDepartments,
        enrollments: []
      };

      setCourses(prev => [newCourse, ...prev]);
      setShowCreateDialog(false);
      toast.success(`Curso "${courseData.title}" creado exitosamente`);
    } catch (error) {
      toast.error('Error al crear el curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = async (courseData: any) => {
    if (!editingCourse) return;
    
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCourse: Course = {
        ...editingCourse,
        title: courseData.title,
        description: courseData.description,
        duration: courseData.estimatedTime,
        difficulty: courseData.difficulty === 'beginner' ? 'Básico' : 
                   courseData.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado',
        category: courseData.category,
        status: courseData.isActive ? 'active' : 'draft',
        targetDepartments: courseData.targetDepartments
      };

      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      setEditingCourse(null);
      toast.success(`Curso "${courseData.title}" actualizado exitosamente`);
    } catch (error) {
      toast.error('Error al actualizar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    toast.info(`Abriendo vista detallada del curso "${course.title}"`);
    // Aquí iría la navegación al detalle del curso
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success(`Curso "${course.title}" eliminado exitosamente`);
    } catch (error) {
      toast.error('Error al eliminar el curso');
    }
  };

  const handleExportCourse = (course: Course) => {
    // El componente ExportReportDialog manejará la exportación
    toast.info(`Preparando exportación del curso "${course.title}"`);
  };

  const canCreateCourse = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
          <p className="text-muted-foreground">
            Administra el catálogo de cursos de capacitación de Griver
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportReportDialog 
            allCoursesData={courses}
            trigger={
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Reportes
              </Button>
            }
          />
          {canCreateCourse && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  <DialogDescription>
                    Completa la información del nuevo curso de capacitación. Define el contenido, duración, dificultad y configuraciones de asignación.
                  </DialogDescription>
                </DialogHeader>
                <CourseForm
                  onSubmit={handleCreateCourse}
                  onCancel={() => setShowCreateDialog(false)}
                  isLoading={isLoading}
                  userRole={user?.role}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Activos
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                Borradores
              </Button>
              <Button
                variant={filterStatus === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('archived')}
              >
                Archivados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-griver-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              75% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
            <BookOpen className="h-4 w-4 text-griver-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Cursos ({filteredCourses.length})
          </h2>
        </div>
        
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron cursos</h3>
                <p className="text-muted-foreground mb-4">
                  No hay cursos que coincidan con los filtros actuales.
                </p>
                {canCreateCourse ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Curso
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Contacta al administrador para crear cursos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onView={handleViewCourse}
                onEdit={(course) => setEditingCourse(course)}
                onDelete={handleDeleteCourse}
                onExport={handleExportCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog para editar curso */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Curso</DialogTitle>
              <DialogDescription>
                Modifica los detalles del curso, contenido y configuración
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              course={editingCourse}
              onSubmit={handleEditCourse}
              onCancel={() => setEditingCourse(null)}
              isLoading={isLoading}
              userRole={user?.role}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}