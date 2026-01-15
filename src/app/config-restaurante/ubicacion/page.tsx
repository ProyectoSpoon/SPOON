'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext';
import { useConfigSync } from '@/hooks/use-config-sync';
import { GoogleMapsLoader } from './components/GoogleMapsLoader';
import MapaInteractivo from './components/MapaInteractivo';
import { Autocomplete } from '@react-google-maps/api';

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";

interface UbicacionData {
  address: string;
  latitude: number;
  longitude: number;
  city_id?: string | null;
  department_id?: string | null;
  country_id?: string | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
  country_id: string;
}

interface City {
  id: string;
  name: string;
  department_id: string;
}

// Datos de departamentos y ciudades de Colombia
const DEPARTAMENTOS_COLOMBIA: Record<string, string[]> = {
  'Amazonas': ['Leticia'],
  'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Sabaneta'],
  'Arauca': ['Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón', 'Saravena', 'Tame'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa'],
  'Bolívar': ['Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Turbaco', 'Arjona', 'San Juan Nepomuceno'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Nobsa'],
  'Caldas': ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Anserma'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán', 'El Paujil', 'La Montañita', 'Puerto Rico'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo', 'Monterrey'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Guapi', 'Patía'],
  'Cesar': ['Valledupar', 'Aguachica', 'Bosconia', 'Codazzi', 'El Copey', 'La Jagua de Ibirico'],
  'Chocó': ['Quibdó', 'Acandí', 'Apartadó', 'Bahía Solano', 'Istmina', 'Nuquí'],
  'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Sahagún', 'Planeta Rica', 'Ayapel'],
  'Cundinamarca': ['Bogotá', 'Soacha', 'Girardot', 'Zipaquirá', 'Facatativá', 'Chía', 'Mosquera', 'Madrid', 'Funza', 'Cajicá'],
  'Guainía': ['Inírida'],
  'Guaviare': ['San José del Guaviare'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'San Agustín'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar', 'Villanueva'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'Zona Bananera', 'El Banco', 'Plato'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'Cumaral', 'San Martín'],
  'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Tuquerres', 'Samaniego', 'La Unión'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios', 'Tibú'],
  'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'San Miguel'],
  'Quindío': ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya', 'Circasia'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
  'Sucre': ['Sincelejo', 'Corozal', 'Sampués', 'San Marcos', 'Tolú', 'Coveñas'],
  'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'El Líbano'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí'],
  'Vaupés': ['Mitú'],
  'Vichada': ['Puerto Carreño']
};

// Coordenadas fijas de respaldo para ciudades principales
const CIUDADES_COORDS: Record<string, { lat: number; lng: number }> = {
  'Bogotá': { lat: 4.6097, lng: -74.0817 },
  'Medellín': { lat: 6.2486, lng: -75.5742 },
  'Cali': { lat: 3.4516, lng: -76.5320 },
  'Barranquilla': { lat: 10.9685, lng: -74.7813 },
  'Cartagena': { lat: 10.3910, lng: -75.4794 },
  'Bucaramanga': { lat: 7.1253, lng: -73.1198 },
  'Manizales': { lat: 5.0670, lng: -75.5174 },
  'Pereira': { lat: 4.8133, lng: -75.6961 },
  'Cúcuta': { lat: 7.8939, lng: -72.5078 },
  'Santa Marta': { lat: 11.2408, lng: -74.2099 },
  'Ibagué': { lat: 4.4389, lng: -75.2322 },
};

