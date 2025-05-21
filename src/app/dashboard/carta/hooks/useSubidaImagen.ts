// src/app/dashboard/carta/hooks/useSubidaImagen.ts
import { useState, useCallback } from 'react';
;
import { storage } from '@/firebase/config';
import { CONFIGURACION_IMAGENES } from '../constants/imagenes.constants';
import { procesarImagen } from '../utils/procesadoImagenes';

interface UseSubidaImagenProps {
  restauranteId: string;
  tipo: 'producto' | 'categoria';
}

export function useSubidaImagen({ restauranteId, tipo }: UseSubidaImagenProps) {
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validarImagen = useCallback(async (file: File) => {
    if (!CONFIGURACION_IMAGENES.FORMATOS_PERMITIDOS.includes(file.type)) {
      throw new Error('Formato de imagen no permitido');
    }

    if (file.size > CONFIGURACION_IMAGENES.TAMANO_MAXIMO) {
      throw new Error('La imagen excede el tamaño máximo permitido');
    }

    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { MIN_WIDTH, MIN_HEIGHT } = CONFIGURACION_IMAGENES.DIMENSIONES;
        resolve(img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT);
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const subirImagen = useCallback(async (file: File, id: string) => {
    setError(null);
    setProgreso(0);

    try {
      await validarImagen(file);
      
      // Procesar imagen para diferentes tamaños
      const imagenProcesada = await procesarImagen(file, {
        maxWidth: CONFIGURACION_IMAGENES.PRODUCTO.WIDTH,
        maxHeight: CONFIGURACION_IMAGENES.PRODUCTO.HEIGHT,
        quality: CONFIGURACION_IMAGENES.PRODUCTO.QUALITY
      });

      const thumbnail = await procesarImagen(file, {
        maxWidth: CONFIGURACION_IMAGENES.THUMBNAIL.WIDTH,
        maxHeight: CONFIGURACION_IMAGENES.THUMBNAIL.HEIGHT,
        quality: CONFIGURACION_IMAGENES.THUMBNAIL.QUALITY
      });

      // Subir imagen principal
      const imagenRef = ref(storage, `${tipo}s/${restauranteId}/${id}/${file.name}`);
      await uploadBytes(imagenRef, imagenProcesada);
      const imagenUrl = await getDownloadURL(imagenRef);

      // Subir thumbnail
      const thumbnailRef = ref(storage, `${tipo}s/${restauranteId}/${id}/thumb_${file.name}`);
      await uploadBytes(thumbnailRef, thumbnail);
      const thumbnailUrl = await getDownloadURL(thumbnailRef);

      return {
        imagenUrl,
        thumbnailUrl
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      throw err;
    }
  }, [restauranteId, tipo, validarImagen]);

  return {
    progreso,
    error,
    subirImagen
  };
}
