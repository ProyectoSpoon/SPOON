'use client';

import { useState } from 'react';
import { Clock, AlertCircle, CalendarIcon, Save, Share, ChevronLeft, ChevronRight, RotateCcw, Copy, Trash2, Calendar, Wand2 } from 'lucide-react';
import { useProgramacionSemanalUnificado } from './hooks/useProgramacionSemanalUnificado';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import CombinacionesViewer from './components/CombinacionesViewer';
import CalendarioSemanal from './components/CalendarioSemanal';
import { toast } from 'sonner';

// Tipo para los días de la semana
type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

// ID de restaurante de prueba
const RESTAURANTE_ID_PRUEBA = 'rest-test-001';

export default function ProgramacionSemanalPage() {
  const {
    // Estados
    loading,
    error,
    guardando,
    publicando,
    cargandoPlantilla,
    programandoAutomatico,
    hasUnsavedChanges,
    
    // Datos
    combinacionesDisponibles,
    plantillas,
    menusDiarios,
    
    // Semana actual
    semanaActual,
    fechaInicioSemana,
    fechaFinSemana,
    
    // Día seleccionado
    diaSeleccionado,
    setDiaSeleccionado,
    combinacionesDelDiaSeleccionado,
    
    // Navegación de semanas
    semanaAnterior,
    semanaSiguiente,
    irASemanaActual,
    
    // Operaciones con combinaciones
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    copiarDia,
    limpiarDia,
    handleDrop,
    
    // Operaciones de guardado
    guardarBorrador,
    publicarProgramacion,
    
    // Programación automática
    programarAutomaticamente,
    
    // Plantillas
    guardarPlantilla,
    cargarPlantilla,
    eliminarPlantilla,
    
    // Utilidades
    diasSemana,
    totalCombinacionesSemana,
    resetError,
    recargar
  } = useProgramacionSemanalUnificado({
    restaurantId: RESTAURANTE_ID_PRUEBA
  });

  // Estados locales para UI
  const [selectedPlantilla, setSelectedPlantilla] = useState<string>('');
  const [showCombinacionDetails, setShowCombinacionDetails] = useState<any>(null);
  const [diaParaCopiar, setDiaParaCopiar] = useState<DiaSemana | null>(null);

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Manejador para ver detalles de una combinación
  const handleViewCombinacionDetails = (combinacion: any) => {
    setShowCombinacionDetails(combinacion);
  };

  // Manejador para guardar una plantilla
  const handleSaveTemplate = async () => {
    const nombre = prompt('Ingrese un nombre para la plantilla:');
    if (nombre) {
      const descripcion = prompt('Ingrese una descripción (opcional):') || '';
      await guardarPlantilla(nombre, descripcion);
    }
  };

  // Manejador para cargar una plantilla
  const handleLoadTemplate = async () => {
    if (selectedPlantilla) {
      const confirmacion = confirm('¿Está seguro de que desea cargar esta plantilla? Se perderán los cambios no guardados.');
      if (confirmacion) {
        await cargarPlantilla(selectedPlantilla);
        setSelectedPlantilla('');
      }
    }
  };

  // Manejador para eliminar plantilla
  const handleDeleteTemplate = async (plantillaId: string) => {
    await eliminarPlantilla(plantillaId);
    
    // Si la plantilla eliminada estaba seleccionada, limpiar selección
    if (selectedPlantilla === plantillaId) {
      setSelectedPlantilla('');
    }
  };

  // Manejador para copiar día
  const handleCopyDay = (diaOrigen: DiaSemana) => {
    if (diaParaCopiar) {
      const confirmacion = confirm(`¿Copiar combinaciones de ${diaOrigen} a ${diaParaCopiar}?`);
      if (confirmacion) {
        copiarDia(diaOrigen, diaParaCopiar);
        setDiaParaCopiar(null);
      }
    } else {
      setDiaParaCopiar(diaOrigen);
      toast.info(`Seleccionado ${diaOrigen} para copiar. Haga clic en otro día para pegar.`);
    }
  };

  // Manejador para limpiar día
  const handleClearDay = (dia: DiaSemana) => {
    const confirmacion = confirm(`¿Está seguro de que desea limpiar todas las combinaciones de ${dia}?`);
    if (confirmacion) {
      limpiarDia(dia);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#F4821F] border-r-[#F4821F] border-b-neutral-200 border-l-neutral-200 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Cargando programación semanal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Programación Semanal del Menú
            </h1>
            {fechaInicioSemana && fechaFinSemana && (
              <p className="text-neutral-600 text-sm mt-1">
                {formatearFecha(fechaInicioSemana)} - {formatearFecha(fechaFinSemana)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegación de semanas */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={semanaAnterior}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={irASemanaActual}
                disabled={loading}
                className="h-8 px-3 text-xs"
              >
                Hoy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={semanaSiguiente}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Botón de auto-programar */}
            <Button 
              className="flex items-center px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] transition-colors"
              onClick={programarAutomaticamente}
              disabled={programandoAutomatico || loading}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {programandoAutomatico ? 'Programando...' : 'Auto-programar'}
            </Button>
          </div>
        </div>

        {/* Barra de estadísticas */}
        <div className="flex items-center gap-4 bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">
              {totalCombinacionesSemana} combinaciones programadas
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">
              {combinacionesDisponibles.length} combinaciones disponibles
            </span>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Cambios sin guardar</span>
            </div>
          )}
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
            programacionSemanal={menusDiarios.reduce((acc, menu) => ({
              ...acc,
              [menu.dia]: menu.combinaciones
            }), {})}
            diasSemana={diasSemana}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
            onDrop={handleDrop}
            onRemoveCombinacion={removerCombinacionDelDia}
            onCopyDia={handleCopyDay}
            onClearDia={handleClearDay}
            diaParaCopiar={diaParaCopiar}
            onCancelCopy={() => setDiaParaCopiar(null)}
            onSaveTemplate={handleSaveTemplate}
            onLoadTemplate={handleLoadTemplate}
          />
        </div>
      </div>

      {/* Panel de Plantillas */}
      <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Plantillas</h3>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPlantilla}
            onChange={(e) => setSelectedPlantilla(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4821F]"
            disabled={cargandoPlantilla}
          >
            <option value="">Seleccionar plantilla...</option>
            {plantillas.map((plantilla) => (
              <option key={plantilla.id} value={plantilla.id}>
                {plantilla.nombre} - {plantilla.descripcion}
              </option>
            ))}
          </select>
          
          <Button
            onClick={handleLoadTemplate}
            disabled={!selectedPlantilla || cargandoPlantilla}
            variant="outline"
            className="border-[#F4821F] text-[#F4821F] hover:bg-[#F4821F] hover:text-white"
          >
            {cargandoPlantilla ? 'Cargando...' : 'Cargar Plantilla'}
          </Button>
          
          <Button
            onClick={handleSaveTemplate}
            variant="outline"
            className="border-[#F4821F] text-[#F4821F] hover:bg-[#F4821F] hover:text-white"
          >
            Guardar como Plantilla
          </Button>
          
          {selectedPlantilla && (
            <Button
              onClick={() => handleDeleteTemplate(selectedPlantilla)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
        
        {plantillas.length === 0 && (
          <div className="mt-4 text-center text-neutral-500 text-sm">
            No hay plantillas guardadas. Cree una programación y guárdela como plantilla.
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            onClick={recargar}
            variant="outline"
            disabled={loading}
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          
          {error && (
            <Button
              onClick={resetError}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Limpiar Error
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={guardarBorrador}
            disabled={guardando || !hasUnsavedChanges}
            variant="outline"
            className="border-[#F4821F] text-[#F4821F] hover:bg-[#F4821F] hover:text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {guardando ? 'Guardando...' : 'Guardar Borrador'}
          </Button>
          
          <Button
            onClick={publicarProgramacion}
            disabled={publicando || totalCombinacionesSemana === 0}
            className="bg-[#F4821F] text-white hover:bg-[#CC6A10] transition-colors"
          >
            <Share className="w-4 h-4 mr-2" />
            {publicando ? 'Publicando...' : 'Publicar Programación'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Programación Semanal Mejorada
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Gestione la programación semanal con datos reales desde PostgreSQL. 
              Arrastre combinaciones al calendario, copie días completos, use plantillas 
              y publique directamente en las aplicaciones móviles.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalles de combinación */}
      {showCombinacionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCombinacionDetails.name || 'Detalles de la Combinación'}
              </h2>
              <button
                onClick={() => setShowCombinacionDetails(null)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Componentes</h3>
                <div className="space-y-2">
                  {showCombinacionDetails.entrada && (
                    <div className="p-2 bg-orange-50 rounded-md">
                      <span className="text-xs font-medium text-orange-800">Entrada</span>
                      <p className="text-sm">{showCombinacionDetails.entrada.name}</p>
                    </div>
                  )}
                  
                  {showCombinacionDetails.principio && (
                    <div className="p-2 bg-yellow-50 rounded-md">
                      <span className="text-xs font-medium text-yellow-800">Principio</span>
                      <p className="text-sm">{showCombinacionDetails.principio.name}</p>
                    </div>
                  )}
                  
                  <div className="p-2 bg-red-50 rounded-md">
                    <span className="text-xs font-medium text-red-800">Proteína</span>
                    <p className="text-sm">{showCombinacionDetails.proteina.name}</p>
                  </div>
                  
                  {showCombinacionDetails.acompanamientos?.length > 0 && (
                    <div className="p-2 bg-green-50 rounded-md">
                      <span className="text-xs font-medium text-green-800">Acompañamientos</span>
                      <div className="space-y-1">
                        {showCombinacionDetails.acompanamientos.map((acomp: any) => (
                          <p key={acomp.id} className="text-sm">{acomp.name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showCombinacionDetails.bebida && (
                    <div className="p-2 bg-blue-50 rounded-md">
                      <span className="text-xs font-medium text-blue-800">Bebida</span>
                      <p className="text-sm">{showCombinacionDetails.bebida.name}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Información</h3>
                
                <div className="space-y-3">
                  {showCombinacionDetails.description && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Descripción</span>
                      <p className="text-sm">{showCombinacionDetails.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Precio</span>
                    <p className="text-sm font-medium">
                      {showCombinacionDetails.special_price 
                        ? `$${showCombinacionDetails.special_price.toLocaleString('es-CO')}` 
                        : `$${showCombinacionDetails.base_price.toLocaleString('es-CO')}`}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Disponibilidad</span>
                    <p className="text-sm">
                      {showCombinacionDetails.current_quantity} / {showCombinacionDetails.max_daily_quantity} unidades
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {showCombinacionDetails.is_featured && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        Destacado
                      </span>
                    )}
                    
                    {showCombinacionDetails.special_price && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Precio Especial
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => {
                      agregarCombinacionAlDia(diaSeleccionado, showCombinacionDetails);
                      setShowCombinacionDetails(null);
                    }}
                    className="bg-[#F4821F] text-white hover:bg-[#CC6A10] text-sm"
                  >
                    Agregar al {diaSeleccionado}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}