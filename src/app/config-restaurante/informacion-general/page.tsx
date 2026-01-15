'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck, FaBuilding, FaPhone, FaEnvelope, FaUtensils, FaEdit } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext';
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
  const { user, loading: authLoading, updateRestaurantId } = useAuth();
  const { syncAfterSave } = useConfigSync();

  const [formData, setFormData] = useState<RestaurantInfo>({
    name: '',
    description: '',
    phone: '',
    email: '',
    cuisineType: ''
  });

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [hasExistingRestaurant, setHasExistingRestaurant] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    description: false,
    phone: false,
    cuisineType: false
  });

  // Cargar datos del restaurante
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) {
        console.log('🔍 Usuario no cargado aún');
        return;
      }

      try {
        setCargando(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        // Usar el restaurantId si existe, sino usar 'current' para que el backend lo detecte
        const restaurantId = user.restaurantId || 'current';

        const response = await fetch(`/api/restaurants/${restaurantId}/general-info`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.nombreRestaurante || '',
            description: data.descripcion || '',
            phone: data.telefono || '',
            email: user?.email || '',
            cuisineType: data.tipoComida || ''
          });

          // Marcar que hay restaurante existente
          setHasExistingRestaurant(true);

          // Si encontramos restaurante y no teníamos el ID, actualizarlo
          if (data.restaurantId && !user.restaurantId) {
            updateRestaurantId(data.restaurantId);
          }
        } else if (response.status === 404) {
          // No tiene restaurante, usar email del usuario
          setFormData(prev => ({
            ...prev,
            email: user?.email || ''
          }));
          setHasExistingRestaurant(false);
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user, updateRestaurantId]);

  // Pre-llenar email para usuarios nuevos
  useEffect(() => {
    if (!user?.restaurantId && !formData.email && user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email, user?.restaurantId, formData.email]);

  const handleVolver = () => {
    router.push('/config-restaurante');
  };

  const handleContinuar = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: 'Campos Requeridos',
        description: 'Por favor completa el nombre, teléfono y email del restaurante',
        variant: 'destructive'
      });
      return;
    }

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

        await syncAfterSave();

        if (result.isNew) {
          updateRestaurantId(result.data.id);
          router.push('/config-restaurante');
        } else {
          if (actualizarCampo && user?.restaurantId) {
            actualizarCampo('/config-restaurante/informacion-general', 'nombre', Boolean(formData.name.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'contacto', Boolean(formData.phone.trim() && formData.email.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'descripcion', Boolean(formData.description.trim()));
            actualizarCampo('/config-restaurante/informacion-general', 'tipoComida', Boolean(formData.cuisineType.trim()));

            if (sincronizarConBD) {
              await sincronizarConBD(user.restaurantId);
            }
          }
          router.push('/config-restaurante');
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

  const handleGuardarYSalir = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: 'Campos Requeridos',
        description: 'Por favor completa el nombre, teléfono y email del restaurante',
        variant: 'destructive'
      });
      return;
    }

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
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const payload = {
        nombreRestaurante: formData.name.trim(),
        descripcion: formData.description.trim() || null,
        telefono: formData.phone.trim(),
        tipoComida: formData.cuisineType.trim() || null
      };
      // NOTA: email no se envía porque no existe en la tabla restaurants
      // El email del usuario está en auth.users

      const url = user?.restaurantId
        ? `/api/restaurants/${user.restaurantId}/general-info`
        : `/api/restaurants/new/general-info`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar información');
      }

      // Actualizar store
      actualizarCampo('/config-restaurante/informacion-general', 'nombre', Boolean(formData.name));
      actualizarCampo('/config-restaurante/informacion-general', 'contacto', Boolean(formData.phone && formData.email));
      actualizarCampo('/config-restaurante/informacion-general', 'descripcion', Boolean(formData.description));
      actualizarCampo('/config-restaurante/informacion-general', 'tipoComida', Boolean(formData.cuisineType));

      // SIEMPRE actualizar el restaurantId si viene en la respuesta
      if (data.restaurantId && !user?.restaurantId) {
        console.log('🔄 Actualizando restaurantId en contexto:', data.restaurantId);
        await updateRestaurantId(data.restaurantId);
      }

      // Sincronizar con BD
      if (user?.restaurantId || data.restaurantId) {
        await syncAfterSave();
      }

      toast({
        title: '✅ Información guardada',
        description: 'Los datos han sido guardados exitosamente',
        variant: 'default'
      });

      // Redirigir a la página principal de configuración
      router.push('/config-restaurante');
    } catch (error) {
      console.error('❌ Error guardando:', error);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const camposCompletos = formData.name.trim() && formData.phone.trim() && formData.email.trim();

  // ✅ 1. ESTADO DE CARGA (Prioridad Máxima)
  if (authLoading || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Verificando sesión...' : 'Cargando información...'}
          </p>
        </div>
      </div>
    );
  }

  // ✅ 2. PROTECCIÓN DE RUTA (Solo Auth - SIN AUTO-REDIRECT)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sesión Requerida</h2>
          <p className="text-gray-600 mb-6">
            Para configurar tu restaurante necesitas iniciar sesión nuevamente.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // ✅ 3. RENDERIZADO DEL FORMULARIO



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/config-restaurante')}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Información General</h1>
          </div>
          <p className="text-gray-600 ml-12">
            {hasExistingRestaurant
              ? 'Edita la información básica de tu restaurante'
              : 'Completa la información básica de tu restaurante'
            }
          </p>
        </div>

        {/* Banner de información existente */}
        {hasExistingRestaurant && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg ml-12">
            <div className="flex items-center">
              <FaBuilding className="text-blue-500 text-xl mr-3" />
              <div>
                <p className="text-blue-900 font-semibold">Información Existente</p>
                <p className="text-blue-700 text-sm">
                  Ya tienes información guardada. Presiona el ícono <FaEdit className="inline text-blue-600 mx-1" /> para editar cada campo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm ml-12">
          <div className="space-y-6">

            {/* Nombre del restaurante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaBuilding className="inline mr-2 text-orange-500" />
                Nombre del Restaurante *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Restaurante La Cocina"
                  className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${hasExistingRestaurant && !editMode.name ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  readOnly={hasExistingRestaurant && !editMode.name}
                  required
                />
                {hasExistingRestaurant && (
                  <button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, name: !prev.name }))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${editMode.name
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    title={editMode.name ? 'Terminar edición' : 'Editar campo'}
                  >
                    {editMode.name ? <FaCheck /> : <FaEdit />}
                  </button>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-orange-500" />
                  Teléfono de Contacto *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej: +57 312 345 6789"
                    className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${hasExistingRestaurant && !editMode.phone ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    readOnly={hasExistingRestaurant && !editMode.phone}
                    required
                  />
                  {hasExistingRestaurant && (
                    <button
                      type="button"
                      onClick={() => setEditMode(prev => ({ ...prev, phone: !prev.phone }))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${editMode.phone
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      title={editMode.phone ? 'Terminar edición' : 'Editar campo'}
                    >
                      {editMode.phone ? <FaCheck /> : <FaEdit />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-orange-500" />
                  Email de Contacto *
                  {formData.email === user?.email && (
                    <span className="text-xs text-green-600 ml-2">
                      (Pre-llenado con tu email)
                    </span>
                  )}
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
                <p className="text-xs text-gray-500 mt-1">
                  Este será el email de contacto público del restaurante. Puedes usar uno diferente a tu email personal.
                </p>
              </div>
            </div>

            {/* Tipo de cocina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUtensils className="inline mr-2 text-orange-500" />
                Tipo de Cocina
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  placeholder="Ej: Comida Italiana, Mexicana, etc."
                  className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${hasExistingRestaurant && !editMode.cuisineType ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  readOnly={hasExistingRestaurant && !editMode.cuisineType}
                />
                {hasExistingRestaurant && (
                  <button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, cuisineType: !prev.cuisineType }))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${editMode.cuisineType
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    title={editMode.cuisineType ? 'Terminar edición' : 'Editar campo'}
                  >
                    {editMode.cuisineType ? <FaCheck /> : <FaEdit />}
                  </button>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Restaurante
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu restaurante..."
                  rows={4}
                  className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${hasExistingRestaurant && !editMode.description ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  readOnly={hasExistingRestaurant && !editMode.description}
                />
                {hasExistingRestaurant && (
                  <button
                    type="button"
                    onClick={() => setEditMode(prev => ({ ...prev, description: !prev.description }))}
                    className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${editMode.description
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    title={editMode.description ? 'Terminar edición' : 'Editar campo'}
                  >
                    {editMode.description ? <FaCheck /> : <FaEdit />}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Botones de navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-center">
            <button
              onClick={handleGuardarYSalir}
              disabled={guardando || !camposCompletos}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${camposCompletos && !guardando
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <FaCheck className="text-sm" />
              {guardando ? 'Guardando...' : 'Guardar y Salir'}
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
    </div >
  );
}