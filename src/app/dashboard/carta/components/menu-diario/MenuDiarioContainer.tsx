// src/app/dashboard/carta/components/menu-diario/MenuDiarioContainer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { Producto } from '@/utils/menuCache.utils';
import { toast } from 'react-hot-toast';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';

// Componentes
import { MenuDiario } from './MenuDiario';
import { ListaCategorias } from '../categorias/ListaCategorias';
import ListaProductos from '../productos/ListaProductos';

/**
 * Función para convertir un Producto a VersionedProduct
 */
const convertToVersionedProduct = (producto: Producto): VersionedProduct => {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    currentPrice: producto.precio,
    categoriaId: producto.categoriaId,
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      ...producto.stock,
      status: producto.stock.status as 'in_stock' | 'low_stock' | 'out_of_stock',
    },
    status: producto.status as 'active' | 'draft' | 'archived' | 'discontinued',
    metadata: producto.metadata
  };
};

/**
 * Función para convertir un VersionedProduct a Producto
 */
const convertToProducto = (versionedProduct: VersionedProduct): Producto => {
  return {
    id: versionedProduct.id,
    nombre: versionedProduct.nombre,
    descripcion: versionedProduct.descripcion,
    precio: versionedProduct.currentPrice,
    categoriaId: versionedProduct.categoriaId,
    currentVersion: versionedProduct.currentVersion,
    priceHistory: versionedProduct.priceHistory,
    versions: versionedProduct.versions,
    stock: versionedProduct.stock,
    status: versionedProduct.status,
    metadata: versionedProduct.metadata
  };
};

/**
 * Contenedor principal para la página de creación de menú diario
 * Implementa el caché para mantener el estado entre navegaciones
 */