const UbicacionContent = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { actualizarCampo, sincronizarConBD } = useConfigStore();
  const { user, loading: authLoading } = useAuth();

  const [ubicacionData, setUbicacionData] = useState<UbicacionData>({
    address: '',
    latitude: 4.6097102,
    longitude: -74.081749,
    city_id: null,
    department_id: null,
    country_id: null
  });

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Estados para cargar departamentos y ciudades desde la BD
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [ciudades, setCiudades] = useState<City[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        setLoadingDepartments(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/departments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDepartamentos(data);
        }
      } catch (error) {
        console.error('Error cargando departamentos:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    cargarDepartamentos();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.restaurantId) return;

      try {
        setCargando(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/restaurants/${user.restaurantId}/location`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUbicacionData({
            address: data.address || '',
            latitude: data.latitude || 4.6097102,
            longitude: data.longitude || -74.081749,
            city_id: data.city_id || null,
            department_id: data.department_id || null,
            country_id: data.country_id || null
          });

          // Si tiene department_id, cargar las ciudades de ese departamento
          if (data.department_id) {
            await cargarCiudadesPorDepartamento(data.department_id);
          }
        }
      } catch (error) {
        console.error('Error cargando ubicación:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user?.restaurantId]);

  // Cargar ciudades cuando se selecciona un departamento
  const cargarCiudadesPorDepartamento = async (departmentId: string) => {
    try {
      setLoadingCities(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/departments/${departmentId}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCiudades(data);
      }
    } catch (error) {
      console.error('Error cargando ciudades:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleLocationChange = useCallback((lat: number, lng: number, address?: string) => {
    setUbicacionData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ...(address ? { address } : {})
    }));
  }, []);

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setUbicacionData(prev => ({
          ...prev,
          address: place.formatted_address || prev.address,
          latitude: lat,
          longitude: lng
        }));
      }
    }
  };

  const onLoadAutocomplete = (autoC: google.maps.places.Autocomplete) => {
    setAutocomplete(autoC);
  };

  const handleDepartamentoChange = async (departmentId: string) => {
    setUbicacionData(prev => ({
      ...prev,
      department_id: departmentId,
      city_id: null // Resetear ciudad al cambiar departamento
    }));

    // Cargar ciudades del departamento seleccionado
    await cargarCiudadesPorDepartamento(departmentId);
  };

  const handleCiudadChange = (cityId: string) => {
    setUbicacionData(prev => ({
      ...prev,
      city_id: cityId
    }));
  };

  const handleContinuar = async () => {
    if (!ubicacionData.address.trim()) {
      toast({
        title: 'Dirección Requerida',
        description: 'Por favor ingresa la dirección del restaurante',
        variant: 'destructive'
      });
      return;
    }


    try {
      setGuardando(true);

      // Usar 'current' si no tenemos restaurantId (auto-detección en backend)
      const restaurantId = user?.restaurantId || 'current';

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/restaurants/${restaurantId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: ubicacionData.address,
          latitude: ubicacionData.latitude,
          longitude: ubicacionData.longitude,
          city_id: ubicacionData.city_id,
          department_id: ubicacionData.department_id,
          country_id: ubicacionData.country_id
        })
      });

      if (response.ok) {
        actualizarCampo('/config-restaurante/ubicacion', 'address', Boolean(ubicacionData.address.trim()));
        actualizarCampo('/config-restaurante/ubicacion', 'latitude', ubicacionData.latitude !== 0);
        actualizarCampo('/config-restaurante/ubicacion', 'longitude', ubicacionData.longitude !== 0);


        // Sincronizar usando el restaurantId que usamos para guardar
        if (restaurantId !== 'current') {
          await sincronizarConBD(restaurantId);
        }

        toast({ title: 'Éxito', description: 'Ubicación guardada correctamente' });
        router.push('/config-restaurante');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error al guardar en el servidor');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error de Guardado',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  if (authLoading || cargando) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const searchQuery = ubicacionData.address || '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header con botón volver */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleContinuar}
            disabled={guardando || !ubicacionData.address.trim()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:text-gray-400"
          >
            <FaArrowLeft />
            <span className="font-medium">{guardando ? 'Guardando...' : 'Guardar y Salir'}</span>
          </button>
          <span className="text-sm text-gray-500">Paso 2 de 4</span>
        </div>

        {/* Contenedor del mapa */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Título y campos */}
          <div className="p-6 bg-white border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Dónde está tu restaurante?
            </h1>

            {/* Selectores de Departamento y Ciudad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Selector de Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <Select
                  value={ubicacionData.department_id || ''}
                  onValueChange={handleDepartamentoChange}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder={loadingDepartments ? "Cargando departamentos..." : "Selecciona un departamento"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {departamentos.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <Select
                  value={ubicacionData.city_id || ''}
                  onValueChange={handleCiudadChange}
                  disabled={!ubicacionData.department_id || loadingCities}
                >
                  <SelectTrigger className="w-full bg-white border-gray-300 disabled:bg-gray-100">
                    <SelectValue placeholder={
                      !ubicacionData.department_id
                        ? "Primero selecciona un departamento"
                        : loadingCities
                          ? "Cargando ciudades..."
                          : "Selecciona una ciudad"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {ciudades.map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Input de dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="text-gray-400 text-xl">
                      📍
                    </div>
                    <input
                      type="text"
                      value={ubicacionData.address}
                      onChange={(e) => setUbicacionData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Ingresa la dirección"
                      className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </Autocomplete>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative h-[500px] w-full">
            <MapaInteractivo
              lat={ubicacionData.latitude}
              lng={ubicacionData.longitude}
              onLocationChange={handleLocationChange}
              searchQuery={searchQuery}
            />
          </div>

          {/* Footer con botón de continuar */}
          {ubicacionData.address.trim() && (
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-end">
                <button
                  onClick={handleContinuar}
                  disabled={guardando}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : 'Guardar y Continuar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function UbicacionPage() {
  return (
    <GoogleMapsLoader>
      <UbicacionContent />
    </GoogleMapsLoader>
  );
}
