import React from 'react';
import { DataTable } from "@/shared/components/ui/Table";
import { Star, Badge } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { MenuCombinacion } from '../../types/menu.types';
import { Loader2 } from 'lucide-react';

interface TablaCombinacionesProps {
  combinaciones: MenuCombinacion[];
  isLoading?: boolean;
  onToggleFavorito?: (id: string) => void;
  onToggleEspecial?: (id: string) => void;
  onUpdateCantidad?: (id: string, cantidad: number) => void;
}

export function TablaCombinaciones({ 
  combinaciones, 
  isLoading,
  onToggleFavorito,
  onToggleEspecial,
  onUpdateCantidad
}: TablaCombinacionesProps) {

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-spoon-primary" />
      </div>
    );
  }

  if (!combinaciones.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        No hay combinaciones disponibles
      </div>
    );
  }

  return (
    <>
      <div className="overflow-auto max-w-full">
        <table className="min-w-full border-collapse border border-gray-200 text-xs">
          <thead className="bg-gray-50 text-xs">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proteína</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acompañamientos</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bebida</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-xs">
            {combinaciones.map((combinacion, index) => (
              <tr key={combinacion.id} className={combinacion.especial ? 'bg-[var(--spoon-primary-light)]' : ''}>
                <td className="px-6 py-2 whitespace-nowrap text-center w-16">{index + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{combinacion.entrada?.nombre || 'No disponible'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{combinacion.principio?.nombre || 'No disponible'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{combinacion.proteina?.nombre || 'No disponible'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {combinacion.acompanamiento?.length > 0 
                    ? combinacion.acompanamiento.map(item => item?.nombre || 'No disponible').join(', ')
                    : 'No disponible'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{combinacion.bebida?.nombre || 'No disponible'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Input
                    type="number"
                    min={0}
                    value={combinacion.cantidad}
                    onChange={(e) => onUpdateCantidad?.(combinacion.id, Number(e.target.value))}
                    className="w-24"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Tooltip content={combinacion.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorito?.(combinacion.id)}
                        className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                          combinacion.favorito ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${combinacion.favorito ? 'fill-current' : ''}`} />
                      </Button>
                    </Tooltip>
                    <Tooltip content={combinacion.especial ? "Quitar especial" : "Marcar como especial"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleEspecial?.(combinacion.id)}
                        className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                          combinacion.especial ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                        }`}
                      >
                        <Badge className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}


























