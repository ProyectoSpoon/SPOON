// src/app/config-restaurante/informacion-general/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck, FaBuilding, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext'; // ← USAR AUTH EXISTENTE
import { useConfigSync } from '@/hooks/use-config-sync';

interface RestaurantInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  cuisineType: string;
}

export default function InformacionGeneralPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { actualizarCampo, sincronizarConBD } = useConfigStore();
  const { user, loading: authLoading, updateRestaurantId } = useAuth(); // ← AGREGAR updateRestaurantId
  const { syncAfterSave } = useConfigSync(); // ← Hook de sincronización
  
  const [formData, setFormData] = useState<RestaurantInfo>({
    name: '',
    description: '',
    phone: '',
    email: '',
    cuisineType: ''
  });
  
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Cargar datos existentes cuando se tiene el restaurantId
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.restaurantId || !user) {
        console.log('🔍 No hay restaurantId, saltando carga de datos');
        return;
      }
      
      try {
        setCargando(true);
        console.log('📊 Cargando datos del restaurante:', user.restaurantId);
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('❌ No hay token de autenticación');
          return;
        }
        
        const response = await fetch(`/api/restaurants/${user.restaurantId}/general-info`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Datos recibidos:', data);
          
          setFormData({
            name: data.nombreRestaurante || '',
            description: data.descripcion || '',
            phone: data.telefono || '',
            email: data.email || '',
            cuisineType: data.tipoComida || ''
          });
          
          console.log('✅ Formulario actualizado con datos existentes');
        } else if (response.status === 404) {
          // Restaurante no encontrado, mantener formulario vacío
          console.log('ℹ️ Restaurante no encontrado (404), usando formulario vacío');
        } else {
          // Error de servidor
          const errorText = await response.text();
          console.error('❌ Error del servidor:', response.status, errorText);
          
          toast({
            title: 'Información',
            description: 'No se pudieron cargar los datos existentes. Puedes continuar completando el formulario.',
            variant: 'default'
          });
        }
      } catch (error) {
        console.error('❌ Error de red cargando datos:', error);
        toast({
          title: 'Información',
          description: 'No se pudieron cargar los datos existentes. Verifica tu conexión e intenta nuevamente.',
          variant: 'default'
        });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user?.restaurantId]);

  const handleVolver = () => {
    router.push('/config-restaurante');
  };

  const handleContinuar = async () => {
    // Validar campos requeridos
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: 'Campos Requeridos',
        description: 'Por favor completa el nombre, teléfono y email del restaurante',
        variant: 'destructive'
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email Inválido',
        description: 'Por favor ingresa un email válido',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);
      
      const token = localStorage.getItem('auth_token');
      
      // Usar la API original que funcionaba
      const response = await fetch(`/api/restaurants/${user?.restaurantId || 'new'}/general-info`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreRestaurante: formData.name,
          descripcion: formData.description,
          telefono: formData.phone,
          email: formData.email,
          tipoComida: formData.cuisineType
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: 'Éxito',
          description: result.message || 'Información guardada correctamente'
        });
        
        // ✅ SINCRONIZAR STORE DESPUÉS DEL GUARDADO EXITOSO
        await syncAfterSave();
        
        // ✅ FLUJO UNIFICADO: Siempre usar router.push
        if (result.isNew) {
          console.log('🆕 Restaurante nuevo creado, actualizando contexto...');
          
          // ✅ NUEVO: Actualizar contexto sin recargar página
          updateRestaurantId(result.data.id);
          
          // ✅ NAVEGACIÓN NORMAL (sin recargar)
          router.push('/config-restaurante/ubicacion');
        } else {
          // Actualizar store local si existe y es actualización
          if (actualizarCampo && user?.restaurantId) {
            actualizarCampo('/config-restaurante/informacion-general', 'nombre', Boolean(formData.name.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'contacto', Boolean(formData.phone.trim() && formData.email.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'descripcion', Boolean(formData.description.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'tipoComida', Boolean(formData.cuisineType.trim()));
            
            // Sincronizar con BD para asegurar consistencia
            if (sincronizarConBD) {
              await sincronizarConBD(user.restaurantId);
            }
          }
          
          // Navegar al siguiente paso (ubicación)
          router.push('/config-restaurante/ubicacion');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la información',
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const camposCompletos = formData.name.trim() && formData.phone.trim() && formData.email.trim();

  // Mostrar loading si está cargando auth o datos
  if (authLoading || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Verificando autenticación...' : 'Cargando información...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!user) {
    router.push('/login');
    return null;
  }

  // Si no tiene restaurante, mostrar formulario de creación (no error)
  // El formulario manejará la creación del restaurante

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header con navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              Volver
            </button>
            
            <div className="text-center flex-1">
              <span className="text-sm text-gray-500 font-medium">Paso 1 de 4</span>
            </div>
            
            <div className="w-20"></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Información General
            </h1>
            <p className="text-gray-600">
              Empecemos con los datos básicos de tu restaurante
            </p>
            {user.restaurantId && (
              <p className="text-xs text-blue-600 mt-2">
                ID: {user.restaurantId}
              </p>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          <div className="space-y-6">
            
            {/* Nombre del restaurante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaBuilding className="inline mr-2 text-orange-500" />
                Nombre del Restaurante *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Restaurante La Cocina"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-orange-500" />
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 312 345 6789"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-orange-500" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej: contacto@restaurante.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Tipo de cocina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUtensils className="inline mr-2 text-orange-500" />
                Tipo de Cocina
              </label>
              <select
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecciona el tipo de cocina</option>
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
                <option value="fusion">Fusión</option>
                <option value="tradicional">Tradicional</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Restaurante
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe brevemente tu restaurante, su ambiente, especialidades..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

          </div>
        </div>

        {/* Botones de navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <FaArrowLeft className="text-sm" />
              Configuración
            </button>
            
            <button
              onClick={handleContinuar}
              disabled={guardando || !camposCompletos}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                camposCompletos && !guardando
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaCheck className="text-sm" />
              {guardando ? 'Guardando...' : camposCompletos ? 'Continuar a Ubicación' : 'Completa los campos'}
            </button>
          </div>
        </div>

        {/* Progreso visual */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaBuilding className="text-blue-600 text-xl" />
            <div>
              <h3 className="font-bold text-blue-800">Información Básica</h3>
              <p className="text-sm text-blue-700">
                Estos datos te ayudarán a personalizar tu perfil de restaurante y facilitar el contacto con tus clientes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}