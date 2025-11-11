import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  Award, 
  LogOut,
  TrendingUp,
  Video,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { ROLE_LABELS } from '../utils/constants';
import griverLogo from 'figma:asset/fa6c3a0ac70be6d9e7fc047b43138faecc3ecc35.png';

interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'document';
  duration?: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
  thumbnail: string;
  content: CourseContent[];
}

export function ClientDashboard() {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  // Cursos disponibles con contenido
  const availableCourses: Course[] = [
    {
      id: '1',
      title: 'Seguridad Laboral Básica',
      description: 'Fundamentos de seguridad en el lugar de trabajo',
      duration: '2 horas',
      progress: 100,
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
      content: [
        { id: '1-1', title: 'Introducción a la Seguridad', type: 'video', duration: '15 min', completed: true },
        { id: '1-2', title: 'Equipos de Protección Personal', type: 'video', duration: '20 min', completed: true },
        { id: '1-3', title: 'Manual de Seguridad', type: 'document', completed: true },
        { id: '1-4', title: 'Evaluación Final', type: 'document', completed: true }
      ]
    },
    {
      id: '2', 
      title: 'Procedimientos de Emergencia',
      description: 'Protocolos y procedimientos ante emergencias',
      duration: '1.5 horas',
      progress: 75,
      status: 'in-progress',
      thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=250&fit=crop',
      content: [
        { id: '2-1', title: 'Planes de Evacuación', type: 'video', duration: '18 min', completed: true },
        { id: '2-2', title: 'Primeros Auxilios Básicos', type: 'video', duration: '25 min', completed: true },
        { id: '2-3', title: 'Uso de Extintores', type: 'video', duration: '12 min', completed: false },
        { id: '2-4', title: 'Protocolo de Emergencias', type: 'document', completed: false }
      ]
    },
    {
      id: '3',
      title: 'Cultura Organizacional',
      description: 'Valores, misión y visión de Griver',
      duration: '3 horas', 
      progress: 0,
      status: 'not-started',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      content: [
        { id: '3-1', title: 'Historia de Griver', type: 'video', duration: '20 min', completed: false },
        { id: '3-2', title: 'Valores Corporativos', type: 'video', duration: '15 min', completed: false },
        { id: '3-3', title: 'Código de Conducta', type: 'document', completed: false }
      ]
    }
  ];

  // Filtrar cursos según los asignados al usuario
  const userCourses = user?.assignedCourses 
    ? availableCourses.filter(course => user.assignedCourses?.includes(course.id))
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Progreso';
      case 'not-started': return 'No Iniciado';
      default: return status;
    }
  };

  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsContentDialogOpen(true);
  };

  const getRoleText = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const completedCount = userCourses.filter(course => course.status === 'completed').length;
  const totalProgress = userCourses.length > 0 
    ? Math.round(userCourses.reduce((acc, course) => acc + course.progress, 0) / userCourses.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={griverLogo}
                alt="Griver Logo"
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="font-medium">Griver - Portal de Capacitación</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de gestión de cursos de inducción
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Información del usuario */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-griver-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-griver-primary text-white">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getRoleText(user?.role || '')} • {user?.department}
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Cursos Asignados</p>
                  <p className="text-2xl font-medium">{userCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Completados</p>
                  <p className="text-2xl font-medium">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Progreso Total</p>
                  <p className="text-2xl font-medium">{totalProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-medium mb-6">Mis Cursos</h2>
          
          {userCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No tienes cursos asignados</h3>
                <p className="text-muted-foreground">
                  Contacta al departamento de Recursos Humanos de Griver para que te asigne cursos de capacitación.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                        onClick={() => handleOpenCourse(course)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Ver Curso
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className={getStatusColor(course.status)}>
                        {getStatusText(course.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      onClick={() => handleOpenCourse(course)} 
                      className="w-full"
                      variant={course.status === 'completed' ? 'outline' : 'default'}
                    >
                      {course.status === 'not-started' && (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Curso
                        </>
                      )}
                      {course.status === 'in-progress' && (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continuar
                        </>
                      )}
                      {course.status === 'completed' && (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Revisar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              {selectedCourse?.description}. Explora el contenido del curso y realiza un seguimiento de tu progreso.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedCourse?.duration}
              </div>
              <Badge className={getStatusColor(selectedCourse?.status || '')}>
                {getStatusText(selectedCourse?.status || '')}
              </Badge>
            </div>

            {selectedCourse && selectedCourse.progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del Curso</span>
                  <span>{selectedCourse.progress}%</span>
                </div>
                <Progress value={selectedCourse.progress} />
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium">Contenido del Curso</h3>
              {selectedCourse?.content.map((item, index) => (
                <Card key={item.id} className={`p-4 ${item.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100' : 'bg-muted'}`}>
                        {item.type === 'video' ? (
                          <Video className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                        ) : (
                          <FileText className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        {item.duration && (
                          <p className="text-sm text-muted-foreground">{item.duration}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}