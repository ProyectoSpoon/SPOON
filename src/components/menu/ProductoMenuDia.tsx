'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CantidadProducto } from './CantidadProducto';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  imagen?: string;
  cantidad?: number;
}

interface ProductoMenuDiaProps {
  producto: Producto;
  onRemove: (id: string) => void;
  onCantidadChange: (id: string, nuevaCantidad: number) => void;
}

export function ProductoMenuDia({ producto, onRemove, onCantidadChange }: ProductoMenuDiaProps) {
  // Obtener el emoji según la categoría
  const getEmojiCategoria = (categoriaId: string) => {
    switch (categoriaId) {
      case 'CAT_001': return '🍲'; // Entradas
      case 'CAT_002': return '🍚'; // Principio
      case 'CAT_003': return '🍖'; // Proteína
      case 'CAT_004': return '🥗'; // Acompañamientos
      case 'CAT_005': return '🥤'; // Bebida
      default: return '🍽️';
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 group">
      <div className="flex items-center">
        <span className="mr-2">{getEmojiCategoria(producto.categoriaId)}</span>
        <span className="text-gray-800">{producto.nombre}</span>
        
        {/* Componente de cantidad solo para proteínas */}
        <CantidadProducto 
          id={producto.id}
          cantidad={producto.cantidad || 0}
          categoriaId={producto.categoriaId}
          onCantidadChange={onCantidadChange}
        />
      </div>
      
      <button
        onClick={() => onRemove(producto.id)}
        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Eliminar producto"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}



























