import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, Users, Building, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface Department {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  parentId?: string;
}

interface DepartmentSelectorProps {
  selectedDepartments: string[];
  onSelectionChange: (departments: string[]) => void;
  className?: string;
}

// Datos de ejemplo de departamentos de Griver
const GRIVER_DEPARTMENTS: Department[] = [
  {
    id: 'all',
    name: 'Todos los Departamentos',
    description: 'Curso visible para toda la organización',
    userCount: 250,
  },
  {
    id: 'development',
    name: 'Desarrollo de Software',
    description: 'Equipo de desarrollo y tecnología',
    userCount: 45,
  },
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Desarrolladores de interfaces de usuario',
    userCount: 18,
    parentId: 'development',
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Desarrolladores de servicios y APIs',
    userCount: 15,
    parentId: 'development',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Infraestructura y despliegue',
    userCount: 8,
    parentId: 'development',
  },
  {
    id: 'qa',
    name: 'Quality Assurance',
    description: 'Testing y control de calidad',
    userCount: 12,
    parentId: 'development',
  },
  {
    id: 'design',
    name: 'Diseño y UX',
    description: 'Diseñadores y especialistas en experiencia de usuario',
    userCount: 25,
  },
  {
    id: 'ux',
    name: 'UX Research',
    description: 'Investigación de experiencia de usuario',
    userCount: 8,
    parentId: 'design',
  },
  {
    id: 'ui',
    name: 'UI Design',
    description: 'Diseño de interfaces',
    userCount: 12,
    parentId: 'design',
  },
  {
    id: 'graphic',
    name: 'Diseño Gráfico',
    description: 'Diseño gráfico y branding',
    userCount: 5,
    parentId: 'design',
  },
  {
    id: 'marketing',
    name: 'Marketing y Comunicación',
    description: 'Marketing digital y comunicación corporativa',
    userCount: 32,
  },
  {
    id: 'digital-marketing',
    name: 'Marketing Digital',
    description: 'Estrategias digitales y SEO',
    userCount: 15,
    parentId: 'marketing',
  },
  {
    id: 'content',
    name: 'Creación de Contenido',
    description: 'Copywriting y content marketing',
    userCount: 10,
    parentId: 'marketing',
  },
  {
    id: 'social-media',
    name: 'Redes Sociales',
    description: 'Gestión de redes sociales',
    userCount: 7,
    parentId: 'marketing',
  },
  {
    id: 'sales',
    name: 'Ventas',
    description: 'Equipo comercial y ventas',
    userCount: 28,
  },
  {
    id: 'inside-sales',
    name: 'Ventas Internas',
    description: 'Ventas telefónicas y online',
    userCount: 12,
    parentId: 'sales',
  },
  {
    id: 'field-sales',
    name: 'Ventas de Campo',
    description: 'Ventas presenciales y territorio',
    userCount: 16,
    parentId: 'sales',
  },
  {
    id: 'hr',
    name: 'Recursos Humanos',
    description: 'Gestión de talento y desarrollo organizacional',
    userCount: 18,
  },
  {
    id: 'talent',
    name: 'Gestión de Talento',
    description: 'Reclutamiento y desarrollo',
    userCount: 8,
    parentId: 'hr',
  },
  {
    id: 'compensation',
    name: 'Compensación y Beneficios',
    description: 'Nóminas y beneficios',
    userCount: 5,
    parentId: 'hr',
  },
  {
    id: 'training',
    name: 'Capacitación',
    description: 'Desarrollo y capacitación',
    userCount: 5,
    parentId: 'hr',
  },
  {
    id: 'finance',
    name: 'Finanzas y Administración',
    description: 'Gestión financiera y administrativa',
    userCount: 22,
  },
  {
    id: 'accounting',
    name: 'Contabilidad',
    description: 'Contabilidad y finanzas',
    userCount: 12,
    parentId: 'finance',
  },
  {
    id: 'admin',
    name: 'Administración',
    description: 'Servicios administrativos',
    userCount: 10,
    parentId: 'finance',
  },
  {
    id: 'operations',
    name: 'Operaciones',
    description: 'Gestión de operaciones y procesos',
    userCount: 35,
  },
  {
    id: 'support',
    name: 'Soporte al Cliente',
    description: 'Atención y soporte técnico',
    userCount: 20,
    parentId: 'operations',
  },
  {
    id: 'logistics',
    name: 'Logística',
    description: 'Gestión de inventario y envíos',
    userCount: 15,
    parentId: 'operations',
  },
  {
    id: 'interns',
    name: 'Becarios',
    description: 'Estudiantes en prácticas',
    userCount: 25,
  },
];

