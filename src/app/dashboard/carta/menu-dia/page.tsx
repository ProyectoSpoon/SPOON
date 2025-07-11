'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Search, ChevronLeft, ChevronRight, Soup } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useCategorias } from '@/app/dashboard/carta/hooks/useCategorias';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

// ✅ IMPORTACIONES DEL MÓDULO FAVORITOS
import { useFavoritos } from './hooks/useFavoritos';
import type { Producto } from './types/menu-dia.types';
import { convertToVersionedProduct, convertToProducto } from './utils/menu-dia.utils';

// Componentes
import { MenuDiarioRediseno } from '@/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno';

// ✅ CATEGORÍAS DEL MENÚ: Solo las 5 categorías esenciales (sin "Almuerzos")
const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas', enum: CategoriaMenu.ENTRADA },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios', enum: CategoriaMenu.PRINCIPIO },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas', enum: CategoriaMenu.PROTEINA },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos', enum: CategoriaMenu.ACOMPANAMIENTO },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas', enum: CategoriaMenu.BEBIDA }
];

// ✅ FUNCIÓN MEJORADA: Validar y limpiar datos del caché
const validarYLimpiarDatos = (productos: any[]): any[] => {
  if (!Array.isArray(productos)) {
    console.warn('⚠️ Productos no es un array, devolviendo array vacío');
    return [];
  }

  return productos.filter((producto: any, index: number) => {
    // Validaciones básicas
    if (!producto || typeof producto !== 'object') {
      console.warn(`⚠️ Producto ${index} no es un objeto válido:`, producto);
      return false;
    }

    if (!producto.id || typeof producto.id !== 'string' || producto.id.trim() === '') {
      console.warn(`⚠️ Producto ${index} sin ID válido:`, producto);
      return false;
    }

    if (!producto.nombre || typeof producto.nombre !== 'string' || producto.nombre.trim() === '') {
      console.warn(`⚠️ Producto ${index} sin nombre válido:`, producto);
      return false;
    }

    // ✅ FILTRO CRÍTICO: Validar categoría
    if (!producto.categoriaId || typeof producto.categoriaId !== 'string' || producto.categoriaId.trim() === '') {
      console.warn(`⚠️ Producto "${producto.nombre}" sin categoriaId válido. Será filtrado.`);
      return false;
    }

    // Verificar si la categoría existe en CATEGORIAS_MENU
    const categoriaExiste = CATEGORIAS_MENU.some((cat: any) => cat.id === producto.categoriaId);
    if (!categoriaExiste) {
      console.warn(`⚠️ Producto "${producto.nombre}" con categoriaId "${producto.categoriaId}" no válido. Será filtrado.`);
      return false;
    }

    return true;
  });
};

