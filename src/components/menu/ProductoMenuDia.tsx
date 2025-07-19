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
  // Obtener el emoji según la categoría usando los UUIDs reales de la BD
  const getEmojiCategoria = (categoriaId: string) => {
    switch (categoriaId) {
      case 'b4e792ba-b00d-4348-b9e3-f34992315c23': return '🍲'; // Entradas
      case '2d4c3ea8-843e-4312-821e-54d1c4e79dce': return '🍚'; // Principios
      case '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3': return '🍖'; // Proteínas
      case 'a272bc20-464c-443f-9283-4b5e7bfb71cf': return '🥗'; // Acompañamientos
      case '6feba136-57dc-4448-8357-6f5533177cfd': return '🥤'; // Bebidas
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