export function DepartmentSelector({ selectedDepartments, onSelectionChange, className }: DepartmentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>(['development', 'design', 'marketing']);

  // Filtrar departamentos por búsqueda
  const filteredDepartments = GRIVER_DEPARTMENTS.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener departamentos padre (sin parentId)
  const parentDepartments = filteredDepartments.filter(dept => !dept.parentId);
  
  // Obtener departamentos hijo para un padre específico
  const getChildDepartments = (parentId: string) =>
    filteredDepartments.filter(dept => dept.parentId === parentId);

  const handleDepartmentToggle = (departmentId: string) => {
    const isSelected = selectedDepartments.includes(departmentId);
    let newSelection: string[] = [];

    if (departmentId === 'all') {
      // Si selecciona "Todos", deseleccionar todo lo demás o seleccionar solo "Todos"
      newSelection = isSelected ? [] : ['all'];
    } else {
      // Remover "Todos" si está seleccionado
      const currentWithoutAll = selectedDepartments.filter(id => id !== 'all');
      
      if (isSelected) {
        // Deseleccionar el departamento
        newSelection = currentWithoutAll.filter(id => id !== departmentId);
        
        // Si es un departamento padre, deseleccionar también los hijos
        const childDepts = getChildDepartments(departmentId);
        newSelection = newSelection.filter(id => !childDepts.some(child => child.id === id));
      } else {
        // Seleccionar el departamento
        newSelection = [...currentWithoutAll, departmentId];
        
        // Si es un hijo, verificar si se deben seleccionar hermanos o padre
        const department = GRIVER_DEPARTMENTS.find(d => d.id === departmentId);
        if (department?.parentId) {
          const siblings = getChildDepartments(department.parentId);
          const selectedSiblings = newSelection.filter(id => siblings.some(s => s.id === id));
          
          // Si todos los hermanos están seleccionados, seleccionar también el padre
          if (selectedSiblings.length === siblings.length) {
            newSelection.push(department.parentId);
          }
        }
      }
    }

    onSelectionChange(newSelection);
  };

  const handleParentToggle = (parentId: string) => {
    const isParentSelected = selectedDepartments.includes(parentId);
    const childDepartments = getChildDepartments(parentId);
    let newSelection = selectedDepartments.filter(id => id !== 'all');

    if (isParentSelected) {
      // Deseleccionar padre y todos sus hijos
      newSelection = newSelection.filter(id => 
        id !== parentId && !childDepartments.some(child => child.id === id)
      );
    } else {
      // Seleccionar padre y todos sus hijos
      newSelection = newSelection.filter(id => !childDepartments.some(child => child.id === id));
      newSelection.push(parentId, ...childDepartments.map(child => child.id));
    }

    onSelectionChange(newSelection);
  };

  const toggleExpanded = (departmentId: string) => {
    setExpandedDepartments(prev =>
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const getSelectedCount = () => {
    if (selectedDepartments.includes('all')) {
      return GRIVER_DEPARTMENTS.find(d => d.id === 'all')?.userCount || 0;
    }
    return selectedDepartments.reduce((count, deptId) => {
      const dept = GRIVER_DEPARTMENTS.find(d => d.id === deptId);
      return count + (dept?.userCount || 0);
    }, 0);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Departamentos Objetivo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getSelectedCount()} usuarios seleccionados
            </Badge>
            {selectedDepartments.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar departamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Departamentos seleccionados */}
        {selectedDepartments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seleccionados:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedDepartments.map(deptId => {
                const dept = GRIVER_DEPARTMENTS.find(d => d.id === deptId);
                return dept ? (
                  <Badge key={deptId} variant="default" className="gap-1">
                    {dept.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDepartmentToggle(deptId)}
                      className="h-auto p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Lista de departamentos */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Opción "Todos" */}
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
            <Checkbox
              id="all"
              checked={selectedDepartments.includes('all')}
              onCheckedChange={() => handleDepartmentToggle('all')}
            />
            <div className="flex-1">
              <Label htmlFor="all" className="cursor-pointer font-medium">
                Todos los Departamentos
              </Label>
              <p className="text-sm text-muted-foreground">
                Curso visible para toda la organización (250 usuarios)
              </p>
            </div>
            <Badge variant="outline">250</Badge>
          </div>

          {/* Departamentos organizados jerárquicamente */}
          {parentDepartments.filter(dept => dept.id !== 'all').map(parentDept => {
            const childDepts = getChildDepartments(parentDept.id);
            const hasChildren = childDepts.length > 0;
            const isExpanded = expandedDepartments.includes(parentDept.id);
            const isParentSelected = selectedDepartments.includes(parentDept.id);
            const selectedChildren = childDepts.filter(child => 
              selectedDepartments.includes(child.id)
            ).length;

            return (
              <div key={parentDept.id} className="space-y-1">
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                  <Checkbox
                    id={parentDept.id}
                    checked={isParentSelected}
                    onCheckedChange={() => handleParentToggle(parentDept.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={parentDept.id} className="cursor-pointer font-medium">
                        {parentDept.name}
                      </Label>
                      {hasChildren && selectedChildren > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedChildren}/{childDepts.length}
                        </Badge>
                      )}
                    </div>
                    {parentDept.description && (
                      <p className="text-sm text-muted-foreground">
                        {parentDept.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{parentDept.userCount}</Badge>
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(parentDept.id)}
                        className="h-auto p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Departamentos hijo */}
                {hasChildren && (
                  <Collapsible open={isExpanded}>
                    <CollapsibleContent className="pl-6 space-y-1">
                      {childDepts.map(childDept => (
                        <div
                          key={childDept.id}
                          className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent"
                        >
                          <Checkbox
                            id={childDept.id}
                            checked={selectedDepartments.includes(childDept.id)}
                            onCheckedChange={() => handleDepartmentToggle(childDept.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={childDept.id} className="cursor-pointer text-sm">
                              {childDept.name}
                            </Label>
                            {childDept.description && (
                              <p className="text-xs text-muted-foreground">
                                {childDept.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {childDept.userCount}
                          </Badge>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron departamentos</p>
            <p className="text-sm">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}