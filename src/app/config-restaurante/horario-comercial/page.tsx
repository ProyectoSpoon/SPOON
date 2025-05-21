'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '../store/config-store';
import HorarioSemanal from '@/app/dashboard/horario-comercial/components/HorarioSemanal';
import ConfigFooter from '../components/ConfigFooter/ConfigFooter';
import { HorariosSemanales } from '@/app/dashboard/horario-comercial/types/horarios.types';
import { useToast } from '@/shared/Hooks/use-toast';

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

export default function HorarioComercialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();
  const [estaGuardando, setEstaGuardando] = useState(false);
  const [horarios, setHorarios] = useState<HorariosSemanales>(horarioInicial);

  const validarHorarios = (horarios: HorariosSemanales): boolean => {
    for (const dia of Object.keys(horarios)) {
      const rangosDelDia = horarios[dia];
      
      for (const rango of rangosDelDia) {
        // Validar que ambos horarios estén establecidos
        if (!rango.horaApertura || !rango.horaCierre) {
          toast({
            title: "Error de validación",
            description: `Por favor, establece los horarios de apertura y cierre para ${dia}`,
            variant: "destructive"
          });
          return false;
        }

        // Validar que la hora de cierre sea posterior a la de apertura
        if (rango.horaApertura >= rango.horaCierre) {
          toast({
            title: "Error de validación",
            description: `El horario de cierre debe ser posterior al de apertura en ${dia}`,
            variant: "destructive"
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarHorarios(horarios)) return;

    try {
      setEstaGuardando(true);

      // Aquí iría la lógica para guardar en Firebase
      // await guardarHorarioInicial(horarios);

      // Actualizamos el estado en el store de configuración
      actualizarCampo('horario-comercial', 'horario-semanal', true);
      actualizarCampo('horario-comercial', 'excepciones', true);

      toast({
        title: "Horario guardado",
        description: "Los horarios se han guardado correctamente",
      });

      router.push('/config-restaurante');
      
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los horarios. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setEstaGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Horario Comercial
          </h1>
          <p className="text-neutral-600">
            Configura los horarios de atención de tu restaurante
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <HorarioSemanal
            horarios={horarios}
            onHorariosChange={setHorarios}
          />

          {/* Botón de guardar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleGuardar}
              disabled={estaGuardando}
              className="px-6 py-2 bg-[#F4821F] hover:bg-[#D66A0B] 
                       text-white rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {estaGuardando ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </div>
      </div>

      <ConfigFooter />
    </div>
  );
}