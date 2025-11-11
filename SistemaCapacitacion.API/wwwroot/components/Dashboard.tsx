import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  BookOpen, 
  Target, 
  Award, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  Download,
  Settings,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { MethodologyMetrics } from './common/MethodologyMetrics';
import { useGriverAnalytics } from '../hooks/useGriverAnalytics';
import { UserForm } from './forms/UserForm';
import { CourseForm } from './forms/CourseForm';
import { ExportReportDialog } from './ExportReportDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

function StatCard({ title, value, change, icon: Icon, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'text-griver-primary bg-griver-primary/10',
    success: 'text-griver-success bg-griver-success/10',
    warning: 'text-griver-warning bg-griver-warning/10',
    info: 'text-griver-info bg-griver-info/10'
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change && (
          <div className="flex items-center text-xs">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-griver-success mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-griver-error mr-1" />
            )}
            <span className={change.type === 'increase' ? 'text-griver-success' : 'text-griver-error'}>
              {Math.abs(change.value)}%
            </span>
            <span className="text-muted-foreground ml-1">{change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'course_completion' | 'user_creation' | 'course_assignment' | 'certificate_earned';
}

function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      user: 'Ana García López',
      action: 'completó el curso',
      target: 'Seguridad Laboral Básica',
      time: '2 horas atrás',
      type: 'course_completion'
    },
    {
      id: '2',
      user: 'Carlos Rodríguez',
      action: 'inició el curso',
      target: 'Procedimientos de Emergencia',
      time: '4 horas atrás',
      type: 'course_assignment'
    },
    {
      id: '3',
      user: 'María Fernández (RH)',
      action: 'creó el usuario',
      target: 'Pedro González - Becario',
      time: '6 horas atrás',
      type: 'user_creation'
    },
    {
      id: '4',
      user: 'Luis Martínez',
      action: 'obtuvo certificado',
      target: 'Cultura Organizacional',
      time: '1 día atrás',
      type: 'certificate_earned'
    },
    {
      id: '5',
      user: 'Diana Torres',
      action: 'completó el curso',
      target: 'Desarrollo Profesional',
      time: '1 día atrás',
      type: 'course_completion'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course_completion':
        return <BookOpen className="h-4 w-4 text-griver-success" />;
      case 'certificate_earned':
        return <Award className="h-4 w-4 text-griver-warning" />;
      case 'user_creation':
        return <UserPlus className="h-4 w-4 text-griver-info" />;
      case 'course_assignment':
        return <Target className="h-4 w-4 text-griver-primary" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimas acciones en el sistema de capacitación Griver
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground"> {activity.action} </span>
                  <span className="font-medium">{activity.target}</span>
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopCourses() {
  const courses = [
    { 
      title: 'Seguridad Laboral Básica', 
      completions: 89, 
      enrolled: 95,
      trend: 'up' as const,
      category: 'Seguridad'
    },
    { 
      title: 'Cultura Organizacional', 
      completions: 67, 
      enrolled: 78,
      trend: 'up' as const,
      category: 'Cultura'
    },
    { 
      title: 'Procedimientos de Emergencia', 
      completions: 45, 
      enrolled: 62,
      trend: 'down' as const,
      category: 'Seguridad'
    },
    { 
      title: 'Desarrollo Profesional', 
      completions: 32, 
      enrolled: 45,
      trend: 'up' as const,
      category: 'Desarrollo'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Cursos Más Populares
        </CardTitle>
        <CardDescription>
          Ranking por finalizaciones y engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-griver-primary/10 text-griver-primary rounded-lg font-medium text-sm">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">{course.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {course.completions}/{course.enrolled} completados
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round((course.completions / course.enrolled) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">completado</div>
                </div>
                {course.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-griver-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-griver-error" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  onNavigateToSettings: () => void;
}

function QuickActions({ onNavigateToSettings }: QuickActionsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleAddUser = () => {
    setShowUserForm(true);
    toast.info('Abriendo formulario de nuevo usuario');
  };

  const handleCreateCourse = () => {
    setShowCourseForm(true);
    toast.info('Abriendo formulario de nuevo curso');
  };

  const handleExportReports = () => {
    setShowExportDialog(true);
    toast.info('Abriendo opciones de exportación');
  };

  const handleSystemSettings = () => {
    onNavigateToSettings();
    toast.info('Navegando a configuración del sistema');
  };

  const handleUserFormSuccess = () => {
    setShowUserForm(false);
    toast.success('Usuario creado exitosamente');
  };

  const handleCourseFormSuccess = () => {
    setShowCourseForm(false);
    toast.success('Curso creado exitosamente');
  };

  const actions = [
    {
      label: 'Agregar Usuario',
      icon: UserPlus,
      description: 'Crear nuevo empleado o becario',
      color: 'griver-primary',
      available: true,
      onClick: handleAddUser
    },
    {
      label: 'Crear Curso',
      icon: BookOpen,
      description: 'Diseñar nuevo curso de capacitación',
      color: 'griver-secondary',
      available: true,
      onClick: handleCreateCourse
    },
    {
      label: 'Exportar Reportes',
      icon: Download,
      description: 'Descargar métricas y analytics',
      color: 'griver-info',
      available: true,
      onClick: handleExportReports
    },
    {
      label: 'Configuración Sistema',
      icon: Settings,
      description: 'Configuración avanzada',
      color: 'griver-warning',
      available: isAdmin,
      onClick: handleSystemSettings
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Tareas frecuentes para la gestión del sistema Griver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.filter(action => action.available).map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start h-auto p-4 space-y-1 hover:bg-accent/50 transition-colors"
                onClick={action.onClick}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg bg-${action.color}/10`}>
                    <action.icon className={`h-4 w-4 text-${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Form Modal */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-griver-primary" />
              Agregar Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Crea un nuevo empleado o becario en el sistema Griver. Completa todos los campos requeridos para configurar el acceso del usuario.
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSuccess={handleUserFormSuccess}
            onCancel={() => setShowUserForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Course Form Modal */}
      <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-griver-secondary" />
              Crear Nuevo Curso
            </DialogTitle>
            <DialogDescription>
              Diseña un nuevo curso de capacitación para el sistema Griver. Configura el contenido, duración, dificultad y asignaciones.
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            onSuccess={handleCourseFormSuccess}
            onCancel={() => setShowCourseForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Export Reports Modal */}
      {showExportDialog && (
        <ExportReportDialog 
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
        />
      )}
    </>
  );
}

interface DashboardProps {
  onNavigateToSettings?: () => void;
}

export function Dashboard({ onNavigateToSettings }: DashboardProps = {}) {
  const { user } = useAuth();
  const { analyticsData } = useGriverAnalytics();

  const handleNavigateToSettings = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      toast.info('Función de navegación no disponible');
    }
  };

  // Memoize expensive calculations
  const stats = useMemo(() => ({
    totalUsers: 245,
    totalCourses: 18,
    activeCourses: 15,
    completionRate: 87.5,
    newUsersThisMonth: 23,
    coursesCompletedThisMonth: 156,
    certificatesIssued: 89,
    avgEngagement: 8.7
  }), []);

  const getRoleText = (role: string) => {
    const roles = {
      'admin': 'Administrador',
      'rh': 'Recursos Humanos',
      'employee': 'Empleado',
      'intern': 'Becario'
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight griver-text-gradient">
              Dashboard Griver
            </h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.name} • {getRoleText(user?.role || '')}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 bg-griver-success rounded-full animate-pulse" />
            Sistema Activo
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Resumen general del sistema de capacitación empresarial • 
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios Totales"
          value={stats.totalUsers}
          change={{ value: 8.2, type: 'increase', period: 'este mes' }}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Cursos Activos"
          value={stats.activeCourses}
          change={{ value: 12.5, type: 'increase', period: 'este trimestre' }}
          icon={BookOpen}
          color="info"
        />
        <StatCard
          title="Tasa de Finalización"
          value={`${stats.completionRate}%`}
          change={{ value: 3.2, type: 'increase', period: 'vs mes anterior' }}
          icon={Target}
          color="success"
        />
        <StatCard
          title="Certificados Emitidos"
          value={stats.certificatesIssued}
          change={{ value: 15.8, type: 'increase', period: 'este mes' }}
          icon={Award}
          color="warning"
        />
      </div>

      {/* Methodology Metrics - Admin only */}
      {user?.role === 'admin' && (
        <div className="animate-slide-up">
          <MethodologyMetrics />
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity - spans 2 columns on lg */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        {/* Top Courses */}
        <div>
          <TopCourses />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onNavigateToSettings={handleNavigateToSettings} />

      {/* Additional Stats for Admin/RH */}
      {(user?.role === 'admin' || user?.role === 'rh') && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Avanzadas</CardTitle>
            <CardDescription>
              Indicadores clave de rendimiento del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-griver-success">
                  {stats.avgEngagement}
                </div>
                <div className="text-sm text-muted-foreground">
                  Engagement Score
                </div>
                <div className="text-xs text-muted-foreground">
                  Promedio de satisfacción
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-griver-info">
                  {Math.round(analyticsData.kanbanMetrics.throughput)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Features/Sprint
                </div>
                <div className="text-xs text-muted-foreground">
                  Velocidad de desarrollo
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-griver-warning">
                  {analyticsData.kanbanMetrics.flowEfficiency.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Flow Efficiency
                </div>
                <div className="text-xs text-muted-foreground">
                  Eficiencia del proceso
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}