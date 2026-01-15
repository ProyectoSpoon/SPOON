// src/app/config-restaurante/logo-portada/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaCheck } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext';
import SubirLogo from './components/subirlogo';
import SubirPortada from './components/subirportada';
import { useConfigSync } from '@/hooks/use-config-sync';

interface ArchivoImagen {
  archivo: File | null;
  previewUrl: string | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
}

const estadoInicial: ArchivoImagen = {
  archivo: null,
  previewUrl: null,
  estado: 'pendiente',
  error: undefined
};

export default function LogoPortadaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { syncAfterSave } = useConfigSync();
  const { user, loading: authLoading } = useAuth();

  const [estaEnviando, setEstaEnviando] = useState(false);
  const [logo, setLogo] = useState<ArchivoImagen>(estadoInicial);
  const [portada, setPortada] = useState<ArchivoImagen>(estadoInicial);
  const [cargando, setCargando] = useState(true);

  const { actualizarCampo } = useConfigStore();

  // Cargar imágenes existentes
  useEffect(() => {
    const cargarImagenes = async () => {
      if (authLoading) return;

      try {
        setCargando(true);
        console.log('🖼️ Cargando imágenes existentes');

        const response = await fetch('/api/restaurants/current/images');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Imágenes cargadas:', data);

          if (data.logoUrl) {
            setLogo({
              archivo: null,
              previewUrl: data.logoUrl,
              estado: 'completado'
            });
          }

          if (data.coverImageUrl) {
            setPortada({
              archivo: null,
              previewUrl: data.coverImageUrl,
              estado: 'completado'
            });
          }
        }
      } catch (error) {
        console.error('❌ Error cargando imágenes:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarImagenes();
  }, [authLoading]);

  const manejarCambioLogo = (archivo: File) => {
    const url = URL.createObjectURL(archivo);
    setLogo({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
  };

  const manejarCambioPortada = (archivo: File) => {
    const url = URL.createObjectURL(archivo);
    setPortada({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
  };

  const subirImagen = async (archivo: File, tipo: 'logo' | 'cover'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('type', tipo);

    console.log(`📤 Subiendo ${tipo}:`, archivo.name);

    const response = await fetch('/api/restaurants/current/images', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error subiendo ${tipo}`);
    }

    const data = await response.json();
    console.log(`✅ ${tipo} subido:`, data);
    return data.url;
  };

  const handleGuardarYSalir = async () => {
    try {
      setEstaEnviando(true);

      // Subir logo si hay archivo nuevo
      if (logo.archivo) {
        setLogo(prev => ({ ...prev, estado: 'cargando' }));
        try {
          const logoUrl = await subirImagen(logo.archivo, 'logo');
          setLogo(prev => ({
            ...prev,
            previewUrl: logoUrl,
            estado: 'completado'
          }));
        } catch (error) {
          setLogo(prev => ({
            ...prev,
            estado: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }));
          throw error;
        }
      }

      // Subir portada si hay archivo nuevo
      if (portada.archivo) {
        setPortada(prev => ({ ...prev, estado: 'cargando' }));
        try {
          const portadaUrl = await subirImagen(portada.archivo, 'cover');
          setPortada(prev => ({
            ...prev,
            previewUrl: portadaUrl,
            estado: 'completado'
          }));
        } catch (error) {
          setPortada(prev => ({
            ...prev,
            estado: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }));
          throw error;
        }
      }

      // Actualizar store
      actualizarCampo('/config-restaurante/logo-portada', 'logo', logo.estado === 'completado');
      actualizarCampo('/config-restaurante/logo-portada', 'portada', portada.estado === 'completado');

      // Sincronizar progreso
      await syncAfterSave();

      toast({
        title: '✅ Imágenes guardadas',
        description: 'Logo y portada actualizados correctamente',
      });

      // Volver a la página principal
      router.push('/config-restaurante');

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar',
        variant: 'destructive'
      });
    } finally {
      setEstaEnviando(false);
    }
  };

  const configuracionCompleta = (): boolean => {
    return logo.estado === 'completado' && portada.estado === 'completado';
  };

  if (authLoading || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando imágenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="text-center">
            <span className="text-sm text-gray-500 font-medium">Paso 4 de 4</span>
          </div>

          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Logo y Portada
            </h1>
            <p className="text-gray-600">
              Sube las imágenes representativas de tu restaurante
            </p>
          </div>
        </div>

        {/* Contenido Principal - Ambos uploads visibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo del Restaurante</h3>
            <SubirLogo
              archivo={logo}
              onFileChange={manejarCambioLogo}
              estaEnviando={estaEnviando}
            />
            {logo.estado === 'error' && (
              <p className="text-sm text-red-700 mt-2">• {logo.error}</p>
            )}
          </div>

          {/* Portada */}
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen de Portada</h3>
            <SubirPortada
              archivo={portada}
              onFileChange={manejarCambioPortada}
              estaEnviando={estaEnviando}
            />
            {portada.estado === 'error' && (
              <p className="text-sm text-red-700 mt-2">• {portada.error}</p>
            )}
          </div>
        </div>

        {/* Estado de configuración */}
        {configuracionCompleta() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-600 text-xl" />
              <div>
                <h3 className="font-bold text-green-800">¡Todo listo!</h3>
                <p className="text-sm text-green-700">
                  Las imágenes están configuradas correctamente
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de Navegación - SOLO DOS BOTONES */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-center">

            <button
              onClick={handleGuardarYSalir}
              disabled={estaEnviando || !configuracionCompleta()}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${configuracionCompleta() && !estaEnviando
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {estaEnviando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  Guardar y Salir
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}