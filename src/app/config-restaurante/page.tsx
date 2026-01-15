// src/app/config-restaurante/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calcularProgresoConfiguracion } from './utils/progress-validator';
import { useConfigStore } from './store/config-store';
import { useAuth } from '@/context/postgres-authcontext';

interface ConfigProgress {
  informacionGeneral: boolean;
  ubicacion: boolean;
  horarios: boolean;
  logoPortada: boolean;
  totalCompleto: number;
  totalPasos: number;
  porcentaje: number;
}

export default function ConfigRestaurantePage() {
  const router = useRouter();
  const { cargarConfiguracion, obtenerProgresoGeneral, obtenerProgresoSeccion } = useConfigStore();
  const { user } = useAuth();
  const [progreso, setProgreso] = useState<ConfigProgress>({
    informacionGeneral: false,
    ubicacion: false,
    horarios: false,
    logoPortada: false,
    totalCompleto: 0,
    totalPasos: 4,
    porcentaje: 0
  });
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  /**
   * Cargar progreso real desde el store
   */
  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        setCargando(true);

        // Siempre intentar cargar (auto-detectará el restaurante si existe)
        console.log('📊 Cargando progreso del restaurante...');
        if (user?.restaurantId) {
          await cargarConfiguracion(user.restaurantId);
        }

        // Obtener progreso actualizado del store
        const progresoReal = obtenerProgresoGeneral();
        const progresoInformacion = obtenerProgresoSeccion('/config-restaurante/informacion-general');
        const progresoUbicacion = obtenerProgresoSeccion('/config-restaurante/ubicacion');
        const progresoHorarios = obtenerProgresoSeccion('/config-restaurante/horario-comercial');
        const progresoImagenes = obtenerProgresoSeccion('/config-restaurante/logo-portada');

        console.log('📊 Progreso por secciones:');
        console.log('  - Información General:', progresoInformacion.porcentaje + '% (' + progresoInformacion.completados + '/' + progresoInformacion.total + ')');
        console.log('  - Ubicación:', progresoUbicacion.porcentaje + '% (' + progresoUbicacion.completados + '/' + progresoUbicacion.total + ')');
        console.log('  - Horarios:', progresoHorarios.porcentaje + '% (' + progresoHorarios.completados + '/' + progresoHorarios.total + ')');
        console.log('  - Logo/Portada:', progresoImagenes.porcentaje + '% (' + progresoImagenes.completados + '/' + progresoImagenes.total + ')');

        setProgreso({
          informacionGeneral: progresoInformacion.porcentaje === 100,
          ubicacion: progresoUbicacion.porcentaje === 100,
          horarios: progresoHorarios.porcentaje === 100,
          logoPortada: progresoImagenes.porcentaje === 100,
          totalCompleto: progresoReal.completados,
          totalPasos: progresoReal.total,
          porcentaje: progresoReal.porcentaje
        });

        // Actualizar restaurantId si se encontró
        if (user?.restaurantId) {
          setRestaurantId(user.restaurantId);
        }

      } catch (error) {
        console.error('❌ Error cargando progreso:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarProgreso();
  }, [user?.restaurantId, cargarConfiguracion, obtenerProgresoGeneral, obtenerProgresoSeccion]);

  /**
   * Actualizar progreso cuando la página se vuelve visible (usuario regresa de otras páginas)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.restaurantId) {
        console.log('🔄 Página visible, recargando progreso de DB...');
        cargarConfiguracion(user.restaurantId).then(() => {
          // Recalcular progreso con datos frescos
          const progresoReal = obtenerProgresoGeneral();
          const progresoInformacion = obtenerProgresoSeccion('/config-restaurante/informacion-general');
          const progresoUbicacion = obtenerProgresoSeccion('/config-restaurante/ubicacion');
          const progresoHorarios = obtenerProgresoSeccion('/config-restaurante/horario-comercial');
          const progresoImagenes = obtenerProgresoSeccion('/config-restaurante/logo-portada');

          console.log('🔄 Progreso actualizado:');
          console.log('  - Información General:', progresoInformacion.porcentaje + '% (' + progresoInformacion.completados + '/' + progresoInformacion.total + ')');
          console.log('  - Ubicación:', progresoUbicacion.porcentaje + '% (' + progresoUbicacion.completados + '/' + progresoUbicacion.total + ')');
          console.log('  - Horarios:', progresoHorarios.porcentaje + '% (' + progresoHorarios.completados + '/' + progresoHorarios.total + ')');
          console.log('  - Logo/Portada:', progresoImagenes.porcentaje + '% (' + progresoImagenes.completados + '/' + progresoImagenes.total + ')');

          setProgreso({
            informacionGeneral: progresoInformacion.porcentaje === 100,
            ubicacion: progresoUbicacion.porcentaje === 100,
            horarios: progresoHorarios.porcentaje === 100,
            logoPortada: progresoImagenes.porcentaje === 100,
            totalCompleto: progresoReal.completados,
            totalPasos: progresoReal.total,
            porcentaje: progresoReal.porcentaje
          });
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.restaurantId, cargarConfiguracion, obtenerProgresoGeneral, obtenerProgresoSeccion]);

  // Obtener progreso detallado del store para mostrar en tarjetas
  const progresoInformacion = obtenerProgresoSeccion('/config-restaurante/informacion-general');
  const progresoUbicacion = obtenerProgresoSeccion('/config-restaurante/ubicacion');
  const progresoHorarios = obtenerProgresoSeccion('/config-restaurante/horario-comercial');
  const progresoImagenes = obtenerProgresoSeccion('/config-restaurante/logo-portada');

  /**
   * Obtener color del porcentaje según el progreso
   */
  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje === 0) return 'text-gray-500';
    if (porcentaje === 100) return 'text-green-600';
    return 'text-orange-600';
  };

  /**
   * Obtener texto del estado según porcentaje
   */
  const getTextoEstado = (porcentaje: number) => {
    if (porcentaje === 0) return 'Pendiente';
    if (porcentaje === 100) return 'Completado';
    return 'En progreso';
  };

  /**
   * Verificar si la configuración está completa (todos los pasos)
   * Usar lógica basada en secciones completadas, no campos individuales
   */
  const seccionesCompletadas = [
    progreso.informacionGeneral,
    progreso.ubicacion,
    progreso.horarios,
    progreso.logoPortada
  ].filter(Boolean).length;

  const configuracionCompleta = seccionesCompletadas === 4; // 4 de 4 secciones

  console.log('📊 Estado de configuración:');
  console.log('  - Secciones completadas:', seccionesCompletadas + '/4');
  console.log('  - Configuración completa:', configuracionCompleta);
  console.log('  - Progreso del store:', progreso.totalCompleto + '/' + progreso.totalPasos);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a SPOON! 🍴
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Tu socio tecnológico para hacer crecer tu restaurante
          </p>
          <p className="text-gray-500 mb-8">
            Estamos aquí para ayudarte a vender más con nuestro menú digital gratuito. Solo necesitamos configurar algunos detalles básicos para comenzar.
          </p>

          {/* Info del usuario */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>👤 admin@spoon.com</span>
            <span>🆔 ID: 4073a4ad-b275-4e17-b197-844881f0319e</span>
            <span>👑 super_admin</span>
          </div>
        </div>

        {/* Título de configuración */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Configuración Inicial
          </h2>
          <p className="text-gray-600">
            Completa estos 4 pasos para activar todas las funcionalidades de SPOON
          </p>
        </div>

        {/* Tarjetas de configuración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* Información General */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            {/* Icono de triángulo */}
            <div className="absolute top-4 right-4">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0L20 20H0L10 0z" />
              </svg>
            </div>

            {/* Icono principal */}
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a3 3 0 003 3h2a3 3 0 003-3V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Información General</h3>
              <p className="text-sm text-gray-600 mb-6">
                Datos básicos del restaurante: nombre, contacto y tipo de cocina
              </p>

              {/* Progreso */}
              <div className="mb-4">
                <div className={`text-2xl font-bold ${getColorPorcentaje(progresoInformacion.porcentaje)} mb-2`}>
                  {progresoInformacion.porcentaje}%
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {progresoInformacion.completados}/{progresoInformacion.total}
                </div>
                <div className="flex items-center justify-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    📋 {getTextoEstado(progresoInformacion.porcentaje)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/config-restaurante/informacion-general')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Configurar →
              </button>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            {/* Icono de triángulo */}
            <div className="absolute top-4 right-4">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0L20 20H0L10 0z" />
              </svg>
            </div>

            {/* Icono principal */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-sm text-gray-600 mb-6">
                Dirección y ubicación geográfica del restaurante
              </p>

              {/* Progreso */}
              <div className="mb-4">
                <div className={`text-2xl font-bold ${getColorPorcentaje(progresoUbicacion.porcentaje)} mb-2`}>
                  {progresoUbicacion.porcentaje}%
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {progresoUbicacion.completados}/{progresoUbicacion.total}
                </div>
                <div className="flex items-center justify-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    📋 {getTextoEstado(progresoUbicacion.porcentaje)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/config-restaurante/ubicacion')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Configurar →
              </button>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            {/* Icono de triángulo */}
            <div className="absolute top-4 right-4">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0L20 20H0L10 0z" />
              </svg>
            </div>

            {/* Icono principal */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Horarios</h3>
              <p className="text-sm text-gray-600 mb-6">
                Horarios de atención y días de operación
              </p>

              {/* Progreso real desde base de datos */}
              <div className="mb-4">
                <div className={`text-2xl font-bold ${getColorPorcentaje(progresoHorarios.porcentaje)} mb-2`}>
                  {progresoHorarios.porcentaje}%
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {progresoHorarios.completados}/{progresoHorarios.total}
                </div>
                <div className="flex items-center justify-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    📋 {getTextoEstado(progresoHorarios.porcentaje)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/config-restaurante/horario-comercial')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Configurar →
              </button>
            </div>
          </div>

          {/* Logo y Portada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            {/* Icono de triángulo */}
            <div className="absolute top-4 right-4">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0L20 20H0L10 0z" />
              </svg>
            </div>

            {/* Icono principal */}
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logo y Portada</h3>
              <p className="text-sm text-gray-600 mb-6">
                Imágenes representativas del restaurante
              </p>

              {/* Progreso */}
              <div className="mb-4">
                <div className={`text-2xl font-bold ${getColorPorcentaje(progresoImagenes.porcentaje)} mb-2`}>
                  {progresoImagenes.porcentaje}%
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {progresoImagenes.completados}/{progresoImagenes.total}
                </div>
                <div className="flex items-center justify-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    📋 {getTextoEstado(progresoImagenes.porcentaje)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/config-restaurante/logo-portada')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Configurar →
              </button>
            </div>
          </div>
        </div>

        {/* Estado general */}
        {!configuracionCompleta ? (
          <div className="text-center bg-orange-50 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
              </svg>
              <h3 className="text-xl font-bold text-orange-800">
                Faltan algunos pasos
              </h3>
            </div>
            <p className="text-orange-700 mb-6">
              Completa las configuraciones pendientes para activar todas las funciones
            </p>
            <p className="text-sm text-orange-600">
              Progreso actual: {seccionesCompletadas} de 4 secciones completadas ({Math.round((seccionesCompletadas / 4) * 100)}%)
            </p>
          </div>
        ) : (
          <div className="text-center bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <h3 className="text-xl font-bold text-green-800">
                ¡Configuración Completa!
              </h3>
            </div>
            <p className="text-green-700 mb-6">
              Has completado todos los pasos de configuración. ¡Tu restaurante está completamente configurado!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              ⏱️ Completar configuración
            </button>
          </div>
        )}

        {/* Debug Info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm">
            <h4 className="font-bold mb-2">Debug - Progreso Real:</h4>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <strong>Información General:</strong> {progreso.informacionGeneral ? '✅ Completado' : '❌ Pendiente'}
              </div>
              <div>
                <strong>Ubicación:</strong> {progreso.ubicacion ? '✅ Completado' : '❌ Pendiente'}
              </div>
              <div>
                <strong>Horarios:</strong> {progreso.horarios ? '✅ Completado' : '⏳ No implementado'}
              </div>
              <div>
                <strong>Logo y Portada:</strong> {progreso.logoPortada ? '✅ Completado' : '❌ Pendiente'}
              </div>
            </div>
            <p className="mt-2">
              <strong>Total:</strong> {progreso.totalCompleto}/{progreso.totalPasos} ({progreso.porcentaje}%)
            </p>
            <p><strong>Restaurant ID:</strong> {restaurantId}</p>
          </div>
        )}

      </div>
    </div>
  );
}
