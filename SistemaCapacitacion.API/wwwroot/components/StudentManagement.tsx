import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Users, 
  UserPlus, 
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Eye,
  UserCheck,
  UserX,
  Shield,
  BookOpen,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { UserForm } from './forms/UserForm';
import { ExportReportDialog } from './ExportReportDialog';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'hr' | 'employee' | 'intern';
  department: string;
  enrolledCourses: number;
  completedCourses: number;
  progressPercentage: number;
  joinDate: string;
  lastActivity: string;
  status: 'active' | 'inactive';
  isActive?: boolean;
  notes?: string;
  assignedCourses?: string[]; // IDs de cursos asignados
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ana García López',
    email: 'ana.garcia@griver.com',
    phone: '+34 612 345 678',
    role: 'employee',
    department: 'Desarrollo',
    enrolledCourses: 5,
    completedCourses: 4,
    progressPercentage: 80,
    joinDate: '2024-01-15',
    lastActivity: '2024-03-01',
    status: 'active',
    assignedCourses: ['curso-1', 'curso-2', 'curso-3', 'curso-4', 'curso-5']
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@griver.com',
    phone: '+34 678 901 234',
    role: 'employee',
    department: 'Marketing',
    enrolledCourses: 3,
    completedCourses: 2,
    progressPercentage: 67,
    joinDate: '2024-02-01',
    lastActivity: '2024-02-28',
    status: 'active',
    assignedCourses: ['curso-1', 'curso-3', 'curso-6']
  },
  {
    id: '3',
    name: 'María Fernández',
    email: 'maria.fernandez@griver.com',
    role: 'hr',
    department: 'Recursos Humanos',
    enrolledCourses: 4,
    completedCourses: 4,
    progressPercentage: 100,
    joinDate: '2023-12-01',
    lastActivity: '2024-03-02',
    status: 'active',
    assignedCourses: ['curso-1', 'curso-2', 'curso-7', 'curso-8']
  },
  {
    id: '4',
    name: 'Pedro González',
    email: 'pedro.gonzalez@griver.com',
    phone: '+34 654 321 987',
    role: 'intern',
    department: 'Desarrollo',
    enrolledCourses: 6,
    completedCourses: 3,
    progressPercentage: 50,
    joinDate: '2024-02-15',
    lastActivity: '2024-02-25',
    status: 'active',
    assignedCourses: ['curso-1', 'curso-2', 'curso-3', 'curso-9', 'curso-10', 'curso-11']
  },
  {
    id: '5',
    name: 'Diana Torres',
    email: 'diana.torres@griver.com',
    role: 'intern',
    department: 'Diseño',
    enrolledCourses: 4,
    completedCourses: 2,
    progressPercentage: 50,
    joinDate: '2024-01-20',
    lastActivity: '2024-02-20',
    status: 'inactive',
    assignedCourses: ['curso-4', 'curso-5', 'curso-12', 'curso-13']
  },
  {
    id: '6',
    name: 'Roberto Admin',
    email: 'roberto.admin@griver.com',
    phone: '+34 600 000 001',
    role: 'admin',
    department: 'Administración',
    enrolledCourses: 2,
    completedCourses: 2,
    progressPercentage: 100,
    joinDate: '2023-01-01',
    lastActivity: '2024-03-05',
    status: 'active',
    assignedCourses: ['curso-admin-1', 'curso-admin-2']
  }
];

interface StudentCardProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onToggleStatus: (student: Student) => void;
  onManageCourses: (student: Student) => void;
  currentUserRole: string;
}

