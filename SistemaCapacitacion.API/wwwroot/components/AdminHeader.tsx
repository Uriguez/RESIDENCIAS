import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Clock, LogOut, Bell, Settings, User, HelpCircle, Download } from 'lucide-react';
import { useAuth } from './AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { NotificationCenter } from './NotificationCenter';
import { ProfileEditDialog } from './ProfileEditDialog';
import { ROLE_LABELS } from '../utils/constants';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import griverLogo from 'figma:asset/fa6c3a0ac70be6d9e7fc047b43138faecc3ecc35.png';

interface AdminHeaderProps {
  onNavigateToSettings?: () => void;
}

export function AdminHeader({ onNavigateToSettings }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleText = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  };

  const handleConfigurationClick = () => {
    if (user?.role === 'admin') {
      onNavigateToSettings?.();
    } else {
      toast.info('Solo los administradores pueden acceder a la configuración del sistema');
    }
  };

  const handleProfileEdit = () => {
    setShowProfileDialog(true);
  };

  const handleHelpClick = () => {
    setShowHelpDialog(true);
  };

  const exportSystemData = () => {
    toast.info('Iniciando exportación de datos del sistema...');
    // Aquí iría la lógica de exportación
  };

  return (
    <header className="border-b border-sidebar-border bg-sidebar px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <img
            src={griverLogo}
            alt="Griver Logo"
            className="h-8 w-auto object-contain"
          />
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Panel Administrativo Griver</h1>
            <p className="text-xs text-sidebar-foreground/70">
              Sistema de Gestión de Capacitación
            </p>
          </div>
        </div>

        {/* Sección derecha con notificaciones y perfil */}
        <div className="flex items-center gap-4">
          {/* Hora actual */}
          <div className="hidden md:flex items-center gap-2 text-sm text-sidebar-foreground/70">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          {/* Centro de notificaciones */}
          <NotificationCenter />

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleText(user?.role || '')} • {user?.department}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleProfileEdit}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleConfigurationClick}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              {(user?.role === 'admin' || user?.role === 'hr') && (
                <DropdownMenuItem onClick={exportSystemData}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Datos
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleHelpClick}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Ayuda y Soporte
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Diálogo de Edición de Perfil */}
      <ProfileEditDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog} 
      />

      {/* Diálogo de Ayuda y Soporte */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Ayuda y Soporte
            </DialogTitle>
            <DialogDescription>
              Encuentra recursos de ayuda, contacta al soporte técnico e información del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Centro de Ayuda</h4>
              <p className="text-sm text-muted-foreground">
                Encuentra respuestas a las preguntas más frecuentes y guías de usuario.
              </p>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Abrir Centro de Ayuda
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Contacto Técnico</h4>
              <p className="text-sm text-muted-foreground">
                ¿Tienes problemas técnicos? Contacta a nuestro equipo de soporte.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:soporte@griver.com">
                    <Bell className="mr-2 h-4 w-4" />
                    soporte@griver.com
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Chat en Vivo (9:00 - 18:00)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Información del Sistema</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span className="font-mono">v2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Última actualización:</span>
                  <span>Marzo 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Tu rol:</span>
                  <span className="capitalize">{getRoleText(user?.role || '')}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}