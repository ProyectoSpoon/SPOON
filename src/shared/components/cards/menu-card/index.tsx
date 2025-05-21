'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/shared/components/ui/Card';
import { Switch } from '@/shared/components/ui/Switch';
import { cn } from '@/shared/lib/utils';

interface MenuCardProps {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  componentes: {
    entradas: Array<{ id: string; nombre: string; descripcion: string; }> | null;
    principios: Array<{ id: string; nombre: string; descripcion: string; }> | null;
    proteinas: Array<{ id: string; nombre: string; descripcion: string; }> | null;
    acompañamientos: Array<{ id: string; nombre: string; descripcion: string; categoria: string; disponible: boolean; porcion: string; }> | null;
    bebidas: Array<{ id: string; nombre: string; descripcion: string; }> | null;
  };
  estado: 'activo' | 'inactivo';
  onToggleEstado: (id: string, estado: boolean) => void;
}

const MenuCard = ({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  categoria,
  componentes,
  estado,
  onToggleEstado
}: MenuCardProps) => {
  return (
    <Card variant="menu" className="h-full flex flex-col">
      {/* Imagen con overlay */}
      <div className="relative h-48">
      <Image
        src={imagen || '/images/placeholder.jpg'} // Actualizada la ruta
        alt={nombre}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
      </div>

      {/* Contenido */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{nombre}</h3>
            <p className="text-sm text-gray-500">{categoria}</p>
          </div>
          <span className="text-lg font-bold text-primary">
            ${precio.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">{descripcion}</p>

        {/* Componentes */}
        <div className="grid grid-cols-2 gap-4">
          {componentes.entradas?.length ? (
            <div>
              <h4 className="font-medium text-sm text-gray-900">Entrada</h4>
              <p className="text-sm text-gray-600">
                {componentes.entradas.map(e => e.nombre).join(', ')}
              </p>
            </div>
          ) : null}

          {componentes.proteinas?.length ? (
            <div>
              <h4 className="font-medium text-sm text-gray-900">Proteína</h4>
              <p className="text-sm text-gray-600">
                {componentes.proteinas.map(p => p.nombre).join(', ')}
              </p>
            </div>
          ) : null}

          {componentes.acompañamientos?.length ? (
            <div>
              <h4 className="font-medium text-sm text-gray-900">Acompañamientos</h4>
              <p className="text-sm text-gray-600">
                {componentes.acompañamientos.map(a => a.nombre).join(', ')}
              </p>
            </div>
          ) : null}

          {componentes.bebidas?.length ? (
            <div>
              <h4 className="font-medium text-sm text-gray-900">Bebida</h4>
              <p className="text-sm text-gray-600">
                {componentes.bebidas.map(b => b.nombre).join(', ')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

          {/* Footer con estado */}
          <div className="px-6 py-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-medium",
              estado === 'activo' ? 'text-green-600' : 'text-red-600'
            )}>
              {estado === 'activo' ? 'Disponible' : 'No disponible'}
            </span>
            <Switch
              checked={estado === 'activo'}
              onCheckedChange={() => onToggleEstado(id, estado)}
            />
          </div>
          </div>
    </Card>
  );
};

export default MenuCard;