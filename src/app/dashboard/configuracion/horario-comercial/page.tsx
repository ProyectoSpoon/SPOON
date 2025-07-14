'use client';

import React, { useState, useEffect } from 'react';

// Tipos TypeScript simplificados
type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
type EstadoDia = 'abierto' | 'cerrado' | 'especial';

interface RangoHorario {
  horaApertura: string;
  horaCierre: string;
  estaActivo: boolean;
}

interface HorariosDia {
  dia: DiaSemana;
  estado: EstadoDia;
  turnos: RangoHorario[];
}

interface KPI {
  titulo: string;
  valor: string;
  subtitulo: string;
}

const HorarioComercialPage = () => {
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  const [guardando, setGuardando] = useState(false);

  // KPIs de horarios
  const kpisHorarios: KPI[] = [
    {
      titulo: "Días Abiertos",
      valor: "6/7",
      subtitulo: "días de la semana"
    },
    {
      titulo: "Horas Semanales",
      valor: "72h",
      subtitulo: "tiempo total"
    },
    {
      titulo: "Apertura Promedio",
      valor: "8:30 AM",
      subtitulo: "hora estándar"
    },
    {
      titulo: "Cierre Promedio",
      valor: "10:00 PM",
      subtitulo: "hora estándar"
    },
    {
      titulo: "Turnos Dobles",
      valor: "2",
      subtitulo: "días con 2 turnos"
    },
    {
      titulo: "Día Más Largo",
      valor: "Viernes",
      subtitulo: "14 horas"
    },
    {
      titulo: "Días Festivos",
      valor: "8",
      subtitulo: "configurados"
    },
    {
      titulo: "Estado",
      valor: "Activo",
      subtitulo: "horario vigente"
    }
  ];

  // Horarios iniciales (simulados)
  const [horarios, setHorarios] = useState<HorariosDia[]>([
    {
      dia: 'lunes',
      estado: 'abierto',
      turnos: [
        { horaApertura: '08:00', horaCierre: '14:00', estaActivo: true },
        { horaApertura: '18:00', horaCierre: '22:00', estaActivo: true }
      ]
    },
    {
      dia: 'martes',
      estado: 'abierto',
      turnos: [
        { horaApertura: '08:00', horaCierre: '22:00', estaActivo: true }
      ]
    },
    {
      dia: 'miercoles',
      estado: 'abierto',
      turnos: [
        { horaApertura: '08:00', horaCierre: '22:00', estaActivo: true }
      ]
    },
    {
      dia: 'jueves',
      estado: 'abierto',
      turnos: [
        { horaApertura: '08:00', horaCierre: '22:00', estaActivo: true }
      ]
    },
    {
      dia: 'viernes',
      estado: 'abierto',
      turnos: [
        { horaApertura: '08:00', horaCierre: '23:00', estaActivo: true }
      ]
    },
    {
      dia: 'sabado',
      estado: 'abierto',
      turnos: [
        { horaApertura: '09:00', horaCierre: '23:00', estaActivo: true }
      ]
    },
    {
      dia: 'domingo',
      estado: 'cerrado',
      turnos: []
    }
  ]);

  const diasSemana: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const getNombreDia = (dia: DiaSemana): string => {
    const nombres = {
      lunes: 'Lunes',
      martes: 'Martes', 
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    return nombres[dia];
  };

  const getEstadoColor = (estado: EstadoDia): string => {
    const colors = {
      abierto: '#22c55e',
      cerrado: '#ef4444',
      especial: '#f59e0b'
    };
    return colors[estado];
  };

  const getEstadoTexto = (estado: EstadoDia): string => {
    const textos = {
      abierto: 'Abierto',
      cerrado: 'Cerrado',
      especial: 'Especial'
    };
    return textos[estado];
  };

  const formatearHora = (hora: string): string => {
    const [horas, minutos] = hora.split(':');
    const h = parseInt(horas);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hora12}:${minutos} ${ampm}`;
  };

  const horarioSeleccionado = horarios.find(h => h.dia === diaSeleccionado);

  const cambiarEstadoDia = (dia: DiaSemana, nuevoEstado: EstadoDia) => {
    setHorarios(horariosActuales => 
      horariosActuales.map(h => 
        h.dia === dia 
          ? { 
              ...h, 
              estado: nuevoEstado,
              turnos: nuevoEstado === 'cerrado' ? [] : 
                     h.turnos.length === 0 ? [{ horaApertura: '08:00', horaCierre: '18:00', estaActivo: true }] : h.turnos
            }
          : h
      )
    );
  };

  const actualizarTurno = (dia: DiaSemana, indice: number, campo: keyof RangoHorario, valor: string | boolean) => {
    setHorarios(horariosActuales =>
      horariosActuales.map(h =>
        h.dia === dia
          ? {
              ...h,
              turnos: h.turnos.map((turno, i) =>
                i === indice ? { ...turno, [campo]: valor } : turno
              )
            }
          : h
      )
    );
  };

  const agregarTurno = (dia: DiaSemana) => {
    const horarioDia = horarios.find(h => h.dia === dia);
    if (horarioDia && horarioDia.turnos.length < 3) {
      setHorarios(horariosActuales =>
        horariosActuales.map(h =>
          h.dia === dia
            ? {
                ...h,
                turnos: [...h.turnos, { horaApertura: '08:00', horaCierre: '18:00', estaActivo: true }]
              }
            : h
        )
      );
    }
  };

  const eliminarTurno = (dia: DiaSemana, indice: number) => {
    const horarioDia = horarios.find(h => h.dia === dia);
    if (horarioDia && horarioDia.turnos.length > 1) {
      setHorarios(horariosActuales =>
        horariosActuales.map(h =>
          h.dia === dia
            ? {
                ...h,
                turnos: h.turnos.filter((_, i) => i !== indice)
              }
            : h
        )
      );
    }
  };

  const copiarHorario = (diaOrigen: DiaSemana, diaDestino: DiaSemana) => {
    const horarioOrigen = horarios.find(h => h.dia === diaOrigen);
    if (horarioOrigen) {
      setHorarios(horariosActuales =>
        horariosActuales.map(h =>
          h.dia === diaDestino
            ? {
                ...h,
                estado: horarioOrigen.estado,
                turnos: [...horarioOrigen.turnos]
              }
            : h
        )
      );
    }
  };

  const guardarHorarios = async () => {
    setGuardando(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Horarios guardados:', horarios);
      alert('Horarios guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar horarios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpisHorarios.map((kpi, index) => (
          <div key={index} className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">
              {kpi.titulo}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {kpi.valor}
            </div>
            {kpi.subtitulo && (
              <div className="text-xs text-gray-400">
                {kpi.subtitulo}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filtros de días de la semana */}
      <div className="flex gap-2 mb-4">
        {diasSemana.map((dia) => (
          <button
            key={dia}
            onClick={() => setDiaSeleccionado(dia)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              diaSeleccionado === dia
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {getNombreDia(dia)}
          </button>
        ))}
        
        <div className="ml-auto">
          <button
            onClick={guardarHorarios}
            disabled={guardando}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              guardando
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
            }`}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Línea divisoria principal */}
      <div className="mb-4">
        <hr className="border-gray-200" />
      </div>

      <div className="grid grid-cols-12 gap-3">

        {/* Vista Semanal Compacta */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Horarios de la semana</h3>
            
            <div className="space-y-3">
              {horarios.map((horario) => (
                <div key={horario.dia} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-20 font-medium text-gray-900">
                    {getNombreDia(horario.dia)}
                  </div>
                  
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEstadoColor(horario.estado) }}
                  ></div>
                  
                  <div className="flex-1 text-sm text-gray-600">
                    {horario.estado === 'cerrado' ? (
                      <span className="text-red-600">Cerrado</span>
                    ) : (
                      horario.turnos.map((turno, i) => (
                        <span key={i} className="mr-4">
                          {formatearHora(turno.horaApertura)} - {formatearHora(turno.horaCierre)}
                        </span>
                      ))
                    )}
                  </div>
                  
                  <button
                    onClick={() => setDiaSeleccionado(horario.dia)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor del Día Seleccionado */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">
              Configurar {getNombreDia(diaSeleccionado)}
            </h3>
            
            {horarioSeleccionado && (
              <div className="space-y-4">
                {/* Estado del día */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado del día:</label>
                  <div className="flex gap-2">
                    {(['abierto', 'cerrado'] as EstadoDia[]).map((estado) => (
                      <button
                        key={estado}
                        onClick={() => cambiarEstadoDia(diaSeleccionado, estado)}
                        className={`px-3 py-1 text-sm rounded border transition-colors ${
                          horarioSeleccionado.estado === estado
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {getEstadoTexto(estado)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turnos */}
                {horarioSeleccionado.estado !== 'cerrado' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Horarios:</label>
                    
                    {horarioSeleccionado.turnos.map((turno, indice) => (
                      <div key={indice} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="text-xs text-gray-500">Turno {indice + 1}</div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Apertura:</label>
                            <input
                              type="time"
                              value={turno.horaApertura}
                              onChange={(e) => actualizarTurno(diaSeleccionado, indice, 'horaApertura', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-200 rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Cierre:</label>
                            <input
                              type="time"
                              value={turno.horaCierre}
                              onChange={(e) => actualizarTurno(diaSeleccionado, indice, 'horaCierre', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-200 rounded"
                            />
                          </div>
                        </div>
                        
                        {horarioSeleccionado.turnos.length > 1 && (
                          <button
                            onClick={() => eliminarTurno(diaSeleccionado, indice)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Eliminar turno
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {horarioSeleccionado.turnos.length < 3 && (
                      <button
                        onClick={() => agregarTurno(diaSeleccionado)}
                        className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        + Agregar turno
                      </button>
                    )}
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Acciones rápidas:</label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => e.target.value && copiarHorario(e.target.value as DiaSemana, diaSeleccionado)}
                      className="w-full p-2 text-sm border border-gray-200 rounded"
                      defaultValue=""
                    >
                      <option value="">Copiar desde otro día...</option>
                      {diasSemana
                        .filter(dia => dia !== diaSeleccionado)
                        .map(dia => (
                          <option key={dia} value={dia}>
                            {getNombreDia(dia)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Resumen y Estadísticas */}
        <div className="col-span-12">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Resumen de horarios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estadísticas generales */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Días abiertos:</span>
                    <span className="font-medium">{horarios.filter(h => h.estado === 'abierto').length}/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total turnos:</span>
                    <span className="font-medium">{horarios.reduce((acc, h) => acc + h.turnos.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Turnos dobles:</span>
                    <span className="font-medium">{horarios.filter(h => h.turnos.length > 1).length}</span>
                  </div>
                </div>
              </div>

              {/* Horarios más comunes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Horarios comunes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apertura temprana:</span>
                    <span className="font-medium">8:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cierre estándar:</span>
                    <span className="font-medium">10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Día más largo:</span>
                    <span className="font-medium">Viernes (15h)</span>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sugerencias</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Considera abrir domingos para aumentar ventas</div>
                  <div>• Evalúa extender horario los viernes</div>
                  <div>• Turnos dobles funcionan bien para almuerzo/cena</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Resumen Final */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🕐</span>
          <div>
            <h3 className="font-bold text-blue-800">Estado del Horario Comercial</h3>
            <p className="text-sm text-blue-700">
              <strong>Configuración actual</strong>: 6 días abiertos, 72 horas semanales. 
              <strong>Próximos cambios</strong>: Recuerda guardar cualquier modificación. 
              <strong>Recomendación</strong>: Revisa horarios cada mes según demanda.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HorarioComercialPage;