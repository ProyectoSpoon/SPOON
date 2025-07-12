// src/app/config-restaurante/ubicacion/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaMapMarkerAlt } from 'react-icons/fa';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { useUbicacion } from './hooks/useUbicacion';
import Mapa from './components/mapa';
import { GoogleMapsLoader } from './components/GoogleMapsLoader';

interface Location {
  lat: number;
  lng: number;
}

export default function UbicacionPage() {
  const restaurantId = 'restaurant-test-1'; // Mock ID hasta que se implemente Firebase
  const { toast } = useToast();
  // Mock usuario para desarrollo
  const usuario = { id: 'test-user', email: 'test@example.com' };
  
  const {
    coordenadas,
    direccion,
    guardando,
    cargando,
    cargarUbicacion,
    guardarUbicacion,
    actualizarCoordenadas,
    setDireccion
  } = useUbicacion(restaurantId);
 
  const {
    value,
    setValue,
    suggestions: { data: sugerencias, loading: cargandoSugerencias },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'co' },
      types: ['address', 'establishment'],
      bounds: {
        north: 13.3888,
        south: -4.2316,
        east: -66.8541,
        west: -81.7178
      }
    },
    debounce: 300,
    cache: 86400,
  });
 
  useEffect(() => {
    if (restaurantId && usuario) {
      cargarUbicacion();
    }
  }, [cargarUbicacion, restaurantId, usuario]);
 
  const handleSeleccionarDireccion = async (descripcion: string) => {
    if (!usuario) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para realizar esta acción',
        variant: 'destructive'
      });
      return;
    }

    console.log('Intentando guardar dirección:', descripcion);
    setValue(descripcion, false);
    clearSuggestions();
 
    try {
      const results = await getGeocode({ 
        address: descripcion,
        componentRestrictions: {
          country: 'CO'
        }
      });
      
      const addressComponents = results[0].address_components;
      const isInColombia = addressComponents.some(
        component => component.types.includes('country') && component.short_name === 'CO'
      );
 
      if (!isInColombia) {
        throw new Error('Por favor, selecciona una dirección en Colombia');
      }
 
      const { lat, lng } = await getLatLng(results[0]);
      console.log('Coordenadas obtenidas:', { lat, lng });
 
      await guardarUbicacion(descripcion, { lat, lng });
      console.log('Ubicación guardada exitosamente');
      
      toast({
        title: 'Éxito',
        description: 'Ubicación guardada correctamente',
      });
      
    } catch (error) {
      console.error('Error completo:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Error al obtener la ubicación. Por favor, intenta con otra dirección en Colombia.',
        variant: 'destructive'
      });
    }
  };
 
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim()) {
      await handleSeleccionarDireccion(value);
    }
  };
 
  const handleMarkerDragEnd = async (newPosition: Location) => {
    if (!usuario) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para realizar esta acción',
        variant: 'destructive'
      });
      return;
    }

    try {
      await actualizarCoordenadas(newPosition);
      toast({
        title: 'Éxito',
        description: 'Posición actualizada correctamente',
      });
    } catch (error) {
      console.error('Error al actualizar posición:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Error al actualizar la posición del marcador',
        variant: 'destructive'
      });
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600">
            Debes iniciar sesión para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapsLoader>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="space-y-8">
            {/* Sección del buscador */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  ¿Dónde está tu restaurante?
                </h1>
                <p className="text-gray-600 text-center">
                  La precisión en la ubicación de tu restaurante es fundamental. Una dirección correcta 
                  asegura que tus clientes puedan encontrarte fácilmente.
                </p>
              </div>
   
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FaMapMarkerAlt className="text-orange-500 text-xl" />
                  </div>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Busca la dirección de tu restaurante en Colombia"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    disabled={guardando || cargando}
                  />
                  {sugerencias.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg">
                      {sugerencias.map((sugerencia) => (
                        <li
                          key={sugerencia.place_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSeleccionarDireccion(sugerencia.description)}
                        >
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-orange-500" />
                            <div>
                              <p className="font-medium">
                                {sugerencia.structured_formatting.main_text}
                              </p>
                              <p className="text-sm text-gray-500">
                                {sugerencia.structured_formatting.secondary_text}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </form>
            </div>
   
            {/* Sección del mapa */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Mapa
                center={coordenadas}
                onMarkerDrag={handleMarkerDragEnd}
                isLoaded={!cargando}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsLoader>
  );
}