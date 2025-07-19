// src/app/dashboard/configuracion/components/InformacionGeneral.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { Save, Building, Mail, Phone, MapPin, FileText, Globe, Tag } from 'lucide-react';

interface RestaurantInfo {
  nombreRestaurante: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  // Campos adicionales de la BD
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  cuisineType?: string;
  status?: string;
  logoUrl?: string;
  portadaUrl?: string;
}

export default function InformacionGeneral() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false); // ✅ Evitar múltiples cargas
  const [formData, setFormData] = useState<RestaurantInfo>({
    nombreRestaurante: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    city: '',
    state: '',
    country: 'Colombia',
    postalCode: '',
    cuisineType: '',
    status: 'active',
    logoUrl: '',
    portadaUrl: ''
  });

  // ✅ useEffect SIMPLE - Solo se ejecuta una vez
  useEffect(() => {
    if (hasLoaded.current) return; // Evitar múltiples ejecuciones
    hasLoaded.current = true;
    
    console.log('🚀 InformacionGeneral cargando datos...');
    
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener token
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/configuracion/informacion-general', {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Datos cargados exitosamente:', data);
          console.log('🖼️ Logo URL:', data.logoUrl);
          console.log('🖼️ Portada URL:', data.portadaUrl || data.coverImageUrl || data.cover_image_url);

          setFormData({
            nombreRestaurante: data.nombreRestaurante || '',
            descripcion: data.descripcion || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            email: data.email || '',
            city: data.ciudad || '',
            state: data.estado || '',
            country: data.pais || 'Colombia',
            postalCode: data.postalCode || '',
            cuisineType: data.tipoComida || '',
            status: data.statusRestaurante || 'active',
            logoUrl: data.logoUrl || '',
            portadaUrl: data.portadaUrl || data.coverImageUrl || data.cover_image_url || ''  // ✅ Triple mapeo
          });
        } else if (response.status === 401) {
          toast({
            title: 'Sesión Expirada',
            description: 'Por favor inicia sesión nuevamente',
            variant: 'destructive'
          });
        } else {
          console.error('Error al cargar datos:', response.status);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los datos del restaurante',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Error al conectar con el servidor',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []); // ✅ Array vacío - solo ejecuta UNA vez

  // ✅ Manejar cambios en formulario - SIMPLE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Guardar cambios - SIMPLE
  const handleSave = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombreRestaurante.trim() || !formData.direccion.trim() ||
          !formData.telefono.trim() || !formData.email.trim()) {
        toast({
          title: 'Error de Validación',
          description: 'Por favor completa todos los campos obligatorios',
          variant: 'destructive'
        });
        return;
      }

      setSaving(true);

      // Obtener token
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/configuracion/informacion-general', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Guardado exitoso:', result);

        toast({
          title: 'Éxito',
          description: 'Información actualizada correctamente',
        });
      } else if (response.status === 401) {
        toast({
          title: 'Sesión Expirada',
          description: 'Por favor inicia sesión nuevamente',
          variant: 'destructive'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Cargando información...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Building className="h-6 w-6 text-orange-500" />
          Información General del Restaurante
        </h1>
        <p className="text-gray-600">
          Gestiona la información básica y de contacto de tu restaurante
        </p>
      </div>

      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA - Formulario */}
        <div className="space-y-8">
          
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-500" />
              Información Básica
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Restaurante *
                </label>
                <input
                  type="text"
                  name="nombreRestaurante"
                  value={formData.nombreRestaurante}
                  onChange={handleInputChange}
                  placeholder="Nombre del restaurante"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cocina
                </label>
                <select
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccionar tipo de cocina</option>
                  <option value="colombiana">Colombiana</option>
                  <option value="italiana">Italiana</option>
                  <option value="mexicana">Mexicana</option>
                  <option value="asiatica">Asiática</option>
                  <option value="mediterranea">Mediterránea</option>
                  <option value="internacional">Internacional</option>
                  <option value="vegetariana">Vegetariana</option>
                  <option value="mariscos">Mariscos</option>
                  <option value="parrilla">Parrilla</option>
                  <option value="comida_rapida">Comida Rápida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Breve descripción del restaurante"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Teléfono de contacto"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              Ubicación
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección del restaurante"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ciudad"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Departamento"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Colombia">Colombia</option>
                    <option value="México">México</option>
                    <option value="España">España</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Chile">Chile</option>
                    <option value="Perú">Perú</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="110111"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estado del Restaurante */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-500" />
              Estado
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Restaurante
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - Preview Mockup */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Vista Previa
            </h3>
            
            {/* Mockup del dispositivo móvil */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Marco del dispositivo */}
                <div className="w-64 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                    
                    {/* Portada del restaurante */}
                    <div 
                      className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative"
                      style={{
                        backgroundImage: formData.portadaUrl ? 
                          `url(${formData.portadaUrl.startsWith('http') ? formData.portadaUrl : `${window.location.origin}${formData.portadaUrl}`})` : 
                          undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onLoad={() => {
                        if (formData.portadaUrl) {
                          const finalUrl = formData.portadaUrl.startsWith('http') ? formData.portadaUrl : `${window.location.origin}${formData.portadaUrl}`;
                          console.log('🎯 URL final de portada:', finalUrl);
                          console.log('🎯 formData.portadaUrl:', formData.portadaUrl);
                        }
                      }}
                    >
                      {/* DEBUG temporal */}
                      <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-75 p-1 rounded z-10">
                        {formData.portadaUrl ? '✅ URL OK' : '❌ No URL'}
                      </div>
                      
                      {/* Overlay si no hay portada */}
                      {!formData.portadaUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white text-xs opacity-75">Sin portada</div>
                        </div>
                      )}
                    </div>

                    {/* Logo del restaurante */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                        {formData.logoUrl ? (
                          <img 
                            src={formData.logoUrl} 
                            alt="Logo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="pt-12 px-4">
                      {/* Nombre del restaurante */}
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {formData.nombreRestaurante || 'Nombre del Restaurante'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.cuisineType || 'Tipo de cocina'}
                        </p>
                      </div>

                      {/* Branding SPOON */}
                      <div className="text-center mb-4">
                        <div className="text-lg font-bold text-orange-500">SPOON</div>
                        <div className="h-px bg-gray-200 mx-8 my-2"></div>
                      </div>

                      {/* Contenido simulado */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded w-2/3 mb-1"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded w-4/5 mb-1"></div>
                            <div className="h-2 bg-gray-100 rounded w-2/5"></div>
                          </div>
                        </div>
                      </div>

                      {/* Información de contacto */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{formData.telefono || '+57 XXX XXX XXXX'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {formData.city || 'Ciudad'}, {formData.state || 'Departamento'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Vista previa de cómo se verá tu restaurante en la aplicación móvil
              </p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Botón Guardar */}
      <div className="flex justify-end pt-8 mt-8 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Save className="h-5 w-5" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
      
      {/* Nota sobre campos obligatorios */}
      <div className="mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Los campos marcados con asterisco (*) son obligatorios.
            Esta información se utilizará para mostrar los datos del restaurante en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
}