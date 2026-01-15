'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';
import { useMenuDiaData } from './hooks/useMenuDiaData';
import { CATEGORIAS_MENU_CONFIG } from './types/menu-dia.types';
import type { Producto } from './types/menu-dia.types';
import { validarYLimpiarProductos } from './utils/menu-dia.utils';
import { Plus, ChevronLeft, ChevronRight, Check, X, Search, Filter, Heart, Star, Grid } from 'lucide-react';
import { toast } from 'sonner';

// ✅ TIPO LOCAL PARA COMBINACIONES DEL MENÚ
interface MenuCombinacion {
  id: string;
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precio?: number;
  disponible?: boolean;
  imagen?: string;
  productos?: Producto[];
  // Nuevos campos para compatibilidad con CombinacionesPage
  entrada?: Producto;
  principio?: Producto;
  proteina?: Producto;
  acompanamiento?: Producto[];
  bebida?: Producto;
  favorito?: boolean;
  especial?: boolean;
  cantidad?: number;
  precioBase?: number;
  precioEspecial?: number | null;
  programacion?: any[];
  fechaCreacion?: string;
}

export default function MenuDiaPage() {
  // ✅ TÍTULO DE LA PÁGINA
  useSetPageTitle('Menú del Día', 'Configuración del menú diario del restaurante');

  // ✅ ESTADOS PRINCIPALES SIMPLIFICADOS
  const [currentView, setCurrentView] = useState<'creation' | 'combinations'>('creation');
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{[categoryId: string]: Producto[]}>({});
  const [menuCombinations, setMenuCombinations] = useState<MenuCombinacion[]>([]);
  const [filters, setFilters] = useState({
    favorites: false,
    specials: false,
    category: 'all'
  });

  // Estados adicionales para configuración final
  const [proteinQuantities, setProteinQuantities] = useState<{[productId: string]: number}>({});
  const [menuPrice, setMenuPrice] = useState<number>(15000);

  // ✅ FUNCIONES ESTABLES PARA EVITAR LOOP INFINITO
  const updateProductosMenu = useCallback((productos: Producto[]) => {
    setSelectedProducts(prev => ({ ...prev, menu: productos }));
  }, []);

  const updateProductosSeleccionados = useCallback(() => {
    // Lógica para actualizar productos seleccionados
  }, []);

  // ✅ FUNCIÓN PARA OBTENER ICONOS BASADO EN EL NOMBRE DE CATEGORÍA
  const getIconForCategory = (nombre?: string, isLastStep?: boolean) => {
    if (isLastStep) return '⚙️';
    
    switch (nombre) {
      case 'Entradas': return '🥗';
      case 'Principios': return '🍚';
      case 'Proteínas': return '🍗';
      case 'Acompañamientos': return '🥔';
      case 'Bebidas': return '🥤';
      default: return '🍽️';
    }
  };

  // ✅ HOOK DE DATOS
  const {
    restaurantId,
    userId,
    productosDB,
    loadingDB,
    errorDB
  } = useMenuDiaData(updateProductosMenu, updateProductosSeleccionados);

  // ✅ PRODUCTOS ORGANIZADOS POR CATEGORÍA
  const [productosPorCategoria, setProductosPorCategoria] = useState<{
    [categoryId: string]: Producto[]
  }>({});

  // ✅ EFECTO PARA TECLA ESC Y BLOQUEAR SCROLL
  useEffect(() => {
    if (showSlideOver) {
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeSlideOver();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [showSlideOver]);

  // ✅ PROCESAR PRODUCTOS CUANDO SE CARGAN
  useEffect(() => {
    if (productosDB && productosDB.length > 0) {
      const productosLimpios = validarYLimpiarProductos(productosDB);
      
      const organizados = CATEGORIAS_MENU_CONFIG.reduce((acc, categoria) => {
        acc[categoria.id] = productosLimpios.filter(producto => {
          // Mapeo flexible de categorías
          const categoryMapping: {[key: string]: string[]} = {
            'entradas': ['entrada', 'entradas', 'appetizer', 'starter'],
            'principios': ['principio', 'principales', 'main', 'plato principal'],
            'proteinas': ['proteina', 'proteinas', 'protein', 'carne', 'pollo', 'pescado'],
            'acompanamientos': ['acompanamiento', 'acompanamientos', 'side', 'guarnicion'],
            'bebidas': ['bebida', 'bebidas', 'drink', 'beverage']
          };
          
          const expectedCategories = categoryMapping[categoria.id] || [categoria.id];
          const productCategory = (producto.categoriaId || '').toLowerCase();
          
          if (!productCategory) return true; // Mostrar en todas si no tiene categoría
          
          return expectedCategories.some(expectedCat => 
            productCategory.includes(expectedCat.toLowerCase()) ||
            expectedCat.toLowerCase().includes(productCategory)
          );
        });
        return acc;
      }, {} as { [categoryId: string]: Producto[] });

      setProductosPorCategoria(organizados);
    }
  }, [productosDB]);

  // ✅ FUNCIONES DEL SLIDE-OVER CON ANIMACIÓN SUAVE
  const openSlideOver = () => {
    setShowSlideOver(true);
    setTimeout(() => setIsAnimating(true), 50);
  };

  const closeSlideOver = () => {
    setIsAnimating(false);
    setTimeout(() => setShowSlideOver(false), 300);
  };

  // ✅ CATEGORÍA ACTUAL Y PRODUCTOS FILTRADOS
  const currentCategory = currentStep < CATEGORIAS_MENU_CONFIG.length ? CATEGORIAS_MENU_CONFIG[currentStep] : null;
  const isLastStep = currentStep === 5; // DIRECTO AL PASO 6 (índice 5)
  const categoryProducts = !isLastStep && currentCategory ? (productosPorCategoria[currentCategory.id] || []) : [];
  const selectedInCategory = !isLastStep && currentCategory ? (selectedProducts[currentCategory.id] || []) : [];

  const getFilteredProducts = useCallback(() => {
    // Si estamos en el último paso (configuración final)
    if (isLastStep || !currentCategory) {
      return [];
    }
    
    return categoryProducts.filter(producto => {
      const matchesSearch = searchTerm === '' || 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !filters.favorites || producto.esFavorito;
      const matchesSpecials = !filters.specials || producto.esEspecial;
      
      return matchesSearch && matchesFavorites && matchesSpecials;
    });
  }, [categoryProducts, currentCategory, searchTerm, filters, isLastStep]);

  const filteredProducts = getFilteredProducts();

  // ✅ FUNCIÓN PARA GENERAR COMBINACIONES - CORREGIDA CON NOMBRES EXACTOS
  const generateCombinations = useCallback(() => {
    const combinations: MenuCombinacion[] = [];
    
    console.log('=== DEBUG GENERACIÓN COMBINACIONES ===');
    console.log('CATEGORIAS_MENU_CONFIG:', CATEGORIAS_MENU_CONFIG);
    console.log('selectedProducts:', selectedProducts);
    
    // ✅ USAR NOMBRES EXACTOS DE LAS CATEGORÍAS
    const entradasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Entradas');
    const principiosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Principios');
    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
    const acompañamientosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Acompañamientos');
    const bebidasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Bebidas');
    
    console.log('Categorías encontradas:');
    console.log('entradasCategory:', entradasCategory);
    console.log('principiosCategory:', principiosCategory);
    console.log('proteinasCategory:', proteinasCategory);
    console.log('acompañamientosCategory:', acompañamientosCategory);
    console.log('bebidasCategory:', bebidasCategory);
    
    // Extraer productos usando los IDs reales de las categorías
    const entradas = entradasCategory ? (selectedProducts[entradasCategory.id] || []) : [];
    const principios = principiosCategory ? (selectedProducts[principiosCategory.id] || []) : [];
    const proteinas = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
    const acompanamientos = acompañamientosCategory ? (selectedProducts[acompañamientosCategory.id] || []) : [];
    const bebidas = bebidasCategory ? (selectedProducts[bebidasCategory.id] || []) : [];
    
    // 🔍 DEBUG para verificar productos encontrados
    console.log('Productos extraídos:');
    console.log('Entradas encontradas:', entradas.length, entradas.map(p => p.nombre));
    console.log('Principios encontrados:', principios.length, principios.map(p => p.nombre));
    console.log('Proteínas encontradas:', proteinas.length, proteinas.map(p => p.nombre));
    console.log('Acompañamientos encontrados:', acompanamientos.length, acompanamientos.map(p => p.nombre));
    console.log('Bebidas encontradas:', bebidas.length, bebidas.map(p => p.nombre));
    
    // Validar que tenemos principios y proteínas para combinar
    if (principios.length === 0 || proteinas.length === 0) {
      console.warn('❌ No hay principios o proteínas para combinar');
      console.warn(`Principios: ${principios.length}, Proteínas: ${proteinas.length}`);
      return [];
    }
    
    // Solo combinar principios × proteínas
    principios.forEach(principio => {
      proteinas.forEach(proteina => {
        combinations.push({
          id: `combo-${principio.id}-${proteina.id}`,
          nombre: `Menú ${proteina.nombre} con ${principio.nombre}`,
          descripcion: `Incluye todas las entradas seleccionadas, ${principio.nombre}, ${proteina.nombre}, todos los acompañamientos y bebidas disponibles`,
          
          // Productos individuales (para compatibilidad con componentes existentes)
          productos: [principio, proteina],
          
          // Estructura real como en CombinacionesPage
          entrada: entradas.length > 0 ? entradas[0] : undefined,
          principio: principio,
          proteina: proteina,
          acompanamiento: acompanamientos, // Todos los acompañamientos
          bebida: bebidas.length > 0 ? bebidas[0] : undefined,
          
          // Configuración
          favorito: false,
          especial: false,
          cantidad: proteinQuantities[proteina.id] || 10,
          precioBase: menuPrice,
          precioEspecial: null,
          programacion: [],
          fechaCreacion: new Date().toISOString(),
          disponible: true,
          categoria: 'menu-dia',
          precio: menuPrice // Para compatibilidad con vista anterior
        });
      });
    });
    
    console.log(`✅ Generadas ${combinations.length} combinaciones (${principios.length} principios × ${proteinas.length} proteínas)`);
    return combinations;
  }, [selectedProducts, menuPrice, proteinQuantities]);

  // ✅ FUNCIÓN PARA SELECCIONAR/DESELECCIONAR PRODUCTOS
  const handleProductSelect = useCallback((producto: Producto) => {
    if (!currentCategory || isLastStep) return;
    
    const categoryId = currentCategory.id;
    setSelectedProducts(prev => {
      const categoryProducts = prev[categoryId] || [];
      const isSelected = categoryProducts.some(p => p.id === producto.id);
      
      if (isSelected) {
        return {
          ...prev,
          [categoryId]: categoryProducts.filter(p => p.id !== producto.id)
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...categoryProducts, producto]
        };
      }
    });
  }, [currentCategory, isLastStep]);

  // ✅ FUNCIONES DE NAVEGACIÓN
  const handleNextStep = useCallback(() => {
    if (currentStep < 5) { // Solo permitir hasta el paso 6 (índice 5)
      setCurrentStep(currentStep + 1);
      setSearchTerm('');
    } else {
      // Finalizar creación y generar combinaciones
      const combinations = generateCombinations();
      setMenuCombinations(combinations);
      setCurrentView('combinations');
      closeSlideOver();
      toast.success('Menú del día creado exitosamente');
    }
  }, [currentStep, generateCombinations]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSearchTerm('');
    }
  }, [currentStep]);

  const handleCreateNewMenu = useCallback(() => {
    setCurrentView('creation');
    setCurrentStep(0);
    setSelectedProducts({});
    setMenuCombinations([]);
    openSlideOver();
  }, []);

  // ✅ LOADING STATE
  if (loadingDB) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (errorDB) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-gray-600">Error al cargar datos: {errorDB}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ✅ HEADER MEJORADO */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-3">
            {currentView === 'combinations' && (
              <button
                onClick={handleCreateNewMenu}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Nuevo Menú
              </button>
            )}
          </div>
        </div>

        {/* ✅ NAVEGACIÓN POR PESTAÑAS */}
        <div className="mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1 max-w-sm">
            <button
              onClick={() => setCurrentView('creation')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                currentView === 'creation' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Menú del Día
            </button>
            <button
              onClick={() => setCurrentView('combinations')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                currentView === 'combinations' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Combinaciones
            </button>
          </div>
        </div>

        {/* ✅ VISTA DE CREACIÓN CON TABLA DE PRODUCTOS SELECCIONADOS */}
        {currentView === 'creation' && (
          <div className="space-y-6">
            {/* Header con botón para crear menú */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Productos Seleccionados para el Menú
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {Object.values(selectedProducts).flat().length > 0 
                      ? `${Object.values(selectedProducts).flat().length} productos seleccionados para el menú del día`
                      : 'No hay productos seleccionados. Crea un menú para comenzar.'
                    }
                  </p>
                </div>
                <button
                  onClick={openSlideOver}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {Object.values(selectedProducts).flat().length > 0 ? 'Editar Menú' : 'Crear Menú del Día'}
                </button>
              </div>
            </div>

            {/* Tabla de productos seleccionados */}
            {Object.values(selectedProducts).flat().length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría del Menú
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(selectedProducts).map(([categoryId, productos]) =>
                        productos.map((producto) => {
                          const categoryName = CATEGORIAS_MENU_CONFIG.find(cat => cat.id === categoryId)?.nombre || categoryId;
                          
                          return (
                            <tr key={`${categoryId}-${producto.id}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-600">
                                        {(producto.nombre || 'P').charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {producto.nombre || 'Producto sin nombre'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {producto.descripcion || 'Sin descripción'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {categoryName}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => {
                                    // Remover producto de la selección
                                    setSelectedProducts(prev => ({
                                      ...prev,
                                      [categoryId]: prev[categoryId]?.filter(p => p.id !== producto.id) || []
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No hay productos seleccionados
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Usa el wizard para seleccionar productos de cada categoría y crear tu menú del día.
                  </p>
                  <button
                    onClick={openSlideOver}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Menú del Día
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ VISTA DE COMBINACIONES */}
        {currentView === 'combinations' && (
          <div className="space-y-6">
            {/* Filtros mejorados */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar combinaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                    className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                      filters.favorites
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${filters.favorites ? 'fill-current' : ''}`} />
                    Favoritos
                  </button>
                  
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, specials: !prev.specials }))}
                    className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                      filters.specials
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Star className={`w-4 h-4 mr-2 ${filters.specials ? 'fill-current' : ''}`} />
                    Especiales
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido de Combinaciones */}
            {menuCombinations.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Grid className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No hay combinaciones disponibles
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Crea un menú del día para generar combinaciones automáticamente.
                  </p>
                  <button
                    onClick={handleCreateNewMenu}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Primer Menú
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
                  {menuCombinations.map((combo, index) => (
                    <div key={combo.id} className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                      combo.disponible ? 'bg-white' : 'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">
                            {combo.nombre || `Combinación #${index + 1}`}
                          </h3>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded text-gray-400 hover:text-blue-600 transition-colors">
                              <Heart className="h-5 w-5" />
                            </button>
                            <button className="p-1 hover:bg-yellow-100 rounded text-gray-400 hover:text-yellow-600 transition-colors">
                              <Star className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">{combo.descripcion || 'Combinación del menú del día'}</p>
                          
                          {/* Mostrar productos de la combinación */}
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Incluye:</p>
                            {combo.entrada && <p className="text-gray-600">• {combo.entrada.nombre}</p>}
                            {combo.principio && <p className="text-gray-600">• {combo.principio.nombre}</p>}
                            {combo.proteina && <p className="text-gray-600">• {combo.proteina.nombre}</p>}
                            {combo.acompanamiento && combo.acompanamiento.length > 0 && 
                              combo.acompanamiento.map((acomp, idx) => (
                                <p key={idx} className="text-gray-600">• {acomp.nombre}</p>
                              ))
                            }
                            {combo.bebida && <p className="text-gray-600">• {combo.bebida.nombre}</p>}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              ${(combo.precio || combo.precioBase || 0).toLocaleString()}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {combo.categoria}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex justify-between items-center">
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              combo.disponible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {combo.disponible ? 'Disponible' : 'No disponible'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                              Editar
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ SLIDE-OVER MEJORADO CON ANIMACIONES SUAVES */}
        {showSlideOver && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div 
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ease-out ${
                isAnimating ? 'opacity-100' : 'opacity-0'
              }`} 
              onClick={closeSlideOver} 
            />
            <div className={`
              absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl
              transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
            `}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isLastStep 
                        ? '⚙️ Configuración Final' 
                        : `${getIconForCategory(currentCategory?.nombre, false)} ${currentCategory?.nombre}`
                      }
                    </h2>
                  </div>
                  <button
                    onClick={closeSlideOver}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search - Solo mostrar si NO es último paso */}
                {!isLastStep && currentCategory && (
                  <div className="p-6 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder={`Buscar ${currentCategory.nombre.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {loadingDB ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Cargando productos...</p>
                    </div>
                  ) : isLastStep ? (
                    // ✅ PASO 6: CONFIGURACIÓN FINAL CON VISTA PREVIA CORREGIDA
                    <div className="p-6 space-y-6">
                      {/* Configuración de cantidades de proteínas */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">
                          🍖 Cantidades de Proteínas
                        </h3>
                        <p className="text-sm text-green-700 mb-4">
                          Define cuántas unidades de cada proteína estarán disponibles en el menú del día.
                        </p>
                        
                        {(() => {
                          // Buscar productos de proteínas usando nombre de categoría
                          const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
                          const proteinProducts = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
                          
                          return proteinProducts?.length > 0 ? (
                            <div className="space-y-4">
                              {proteinProducts.map((proteina) => (
                                <div key={proteina.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{proteina.nombre}</h4>
                                    <p className="text-sm text-gray-600">{proteina.descripcion}</p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">Cantidad:</span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          const currentQty = proteinQuantities[proteina.id] || 10;
                                          if (currentQty > 1) {
                                            setProteinQuantities(prev => ({
                                              ...prev,
                                              [proteina.id]: currentQty - 1
                                            }));
                                          }
                                        }}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                      >
                                        -
                                      </button>
                                      <span className="w-12 text-center font-medium">
                                        {proteinQuantities[proteina.id] || 10}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const currentQty = proteinQuantities[proteina.id] || 10;
                                          setProteinQuantities(prev => ({
                                            ...prev,
                                            [proteina.id]: currentQty + 1
                                          }));
                                        }}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No hay proteínas seleccionadas. Regresa al paso anterior para seleccionar proteínas.
                            </p>
                          );
                        })()}
                      </div>

                      {/* Configuración del precio del menú */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                          💰 Precio del Menú del Día
                        </h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Define el precio unificado que se aplicará a todas las combinaciones del menú.
                        </p>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio por menú (COP)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={menuPrice}
                              onChange={(e) => setMenuPrice(parseInt(e.target.value) || 0)}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="15000"
                              min="0"
                              step="1000"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Precio sugerido: $15,000 - $25,000 COP
                          </p>
                        </div>
                      </div>

                      {/* Vista previa de combinaciones - CON DEBUG DETALLADO */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          🍽️ Vista Previa de Combinaciones
                        </h3>
                        
                        {(() => {
                          // 🔍 DEBUG DETALLADO PARA IDENTIFICAR EL PROBLEMA
                          console.log('=== DEBUG DETALLADO ===');
                          console.log('CATEGORIAS_MENU_CONFIG completo:', CATEGORIAS_MENU_CONFIG);
                          
                          // Mostrar todas las categorías disponibles
                          CATEGORIAS_MENU_CONFIG.forEach((cat, index) => {
                            console.log(`Categoría ${index}:`, {
                              id: cat.id,
                              nombre: cat.nombre,
                              productosSeleccionados: selectedProducts[cat.id]?.length || 0,
                              productos: selectedProducts[cat.id]?.map(p => p.nombre) || []
                            });
                          });
                          
                          // ✅ USAR NOMBRES EXACTOS SEGÚN TYPESCRIPT
                          const principiosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Principios');
                          const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
                          
                          console.log('Búsquedas con nombres exactos:');
                          console.log('principiosCategory:', principiosCategory);
                          console.log('proteinasCategory:', proteinasCategory);
                          
                          const principios = principiosCategory ? (selectedProducts[principiosCategory.id] || []) : [];
                          const proteinas = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
                          
                          console.log('Productos finales encontrados:');
                          console.log('Principios:', principios.length, principios.map(p => p.nombre));
                          console.log('Proteínas:', proteinas.length, proteinas.map(p => p.nombre));
                          
                          const totalCombinaciones = principios.length * proteinas.length;
                          
                          if (totalCombinaciones === 0) {
                            return (
                              <div className="space-y-3">
                                <p className="text-sm text-red-600">
                                  ⚠️ Necesitas seleccionar al menos 1 principio y 1 proteína para generar combinaciones.
                                </p>
                                {/* Mostrar debug en pantalla para ayudar */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                                  <p className="font-semibold text-yellow-800 mb-2">Debug Info:</p>
                                  <p className="text-yellow-700">Total categorías: {CATEGORIAS_MENU_CONFIG.length}</p>
                                  <p className="text-yellow-700">Categorías con productos:</p>
                                  {CATEGORIAS_MENU_CONFIG.map(cat => (
                                    <p key={cat.id} className="text-yellow-700 ml-2">
                                      • {cat.nombre}: {selectedProducts[cat.id]?.length || 0} productos
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-700">
                                Se generarán <strong>{totalCombinaciones} combinaciones</strong> combinando:
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="font-medium text-gray-800 mb-1">Principios ({principios.length}):</p>
                                  <ul className="space-y-1">
                                    {principios.map(p => (
                                      <li key={p.id} className="text-gray-600">• {p.nombre}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <p className="font-medium text-gray-800 mb-1">Proteínas ({proteinas.length}):</p>
                                  <ul className="space-y-1">
                                    {proteinas.map(p => (
                                      <li key={p.id} className="text-gray-600">• {p.nombre}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                                <p className="text-xs text-blue-800">
                                  <strong>Nota:</strong> Las entradas, acompañamientos y bebidas seleccionadas serán las mismas para todas las combinaciones.
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : !currentCategory ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>Error: Categoría no encontrada</p>
                    </div>
                  ) : (
                    // ✅ PASOS 1-5: SELECCIÓN DE PRODUCTOS CON MEJORES ESPACIOS
                    <div className="p-4 space-y-4">
                      {/* Lista de productos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {currentCategory.nombre} disponibles ({filteredProducts.length})
                        </label>
                        
                        {filteredProducts.length > 0 ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                            <div className="space-y-2">
                              {filteredProducts.map((producto) => {
                                const isSelected = selectedInCategory.some(p => p.id === producto.id);
                                
                                return (
                                  <div
                                    key={producto.id}
                                    onClick={() => handleProductSelect(producto)}
                                    className={`
                                      flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200
                                      ${isSelected 
                                        ? 'bg-green-100 border border-green-300' 
                                        : 'bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center text-xs
                                        ${isSelected ? 'bg-green-200 text-green-600' : 'bg-gray-100 text-gray-400'}
                                      `}>
                                        {isSelected ? '✓' : 'IMG'}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm">{producto.nombre}</h4>
                                        {producto.descripcion && (
                                          <p className="text-xs text-gray-500 mt-1 truncate">{producto.descripcion}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center ml-2">
                                      {isSelected ? (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      ) : (
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-gray-500 text-sm">No hay {currentCategory.nombre.toLowerCase()} disponibles</p>
                          </div>
                        )}
                      </div>

                      {/* Productos seleccionados */}
                      {selectedInCategory.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionadas ({selectedInCategory.length})
                          </label>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {selectedInCategory.map((producto) => (
                              <div
                                key={producto.id}
                                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-sm">✓</span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{producto.nombre}</h4>
                                    {producto.descripcion && (
                                      <p className="text-xs text-gray-500 truncate">{producto.descripcion}</p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleProductSelect(producto)}
                                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {isLastStep 
                        ? 'Configuración final' 
                        : selectedInCategory.length === 0 
                          ? `⚠️ Debes seleccionar al menos 1 ${currentCategory?.nombre?.toLowerCase()}`
                          : `${selectedInCategory.length} producto${selectedInCategory.length !== 1 ? 's' : ''} seleccionado${selectedInCategory.length !== 1 ? 's' : ''}`
                      }
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </button>
                      
                      <button
                        onClick={handleNextStep}
                        disabled={
                          (!isLastStep && selectedInCategory.length === 0) ||
                          (isLastStep && (
                            menuPrice <= 0 || 
                            (() => {
                              // ✅ USAR NOMBRES EXACTOS SEGÚN TYPESCRIPT
                              const principiosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Principios');
                              const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
                              const principiosCount = principiosCategory ? (selectedProducts[principiosCategory.id] || []).length : 0;
                              const proteinasCount = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []).length : 0;
                              return principiosCount === 0 || proteinasCount === 0;
                            })()
                          ))
                        }
                        className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                          (!isLastStep && selectedInCategory.length === 0) ||
                          (isLastStep && (
                            menuPrice <= 0 || 
                            (() => {
                              // ✅ USAR NOMBRES EXACTOS SEGÚN TYPESCRIPT
                              const principiosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Principios');
                              const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
                              const principiosCount = principiosCategory ? (selectedProducts[principiosCategory.id] || []).length : 0;
                              const proteinasCount = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []).length : 0;
                              return principiosCount === 0 || proteinasCount === 0;
                            })()
                          ))
                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {currentStep === 5 ? 'Finalizar' : 'Siguiente'}
                        {currentStep !== 5 && (
                          <ChevronRight className="w-4 h-4 ml-2" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Mensajes de validación */}
                  {!isLastStep && selectedInCategory.length === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-yellow-800">
                          Selecciona al menos un producto para continuar al siguiente paso.
                        </span>
                      </div>
                    </div>
                  )}

                  {isLastStep && (() => {
                    const principiosCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Principios');
                    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find(cat => cat.nombre === 'Proteínas');
                    const principiosCount = principiosCategory ? (selectedProducts[principiosCategory.id] || []).length : 0;
                    const proteinasCount = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []).length : 0;
                    
                    return (principiosCount === 0 || proteinasCount === 0);
                  })() && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-red-800">
                          Para generar combinaciones necesitas al menos 1 principio y 1 proteína seleccionados.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
