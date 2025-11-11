import { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Calendar,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'hr', 'employee', 'intern']),
  department: z.string().min(1, 'El departamento es requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  confirmPassword: z.string().optional(),
  isActive: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true),
  temporaryPassword: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'hr' | 'employee' | 'intern';
  department: string;
  isActive: boolean;
  notes?: string;
}

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DEPARTMENTS = [
  { id: 'development', name: 'Desarrollo de Software' },
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'devops', name: 'DevOps' },
  { id: 'qa', name: 'Quality Assurance' },
  { id: 'design', name: 'Diseño y UX' },
  { id: 'ux', name: 'UX Research' },
  { id: 'ui', name: 'UI Design' },
  { id: 'graphic', name: 'Diseño Gráfico' },
  { id: 'marketing', name: 'Marketing y Comunicación' },
  { id: 'digital-marketing', name: 'Marketing Digital' },
  { id: 'content', name: 'Creación de Contenido' },
  { id: 'social-media', name: 'Redes Sociales' },
  { id: 'sales', name: 'Ventas' },
  { id: 'inside-sales', name: 'Ventas Internas' },
  { id: 'field-sales', name: 'Ventas de Campo' },
  { id: 'hr', name: 'Recursos Humanos' },
  { id: 'talent', name: 'Gestión de Talento' },
  { id: 'compensation', name: 'Compensación y Beneficios' },
  { id: 'training', name: 'Capacitación' },
  { id: 'finance', name: 'Finanzas y Administración' },
  { id: 'accounting', name: 'Contabilidad' },
  { id: 'admin', name: 'Administración' },
  { id: 'operations', name: 'Operaciones' },
  { id: 'support', name: 'Soporte al Cliente' },
  { id: 'logistics', name: 'Logística' },
];

const ROLES = [
  { 
    id: 'admin', 
    name: 'Administrador', 
    description: 'Acceso completo al sistema',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    id: 'hr', 
    name: 'Recursos Humanos', 
    description: 'Gestión de usuarios y cursos',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 'employee', 
    name: 'Empleado', 
    description: 'Acceso a cursos asignados',
    color: 'bg-green-100 text-green-800'
  },
  { 
    id: 'intern', 
    name: 'Becario', 
    description: 'Acceso limitado a cursos',
    color: 'bg-orange-100 text-orange-800'
  },
];

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const { user: currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(!user);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'employee',
      department: user?.department || '',
      password: '',
      confirmPassword: '',
      isActive: user?.isActive ?? true,
      sendWelcomeEmail: !user, // Solo para nuevos usuarios
      temporaryPassword: !user, // Solo para nuevos usuarios
      notes: user?.notes || '',
    }
  });

  const watchedRole = form.watch('role');
  const isCreatingUser = !user;

  const handleSubmit = (data: UserFormData) => {
    // Validaciones adicionales
    if (isCreatingUser && !generatePassword && (!data.password || !data.confirmPassword)) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return;
    }

    // Verificar permisos para crear administradores
    if (data.role === 'admin' && currentUser?.role !== 'admin') {
      toast.error('Solo los administradores pueden crear otros administradores');
      return;
    }

    onSubmit(data);
  };

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue('password', password);
    form.setValue('confirmPassword', password);
    toast.success('Contraseña temporal generada');
  };

  const selectedRole = ROLES.find(role => role.id === watchedRole);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isCreatingUser ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre completo */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ana García López" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Corporativo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="usuario@griver.com" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="+34 612 345 678" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rol y Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rol */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol en el Sistema</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${role.color}`}>
                              {role.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRole && (
                    <FormDescription className="flex items-center gap-2 mt-2">
                      <Shield className="h-4 w-4" />
                      {selectedRole.description}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Departamento */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contraseña (solo para nuevos usuarios o cambio) */}
        {isCreatingUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opción de generar contraseña */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Generar Contraseña Temporal</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Se generará una contraseña segura que el usuario podrá cambiar
                  </p>
                </div>
                <Switch
                  checked={generatePassword}
                  onCheckedChange={setGeneratePassword}
                />
              </div>

              {!generatePassword && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="button" variant="outline" onClick={generateRandomPassword}>
                    Generar Contraseña Segura
                  </Button>
                </div>
              )}

              <Separator />

              {/* Opciones de notificación */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Enviar Email de Bienvenida</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enviar credenciales y manual de usuario por email
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="sendWelcomeEmail"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Requerir Cambio de Contraseña</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      El usuario deberá cambiar la contraseña en el primer acceso
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="temporaryPassword"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuración adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado del usuario */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel>Usuario Activo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  El usuario puede acceder al sistema
                </p>
              </div>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Notas adicionales */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el usuario..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Información interna visible solo para administradores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Advertencia sobre permisos */}
        {watchedRole === 'admin' && currentUser?.role !== 'admin' && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Sin permisos suficientes
              </p>
              <p className="text-sm text-destructive/80">
                Solo los administradores pueden crear otros administradores
              </p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (watchedRole === 'admin' && currentUser?.role !== 'admin')}
            className="gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isLoading ? 'Guardando...' : isCreatingUser ? 'Crear Usuario' : 'Actualizar Usuario'}
          </Button>
        </div>
      </form>
    </Form>
  );
}