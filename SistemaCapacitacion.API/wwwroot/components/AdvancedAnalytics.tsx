import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Download,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const COLORS = ['#1a365d', '#2b77ad', '#ff6b35', '#38a169', '#d69e2e'];

const mockMonthlyData = [
  { month: 'Ene', enrollments: 45, completions: 32, users: 125 },
  { month: 'Feb', enrollments: 52, completions: 38, users: 142 },
  { month: 'Mar', enrollments: 67, completions: 45, users: 158 },
  { month: 'Abr', enrollments: 58, completions: 42, users: 174 },
  { month: 'May', enrollments: 71, completions: 56, users: 189 },
  { month: 'Jun', enrollments: 63, completions: 51, users: 203 }
];

const mockCourseData = [
  { name: 'Seguridad Laboral', enrollments: 95, completions: 87, satisfaction: 4.8 },
  { name: 'Cultura Organizacional', enrollments: 78, completions: 72, satisfaction: 4.6 },
  { name: 'Procedimientos de Emergencia', enrollments: 62, completions: 48, satisfaction: 4.3 },
  { name: 'Desarrollo Profesional', enrollments: 45, completions: 32, satisfaction: 4.4 },
  { name: 'Comunicación Efectiva', enrollments: 38, completions: 28, satisfaction: 4.5 }
];

const mockDepartmentData = [
  { name: 'Desarrollo', value: 35, users: 45 },
  { name: 'Marketing', value: 25, users: 32 },
  { name: 'Ventas', value: 20, users: 28 },
  { name: 'RRHH', value: 12, users: 18 },
  { name: 'Diseño', value: 8, users: 12 }
];

const mockProgressData = [
  { week: 'Sem 1', progress: 15 },
  { week: 'Sem 2', progress: 32 },
  { week: 'Sem 3', progress: 48 },
  { week: 'Sem 4', progress: 65 },
  { week: 'Sem 5', progress: 78 },
  { week: 'Sem 6', progress: 85 }
];

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  suffix = '', 
  description 
}: {
  title: string;
  value: number | string;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon: React.ElementType;
  suffix?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}{suffix}</div>
        {change && (
          <div className="flex items-center text-xs mt-1">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-griver-success mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-griver-error mr-1" />
            )}
            <span className={change.type === 'increase' ? 'text-griver-success' : 'text-griver-error'}>
              {Math.abs(change.value)}%
            </span>
            <span className="text-muted-foreground ml-1">vs mes anterior</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState('6months');

  const overallStats = useMemo(() => ({
    totalUsers: 245,
    activeUsers: 189,
    totalCourses: 18,
    completionRate: 82.5,
    avgSatisfaction: 4.6,
    totalCertificates: 156,
    totalHoursLearned: 2840
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analíticas Avanzadas</h1>
          <p className="text-muted-foreground">
            Análisis profundo del rendimiento del sistema de capacitación Griver
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Últimos 6 meses
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Usuarios Activos"
          value={overallStats.activeUsers}
          change={{ value: 12.5, type: 'increase' }}
          icon={Users}
          description="Usuarios con actividad reciente"
        />
        <MetricCard
          title="Tasa de Finalización"
          value={overallStats.completionRate}
          suffix="%"
          change={{ value: 5.2, type: 'increase' }}
          icon={Target}
          description="Promedio de todos los cursos"
        />
        <MetricCard
          title="Satisfacción Promedio"
          value={overallStats.avgSatisfaction}
          suffix="/5"
          change={{ value: 3.1, type: 'increase' }}
          icon={Award}
          description="Rating promedio de cursos"
        />
        <MetricCard
          title="Horas de Aprendizaje"
          value={Math.round(overallStats.totalHoursLearned / 60)}
          suffix="h"
          change={{ value: 18.7, type: 'increase' }}
          icon={Clock}
          description="Tiempo total invertido"
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="courses">Análisis por Curso</TabsTrigger>
          <TabsTrigger value="departments">Por Departamento</TabsTrigger>
          <TabsTrigger value="progress">Progreso Temporal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inscripciones vs Finalizaciones</CardTitle>
                <CardDescription>
                  Comparación mensual de inscripciones y cursos completados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#2b77ad" name="Inscripciones" />
                    <Bar dataKey="completions" fill="#38a169" name="Finalizaciones" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
                <CardDescription>
                  Evolución del número de usuarios activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#1a365d" 
                      fill="#1a365d" 
                      fillOpacity={0.3}
                      name="Usuarios"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Curso</CardTitle>
                <CardDescription>
                  Inscripciones y finalizaciones por curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mockCourseData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#2b77ad" name="Inscripciones" />
                    <Bar dataKey="completions" fill="#38a169" name="Completados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción por Curso</CardTitle>
                <CardDescription>
                  Rating promedio de cada curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourseData.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{course.name}</span>
                        <span className="text-griver-success font-medium">
                          {course.satisfaction}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-griver-success h-2 rounded-full"
                          style={{ width: `${(course.satisfaction / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Participación por Departamento</CardTitle>
                <CardDescription>
                  Distribución de usuarios por departamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockDepartmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockDepartmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas por Departamento</CardTitle>
                <CardDescription>
                  Detalle de participación y rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDepartmentData.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {dept.users} usuarios
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{dept.value}%</div>
                        <div className="text-xs text-muted-foreground">participación</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Progreso Promedio Semanal</CardTitle>
                <CardDescription>
                  Evolución del progreso promedio de todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#1a365d" 
                      strokeWidth={3}
                      name="Progreso (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Esta Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-griver-primary mb-2">85%</div>
                    <p className="text-sm text-muted-foreground">Progreso promedio</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      +7% vs semana anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Mejor Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-griver-success mb-2">92%</div>
                    <p className="text-sm text-muted-foreground">Máximo alcanzado</p>
                    <Badge variant="secondary" className="mt-2">
                      Semana 3 - Febrero
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Tendencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-griver-success" />
                      <span className="text-3xl font-bold text-griver-success">+15%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Crecimiento mensual</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      Tendencia positiva
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}