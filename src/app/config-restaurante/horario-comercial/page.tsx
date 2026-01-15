'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/Hooks/use-toast';
import { FaArrowLeft, FaCheck, FaClock, FaPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useHorarios } from './hooks/useHorarios';
import { DiaSemana, DIAS_SEMANA, NOMBRES_DIAS } from './types/horarios.types';
import { formatTo12Hour } from './utils/time';
import { useConfigSync } from '@/hooks/use-config-sync';

export default function HorarioComercialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { syncAfterSave } = useConfigSync();
  const {
    horarios,
    diaSeleccionado,
    setDiaSeleccionado,
    guardando,
    erroresValidacion,
    toggleDiaAbierto,
    actualizarTurno,
    agregarTurno,
    eliminarTurno,
    copiarHorarios,
    guardarHorarios,
    tieneHorariosConfigurados,
    diaConErrores,
    getOpcionesApertura,
    getOpcionesCierre,
    todasLasOpciones
  } = useHorarios();



  const handleContinuar = async () => {
    // ✅ Validar todos los días antes de continuar
    const diasConErrores = DIAS_SEMANA.filter(dia => {
      const error = erroresValidacion[dia];
      return error && error.trim() !== '';
    });

    if (diasConErrores.length > 0) {
      toast({
        title: 'Errores en horarios',
        description: `Corrige los errores en: ${diasConErrores.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const exito = await guardarHorarios();
      if (exito) {
        await syncAfterSave();

        toast({
          title: 'Éxito',
          description: 'Horarios guardados correctamente',
        });

        router.push('/config-restaurante');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar horarios',
        variant: 'destructive'
      });
    }
  };

  const horarioDiaActual = horarios[diaSeleccionado];
  const errorDiaActual = erroresValidacion[diaSeleccionado] || '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header con navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="text-center">
            <span className="text-sm text-gray-500 font-medium">Paso 3 de 4</span>
          </div>

          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Horario Comercial
            </h1>
            <p className="text-gray-600">
              Configura los horarios de atención de tu restaurante para cada día de la semana
            </p>
            {/* ✅ NUEVO: Mostrar advertencia si hay errores (ahora debería ser raro) */}
            {Object.values(erroresValidacion).some(error => error && error.trim() !== '') && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <FaExclamationTriangle className="text-sm" />
                <span className="text-sm">
                  Hay un problema con los horarios configurados
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ACTUALIZADO: Tabs con indicadores de error */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex gap-1">
            {DIAS_SEMANA.map((dia) => (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(dia)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${diaSeleccionado === dia
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {NOMBRES_DIAS[dia]}
                {/* ✅ NUEVO: Indicador de error */}
                {diaConErrores(dia) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ✅ ACTUALIZADA: Vista general con indicadores de error */}
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de la semana</h3>

            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => {
                const horarioDia = horarios[dia];
                const tieneError = diaConErrores(dia);

                return (
                  <div
                    key={dia}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${diaSeleccionado === dia
                      ? 'border-gray-300 bg-gray-50'
                      : tieneError
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${tieneError
                          ? 'bg-red-500'
                          : horarioDia.abierto
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          }`}
                      />
                      <span className="font-medium text-gray-900 w-20">
                        {NOMBRES_DIAS[dia]}
                      </span>
                      {tieneError && (
                        <FaExclamationTriangle className="text-red-500 text-xs" />
                      )}
                    </div>

                    <div className="flex-1 text-sm text-gray-600 mx-4">
                      {tieneError ? (
                        <span className="text-red-600 text-xs">Error en horarios</span>
                      ) : horarioDia.abierto ? (
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
                      className={`text-xs px-3 py-1 rounded border transition-colors ${tieneError
                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                        : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                        }`}
                    >
                      {tieneError ? 'Corregir' : 'Editar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ ACTUALIZADO: Editor con validaciones y opciones filtradas */}
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configurar {NOMBRES_DIAS[diaSeleccionado]}
              {errorDiaActual && errorDiaActual.trim() !== '' && (
                <span className="ml-2 text-red-500 text-sm">
                  <FaExclamationTriangle className="inline mr-1" />
                  Con errores
                </span>
              )}
            </h3>

            {/* ✅ NUEVO: Mostrar error específico del día */}
            {errorDiaActual && errorDiaActual.trim() !== '' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorDiaActual}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Estado del día */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Estado del día:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDiaAbierto(diaSeleccionado, true)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${horarioDiaActual.abierto
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Abierto
                  </button>
                  <button
                    onClick={() => toggleDiaAbierto(diaSeleccionado, false)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${!horarioDiaActual.abierto
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Cerrado
                  </button>
                </div>
              </div>

              {/* ✅ ACTUALIZADO: Horarios con opciones filtradas */}
              {horarioDiaActual.abierto && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Horarios:
                  </label>

                  <div className="space-y-4">
                    {horarioDiaActual.turnos.map((turno, indice) => {
                      // ✅ NUEVO: Obtener opciones filtradas para este turno
                      const opcionesApertura = getOpcionesApertura(diaSeleccionado, indice);
                      const opcionesCierre = getOpcionesCierre(diaSeleccionado, indice, turno.horaApertura);

                      return (
                        <div key={indice} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Turno {indice + 1}
                            </span>
                            {horarioDiaActual.turnos.length > 1 && (
                              <button
                                onClick={() => eliminarTurno(diaSeleccionado, indice)}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                              >
                                <FaTrash className="text-xs" />
                                Eliminar
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">
                                Apertura:
                                {opcionesApertura.some(opt => opt.disabled) && (
                                  <span className="ml-1 text-blue-600">(algunas opciones no disponibles)</span>
                                )}
                              </label>
                              <select
                                value={turno.horaApertura}
                                onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaApertura: e.target.value })}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              >
                                {opcionesApertura.map(opcion => (
                                  <option
                                    key={opcion.value}
                                    value={opcion.value}
                                    disabled={opcion.disabled}
                                    style={{
                                      color: opcion.disabled ? '#9CA3AF' : 'inherit',
                                      backgroundColor: opcion.disabled ? '#F3F4F6' : 'inherit'
                                    }}
                                  >
                                    {opcion.disabled ? `${opcion.label} (no disponible)` : opcion.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">
                                Cierre:
                                {opcionesCierre.some(opt => opt.disabled) && (
                                  <span className="ml-1 text-blue-600">(algunas opciones no disponibles)</span>
                                )}
                              </label>
                              <select
                                value={turno.horaCierre}
                                onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaCierre: e.target.value })}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              >
                                {opcionesCierre.map(opcion => (
                                  <option
                                    key={opcion.value}
                                    value={opcion.value}
                                    disabled={opcion.disabled}
                                    style={{
                                      color: opcion.disabled ? '#9CA3AF' : 'inherit',
                                      backgroundColor: opcion.disabled ? '#F3F4F6' : 'inherit'
                                    }}
                                  >
                                    {opcion.disabled ? `${opcion.label} (no disponible)` : opcion.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* ✅ ACTUALIZADO: Botón agregar turno con validación */}
                    <button
                      onClick={() => agregarTurno(diaSeleccionado)}
                      disabled={horarioDiaActual.turnos.length >= 3}
                      className={`w-full py-2 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 ${horarioDiaActual.turnos.length >= 3
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                        }`}
                    >
                      <FaPlus className="text-xs" />
                      {horarioDiaActual.turnos.length >= 3
                        ? 'Máximo 3 turnos por día'
                        : 'Agregar turno'
                      }
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

        {/* Botón - SOLO UNO */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-center">
            <button
              onClick={handleContinuar}
              disabled={guardando || !tieneHorariosConfigurados() || Object.values(erroresValidacion).some(error => error && error.trim() !== '')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${tieneHorariosConfigurados() && !guardando && !Object.values(erroresValidacion).some(error => error && error.trim() !== '')
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  {Object.values(erroresValidacion).some(error => error && error.trim() !== '')
                    ? 'Corrige errores primero'
                    : tieneHorariosConfigurados()
                      ? 'Guardar y Salir'
                      : 'Configura horarios'
                  }
                </>
              )}
            </button>
          </div>
        </div>

        {/* ✅ ACTUALIZADO: Progreso con tips de validación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 text-xl" />
            <div>
              <h3 className="font-bold text-blue-800">Horarios de Atención</h3>
              <p className="text-sm text-blue-700">
                Define cuando estará abierto tu restaurante. Horarios disponibles de 6:00 AM a 11:30 PM con intervalos de 30 minutos.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 <strong>Tip:</strong> Las opciones se deshabilitan automáticamente para prevenir conflictos entre turnos. Horarios desde 6 AM hasta 11:30 PM.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}