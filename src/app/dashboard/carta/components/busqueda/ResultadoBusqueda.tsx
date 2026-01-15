'use client';

import React from 'react';
import Image from 'next/image';
import { PlusCircle, Star, Info, Tag, Clock } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

interface ResultadoBusquedaProps {
  producto: VersionedProduct;
  onAdd: (producto: VersionedProduct) => void;
  onView: (producto: VersionedProduct) => void;
  yaEnMenu?: boolean;
}

export const ResultadoBusqueda: React.FC<ResultadoBusquedaProps> = ({
  producto,
  onAdd,
  onView,
  yaEnMenu = false
}) => {
  // Obtener el precio actual del producto
  const precioActual = producto.versions && producto.versions.length > 0
    ? (producto.versions[producto.currentVersion - 1] as any)?.price || 0
    : 0;

  // Formatear precio como moneda
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Determinar el estado del stock
  const getEstadoStock = () => {
    if (!producto.stock) return { color: 'gray', texto: 'Sin información' };

    switch (producto.stock.status) {
      case 'in_stock':
        return { color: 'green', texto: 'Disponible' };
      case 'low_stock':
        return { color: 'orange', texto: 'Stock bajo' };
      case 'out_of_stock':
        return { color: 'red', texto: 'Agotado' };
      default:
        return { color: 'gray', texto: 'Sin información' };
    }
  };

  const estadoStock = getEstadoStock();

  return (
    <div className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        {/* Imagen del producto */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={64}
              height={64}
              className="object-cover"
              unoptimized={producto.imagen.startsWith('blob:')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Tag size={24} />
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900 truncate">{producto.nombre}</h3>
            {producto.esFavorito && (
              <Star className="ml-1 h-4 w-4 text-yellow-400" fill="#FBBF24" />
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-2">{producto.descripcion}</p>

          <div className="flex items-center mt-1 space-x-3 text-xs">
            {/* Precio */}
            <span className="font-medium text-gray-900">
              {formatearPrecio(precioActual)}
            </span>

            {/* Estado del stock */}
            <span className={`inline-flex items-center text-${estadoStock.color}-600`}>
              <span
                className={`w-2 h-2 rounded-full bg-${estadoStock.color}-500 mr-1`}
              ></span>
              {estadoStock.texto}
            </span>

            {/* Categoría */}
            <span className="text-gray-500 truncate">
              {producto.categoriaId}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
          <button
            onClick={() => onView(producto)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Ver detalles"
          >
            <Info size={18} />
          </button>

          <button
            onClick={() => onAdd(producto)}
            disabled={yaEnMenu}
            className={`p-1 rounded-full ${yaEnMenu
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-spoon-primary hover:bg-orange-50'
              }`}
            title={yaEnMenu ? 'Ya está en el menú' : 'Agregar al menú'}
          >
            <PlusCircle size={18} />
          </button>
        </div>
      </div>

      {/* Etiquetas adicionales */}
      {(producto.esEspecial || (producto.metadata && (producto.metadata as any).atributos)) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {producto.esEspecial && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Especial
            </span>
          )}

          {producto.metadata && (producto.metadata as any).atributos &&
            Array.isArray((producto.metadata as any).atributos) &&
            (producto.metadata as any).atributos.map((atributo: string) => (
              <span
                key={atributo}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {atributo}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default ResultadoBusqueda;


























