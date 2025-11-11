import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { ROLE_LABELS, COMPANY } from '../utils/constants';
import griverLogo from 'figma:asset/fa6c3a0ac70be6d9e7fc047b43138faecc3ecc35.png';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userRole: string;
}

export function Sidebar({ activeSection, setActiveSection, userRole }: SidebarProps) {
  const isAdmin = userRole === 'admin';
  const isRH = userRole === 'rh';

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      available: true,
      badge: null
    },
    {
      id: 'courses',
      label: 'Gestión de Cursos',
      icon: BookOpen,
      available: true,
      badge: null
    },
    {
      id: 'students',
      label: 'Gestión de Usuarios',
      icon: Users,
      available: true,
      badge: null
    },
    {
      id: 'progress',
      label: 'Progreso de Cursos',
      icon: BarChart3,
      available: true,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analíticas Avanzadas',
      icon: TrendingUp,
      available: isAdmin, // Solo admin puede ver analíticas avanzadas
      badge: isAdmin ? 'Pro' : null
    },
    {
      id: 'reports',
      label: 'Reportes Crystal',
      icon: FileText,
      available: isAdmin || isRH, // Admin y RH pueden generar reportes
      badge: 'Nuevo'
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      available: isAdmin,
      onClick: null // Será manejado por setActiveSection
    },
    {
      id: 'help',
      label: 'Ayuda y Soporte',
      icon: HelpCircle,
      available: true,
      onClick: () => window.open('mailto:soporte@griver.com', '_blank')
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.available) {
      setActiveSection(item.id);
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src={griverLogo}
            alt="Griver Logo"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h2 className="font-semibold text-sidebar-foreground">{COMPANY.name}</h2>
            <p className="text-xs text-sidebar-foreground/70">
              Sistema de Capacitación
            </p>
          </div>
        </div>
      </div>

      {/* User Role Badge */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sidebar-foreground/70" />
          <Badge variant="secondary" className="text-xs">
            {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS]}
          </Badge>
        </div>
      </div>

      <Separator className="mx-4 bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            if (!item.available) return null;
            
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
                onClick={() => handleItemClick(item)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="mx-4 bg-sidebar-border" />

      {/* Bottom Items */}
      <div className="p-4 space-y-1">
        {bottomItems.map((item) => {
          if (!item.available) return null;
          
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => handleItemClick(item)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          {COMPANY.fullName}
        </p>
        <p className="text-xs text-sidebar-foreground/50 text-center">
          v2.0.0 - 2025
        </p>
      </div>
    </div>
  );
}