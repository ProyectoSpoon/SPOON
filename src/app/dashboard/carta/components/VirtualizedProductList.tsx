import React, { useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

interface VirtualizedProductListProps {
  products: VersionedProduct[];
  onProductClick: (product: VersionedProduct) => void;
}

export default function VirtualizedProductList({ products, onProductClick }: VirtualizedProductListProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []), // altura estimada por fila
    overscan: 5 // número de elementos extra a renderizar
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        contain: 'strict'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const product = products[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
              className="p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={product.imagen || '/images/placeholder.jpg'}
                    alt={product.nombre}
                    fill
                    className="object-cover rounded"
                    loading="lazy"
                    sizes="64px"
                    onError={(e) => {
                      // Fallback a la imagen por defecto si hay error
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    ${product.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {product.stock.currentQuantity}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
