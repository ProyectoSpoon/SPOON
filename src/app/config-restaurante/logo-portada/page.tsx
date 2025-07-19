// src/app/config-restaurante/logo-portada/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useConfigStore } from '../store/config-store';
import { useAuth } from '@/context/postgres-authcontext'; // ← AGREGAR IMPORT
import { IndicadorProgreso } from '@/shared/components/ui/IndicadorProgreso';
import SubirLogo from './components/subirlogo';
import SubirPortada from './components/subirportada';
import VistaPrevia from './components/vistaprevia';
import { useConfigSync } from '@/hooks/use-config-sync';

// Tipos TypeScript
interface PasoFormulario {
  titulo: string;
  descripcion: string;
}

interface ArchivoImagen {
  archivo: File | null;
  previewUrl: string | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
}

interface RestauranteInfo {
  id: string;
  nombre: string;
}

const pasosFormulario: PasoFormulario[] = [
  {
    titulo: 'Logo',
    descripcion: 'Logo del restaurante'
  },
  {
    titulo: 'Portada',
    descripcion: 'Imagen de portada'
  },
  {
    titulo: 'Vista Previa',
    descripcion: 'Revisión final'
  }
];

const estadoInicial: ArchivoImagen = {
  archivo: null,
  previewUrl: null,
  estado: 'pendiente',
  error: undefined
};

/**
 * Página de configuración de Logo y Portada del restaurante
 * @returns {JSX.Element} Componente de configuración de Logo y Portada
 */
