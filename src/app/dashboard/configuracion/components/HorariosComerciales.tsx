'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Plus, Copy, Trash2, Save, Edit } from 'lucide-react';

interface HorarioDia {
  abierto: boolean;
  horaApertura: string;
  horaCierre: string;
}

interface HorariosData {
  horarioRegular: {
    lunes: HorarioDia;
    martes: HorarioDia;
    miercoles: HorarioDia;
    jueves: HorarioDia;
    viernes: HorarioDia;
    sabado: HorarioDia;
    domingo: HorarioDia;
  };
  diasFestivos?: { fecha: string; nombre: string; tipo: string }[];
}

export default function HorariosComerciales() {
  const [isLoading, setIsLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorariosData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Estados para el modal de eventos
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{fecha: string; nombre: string; tipo: string} | null>(null);

  // Cargar los horarios desde PostgreSQL
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        setIsLoading(true);
        console.log('🕐 Cargando horarios desde PostgreSQL...');
        
        const response = await fetch('/api/configuracion/horarios');
        
        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }
        
        const data = await response.json();
        setHorarios(data);
        console.log('✅ Horarios cargados desde PostgreSQL');
        
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        toast.error('Error al cargar los horarios');
        
        // Fallback a datos por defecto en caso de error
        setHorarios({
          horarioRegular: {
            lunes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
            martes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
            miercoles: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
            jueves: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
            viernes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
            sabado: { abierto: true, horaApertura: "10:00", horaCierre: "16:00" },
            domingo: { abierto: false, horaApertura: "10:00", horaCierre: "16:00" }
          },
          diasFestivos: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarHorarios();
  }, []);

  // Función para guardar los horarios en PostgreSQL
  const guardarHorarios = useCallback(async () => {
    if (!horarios) return;
    
    try {
      console.log('💾 Guardando horarios en PostgreSQL...');
      
      const response = await fetch('/api/configuracion/horarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horarios),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar los horarios');
      }
      
      const result = await response.json();
      console.log('✅ Horarios guardados:', result);
      toast.success('Horarios guardados correctamente en PostgreSQL');
      
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast.error('Error al guardar los horarios');
    }
  }, [horarios]);

  // Función para actualizar un horario específico
  const actualizarHorario = (dia: keyof HorariosData['horarioRegular'], campo: keyof HorarioDia, valor: string | boolean) => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    (nuevosHorarios.horarioRegular[dia] as any)[campo] = valor;
    setHorarios(nuevosHorarios);
  };

  // Función mejorada para agregar eventos
  const agregarEvento = () => {
    setEditingEvent({
      fecha: new Date().toISOString().split('T')[0],
      nombre: "",
      tipo: "Personalizado"
    });
    setShowEventModal(true);
  };

  // Función para guardar evento
  const guardarEvento = () => {
    if (!horarios || !editingEvent || !editingEvent.nombre.trim()) return;
    
    const nuevosHorarios = { ...horarios };
    if (!nuevosHorarios.diasFestivos) {
      nuevosHorarios.diasFestivos = [];
    }
    
    // Verificar si ya existe un evento en esa fecha
    const existingIndex = nuevosHorarios.diasFestivos.findIndex(
      festivo => festivo.fecha === editingEvent.fecha
    );
    
    if (existingIndex >= 0) {
      // Actualizar evento existente
      nuevosHorarios.diasFestivos[existingIndex] = editingEvent;
    } else {
      // Agregar nuevo evento
      nuevosHorarios.diasFestivos.push(editingEvent);
    }
    
    // Ordenar por fecha
    nuevosHorarios.diasFestivos.sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    setHorarios(nuevosHorarios);
    setShowEventModal(false);
    setEditingEvent(null);
    
    toast.success('Evento agregado. Recuerda guardar los cambios.');
  };

  // Función para eliminar evento
  const eliminarEvento = (fecha: string) => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    nuevosHorarios.diasFestivos = nuevosHorarios.diasFestivos?.filter(
      festivo => festivo.fecha !== fecha
    ) || [];
    
    setHorarios(nuevosHorarios);
    toast.success('Evento eliminado. Recuerda guardar los cambios.');
  };

  // Función para hacer clic en día del calendario
  const handleDayClick = (dia: number | null) => {
    if (!dia) return;
    
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Verificar si ya hay un evento en esta fecha
    const eventoExistente = horarios?.diasFestivos?.find(festivo => festivo.fecha === fecha);
    
    if (eventoExistente) {
      // Editar evento existente
      setEditingEvent(eventoExistente);
    } else {
      // Crear nuevo evento
      setEditingEvent({
        fecha,
        nombre: "",
        tipo: "Personalizado"
      });
    }
    
    setShowEventModal(true);
  };

  // Obtener los nombres de los meses
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Obtener los días de la semana
  const diasSemana = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

  // Obtener los días del mes actual
  const obtenerDiasDelMes = () => {
    const primerDia = new Date(currentYear, currentMonth, 1);
    const ultimoDia = new Date(currentYear, currentMonth + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, ..., 6 = sábado)
    let diaSemana = primerDia.getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, ..., 6 = domingo)
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
    
    const dias = [];
    
    // Agregar días vacíos al principio
    for (let i = 0; i < diaSemana; i++) {
      dias.push(null);
    }
    
    // Agregar los días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  // Verificar si un día es festivo
  const esFestivo = (dia: number | null) => {
    if (!horarios || !horarios.diasFestivos || !dia) return false;
    
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return horarios.diasFestivos.some(festivo => festivo.fecha === fecha);
  };

  // Cambiar al mes anterior
  const mesAnterior = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Cambiar al mes siguiente
  const mesSiguiente = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-spoon-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sección de horarios regulares */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">Configura tus horarios</h3>
              <div className="flex items-center text-green-600 mt-1">
                <span className="text-sm">
                  Conectado a PostgreSQL
                </span>
                <span className="text-xs text-neutral-500 ml-4">
                  • Los cambios se guardan en la base de datos
                </span>
              </div>
            </div>
            <button
              onClick={guardarHorarios}
              className="flex items-center gap-2 px-4 py-2 bg-spoon-primary hover:bg-spoon-primary-dark 
                       text-white rounded-lg transition-colors"
            >
              <Save size={18} />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left w-1/4">Día de la semana</th>
                  <th className="py-2 text-left w-1/4">Horario de apertura</th>
                  <th className="py-2 text-left w-1/4">Horario de cierre</th>
                  <th className="py-2 text-left w-1/4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {horarios && Object.entries(horarios.horarioRegular).map(([dia, horario]) => (
                  <tr key={dia} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={horario.abierto}
                          onChange={(e) => actualizarHorario(dia as keyof HorariosData['horarioRegular'], 'abierto', e.target.checked)}
                          className="mr-3"
                        />
                        <span className="capitalize">{dia}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <input
                        type="time"
                        value={horario.horaApertura}
                        onChange={(e) => actualizarHorario(dia as keyof HorariosData['horarioRegular'], 'horaApertura', e.target.value)}
                        className="border rounded px-2 py-1 w-32"
                        disabled={!horario.abierto}
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="time"
                        value={horario.horaCierre}
                        onChange={(e) => actualizarHorario(dia as keyof HorariosData['horarioRegular'], 'horaCierre', e.target.value)}
                        className="border rounded px-2 py-1 w-32"
                        disabled={!horario.abierto}
                      />
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        horario.abierto 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {horario.abierto ? 'Abierto' : 'Cerrado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de días festivos */}
        <div className="w-full lg:w-[400px] bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Días Festivos</h3>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button onClick={mesAnterior} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft size={20} />
              </button>
              <h4 className="text-lg font-medium mx-2">
                {meses[currentMonth]} {currentYear}
              </h4>
              <button onClick={mesSiguiente} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center py-2 text-sm font-medium">
                {dia}
              </div>
            ))}
            
            {obtenerDiasDelMes().map((dia, index) => (
              <div 
                key={index} 
                onClick={() => handleDayClick(dia)}
                className={`text-center py-2 rounded-md cursor-pointer transition-colors ${
                  dia === null 
                    ? 'text-transparent pointer-events-none' 
                    : esFestivo(dia) 
                      ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                      : 'hover:bg-gray-100'
                }`}
              >
                {dia}
              </div>
            ))}
          </div>
          
          <button
            onClick={agregarEvento}
            className="w-full py-2 bg-spoon-primary hover:bg-spoon-primary-dark text-white rounded-lg mb-4 transition-colors"
          >
            <Plus className="inline-block mr-2" size={16} />
            Agregar evento
          </button>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Próximos eventos:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {horarios && horarios.diasFestivos && horarios.diasFestivos.length > 0 ? (
                horarios.diasFestivos.map((festivo, index) => (
                  <div key={index} className="flex justify-between items-center group">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{festivo.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {festivo.fecha.split('-')[2]} de {meses[parseInt(festivo.fecha.split('-')[1]) - 1]}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {festivo.tipo}
                      </span>
                      <button
                        onClick={() => {
                          setEditingEvent(festivo);
                          setShowEventModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay eventos programados</p>
              )}
            </div>
            
            <div className="mt-6 space-y-1 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-100 inline-block mr-2 rounded"></span>
                <span>Días festivos (haz clic para editar)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-100 inline-block mr-2 rounded"></span>
                <span>Días normales (haz clic para agregar evento)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar eventos */}
      {showEventModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {horarios?.diasFestivos?.some(f => f.fecha === editingEvent.fecha) ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={editingEvent.fecha}
                  onChange={(e) => setEditingEvent({...editingEvent, fecha: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del evento</label>
                <input
                  type="text"
                  value={editingEvent.nombre}
                  onChange={(e) => setEditingEvent({...editingEvent, nombre: e.target.value})}
                  placeholder="Ej: Día de la madre"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={editingEvent.tipo}
                  onChange={(e) => setEditingEvent({...editingEvent, tipo: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Personalizado">Personalizado</option>
                  <option value="Día Nacional">Día Nacional</option>
                  <option value="Día Regional">Día Regional</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Evento Especial">Evento Especial</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={guardarEvento}
                disabled={!editingEvent.nombre.trim()}
                className="flex-1 bg-spoon-primary hover:bg-spoon-primary-dark disabled:bg-gray-300 
                         text-white py-2 rounded transition-colors"
              >
                Guardar
              </button>
              
              {horarios?.diasFestivos?.some(f => f.fecha === editingEvent.fecha) && (
                <button
                  onClick={() => {
                    eliminarEvento(editingEvent.fecha);
                    setShowEventModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



























