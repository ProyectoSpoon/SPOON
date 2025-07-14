import React from 'react';
import { Star, Badge } from 'lucide-react';
import { ScrollReveal } from '@/shared/components/ui/Animated';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { MenuCombinacion } from '../../types/menu.types';
import { Loader2 } from 'lucide-react';

interface TarjetasCombinacionesProps {
  combinaciones: MenuCombinacion[];
  isLoading?: boolean;
  onToggleFavorito?: (id: string) => void;
  onToggleEspecial?: (id: string) => void;
  onUpdateCantidad?: (id: string, cantidad: number) => void;
}

export function TarjetasCombinaciones({ 
  combinaciones, 
  isLoading,
  onToggleFavorito,
  onToggleEspecial,
  onUpdateCantidad
}: TarjetasCombinacionesProps) {

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-spoon-primary" />
      </div>
    );
  }

  if (combinaciones.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        No hay combinaciones disponibles
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
        {combinaciones.map((combinacion, index) => (
          <ScrollReveal key={combinacion.id} delay={index * 0.2}>
            <div className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
              combinacion.especial ? 'border-[var(--spoon-primary)] bg-[var(--spoon-primary-light)]' : 'bg-white'
            }`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">Combinación #{index + 1}</h3>
                  <div className="flex gap-2">
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
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Entrada:</span> {combinacion.entrada?.nombre || 'No disponible'}</p>
                  <p><span className="font-medium">Principio:</span> {combinacion.principio?.nombre || 'No disponible'}</p>
                  <p><span className="font-medium">Proteína:</span> {combinacion.proteina?.nombre || 'No disponible'}</p>
                  <p><span className="font-medium">Acompañamientos:</span> {
                    combinacion.acompanamiento && combinacion.acompanamiento.length > 0
                      ? combinacion.acompanamiento.map(item => item?.nombre || 'No disponible').join(', ')
                      : 'No disponible'
                  }</p>
                  <p><span className="font-medium">Bebida:</span> {combinacion.bebida?.nombre || 'No disponible'}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Cantidad:</label>
                    <Input
                      type="number"
                      min={0}
                      value={combinacion.cantidad}
                      onChange={(e) => onUpdateCantidad?.(combinacion.id, Number(e.target.value))}
                      className="w-24"
                    />
                  </div>

                  {combinacion.programacion && combinacion.programacion.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Programado para:</p>
                      {combinacion.programacion.map((prog, idx) => (
                        <div key={idx} className="flex justify-between text-[var(--spoon-primary-dark)]">
                          <span>{prog.fecha.toLocaleDateString()}</span>
                          <span>{prog.cantidadProgramada} unid.</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  <div className="flex gap-2">
                    {combinacion.favorito && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--spoon-primary-light)] text-[var(--spoon-primary)]">
                        Favorito
                      </span>
                    )}
                    {combinacion.especial && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--spoon-primary)] text-white">
                        Especial
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

    </>
  );
}


