const MenuDiarioContainer = () => {
  // Usar el hook de caché del menú
  const {
    menuData,
    isLoaded,
    updateCategorias,
    updateProductosSeleccionados,
    updateProductosMenu,
    updateProductosFavoritos,
    updateProductosEspeciales,
    addProductoToMenu,
    addProductoToFavoritos,
    addProductoToEspeciales,
    removeProductoFromMenu,
    removeProductoFromFavoritos,
    removeProductoFromEspeciales,
    updateSeleccion,
    updateSubmenuActivo,
    hasCache,
    getCacheRemainingTime
  } = useMenuCache();

  // Estado para mostrar indicador de caché
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);
  
  // Estado local para el valor de la pestaña activa
  const [activeTab, setActiveTab] = useState<'menu-dia' | 'favoritos' | 'especiales'>(menuData.submenuActivo);

  // Efecto para mostrar notificación si hay datos en caché
  useEffect(() => {
    if (isLoaded && hasCache()) {
      const remainingMinutes = getCacheRemainingTime();
      toast.success(
        `Datos cargados desde caché (expira en ${remainingMinutes} minutos)`,
        { duration: 4000 }
      );
      setShowCacheIndicator(true);
      
      // Ocultar el indicador después de 5 segundos
      const timer = setTimeout(() => {
        setShowCacheIndicator(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Efecto para actualizar el estado local cuando cambia el submenu activo en menuData
  useEffect(() => {
    setActiveTab(menuData.submenuActivo);
  }, [menuData.submenuActivo]);

  // Manejador para cuando se selecciona una categoría
  const handleCategoriaSeleccionada = (categoriaId: string, subcategoriaId: string | null = null) => {
    updateSeleccion(categoriaId, subcategoriaId);
    
    // Aquí normalmente cargarías los productos de esta categoría desde la API
    // Pero para este ejemplo, simularemos que ya tenemos los datos
    console.log(`Categoría seleccionada: ${categoriaId}, Subcategoría: ${subcategoriaId || 'ninguna'}`);
  };

  // Manejador para cambiar el submenú activo
  const handleSubmenuChange = (submenu: 'menu-dia' | 'favoritos' | 'especiales') => {
    setActiveTab(submenu);
    updateSubmenuActivo(submenu);
  };

  // Manejador para agregar un producto al menú activo
  const handleAgregarProducto = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    
    switch (menuData.submenuActivo) {
      case 'menu-dia':
        addProductoToMenu(producto);
        toast.success(`${producto.nombre} agregado al menú del día`);
        break;
      case 'favoritos':
        addProductoToFavoritos(producto);
        toast.success(`${producto.nombre} agregado a favoritos`);
        break;
      case 'especiales':
        addProductoToEspeciales(producto);
        toast.success(`${producto.nombre} agregado a especiales`);
        break;
    }
  };

  // Manejador para eliminar un producto del menú activo
  const handleRemoveProducto = (productoId: string) => {
    let producto: Producto | undefined;
    
    switch (menuData.submenuActivo) {
      case 'menu-dia':
        producto = menuData.productosMenu.find(p => p.id === productoId);
        if (producto) {
          removeProductoFromMenu(productoId);
          toast.success(`${producto.nombre} eliminado del menú del día`);
        }
        break;
      case 'favoritos':
        producto = menuData.productosFavoritos.find(p => p.id === productoId);
        if (producto) {
          removeProductoFromFavoritos(productoId);
          toast.success(`${producto.nombre} eliminado de favoritos`);
        }
        break;
      case 'especiales':
        producto = menuData.productosEspeciales.find(p => p.id === productoId);
        if (producto) {
          removeProductoFromEspeciales(productoId);
          toast.success(`${producto.nombre} eliminado de especiales`);
        }
        break;
    }
  };

  // Obtener los productos del submenú activo
  const getProductosActivos = () => {
    switch (menuData.submenuActivo) {
      case 'menu-dia':
        return menuData.productosMenu;
      case 'favoritos':
        return menuData.productosFavoritos;
      case 'especiales':
        return menuData.productosEspeciales;
      default:
        return menuData.productosMenu;
    }
  };

  // Convertir productos a VersionedProduct para los componentes
  const versionedProductosActivos = getProductosActivos().map(convertToVersionedProduct);
  const versionedProductosSeleccionados = menuData.productosSeleccionados.map(convertToVersionedProduct);

  return (
    <div className="flex flex-col space-y-4">
      {/* Indicador de caché */}
      {showCacheIndicator && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          <span>
            Usando datos guardados en caché. Expira en {getCacheRemainingTime()} minutos.
          </span>
        </div>
      )}

      {/* Tabs para seleccionar el submenú */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => handleSubmenuChange(value as 'menu-dia' | 'favoritos' | 'especiales')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="menu-dia">Menú del Día</TabsTrigger>
          <TabsTrigger value="favoritos">Platos Favoritos</TabsTrigger>
          <TabsTrigger value="especiales">Platos Especiales</TabsTrigger>
        </TabsList>

        <TabsContent value="menu-dia" className="mt-0">
          {/* Contenedor principal de 3 columnas */}
          <div className="grid grid-cols-12 gap-6">
            {/* Columna de Categorías */}
            <div className="col-span-2">
              <ListaCategorias 
                categorias={menuData.categorias}
                categoriaSeleccionada={menuData.categoriaSeleccionada}
                subcategoriaSeleccionada={menuData.subcategoriaSeleccionada}
                onSelectCategoria={handleCategoriaSeleccionada}
                onSelectSubcategoria={(subcategoriaId, parentId) => handleCategoriaSeleccionada(parentId, subcategoriaId)}
                onAddCategoria={(categoria) => {
                  updateCategorias([...menuData.categorias, categoria]);
                }}
              />
            </div>

            {/* Columna de Productos */}
            <div className="col-span-4">
              <ListaProductos 
                restauranteId="default"
                categoriaId={menuData.categoriaSeleccionada || undefined}
                subcategoriaId={menuData.subcategoriaSeleccionada || undefined}
                productosSeleccionados={versionedProductosSeleccionados}
                onAddToMenu={handleAgregarProducto}
                onProductSelect={(producto) => {
                  // Aquí manejaríamos la selección de un producto para agregarlo a la lista
                  console.log('Producto seleccionado:', producto);
                }}
              />
            </div>

            {/* Columna de Menú del Día */}
            <div className="col-span-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-[#F4821F]">Menú del Día</h2>
                <MenuDiario 
                  productos={versionedProductosActivos}
                  onRemoveProduct={handleRemoveProducto}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favoritos" className="mt-0">
          {/* Contenedor principal de 3 columnas */}
          <div className="grid grid-cols-12 gap-6">
            {/* Columna de Categorías */}
            <div className="col-span-2">
              <ListaCategorias 
                categorias={menuData.categorias}
                categoriaSeleccionada={menuData.categoriaSeleccionada}
                subcategoriaSeleccionada={menuData.subcategoriaSeleccionada}
                onSelectCategoria={handleCategoriaSeleccionada}
                onSelectSubcategoria={(subcategoriaId, parentId) => handleCategoriaSeleccionada(parentId, subcategoriaId)}
                onAddCategoria={(categoria) => {
                  updateCategorias([...menuData.categorias, categoria]);
                }}
              />
            </div>

            {/* Columna de Productos */}
            <div className="col-span-4">
              <ListaProductos 
                restauranteId="default"
                categoriaId={menuData.categoriaSeleccionada || undefined}
                subcategoriaId={menuData.subcategoriaSeleccionada || undefined}
                productosSeleccionados={versionedProductosSeleccionados}
                onAddToMenu={handleAgregarProducto}
                onProductSelect={(producto) => {
                  // Aquí manejaríamos la selección de un producto para agregarlo a la lista
                  console.log('Producto seleccionado:', producto);
                }}
              />
            </div>

            {/* Columna de Platos Favoritos */}
            <div className="col-span-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-[#F4821F]">Platos Favoritos</h2>
                <MenuDiario 
                  productos={versionedProductosActivos}
                  onRemoveProduct={handleRemoveProducto}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="especiales" className="mt-0">
          {/* Contenedor principal de 3 columnas */}
          <div className="grid grid-cols-12 gap-6">
            {/* Columna de Categorías */}
            <div className="col-span-2">
              <ListaCategorias 
                categorias={menuData.categorias}
                categoriaSeleccionada={menuData.categoriaSeleccionada}
                subcategoriaSeleccionada={menuData.subcategoriaSeleccionada}
                onSelectCategoria={handleCategoriaSeleccionada}
                onSelectSubcategoria={(subcategoriaId, parentId) => handleCategoriaSeleccionada(parentId, subcategoriaId)}
                onAddCategoria={(categoria) => {
                  updateCategorias([...menuData.categorias, categoria]);
                }}
              />
            </div>

            {/* Columna de Productos */}
            <div className="col-span-4">
              <ListaProductos 
                restauranteId="default"
                categoriaId={menuData.categoriaSeleccionada || undefined}
                subcategoriaId={menuData.subcategoriaSeleccionada || undefined}
                productosSeleccionados={versionedProductosSeleccionados}
                onAddToMenu={handleAgregarProducto}
                onProductSelect={(producto) => {
                  // Aquí manejaríamos la selección de un producto para agregarlo a la lista
                  console.log('Producto seleccionado:', producto);
                }}
              />
            </div>

            {/* Columna de Platos Especiales */}
            <div className="col-span-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-[#F4821F]">Platos Especiales</h2>
                <MenuDiario 
                  productos={versionedProductosActivos}
                  onRemoveProduct={handleRemoveProducto}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MenuDiarioContainer;
