// src/app/config-restaurante/logo-portada/hooks/useImages.ts

import { useState, useCallback } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useConfigStore } from '@/app/config-restaurante/store/config-store';

// Obtener ID del restaurante actual
const RESTAURANT_ID = '4073a4ad-b275-4e17-b197-844881f0319e';

export function useImages() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();

  // Cargar URLs existentes
  const cargarImagenes = useCallback(async () => {
    if (!RESTAURANT_ID) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/images`);

      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.logoUrl);
        setCoverImageUrl(data.coverImageUrl);

        // Actualizar store si hay imágenes
        if (data.logoUrl) {
          actualizarCampo('/config-restaurante/logo-portada', 'logo', true);
        }
        if (data.coverImageUrl) {
          actualizarCampo('/config-restaurante/logo-portada', 'portada', true);
        }
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las imágenes guardadas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, actualizarCampo]);

  // Subir imagen
  const subirImagen = useCallback(async (file: File, type: 'logo' | 'cover') => {
    if (!RESTAURANT_ID) {
      toast({
        title: 'Error',
        description: 'No se encontró el ID del restaurante',
        variant: 'destructive'
      });
      return null;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al subir ${type === 'logo' ? 'logo' : 'portada'}`);
      }

      const data = await response.json();

      if (data.success) {
        // Actualizar estado local
        if (type === 'logo') {
          setLogoUrl(data.url);
          actualizarCampo('/config-restaurante/logo-portada', 'logo', true);
        } else {
          setCoverImageUrl(data.url);
          actualizarCampo('/config-restaurante/logo-portada', 'portada', true);
        }

        toast({
          title: 'Éxito',
          description: data.message
        });

        return data.url;
      }

    } catch (error) {
      console.error(`Error al subir ${type}:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Error al subir ${type === 'logo' ? 'logo' : 'portada'}`,
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast, actualizarCampo]);

  // Actualizar URLs (para servicios externos como Cloudinary)
  const actualizarUrls = useCallback(async (logoUrl?: string, coverImageUrl?: string) => {
    if (!RESTAURANT_ID) {
      toast({
        title: 'Error',
        description: 'No se encontró el ID del restaurante',
        variant: 'destructive'
      });
      return false;
    }

    try {
      setUploading(true);

      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl: logoUrl !== undefined ? logoUrl : undefined,
          coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar URLs');
      }

      const data = await response.json();

      if (data.success) {
        // Actualizar estado local
        if (logoUrl !== undefined) {
          setLogoUrl(logoUrl);
          actualizarCampo('/config-restaurante/logo-portada', 'logo', !!logoUrl);
        }
        if (coverImageUrl !== undefined) {
          setCoverImageUrl(coverImageUrl);
          actualizarCampo('/config-restaurante/logo-portada', 'portada', !!coverImageUrl);
        }

        toast({
          title: 'Éxito',
          description: 'Imágenes actualizadas correctamente'
        });

        return true;
      }

    } catch (error) {
      console.error('Error al actualizar URLs:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar imágenes',
        variant: 'destructive'
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [toast, actualizarCampo]);

  // Verificar si las imágenes están completas
  const imagenesCompletas = useCallback((): boolean => {
    return !!(logoUrl && coverImageUrl);
  }, [logoUrl, coverImageUrl]);

  return {
    logoUrl,
    coverImageUrl,
    uploading,
    loading,
    cargarImagenes,
    subirImagen,
    actualizarUrls,
    imagenesCompletas
  };
}
