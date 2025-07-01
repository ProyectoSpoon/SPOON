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
import ConfigFooter from '../components/ConfigFooter/ConfigFooter';
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
        description: 'Debes iniciar sesiรณn para realizar esta acciรณn',
        variant: 'destructive'
      });
      return;
    }

    console.log('Intentando guardar direcciรณn:', descripcion);
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
        throw new Error('Por favor, selecciona una direcciรณn en Colombia');
      }
 
      const { lat, lng } = await getLatLng(results[0]);
      console.log('Coordenadas obtenidas:', { lat, lng });
 
      await guardarUbicacion(descripcion, { lat, lng });
      console.log('Ubicaciรณn guardada exitosamente');
      
      toast({
        title: 'ร�xito',
        description: 'Ubicaciรณn guardada correctamente',
      });
      
    } catch (error) {
      console.error('Error completo:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Error al obtener la ubicaciรณn. Por favor, intenta con otra direcciรณn en Colombia.',
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
        description: 'Debes iniciar sesiรณn para realizar esta acciรณn',
        variant: 'destructive'
      });
      return;
    }

    try {
      await actualizarCoordenadas(newPosition);
      toast({
        title: 'ร�xito',
        description: 'Posiciรณn actualizada correctamente',
      });
    } catch (error) {
      console.error('Error al actualizar posiciรณn:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Error al actualizar la posiciรณn del marcador',
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
            Debes iniciar sesiรณn para acceder a esta pรกgina
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapsLoader>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="space-y-8">
            {/* Secciรณn del buscador */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  ยฟDรณnde estรก tu restaurante?
                </h1>
                <p className="text-gray-600 text-center">
                  La precisiรณn en la ubicaciรณn de tu restaurante es fundamental. Una direcciรณn correcta 
                  asegura que tus clientes puedan encontrarte fรกcilmente.
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
                    placeholder="Busca la direcciรณn de tu restaurante en Colombia"
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
   
            {/* Secciรณn del mapa */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Mapa
                center={coordenadas}
                onMarkerDrag={handleMarkerDragEnd}
                isLoaded={!cargando}
              />
            </div>
          </div>
        </div>
        <ConfigFooter />
      </div>
    </GoogleMapsLoader>
  );
}
