'use client';

import { useState, useEffect } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { Producto } from '@/utils/menuCache.utils';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu, GripVertical, Coffee, Soup, Beef, Salad, Utensils } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

// Componentes
import { MenuDiarioRediseno } from '@/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno';
import ListaProductosRediseno from '@/app/dashboard/carta/components/productos/ListaProductosRediseno';
import { ListaCategoriasRediseno } from '@/app/dashboard/carta/components/categorias/ListaCategoriasRediseno';

/**
 * Función para convertir un Producto a VersionedProduct
 */
const convertToVersionedProduct = (producto: Producto): VersionedProduct => {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoriaId: producto.categoriaId,
    currentVersion: producto.currentVersion,
    priceHistory: producto.priceHistory,
    versions: producto.versions,
    stock: {
      ...producto.stock,
      status: producto.stock.status as 'in_stock' | 'low_stock' | 'out_of_stock',
    },
    status: producto.status as 'active' | 'draft' | 'archived' | 'discontinued',
    metadata: producto.metadata,
    imagen: producto.imagen,
    esFavorito: producto.esFavorito,
    esEspecial: producto.esEspecial
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
    categoriaId: versionedProduct.categoriaId,
    currentVersion: versionedProduct.currentVersion,
    priceHistory: versionedProduct.priceHistory,
    versions: versionedProduct.versions,
    stock: versionedProduct.stock,
    status: versionedProduct.status,
    metadata: versionedProduct.metadata,
    imagen: versionedProduct.imagen,
    esFavorito: versionedProduct.esFavorito,
    esEspecial: versionedProduct.esEspecial
  };
};