export default function MenuDiaPage() {
  // Estados para IDs de usuario y restaurante
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [userId] = useState<string>('11111111-2222-3333-4444-555555555555'); // ✅ ID del usuario spoon@spoon.com

  // ✅ HOOKS EXISTENTES (mantener para compatibilidad)
  const {
    menuData,
    isLoaded,
    updateProductosSeleccionados,
    updateProductosMenu,
    addProductoToMenu,
    removeProductoFromMenu,
    updateSeleccion,
    updateSubmenuActivo,
    hasCache,
    getCacheRemainingTime,
    saveToCache,
    clearCache
  } = useMenuCache();

  const {
    categorias: categoriasPostgreSQL,
    loading: categoriasLoading,
    error: categoriasError,
    obtenerCategorias,
  } = useCategorias();

  // ✅ HOOK DE FAVORITOS ACTUALIZADO: Ahora recibe userId y restaurantId
  const {
    favoritos,
    loading: favoritosLoading,
    addFavorito,
    removeFavorito,
    toggleFavorito,
    isFavorito,
    refreshFavoritos
  } = useFavoritos(userId, restaurantId);

  // Estados existentes
  const [menuDiaDB, setMenuDiaDB] = useState<any>(null);
  const [productosDB, setProductosDB] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [errorDB, setErrorDB] = useState<string | null>(null);

  // Estados para botones de acción
  const [publicando, setPublicando] = useState(false);
  const [manteniendoMenu, setManteniendoMenu] = useState(false);

  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<VersionedProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('b4e792ba-b00d-4348-b9e3-f34992315c23');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VersionedProduct | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // ✅ FUNCIÓN PARA LIMPIAR CACHÉ
  const limpiarCacheCorrupto = () => {
    try {
      console.log('🧹 Limpiando caché corrupto...');
      
      // Limpiar localStorage
      const cacheKeys = ['menu_crear_menu', 'menu_dia', 'productos_seleccionados'];
      cacheKeys.forEach((key: string) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Clave "${key}" eliminada del localStorage`);
      });
      
      // Limpiar caché del hook si está disponible
      if (typeof clearCache === 'function') {
        clearCache();
        console.log('🗑️ Caché del hook limpiado');
      }
      
      toast.success('Caché limpiado. Recargando datos...', { duration: 3000 });
      
      // Recargar favoritos
      refreshFavoritos();
      
      // Opcional: Recargar la página para obtener datos frescos
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error al limpiar caché:', error);
      toast.error('Error al limpiar caché');
    }
  };

  // Effects existentes
  useEffect(() => {
    obtenerCategorias().catch((error: any) => {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar categorías desde PostgreSQL');
    });
  }, [obtenerCategorias]);

  // ✅ EFFECT ACTUALIZADO: Cargar datos de BD y establecer restaurantId
  useEffect(() => {
    const cargarDatosDB = async () => {
      try {
        setLoadingDB(true);
        console.log('🔄 Cargando menú del día desde la base de datos...');
        const response = await fetch('/api/menu-dia');
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        
        const data = await response.json();
        console.log('📊 Datos de BD recibidos:', data);
        
        // ✅ ESTABLECER RESTAURANT ID desde la respuesta de la API
        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          console.log('🏪 Restaurant ID establecido:', data.restaurantId);
        }
        
        setMenuDiaDB(data.menuDia);
        setProductosDB(data.todosLosProductos || []);
        
        const productosMenuBD = (data.menuDia?.productos || []).map(convertToProducto);
        updateProductosMenu(productosMenuBD);
        
      } catch (err) {
        console.error('❌ Error al cargar datos de BD:', err);
        setErrorDB(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingDB(false);
      }
    };
    cargarDatosDB();
  }, [updateProductosMenu]);

  useEffect(() => {
    if (isLoaded) {
      console.log("MenuDiaPage - menuData RECIBIDO:", JSON.parse(JSON.stringify(menuData)));
    }
  }, [isLoaded, menuData]);

  useEffect(() => {
    if (!isLoaded) return;
    setCacheTimeRemaining(getCacheRemainingTime());
    const interval = setInterval(() => {
      const remainingTime = getCacheRemainingTime();
      setCacheTimeRemaining(remainingTime);
      if (remainingTime <= 0) toast.error('El tiempo de caché ha expirado.');
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoaded, getCacheRemainingTime]);

  const toastShownRef = useRef(false);
  useEffect(() => {
    if (isLoaded && !toastShownRef.current) {
      toastShownRef.current = true;
      if (hasCache()) {
        toast.success(`Datos cargados desde caché (expira en ${getCacheRemainingTime()} minutos)`, { duration: 4000 });
      } else {
        toast.info(`No se encontraron datos en caché.`, { duration: 4000 });
      }
    }
  }, [isLoaded, hasCache, getCacheRemainingTime]);

  useEffect(() => {
    updateSubmenuActivo('menu-dia');
  }, [updateSubmenuActivo]);

  // ✅ EFFECT ACTUALIZADO: Monitorear cambios en favoritos modulares
  useEffect(() => {
    console.log('🔄 Favoritos modulares actualizados:', {
      restaurantId,
      userId,
      cantidad: favoritos.length,
      productos: favoritos.map((f: any) => f.product_name || f.product_id)
    });
  }, [favoritos, restaurantId, userId]);

  // ✅ FUNCIÓN PUBLICAR MENÚ (sin cambios - ya estaba bien)
  const handlePublicarMenu = async () => {
    console.log('🔥 === INICIO handlePublicarMenu ===');
    console.log('📊 versionedProductosMenu.length:', versionedProductosMenu.length);
    console.log('📊 versionedProductosMenu completo:', versionedProductosMenu);
    console.log('📊 Estado actual del componente:', {
      totalProductos: versionedProductosMenu.length,
      publicando,
      hasCache: hasCache(),
      menuData: menuData ? 'existe' : 'no existe'
    });
    
    try {
      // ✅ VALIDACIÓN: Filtrar productos válidos ANTES de validar cantidad
      console.log('🔄 Filtrando productos válidos...');
      const productosValidos = versionedProductosMenu.filter((producto: VersionedProduct, index: number) => {
        // Verificar que tenga nombre válido
        if (!producto.nombre || producto.nombre.trim() === '') {
          console.warn(`⚠️ Producto ${index + 1} sin nombre válido ignorado:`, producto);
          return false;
        }
        
        // Verificar que tenga ID válido
        if (!producto.id || producto.id.trim() === '') {
          console.warn(`⚠️ Producto ${index + 1} sin ID válido ignorado:`, producto);
          return false;
        }
        
        // ✅ FILTRO PRINCIPAL: Verificar que tenga categoría válida
        if (!producto.categoriaId || producto.categoriaId.trim() === '') {
          console.warn(`⚠️ Producto "${producto.nombre}" sin categoría válida ignorado. CategoriaId: "${producto.categoriaId}"`);
          return false;
        }
        
        // ✅ NUEVO: Verificar que la categoría esté en la lista válida
        const categoriaValida = CATEGORIAS_MENU.find((cat: any) => cat.id === producto.categoriaId);
        if (!categoriaValida) {
          console.warn(`⚠️ Producto "${producto.nombre}" con categoría inválida ignorado. CategoriaId: "${producto.categoriaId}" no está en CATEGORIAS_MENU`);
          return false;
        }
        
        console.log(`✅ Producto válido: "${producto.nombre}" - Categoría: ${categoriaValida.nombre}`);
        return true;
      });

      console.log(`📊 Productos filtrados: ${productosValidos.length} válidos de ${versionedProductosMenu.length} totales`);
      
      // Mostrar productos filtrados si hay algunos inválidos
      if (productosValidos.length !== versionedProductosMenu.length) {
        const productosInvalidos = versionedProductosMenu.filter((p: VersionedProduct) => !productosValidos.includes(p));
        console.warn('⚠️ Productos filtrados por ser inválidos:', productosInvalidos.map((p: VersionedProduct) => ({
          nombre: p.nombre,
          categoriaId: p.categoriaId,
          id: p.id
        })));
        
        // Mostrar toast informativo
        toast.warning(
          `Se filtraron ${productosInvalidos.length} productos sin categoría válida. ` +
          `Publicando ${productosValidos.length} productos válidos.`,
          { duration: 4000 }
        );
      }

      // Validación con logging detallado USANDO PRODUCTOS VÁLIDOS
      if (productosValidos.length === 0) {
        console.log('❌ RETORNANDO - No hay productos válidos');
        console.log('📊 Detalles del estado:', {
          versionedProductosMenuOriginal: versionedProductosMenu.length,
          productosValidosFiltrados: productosValidos.length,
          menuData: menuData?.productosMenu,
          productosDB: productosDB?.length || 0
        });
        toast.error('No hay productos válidos en el menú para publicar. Verifica que tengan categorías asignadas.');
        return;
      }

      console.log(`✅ CONTINUANDO - Hay productos válidos: ${productosValidos.length}`);
      setPublicando(true);
      
      console.log('🚀 Publicando menú del día con generación de combinaciones...', {
        productos: productosValidos.length,
        fecha: new Date().toISOString().split('T')[0]
      });

      // Conversión con validación detallada USANDO PRODUCTOS VÁLIDOS
      console.log('🔄 Iniciando conversión de productos válidos...');
      const productosParaEnviar = productosValidos.map((producto: VersionedProduct, index: number) => {
        console.log(`🔍 Convirtiendo producto ${index + 1}:`, {
          id: producto.id,
          nombre: `"${producto.nombre}"`,
          descripcion: producto.descripcion ? `"${producto.descripcion}"` : 'Sin descripción',
          categoriaId: producto.categoriaId,
          currentPrice: producto.currentPrice,
        });
        
        const productoConvertido = {
          id: producto.id,
          nombre: producto.nombre.trim(), // ✅ LIMPIEZA: Eliminar espacios en blanco
          descripcion: producto.descripcion?.trim() || 'Sin descripción',
          categoriaId: producto.categoriaId,
          precio: typeof producto.currentPrice === 'string' 
            ? parseFloat(producto.currentPrice) 
            : (producto.currentPrice || 10000)
        };
        
        console.log(`✅ Producto ${index + 1} convertido:`, productoConvertido);
        return productoConvertido;
      });
      
      console.log('📦 Productos que se enviarán:', productosParaEnviar);
      console.log('🚀 ENVIANDO FETCH...');

      // Llamar al nuevo endpoint de publicación
      const response = await fetch('/api/menu-dia/publicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: productosParaEnviar
        })
      });

      console.log('📨 FETCH ENVIADO, response status:', response.status);
      console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ RESPONSE NO OK:', response.status, response.statusText);
        let errorData;
        try {
          errorData = await response.json();
          console.log('❌ Error data:', errorData);
        } catch (parseError) {
          console.log('❌ Error al parsear respuesta de error:', parseError);
          errorData = { error: `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || 'Error al publicar menú');
      }

      console.log('✅ Response OK, parseando resultado...');
      const result = await response.json();
      console.log('✅ Resultado completo:', result);
      
      toast.success(
        `Menú publicado exitosamente con ${result.combinacionesGeneradas} combinaciones generadas`,
        { duration: 5000 }
      );
      
      console.log('✅ Publicación exitosa:', result);
      
      // Limpiar caché después de publicar
      if (hasCache()) {
        clearCache();
      }
      
    } catch (error) {
      console.log('💥 ERROR CAPTURADO:', error);
      console.error('❌ Error al publicar menú:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al publicar el menú del día'
      );
    } finally {
      console.log('🏁 FINALIZANDO handlePublicarMenu');
      setPublicando(false);
    }
  };

  const handleMantenerMenu = async () => {
    try {
      setManteniendoMenu(true);
      console.log('💾 Manteniendo menú del día...');
      
      // Guardar en caché
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

  const handleCategoriaSeleccionada = (categoriaId: string) => {
    updateSeleccion(categoriaId, null);
  };

  const handleAgregarAlMenu = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    addProductoToMenu(producto);
    toast.success(`${producto?.nombre || 'Producto'} agregado al menú del día`, { duration: 2000 });
  };

  const handleRemoveFromMenu = (productoId: string) => {
    const producto = menuData?.productosMenu?.find((p: Producto) => p.id === productoId);
    if (producto) {
      removeProductoFromMenu(productoId);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    }
  };

  // ✅ FUNCIÓN ACTUALIZADA: Toggle favorito usando sistema modular con restaurantId
  const handleToggleFavorite = async (versionedProduct: VersionedProduct) => {
    console.log('🖱️ Toggle favorito clickeado para:', versionedProduct.nombre);
    console.log('📊 Estado actual de favoritos modulares:', {
      favoritos: favoritos.length,
      restaurantId,
      userId
    });
    
    // Verificar que tengamos restaurantId
    if (!restaurantId) {
      toast.error('No se ha cargado el ID del restaurante');
      return;
    }
    
    try {
      const success = await toggleFavorito(versionedProduct.id);
      
      if (success) {
        const esFavorito = isFavorito(versionedProduct.id);
        const mensaje = esFavorito 
          ? `${versionedProduct.nombre} agregado a favoritos del restaurante`
          : `${versionedProduct.nombre} eliminado de favoritos del restaurante`;
        toast.success(mensaje);
        
        console.log('✅ Toggle favorito exitoso:', { 
          producto: versionedProduct.nombre, 
          esFavorito,
          restaurantId 
        });
      }
    } catch (error) {
      console.error('❌ Error al toggle favorito:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleViewProductDetails = (producto: VersionedProduct) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  // Memoized values
  const versionedProductosMenu = useMemo(() => 
    menuData && Array.isArray(menuData.productosMenu) 
      ? validarYLimpiarDatos(menuData.productosMenu).map(convertToVersionedProduct) 
      : [],
  [menuData?.productosMenu]);

  const versionedProductosSeleccionados = useMemo(() => 
    menuData && Array.isArray(menuData.productosSeleccionados)
      ? validarYLimpiarDatos(menuData.productosSeleccionados).map(convertToVersionedProduct)
      : [],
  [menuData?.productosSeleccionados]);

  const todosLosProductos = useMemo(() => {
    if (productosDB && productosDB.length > 0) {
      return productosDB.map((prod: any) => {
        // Crear objeto Producto primero
        const productoBase: Producto = {
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
        return convertToVersionedProduct(productoBase);
      });
    }
    return versionedProductosSeleccionados;
  }, [productosDB, versionedProductosSeleccionados]);

  // CORRECCIÓN: Usar useRef para evitar el bucle infinito
  const productosInicializados = useRef(false);

  useEffect(() => {
    // Solo actualizar una vez cuando los productos de la BD estén disponibles
    if (productosDB && productosDB.length > 0 && !productosInicializados.current) {
      const productosConvertidos = productosDB.map((prod: any) => {
        // Crear objeto Producto correctamente
        const productoBase: Producto = {
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
        return productoBase;
      });
      
      updateProductosSeleccionados(productosConvertidos);
      productosInicializados.current = true;
    }
  }, [productosDB, updateProductosSeleccionados]);

  const filtrarProductosPorTermino = useCallback((term: string, productos: VersionedProduct[]) => {
    if (!term.trim()) return [];
    const termLower = term.toLowerCase();
    return productos.filter((p: VersionedProduct) => 
      p.nombre.toLowerCase().includes(termLower) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(termLower))
    );
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const debounceTimeout = setTimeout(() => {
      const sugerencias = filtrarProductosPorTermino(searchTerm, todosLosProductos);
      setSearchSuggestions(sugerencias);
      setShowSuggestions(sugerencias.length > 0);
    }, 150);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, todosLosProductos, filtrarProductosPorTermino]);
  
  const handleSelectSuggestion = (producto: VersionedProduct) => {
    setSearchTerm(producto.nombre);
    setShowSuggestions(false);
    // ✅ SIMPLIFICADO: Directamente usar la categoría del producto
    setSelectedCategoryTab(producto.categoriaId);
    updateSeleccion(producto.categoriaId, null);
    
    setTimeout(() => {
      // Scroll hacia arriba para ver los productos filtrados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  const contarProductosPorCategoria = useCallback(() => {
    const conteos: Record<string, number> = {};
    if (menuData && Array.isArray(menuData.productosSeleccionados)) {
      menuData.productosSeleccionados.forEach((producto: Producto) => {
        if (producto.categoriaId) conteos[producto.categoriaId] = (conteos[producto.categoriaId] || 0) + 1;
      });
    }
    return conteos;
  }, [menuData]);

  // ✅ NUEVO: Crear categorías con conteo usando las categorías fijas
  const categoriasMenuConConteo = useMemo(() => {
    const conteos = contarProductosPorCategoria();
    return CATEGORIAS_MENU.map((cat: any) => ({ 
      ...cat, 
      count: conteos[cat.id] || 0 
    }));
  }, [contarProductosPorCategoria]);

  // ✅ LOADING ACTUALIZADO: Considerar también la carga del restaurantId
  if (!isLoaded || categoriasLoading || loadingDB || !restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4821F] mb-4"></div>
        <p className="text-gray-600">
          {!restaurantId ? 'Cargando configuración del restaurante...' : 'Cargando datos del menú...'}
        </p>
        {categoriasError && <p className="text-red-500 mt-2 text-sm">Error: {categoriasError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 h-screen bg-gray-50">
      {/* Encabezado principal */}
      <div className="flex justify-between items-center bg-gray-50 p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Menu del Día</h1>
          {/* ✅ MOSTRAR INFO DEL RESTAURANTE */}
          <p className="text-sm text-gray-500">
            Restaurante: {restaurantId} | Usuario: {userId}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* ✅ BOTÓN FAVORITOS ACTUALIZADO */}
          <button 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              showFavorites 
                ? 'bg-[#F4821F] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setShowFavorites(!showFavorites)}
            disabled={favoritosLoading}
          >
            {showFavorites ? '❤️ Ocultar favoritos' : '🤍 Mostrar favoritos'}
            {/* ✅ CONTADOR ACTUALIZADO */}
            {favoritos.length > 0 && (
              <span className={`absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold ${
                showFavorites 
                  ? 'bg-white text-[#F4821F]' 
                  : 'bg-red-500 text-white'
              }`}>
                {favoritos.length}
              </span>
            )}
          </button>
          
          {/* Campo de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-200 rounded-md w-64 text-sm"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((producto: VersionedProduct) => (
                    <div
                      key={producto.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSelectSuggestion(producto)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          {producto.imagen ? (
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Soup className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {producto.nombre}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {CATEGORIAS_MENU.find((c: any) => c.id === producto.categoriaId)?.nombre || 'Categoría'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {producto.descripcion}
                          </p>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {producto.stock.status === 'in_stock' ? (
                                <span className="text-green-600">Disponible</span>
                              ) : producto.stock.status === 'low_stock' ? (
                                <span className="text-yellow-600">Stock bajo</span>
                              ) : (
                                <span className="text-red-600">No disponible</span>
                              )}
                            </div>
                            <button
                              className="text-xs bg-[#F4821F] hover:bg-[#E67812] text-white px-2 py-1 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAgregarAlMenu(producto);
                                setShowSuggestions(false);
                              }}
                            >
                              Agregar al menú
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación principal - Solo Almuerzo */}
      <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        
        <div className="flex space-x-4 overflow-x-auto py-2 px-4">
          <button 
            className="px-3 py-1 font-medium text-sm capitalize text-[#F4821F] border-b-2 border-[#F4821F]"
          >
            Almuerzo
          </button>
        </div>
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      {/* ✅ BARRA DE CATEGORÍAS: Solo las 5 categorías esenciales del menú */}
      <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
        <div className="flex space-x-4 overflow-x-auto py-2 px-4 w-full">
          {CATEGORIAS_MENU.map((categoria: any) => (
            <button 
              key={categoria.id}
              className={`px-3 py-1 text-sm ${selectedCategoryTab === categoria.id 
                ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
                : 'text-gray-700 hover:text-[#F4821F]'}`}
              onClick={() => {
                setSelectedCategoryTab(categoria.id);
                handleCategoriaSeleccionada(categoria.id);
              }}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ SECCIÓN DE FAVORITOS ACTUALIZADA */}
      {showFavorites && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            ❤️ Productos Favoritos del Restaurante 
            {favoritosLoading && <span className="ml-2 text-xs">(Cargando...)</span>}
          </h3>
          {favoritos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoritos.map((favorito: any) => (
                <div key={favorito.id} className="bg-white border border-yellow-200 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-gray-800 block truncate">
                      {favorito.product_name || 'Producto sin nombre'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {CATEGORIAS_MENU.find((c: any) => c.id === favorito.category_id)?.nombre || 'Categoría'}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Agregado por: {favorito.created_by_name || 'Usuario desconocido'}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button 
                      className="text-[#F4821F] hover:text-[#E67812] p-1"
                      onClick={() => {
                        console.log('➕ Agregando favorito al menú:', favorito.product_name);
                        // Crear VersionedProduct desde favorito
                        const producto = convertToVersionedProduct({
                          id: favorito.product_id,
                          nombre: favorito.product_name || '',
                          descripcion: favorito.product_description || '',
                          precio: favorito.product_price || 0,
                          categoriaId: favorito.category_id || '',
                          imagen: favorito.product_image,
                          currentVersion: 1.0,
                          stock: { currentQuantity: 0, minQuantity: 0, maxQuantity: 0, status: 'in_stock', lastUpdated: new Date() },
                          status: 'active',
                          priceHistory: [],
                          versions: [],
                          metadata: { createdAt: new Date(), createdBy: 'unknown', lastModified: new Date(), lastModifiedBy: 'unknown' },
                          esFavorito: true,
                          esEspecial: false
                        });
                        handleAgregarAlMenu(producto);
                      }}
                      title="Agregar al menú"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-600 p-1"
                      onClick={async () => {
                        console.log('❌ Eliminando favorito desde la sección:', favorito.product_name);
                        try {
                          await removeFavorito(favorito.product_id);
                          toast.success(`${favorito.product_name} eliminado de favoritos del restaurante`);
                        } catch (error) {
                          toast.error('Error al eliminar favorito');
                        }
                      }}
                      title="Quitar de favoritos"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-yellow-700 text-sm">No hay productos en favoritos del restaurante</p>
              <p className="text-yellow-600 text-xs mt-1">Haz clic en el ❤️ de cualquier producto para agregarlo a favoritos</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ TABLA CON SCROLL: Mostrar máximo 4 productos, resto con scroll */}
      <div className="bg-white rounded-lg shadow-sm mx-4">
        <div className="overflow-hidden rounded-lg border border-gray-200" style={{height: '320px', overflow: 'auto'}}>
          {/* Encabezados de la tabla */}
          <div className="grid grid-cols-12 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
            <div className="col-span-2 p-3 text-center">IMAGEN</div>
            <div className="col-span-5 p-3">PRODUCTO</div>
            <div className="col-span-3 p-3 text-center">AGREGAR A MENU DÍA</div>
            <div className="col-span-2 p-3 text-center">ACCIONES</div>
          </div>
          
          {/* Contenido de la tabla - Productos filtrados por categoría seleccionada */}
          <div className="divide-y divide-gray-200">
            {(() => {
              const productosFiltrados = versionedProductosSeleccionados.filter((producto: VersionedProduct) => producto.categoriaId === selectedCategoryTab);
              
              return productosFiltrados.map((producto: VersionedProduct) => (
                <div key={producto.id} className="grid grid-cols-12 items-center py-2 hover:bg-gray-50">
                  {/* Imagen */}
                  <div className="col-span-2 flex justify-center">
                    <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {producto.imagen ? (
                        <img 
                          src={producto.imagen} 
                          alt={producto.nombre} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          <Soup className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="col-span-5 px-3">
                    <div className="font-medium text-sm text-gray-800">{producto.nombre}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</div>
                  </div>
                  
                  {/* Botón de agregar al menú */}
                  <div className="col-span-3 flex justify-center">
                    <button 
                      className="px-3 py-1 bg-[#F4821F] hover:bg-[#E67812] text-white text-xs rounded-md"
                      onClick={() => handleAgregarAlMenu(producto)}
                    >
                      Agregar
                    </button>
                  </div>

                  {/* ✅ ACCIONES ACTUALIZADAS */}
                  <div className="col-span-2 flex justify-center space-x-2">
                    <button 
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={() => handleViewProductDetails(producto)}
                      title="Ver detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${
                        isFavorito(producto.id)
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      onClick={() => handleToggleFavorite(producto)}
                      title={isFavorito(producto.id)
                        ? "Quitar de favoritos del restaurante" 
                        : "Agregar a favoritos del restaurante"
                      }
                      disabled={favoritosLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={
                        isFavorito(producto.id)
                          ? 'currentColor' 
                          : 'none'
                      } viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ));
            })()}
            
            {/* Mostrar mensaje si no hay productos en la categoría seleccionada */}
            {versionedProductosSeleccionados.filter((producto: VersionedProduct) => producto.categoriaId === selectedCategoryTab).length === 0 && versionedProductosSeleccionados.length > 0 && (
              <div className="p-8 text-center text-gray-500">
                <Soup className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">No hay productos en esta categoría</p>
                <p className="text-sm">Selecciona otra categoría o agrega productos a esta sección.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL ACTUALIZADO */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProduct.nombre}</h2>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center items-center">
                {selectedProduct.imagen ? (
                  <img 
                    src={selectedProduct.imagen} 
                    alt={selectedProduct.nombre} 
                    className="max-h-64 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-64 w-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Soup className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Detalles</h3>
                <p className="text-gray-700 mb-4">{selectedProduct.descripcion}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{
                      CATEGORIAS_MENU.find((c: any) => c.id === selectedProduct.categoriaId)?.nombre || 'No especificada'
                    }</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${
                      selectedProduct.stock.status === 'in_stock' ? 'text-green-600' :
                      selectedProduct.stock.status === 'low_stock' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedProduct.stock.status === 'in_stock' ? 'Disponible' :
                       selectedProduct.stock.status === 'low_stock' ? 'Stock bajo' :
                       'No disponible'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad disponible:</span>
                    <span className="font-medium">{selectedProduct.stock.currentQuantity}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <button 
                    className="px-4 py-2 bg-[#F4821F] hover:bg-[#E67812] text-white rounded-md flex-1"
                    onClick={() => {
                      handleAgregarAlMenu(selectedProduct);
                      setShowProductModal(false);
                    }}
                  >
                    Agregar al menú
                  </button>
                  
                  <button 
                    className={`px-4 py-2 rounded-md flex-1 transition-colors ${
                      isFavorito(selectedProduct.id)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => handleToggleFavorite(selectedProduct)}
                    disabled={favoritosLoading}
                  >
                    {isFavorito(selectedProduct.id)
                      ? '❤️ Quitar de favoritos del restaurante'
                      : '🤍 Agregar a favoritos del restaurante'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección "Menu del Día" */}
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
        <MenuDiarioRediseno 
          productos={(() => {
            // ✅ PROTECCIÓN ROBUSTA: Limpiar completamente los datos antes de pasarlos
            const productosLimpios = versionedProductosMenu
              .filter((p: VersionedProduct) => p && p.nombre && p.nombre.trim() && p.nombre.length > 0)
              .map((p: VersionedProduct) => ({
                ...p,
                nombre: p.nombre.trim(), // Eliminar espacios en blanco
                descripcion: p.descripcion ? p.descripcion.trim() : 'Sin descripción'
              }));
            
            return productosLimpios;
          })()}
          categorias={categoriasPostgreSQL}
          onRemoveProduct={handleRemoveFromMenu}
          onUpdateCantidad={(productoId: string, cantidad: number) => {
            const productoOriginal = menuData?.productosMenu?.find((p: Producto) => p.id === productoId);
            if (productoOriginal) {
              const productoActualizado = {
                ...productoOriginal,
                stock: { ...productoOriginal.stock, currentQuantity: cantidad }
              };
              updateProductosMenu(
                menuData.productosMenu.map((p: Producto) => p.id === productoId ? productoActualizado : p)
              );
              toast.success(`Cantidad de ${productoOriginal.nombre} actualizada a ${cantidad}`);
            }
          }}
        />
        <div className="flex justify-between items-center mt-6">
          <div>
            {/* Espacio reservado para futuras funcionalidades */}
          </div>
          
          {/* ✅ BOTONES DE ACCIÓN */}
          <div className="flex space-x-4">
            {/* ✅ BOTÓN LIMPIAR CACHÉ ACTUALIZADO */}
            <Button 
              className="bg-gray-500 hover:bg-gray-600 text-white"
              onClick={limpiarCacheCorrupto}
              variant="outline"
            >
              🧹 Limpiar Caché
            </Button>
            
            <Button 
              className="bg-[#F4821F] hover:bg-[#E67812] text-white"
              onClick={handleMantenerMenu}
              disabled={manteniendoMenu || versionedProductosMenu.length === 0}
            >
              {manteniendoMenu ? 'Guardando...' : 'Mantener Menu'}
            </Button>
            <Button 
              className="bg-[#E67812] hover:bg-[#D56A0F] text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ === BOTÓN PUBLICAR CLICKEADO ===');
                console.log('📊 Estado del botón:', { 
                  publicando, 
                  productosLength: versionedProductosMenu.length,
                  disabled: publicando || versionedProductosMenu.length === 0,
                  productos: versionedProductosMenu.map((p: VersionedProduct) => ({ id: p.id, nombre: p.nombre }))
                });
                
                if (publicando || versionedProductosMenu.length === 0) {
                  console.log('❌ BOTÓN DESHABILITADO - No se ejecuta handlePublicarMenu');
                  return;
                }
                
                console.log('✅ EJECUTANDO handlePublicarMenu...');
                handlePublicarMenu();
              }}
              disabled={publicando || versionedProductosMenu.length === 0}
            >
              {publicando ? 'Publicando...' : 'Publicar Menu'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}