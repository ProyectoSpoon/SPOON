/**
 * @fileoverview Componente para subir imágenes con previsualización y validaciones
 * @module SubidorImagen
 */

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';

/**
 * Tipos de archivos permitidos para la subida
 * @constant {string[]}
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Tamaño máximo permitido para las imágenes (5MB)
 * @constant {number}
 */
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Dimensiones mínimas requeridas para las imágenes
 * @constant {{ width: number, height: number }}
 */
const MIN_DIMENSIONS = {
  width: 400,
  height: 300
};

/**
 * Props para el componente SubidorImagen
 * @interface SubidorImagenProps
 */
interface SubidorImagenProps {
  /** Callback que se ejecuta cuando se sube una imagen exitosamente */
  onUpload: (imageUrl: string) => void;
  /** URL de la imagen previa (si existe) */
  imagenPrevia?: string;
}
/**
 * Componente para subir y previsualizar imágenes
 * @component
 * @param {SubidorImagenProps} props - Props del componente
 * @returns {JSX.Element} Elemento JSX que representa el componente de subida de imágenes
 */
export function SubidorImagen({ onUpload, imagenPrevia }: SubidorImagenProps): JSX.Element {
    /** Estado para controlar si se está arrastrando un archivo */
    const [arrastrandoArchivo, setArrastrandoArchivo] = useState<boolean>(false);
    /** Estado para manejar mensajes de error */
    const [error, setError] = useState<string | null>(null);
    /** Estado para la previsualización de la imagen */
    const [preview, setPreview] = useState<string | null>(imagenPrevia || null);
    /** Referencia al input de tipo file */
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    /**
     * Valida las características de la imagen
     * @param {File} file - Archivo a validar
     * @returns {Promise<boolean>} Promise que resuelve a true si la imagen es válida
     */
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
  
    /**
     * Procesa el archivo seleccionado
     * @param {File} file - Archivo a procesar
     */
    const procesarArchivo = async (file: File): Promise<void> => {
      setError(null);
      
      if (await validarImagen(file)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPreview(base64String);
          onUpload(base64String);
        };
        reader.readAsDataURL(file);
      }
    };
  
    /**
     * Maneja el click en el área de subida
     * @param {React.MouseEvent} e - Evento del mouse
     */
    const handleClick = (e: React.MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    };
  
    /**
     * Maneja el evento de arrastrar sobre el área de subida
     * @param {React.DragEvent<HTMLDivElement>} e - Evento de arrastre
     */
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setArrastrandoArchivo(true);
    };
  
    /**
     * Maneja el evento de salir del área de arrastre
     * @param {React.DragEvent<HTMLDivElement>} e - Evento de arrastre
     */
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setArrastrandoArchivo(false);
    };
  
    /**
     * Maneja la acción de soltar un archivo
     * @param {React.DragEvent<HTMLDivElement>} e - Evento de arrastre
     */
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
      e.preventDefault();
      e.stopPropagation();
      setArrastrandoArchivo(false);
  
      const file = e.dataTransfer.files[0];
      if (file) {
        await procesarArchivo(file);
      }
    };
  
    return (
      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8
            transition-colors duration-200
            ${arrastrandoArchivo ? 'border-primary bg-primary/5' : 'border-neutral-200'}
            ${preview ? 'border-solid' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(e) => e.stopPropagation()}
        >
          {preview ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-48 object-contain mx-auto rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
              onClick={handleClick}
            >
              <Upload className="mx-auto h-12 w-12 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-600">
                Arrastra y suelta una imagen aquí o
              </p>
              <Button
                type="button"
                variant="link"
                className="mt-1"
                onClick={handleClick}
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
            onChange={(e) => {
              e.stopPropagation();
              const file = e.target.files?.[0];
              if (file) {
                procesarArchivo(file);
              }
            }}
            onClick={(e) => e.stopPropagation()}
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