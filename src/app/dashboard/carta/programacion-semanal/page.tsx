'use client';

import { useState } from 'react';
import { Clock, AlertCircle, CalendarIcon } from 'lucide-react';
import { useCombinacionesProgramacion } from './hooks/useCombinacionesProgramacion';
import type { MenuCombinacion } from './types/programacion.types';

// Tipo para los días de la semana
type DiaSemana = keyof typeof DIAS_SEMANA;
const DIAS_SEMANA = {
  'Lunes': { index: 0 },
  'Martes': { index: 1 },
  'Miércoles': { index: 2 },
  'Jueves': { index: 3 },
  'Viernes': { index: 4 },
  'Sábado': { index: 5 },
  'Domingo': { index: 6 }
} as const;
import CombinacionesViewer from './components/CombinacionesViewer';
import CalendarioSemanal from './components/CalendarioSemanal';

export default function ProgramacionSemanalPage() {
  const {
    combinacionesDisponibles,
    programacionSemanal,
    plantillas,
    diaSeleccionado,
    setDiaSeleccionado,
    loading,
    error,
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    copiarDia,
    guardarPlantilla,
    cargarPlantilla,
    eliminarPlantilla,
    programarAutomaticamente,
    handleDrop,
    diasSemana
  } = useCombinacionesProgramacion();

  const [selectedPlantilla, setSelectedPlantilla] = useState<string>('');
  const [showCombinacionDetails, setShowCombinacionDetails] = useState<MenuCombinacion | null>(null);

  // Manejador para ver detalles de una combinación
  const handleViewCombinacionDetails = (combinacion: MenuCombinacion) => {
    setShowCombinacionDetails(combinacion);
  };

  // Manejador para guardar una plantilla
  const handleSaveTemplate = () => {
    const nombre = prompt('Ingrese un nombre para la plantilla:');
    if (nombre) {
      guardarPlantilla(nombre);
    }
  };

  // Manejador para cargar una plantilla
  const handleLoadTemplate = () => {
    if (selectedPlantilla) {
      cargarPlantilla(selectedPlantilla);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#F4821F] border-r-[#F4821F] border-b-neutral-200 border-l-neutral-200 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Cargando programación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-800">
            Programación Semanal del Menú
          </h1>
          <button 
            className="flex items-center px-6 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] transition-colors mx-4"
            onClick={programarAutomaticamente}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto-programar
          </button>
        </div>
      </div>

      {/* Panel Principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Combinaciones Disponibles */}
        <div className="col-span-1">
          <CombinacionesViewer
            combinaciones={combinacionesDisponibles}
            onAddToDia={(combinacion) => agregarCombinacionAlDia(diaSeleccionado, combinacion)}
            onViewDetails={handleViewCombinacionDetails}
            loading={loading}
          />
        </div>

        {/* Calendario Semanal */}
        <div className="col-span-2">
          <CalendarioSemanal
            programacionSemanal={programacionSemanal}
            diasSemana={diasSemana}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
            onDrop={handleDrop}
            onRemoveCombinacion={removerCombinacionDelDia}
            onCopyDia={copiarDia}
            onSaveTemplate={handleSaveTemplate}
            onLoadTemplate={handleLoadTemplate}
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Programación Semanal Mejorada
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Ahora puede ver todas las combinaciones disponibles, arrastrarlas al calendario, 
              copiar días completos y guardar plantillas para uso futuro.
              Las combinaciones se guardan automáticamente en el caché local.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalles de combinación */}
      {showCombinacionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {showCombinacionDetails.nombre || 'Detalles de la Combinación'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Componentes</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-orange-50 rounded-md">
                    <span className="text-xs font-medium text-orange-800">Entrada</span>
                    <p className="text-sm">{showCombinacionDetails.entrada.nombre}</p>
                  </div>
                  
                  <div className="p-2 bg-yellow-50 rounded-md">
                    <span className="text-xs font-medium text-yellow-800">Principio</span>
                    <p className="text-sm">{showCombinacionDetails.principio.nombre}</p>
                  </div>
                  
                  <div className="p-2 bg-red-50 rounded-md">
                    <span className="text-xs font-medium text-red-800">Proteína</span>
                    <p className="text-sm">{showCombinacionDetails.proteina.nombre}</p>
                  </div>
                  
                  <div className="p-2 bg-green-50 rounded-md">
                    <span className="text-xs font-medium text-green-800">Acompañamientos</span>
                    <div className="space-y-1">
                      {showCombinacionDetails.acompanamiento.map(acomp => (
                        <p key={acomp.id} className="text-sm">{acomp.nombre}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-2 bg-blue-50 rounded-md">
                    <span className="text-xs font-medium text-blue-800">Bebida</span>
                    <p className="text-sm">{showCombinacionDetails.bebida.nombre}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Información</h3>
                
                <div className="space-y-3">
                  {showCombinacionDetails.descripcion && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Descripción</span>
                      <p className="text-sm">{showCombinacionDetails.descripcion}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Precio</span>
                    <p className="text-sm font-medium">
                      {showCombinacionDetails.precioEspecial 
                        ? `$${showCombinacionDetails.precioEspecial.toLocaleString('es-CO')}` 
                        : 'Precio calculado por componentes'}
                    </p>
                  </div>
                  
                  {showCombinacionDetails.cantidad !== undefined && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Disponibilidad</span>
                      <p className="text-sm">{showCombinacionDetails.cantidad} unidades</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {showCombinacionDetails.especial && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        Especial
                      </span>
                    )}
                    
                    {showCombinacionDetails.favorito && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Favorito
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => agregarCombinacionAlDia(diaSeleccionado, showCombinacionDetails)}
                    className="mr-2 px-6 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] text-sm mx-2"
                  >
                    Agregar al {diaSeleccionado}
                  </button>
                  
                  <button
                    onClick={() => setShowCombinacionDetails(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-sm mx-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
