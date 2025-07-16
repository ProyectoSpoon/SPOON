// Modificación de MenuSection para remover el botón "Mantener Menu"

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { MenuDiarioRediseno } from '@/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import type { Producto } from '../types/menu-dia.types';

interface MenuSectionProps {
  versionedProductosMenu: VersionedProduct[];
  categoriasPostgreSQL: any[];
  handleRemoveFromMenu: (id: string) => void;
  menuData: any;
  updateProductosMenu: (productos: Producto[]) => void;
  cacheTimeRemaining: number;
  limpiarCacheCorrupto: () => void;
  // ✅ REMOVIDAS: Props del botón "Mantener Menu"
  // handleMantenerMenu: () => void;
  // manteniendoMenu: boolean;
  handlePublicarMenu: () => void;
  publicando: boolean;
}

export function MenuSection({
  versionedProductosMenu, categoriasPostgreSQL, handleRemoveFromMenu, menuData,
  updateProductosMenu, cacheTimeRemaining, limpiarCacheCorrupto,
  // ✅ REMOVIDAS: Desestructuración de props eliminadas
  // handleMantenerMenu, manteniendoMenu,
  handlePublicarMenu, publicando
}: MenuSectionProps) {

  // ✅ LIMPIAR PRODUCTOS DUPLICADOS ANTES DE RENDERIZAR
  const productosLimpios = React.useMemo(() => {
    const productosUnicos = new Map();

    versionedProductosMenu.forEach((producto) => {
      if (producto && producto.id && producto.nombre && producto.nombre.trim()) {
        // Solo mantener el primer producto con cada ID único
        if (!productosUnicos.has(producto.id)) {
          productosUnicos.set(producto.id, {
            ...producto,
            nombre: producto.nombre.trim(),
            descripcion: producto.descripcion ? producto.descripcion.trim() : 'Sin descripción'
          });
        }
      }
    });

    return Array.from(productosUnicos.values());
  }, [versionedProductosMenu]);

  // ✅ FUNCIÓN DE ELIMINACIÓN MEJORADA
  const handleRemoveProducto = (productoId: string) => {
    console.log('🗑️ Eliminando producto con ID:', productoId);

    try {
      // Llamar a la función original
      handleRemoveFromMenu(productoId);

      // Encontrar el producto para mostrar mensaje
      const producto = productosLimpios.find(p => p.id === productoId);
      if (producto) {
        toast.success(`${producto.nombre} eliminado del menú del día`);
        console.log('✅ Producto eliminado exitosamente:', producto.nombre);
      }
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  // ✅ FUNCIÓN DE ACTUALIZACIÓN DE CANTIDAD MEJORADA
  const handleUpdateCantidad = (productoId: string, cantidad: number) => {
    console.log('📊 Actualizando cantidad:', { productoId, cantidad });

    try {
      const productoOriginal = menuData?.productosMenu?.find((p: Producto) => p.id === productoId);
      if (productoOriginal) {
        const productoActualizado = {
          ...productoOriginal,
          stock: { ...productoOriginal.stock, currentQuantity: cantidad }
        };

        const productosActualizados = menuData.productosMenu.map((p: Producto) =>
          p.id === productoId ? productoActualizado : p
        );

        updateProductosMenu(productosActualizados);
        toast.success(`Cantidad de ${productoOriginal.nombre} actualizada a ${cantidad}`);
        console.log('✅ Cantidad actualizada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al actualizar cantidad:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Menu del Día</h2>
        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
          <span className="text-gray-600 mr-1">Caché:</span>
          <span className={`font-medium ${cacheTimeRemaining <= 5 ? 'text-red-500' : 'text-green-600'}`}>
            {cacheTimeRemaining} min
          </span>
        </div>
      </div>

      {/* ✅ MOSTRAR CONTADORES DE DEBUG */}
      <div className="mb-4 text-xs text-gray-500">
        Total productos originales: {versionedProductosMenu.length} |
        Productos únicos: {productosLimpios.length} |
        {versionedProductosMenu.length !== productosLimpios.length && (
          <span className="text-red-500 font-semibold"> ⚠️ Duplicados detectados</span>
        )}
      </div>

      <MenuDiarioRediseno
        productos={productosLimpios}
        categorias={categoriasPostgreSQL}
        onRemoveProduct={handleRemoveProducto}
        onUpdateCantidad={handleUpdateCantidad}
      />

      {/* ✅ BOTONES SIMPLIFICADOS - Solo Limpiar Caché y Publicar Menu */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          {productosLimpios.length > 0 && (
            <span>
              <span className="font-medium">{productosLimpios.length}</span> productos en el menú
            </span>
          )}
        </div>
        
        <div className="flex space-x-4">
          {/* Botón Limpiar Caché */}
          <Button
            className="bg-gray-500 hover:bg-gray-600 text-white"
            onClick={() => {
              console.log('🧹 Limpiando caché corrupto...');
              limpiarCacheCorrupto();
            }}
            variant="outline"
          >
            🧹 Limpiar Caché
          </Button>

          {/* ✅ BOTÓN PUBLICAR MENU - MEJORADO CON MEJOR ESTILO */}
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Publicar menú clickeado');
              if (publicando || productosLimpios.length === 0) {
                console.log('❌ Botón deshabilitado');
                return;
              }
              console.log('✅ Ejecutando publicación...');
              handlePublicarMenu();
            }}
            disabled={publicando || productosLimpios.length === 0}
          >
            {publicando ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Publicando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Publicar Menu
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* ✅ INFORMACIÓN ADICIONAL */}
      {productosLimpios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No hay productos en el menú</p>
          <p className="text-sm">Agrega productos desde la tabla superior o usa el botón "Ver Menú Día" para cargar un menú guardado</p>
        </div>
      )}
    </div>
  );
}