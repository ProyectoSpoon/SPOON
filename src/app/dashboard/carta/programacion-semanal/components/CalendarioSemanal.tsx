'use client';

import React, { useState } from 'react';
import { Calendar, Copy, Trash, Save, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuCombinacion } from '../types/programacion.types';

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

interface CalendarioSemanalProps {
  programacionSemanal: Record<DiaSemana, MenuCombinacion[]>;
  diasSemana: DiaSemana[];
  diaSeleccionado: DiaSemana;
  onSelectDia: (dia: DiaSemana) => void;
  onDrop: (dia: DiaSemana, e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveCombinacion: (dia: DiaSemana, combinacionId: string) => void;
  onCopyDia: (fromDia: DiaSemana, toDia: DiaSemana) => void;
  onSaveTemplate: () => void;
  onLoadTemplate: () => void;
}

export const CalendarioSemanal: React.FC<CalendarioSemanalProps> = ({
  programacionSemanal,
  diasSemana,
  diaSeleccionado,
  onSelectDia,
  onDrop,
  onRemoveCombinacion,
  onCopyDia,
  onSaveTemplate,
  onLoadTemplate
}) => {
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [diaToCopy, setDiaToCopy] = useState<DiaSemana | null>(null);
  const [showTemplateOptions, setShowTemplateOptions] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Función para obtener el nombre de la combinación
  const getNombreCombinacion = (combinacion: MenuCombinacion) => {
    if (combinacion.nombre) return combinacion.nombre;
    
    const partes = [];
    if (combinacion.entrada?.nombre) partes.push(combinacion.entrada.nombre);
    if (combinacion.principio?.nombre) partes.push(combinacion.principio.nombre);
    if (combinacion.proteina?.nombre) partes.push(combinacion.proteina.nombre);
    if (combinacion.bebida?.nombre) partes.push(combinacion.bebida.nombre);
    
    return partes.length > 0 ? partes.join(' + ') : 'Combinación sin nombre';
  };
  
  // Función para manejar el arrastre sobre un día
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Función para manejar la copia de un día a otro
  const handleCopyDia = () => {
    if (diaToCopy && diaSeleccionado) {
      onCopyDia(diaToCopy, diaSeleccionado);
      setShowCopyOptions(false);
      setDiaToCopy(null);
    }
  };
  
  // Función para guardar la plantilla actual
  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      onSaveTemplate();
      setShowTemplateOptions(false);
      setTemplateName('');
    }
  };
  
  // Calcular el total de combinaciones por día
  const getTotalCombinaciones = (dia: DiaSemana) => {
    return programacionSemanal[dia]?.length || 0;
  };
  
  // Calcular el tiempo estimado de preparación por día (simulado)
  const getTiempoPreparacion = (dia: DiaSemana) => {
    const totalCombinaciones = getTotalCombinaciones(dia);
    // Asumimos 15 minutos por combinación
    const minutos = totalCombinaciones * 15;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Encabezado del calendario */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold">Calendario Semanal</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCopyOptions(!showCopyOptions)}
            className="text-sm px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center mx-2"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Copiar día
          </button>
          
          <button
            onClick={() => setShowTemplateOptions(!showTemplateOptions)}
            className="text-sm px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center mx-2"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Plantillas
          </button>
        </div>
      </div>
      
      {/* Panel de opciones de copia */}
      {showCopyOptions && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copiar desde:
              </label>
              <select
                value={diaToCopy || ''}
                onChange={(e) => setDiaToCopy(e.target.value as DiaSemana)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm"
              >
                <option value="">Seleccionar día</option>
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia} ({getTotalCombinaciones(dia)} combinaciones)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mr-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copiar a:
              </label>
              <div className="text-sm py-1.5 px-3 bg-gray-100 rounded-md">
                {diaSeleccionado}
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleCopyDia}
                disabled={!diaToCopy}
                className={`px-6 py-2 rounded-md text-sm mx-2 ${
                  diaToCopy
                    ? 'bg-spoon-primary text-white hover:bg-spoon-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Copiar
              </button>
              
              <button
                onClick={() => setShowCopyOptions(false)}
                className="ml-2 px-6 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 mx-2"
              >
                Cancelar
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Esta acción reemplazará todas las combinaciones del día seleccionado.
          </div>
        </div>
      )}
      
      {/* Panel de opciones de plantillas */}
      {showTemplateOptions && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-end">
            <div className="mr-3 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardar como plantilla:
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nombre de la plantilla"
                className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm"
              />
            </div>
            
            <div>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className={`px-6 py-2 rounded-md text-sm mx-2 ${
                  templateName.trim()
                    ? 'bg-spoon-primary text-white hover:bg-spoon-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Guardar
              </button>
              
              <button
                onClick={() => setShowTemplateOptions(false)}
                className="ml-2 px-6 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 mx-2"
              >
                Cancelar
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargar plantilla:
            </label>
            <div className="flex items-center">
              <select
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Seleccionar plantilla</option>
                <option value="plantilla1">Semana Regular</option>
                <option value="plantilla2">Semana Especial</option>
                <option value="plantilla3">Fin de Semana</option>
              </select>
              
              <button
                onClick={onLoadTemplate}
                className="ml-2 px-6 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 mx-2"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Calendario */}
      <div className="grid grid-cols-7 gap-0">
        {diasSemana.map((dia) => (
          <button
            key={dia}
            onClick={() => onSelectDia(dia)}
            className={`p-4 text-center border-b border-r border-gray-200 transition-colors
              ${dia === diaSeleccionado 
                ? 'bg-spoon-primary-light text-spoon-primary' 
                : 'hover:bg-gray-50'}`}
          >
            <span className="block text-sm font-medium">{dia}</span>
            <span className="block text-xs text-gray-500 mt-1">
              {getTotalCombinaciones(dia)} combos
            </span>
            <div className="mt-2 text-xs font-mono bg-gray-100 rounded px-2 py-1 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              {getTiempoPreparacion(dia)}
            </div>
          </button>
        ))}
      </div>
      
      {/* Vista previa del día seleccionado */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">
            Combinaciones para {diaSeleccionado}
          </h3>
          
          <div className="flex space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div
          className="min-h-[150px] border-2 border-dashed border-gray-200 rounded-lg p-3"
          onDragOver={handleDragOver}
          onDrop={(e) => onDrop(diaSeleccionado, e)}
        >
          {programacionSemanal[diaSeleccionado]?.length > 0 ? (
            <div className="space-y-2">
              {programacionSemanal[diaSeleccionado].map((combinacion) => (
                <div
                  key={combinacion.id}
                  className="p-2 border rounded-md bg-white flex justify-between items-center group hover:border-spoon-primary"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {getNombreCombinacion(combinacion)}
                    </div>
                    
                    {combinacion.especial && (
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                        Especial
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onRemoveCombinacion(diaSeleccionado, combinacion.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Arrastra combinaciones aquí para programar el {diaSeleccionado.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioSemanal;
























