'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authcontext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { TablaCombinacionesMenu } from '../components/tabla-combinaciones-menu/TablaCombinacionesMenu';
import { useCombinacionesMenu } from '../hooks/useCombinacionesMenu';

export default function EspecialesPage() {
  const { user } = useAuth();
  const restauranteId = 'default'; // Usar valor por defecto hasta que se implemente la gestión de restaurantes
  
  // Usar el hook de combinaciones para especiales
  const {
    combinaciones,
    loading,
    error,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad,
    agregarProgramacion,
    removeCombinacion
  } = useCombinacionesMenu({
    tipo: 'especiales',
    restauranteId
  });

  // Manejador para marcar/desmarcar como favorito
  const handleToggleFavorito = (id: string) => {
    toggleFavorito(id);
    toast.success('Estado de favorito actualizado');
  };

  // Manejador para quitar de especiales
  const handleRemoveFromEspeciales = (id: string) => {
    removeCombinacion(id);
  };

  // Manejador para actualizar cantidad
  const handleUpdateCantidad = (id: string, cantidad: number) => {
    actualizarCantidad(id, cantidad);
    toast.success('Cantidad actualizada');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platos Especiales</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <TablaCombinacionesMenu 
          combinaciones={combinaciones}
          onToggleFavorito={handleToggleFavorito}
          onToggleEspecial={handleRemoveFromEspeciales}
          onUpdateCantidad={handleUpdateCantidad}
          onRemove={handleRemoveFromEspeciales}
        />
      </div>
    </div>
  );
}