function StudentCard({ student, onView, onEdit, onDelete, onToggleStatus, onManageCourses, currentUserRole }: StudentCardProps) {
  const getRoleColor = (role: Student['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'intern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: Student['role']) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'hr': return 'Recursos Humanos';
      case 'employee': return 'Empleado';
      case 'intern': return 'Becario';
      default: return role;
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para determinar si se puede eliminar un usuario
  const canDeleteUser = (targetRole: Student['role'], currentRole: string) => {
    if (currentRole === 'admin') {
      return true; // Admin puede eliminar a todos
    }
    if (currentRole === 'hr') {
      return ['employee', 'intern', 'hr'].includes(targetRole); // RH puede eliminar empleados, becarios y otros RH
    }
    return false; // Otros roles no pueden eliminar
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">{student.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleColor(student.role)}`}
                >
                  {student.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {getRoleText(student.role)}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(student.status)}`}
                >
                  {student.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(student)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(student)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(student)}>
                {student.status === 'active' ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              {(currentUserRole === 'admin' || currentUserRole === 'hr') && (
                <DropdownMenuItem onClick={() => onManageCourses(student)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Gestionar Cursos
                </DropdownMenuItem>
              )}
              {canDeleteUser(student.role, currentUserRole) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(student)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Usuario
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{student.department}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso general</span>
              <span className={`font-medium ${getProgressColor(student.progressPercentage)}`}>
                {student.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${student.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Inscritos:</span>
              <div className="font-medium">{student.enrolledCourses} cursos</div>
            </div>
            <div>
              <span className="text-muted-foreground">Completados:</span>
              <div className="font-medium">{student.completedCourses} cursos</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Última actividad: {new Date(student.lastActivity).toLocaleDateString('es-ES')}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onView(student)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data para cursos disponibles
const mockCourses = [
  { id: 'curso-1', name: 'Introducción a Griver', department: 'General' },
  { id: 'curso-2', name: 'Seguridad Laboral', department: 'Recursos Humanos' },
  { id: 'curso-3', name: 'Desarrollo Web Avanzado', department: 'Desarrollo' },
  { id: 'curso-4', name: 'Marketing Digital', department: 'Marketing' },
  { id: 'curso-5', name: 'Diseño UX/UI', department: 'Diseño' },
  { id: 'curso-6', name: 'Gestión de Proyectos', department: 'General' },
  { id: 'curso-7', name: 'Liderazgo y Gestión', department: 'Recursos Humanos' },
  { id: 'curso-8', name: 'Políticas de Empresa', department: 'Recursos Humanos' },
  { id: 'curso-9', name: 'JavaScript Fundamentals', department: 'Desarrollo' },
  { id: 'curso-10', name: 'React Avanzado', department: 'Desarrollo' },
  { id: 'curso-11', name: 'Base de Datos', department: 'Desarrollo' },
  { id: 'curso-12', name: 'Photoshop Básico', department: 'Diseño' },
  { id: 'curso-13', name: 'Ilustración Digital', department: 'Diseño' },
  { id: 'curso-admin-1', name: 'Administración del Sistema', department: 'Administración' },
  { id: 'curso-admin-2', name: 'Gestión de Usuarios Avanzada', department: 'Administración' },
];

export default function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | Student['role']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Student['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [managingCoursesStudent, setManagingCoursesStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || student.role === filterRole;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: students.length,
    employees: students.filter(s => s.role === 'employee').length,
    interns: students.filter(s => s.role === 'intern').length,
    active: students.filter(s => s.status === 'active').length,
    avgProgress: Math.round(students.reduce((sum, s) => sum + s.progressPercentage, 0) / students.length)
  };

  // Handlers para las acciones de los usuarios
  const handleCreateUser = async (userData: any) => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: Student = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        department: userData.department,
        enrolledCourses: 0,
        completedCourses: 0,
        progressPercentage: 0,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        status: userData.isActive ? 'active' : 'inactive',
        isActive: userData.isActive,
        notes: userData.notes
      };

      setStudents(prev => [newUser, ...prev]);
      setShowCreateDialog(false);
      toast.success(`Usuario "${userData.name}" creado exitosamente`);
      
      if (userData.sendWelcomeEmail) {
        toast.info('Email de bienvenida enviado');
      }
    } catch (error) {
      toast.error('Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!editingStudent) return;
    
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: Student = {
        ...editingStudent,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        department: userData.department,
        status: userData.isActive ? 'active' : 'inactive',
        isActive: userData.isActive,
        notes: userData.notes
      };

      setStudents(prev => prev.map(student => 
        student.id === editingStudent.id ? updatedUser : student
      ));
      setEditingStudent(null);
      toast.success(`Usuario "${userData.name}" actualizado exitosamente`);
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (student: Student) => {
    toast.info(`Abriendo perfil detallado de ${student.name}`);
    // Aquí iría la navegación al detalle del usuario
  };

  const handleDeleteUser = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDeleteUser = async () => {
    if (!studentToDelete) return;

    try {
      setIsLoading(true);
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudents(prev => prev.filter(u => u.id !== studentToDelete.id));
      toast.success(`Usuario "${studentToDelete.name}" eliminado exitosamente`);
      setStudentToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (student: Student) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      setStudents(prev => prev.map(u => 
        u.id === student.id 
          ? { ...u, status: newStatus, isActive: newStatus === 'active' }
          : u
      ));
      
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const handleManageCourses = (student: Student) => {
    setManagingCoursesStudent(student);
  };

  const handleRemoveFromCourse = async (courseId: string) => {
    if (!managingCoursesStudent) return;

    try {
      setIsLoading(true);
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStudents(prev => prev.map(student => 
        student.id === managingCoursesStudent.id 
          ? { 
              ...student, 
              assignedCourses: student.assignedCourses?.filter(id => id !== courseId) || [],
              enrolledCourses: Math.max(0, student.enrolledCourses - 1)
            }
          : student
      ));

      const courseName = mockCourses.find(c => c.id === courseId)?.name || 'Curso';
      toast.success(`Usuario desasignado del curso "${courseName}" exitosamente`);
      
      // Actualizar el estudiante que estamos gestionando
      setManagingCoursesStudent(prev => 
        prev ? {
          ...prev,
          assignedCourses: prev.assignedCourses?.filter(id => id !== courseId) || [],
          enrolledCourses: Math.max(0, prev.enrolledCourses - 1)
        } : null
      );
    } catch (error) {
      toast.error('Error al desasignar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateUser = user?.role === 'admin' || user?.role === 'hr';
  
  // Función para determinar si se puede eliminar un usuario (nivel de componente)
  const canDeleteUser = (targetRole: Student['role'], currentRole: string) => {
    if (currentRole === 'admin') {
      return true; // Admin puede eliminar a todos
    }
    if (currentRole === 'hr') {
      return ['employee', 'intern', 'hr'].includes(targetRole); // RH puede eliminar empleados, becarios y otros RH
    }
    return false; // Otros roles no pueden eliminar
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra empleados y becarios del sistema Griver
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportReportDialog 
            allCoursesData={[]} // Aquí irían los datos de cursos si se necesitan
            trigger={
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Usuarios
              </Button>
            }
          />
          {canCreateUser && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo empleado o becario al sistema Griver. Configura sus permisos, departamento y accesos iniciales.
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  onSubmit={handleCreateUser}
                  onCancel={() => setShowCreateDialog(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Empleados y becarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-4 w-4 text-griver-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.employees / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Becarios</CardTitle>
            <Users className="h-4 w-4 text-griver-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interns}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.interns / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-griver-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.active / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <Users className="h-4 w-4 text-griver-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Completion rate
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
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rol:</span>
              <Button
                variant={filterRole === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterRole === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('admin')}
              >
                Admins
              </Button>
              <Button
                variant={filterRole === 'hr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('hr')}
              >
                RH
              </Button>
              <Button
                variant={filterRole === 'employee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('employee')}
              >
                Empleados
              </Button>
              <Button
                variant={filterRole === 'intern' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole('intern')}
              >
                Becarios
              </Button>
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
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Activos
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Usuarios ({filteredStudents.length})
          </h2>
        </div>
        
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground mb-4">
                  No hay usuarios que coincidan con los filtros actuales.
                </p>
                {canCreateUser ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Usuario
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Contacta al administrador para crear usuarios
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student}
                onView={handleViewUser}
                onEdit={(student) => setEditingStudent(student)}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
                onManageCourses={handleManageCourses}
                currentUserRole={user?.role || ''}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog para editar usuario */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica la información del usuario, cambios de departamento, roles y permisos de acceso.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={editingStudent}
              onSubmit={handleEditUser}
              onCancel={() => setEditingStudent(null)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para gestionar cursos de usuario */}
      {managingCoursesStudent && (
        <Dialog open={!!managingCoursesStudent} onOpenChange={() => setManagingCoursesStudent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestionar Cursos - {managingCoursesStudent.name}</DialogTitle>
              <DialogDescription>
                Administra los cursos asignados a este usuario. Puedes desasignar cursos o ver el estado de su progreso.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Información del usuario */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {managingCoursesStudent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{managingCoursesStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{managingCoursesStudent.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {managingCoursesStudent.role === 'admin' ? 'Administrador' :
                       managingCoursesStudent.role === 'hr' ? 'Recursos Humanos' :
                       managingCoursesStudent.role === 'employee' ? 'Empleado' : 'Becario'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{managingCoursesStudent.department}</span>
                  </div>
                </div>
              </div>

              {/* Lista de cursos asignados */}
              <div>
                <h4 className="font-medium mb-3">Cursos Asignados ({managingCoursesStudent.assignedCourses?.length || 0})</h4>
                {!managingCoursesStudent.assignedCourses || managingCoursesStudent.assignedCourses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay cursos asignados a este usuario</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {managingCoursesStudent.assignedCourses.map((courseId) => {
                      const course = mockCourses.find(c => c.id === courseId);
                      if (!course) return null;
                      
                      return (
                        <div key={courseId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-medium">{course.name}</h5>
                              <p className="text-sm text-muted-foreground">{course.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  disabled={isLoading}
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Desasignar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Desasignar curso?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que quieres desasignar a <strong>{managingCoursesStudent.name}</strong> del curso <strong>"{course.name}"</strong>?
                                    <br /><br />
                                    Esta acción eliminará todo el progreso del usuario en este curso y no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveFromCourse(courseId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Desasignar Curso
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{managingCoursesStudent.enrolledCourses}</div>
                  <div className="text-sm text-muted-foreground">Inscritos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{managingCoursesStudent.completedCourses}</div>
                  <div className="text-sm text-muted-foreground">Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{managingCoursesStudent.progressPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Progreso</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmación para eliminar usuario */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {studentToDelete && (
                <div className="space-y-3">
                  <p>
                    ¿Estás seguro de que quieres eliminar permanentemente al usuario <strong>{studentToDelete.name}</strong>?
                  </p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{studentToDelete.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {studentToDelete.role === 'admin' ? 'Administrador' :
                         studentToDelete.role === 'hr' ? 'Recursos Humanos' :
                         studentToDelete.role === 'employee' ? 'Empleado' : 'Becario'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{studentToDelete.department}</span>
                    </div>
                  </div>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium mb-1">⚠️ Esta acción no se puede deshacer</p>
                    <ul className="text-sm text-destructive/80 space-y-1">
                      <li>• Se eliminará toda la información del usuario</li>
                      <li>• Se perderá todo su progreso en cursos</li>
                      <li>• Sus datos no podrán ser recuperados</li>
                      {user?.role === 'hr' && studentToDelete.role === 'admin' && (
                        <li className="text-destructive font-medium">• ⚠️ No tienes permisos para eliminar administradores</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              disabled={isLoading || (user?.role === 'hr' && studentToDelete?.role === 'admin')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Usuario
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}