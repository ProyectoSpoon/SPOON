'use client';

import { useState, useEffect } from 'react';
import { convertToProducto } from '../utils/menu-dia.utils';

export function useMenuDiaData(updateProductosMenu: any, updateProductosSeleccionados: any) {
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [userId] = useState<string>('11111111-2222-3333-4444-555555555555');
  const [menuDiaDB, setMenuDiaDB] = useState<any>(null);
  const [productosDB, setProductosDB] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [errorDB, setErrorDB] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatosDB = async () => {
      try {
        setLoadingDB(true);
        console.log('🔄 Cargando menú del día desde la base de datos...');
        const response = await fetch('/api/menu-dia');
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        console.log('📊 Datos de BD recibidos:', data);

        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          console.log('🏪 Restaurant ID establecido:', data.restaurantId);
          
          // ✅ NUEVA FUNCIONALIDAD: CARGAR PRODUCTOS DISPONIBLES DEL RESTAURANTE
          console.log('📡 Cargando productos del restaurante...');
          try {
            const productosResponse = await fetch(`/api/productos?restauranteId=${data.restaurantId}`);
            if (productosResponse.ok) {
              const productosData = await productosResponse.json();
              console.log('📦 Productos del restaurante cargados:', productosData.count || 0);
              console.log('🏗️ Arquitectura detectada:', productosData.architecture || 'legacy');
              
              if (productosData.success && productosData.data?.length > 0) {
                console.log('✅ Actualizando productos seleccionados con datos nuevos');
                setProductosDB(productosData.data);
                updateProductosSeleccionados(productosData.data);
              } else {
                console.log('⚠️ No se encontraron productos para el restaurante');
                setProductosDB([]);
                updateProductosSeleccionados([]);
              }
            } else {
              console.error('❌ Error al cargar productos:', productosResponse.status);
            }
          } catch (productosError) {
            console.error('❌ Error en llamada de productos:', productosError);
          }
        }

        setMenuDiaDB(data.menuDia);
        
        // ✅ MANTENER PROCESAMIENTO DE PRODUCTOS LEGACY (por compatibilidad)
        const todosLosProductos = data.todosLosProductos || [];
        console.log('📦 Productos legacy recibidos de BD:', todosLosProductos.length);
        
        // Solo usar productos legacy si no hay productos nuevos
        if (todosLosProductos.length > 0 && productosDB.length === 0) {
          // ✅ CONVERTIR Y ACTUALIZAR PRODUCTOS SELECCIONADOS (LEGACY)
          const productosConvertidos = todosLosProductos.map((prod: any) => {
            try {
              return {
                id: prod.id,
                nombre: prod.nombre || prod.name || 'Sin nombre',
                descripcion: prod.description || prod.descripcion || '',
                precio: prod.current_price || prod.precio || 0,
                categoriaId: prod.category_id || prod.categoriaId,
                imagen: prod.image_url || prod.imagen,
                currentVersion: prod.version ? parseFloat(prod.version.toString()) : 1.0,
                stock: {
                    currentQuantity: prod.stock_quantity || 0,
                    minQuantity: 0,
                    maxQuantity: 100,
                    status: 'in_stock',
                    lastUpdated: new Date()
                },
                status: 'active',
                priceHistory: [],
                versions: [],
                metadata: {
                    createdAt: new Date(),
                    createdBy: 'system',
                    lastModified: new Date(),
                    lastModifiedBy: 'system'
                },
                esFavorito: false,
                esEspecial: false,
              };
            } catch (error) {
              console.warn('Error convirtiendo producto legacy:', error);
              return null;
            }
          }).filter(Boolean);
          
          console.log('✅ Productos legacy convertidos:', productosConvertidos.length);
          setProductosDB(productosConvertidos);
          updateProductosSeleccionados(productosConvertidos);
        }

        // ✅ PROCESAR PRODUCTOS DEL MENÚ (si existen)
        if (data.menuDia?.productos?.length > 0) {
          const productosMenuBD = data.menuDia.productos.map((p: any) => {
            try {
              return convertToProducto(p);
            } catch (error) {
              console.warn('Error convirtiendo producto menú:', error);
              return null;
            }
          }).filter(Boolean);
          
          console.log('🍽️ Productos del menú cargados:', productosMenuBD.length);
          updateProductosMenu(productosMenuBD);
        }

      } catch (err) {
        console.error('❌ Error al cargar datos de BD:', err);
        setErrorDB(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingDB(false);
      }
    };
    cargarDatosDB();
  }, [updateProductosMenu, updateProductosSeleccionados]);

  return {
    restaurantId, setRestaurantId, userId, menuDiaDB, setMenuDiaDB,
    productosDB, setProductosDB, loadingDB, setLoadingDB, errorDB, setErrorDB
  };
}