import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Settings, 
  Save, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Clock,
  Users,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Database,
  FileText,
  Key,
  Monitor,
  Network,
  HardDrive,
  Cpu,
  Server,
  Globe,
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completedCourses: number;
  systemUptime: string;
  dbSize: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkStatus: 'online' | 'offline' | 'degraded';
  lastBackup: string;
  apiCallsToday: number;
  errorRate: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemConfig {
  general: {
    systemName: string;
    supportEmail: string;
    maxCourseUploadSize: number;
    sessionTimeout: number;
    autoLogout: boolean;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    courseReminders: boolean;
    completionCertificates: boolean;
    weeklyReports: boolean;
    systemAlerts: boolean;
    auditReports: boolean;
  };
  security: {
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLoginAttempts: number;
    accountLockoutTime: number;
    twoFactorAuth: boolean;
    ipWhitelist: boolean;
    sessionEncryption: boolean;
  };
  appearance: {
    darkMode: boolean;
    compactMode: boolean;
    language: string;
    timezone: string;
    customLogo: boolean;
    brandColors: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
    cloudBackup: boolean;
    encryptBackups: boolean;
  };
  integrations: {
    enabledAPIs: string[];
    webhookUrl: string;
    ssoProvider: string;
    ldapIntegration: boolean;
  };
}

const defaultConfig: SystemConfig = {
  general: {
    systemName: 'Sistema Griver',
    supportEmail: 'soporte@griver.com',
    maxCourseUploadSize: 100,
    sessionTimeout: 480,
    autoLogout: true,
    maintenanceMode: false,
    debugMode: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    courseReminders: true,
    completionCertificates: true,
    weeklyReports: false,
    systemAlerts: true,
    auditReports: true,
  },
  security: {
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxLoginAttempts: 5,
    accountLockoutTime: 15,
    twoFactorAuth: false,
    ipWhitelist: false,
    sessionEncryption: true,
  },
  appearance: {
    darkMode: false,
    compactMode: false,
    language: 'es',
    timezone: 'Europe/Madrid',
    customLogo: false,
    brandColors: true,
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    cloudBackup: false,
    encryptBackups: true,
  },
  integrations: {
    enabledAPIs: ['rest', 'graphql'],
    webhookUrl: '',
    ssoProvider: 'none',
    ldapIntegration: false,
  },
};

const mockSystemStats: SystemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalCourses: 156,
  completedCourses: 4823,
  systemUptime: '15 días, 3 horas',
  dbSize: '2.4 GB',
  memoryUsage: 68,
  cpuUsage: 23,
  diskUsage: 45,
  networkStatus: 'online',
  lastBackup: '2025-01-08 02:00:00',
  apiCallsToday: 15420,
  errorRate: 0.02,
};

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2025-01-08 14:32:15',
    user: 'admin@griver.com',
    action: 'Configuración actualizada',
    details: 'Cambió configuración de seguridad',
    severity: 'medium'
  },
  {
    id: '2',
    timestamp: '2025-01-08 13:45:22',
    user: 'rh@griver.com',
    action: 'Usuario creado',
    details: 'Nuevo empleado: Juan Pérez',
    severity: 'low'
  },
  {
    id: '3',
    timestamp: '2025-01-08 12:10:08',
    user: 'sistema',
    action: 'Respaldo automático',
    details: 'Respaldo completado exitosamente',
    severity: 'low'
  },
  {
    id: '4',
    timestamp: '2025-01-08 11:55:33',
    user: 'admin@griver.com',
    action: 'Intento de acceso sospechoso',
    details: 'IP: 192.168.1.100 - Bloqueado',
    severity: 'high'
  },
  {
    id: '5',
    timestamp: '2025-01-08 10:20:12',
    user: 'rh@griver.com',
    action: 'Curso publicado',
    details: 'Seguridad en el Trabajo v2.1',
    severity: 'low'
  }
];

