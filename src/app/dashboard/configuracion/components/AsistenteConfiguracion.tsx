'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

type PasoAsistente = {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: string;
  completado: boolean;
};

export default function AsistenteConfiguracion() {
  const [pasos, setPasos] = useState<PasoAsistente[]>([
    {
      id: 'info',
      titulo: 'Información básica',
      descripcion: 'Configura los datos principales de tu restaurante',
      ruta: '/dashboard/restaurante/info',
      completado: false
    },
    {
      id: 'horarios',
      titulo: 'Horarios de atención',
      descripcion: 'Establece cuándo está abierto tu negocio',
      ruta: '/dashboard/horario-comercial',
      completado: false
    },
    {
      id: 'menu',
      titulo: 'Configuración de menú',
      descripcion: 'Establece categorías y opciones principales',
      ruta: '/dashboard/carta',
      completado: false
    },
    {
      id: 'pagos',
      titulo: 'Métodos de pago',
      descripcion: 'Configura las formas de pago que aceptas',
      ruta: '/dashboard/configuracion/pagos',
      completado: false
    },
  ]);

  const [asistenteVisible, setAsistenteVisible] = useState(true);

  const togglePasoCompletado = (id: string) => {
    setPasos(pasos.map(paso => 
      paso.id === id ? {...paso, completado: !paso.completado} : paso
    ));
  };

  if (!asistenteVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-[#FFF4E6] to-white p-6 border-none shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2 bg-[#F4821F] rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Asistente de Configuración</h3>
            <p className="text-sm text-neutral-600">
              Completa estos pasos para configurar lo esencial de tu restaurante
            </p>
          </div>
        </div>
        <button 
          onClick={() => setAsistenteVisible(false)}
          className="text-neutral-400 hover:text-neutral-600 text-sm"
        >
          Descartar
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {pasos.map((paso, index) => (
          <div 
            key={paso.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              paso.completado ? 'bg-green-50' : 'bg-white'
            }`}
          >
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${
                paso.completado ? 'bg-green-500' : 'bg-[#F4821F]'
              }`}
            >
              {paso.completado ? <Check size={16} /> : index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{paso.titulo}</h4>
              <p className="text-sm text-neutral-500">{paso.descripcion}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={paso.completado} 
                  onChange={() => togglePasoCompletado(paso.id)}
                  className="mr-2"
                />
                <span className="text-sm">Completado</span>
              </label>
              <Link 
                href={paso.ruta}
                className="flex items-center px-3 py-1.5 bg-[#F4821F] text-white text-sm rounded hover:bg-[#E77918]"
              >
                <span>Ir</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm">
          {pasos.filter(p => p.completado).length} de {pasos.length} completados
        </div>
        <div className="w-1/2 bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-[#F4821F] h-2 rounded-full" 
            style={{ width: `${(pasos.filter(p => p.completado).length / pasos.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
}
