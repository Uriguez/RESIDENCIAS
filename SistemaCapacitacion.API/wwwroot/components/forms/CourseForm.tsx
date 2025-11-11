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
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { X, Upload, Plus, Calendar, Users, Clock, Target } from 'lucide-react';
import { COURSE_CATEGORIES } from '../../utils/constants';
import { Course, CourseContent } from '../../types';
import { DepartmentSelector } from '../DepartmentSelector';
import { toast } from 'sonner@2.0.3';

const courseSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'Máximo 1000 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.number().min(1, 'El tiempo estimado es requerido'),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.number().optional(),
  prerequisites: z.string().optional(),
  targetDepartments: z.array(z.string()).min(1, 'Debe seleccionar al menos un departamento'),
  isRequired: z.boolean().default(false),
  sendNotifications: z.boolean().default(true),
  allowSelfEnrollment: z.boolean().default(true)
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormData & { content?: CourseContent[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  userRole?: string;
}

export function CourseForm({ course, onSubmit, onCancel, isLoading, userRole }: CourseFormProps) {
  const [tags, setTags] = useState<string[]>(course?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState<CourseContent[]>(course?.content || []);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(course?.targetDepartments || []);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      category: course?.category?.id || '',
      difficulty: course?.difficulty || 'beginner',
      estimatedTime: course?.estimatedTime || 60,
      thumbnail: course?.thumbnail || '',
      tags: tags,
      isActive: course?.isActive ?? true,
      startDate: course?.startDate || '',
      endDate: course?.endDate || '',
      maxParticipants: course?.maxParticipants || undefined,
      prerequisites: course?.prerequisites || '',
      targetDepartments: selectedDepartments,
      isRequired: course?.isRequired ?? false,
      sendNotifications: course?.sendNotifications ?? true,
      allowSelfEnrollment: course?.allowSelfEnrollment ?? true
    }
  });

  const handleSubmit = (data: CourseFormData) => {
    // Validar que se hayan seleccionado departamentos
    if (selectedDepartments.length === 0) {
      toast.error('Debe seleccionar al menos un departamento objetivo');
      return;
    }

    onSubmit({
      ...data,
      tags,
      content,
      targetDepartments: selectedDepartments
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const addContent = () => {
    const newContent: CourseContent = {
      id: Date.now().toString(),
      title: '',
      type: 'video',
      duration: '0',
      completed: false,
      order: content.length,
      isRequired: true
    };
    setContent([...content, newContent]);
  };

  const updateContent = (index: number, updatedContent: Partial<CourseContent>) => {
    const newContentArray = [...content];
    newContentArray[index] = { ...newContentArray[index], ...updatedContent };
    setContent(newContentArray);
  };

  const removeContent = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Curso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Seguridad Laboral Básica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el contenido y objetivos del curso..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría y Dificultad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COURSE_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dificultad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar dificultad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tiempo estimado y límite de participantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo Estimado (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Tiempo aproximado para completar todo el curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Participantes (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Sin límite"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Límite de usuarios que pueden inscribirse
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Thumbnail */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen del Curso (URL)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://ejemplo.com/imagen.jpg"
                        {...field}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    URL de la imagen que representa el curso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fechas del curso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cuándo estará disponible el curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Finalización (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cuándo ya no estará disponible
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Prerequisites */}
            <FormField
              control={form.control}
              name="prerequisites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prerrequisitos (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe los conocimientos o cursos previos necesarios..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Conocimientos o cursos que deben completarse antes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <FormLabel>Etiquetas</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Departamentos Objetivo */}
        <DepartmentSelector
          selectedDepartments={selectedDepartments}
          onSelectionChange={(departments) => {
            setSelectedDepartments(departments);
            form.setValue('targetDepartments', departments);
          }}
        />

        {/* Configuración Avanzada */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuración del Curso
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? 'Menos opciones' : 'Más opciones'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Opciones básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Curso Activo</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Los usuarios pueden ver e inscribirse al curso
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Curso Obligatorio</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Los usuarios deben completar este curso
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Opciones avanzadas */}
            {showAdvancedOptions && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Inscripción Automática</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Los usuarios pueden inscribirse por sí mismos
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="allowSelfEnrollment"
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
                      <FormLabel>Enviar Notificaciones</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Notificar a usuarios sobre el curso
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="sendNotifications"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contenido del curso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contenido del Curso</CardTitle>
            <Button type="button" onClick={addContent} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Agregar Contenido
            </Button>
          </CardHeader>
          <CardContent>
            {content.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay contenido agregado. Haz clic en "Agregar Contenido" para empezar.
              </p>
            ) : (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Título del contenido"
                          value={item.title}
                          onChange={(e) => updateContent(index, { title: e.target.value })}
                        />
                        <Select
                          value={item.type}
                          onValueChange={(value) => updateContent(index, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="document">Documento</SelectItem>
                            <SelectItem value="quiz">Cuestionario</SelectItem>
                            <SelectItem value="interactive">Interactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Duración"
                            value={item.duration}
                            onChange={(e) => updateContent(index, { duration: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeContent(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : course ? 'Actualizar Curso' : 'Crear Curso'}
          </Button>
        </div>
      </form>
    </Form>
  );
}