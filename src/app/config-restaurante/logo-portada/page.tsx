// src/app/config-restaurante/logo-portada/page.tsx
'use client';

import React, { useState } from 'react';
import { useConfigStore } from '../store/config-store';
import { IndicadorProgreso } from '@/shared/components/ui/IndicadorProgreso';
import SubirLogo from './components/subirlogo';
import SubirPortada from './components/subirportada';
import VistaPrevia from './components/vistaprevia';

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
  const [pasoActual, setPasoActual] = useState(0);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [logo, setLogo] = useState<ArchivoImagen>(estadoInicial);
  const [portada, setPortada] = useState<ArchivoImagen>(estadoInicial);
  
  const { actualizarCampo } = useConfigStore();

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
   * Maneja el guardado de las imágenes
   * @param {boolean} finalizar - Indica si es el guardado final
   */
  const handleGuardar = async (finalizar: boolean = false) => {
    try {
      setEstaEnviando(true);
      
      // Aquí iría la lógica para subir las imágenes a Firebase Storage
      // const logoUrl = await subirImagen(logo.archivo, 'logos');
      // const portadaUrl = await subirImagen(portada.archivo, 'portadas');
      
      if (finalizar) {
        actualizarCampo('/config-restaurante/logo-portada', 'logo', logo.estado === 'completado');
        actualizarCampo('/config-restaurante/logo-portada', 'portada', portada.estado === 'completado');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setEstaEnviando(false);
    }
  };

  /**
   * Renderiza el contenido según el paso actual
   * @returns {JSX.Element | null} Componente del paso actual
   */
  const renderizarContenido = () => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Logo y Portada
          </h1>
          <p className="text-gray-600">
            Personaliza la imagen de tu restaurante
          </p>
        </div>

        {/* Indicador de Progreso */}
        <div className="mb-8">
          <IndicadorProgreso
            pasos={pasosFormulario}
            pasoActual={pasoActual}
          />
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderizarContenido()}
        </div>

        {/* Botones de Navegación */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleGuardar(false)}
            disabled={estaEnviando || !validarPasoActual()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Guardar Progreso
          </button>

          <div className="flex gap-4">
            {pasoActual > 0 && (
              <button
                onClick={() => setPasoActual(prev => prev - 1)}
                disabled={estaEnviando}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 
                  border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
            )}

            {pasoActual < pasosFormulario.length - 1 ? (
              <button
                onClick={() => setPasoActual(prev => prev + 1)}
                disabled={estaEnviando || !validarPasoActual()}
                className="px-4 py-2 bg-[#FF9933] hover:bg-[#FF8000] text-white rounded-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={() => handleGuardar(true)}
                disabled={estaEnviando || !validarPasoActual()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}