export default function SystemSettings() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>(mockSystemStats);
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [auditFilter, setAuditFilter] = useState('all');

  // Verificar si el usuario tiene permisos de administrador
  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground">
              Solo los administradores pueden acceder a la configuración del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la llamada real a la API
      console.log('Saving configuration:', config);
      
      toast.success('Configuración guardada exitosamente');
      setHasChanges(false);
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast.info('Configuración restaurada a valores por defecto');
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `griver-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuración exportada');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setConfig(imported);
          setHasChanges(true);
          toast.success('Configuración importada exitosamente');
        } catch (error) {
          toast.error('Error al importar la configuración');
        }
      };
      reader.readAsText(file);
    }
  };

  const refreshSystemStats = async () => {
    setRefreshingStats(true);
    try {
      // Simular llamada a API para obtener estadísticas en tiempo real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular datos actualizados
      const updatedStats: SystemStats = {
        ...mockSystemStats,
        activeUsers: mockSystemStats.activeUsers + Math.floor(Math.random() * 10) - 5,
        memoryUsage: Math.max(10, Math.min(90, systemStats.memoryUsage + Math.floor(Math.random() * 10) - 5)),
        cpuUsage: Math.max(5, Math.min(95, systemStats.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        apiCallsToday: systemStats.apiCallsToday + Math.floor(Math.random() * 100),
        errorRate: Math.max(0, Math.min(1, systemStats.errorRate + (Math.random() * 0.02) - 0.01)),
      };
      
      setSystemStats(updatedStats);
      toast.success('Estadísticas del sistema actualizadas');
    } catch (error) {
      toast.error('Error al actualizar estadísticas');
    } finally {
      setRefreshingStats(false);
    }
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Respaldo manual creado exitosamente');
      
      // Actualizar estadísticas
      setSystemStats(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString('es-ES')
      }));
    } catch (error) {
      toast.error('Error al crear respaldo manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Sistema restaurado desde respaldo');
    } catch (error) {
      toast.error('Error al restaurar desde respaldo');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMaintenanceMode = () => {
    updateConfig('general', 'maintenanceMode', !config.general.maintenanceMode);
    toast.info(
      config.general.maintenanceMode 
        ? 'Modo mantenimiento desactivado' 
        : 'Modo mantenimiento activado'
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filteredAuditLogs = auditFilter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.severity === auditFilter);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular actualizaciones ligeras de estadísticas
      setSystemStats(prev => ({
        ...prev,
        memoryUsage: Math.max(10, Math.min(90, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + Math.floor(Math.random() * 6) - 3)),
        apiCallsToday: prev.apiCallsToday + Math.floor(Math.random() * 10),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración global del Sistema Griver
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="destructive" className="animate-pulse">
              Cambios sin guardar
            </Badge>
          )}
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes cambios sin guardar. Recuerda guardar la configuración antes de salir.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="backup">Respaldos</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuración básica del sistema Griver
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nombre del Sistema</Label>
                  <Input
                    id="systemName"
                    value={config.general.systemName}
                    onChange={(e) => updateConfig('general', 'systemName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.general.supportEmail}
                    onChange={(e) => updateConfig('general', 'supportEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploadSize">Tamaño Máximo de Subida (MB)</Label>
                  <Input
                    id="uploadSize"
                    type="number"
                    min="1"
                    max="500"
                    value={config.general.maxCourseUploadSize}
                    onChange={(e) => updateConfig('general', 'maxCourseUploadSize', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="30"
                    max="1440"
                    value={config.general.sessionTimeout}
                    onChange={(e) => updateConfig('general', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cierre Automático de Sesión</Label>
                    <p className="text-sm text-muted-foreground">
                      Cerrar sesión automáticamente por inactividad
                    </p>
                  </div>
                  <Switch
                    checked={config.general.autoLogout}
                    onCheckedChange={(checked) => updateConfig('general', 'autoLogout', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear acceso al sistema para todos los usuarios excepto administradores
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.general.maintenanceMode && (
                      <Badge variant="destructive" className="animate-pulse">
                        Activo
                      </Badge>
                    )}
                    <Switch
                      checked={config.general.maintenanceMode}
                      onCheckedChange={toggleMaintenanceMode}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar información detallada de depuración en consola
                    </p>
                  </div>
                  <Switch
                    checked={config.general.debugMode}
                    onCheckedChange={(checked) => updateConfig('general', 'debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Statistics */}
        <TabsContent value="stats">
          <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <div>
                <h2>Estadísticas del Sistema</h2>
                <p className="text-muted-foreground">
                  Monitor en tiempo real del estado del Sistema Griver
                </p>
              </div>
              <Button 
                onClick={refreshSystemStats} 
                disabled={refreshingStats}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshingStats ? 'animate-spin' : ''}`} />
                {refreshingStats ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-griver-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                      <p className="text-2xl font-semibold">{systemStats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                      <p className="text-2xl font-semibold">{systemStats.activeUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-griver-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cursos Totales</p>
                      <p className="text-2xl font-semibold">{systemStats.totalCourses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-griver-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completados</p>
                      <p className="text-2xl font-semibold">{systemStats.completedCourses.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Rendimiento del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de CPU</span>
                      <span>{systemStats.cpuUsage}%</span>
                    </div>
                    <Progress value={systemStats.cpuUsage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de Memoria</span>
                      <span>{systemStats.memoryUsage}%</span>
                    </div>
                    <Progress value={systemStats.memoryUsage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de Disco</span>
                      <span>{systemStats.diskUsage}%</span>
                    </div>
                    <Progress value={systemStats.diskUsage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Información del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tiempo Activo</span>
                    <span className="text-sm font-medium">{systemStats.systemUptime}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tamaño BD</span>
                    <span className="text-sm font-medium">{systemStats.dbSize}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado Red</span>
                    <Badge 
                      variant={systemStats.networkStatus === 'online' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {systemStats.networkStatus}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Último Respaldo</span>
                    <span className="text-sm font-medium">{systemStats.lastBackup}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">APIs Hoy</span>
                    <span className="text-sm font-medium">{systemStats.apiCallsToday.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasa de Error</span>
                    <Badge 
                      variant={systemStats.errorRate < 0.05 ? 'default' : 'destructive'}
                    >
                      {(systemStats.errorRate * 100).toFixed(2)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Gestiona cómo y cuándo se envían las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {key === 'emailNotifications' && 'Notificaciones por Email'}
                      {key === 'pushNotifications' && 'Notificaciones Push'}
                      {key === 'courseReminders' && 'Recordatorios de Cursos'}
                      {key === 'completionCertificates' && 'Certificados de Completación'}
                      {key === 'weeklyReports' && 'Reportes Semanales'}
                      {key === 'systemAlerts' && 'Alertas del Sistema'}
                      {key === 'auditReports' && 'Reportes de Auditoría'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'emailNotifications' && 'Enviar notificaciones por correo electrónico'}
                      {key === 'pushNotifications' && 'Mostrar notificaciones en el navegador'}
                      {key === 'courseReminders' && 'Recordar cursos pendientes a los usuarios'}
                      {key === 'completionCertificates' && 'Enviar certificados al completar cursos'}
                      {key === 'weeklyReports' && 'Enviar resumen semanal a administradores'}
                      {key === 'systemAlerts' && 'Notificar eventos críticos del sistema'}
                      {key === 'auditReports' && 'Informes automáticos de actividad de seguridad'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateConfig('notifications', key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Políticas de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    min="6"
                    max="20"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Máximo Intentos de Login</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutTime">Tiempo de Bloqueo (minutos)</Label>
                  <Input
                    id="lockoutTime"
                    type="number"
                    min="5"
                    max="60"
                    value={config.security.accountLockoutTime}
                    onChange={(e) => updateConfig('security', 'accountLockoutTime', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Requisitos de Contraseña</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir Mayúsculas</Label>
                    <p className="text-sm text-muted-foreground">
                      Al menos una letra mayúscula
                    </p>
                  </div>
                  <Switch
                    checked={config.security.requireUppercase}
                    onCheckedChange={(checked) => updateConfig('security', 'requireUppercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir Números</Label>
                    <p className="text-sm text-muted-foreground">
                      Al menos un dígito
                    </p>
                  </div>
                  <Switch
                    checked={config.security.requireNumbers}
                    onCheckedChange={(checked) => updateConfig('security', 'requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir Caracteres Especiales</Label>
                    <p className="text-sm text-muted-foreground">
                      Al menos un símbolo (!@#$%^&*)
                    </p>
                  </div>
                  <Switch
                    checked={config.security.requireSpecialChars}
                    onCheckedChange={(checked) => updateConfig('security', 'requireSpecialChars', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Seguridad Avanzada</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir 2FA para todos los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={config.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateConfig('security', 'twoFactorAuth', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lista Blanca de IPs</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir acceso solo desde IPs autorizadas
                    </p>
                  </div>
                  <Switch
                    checked={config.security.ipWhitelist}
                    onCheckedChange={(checked) => updateConfig('security', 'ipWhitelist', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Encriptación de Sesiones</Label>
                    <p className="text-sm text-muted-foreground">
                      Encriptar datos de sesión de usuario
                    </p>
                  </div>
                  <Switch
                    checked={config.security.sessionEncryption}
                    onCheckedChange={(checked) => updateConfig('security', 'sessionEncryption', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configuración de Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={config.appearance.language}
                    onChange={(e) => updateConfig('appearance', 'language', e.target.value)}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={config.appearance.timezone}
                    onChange={(e) => updateConfig('appearance', 'timezone', e.target.value)}
                  >
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                    <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                    <option value="America/New_York">Nueva York (UTC-5)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Utilizar tema oscuro por defecto
                    </p>
                  </div>
                  <Switch
                    checked={config.appearance.darkMode}
                    onCheckedChange={(checked) => updateConfig('appearance', 'darkMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reducir espaciado para mostrar más contenido
                    </p>
                  </div>
                  <Switch
                    checked={config.appearance.compactMode}
                    onCheckedChange={(checked) => updateConfig('appearance', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Logo Personalizado</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar logo personalizado de la empresa
                    </p>
                  </div>
                  <Switch
                    checked={config.appearance.customLogo}
                    onCheckedChange={(checked) => updateConfig('appearance', 'customLogo', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Colores de Marca</Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar colores corporativos de Griver
                    </p>
                  </div>
                  <Switch
                    checked={config.appearance.brandColors}
                    onCheckedChange={(checked) => updateConfig('appearance', 'brandColors', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración de Respaldos
              </CardTitle>
              <CardDescription>
                Gestiona las copias de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Respaldo Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Crear respaldos automáticos del sistema
                  </p>
                </div>
                <Switch
                  checked={config.backup.autoBackup}
                  onCheckedChange={(checked) => updateConfig('backup', 'autoBackup', checked)}
                />
              </div>

              {config.backup.autoBackup && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia de Respaldo</Label>
                      <select
                        id="frequency"
                        className="w-full p-2 border border-input rounded-md bg-background"
                        value={config.backup.backupFrequency}
                        onChange={(e) => updateConfig('backup', 'backupFrequency', e.target.value)}
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retention">Período de Retención (días)</Label>
                      <Input
                        id="retention"
                        type="number"
                        min="7"
                        max="365"
                        value={config.backup.retentionPeriod}
                        onChange={(e) => updateConfig('backup', 'retentionPeriod', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Respaldo en la Nube</Label>
                        <p className="text-sm text-muted-foreground">
                          Guardar respaldos en almacenamiento en la nube
                        </p>
                      </div>
                      <Switch
                        checked={config.backup.cloudBackup}
                        onCheckedChange={(checked) => updateConfig('backup', 'cloudBackup', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Encriptar Respaldos</Label>
                        <p className="text-sm text-muted-foreground">
                          Proteger respaldos con encriptación AES-256
                        </p>
                      </div>
                      <Switch
                        checked={config.backup.encryptBackups}
                        onCheckedChange={(checked) => updateConfig('backup', 'encryptBackups', checked)}
                      />
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Los respaldos se crean automáticamente según la frecuencia configurada. 
                      Se mantendrán durante {config.backup.retentionPeriod} días.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <h4>Acciones de Respaldo</h4>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleManualBackup}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isLoading ? 'Creando...' : 'Crear Respaldo Manual'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRestoreBackup}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isLoading ? 'Restaurando...' : 'Restaurar desde Respaldo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración de Integraciones
              </CardTitle>
              <CardDescription>
                Gestiona las integraciones externas y APIs del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>APIs Habilitadas</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecciona las APIs que estarán disponibles para el sistema
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="rest-api"
                        checked={config.integrations.enabledAPIs.includes('rest')}
                        onChange={(e) => {
                          const apis = e.target.checked 
                            ? [...config.integrations.enabledAPIs, 'rest']
                            : config.integrations.enabledAPIs.filter(api => api !== 'rest');
                          updateConfig('integrations', 'enabledAPIs', apis);
                        }}
                      />
                      <Label htmlFor="rest-api">REST API</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="graphql-api"
                        checked={config.integrations.enabledAPIs.includes('graphql')}
                        onChange={(e) => {
                          const apis = e.target.checked 
                            ? [...config.integrations.enabledAPIs, 'graphql']
                            : config.integrations.enabledAPIs.filter(api => api !== 'graphql');
                          updateConfig('integrations', 'enabledAPIs', apis);
                        }}
                      />
                      <Label htmlFor="graphql-api">GraphQL API</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook">URL de Webhook</Label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://api.empresa.com/webhook"
                    value={config.integrations.webhookUrl}
                    onChange={(e) => updateConfig('integrations', 'webhookUrl', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL para recibir notificaciones de eventos del sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sso">Proveedor SSO</Label>
                  <select
                    id="sso"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={config.integrations.ssoProvider}
                    onChange={(e) => updateConfig('integrations', 'ssoProvider', e.target.value)}
                  >
                    <option value="none">Sin SSO</option>
                    <option value="google">Google</option>
                    <option value="microsoft">Microsoft</option>
                    <option value="okta">Okta</option>
                    <option value="auth0">Auth0</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Integración LDAP</Label>
                    <p className="text-sm text-muted-foreground">
                      Conectar con directorio corporativo LDAP/Active Directory
                    </p>
                  </div>
                  <Switch
                    checked={config.integrations.ldapIntegration}
                    onCheckedChange={(checked) => updateConfig('integrations', 'ldapIntegration', checked)}
                  />
                </div>
              </div>

              <Separator />

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Las integraciones externas requieren configuración adicional de API keys y 
                  certificados. Contacta al administrador de sistemas para la configuración completa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Registro de Auditoría
                  </CardTitle>
                  <CardDescription>
                    Historial de acciones y eventos del sistema Griver
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="p-2 border border-input rounded-md bg-background"
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                  >
                    <option value="all">Todos los eventos</option>
                    <option value="critical">Críticos</option>
                    <option value="high">Altos</option>
                    <option value="medium">Medios</option>
                    <option value="low">Bajos</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{log.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>👤 {log.user}</span>
                        <span>🕒 {log.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAuditLogs.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No hay registros</h3>
                  <p className="text-muted-foreground">
                    No se encontraron eventos para el filtro seleccionado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectan todo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h4>Restaurar Configuración</h4>
              <p className="text-sm text-muted-foreground">
                Restaurar toda la configuración a los valores por defecto
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset}>
              <Trash2 className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}