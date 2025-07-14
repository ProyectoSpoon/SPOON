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
  const { tarjetas, puedeAvanzar } = useConfigStore();

  const handleContinuar = () => {
    if (puedeAvanzar) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BarraLateral />
        
        <div className="mb-8">
          <Encabezado />
        </div>

        {/* Grid de tarjetas - Una fila horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tarjetas.map((tarjeta) => (
            <TarjetaConfig
              key={tarjeta.ruta}
              tarjeta={tarjeta}
            />
          ))}
        </div>

        {/* Botón de continuar */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinuar}
            disabled={!puedeAvanzar}
            variant={puedeAvanzar ? 'default' : 'secondary'}
            size="lg"
            className={`w-full md:w-auto ${
              puedeAvanzar 
                ? 'bg-spoon-primary hover:bg-spoon-primary-dark text-white' 
                : 'bg-spoon-success hover:bg-spoon-success/90 text-white'
            }`}
          >
            {puedeAvanzar 
              ? 'Continuar al Dashboard'
              : 'Completar configuración'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}


























