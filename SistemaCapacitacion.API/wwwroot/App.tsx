import { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginForm } from './components/LoginForm';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminHeader } from './components/AdminHeader';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toaster } from './components/ui/sonner';

// Lazy load admin components for better performance
const CourseManagement = lazy(() => import('./components/CourseManagement'));
const StudentManagement = lazy(() => import('./components/StudentManagement'));
const CoursesProgress = lazy(() => import('./components/CoursesProgress'));
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));
const SystemSettings = lazy(() => import('./components/SystemSettings'));
const CrystalReportsManager = lazy(() => import('./components/CrystalReportsManager'));

interface AdminContentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

function AdminContent({ activeSection, setActiveSection }: AdminContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigateToSettings={() => setActiveSection('settings')} />;
      case 'courses':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando gestión de cursos..." />}>
            <CourseManagement />
          </Suspense>
        );
      case 'students':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando gestión de usuarios..." />}>
            <StudentManagement />
          </Suspense>
        );
      case 'progress':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando progreso de cursos..." />}>
            <CoursesProgress />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando analíticas avanzadas..." />}>
            <AdvancedAnalytics />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando sistema de reportes..." />}>
            <CrystalReportsManager />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Cargando configuración del sistema..." />}>
            <SystemSettings />
          </Suspense>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error en la sección</h2>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error al cargar esta sección del sistema.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      }
    >
      {renderContent()}
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Loading state with enhanced UX
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-xl">G</span>
          </div>
          <LoadingSpinner size="lg" text="Inicializando Sistema Griver..." />
          <p className="text-sm text-muted-foreground max-w-sm">
            Cargando tu workspace de capacitación empresarial
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar login
  if (!user) {
    return <LoginForm />;
  }

  // Si es empleado o becario, mostrar vista de cliente
  if (user.role === 'employee' || user.role === 'intern') {
    return (
      <ErrorBoundary>
        <ClientDashboard />
      </ErrorBoundary>
    );
  }

  // Si es administrador o RH, mostrar panel completo
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ErrorBoundary
        fallback={
          <div className="w-64 bg-sidebar border-r border-sidebar-border flex items-center justify-center">
            <div className="text-center p-4">
              <h3 className="font-medium text-sidebar-foreground">Error en navegación</h3>
              <p className="text-sm text-sidebar-foreground/70 mt-1">
                La barra lateral no pudo cargar
              </p>
            </div>
          </div>
        }
      >
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          userRole={user.role}
        />
      </ErrorBoundary>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ErrorBoundary
          fallback={
            <div className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-center">
              <span className="text-sidebar-foreground text-sm">Error en el header</span>
            </div>
          }
        >
          <AdminHeader onNavigateToSettings={() => setActiveSection('settings')} />
        </ErrorBoundary>
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <AdminContent activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Error crítico del sistema</h1>
            <p className="text-muted-foreground mb-6">
              El sistema Griver ha encontrado un error crítico. Por favor, contacta al administrador o recarga la página.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Recargar Sistema
              </button>
              <a 
                href="mailto:soporte@griver.com"
                className="px-4 py-2 border border-border rounded-md hover:bg-accent"
              >
                Contactar Soporte
              </a>
            </div>
          </div>
        </div>
      }
    >
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}