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


                // ✅ FUNCIÓN HELPER: Mapear productos a iconos locales
                const getProductImage = (prod: any): string | undefined => {
                  // Si tiene imagen en BD, usarla
                  if (prod.image_url) return prod.image_url;
                  if (prod.imagen) return prod.imagen;

                  const productName = (prod.name || prod.nombre || '').toLowerCase().trim();

                  // 🗺️ MAPEO DE PRODUCTOS A ICONOS LOCALES
                  const iconMap: Record<string, string> = {
                    // Bebidas
                    'agua de panela con limón': '/iconos/Agua-Panela-Limon.png',
                    'agua de panela con limon': '/iconos/Agua-Panela-Limon.png',
                    'agua natural': '/iconos/Agua.png',
                    'agua': '/iconos/Agua.png',
                    'coca cola': '/iconos/Coca-Cola.png',
                    'coca-cola': '/iconos/Coca-Cola.png',
                    'postobón naranja': '/iconos/Postobon-Naranja.png',
                    'postobon naranja': '/iconos/Postobon-Naranja.png',
                    'limonada': '/iconos/Limonada.png',
                    'limonada de coco': '/iconos/Limonada-Coco.png',
                    'jugo de banano': '/iconos/Jugo-Banano.png',
                  };

                  // 🌐 SUPABASE STORAGE CONFIGURATION
                  const SUPABASE_STORAGE_URL = 'https://lwwmmufsdtbetgieoefo.supabase.co/storage/v1/object/public/images-ingredients';

                  // Helper para crear URLs de Supabase correctamente encodeadas
                  const getSupabaseImageUrl = (filename: string): string => {
                    return `${SUPABASE_STORAGE_URL}/${encodeURIComponent(filename)}`;
                  };

                  // Mapeo de productos a imágenes en Supabase Storage
                  const supabaseIconMap: Record<string, string> = {
                    // Sopas
                    'caldo de costilla': getSupabaseImageUrl('caldo-costilla.png'),
                    'caldo de pescado': getSupabaseImageUrl('Caldo-Pescado.png'),
                    'sopa de arroz': getSupabaseImageUrl('Sopa-Arroz.png'),
                    'sopa de fideos': getSupabaseImageUrl('Sopa-Fideos.png'),
                    'sopa de maíz': getSupabaseImageUrl('Sopa-Maiz.png'),
                    'sopa de maiz': getSupabaseImageUrl('Sopa-Maiz.png'),
                    'sopa de plátano': getSupabaseImageUrl('Sopa-Platano.png'),
                    'sopa de platano': getSupabaseImageUrl('Sopa-Platano.png'),
                    'sopa de pollo': getSupabaseImageUrl('Sopa-Pollo.png'),
                    'sopa de verduras': getSupabaseImageUrl('Sopa-Verduras.png'),
                    'crema de espinaca': getSupabaseImageUrl('crema-espinaca.png'),
                    'crema de zanahoria': getSupabaseImageUrl('crema-zanahoria.png'),

                    // Proteínas
                    'albóndigas en salsa': getSupabaseImageUrl('Albondigas.png'),
                    'albondigas en salsa': getSupabaseImageUrl('Albondigas.png'),
                    'albóndigas': getSupabaseImageUrl('Albondigas.png'),
                    'albondigas': getSupabaseImageUrl('Albondigas.png'),
                    'bistec': getSupabaseImageUrl('Bistec.png'),
                    'carne asada': getSupabaseImageUrl('Carne-Asada.png'),
                    'carne desmechada': getSupabaseImageUrl('Carne-Desmechada.png'),
                    'carne molida': getSupabaseImageUrl('Carne-Molida.png'),
                    'costilla de cerdo': getSupabaseImageUrl('Costilla-Cerdo.png'),
                    'lomo de cerdo': getSupabaseImageUrl('chuleta-cerdo.png'),
                    'hígado en salsa': getSupabaseImageUrl('Higado-Salsa.png'),
                    'higado en salsa': getSupabaseImageUrl('Higado-Salsa.png'),
                    'pechuga a la plancha': getSupabaseImageUrl('Pechuga-Plancha.png'),
                    'pollo asado': getSupabaseImageUrl('pollo-asado.png'),
                    'filete de pescado': getSupabaseImageUrl('Filete-Pescado.png'),
                    'mojarra': getSupabaseImageUrl('Mojarra.png'),
                    'mojarra frita': getSupabaseImageUrl('mojarra-frita.png'),

                    // Acompañamientos - Arroz
                    'arroz blanco': getSupabaseImageUrl('Arroz-cocido-blanco.png'),
                    'arroz con coco': getSupabaseImageUrl('Arroz-Coco.png'),
                    'arroz con fideos': getSupabaseImageUrl('Arroz-Fideos.png'),
                    'arroz con verduras': getSupabaseImageUrl('Arroz-Verduras.png'),
                    'arroz integral': getSupabaseImageUrl('Arroz-cocido-blanco.png'),
                    'arroz con lentejas': getSupabaseImageUrl('Lentejas.png'),

                    // Acompañamientos - Legumbres
                    'arvejas partidas': getSupabaseImageUrl('Arverjas.png'),
                    'arvejas verdes': getSupabaseImageUrl('Arverjas.png'),
                    'frijoles negros': getSupabaseImageUrl('Frijoles-Negros.png'),
                    'frijoles rojos': getSupabaseImageUrl('Frijoles-Rojos.png'),
                    'lentejas': getSupabaseImageUrl('Lentejas.png'),
                    'garbanzos': getSupabaseImageUrl('Garbanzos.png'),

                    // Acompañamientos - Otros
                    'ensalada': getSupabaseImageUrl('ensalada.png'),
                    'ensalada de frutas': getSupabaseImageUrl('Ensalada-Frutas.png'),
                    'papa salada': getSupabaseImageUrl('Papa-Salada.png'),
                    'papas saladas': getSupabaseImageUrl('Papa-Salada.png'),
                    'tajadas': getSupabaseImageUrl('Tajadas.png'),
                    'tajadas de plátano': getSupabaseImageUrl('Tajadas.png'),
                    'tajadas de platano': getSupabaseImageUrl('Tajadas.png'),
                    'yuca cocida': getSupabaseImageUrl('Yuca-Cocida.png'),
                    'yuca frita': getSupabaseImageUrl('Yuca-Frita.png'),
                    'mazorca': getSupabaseImageUrl('Mazorca Cocida.png'),
                    'pimentón': getSupabaseImageUrl('Pimenton.png'),
                    'pimenton': getSupabaseImageUrl('Pimenton.png'),

                    // Frutas
                    'porción de mango': getSupabaseImageUrl('Porcion-Mango.png'),
                    'porcion de mango': getSupabaseImageUrl('Porcion-Mango.png'),
                    'porción de melón': getSupabaseImageUrl('Porcion-Melon.png'),
                    'porcion de melon': getSupabaseImageUrl('Porcion-Melon.png'),
                    'porción de papaya': getSupabaseImageUrl('Porcion-Papaya.png'),
                    'porcion de papaya': getSupabaseImageUrl('Porcion-Papaya.png'),
                    'porción de piña': getSupabaseImageUrl('Porcion-Piña.png'),
                    'porcion de piña': getSupabaseImageUrl('Porcion-Piña.png'),
                    'porcion de pina': getSupabaseImageUrl('Porcion-Piña.png'),
                    'porción de sandía': getSupabaseImageUrl('Porcion-Sandia.png'),
                    'porcion de sandia': getSupabaseImageUrl('Porcion-Sandia.png'),

                    // Bebidas
                    'agua': getSupabaseImageUrl('Agua natural.png'),
                    'agua natural': getSupabaseImageUrl('Agua natural.png'),
                    'agua de panela con limón': getSupabaseImageUrl('Agua-Panela-Limon.png'),
                    'agua de panela con limon': getSupabaseImageUrl('Agua-Panela-Limon.png'),
                    'coca cola': getSupabaseImageUrl('Gaseosa-Cola.png'),
                    'coca-cola': getSupabaseImageUrl('Gaseosa-Cola.png'),
                    'postobón naranja': getSupabaseImageUrl('Postobon-Naranja.png'),
                    'postobon naranja': getSupabaseImageUrl('Postobon-Naranja.png'),
                    'jugo de banano': getSupabaseImageUrl('Jugo-Banano.png'),
                    'jugo de fresa': getSupabaseImageUrl('Jugo-Fresa.png'),
                    'jugo de guanábana': getSupabaseImageUrl('Jugo-Guanabana.png'),
                    'jugo de guanabana': getSupabaseImageUrl('Jugo-Guanabana.png'),
                    'jugo de mango': getSupabaseImageUrl('Jugo-Mango.png'),
                    'jugo de maracuyá': getSupabaseImageUrl('Jugo-Maracuya.png'),
                    'jugo de maracuya': getSupabaseImageUrl('Jugo-Maracuya.png'),
                    'jugo de mora': getSupabaseImageUrl('Jugo-Mora.png'),
                    'limonada': getSupabaseImageUrl('Limonada-Natural.png'),
                    'limonada natural': getSupabaseImageUrl('Limonada-Natural.png'),
                    'limonada de coco': getSupabaseImageUrl('Limonada-Coco.png'),
                  };

                  // 🔍 BÚSQUEDA DE ICONOS (Prioridad: Supabase > Local > Categoría)
                  let matchedIcon: string | null = null;
                  let matchType = '';

                  // 1. Buscar coincidencia exacta en Supabase
                  if (supabaseIconMap[productName]) {
                    matchedIcon = supabaseIconMap[productName];
                    matchType = 'Supabase exacta';
                  }

                  // 2. Buscar coincidencia exacta en iconos locales (fallback)
                  if (!matchedIcon && iconMap[productName]) {
                    matchedIcon = iconMap[productName];
                    matchType = 'Local exacta';
                  }

                  // 3. Buscar coincidencia parcial en Supabase (más flexible)
                  if (!matchedIcon) {
                    for (const [key, icon] of Object.entries(supabaseIconMap)) {
                      // Buscar si el nombre del producto contiene la palabra clave O viceversa
                      if (productName.includes(key) || key.includes(productName)) {
                        matchedIcon = icon;
                        matchType = `Supabase parcial (${key})`;
                        break;
                      }
                    }
                  }

                  // 4. Buscar coincidencia parcial en iconos locales (fallback)
                  if (!matchedIcon) {
                    for (const [key, icon] of Object.entries(iconMap)) {
                      if (productName.includes(key) || key.includes(productName)) {
                        matchedIcon = icon;
                        matchType = `Local parcial (${key})`;
                        break;
                      }
                    }
                  }

                  // 5. Fallback final: Iconos genéricos por categoría
                  if (!matchedIcon) {
                    const categoryId = prod.category_id || prod.categoriaId;
                    const categoryIcons: Record<string, string> = {
                      'b4e792ba-b00d-4348-b9e3-f34992315c23': '/iconos/sopa.png',        // Entradas
                      '2d4c3ea8-843e-4312-821e-54d1c4e79dce': '/iconos/principio.png',  // Principios
                      '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3': '/iconos/carne.png',      // Proteínas
                      'a272bc20-464c-443f-9283-4b5e7bfb71cf': '/iconos/arroz.png',      // Acompañamientos
                      '6feba136-57dc-4448-8357-6f5533177cfd': '/iconos/bebida.png',     // Bebidas
                    };
                    matchedIcon = categoryIcons[categoryId] || '/iconos/principio.png';
                    matchType = 'Categoría fallback';
                  }

                  return matchedIcon;
                };

                // ✅ MAPEAR CAMPOS DE LA API AL FORMATO ESPERADO
                const productosMapeados = productosData.data.map((prod: any) => ({
                  id: prod.id,
                  nombre: prod.name || prod.nombre || 'Sin nombre', // API usa 'name'
                  descripcion: prod.description || prod.descripcion || '', // API usa 'description'
                  precio: prod.suggested_price_min || prod.precio || 0,
                  categoriaId: prod.category_id || prod.categoriaId, // API usa 'category_id'
                  imagen: getProductImage(prod), // Generar imagen o usar existente
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
                    createdAt: new Date(prod.created_at || Date.now()),
                    createdBy: 'system',
                    lastModified: new Date(prod.updated_at || Date.now()),
                    lastModifiedBy: 'system'
                  },
                  esFavorito: false,
                  esEspecial: false,
                  // Campos adicionales de la API para referencia
                  _apiData: {
                    popularity_score: prod.popularity_score,
                    is_vegetarian: prod.is_vegetarian,
                    is_vegan: prod.is_vegan,
                    search_tags: prod.search_tags
                  }
                }));

                setProductosDB(productosMapeados);
                updateProductosSeleccionados(productosMapeados);
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
  }, []); // Dependencias vacías para evitar loop infinito

  return {
    restaurantId, setRestaurantId, userId, menuDiaDB, setMenuDiaDB,
    productosDB, setProductosDB, loadingDB, setLoadingDB, errorDB, setErrorDB
  };
}
