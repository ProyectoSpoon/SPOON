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
  handleMantenerMenu: () => void;
  manteniendoMenu: boolean;
  handlePublicarMenu: () => void;
  publicando: boolean;
}

export function MenuSection({ 
  versionedProductosMenu, categoriasPostgreSQL, handleRemoveFromMenu, menuData, 
  updateProductosMenu, cacheTimeRemaining, limpiarCacheCorrupto, handleMantenerMenu, 
  manteniendoMenu, handlePublicarMenu, publicando 
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
      
      <div className="flex justify-between items-center mt-6">
        <div></div>
        <div className="flex space-x-4">
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

          <Button
            className="bg-spoon-primary hover:bg-spoon-primary-dark text-white"
            onClick={handleMantenerMenu}
            disabled={manteniendoMenu || productosLimpios.length === 0}
          >
            {manteniendoMenu ? 'Guardando...' : 'Mantener Menu'}
          </Button>
          
          <Button
            className="bg-spoon-primary-dark hover:bg-spoon-primary-dark text-white"
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
            {publicando ? 'Publicando...' : 'Publicar Menu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
