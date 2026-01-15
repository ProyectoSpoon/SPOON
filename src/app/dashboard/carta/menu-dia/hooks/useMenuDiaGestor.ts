// dashboard/carta/menu-dia/hooks/useMenuDiaGestor.ts

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para gestionar el modal de ver/editar menú del día
 */
export function useMenuDiaGestor() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Abrir el modal del menú del día
   */
  const abrirModal = useCallback(() => {
    console.log('📖 Abriendo modal del menú del día');
    setShowModal(true);
  }, []);

  /**
   * Cerrar el modal del menú del día
   */
  const cerrarModal = useCallback(() => {
    console.log('❌ Cerrando modal del menú del día');
    setShowModal(false);
  }, []);

  /**
   * Cargar menú guardado desde PostgreSQL al caché/estado local
   */
  const cargarMenuGuardado = useCallback(async (
    updateProductosMenu: (productos: any[]) => void,
    updateProductosSeleccionados?: (productos: any[]) => void
  ) => {
    try {
      setLoading(true);
      console.log('📥 Cargando menú guardado desde PostgreSQL...');
      
      const response = await fetch('/api/menu-dia');
      if (!response.ok) throw new Error('Error al cargar menú');
      
      const data = await response.json();
      
      // Cargar productos del menú guardado
      if (data.menuDia?.productos?.length > 0) {
        const productosMenu = data.menuDia.productos.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: p.precio || 0,
          categoriaId: p.categoriaId,
          imagen: p.imagen,
          currentVersion: 1.0,
          stock: {
            currentQuantity: p.cantidad || 1,
            minQuantity: 0,
            maxQuantity: 100,
            status: 'in_stock' as const,
            lastUpdated: new Date()
          },
          status: 'active' as const,
          priceHistory: [],
          versions: [],
          metadata: {
            createdAt: new Date(),
            createdBy: 'system',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          },
          esFavorito: false,
          esEspecial: false
        }));
        
        updateProductosMenu(productosMenu);
        console.log('✅ Menú cargado al estado local:', productosMenu.length, 'productos');
        
        toast.success(`Menú del día cargado: ${productosMenu.length} productos`);
      } else {
        console.log('ℹ️ No hay menú guardado para cargar');
        toast.info('No hay menú del día guardado');
      }
      
      // Cargar todos los productos disponibles si se proporciona el callback
      if (updateProductosSeleccionados && data.todosLosProductos?.length > 0) {
        const todosProductos = data.todosLosProductos.map((prod: any) => ({
          id: prod.id,
          nombre: prod.nombre || prod.name || 'Sin nombre',
          descripcion: prod.description || prod.descripcion || '',
          precio: prod.current_price || prod.precio || 0,
          categoriaId: prod.category_id || prod.categoriaId,
          imagen: prod.image_url || prod.imagen,
          currentVersion: 1.0,
          stock: {
            currentQuantity: 100,
            minQuantity: 0,
            maxQuantity: 100,
            status: 'in_stock' as const,
            lastUpdated: new Date()
          },
          status: 'active' as const,
          priceHistory: [],
          versions: [],
          metadata: {
            createdAt: new Date(),
            createdBy: 'system',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          },
          esFavorito: false,
          esEspecial: false
        }));
        
        updateProductosSeleccionados(todosProductos);
        console.log('✅ Productos disponibles cargados:', todosProductos.length);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar menú guardado:', error);
      toast.error('Error al cargar el menú guardado');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sincronizar menú del caché con PostgreSQL
   */
  const sincronizarMenu = useCallback(async (
    productosMenu: any[],
    saveToCache?: () => void
  ) => {
    try {
      setLoading(true);
      console.log('🔄 Sincronizando menú con PostgreSQL...');
      
      if (!productosMenu || productosMenu.length === 0) {
        toast.warning('No hay productos en el menú para sincronizar');
        return;
      }
      
      // Preparar productos para guardar
      const productosParaGuardar = productosMenu.map(p => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: p.precio || p.currentPrice || 0,
        categoriaId: p.categoriaId,
        cantidad: p.stock?.currentQuantity || 1
      }));
      
      const response = await fetch('/api/menu-dia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: productosParaGuardar })
      });
      
      if (!response.ok) throw new Error('Error al sincronizar');
      
      // Guardar en caché también si se proporciona el callback
      if (saveToCache) {
        saveToCache();
      }
      
      toast.success('Menú sincronizado exitosamente');
      console.log('✅ Menú sincronizado con PostgreSQL');
      
    } catch (error) {
      console.error('❌ Error al sincronizar menú:', error);
      toast.error('Error al sincronizar el menú');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar si hay un menú guardado en PostgreSQL
   */
  const verificarMenuGuardado = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/menu-dia');
      if (!response.ok) return false;
      
      const data = await response.json();
      const tieneMenu = data.menuDia?.productos?.length > 0;
      
      console.log('🔍 Verificación de menú guardado:', tieneMenu ? 'SÍ' : 'NO');
      return tieneMenu;
      
    } catch (error) {
      console.error('❌ Error al verificar menú guardado:', error);
      return false;
    }
  }, []);

  return {
    // Estado
    showModal,
    loading,
    
    // Acciones del modal
    abrirModal,
    cerrarModal,
    
    // Gestión de datos
    cargarMenuGuardado,
    sincronizarMenu,
    verificarMenuGuardado
  };
}
