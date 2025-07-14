'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas' },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios' },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas' },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos' },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas' }
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
        categoriaId: producto.categoriaId || 'b4e792ba-b00d-4348-b9e3-f34992315c23', // Default a Entradas
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