export default function LogoPortadaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { syncAfterSave } = useConfigSync();
  const { user, loading: authLoading } = useAuth(); // ← USAR AUTH CONTEXT
  const restaurantId = user?.restaurantId; // ← ID DINÁMICO
  
  const [pasoActual, setPasoActual] = useState(0);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [logo, setLogo] = useState<ArchivoImagen>(estadoInicial);
  const [portada, setPortada] = useState<ArchivoImagen>(estadoInicial);
  const [cargandoInfo, setCargandoInfo] = useState(true);
  
  const { actualizarCampo } = useConfigStore();

  /**
   * Efecto para manejar la carga inicial y cambios en la autenticación
   */
  useEffect(() => {
    if (authLoading) {
      setCargandoInfo(true);
      return;
    }

    if (!user) {
      console.log('⚠️ Usuario no autenticado, redirigiendo...');
      router.push('/login');
      return;
    }

    if (!restaurantId) {
      console.log('⚠️ No hay restaurantId, esperando...');
      setCargandoInfo(true);
      return;
    }

    // Si llegamos aquí, tenemos usuario y restaurantId
    console.log('🚀 Logo-Portada iniciado');
    console.log('👤 Usuario:', user.email);
    console.log('🏪 Restaurant ID:', restaurantId);
    setCargandoInfo(false);
    
  }, [authLoading, user, restaurantId, router]);

  /**
   * Carga las imágenes existentes del restaurante cuando tenemos el ID
   */
  useEffect(() => {
    const cargarImagenesExistentes = async () => {
      if (!restaurantId || cargandoInfo) {
        return;
      }

      try {
        console.log('🖼️ Cargando imágenes para restaurante:', restaurantId);
        
        const response = await fetch(`/api/restaurants/${restaurantId}/images`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Imágenes existentes cargadas:', data);
          
          // Si ya hay logo, marcarlo como completado
          if (data.logoUrl) {
            setLogo({
              archivo: null,
              previewUrl: data.logoUrl,
              estado: 'completado'
            });
          }
          
          // Si ya hay portada, marcarla como completada
          if (data.coverImageUrl) {
            setPortada({
              archivo: null,
              previewUrl: data.coverImageUrl,
              estado: 'completado'
            });
          }
        } else {
          console.log('ℹ️ No se encontraron imágenes existentes');
        }
        
      } catch (error) {
        console.error('❌ Error cargando imágenes existentes:', error);
      }
    };

    cargarImagenesExistentes();
  }, [restaurantId, cargandoInfo]); // ← DEPENDE DE restaurantId DINÁMICO

  /**
   * Maneja el botón volver
   */
  const handleVolver = () => {
    router.push('/config-restaurante/horario-comercial');
  };

  /**
   * Maneja el botón continuar (después de finalizar)
   */
  const handleContinuar = () => {
    router.push('/dashboard');
  };

  /**
   * Maneja el cambio del archivo de logo
   * @param {File} archivo - Archivo de imagen del logo
   */
  const manejarCambioLogo = (archivo: File) => {
    const url = URL.createObjectURL(archivo);
    setLogo({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
  };

  /**
   * Maneja el cambio del archivo de portada
   * @param {File} archivo - Archivo de imagen de portada
   */
  const manejarCambioPortada = (archivo: File) => {
    const url = URL.createObjectURL(archivo);
    setPortada({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
  };

  /**
   * Sube una imagen al servidor
   */
  const subirImagen = async (archivo: File, tipo: 'logo' | 'cover'): Promise<string> => {
    if (!restaurantId) { // ← USAR restaurantId DINÁMICO
      throw new Error('No se encontró información del restaurante');
    }

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('type', tipo);

    console.log(`📤 Subiendo ${tipo} para restaurante ${restaurantId}:`, archivo.name);

    const response = await fetch(`/api/restaurants/${restaurantId}/images`, { // ← USAR restaurantId DINÁMICO
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

  /**
   * Valida si el paso actual está completo
   * @returns {boolean} True si el paso actual es válido
   */
  const validarPasoActual = (): boolean => {
    switch (pasoActual) {
      case 0:
        return logo.estado === 'completado';
      case 1:
        return portada.estado === 'completado';
      case 2:
        return true;
      default:
        return false;
    }
  };

  /**
   * Verifica si la configuración está completa
   */
  const configuracionCompleta = (): boolean => {
    return logo.estado === 'completado' && portada.estado === 'completado';
  };

  /**
   * Maneja el guardado de las imágenes
   * @param {boolean} finalizar - Indica si es el guardado final
   */
  const handleGuardar = async (finalizar: boolean = false) => {
    if (!restaurantId) { // ← USAR restaurantId DINÁMICO
      toast({
        title: 'Error',
        description: 'No se encontró información del restaurante',
        variant: 'destructive'
      });
      return;
    }

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
          console.log('✅ Logo guardado:', logoUrl);
        } catch (error) {
          console.error('❌ Error subiendo logo:', error);
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
          console.log('✅ Portada guardada:', portadaUrl);
        } catch (error) {
          console.error('❌ Error subiendo portada:', error);
          setPortada(prev => ({ 
            ...prev, 
            estado: 'error', 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          }));
          throw error;
        }
      }
      
      if (finalizar) {
        // Actualizar store de configuración
        actualizarCampo('/config-restaurante/logo-portada', 'logo', logo.estado === 'completado');
        actualizarCampo('/config-restaurante/logo-portada', 'portada', portada.estado === 'completado');
        
        // ✅ Sincronizar progreso después de guardar exitosamente
        await syncAfterSave();
        
        toast({
          title: '¡Configuración Completada!',
          description: 'Logo y portada guardados exitosamente. Redirigiendo al dashboard...',
        });

        // Esperar un momento para mostrar el toast y luego navegar
        setTimeout(() => {
          handleContinuar();
        }, 2000);
        
      } else {
        // ✅ Sincronizar progreso también en guardado parcial
        await syncAfterSave();
        
        toast({
          title: 'Progreso Guardado',
          description: 'Las imágenes han sido guardadas correctamente',
        });
      }
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setEstaEnviando(false);
    }
  };

  /**
   * Renderiza el contenido según el paso actual
   * @returns {JSX.Element | null} Componente del paso actual
   */
  const renderizarContenido = () => {
    if (authLoading || cargandoInfo) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {authLoading ? 'Verificando autenticación...' : 'Cargando información del restaurante...'}
            </p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Usuario no autenticado</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Ir a Login
            </button>
          </div>
        </div>
      );
    }

    if (!restaurantId) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">No se encontró información del restaurante</p>
            <button
              onClick={() => router.push('/config-restaurante/informacion-general')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Volver a Información General
            </button>
          </div>
        </div>
      );
    }

    switch (pasoActual) {
      case 0:
        return (
          <SubirLogo
            archivo={logo}
            onFileChange={manejarCambioLogo}
            estaEnviando={estaEnviando}
          />
        );
      case 1:
        return (
          <SubirPortada
            archivo={portada}
            onFileChange={manejarCambioPortada}
            estaEnviando={estaEnviando}
          />
        );
      case 2:
        return (
          <VistaPrevia
            logo={logo.previewUrl}
            portada={portada.previewUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
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
              <span className="text-sm text-gray-500 font-medium">Paso 4 de 4</span>
            </div>
            
            <div className="w-20"></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Logo y Portada
            </h1>
            <p className="text-gray-600">
              {user?.displayName ? `Personaliza la imagen de ${user.displayName}` : 'Personaliza la imagen de tu restaurante'}
            </p>
            {restaurantId && (
              <p className="text-xs text-blue-600 mt-2">
                ID: {restaurantId}
              </p>
            )}
          </div>
        </div>

        {/* Indicador de Progreso */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <IndicadorProgreso
            pasos={pasosFormulario}
            pasoActual={pasoActual}
          />
        </div>

        {/* Contenido Principal */}
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          {renderizarContenido()}
        </div>

        {/* Mostrar errores si los hay */}
        {(logo.estado === 'error' || portada.estado === 'error') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2">Errores encontrados:</h3>
            {logo.estado === 'error' && (
              <p className="text-sm text-red-700">• Logo: {logo.error}</p>
            )}
            {portada.estado === 'error' && (
              <p className="text-sm text-red-700">• Portada: {portada.error}</p>
            )}
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <FaArrowLeft className="text-sm" />
              Horarios
            </button>

            <div className="flex gap-4">
              {/* Botón Guardar Progreso */}
              <button
                onClick={() => handleGuardar(false)}
                disabled={estaEnviando || !validarPasoActual() || cargandoInfo || !restaurantId}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  validarPasoActual() && !cargandoInfo && restaurantId
                    ? 'text-blue-600 border-blue-200 hover:bg-blue-50'
                    : 'text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {estaEnviando ? 'Guardando...' : 'Guardar Progreso'}
              </button>

              {/* Botones de navegación de pasos */}
              {pasoActual > 0 && (
                <button
                  onClick={() => setPasoActual(prev => prev - 1)}
                  disabled={estaEnviando || cargandoInfo || !restaurantId}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Anterior
                </button>
              )}

              {pasoActual < pasosFormulario.length - 1 ? (
                <button
                  onClick={() => setPasoActual(prev => prev + 1)}
                  disabled={estaEnviando || !validarPasoActual() || cargandoInfo || !restaurantId}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    validarPasoActual() && !cargandoInfo && restaurantId
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={() => handleGuardar(true)}
                  disabled={estaEnviando || !configuracionCompleta() || cargandoInfo || !restaurantId}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    configuracionCompleta() && !estaEnviando && !cargandoInfo && restaurantId
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCheck className="text-sm" />
                  {estaEnviando ? 'Finalizando...' : 'Finalizar Configuración'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Estado de progreso global */}
        {configuracionCompleta() && !cargandoInfo && restaurantId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-600 text-xl" />
              <div>
                <h3 className="font-bold text-green-800">¡Configuración Lista!</h3>
                <p className="text-sm text-green-700">
                  Has completado todos los pasos necesarios. Las imágenes se han guardado en la base de datos.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}