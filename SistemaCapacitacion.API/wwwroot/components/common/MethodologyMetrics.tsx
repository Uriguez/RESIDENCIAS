import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { useGriverAnalytics } from '../../hooks/useGriverAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  status?: 'excellent' | 'good' | 'needs_attention';
  description?: string;
  icon?: React.ElementType;
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  target, 
  status, 
  description, 
  icon: Icon 
}: MetricCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'excellent': return 'text-griver-success';
      case 'good': return 'text-griver-info';
      case 'needs_attention': return 'text-griver-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-griver-success" />;
      case 'good': return <Info className="h-4 w-4 text-griver-info" />;
      case 'needs_attention': return <AlertTriangle className="h-4 w-4 text-griver-warning" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-griver-success" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-griver-error" />;
      default: return null;
    }
  };

  const progressValue = target ? Math.min(100, (Number(value) / target) * 100) : undefined;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            {getStatusIcon(status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getStatusColor(status)}`}>
              {value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
            {getTrendIcon(trend)}
          </div>
          
          {target && progressValue !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Objetivo: {target}{unit}</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MethodologyMetrics() {
  const { 
    analyticsData, 
    getTeamPerformance, 
    getKanbanHealth,
    calculateFlowMetrics,
    exportData 
  } = useGriverAnalytics();

  const { kanbanMetrics } = analyticsData;
  const teamPerformance = getTeamPerformance();
  const kanbanHealth = getKanbanHealth();

  const handleRefreshMetrics = () => {
    calculateFlowMetrics();
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `griver_metrics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Métricas de Metodología Ágil</h3>
          <p className="text-sm text-muted-foreground">
            Kanban + Scrum • Última actualización: {' '}
            {new Date(analyticsData.lastUpdated).toLocaleTimeString('es-ES')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshMetrics}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estado General del Proceso
          </CardTitle>
          <CardDescription>
            Evaluación general del flujo de trabajo Kanban + Scrum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={kanbanHealth === 'excellent' ? 'default' : 
                          kanbanHealth === 'good' ? 'secondary' : 'destructive'}
                  className="capitalize"
                >
                  {kanbanHealth === 'excellent' ? 'Excelente' :
                   kanbanHealth === 'good' ? 'Bueno' : 'Necesita Atención'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Salud del proceso
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Velocidad: {teamPerformance.velocity} features/sprint • 
                Eficiencia: {teamPerformance.efficiency}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tendencia</p>
              <p className="font-medium flex items-center gap-1">
                {teamPerformance.trend}
                <TrendingUp className="h-4 w-4 text-griver-success" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Lead Time"
          value={kanbanMetrics.leadTime.toFixed(1)}
          unit=" días"
          target={3}
          trend={kanbanMetrics.leadTime < 3 ? 'up' : 'down'}
          status={kanbanMetrics.leadTime < 2 ? 'excellent' : 
                  kanbanMetrics.leadTime < 3 ? 'good' : 'needs_attention'}
          description="Tiempo total Backlog → Done"
          icon={Clock}
        />

        <MetricCard
          title="Cycle Time"
          value={kanbanMetrics.cycleTime.toFixed(1)}
          unit=" días"
          target={1.5}
          trend={kanbanMetrics.cycleTime < 1.5 ? 'up' : 'down'}
          status={kanbanMetrics.cycleTime < 1 ? 'excellent' : 
                  kanbanMetrics.cycleTime < 1.5 ? 'good' : 'needs_attention'}
          description="Tiempo Development → Done"
          icon={Target}
        />

        <MetricCard
          title="Throughput"
          value={kanbanMetrics.throughput}
          unit=" features"
          target={10}
          trend={kanbanMetrics.throughput >= 10 ? 'up' : 'down'}
          status={kanbanMetrics.throughput >= 10 ? 'excellent' : 
                  kanbanMetrics.throughput >= 8 ? 'good' : 'needs_attention'}
          description="Features por sprint"
          icon={BarChart3}
        />

        <MetricCard
          title="Flow Efficiency"
          value={kanbanMetrics.flowEfficiency.toFixed(1)}
          unit="%"
          target={80}
          trend={kanbanMetrics.flowEfficiency >= 80 ? 'up' : 'down'}
          status={kanbanMetrics.flowEfficiency >= 85 ? 'excellent' : 
                  kanbanMetrics.flowEfficiency >= 70 ? 'good' : 'needs_attention'}
          description="Trabajo vs tiempo de espera"
          icon={TrendingUp}
        />
      </div>

      {/* Recommendations */}
      {teamPerformance.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-griver-warning" />
              Recomendaciones de Mejora
            </CardTitle>
            <CardDescription>
              Sugerencias basadas en las métricas actuales del proceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {teamPerformance.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-griver-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Process Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo del Proceso Kanban</CardTitle>
          <CardDescription>
            Visualización del board y límites WIP actuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center space-y-1">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Backlog</p>
                <p className="text-xs text-muted-foreground">∞</p>
              </div>
              <p className="text-xs">Sin límite</p>
            </div>
            
            <div className="flex-1 h-px bg-border mx-2" />
            
            <div className="text-center space-y-1">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium">Analysis</p>
                <p className="text-xs text-blue-600">2</p>
              </div>
              <p className="text-xs">WIP: 2</p>
            </div>
            
            <div className="flex-1 h-px bg-border mx-2" />
            
            <div className="text-center space-y-1">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium">Development</p>
                <p className="text-xs text-yellow-600">1-2</p>
              </div>
              <p className="text-xs">WIP: 1-2</p>
            </div>
            
            <div className="flex-1 h-px bg-border mx-2" />
            
            <div className="text-center space-y-1">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium">Testing</p>
                <p className="text-xs text-orange-600">1</p>
              </div>
              <p className="text-xs">WIP: 1</p>
            </div>
            
            <div className="flex-1 h-px bg-border mx-2" />
            
            <div className="text-center space-y-1">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium">Review</p>
                <p className="text-xs text-purple-600">1</p>
              </div>
              <p className="text-xs">WIP: 1</p>
            </div>
            
            <div className="flex-1 h-px bg-border mx-2" />
            
            <div className="text-center space-y-1">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium">Done</p>
                <p className="text-xs text-green-600">∞</p>
              </div>
              <p className="text-xs">Sin límite</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}