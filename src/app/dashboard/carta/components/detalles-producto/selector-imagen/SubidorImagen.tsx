// src/app/dashboard/carta/components/detalles-producto/selector-imagen/SubidorImagen.tsx
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';

interface SubidorImagenProps {
  onUpload: (imageUrl: string) => void;
  imagenPrevia?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSIONS = { width: 400, height: 300 };

export function SubidorImagen({ onUpload, imagenPrevia }: SubidorImagenProps) {
  const [arrastrandoArchivo, setArrastrandoArchivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(imagenPrevia || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validarImagen = async (file: File): Promise<boolean> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato de archivo no soportado. Use JPG, PNG o WebP.');
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError('La imagen no debe superar los 5MB.');
      return false;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
          setError(`La imagen debe ser al menos de ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} píxeles.`);
          resolve(false);
        }
        resolve(true);
      };
    });
  };

  const procesarArchivo = async (file: File) => {
    setError(null);
    
    if (await validarImagen(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrandoArchivo(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await procesarArchivo(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await procesarArchivo(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${arrastrandoArchivo ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}
          ${preview ? 'border-solid' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrandoArchivo(true);
        }}
        onDragLeave={() => setArrastrandoArchivo(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-48 object-contain mx-auto rounded"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-600">
              Arrastra y suelta una imagen aquí o
            </p>
            <Button
              variant="ghost"
              className="mt-1"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              selecciona un archivo
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
        />
      </div>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información de requisitos */}
      <div className="text-sm text-neutral-500 space-y-1">
        <p>Requisitos de la imagen:</p>
        <ul className="list-disc list-inside pl-4">
          <li>Formatos soportados: JPG, PNG, WebP</li>
          <li>Tamaño máximo: 5MB</li>
          <li>Dimensiones mínimas: {MIN_DIMENSIONS.width}x{MIN_DIMENSIONS.height}px</li>
          <li>Preferiblemente en formato horizontal</li>
        </ul>
      </div>
    </div>
  );
}
