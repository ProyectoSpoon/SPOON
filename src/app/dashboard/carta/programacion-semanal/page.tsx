'use client';

import { useState } from 'react';
import { Clock, AlertCircle, Save, Share, ChevronLeft, ChevronRight, RotateCcw, Calendar, Wand2 } from 'lucide-react';
import { useProgramacionSemanalUnificado } from './hooks/useProgramacionSemanalUnificado';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import CombinacionesViewer from './components/CombinacionesViewer';
import CalendarioSemanal from './components/CalendarioSemanal';
import { toast } from 'sonner';

type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

const RESTAURANTE_ID_PRUEBA = 'rest-test-001';

export default function ProgramacionSemanalPage() {
  const {
    loading,
    error,
    guardando,
    publicando,
    programandoAutomatico,
    hasUnsavedChanges,
    combinacionesDisponibles,
    menusDiarios,
    fechaInicioSemana,
    fechaFinSemana,
    diaSeleccionado,
    setDiaSeleccionado,
    semanaAnterior,
    semanaSiguiente,
    irASemanaActual,
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    copiarDia,
    limpiarDia,
    handleDrop,
    guardarBorrador,
    publicarProgramacion,
    programarAutomaticamente,
    diasSemana,
    totalCombinacionesSemana,
    resetError,
    recargar
  } = useProgramacionSemanalUnificado({
    restaurantId: RESTAURANTE_ID_PRUEBA
  });

  const [showCombinacionDetails, setShowCombinacionDetails] = useState<any>(null);
  const [diaParaCopiar, setDiaParaCopiar] = useState<DiaSemana | null>(null);

  const transformarCombinacion = (combinacion: any) => {
    if (!combinacion) return null;
    
    return {
      id: combinacion.id || '',
      entrada: {
        id: combinacion.entrada?.id || '',
        nombre: combinacion.entrada?.nombre || combinacion.entrada?.name || '',
        descripcion: combinacion.entrada?.descripcion || combinacion.entrada?.description || '',
        precio: combinacion.entrada?.precio || combinacion.entrada?.current_price || 0,
        categoriaId: combinacion.entrada?.categoriaId || combinacion.entrada?.category_id || ''
      },
      principio: {
        id: combinacion.principio?.id || '',
        nombre: combinacion.principio?.nombre || combinacion.principio?.name || '',
        descripcion: combinacion.principio?.descripcion || combinacion.principio?.description || '',
        precio: combinacion.principio?.precio || combinacion.principio?.current_price || 0,
        categoriaId: combinacion.principio?.categoriaId || combinacion.principio?.category_id || ''
      },
      proteina: {
        id: combinacion.proteina?.id || '',
        nombre: combinacion.proteina?.nombre || combinacion.proteina?.name || '',
        descripcion: combinacion.proteina?.descripcion || combinacion.proteina?.description || '',
        precio: combinacion.proteina?.precio || combinacion.proteina?.current_price || 0,
        categoriaId: combinacion.proteina?.categoriaId || combinacion.proteina?.category_id || ''
      },
      bebida: {
        id: combinacion.bebida?.id || '',
        nombre: combinacion.bebida?.nombre || combinacion.bebida?.name || '',
        descripcion: combinacion.bebida?.descripcion || combinacion.bebida?.description || '',
        precio: combinacion.bebida?.precio || combinacion.bebida?.current_price || 0,
        categoriaId: combinacion.bebida?.categoriaId || combinacion.bebida?.category_id || ''
      },
      acompanamiento: (combinacion.acompanamiento || combinacion.acompanamientos || []).map((acomp: any) => ({
        id: acomp?.id || '',
        nombre: acomp?.nombre || acomp?.name || '',
        descripcion: acomp?.descripcion || acomp?.description || '',
        precio: acomp?.precio || acomp?.current_price || 0,
        categoriaId: acomp?.categoriaId || acomp?.category_id || ''
      })),
      nombre: combinacion.nombre || combinacion.name,
      descripcion: combinacion.descripcion || combinacion.description,
      precioEspecial: combinacion.precioEspecial || combinacion.special_price,
      cantidad: combinacion.cantidad || combinacion.current_quantity,
      estado: combinacion.estado || (combinacion.is_available ? 'disponible' : 'agotado'),
      favorito: combinacion.favorito || false,
      especial: combinacion.especial || combinacion.is_featured || false
    };
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para manejar drop personalizada
  const handleDropCustom = (dia: DiaSemana, e: React.DragEvent<HTMLDivElement>) => {
    // Esta función maneja el evento de drop del calendario
    // El hook ya tiene su propia lógica de handleDrop
    handleDrop(dia, e as any);
  };

  // Función para agregar combinación transformando tipos
  const handleAddCombinacion = (combinacion: any) => {
    // Transformar de vuelta al formato que espera el hook
    const combinacionTransformada = {
      id: combinacion.id,
      name: combinacion.nombre || '',
      description: combinacion.descripcion || '',
      entrada: {
        id: combinacion.entrada?.id || '',
        name: combinacion.entrada?.nombre || '',
        description: combinacion.entrada?.descripcion || '',
        current_price: combinacion.entrada?.precio || 0,
        category_id: combinacion.entrada?.categoriaId || '',
        image_url: null,
        nombre: combinacion.entrada?.nombre || '',
        descripcion: combinacion.entrada?.descripcion || '',
        precio: combinacion.entrada?.precio || 0,
        categoriaId: combinacion.entrada?.categoriaId || ''
      },
      principio: {
        id: combinacion.principio?.id || '',
        name: combinacion.principio?.nombre || '',
        description: combinacion.principio?.descripcion || '',
        current_price: combinacion.principio?.precio || 0,
        category_id: combinacion.principio?.categoriaId || '',
        image_url: null,
        nombre: combinacion.principio?.nombre || '',
        descripcion: combinacion.principio?.descripcion || '',
        precio: combinacion.principio?.precio || 0,
        categoriaId: combinacion.principio?.categoriaId || ''
      },
      proteina: {
        id: combinacion.proteina?.id || '',
        name: combinacion.proteina?.nombre || '',
        description: combinacion.proteina?.descripcion || '',
        current_price: combinacion.proteina?.precio || 0,
        category_id: combinacion.proteina?.categoriaId || '',
        image_url: null,
        nombre: combinacion.proteina?.nombre || '',
        descripcion: combinacion.proteina?.descripcion || '',
        precio: combinacion.proteina?.precio || 0,
        categoriaId: combinacion.proteina?.categoriaId || ''
      },
      bebida: {
        id: combinacion.bebida?.id || '',
        name: combinacion.bebida?.nombre || '',
        description: combinacion.bebida?.descripcion || '',
        current_price: combinacion.bebida?.precio || 0,
        category_id: combinacion.bebida?.categoriaId || '',
        image_url: null,
        nombre: combinacion.bebida?.nombre || '',
        descripcion: combinacion.bebida?.descripcion || '',
        precio: combinacion.bebida?.precio || 0,
        categoriaId: combinacion.bebida?.categoriaId || ''
      },
      acompanamientos: (combinacion.acompanamiento || []).map((acomp: any) => ({
        id: acomp.id || '',
        name: acomp.nombre || '',
        description: acomp.descripcion || '',
        current_price: acomp.precio || 0,
        category_id: acomp.categoriaId || '',
        image_url: null,
        nombre: acomp.nombre || '',
        descripcion: acomp.descripcion || '',
        precio: acomp.precio || 0,
        categoriaId: acomp.categoriaId || ''
      })),
      acompanamiento: (combinacion.acompanamiento || []).map((acomp: any) => ({
        id: acomp.id || '',
        name: acomp.nombre || '',
        description: acomp.descripcion || '',
        current_price: acomp.precio || 0,
        category_id: acomp.categoriaId || '',
        image_url: null,
        nombre: acomp.nombre || '',
        descripcion: acomp.descripcion || '',
        precio: acomp.precio || 0,
        categoriaId: acomp.categoriaId || ''
      })),
      base_price: combinacion.precioEspecial || 0,
      special_price: combinacion.precioEspecial || null,
      is_available: combinacion.estado === 'disponible',
      is_featured: combinacion.especial || false,
      max_daily_quantity: combinacion.cantidad || 0,
      current_quantity: combinacion.cantidad || 0,
      sold_quantity: 0,
      nombre: combinacion.nombre,
      descripcion: combinacion.descripcion,
      precioEspecial: combinacion.precioEspecial,
      cantidad: combinacion.cantidad,
      estado: combinacion.estado,
      favorito: combinacion.favorito,
      especial: combinacion.especial
    };

    agregarCombinacionAlDia(diaSeleccionado, combinacionTransformada as any);
  };

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

  const handleClearDay = (dia: DiaSemana) => {
    const confirmacion = confirm(`¿Está seguro de que desea limpiar todas las combinaciones de ${dia}?`);
    if (confirmacion) {
      limpiarDia(dia);
    }
  };

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

  const combinacionesTransformadas = (combinacionesDisponibles || []).map(transformarCombinacion).filter(Boolean);
  
  const programacionSemanalTransformada = {
    'Lunes': (menusDiarios.find(m => m.dia === 'Lunes')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Martes': (menusDiarios.find(m => m.dia === 'Martes')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Miércoles': (menusDiarios.find(m => m.dia === 'Miércoles')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Jueves': (menusDiarios.find(m => m.dia === 'Jueves')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Viernes': (menusDiarios.find(m => m.dia === 'Viernes')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Sábado': (menusDiarios.find(m => m.dia === 'Sábado')?.combinaciones || []).map(transformarCombinacion).filter(Boolean),
    'Domingo': (menusDiarios.find(m => m.dia === 'Domingo')?.combinaciones || []).map(transformarCombinacion).filter(Boolean)
  };

  return (
    <div className="p-6 px-8">
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
              {combinacionesTransformadas.length} combinaciones disponibles
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <CombinacionesViewer
            combinaciones={combinacionesTransformadas as any}
            onAddToDia={handleAddCombinacion}
            onViewDetails={() => {}} // Simplificado por ahora
            loading={loading}
          />
        </div>

        <div className="col-span-2">
          <CalendarioSemanal
            programacionSemanal={programacionSemanalTransformada as any}
            diasSemana={diasSemana}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
            onDrop={handleDropCustom}
            onRemoveCombinacion={removerCombinacionDelDia}
            onCopyDia={handleCopyDay}
            onSaveTemplate={() => {}} // Prop requerida pero sin funcionalidad
            onLoadTemplate={() => {}} // Prop requerida pero sin funcionalidad
          />
        </div>
      </div>

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

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Programación Semanal
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Gestione la programación semanal arrastrando combinaciones al calendario, 
              copie días completos y publique directamente en las aplicaciones móviles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
