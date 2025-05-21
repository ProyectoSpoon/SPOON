// src/app/config-restaurante/components/tarjeta-config.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useConfigStore } from '../store/config-store';
import { TarjetaConfiguracion, EstadoTarjeta } from '../types/types';

interface TarjetaConfigProps {
  tarjeta: TarjetaConfiguracion;
}

export default function TarjetaConfig({ tarjeta }: TarjetaConfigProps) {
  // Calculamos los campos completados
  const camposCompletados = tarjeta.camposRequeridos.filter(campo => campo.completado).length;
  const camposTotales = tarjeta.camposRequeridos.length;

  // Mapeamos los estados del store a los estados visuales
  const mapearEstado = (estado: EstadoTarjeta): 'pendiente' | 'incompleto' | 'completo' => {
    switch (estado) {
      case 'no_iniciado':
        return 'pendiente';
      case 'incompleto':
        return 'incompleto';
      case 'completo':
        return 'completo';
      default:
        return 'pendiente';
    }
  };

  const estadoVisual = mapearEstado(tarjeta.estado);

  const estadoStyles = {
    pendiente: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <Clock className="w-5 h-5 text-gray-400" />,
      text: 'Pendiente'
    },
    incompleto: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      text: 'Incompleto'
    },
    completo: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: 'Completo'
    }
  };

  const currentStyle = estadoStyles[estadoVisual];

  // Lista de campos pendientes
  const camposPendientes = tarjeta.camposRequeridos.filter(campo => !campo.completado);

  return (
    <Link href={tarjeta.ruta}>
      <Card className={`
        p-6 cursor-pointer transition-all hover:shadow-md
        ${currentStyle.bgColor} border-2 ${currentStyle.borderColor}
      `}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{tarjeta.titulo}</h3>
            <p className="text-sm text-gray-600">{tarjeta.descripcion}</p>
          </div>
          {currentStyle.icon}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Campos completados</span>
            <span className="font-medium">
              {camposCompletados}/{camposTotales}
            </span>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF9933] transition-all"
              style={{ width: `${(camposCompletados/camposTotales) * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className={`
              text-sm font-medium px-2 py-1 rounded-full w-fit
              ${estadoVisual === 'completo' ? 'text-green-700 bg-green-100' :
                estadoVisual === 'incompleto' ? 'text-amber-700 bg-amber-100' :
                'text-gray-700 bg-gray-100'}
            `}>
              {currentStyle.text}
            </span>

            {/* Mostrar campos pendientes si está incompleto */}
            {estadoVisual === 'incompleto' && camposPendientes.length > 0 && (
              <div className="text-sm text-amber-700 mt-2">
                <p className="font-medium">Campos pendientes:</p>
                <ul className="list-disc list-inside mt-1">
                  {camposPendientes.map(campo => (
                    <li key={campo.id} className="ml-2">
                      {campo.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}