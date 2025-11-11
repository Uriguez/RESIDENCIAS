import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Camera, Upload, Trash2, User, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AvatarUploadProps {
  currentImage?: string;
  userName: string;
  onImageChange: (imageUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AvatarUpload({ 
  currentImage, 
  userName, 
  onImageChange, 
  size = 'md',
  disabled = false 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuración de tamaños
  const sizeConfig = {
    sm: { avatar: 'h-12 w-12', text: 'text-sm' },
    md: { avatar: 'h-20 w-20', text: 'text-base' },
    lg: { avatar: 'h-32 w-32', text: 'text-lg' }
  };

  const config = sizeConfig[size];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Simular subida de archivo (en producción sería un endpoint real)
  const simulateFileUpload = async (file: File): Promise<string> => {
    // Simular tiempo de subida
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En producción, aquí iría la llamada real a la API
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/upload/avatar', { method: 'POST', body: formData });
    // const result = await response.json();
    // return result.imageUrl;
    
    // Para el demo, crear una URL temporal
    return URL.createObjectURL(file);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de imagen no válido', {
        description: 'Solo se permiten archivos JPG, PNG, GIF y WebP'
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error('Archivo demasiado grande', {
        description: 'El tamaño máximo permitido es 5MB'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Crear preview inmediato
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Simular subida
      const uploadedUrl = await simulateFileUpload(file);
      
      // Notificar cambio
      onImageChange(uploadedUrl);
      
      toast.success('Imagen de perfil actualizada', {
        description: 'Tu nueva foto de perfil se ha guardado exitosamente'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen', {
        description: 'Inténtalo nuevamente o contacta al soporte técnico'
      });
      // Revertir preview en caso de error
      setPreviewImage(currentImage || null);
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange(null);
    
    toast.success('Imagen de perfil eliminada', {
      description: 'Tu foto de perfil ha sido removida'
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-griver-secondary" />
            <Label className="font-medium">Foto de Perfil</Label>
          </div>

          {/* Avatar Display */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={`${config.avatar} ring-2 ring-griver-primary/20`}>
                <AvatarImage 
                  src={previewImage || currentImage} 
                  alt={`Foto de perfil de ${userName}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-griver-primary text-white">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    getInitials(userName)
                  )}
                </AvatarFallback>
              </Avatar>
              
              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className={config.text}>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-muted-foreground">
                  {previewImage || currentImage ? 'Imagen personalizada' : 'Usando iniciales por defecto'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Instructions */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <ImageIcon className="h-4 w-4 mt-0.5 text-griver-info" />
              <div>
                <p className="font-medium mb-1">Recomendaciones para tu foto:</p>
                <ul className="space-y-1">
                  <li>• Formatos admitidos: JPG, PNG, GIF, WebP</li>
                  <li>• Tamaño máximo: 5MB</li>
                  <li>• Resolución recomendada: 400x400px mínimo</li>
                  <li>• Usa una imagen cuadrada para mejores resultados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleUploadClick}
              disabled={disabled || isUploading}
              className="flex-1 bg-griver-primary hover:bg-griver-secondary"
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {previewImage || currentImage ? 'Cambiar Foto' : 'Subir Foto'}
                </>
              )}
            </Button>
            
            {(previewImage || currentImage) && (
              <Button 
                variant="outline"
                onClick={handleRemoveImage}
                disabled={disabled || isUploading}
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Hidden File Input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </div>
      </CardContent>
    </Card>
  );
}