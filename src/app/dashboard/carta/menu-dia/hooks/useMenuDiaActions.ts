'use client';

import { useState } from 'react';
import { toast } from 'sonner';

// ✅ CORREGIDO: IDs reales de la base de datos PostgreSQL
const CATEGORIAS_MENU = [
  { id: '494fbac6-59ed-42af-af24-039298ba16b6', nombre: 'Entradas' },
  { id: 'de7f4731-3eb3-4d41-b830-d35e5125f4a3', nombre: 'Principios' },
  { id: '299b1ba0-0678-4e0e-ba53-90e5d95e5543', nombre: 'Proteínas' },
  { id: '8b0751ae-1332-409e-a710-f229be0b9758', nombre: 'Acompañamientos' },
  { id: 'c77ffc73-b65a-4f03-adb1-810443e61799', nombre: 'Bebidas' },
  { id: 'eac729e6-e216-4e45-9d6f-2698c757b096', nombre: 'ALMUERZOS' }
];

export function useMenuDiaActions(
  versionedProductosMenu: any[], 
  hasCache: () => boolean,
  clearCache: () => void,
  saveToCache: () => void,
  refreshFavoritos: () => void
) {
  const [publicando, setPublicando] = useState(false);
  const [manteniendoMenu, setManteniendoMenu] = useState(false);

  const limpiarCacheCorrupto = () => {
    try {
      console.log('🧹 Limpiando caché corrupto...');
      const cacheKeys = ['menu_crear_menu', 'menu_dia', 'productos_seleccionados'];
      cacheKeys.forEach((key: string) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Clave "${key}" eliminada del localStorage`);
      });

      if (typeof clearCache === 'function') {
        clearCache();
        console.log('🗑️ Caché del hook limpiado');
      }

      toast.success('Caché limpiado. Recargando datos...', { duration: 3000 });
      refreshFavoritos();

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ Error al limpiar caché:', error);
      toast.error('Error al limpiar caché');
    }
  };

  const handlePublicarMenu = async () => {
    console.log('🔥 === INICIO handlePublicarMenu ===');
    console.log('📊 Productos en menú:', versionedProductosMenu.length);

    try {
      // ✅ VALIDACIÓN: Solo verificar que hay productos, no filtrar
      if (!versionedProductosMenu || versionedProductosMenu.length === 0) {
        toast.error('No hay productos en el menú para publicar');
        return;
      }

      console.log('✅ Hay productos para publicar:', versionedProductosMenu.length);
      setPublicando(true);

      // ✅ VALIDACIÓN SIMPLE: Solo filtrar productos sin datos críticos
      const productosValidos = versionedProductosMenu.filter((producto: any) => {
        return producto && producto.id && producto.nombre && producto.nombre.trim() !== '';
      });

      console.log('📦 Productos válidos para enviar:', productosValidos.length);

      if (productosValidos.length === 0) {
        toast.error('No hay productos válidos para publicar');
        return;
      }

      // ✅ PREPARAR DATOS PARA ENVIAR
      const productosParaEnviar = productosValidos.map((producto: any) => ({
        id: producto.id,
        nombre: producto.nombre.trim(),
        descripcion: producto.descripcion?.trim() || 'Sin descripción',
        // ✅ CORREGIDO: Default a Entradas con ID real de BD
        categoriaId: producto.categoriaId || '494fbac6-59ed-42af-af24-039298ba16b6',
        precio: typeof producto.currentPrice === 'string'
          ? parseFloat(producto.currentPrice)
          : (producto.currentPrice || 10000)
      }));

      console.log('🚀 Enviando productos:', productosParaEnviar);

      const response = await fetch('/api/menu-dia/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: productosParaEnviar })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al publicar menú');
      }

      const result = await response.json();
      console.log('✅ Menú publicado exitosamente:', result);
      
      toast.success(
        `Menú publicado exitosamente con ${result.combinacionesGeneradas || 0} combinaciones generadas`, 
        { duration: 5000 }
      );

      // ✅ NO LIMPIAR CACHÉ - Solo guardar estado actual
      console.log('💾 Guardando estado actual después de publicar...');
      saveToCache();

    } catch (error) {
      console.error('❌ Error al publicar menú:', error);
      toast.error(error instanceof Error ? error.message : 'Error al publicar el menú del día');
    } finally {
      console.log('🏁 Finalizando publicación');
      setPublicando(false);
    }
  };

  const handleMantenerMenu = async () => {
    try {
      setManteniendoMenu(true);
      console.log('💾 Manteniendo menú del día...');
      saveToCache();
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Menú guardado temporalmente');
    } catch (error) {
      console.error('❌ Error al mantener menú:', error);
      toast.error('Error al guardar el menú');
    } finally {
      setManteniendoMenu(false);
    }
  };

  return {
    publicando, setPublicando, manteniendoMenu, setManteniendoMenu,
    handlePublicarMenu, handleMantenerMenu, limpiarCacheCorrupto
  };
}