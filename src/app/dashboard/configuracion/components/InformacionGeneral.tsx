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
    status: 'active'
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
            status: data.statusRestaurante || 'active'
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-orange-500" />
            Información General del Restaurante
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona la información básica y de contacto de tu restaurante
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Formulario */}
      <div className="space-y-6">

        {/* Información Básica */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-4 w-4 text-orange-500" />
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="h-4 w-4 inline mr-1" />
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

        {/* Información de Contacto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-orange-500" />
            Información de Contacto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
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
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            Ubicación
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento/Estado
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-orange-500" />
            Estado
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Restaurante
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>

      </div>

      {/* Nota sobre campos obligatorios */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Los campos marcados con asterisco (*) son obligatorios.
          Esta información se utilizará para mostrar los datos del restaurante en el sistema.
        </p>
      </div>
    </div>
  );
}