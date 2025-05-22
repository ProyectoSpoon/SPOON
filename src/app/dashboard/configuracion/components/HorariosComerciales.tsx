'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Plus, Copy, Trash2, Save } from 'lucide-react';
import { HorariosSemanales } from '../../horario-comercial/types/horarios.types';

interface HorariosData {
  horarioRegular: HorariosSemanales;
  diasFestivos?: { fecha: string; nombre: string; tipo: string }[];
}

export default function HorariosComerciales() {
  const [isLoading, setIsLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorariosData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Cargar los horarios desde el archivo JSON
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/configuracion/horarios');
        
        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }
        
        const data = await response.json();
        setHorarios(data);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        toast.error('Error al cargar los horarios');
        
        // Crear horarios por defecto si no se pueden cargar
        setHorarios({
          horarioRegular: {
            lunes: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            martes: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            miercoles: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            jueves: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            viernes: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            sabado: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }],
            domingo: [{ horaApertura: "09:00", horaCierre: "18:00", estaActivo: true }]
          },
          diasFestivos: [
            { fecha: "2025-01-01", nombre: "Año Nuevo", tipo: "Año Nuevo" },
            { fecha: "2025-05-01", nombre: "Día del Trabajo", tipo: "Día del Trabajo" },
            { fecha: "2025-07-20", nombre: "Día de la Independencia", tipo: "Día de la Independencia" },
            { fecha: "2025-08-07", nombre: "Batalla de Boyacá", tipo: "Batalla de Boyacá" },
            { fecha: "2025-12-25", nombre: "Navidad", tipo: "Navidad" }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarHorarios();
  }, []);

  // Función para guardar los horarios
  const guardarHorarios = useCallback(async () => {
    if (!horarios) return;
    
    try {
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
      
      toast.success('Horarios guardados correctamente');
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast.error('Error al guardar los horarios');
    }
  }, [horarios]);

  // Función para agregar un turno a un día específico
  const agregarTurno = (dia: string) => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    nuevosHorarios.horarioRegular[dia].push({
      horaApertura: "09:00",
      horaCierre: "18:00",
      estaActivo: true
    });
    
    setHorarios(nuevosHorarios);
  };

  // Función para eliminar un turno
  const eliminarTurno = (dia: string, index: number) => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    nuevosHorarios.horarioRegular[dia].splice(index, 1);
    
    // Si no quedan turnos, agregar uno por defecto
    if (nuevosHorarios.horarioRegular[dia].length === 0) {
      nuevosHorarios.horarioRegular[dia].push({
        horaApertura: "09:00",
        horaCierre: "18:00",
        estaActivo: true
      });
    }
    
    setHorarios(nuevosHorarios);
  };

  // Función para duplicar un turno
  const duplicarTurno = (dia: string, index: number) => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    const turnoOriginal = nuevosHorarios.horarioRegular[dia][index];
    
    nuevosHorarios.horarioRegular[dia].splice(index + 1, 0, {
      horaApertura: turnoOriginal.horaApertura,
      horaCierre: turnoOriginal.horaCierre,
      estaActivo: turnoOriginal.estaActivo
    });
    
    setHorarios(nuevosHorarios);
  };

  // Función para agregar un evento festivo
  const agregarEvento = () => {
    if (!horarios) return;
    
    const nuevosHorarios = { ...horarios };
    if (!nuevosHorarios.diasFestivos) {
      nuevosHorarios.diasFestivos = [];
    }
    
    nuevosHorarios.diasFestivos.push({
      fecha: new Date().toISOString().split('T')[0],
      nombre: "Nuevo evento",
      tipo: "Personalizado"
    });
    
    setHorarios(nuevosHorarios);
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
  const esFestivo = (dia: number) => {
    if (!horarios || !horarios.diasFestivos) return false;
    
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return horarios.diasFestivos.some(festivo => festivo.fecha === fecha);
  };

  // Obtener el tipo de festivo para un día
  const obtenerTipoFestivo = (dia: number) => {
    if (!horarios || !horarios.diasFestivos) return null;
    
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const festivo = horarios.diasFestivos.find(f => f.fecha === fecha);
    return festivo ? festivo.tipo : null;
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
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
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
              <div className="flex items-center text-amber-600 mt-1">
                <span className="text-sm">
                  Usando horarios predeterminados
                </span>
                <span className="text-xs text-neutral-500 ml-4">
                  • No se encontraron datos guardados
                </span>
              </div>
            </div>
            <button
              onClick={guardarHorarios}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4821F] hover:bg-[#D66A0B] 
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
                  <th className="py-2 text-left w-1/4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {horarios && Object.entries(horarios.horarioRegular).map(([dia, rangos]) => (
                  <React.Fragment key={dia}>
                    {rangos.map((rango, index) => (
                      <tr key={`${dia}-${index}`} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={rango.estaActivo}
                              onChange={(e) => {
                                if (!horarios) return;
                                
                                const nuevosHorarios = { ...horarios };
                                nuevosHorarios.horarioRegular[dia][index].estaActivo = e.target.checked;
                                setHorarios(nuevosHorarios);
                              }}
                              className="mr-3"
                            />
                            <span className="capitalize">{dia}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <input
                            type="time"
                            value={rango.horaApertura || ''}
                            onChange={(e) => {
                              if (!horarios) return;
                              
                              const nuevosHorarios = { ...horarios };
                              nuevosHorarios.horarioRegular[dia][index].horaApertura = e.target.value;
                              setHorarios(nuevosHorarios);
                            }}
                            className="border rounded px-2 py-1 w-32"
                          />
                          <span className="text-xs text-gray-500 ml-1">a. m.</span>
                        </td>
                        <td className="py-3">
                          <input
                            type="time"
                            value={rango.horaCierre || ''}
                            onChange={(e) => {
                              if (!horarios) return;
                              
                              const nuevosHorarios = { ...horarios };
                              nuevosHorarios.horarioRegular[dia][index].horaCierre = e.target.value;
                              setHorarios(nuevosHorarios);
                            }}
                            className="border rounded px-2 py-1 w-32"
                          />
                          <span className="text-xs text-gray-500 ml-1">p. m.</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => duplicarTurno(dia, index)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Duplicar turno"
                            >
                              <Copy size={16} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => eliminarTurno(dia, index)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Eliminar turno"
                              disabled={rangos.length === 1}
                            >
                              <Trash2 size={16} className={rangos.length === 1 ? "text-gray-300" : "text-gray-500"} />
                            </button>
                            {index === rangos.length - 1 && (
                              <button
                                onClick={() => agregarTurno(dia)}
                                className="ml-2 text-[#F4821F] hover:text-[#D66A0B] text-sm flex items-center"
                              >
                                <Plus size={16} className="mr-1" />
                                Agregar turno
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
              <button onClick={mesAnterior} className="p-1">
                <ChevronLeft size={20} />
              </button>
              <h4 className="text-lg font-medium mx-2">
                {meses[currentMonth]} {currentYear}
              </h4>
              <button onClick={mesSiguiente} className="p-1">
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
                className={`text-center py-2 rounded-md ${
                  dia === null 
                    ? 'text-transparent' 
                    : esFestivo(dia) 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'hover:bg-gray-100'
                } cursor-pointer`}
              >
                {dia}
              </div>
            ))}
          </div>
          
          <button
            onClick={agregarEvento}
            className="w-full py-2 bg-[#F4821F] hover:bg-[#D66A0B] text-white rounded-lg mb-4"
          >
            Agregar evento
          </button>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Próximos eventos:</h4>
            <div className="space-y-2">
              {horarios && horarios.diasFestivos && horarios.diasFestivos.map((festivo, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{festivo.fecha.split('-')[2]} de {meses[parseInt(festivo.fecha.split('-')[1]) - 1]}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    {festivo.tipo}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-1 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-100 inline-block mr-2"></span>
                <span>Los días festivos aparecen en naranja</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-100 inline-block mr-2"></span>
                <span>Los eventos personalizados aparecen en azul</span>
              </div>
              <div className="flex items-center">
                <span>Haz clic en cualquier día para agregar un evento</span>
              </div>
              <div className="flex items-center">
                <span>Los eventos personalizados pueden ser eliminados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
