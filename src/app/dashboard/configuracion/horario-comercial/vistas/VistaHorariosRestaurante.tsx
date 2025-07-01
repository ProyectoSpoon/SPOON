'use client';

import React, { useEffect, useState } from 'react';
import HorarioSemanal from '../components/HorarioSemanal';
import CalendarioFestivos from '../components/CalendarioFestivos';
import { Save, Database, Clock } from 'lucide-react';
import { useToast } from '@/shared/Hooks/use-toast';
import { obtenerHorarios, actualizarHorarios } from '@/services/horarios';
import { HorariosSemanales } from '../types/horarios.types';

/**
 * Horario predeterminado para inicializar el componente
 * @constant
 * @type {HorariosSemanales}
 */
const horarioInicial: HorariosSemanales = {
  lunes: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  martes: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  miercoles: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  jueves: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  viernes: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  sabado: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }],
  domingo: [{
    horaApertura: "09:00",
    horaCierre: "18:00",
    estaActivo: true
  }]
};

/**
 * Tipo para el origen de los datos del horario
 * @typedef {'default' | 'storage'} OrigenDatos
 */
type OrigenDatos = 'default' | 'storage';

/**
 * Componente principal para la gestión de horarios del restaurante
 * @component
 * @returns {JSX.Element} Componente VistaHorariosRestaurante
 */
const VistaHorariosRestaurante: React.FC = () => {
  const { toast } = useToast();
  const [guardando, setGuardando] = useState(false);
  const [horarios, setHorarios] = useState<HorariosSemanales>(horarioInicial);
  const [cargando, setCargando] = useState(true);
  const [origenDatos, setOrigenDatos] = useState<OrigenDatos>('default');
  
  // TODO: Este ID debería venir de un contexto de autenticación
  const idRestauranteTemporal = "resto-123"; 

  /**
   * Efecto para cargar los horarios iniciales desde localStorage
   * Si no existen, se mantienen los horarios predeterminados
   */
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const horariosGuardados = await obtenerHorarios(idRestauranteTemporal);
        if (horariosGuardados?.horarioRegular) {
          setHorarios(horariosGuardados.horarioRegular as any);
          setOrigenDatos('storage');
          toast({
            title: "Datos cargados",
            description: "Se han cargado los horarios guardados en el almacenamiento local",
          });
        } else {
          setOrigenDatos('default');
          toast({
            title: "Horarios predeterminados",
            description: "No se encontraron horarios guardados. Se están usando horarios por defecto.",
            type: "warning"
          });
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setOrigenDatos('default');
        toast({
          title: "Error",
          description: "Error al cargar horarios. Se usarán horarios predeterminados.",
          type: "destructive"
        });
      } finally {
        setCargando(false);
      }
    };

    cargarHorarios();
  }, [toast]);

  /**
   * Maneja los cambios en los horarios
   * @param {HorariosSemanales} nuevosHorarios - Nuevos horarios a establecer
   */
  const handleHorariosChange = (nuevosHorarios: HorariosSemanales) => {
    setHorarios(nuevosHorarios);
  };

  /**
   * Guarda los cambios de horarios en localStorage
   * @returns {Promise<void>}
   */
  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarHorarios(idRestauranteTemporal, {
        horarioRegular: horarios as any
      });

      if (actualizado) {
        setOrigenDatos('storage');
        toast({
          title: "Éxito",
          description: "Los horarios se han guardado correctamente"
        });
      } else {
        throw new Error('No se pudo actualizar');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        type: "destructive"
      });
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Renderiza el indicador del estado de carga
   * @returns {JSX.Element} Componente de carga
   */
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4821F] mb-4"></div>
          <p className="text-neutral-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main p-6">
      <div className="flex gap-8">
        <div className="flex-grow">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Configura tus horarios</h2>
                <div className="flex items-center gap-2 mt-1">
                  {origenDatos === 'storage' ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Database size={16} />
                      <span>Datos cargados desde almacenamiento local</span>
                      <span className="text-xs text-neutral-500">
                        • Última actualización: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <Clock size={16} />
                      <span>Usando horarios predeterminados</span>
                      <span className="text-xs text-neutral-500">
                        • No se encontraron datos guardados
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex items-center gap-2 px-4 py-2 bg-[#F4821F] hover:bg-[#D66A0B] 
                         text-white rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <HorarioSemanal 
              horarios={horarios}
              onHorariosChange={handleHorariosChange}
            />
          </div>
        </div>

        <div className="w-[300px]">
          <div className="sticky top-6">
            <CalendarioFestivos />
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaHorariosRestaurante;
