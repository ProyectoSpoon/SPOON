// src/app/config-restaurante/ubicacion/components/GoogleMapsLoader.tsx
'use client';

import { Libraries, useLoadScript } from '@react-google-maps/api';
import { ReactNode } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';

const libraries: Libraries = ['places'];

interface GoogleMapsLoaderProps {
  children: ReactNode;
}

export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const { toast } = useToast();
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    // Asegurarse de que Places esté disponible globalmente
    language: 'es',
    region: 'CO',
  });

  if (loadError) {
    console.error('Error cargando Google Maps:', loadError);
    toast({
      title: 'Error',
      description: 'No se pudo cargar el mapa. Por favor, intenta más tarde.',
      variant: 'destructive'
    });
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
