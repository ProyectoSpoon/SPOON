import React from 'react';
import { DataTable } from "@/shared/components/ui/Table";
import { Star, Badge } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { MenuCombinacion } from '../../types/menu.types';
import { Loader2 } from 'lucide-react';

interface TablaCombinacionesMenuProps {
  combinaciones: MenuCombinacion[];
  isLoading?: boolean;
  onToggleFavorito?: (id: string) => void;
  onToggleEspecial?: (id: string) => void;
  onUpdateCantidad?: (id: string, cantidad: number) => void;
  onRemove?: (id: string) => void;
}

export function TablaCombinacionesMenu({ 
  combinaciones, 
  isLoading,
  onToggleFavorito,
  onToggleEspecial,
  onUpdateCantidad,
  onRemove
}: TablaCombinacionesMenuProps) {

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F4821F]" />
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
      <div className="border rounded-lg">
        <DataTable.Root className="text-xs">
          <DataTable.Header className="text-xs">
            <DataTable.Row>
              <DataTable.HeaderCell className="w-16 text-center py-2">#</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Entrada</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Principio</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Proteína</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Acompañamientos</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Bebida</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Cantidad</DataTable.HeaderCell>
              <DataTable.HeaderCell className="py-2">Acciones</DataTable.HeaderCell>
            </DataTable.Row>
          </DataTable.Header>
          <DataTable.Body className="text-xs">
            {combinaciones.map((combinacion, index) => (
              <DataTable.Row 
                key={combinacion.id}
                className={combinacion.especial ? 'bg-[var(--spoon-primary-light)]' : ''}
              >
                <DataTable.Cell className="w-16 text-center py-2">{index + 1}</DataTable.Cell>
                <DataTable.Cell className="py-2">{combinacion.entrada.nombre}</DataTable.Cell>
                <DataTable.Cell className="py-2">{combinacion.principio.nombre}</DataTable.Cell>
                <DataTable.Cell className="py-2">{combinacion.proteina.nombre}</DataTable.Cell>
                <DataTable.Cell className="py-2">
                  {combinacion.acompanamiento.map(item => item.nombre).join(', ')}
                </DataTable.Cell>
                <DataTable.Cell className="py-2">{combinacion.bebida.nombre}</DataTable.Cell>
                <DataTable.Cell className="py-2">
                  <Input
                    type="number"
                    min={0}
                    value={combinacion.cantidad}
                    onChange={(e) => onUpdateCantidad?.(combinacion.id, Number(e.target.value))}
                    className="w-24"
                  />
                </DataTable.Cell>
                <DataTable.Cell className="py-2">
                  <div className="flex gap-2">
                    {onToggleFavorito && (
                      <Tooltip content={combinacion.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleFavorito(combinacion.id)}
                          className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                            combinacion.favorito ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                          }`}
                        >
                          <Star className={`h-5 w-5 ${combinacion.favorito ? 'fill-current' : ''}`} />
                        </Button>
                      </Tooltip>
                    )}
                    {onToggleEspecial && (
                      <Tooltip content={combinacion.especial ? "Quitar especial" : "Marcar como especial"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleEspecial(combinacion.id)}
                          className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                            combinacion.especial ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                          }`}
                        >
                          <Badge className="h-5 w-5" />
                        </Button>
                      </Tooltip>
                    )}
                    {onRemove && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(combinacion.id)}
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable.Body>
        </DataTable.Root>
      </div>

    </>
  );
}
