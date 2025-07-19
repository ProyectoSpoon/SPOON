'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext';
import { useConfigSync } from '@/hooks/use-config-sync';

interface UbicacionData {
  direccion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  ciudad: string;
  estado: string;
  pais: string;
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

// Función simple de geocodificación (estimativa por ciudad)
const obtenerCoordenadasEstimadas = (ciudad: string, departamento: string): { lat: number; lng: number } => {
  const coordenadasCiudades: Record<string, { lat: number; lng: number }> = {
    'Bogotá': { lat: 4.6097102, lng: -74.081749 },
    'Medellín': { lat: 6.2486, lng: -75.5742 },
    'Cali': { lat: 3.4516, lng: -76.5320 },
    'Barranquilla': { lat: 10.9685, lng: -74.7813 },
    'Cartagena': { lat: 10.3910, lng: -75.4794 },
    'Cúcuta': { lat: 7.8939, lng: -72.5078 },
    'Bucaramanga': { lat: 7.1253, lng: -73.1198 },
    'Pereira': { lat: 4.8133, lng: -75.6961 },
    'Santa Marta': { lat: 11.2408, lng: -74.2099 },
    'Ibagué': { lat: 4.4389, lng: -75.2322 },
    'Pasto': { lat: 1.2136, lng: -77.2811 },
    'Manizales': { lat: 5.0670, lng: -75.5174 },
    'Neiva': { lat: 2.9273, lng: -75.2819 },
    'Villavicencio': { lat: 4.1420, lng: -73.6266 },
    'Armenia': { lat: 4.5339, lng: -75.6811 },
    'Valledupar': { lat: 10.4631, lng: -73.2532 },
    'Montería': { lat: 8.7479, lng: -75.8814 },
    'Sincelejo': { lat: 9.3047, lng: -75.3978 },
    'Popayán': { lat: 2.4448, lng: -76.6147 },
    'Tunja': { lat: 5.5353, lng: -73.3678 }
  };

  return coordenadasCiudades[ciudad] || { lat: 4.6097102, lng: -74.081749 };
};

// Componente de mapa simple
const MapaSimple = ({ lat, lng, address }: { lat: number; lng: number; address: string }) => (
  <div className="h-full w-full bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-inner relative overflow-hidden">
    {/* Efectos de fondo tipo mapa */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-green-500 rounded-full"></div>
      <div className="absolute bottom-20 left-24 w-12 h-12 bg-orange-500 rounded-full"></div>
      <div className="absolute bottom-32 right-32 w-14 h-14 bg-purple-500 rounded-full"></div>
    </div>
    
    {/* Grid tipo mapa */}
    <div className="absolute inset-0 opacity-5">
      <div className="grid grid-cols-8 grid-rows-6 h-full">
        {Array.from({ length: 48 }, (_, i) => (
          <div key={i} className="border border-gray-400"></div>
        ))}
      </div>
    </div>
    
    {/* Marcador principal */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Pin animado */}
        <div className="relative">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <FaMapMarkerAlt className="text-white text-2xl" />
          </div>
          {/* Sombra del pin */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
        </div>
        
        {/* Info bubble */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-red-500 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-800">
            {address || 'Tu restaurante aquí'}
          </div>
          <div className="text-xs text-gray-500">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
          {/* Flecha del bubble */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      </div>
    </div>
    
    {/* Controles tipo Maps */}
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
        <span className="text-lg font-bold text-gray-600">+</span>
      </button>
      <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
        <span className="text-lg font-bold text-gray-600">-</span>
      </button>
    </div>
    
    {/* Logo de ubicación */}
    <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
      📍 Spoon Maps
    </div>
  </div>
);

export default function UbicacionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { actualizarCampo, sincronizarConBD } = useConfigStore();
  const { user, loading: authLoading } = useAuth();
  const { syncAfterSave } = useConfigSync(); // ← Hook de sincronización
  
  const [ubicacionData, setUbicacionData] = useState<UbicacionData>({
    direccion: '',
    coordenadas: { lat: 4.6097102, lng: -74.081749 },
    ciudad: '',
    estado: '',
    pais: 'Colombia'
  });
  
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Actualizar coordenadas cuando cambia la ciudad
  useEffect(() => {
    if (ubicacionData.ciudad && ubicacionData.estado) {
      const nuevasCoordenadas = obtenerCoordenadasEstimadas(ubicacionData.ciudad, ubicacionData.estado);
      setUbicacionData(prev => ({
        ...prev,
        coordenadas: nuevasCoordenadas
      }));
    }
  }, [ubicacionData.ciudad, ubicacionData.estado]);

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
            direccion: data.direccion || '',
            coordenadas: {
              lat: data.coordenadas?.lat || 4.6097102,
              lng: data.coordenadas?.lng || -74.081749
            },
            ciudad: data.ciudad || '',
            estado: data.estado || '',
            pais: data.pais || 'Colombia'
          });
        }
      } catch (error) {
        console.error('Error cargando ubicación:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user?.restaurantId]);

  const handleVolver = () => {
    router.push('/config-restaurante/informacion-general');
  };

  const handleContinuar = async () => {
    if (!ubicacionData.direccion.trim()) {
      toast({
        title: 'Dirección Requerida',
        description: 'Por favor ingresa la dirección del restaurante',
        variant: 'destructive'
      });
      return;
    }

    if (!ubicacionData.estado || !ubicacionData.ciudad) {
      toast({
        title: 'Ubicación Incompleta',
        description: 'Por favor selecciona departamento y ciudad',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);
      
      if (!user?.restaurantId) {
        throw new Error('ID de restaurante no disponible');
      }
      
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/restaurants/${user.restaurantId}/location`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          direccion: ubicacionData.direccion,
          coordenadas: ubicacionData.coordenadas,
          ciudad: ubicacionData.ciudad,
          estado: ubicacionData.estado
        })
      });

      if (response.ok) {
        actualizarCampo('/config-restaurante/ubicacion', 'direccion', Boolean(ubicacionData.direccion.trim()));
        actualizarCampo('/config-restaurante/ubicacion', 'coordenadas', true);
        actualizarCampo('/config-restaurante/ubicacion', 'zona', Boolean(ubicacionData.ciudad.trim()));
        
        if (user.restaurantId) {
          await sincronizarConBD(user.restaurantId);
        }
        
        toast({
          title: 'Éxito',
          description: 'Ubicación guardada correctamente'
        });
        
        router.push('/config-restaurante/horario-comercial');
      } else {
        throw new Error('Error al guardar ubicación');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la ubicación',
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoDepartamento = e.target.value;
    setUbicacionData(prev => ({
      ...prev,
      estado: nuevoDepartamento,
      ciudad: ''
    }));
  };

  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUbicacionData(prev => ({
      ...prev,
      ciudad: e.target.value
    }));
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

  if (!user) {
    router.push('/login');
    return null;
  }

  const ciudadesDisponibles = ubicacionData.estado ? (DEPARTAMENTOS_COLOMBIA[ubicacionData.estado] || []) : [];
  const formularioCompleto = ubicacionData.direccion.trim() && ubicacionData.estado && ubicacionData.ciudad;

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      
      {/* SIDEBAR - 30% del ancho */}
      <div className={`bg-white shadow-2xl flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-96'
      }`}>
        
        {/* Header del sidebar */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="text-white">
                <h1 className="text-xl font-bold">Ubicación</h1>
                <p className="text-orange-100 text-sm">Paso 2 de 4</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? '📍' : <FaTimes />}
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Formulario */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                
                {/* Dirección */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🏠 Dirección Completa
                  </label>
                  <input
                    type="text"
                    value={ubicacionData.direccion}
                    onChange={(e) => setUbicacionData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Carrera 15 #85-32, Chapinero"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🗺️ Departamento
                  </label>
                  <select
                    value={ubicacionData.estado}
                    onChange={handleDepartamentoChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                  >
                    <option value="">Selecciona departamento</option>
                    {Object.keys(DEPARTAMENTOS_COLOMBIA).map(departamento => (
                      <option key={departamento} value={departamento}>
                        {departamento}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🏙️ Ciudad
                  </label>
                  <select
                    value={ubicacionData.ciudad}
                    onChange={handleCiudadChange}
                    disabled={!ubicacionData.estado}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {ubicacionData.estado ? 'Selecciona ciudad' : 'Primero selecciona departamento'}
                    </option>
                    {ciudadesDisponibles.map(ciudad => (
                      <option key={ciudad} value={ciudad}>
                        {ciudad}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info del resultado */}
                {formularioCompleto && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="text-green-800 font-semibold text-sm mb-2">✅ Ubicación lista</div>
                    <div className="text-green-700 text-sm">
                      {ubicacionData.direccion}<br />
                      {ubicacionData.ciudad}, {ubicacionData.estado}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleVolver}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium"
                >
                  <FaArrowLeft className="text-sm" />
                  Volver
                </button>
                
                <button
                  onClick={handleContinuar}
                  disabled={guardando || !formularioCompleto}
                  className={`flex-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all ${
                    formularioCompleto && !guardando
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCheck className="text-sm" />
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MAPA - 70% del ancho */}
      <div className="flex-1 p-4">
        <div className="h-full">
          <MapaSimple
            lat={ubicacionData.coordenadas.lat}
            lng={ubicacionData.coordenadas.lng}
            address={`${ubicacionData.direccion}${ubicacionData.ciudad ? `, ${ubicacionData.ciudad}` : ''}`}
          />
        </div>
      </div>
      
    </div>
  );
}