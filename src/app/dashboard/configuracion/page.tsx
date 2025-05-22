'use client';

import { Settings, Clock } from 'lucide-react';
// Importación dinámica para evitar problemas de TypeScript
import dynamic from 'next/dynamic';
const HorariosComerciales = dynamic(() => import('./components/HorariosComerciales'), {
  loading: () => <p>Cargando...</p>,
  ssr: false
});

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-[#F4821F]" />
        <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
          Configuración del Sistema
        </h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 bg-[#F4821F] text-white px-4 py-2 rounded-t-lg w-fit">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Horarios Comerciales</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <HorariosComerciales />
      </div>
    </div>
  );
}
