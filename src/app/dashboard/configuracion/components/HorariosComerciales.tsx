'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Plus, Copy, Trash2, Save } from 'lucide-react';

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

  // Cargar los horarios desde el archivo JSON
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        setIsLoading(true);
        console.log('Cargando horarios (simulación)...');
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Crear horarios por defecto
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
          diasFestivos: [
            { fecha: "2025-01-01", nombre: "Año Nuevo", tipo: "Año Nuevo" },
            { fecha: "2025-05-01", nombre: "Día del Trabajo", tipo: "Día del Trabajo" },
            { fecha: "2025-07-20", nombre: "Día de la Independencia", tipo: "Día de la Independencia" },
            { fecha: "2025-08-07", nombre: "Batalla de Boyacá", tipo: "Batalla de Boyacá" },
            { fecha: "2025-12-25", nombre: "Navidad", tipo: "Navidad" }
          ]
        });
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        toast.error('Error al cargar los horarios');
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
      console.log('Guardando horarios (simulación):', horarios);
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast.success('Horarios guardados correctamente');
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
                  • Datos simulados para desarrollo
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
