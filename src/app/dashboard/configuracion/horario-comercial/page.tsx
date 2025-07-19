// src/app/config-restaurante/horario-comercial/page.tsx
'use client';

import React from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { useHorarios } from './hooks/useHorarios';
import { DiaSemana, DIAS_SEMANA, NOMBRES_DIAS } from './types/horarios.types';
import { formatTo12Hour, generarOpcionesHorario } from './utils/time';

export default function HorarioComercialPage() {
  const { toast } = useToast();
  const {
    horarios,
    diaSeleccionado,
    setDiaSeleccionado,
    guardando,
    toggleDiaAbierto,
    actualizarTurno,
    agregarTurno,
    eliminarTurno,
    copiarHorarios,
    guardarHorarios,
    tieneHorariosConfigurados
  } = useHorarios();

  const opcionesHorario = generarOpcionesHorario();

  const handleGuardar = async () => {
    const exito = await guardarHorarios();
    if (exito) {
      toast({
        title: 'Éxito',
        description: 'Horarios guardados correctamente',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Horarios inválidos. Verifica que la hora de cierre sea posterior a la de apertura.',
        variant: 'destructive'
      });
    }
  };

  const horarioDiaActual = horarios[diaSeleccionado];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* Tabs de días de la semana */}
      <div className="flex gap-1">
        {DIAS_SEMANA.map((dia) => (
          <button
            key={dia}
            onClick={() => setDiaSeleccionado(dia)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              diaSeleccionado === dia
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {NOMBRES_DIAS[dia]}
          </button>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Vista general - Horarios de la semana */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Horarios de la semana</h3>
          
          <div className="space-y-3">
            {DIAS_SEMANA.map((dia) => {
              const horarioDia = horarios[dia];
              return (
                <div
                  key={dia}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    diaSeleccionado === dia ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        horarioDia.abierto ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium text-gray-900 w-20">
                      {NOMBRES_DIAS[dia]}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-sm text-gray-600 mx-4">
                    {horarioDia.abierto ? (
                      horarioDia.turnos.map((turno, i) => (
                        <span key={i} className="mr-3">
                          {formatTo12Hour(turno.horaApertura)} - {formatTo12Hour(turno.horaCierre)}
                        </span>
                      ))
                    ) : (
                      <span className="text-red-600">Cerrado</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setDiaSeleccionado(dia)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor del día seleccionado */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Configurar {NOMBRES_DIAS[diaSeleccionado]}
          </h3>
          
          <div className="space-y-6">
            {/* Estado del día */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estado del día:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, true)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    horarioDiaActual.abierto
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Abierto
                </button>
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, false)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    !horarioDiaActual.abierto
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cerrado
                </button>
              </div>
            </div>

            {/* Horarios */}
            {horarioDiaActual.abierto && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Horarios:
                </label>
                
                <div className="space-y-4">
                  {horarioDiaActual.turnos.map((turno, indice) => (
                    <div key={indice} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Turno {indice + 1}
                        </span>
                        {horarioDiaActual.turnos.length > 1 && (
                          <button
                            onClick={() => eliminarTurno(diaSeleccionado, indice)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Eliminar turno
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Apertura:</label>
                          <select
                            value={turno.horaApertura}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaApertura: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {opcionesHorario.map(opcion => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Cierre:</label>
                          <select
                            value={turno.horaCierre}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaCierre: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {opcionesHorario.map(opcion => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => agregarTurno(diaSeleccionado)}
                    className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus className="text-xs" />
                    Agregar turno
                  </button>
                </div>
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Acciones rápidas:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    copiarHorarios(e.target.value as DiaSemana, diaSeleccionado);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                defaultValue=""
              >
                <option value="">Copiar desde otro día...</option>
                {DIAS_SEMANA.filter(dia => dia !== diaSeleccionado).map(dia => (
                  <option key={dia} value={dia}>
                    {NOMBRES_DIAS[dia]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleGuardar}
          disabled={guardando || !tieneHorariosConfigurados()}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            (tieneHorariosConfigurados() && !guardando)
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaCheck className="text-sm" />
          {guardando ? 'Guardando...' : tieneHorariosConfigurados() ? 'Guardar Cambios' : 'Configura horarios'}
        </button>
      </div>

    </div>
  );
}