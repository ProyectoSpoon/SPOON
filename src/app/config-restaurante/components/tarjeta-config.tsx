// src/app/config-restaurante/components/tarjeta-config.tsx
import React from 'react';
import { Card } from '@/shared/components/ui/Card'
import { CheckCircle, MapPin, Clock, Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useConfigStore } from '../store/config-store';
import { TarjetaConfiguracion } from '@/types/group-config.types';

interface TarjetaConfigProps {
  tarjeta: TarjetaConfiguracion;
}

export default function TarjetaConfig({ tarjeta }: TarjetaConfigProps) {
  // Calculamos los campos completados
  const camposCompletados = tarjeta.camposRequeridos.filter(campo => campo.completado).length;
  const camposTotales = tarjeta.camposRequeridos.length;
  const porcentaje = Math.round((camposCompletados / camposTotales) * 100);

  // Configuración de iconos y colores por tipo
  const configuraciones = {
    'ubicacion': {
      icon: MapPin,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      accentColor: 'text-blue-600',
      completedColor: 'from-blue-500 to-blue-600'
    },
    'horario': {
      icon: Clock,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      accentColor: 'text-green-600',
      completedColor: 'from-green-500 to-green-600'
    },
    'logo-portada': {
      icon: Camera,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      accentColor: 'text-orange-600',
      completedColor: 'from-orange-500 to-orange-600'
    }
  };

  const config = configuraciones[tarjeta.id as keyof typeof configuraciones] || configuraciones.ubicacion;
  const IconComponent = config.icon;

  // Estados visuales
  const isCompleto = tarjeta.estado === 'completo';
  const isIniciado = tarjeta.estado !== 'no_iniciado';

  // Animación del progreso circular
  const circunferencia = 2 * Math.PI * 45; // radio 45
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <Link href={tarjeta.ruta} className="block group">
      <Card className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 ease-out
        hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1
        border-0 bg-white
        ${isCompleto ? 'ring-2 ring-green-200' : 'ring-1 ring-gray-200'}
      `}>
        {/* Header con gradiente e icono - MÁS COMPACTO */}
        <div className={`
          relative h-20 bg-gradient-to-br ${config.bgGradient}
          flex items-center justify-center
          group-hover:scale-105 transition-transform duration-300
        `}>
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-to)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
          </div>
          
          {/* Icono principal - MÁS PEQUEÑO */}
          <div className={`
            relative z-10 p-3 rounded-full bg-gradient-to-br ${config.gradient}
            shadow-lg group-hover:shadow-xl transition-all duration-300
            group-hover:scale-110
          `}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          {/* Indicador de completado */}
          {isCompleto && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Contenido principal - MÁS COMPACTO */}
        <div className="p-4 space-y-3">
          {/* Título y descripción */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
              {tarjeta.titulo}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {tarjeta.descripcion}
            </p>
          </div>

          {/* Progreso circular - MÁS PEQUEÑO */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              {/* Círculo de fondo */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                {/* Gradiente para el círculo */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`stop-color-blue-500 ${config.accentColor}`} />
                    <stop offset="100%" className={`stop-color-blue-600 ${config.accentColor}`} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Porcentaje en el centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-lg font-bold ${config.accentColor}`}>
                    {porcentaje}%
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {camposCompletados}/{camposTotales}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badge de estado - MÁS PEQUEÑO */}
          <div className="flex justify-center">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${isCompleto 
                ? 'bg-green-100 text-green-800' 
                : isIniciado 
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              }
            `}>
              {isCompleto ? '✅ Completo' : isIniciado ? '⏳ Progreso' : '⏸️ Pendiente'}
            </span>
          </div>

          {/* Call to action - MÁS COMPACTO */}
          <div className="pt-1">
            <div className={`
              flex items-center justify-center space-x-1 py-2 px-3 rounded-lg
              bg-gradient-to-r ${config.gradient}
              text-white font-medium text-xs
              group-hover:shadow-lg transition-all duration-300
              group-hover:bg-gradient-to-r group-hover:from-gray-700 group-hover:to-gray-800
            `}>
              <span>{isCompleto ? 'Ver' : 'Configurar'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
