import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  Search, 
  BookOpen, 
  Users, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface CourseProgress {
  id: string;
  courseName: string;
  userName: string;
  userEmail: string;
  userRole: 'employee' | 'intern';
  department: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  enrolledDate: string;
  completedDate?: string;
  dueDate: string;
  timeSpent: number; // in minutes
  lastActivity: string;
}

const mockProgressData: CourseProgress[] = [
  {
    id: '1',
    courseName: 'Seguridad Laboral Básica',
    userName: 'Ana García López',
    userEmail: 'ana.garcia@griver.com',
    userRole: 'employee',
    department: 'Desarrollo',
    progress: 100,
    status: 'completed',
    enrolledDate: '2024-02-01',
    completedDate: '2024-02-15',
    dueDate: '2024-03-01',
    timeSpent: 120,
    lastActivity: '2024-02-15'
  },
  {
    id: '2',
    courseName: 'Cultura Organizacional Griver',
    userName: 'Carlos Rodríguez',
    userEmail: 'carlos.rodriguez@griver.com',
    userRole: 'employee',
    department: 'Marketing',
    progress: 75,
    status: 'in-progress',
    enrolledDate: '2024-02-10',
    dueDate: '2024-03-10',
    timeSpent: 68,
    lastActivity: '2024-02-28'
  },
  {
    id: '3',
    courseName: 'Procedimientos de Emergencia',
    userName: 'María Fernández',
    userEmail: 'maria.fernandez@griver.com',
    userRole: 'employee',
    department: 'Recursos Humanos',
    progress: 100,
    status: 'completed',
    enrolledDate: '2024-01-15',
    completedDate: '2024-02-05',
    dueDate: '2024-02-15',
    timeSpent: 150,
    lastActivity: '2024-02-05'
  },
  {
    id: '4',
    courseName: 'Desarrollo Profesional',
    userName: 'Pedro González',
    userEmail: 'pedro.gonzalez@griver.com',
    userRole: 'intern',
    department: 'Desarrollo',
    progress: 45,
    status: 'in-progress',
    enrolledDate: '2024-02-15',
    dueDate: '2024-03-15',
    timeSpent: 90,
    lastActivity: '2024-02-25'
  },
  {
    id: '5',
    courseName: 'Seguridad Laboral Básica',
    userName: 'Diana Torres',
    userEmail: 'diana.torres@griver.com',
    userRole: 'intern',
    department: 'Diseño',
    progress: 10,
    status: 'overdue',
    enrolledDate: '2024-01-20',
    dueDate: '2024-02-20',
    timeSpent: 12,
    lastActivity: '2024-02-10'
  },
  {
    id: '6',
    courseName: 'Cultura Organizacional Griver',
    userName: 'Luis Martínez',
    userEmail: 'luis.martinez@griver.com',
    userRole: 'employee',
    department: 'Ventas',
    progress: 0,
    status: 'not-started',
    enrolledDate: '2024-02-20',
    dueDate: '2024-03-20',
    timeSpent: 0,
    lastActivity: '2024-02-20'
  }
];

function ProgressCard({ progress }: { progress: CourseProgress }) {
  const getStatusColor = (status: CourseProgress['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CourseProgress['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'not-started': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: CourseProgress['status']) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Progreso';
      case 'overdue': return 'Vencido';
      case 'not-started': return 'No Iniciado';
      default: return 'Desconocido';
    }
  };

  const isOverdue = new Date(progress.dueDate) < new Date() && progress.status !== 'completed';
  const daysUntilDue = Math.ceil((new Date(progress.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{progress.courseName}</CardTitle>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {progress.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{progress.userName}</div>
                <div className="text-muted-foreground">{progress.department}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(progress.status)}
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(progress.status)}`}
            >
              {getStatusText(progress.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span className="font-medium">{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Tiempo invertido</div>
              <div className="font-medium">{Math.floor(progress.timeSpent / 60)}h {progress.timeSpent % 60}m</div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {isOverdue ? 'Vencido hace' : 'Tiempo restante'}
              </div>
              <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {Math.abs(daysUntilDue)} días
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Inscrito:</span>
              <span>{new Date(progress.enrolledDate).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha límite:</span>
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {new Date(progress.dueDate).toLocaleDateString('es-ES')}
              </span>
            </div>
            {progress.completedDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completado:</span>
                <span className="text-green-600 font-medium">
                  {new Date(progress.completedDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Última actividad:</span>
              <span>{new Date(progress.lastActivity).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CoursesProgress() {
  const [progressData] = useState<CourseProgress[]>(mockProgressData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | CourseProgress['status']>('all');

  const filteredProgress = progressData.filter(progress => {
    const matchesSearch = progress.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         progress.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         progress.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || progress.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: progressData.length,
    completed: progressData.filter(p => p.status === 'completed').length,
    inProgress: progressData.filter(p => p.status === 'in-progress').length,
    overdue: progressData.filter(p => p.status === 'overdue').length,
    notStarted: progressData.filter(p => p.status === 'not-started').length,
    avgProgress: Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progreso de Cursos</h1>
          <p className="text-muted-foreground">
            Seguimiento detallado del progreso de usuarios en los cursos Griver
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas las inscripciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-griver-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-griver-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completed / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-griver-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-griver-info">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.inProgress / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <XCircle className="h-4 w-4 text-griver-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-griver-error">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Iniciados</CardTitle>
            <AlertCircle className="h-4 w-4 text-griver-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-griver-warning">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">
              Sin actividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              General del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por curso, usuario o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Completados
              </Button>
              <Button
                variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in-progress')}
              >
                En Progreso
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('overdue')}
              >
                Vencidos
              </Button>
              <Button
                variant={filterStatus === 'not-started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('not-started')}
              >
                No Iniciados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Progreso Detallado ({filteredProgress.length})
          </h2>
        </div>
        
        {filteredProgress.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron registros</h3>
                <p className="text-muted-foreground">
                  No hay registros de progreso que coincidan con los filtros actuales.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProgress.map((progress) => (
              <ProgressCard key={progress.id} progress={progress} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}