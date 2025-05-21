// src/app/config-restaurante/page.tsx
'use client';

import React from 'react';
import { useConfigStore } from './store/config-store';
import TarjetaConfig from './components/tarjeta-config';
import Encabezado from './encabezado';
import BarraLateral from './components/barra-lateral';
import { Button } from '@/shared/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ConfiguracionRestaurante() {
 const router = useRouter();
 const { tarjetas, puedeAvanzar, progreso } = useConfigStore();

 const handleContinuar = () => {
   if (puedeAvanzar) {
     router.push('/dashboard');
   }
 };

 // Agrupamos las tarjetas en pares para el diseño en grid
 const tarjetasPares = [];
 for (let i = 0; i < tarjetas.length; i += 2) {
   tarjetasPares.push(tarjetas.slice(i, i + 2));
 }

 return (
      <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BarraLateral />
        
        <div className="mb-8">
          <Encabezado />
        </div>

        {/* Grid de tarjetas - Mantenemos la estructura pero actualizamos colores */}
        <div className="space-y-6">
          {tarjetasPares.map((par, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {par.map((tarjeta) => (
                <TarjetaConfig
                  key={tarjeta.ruta}
                  tarjeta={tarjeta}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Botón de continuar - Actualizamos los colores */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinuar}
            disabled={!puedeAvanzar}
            variant={puedeAvanzar ? 'primary' : 'secondary'}
            size="lg"
            className={`w-full md:w-auto ${
              puedeAvanzar 
                ? 'bg-[#F4821F] hover:bg-[#D66A0B] text-white' 
                : 'bg-[#556B2F] hover:bg-[#3E4D1A] text-white'
            }`}
          >
            {puedeAvanzar 
              ? 'Continuar al Dashboard'
              : `Completa todas las secciones (${progreso}%)`
            }
          </Button>
        </div>

        {/* Mensajes informativos - Actualizamos los colores */}
        {!puedeAvanzar && progreso > 0 && (
          <div className="mt-4">
            <p className="text-sm text-[#F4821F] text-center">
              Completa todas las secciones para continuar al dashboard
            </p>
            {progreso >= 50 && (
              <p className="text-sm text-[#4B4B4B] text-center mt-1">
                ¡Ya casi! Solo te faltan algunas secciones
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}