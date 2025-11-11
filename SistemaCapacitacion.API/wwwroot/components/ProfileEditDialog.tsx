import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { User, Save, Camera, AlertCircle, Briefcase, Mail, Building, CalendarDays } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';
import { User as UserType } from '../types';
import { ROLE_LABELS } from '../utils/constants';
import { AvatarUpload } from './AvatarUpload';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEPARTMENTS = [
  'Administración',
  'Recursos Humanos',
  'IT',
  'Ventas',
  'Marketing',
  'Operaciones',
  'Finanzas',
  'Legal'
];

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    position: user?.position || '',
    avatar: user?.avatar || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleText = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validar departamento
    if (!formData.department || formData.department.trim().length === 0) {
      newErrors.department = 'Selecciona un departamento';
    }

    // Validar posición para empleados y becarios
    if ((user?.role === 'employee' || user?.role === 'intern') && 
        (!formData.position || formData.position.trim().length < 2)) {
      newErrors.position = 'La posición debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, avatar: imageUrl || '' }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar usuario en el contexto
      const updatedUser = {
        ...user!,
        ...formData,
        name: formData.name!.trim(),
        email: formData.email!.trim(),
        department: formData.department!.trim(),
        position: formData.position?.trim() || user?.position,
        avatar: formData.avatar || user?.avatar,
      };

      await updateUser(updatedUser);
      
      toast.success('Perfil actualizado exitosamente', {
        description: 'Tus cambios han sido guardados en el sistema Griver'
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil', {
        description: 'Inténtalo nuevamente o contacta al soporte técnico'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      avatar: user?.avatar || '',
    });
    setErrors({});
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-griver-primary" />
            Editar Mi Perfil
          </DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y datos de contacto en el sistema Griver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de Foto de Perfil */}
          <AvatarUpload 
            currentImage={formData.avatar}
            userName={user.name}
            onImageChange={handleImageChange}
            size="lg"
            disabled={isLoading}
          />

          {/* Información actual del usuario (solo para referencia) */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-griver-primary" />
                Información de Referencia
              </CardTitle>
              <CardDescription>
                Datos actuales registrados en el sistema Griver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getRoleText(user.role)}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{user.department}</span>
                  </div>
                  {user.position && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {user.position}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {user.hireDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      Desde {new Date(user.hireDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={`text-xs ${user.status === 'active' ? 'bg-griver-success' : ''}`}
                    >
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Formulario de edición */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-4 w-4 text-griver-secondary" />
              <span className="text-sm font-medium">Editar Información</span>
            </div>

            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ingresa tu nombre completo"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu.email@griver.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Departamento
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.department}
                </div>
              )}
            </div>

            {/* Posición (solo para empleados y becarios) */}
            {(user.role === 'employee' || user.role === 'intern') && (
              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Posición / Cargo
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ej: Analista Senior, Desarrollador, etc."
                  className={errors.position ? 'border-destructive' : ''}
                />
                {errors.position && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.position}
                  </div>
                )}
              </div>
            )}

            {/* Información no editable */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Rol en el sistema:</span>
                    <Badge variant="secondary">{getRoleText(user.role)}</Badge>
                  </div>
                  {user.hireDate && (
                    <div className="flex justify-between">
                      <span>Fecha de ingreso:</span>
                      <span>{new Date(user.hireDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' ? 'bg-griver-success' : ''}
                    >
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1 bg-griver-primary hover:bg-griver-secondary"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}