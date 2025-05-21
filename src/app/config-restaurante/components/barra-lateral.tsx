// src/app/config-restaurante/components/barra-lateral.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { Save, LogOut } from 'lucide-react'; // Iconos
import { useConfigStore } from '../store/config-store';

export default function BarraLateral() {
  const router = useRouter();
  const { progreso } = useConfigStore();

  const handleSave = () => {
    // Aquí iría la lógica para guardar
    console.log('Guardando configuración...');
  };

  const handleExit = () => {
    // Aquí podríamos agregar una confirmación antes de salir
    router.push('/dashboard'); // O la ruta que corresponda
  };

  return (
    <div className="fixed right-4 top-1/3 transform -translate-y-1/2 z-50">
      <div className="flex flex-col gap-3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-2 w-full"
        >
          <Save size={18} />
          <span className="hidden group-hover:inline">Guardar</span>
        </Button>

        <div className="w-full h-px bg-gray-200" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExit}
          className="flex items-center gap-2 w-full text-gray-600 hover:text-gray-800"
        >
          <LogOut size={18} />
          <span className="hidden group-hover:inline">Salir</span>
        </Button>

        {/* Indicador de progreso */}
        <div className="text-xs text-center text-gray-500 mt-2">
          {progreso}%
        </div>
      </div>
    </div>
  );
}