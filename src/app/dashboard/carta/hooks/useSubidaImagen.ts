// src/app/dashboard/carta/hooks/useSubidaImagen.ts
import { useState, useCallback } from 'react';

interface UseSubidaImagenProps {
  carpeta?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export function useSubidaImagen({
  carpeta = 'productos',
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: UseSubidaImagenProps = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es muy grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  }, [allowedTypes, maxSize]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validar archivo
      if (!validateFile(file)) {
        throw new Error('Archivo no válido');
      }

      // Simular progreso de subida
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += Math.random() * 30;
            if (currentProgress >= 100) {
              currentProgress = 100;
              clearInterval(interval);
              resolve();
            }
            setProgress(currentProgress);
          }, 200);
        });
      };

      await simulateProgress();

      // Simular URL de imagen subida
      const timestamp = Date.now();
      const fileName = `${carpeta}/${timestamp}_${file.name}`;
      const imageUrl = `/imagenes/${fileName}`;

      console.log('Imagen subida (simulación):', {
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: imageUrl
      });

      return imageUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir imagen';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [carpeta, validateFile]);

  const uploadMultipleImages = useCallback(async (files: File[]): Promise<string[]> => {
    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir imágenes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    try {
      console.log('Eliminando imagen (simulación):', imageUrl);
      
      // Simular delay de eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Imagen eliminada exitosamente (simulación)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar imagen';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getImageUrl = useCallback((imagePath: string): string => {
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Construir URL completa
    return `/imagenes/${imagePath}`;
  }, []);

  const resetState = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getImageUrl,
    resetState,
    validateFile
  };
}