export default function MenuDiaPage() {
  // Usar el hook de caché del menú
  const {
    menuData,
    isLoaded,
    updateCategorias,
    updateProductosSeleccionados,
    updateProductosMenu,
    addProductoToMenu,
    removeProductoFromMenu,
    updateSeleccion,
    updateSubmenuActivo,
    hasCache,
    getCacheRemainingTime
  } = useMenuCache();

  // Estado para mostrar indicador de caché
  const [showCacheIndicator, setShowCacheIndicator] = useState(true);
  // Estado para el tiempo restante de caché
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60); // 60 minutos inicialmente
  // Estado para controlar qué categoría está expandida
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para las sugerencias de búsqueda
  const [searchSuggestions, setSearchSuggestions] = useState<VersionedProduct[]>([]);
  // Estado para mostrar/ocultar las sugerencias
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Estado para la pestaña de filtro seleccionada
  const [selectedTab, setSelectedTab] = useState<string>('todas');

  // Efecto para actualizar el tiempo de caché cada minuto
  useEffect(() => {
    // Inicializar el tiempo de caché
    setCacheTimeRemaining(60); // 1 hora = 60 minutos
    
    // Actualizar el tiempo cada minuto
    const interval = setInterval(() => {
      setCacheTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          // Si el tiempo llega a 0, reiniciar los datos
          toast.error('El tiempo de caché ha expirado. Se reiniciarán los datos del menú.');
          // Limpiar el menú
          updateProductosMenu([]);
          return 60; // Reiniciar el contador a 60 minutos
        }
        return prevTime - 1;
      });
    }, 60000); // 60000 ms = 1 minuto
    
    return () => clearInterval(interval);
  }, []);
  
  // Efecto para mostrar notificación si hay datos en caché
  useEffect(() => {
    if (isLoaded && hasCache()) {
      toast.success(
        `Datos cargados desde caché (expira en ${getCacheRemainingTime()} minutos)`,
        { duration: 4000 }
      );
    }
  }, [isLoaded]);

  // Efecto para actualizar el submenú activo
  useEffect(() => {
    updateSubmenuActivo('menu-dia');
  }, []);

  // Manejador para cuando se selecciona una categoría
  const handleCategoriaSeleccionada = (categoriaId: string) => {
    updateSeleccion(categoriaId, null);
    
    // Aquí normalmente cargarías los productos de esta categoría desde la API
    // Pero para este ejemplo, simularemos que ya tenemos los datos
    console.log(`Categoría seleccionada: ${categoriaId}`);
  };

  // Manejador para agregar un producto al menú
  const handleAgregarAlMenu = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    addProductoToMenu(producto);
    toast.success(`${producto.nombre} agregado al menú del día`);
  };

  // Manejador para eliminar un producto del menú
  const handleRemoveFromMenu = (productoId: string) => {
    const producto = menuData.productosMenu.find(p => p.id === productoId);
    if (producto) {
      removeProductoFromMenu(productoId);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    }
  };

  // Manejador para expandir/colapsar una categoría
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  // Convertir productos del menú a VersionedProduct para el componente MenuDiario
  const versionedProductosMenu = menuData.productosMenu.map(convertToVersionedProduct);

  // Convertir productos seleccionados a VersionedProduct para el componente ListaProductos
  const versionedProductosSeleccionados = menuData.productosSeleccionados.map(convertToVersionedProduct);
  
  // Productos se cargan dinámicamente desde los archivos JSON separados por categoría
  const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {};
  
  // Obtener todos los productos disponibles para la búsqueda
  // Los productos se cargan dinámicamente desde los archivos JSON
  const todosLosProductos: VersionedProduct[] = [];
  
  // Efecto para actualizar las sugerencias de búsqueda cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    // Filtrar productos que coincidan con el término de búsqueda
    // Como todosLosProductos está vacío, esto no mostrará sugerencias
    const sugerencias = todosLosProductos.filter(producto => 
      producto.nombre.toLowerCase().includes(term) || 
      producto.descripcion.toLowerCase().includes(term)
    );
    
    setSearchSuggestions(sugerencias);
    setShowSuggestions(sugerencias.length > 0);
  }, [searchTerm]);
  
  // Manejador para seleccionar una sugerencia
  const handleSelectSuggestion = (producto: VersionedProduct) => {
    setSearchTerm(producto.nombre);
    setShowSuggestions(false);
    
    // Expandir la categoría del producto seleccionado
    if (producto.categoriaId) {
      setExpandedCategory(producto.categoriaId);
      setSelectedTab(producto.categoriaId);
    }
  };

  // Categorías para el menú (definición inicial)
  const categoriasList = [
    { id: 'CAT_001', nombre: 'Entradas' },
    { id: 'CAT_002', nombre: 'Principio' },
    { id: 'CAT_003', nombre: 'Proteína' },
    { id: 'CAT_004', nombre: 'Acompañamientos' },
    { id: 'CAT_005', nombre: 'Bebida' }
  ];

  // Función para contar productos por categoría
  const contarProductosPorCategoria = () => {
    // Los conteos se obtienen dinámicamente desde los archivos JSON
    return {
      'CAT_001': 22,
      'CAT_002': 11,
      'CAT_003': 14,
      'CAT_004': 7,
      'CAT_005': 10
    } as Record<string, number>;
  };

  // Obtener conteo de productos por categoría
  const conteoProductos = contarProductosPorCategoria();

  // Categorías para el menú con conteo
  const categorias = categoriasList.map(cat => ({
    ...cat,
    count: conteoProductos[cat.id] || 0
  }));

  return (
    <div className="flex flex-col space-y-4 h-screen bg-gray-50">
      {/* Encabezado principal */}
      <div className="flex justify-between items-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-700">Menu - Almuerzos</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-10 py-2 border border-gray-200 rounded-md w-64 text-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {/* Sugerencias de búsqueda */}
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {searchSuggestions.map((producto) => (
                <div
                  key={producto.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleSelectSuggestion(producto)}
                >
                  {producto.categoriaId === 'CAT_001' && <Soup className="h-4 w-4 text-orange-500 mr-2" />}
                  {producto.categoriaId === 'CAT_002' && <Utensils className="h-4 w-4 text-yellow-500 mr-2" />}
                  {producto.categoriaId === 'CAT_003' && <Beef className="h-4 w-4 text-red-500 mr-2" />}
                  {producto.categoriaId === 'CAT_004' && <Salad className="h-4 w-4 text-green-500 mr-2" />}
                  {producto.categoriaId === 'CAT_005' && <Coffee className="h-4 w-4 text-blue-500 mr-2" />}
                  <div>
                    <div className="text-sm font-medium">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">{producto.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Barra de pestañas de filtro/categorías */}
      <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        
        <div className="flex space-x-4 overflow-x-auto py-2 px-4">
          <button 
            className={`px-3 py-1 font-medium text-sm ${selectedTab === 'todas' 
              ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
              : 'text-gray-700 hover:text-[#F4821F]'}`}
            onClick={() => setSelectedTab('todas')}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button 
              key={cat.id}
              className={`px-3 py-1 text-sm ${selectedTab === cat.id 
                ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
                : 'text-gray-700 hover:text-[#F4821F]'}`}
              onClick={() => {
                setSelectedTab(cat.id);
                setExpandedCategory(cat.id);
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Sección de acordeón/lista de categorías */}
      <div className="space-y-1">
        {categorias
          .filter(categoria => selectedTab === 'todas' || selectedTab === categoria.id)
          .map((categoria) => (
            <div key={categoria.id} className="border-b border-gray-200 bg-white">
              <div 
                className="flex items-center justify-between py-3 px-4 cursor-pointer"
                onClick={() => toggleCategory(categoria.id)}
              >
                <div className="flex items-center space-x-3">
                  <Menu className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm">{categoria.nombre}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{categoria.count}</span>
                  {expandedCategory === categoria.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedCategory === categoria.id && (
                <div className="px-4 py-3 bg-gray-50">
                  <ListaProductosRediseno 
                    restauranteId="default"
                    categoriaId={categoria.id}
                    subcategoriaId={null}
                    productosSeleccionados={versionedProductosSeleccionados.filter(p => p.categoriaId === categoria.id)}
                    productosMenu={versionedProductosMenu}
                    onAddToMenu={handleAgregarAlMenu}
                    onRemoveFromMenu={handleRemoveFromMenu}
                    onProductSelect={(producto: VersionedProduct) => {
                      console.log('Producto seleccionado:', producto);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Sección "Menu del Día" - Asegurando que ocupe al menos el 35% de la altura */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex-grow min-h-[35%]">
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
          productos={versionedProductosMenu}
          onRemoveProduct={handleRemoveFromMenu}
          onUpdateCantidad={(productoId: string, cantidad: number) => {
            // Buscar el producto en el menú
            const producto = menuData.productosMenu.find(p => p.id === productoId);
            if (producto) {
              // Actualizar la cantidad del producto
              const productoActualizado = {
                ...producto,
                stock: {
                  ...producto.stock,
                  currentQuantity: cantidad
                }
              };
              
              // Actualizar el menú
              const nuevosProductos = menuData.productosMenu.map(p => 
                p.id === productoId ? productoActualizado : p
              );
              
              // Actualizar el estado
              updateProductosMenu(nuevosProductos);
              
              // Mostrar notificación
              toast.success(`Cantidad de ${producto.nombre} actualizada a ${cantidad}`);
            }
          }}
        />
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button 
            className="bg-[#F4821F] hover:bg-[#E67812] text-white"
          >
            Mantener Menu
          </Button>
          <Button 
            className="bg-[#E67812] hover:bg-[#D56A0F] text-white"
          >
            Publicar Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
