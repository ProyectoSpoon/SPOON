'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { Producto } from '@/utils/menuCache.utils';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Search, ChevronLeft, ChevronRight, Soup } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useCategorias } from '@/app/dashboard/carta/hooks/useCategorias';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

// Componentes
import { MenuDiarioRediseno } from '@/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno';

/**
* Función para convertir un Producto a VersionedProduct.
*/
const convertToVersionedProduct = (producto: Producto): VersionedProduct => {
 const stockStatus = producto.stock?.status as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined || 'out_of_stock';
 const stockData = producto.stock || { currentQuantity: 0, minQuantity: 0, maxQuantity: 0, status: 'out_of_stock', lastUpdated: new Date() };

 return {
   id: producto.id,
   nombre: producto.nombre,
   descripcion: producto.descripcion,
   currentPrice: producto.precio || 0,
   categoriaId: producto.categoriaId,
   currentVersion: 
     typeof producto.currentVersion === 'number' 
       ? producto.currentVersion 
       : (typeof producto.currentVersion === 'string' ? parseFloat(producto.currentVersion) : 0),

   priceHistory: Array.isArray(producto.priceHistory) ? producto.priceHistory : [],
   versions: Array.isArray(producto.versions) ? producto.versions : [],
   stock: {
     ...stockData,
     status: stockStatus,
   },
   status: producto.status as 'active' | 'draft' | 'archived' | 'discontinued' || 'archived',
   metadata: producto.metadata || { createdAt: new Date(), createdBy: 'unknown', lastModified: new Date(), lastModifiedBy: 'unknown' },
   imagen: producto.imagen,
   esFavorito: producto.esFavorito,
   esEspecial: producto.esEspecial
 };
};

/**
* Función para convertir un VersionedProduct a Producto.
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
   metadata: versionedProduct.metadata,
   imagen: versionedProduct.imagen,
   esFavorito: versionedProduct.esFavorito,
   esEspecial: versionedProduct.esEspecial
 };
};

// ✅ ARREGLADO: Usar los UUIDs reales de PostgreSQL que vienen en los logs
const CATEGORIAS_MENU = [
 { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas', enum: CategoriaMenu.ENTRADA },
 { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios', enum: CategoriaMenu.PRINCIPIO },
 { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas', enum: CategoriaMenu.PROTEINA },
 { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos', enum: CategoriaMenu.ACOMPANAMIENTO },
 { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas', enum: CategoriaMenu.BEBIDA }
];

export default function MenuDiaPage() {
 const {
   menuData,
   isLoaded,
   updateProductosSeleccionados,
   updateProductosMenu,
   addProductoToMenu,
   removeProductoFromMenu,
   addProductoToFavoritos,
   removeProductoFromFavoritos,
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

 const [menuDiaDB, setMenuDiaDB] = useState<any>(null);
 const [productosDB, setProductosDB] = useState<any[]>([]);
 const [loadingDB, setLoadingDB] = useState(true);
 const [errorDB, setErrorDB] = useState<string | null>(null);

 // Estados para botones de acción
 const [publicando, setPublicando] = useState(false);
 const [manteniendoMenu, setManteniendoMenu] = useState(false);

 const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60);
 // ✅ ELIMINADO: No necesitamos expandedCategory ya que no hay acordeón
 const [searchTerm, setSearchTerm] = useState('');
 const [searchSuggestions, setSearchSuggestions] = useState<VersionedProduct[]>([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const [selectedTab, setSelectedTab] = useState<string>('almuerzo');
 // ✅ CAMBIO: Inicializar con el UUID real de Entradas en lugar del enum
 const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('b4e792ba-b00d-4348-b9e3-f34992315c23');
 const [showProductModal, setShowProductModal] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<VersionedProduct | null>(null);
 const [showFavorites, setShowFavorites] = useState(false);

 useEffect(() => {
   obtenerCategorias().catch(error => {
     console.error('Error al cargar categorías:', error);
     toast.error('Error al cargar categorías desde PostgreSQL');
   });
 }, [obtenerCategorias]);

 useEffect(() => {
   const cargarDatosDB = async () => {
     try {
       setLoadingDB(true);
       console.log('🔄 Cargando menú del día desde la base de datos...');
       const response = await fetch('/api/menu-dia');
       if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
       
       const data = await response.json();
       console.log('📊 Datos de BD recibidos:', data);
       
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

 // ✅ NUEVA FUNCIÓN: Publicar menú con generación de combinaciones - CON LOGGING EXTREMO
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
     // Validación con logging detallado
     if (versionedProductosMenu.length === 0) {
       console.log('❌ RETORNANDO - No hay productos');
       console.log('📊 Detalles del estado:', {
         versionedProductosMenu,
         menuData: menuData?.productosMenu,
         productosDB: productosDB?.length || 0
       });
       toast.error('No hay productos en el menú para publicar');
       return;
     }

     console.log('✅ CONTINUANDO - Hay productos:', versionedProductosMenu.length);
     setPublicando(true);
     
     console.log('🚀 Publicando menú del día con generación de combinaciones...', {
       productos: versionedProductosMenu.length,
       fecha: new Date().toISOString().split('T')[0]
     });

     // Conversión con validación detallada
     console.log('🔄 Iniciando conversión de productos...');
     const productosParaEnviar = versionedProductosMenu.map((producto, index) => {
       console.log(`🔍 Validando producto ${index + 1}:`, {
         id: producto.id,
         nombre: `"${producto.nombre}"`,
         descripcion: producto.descripcion ? `"${producto.descripcion}"` : 'Sin descripción',
         categoriaId: producto.categoriaId,
         currentPrice: producto.currentPrice,
         todosLosCampos: producto
       });
       
       if (!producto.id) {
         console.error('❌ Producto sin ID:', producto);
         throw new Error(`Producto ${index + 1} no tiene ID`);
       }
       
       if (!producto.nombre || producto.nombre.trim() === '') {
         console.error('❌ Producto sin nombre:', producto);
         throw new Error(`Producto ${index + 1} no tiene nombre válido`);
       }
       
       if (!producto.categoriaId) {
         console.error('❌ Producto sin categoría:', producto);
         throw new Error(`Producto ${index + 1} no tiene categoría`);
       }
       
       const productoConvertido = {
         id: producto.id,
         nombre: producto.nombre,
         descripcion: producto.descripcion || 'Sin descripción',
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
     
     // Opcional: Redirigir a la página de combinaciones
     // router.push('/dashboard/carta/combinaciones');
     
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
   const producto = menuData?.productosMenu?.find(p => p.id === productoId);
   if (producto) {
     removeProductoFromMenu(productoId);
     toast.success(`${producto.nombre} eliminado del menú del día`);
   }
 };

 const handleToggleFavorite = (versionedProduct: VersionedProduct) => {
   const producto = convertToProducto(versionedProduct);
   const isFavorite = menuData?.productosFavoritos?.some(p => p.id === producto.id);
   if (isFavorite) {
     removeProductoFromFavoritos(producto.id);
     toast.success(`${producto.nombre} eliminado de favoritos`);
   } else {
     addProductoToFavoritos(producto);
     toast.success(`${producto.nombre} agregado a favoritos`);
   }
 };

 const handleViewProductDetails = (producto: VersionedProduct) => {
   setSelectedProduct(producto);
   setShowProductModal(true);
 };
 
 const versionedProductosMenu = useMemo(() => 
   menuData && Array.isArray(menuData.productosMenu) 
     ? menuData.productosMenu.map(convertToVersionedProduct) 
     : [],
 [menuData?.productosMenu]);

 const versionedProductosSeleccionados = useMemo(() => 
   menuData && Array.isArray(menuData.productosSeleccionados)
     ? menuData.productosSeleccionados.map(convertToVersionedProduct)
     : [],
 [menuData?.productosSeleccionados]);

 const todosLosProductos = useMemo(() => {
   if (productosDB && productosDB.length > 0) {
     return productosDB.map((prod) => {
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
     const productosConvertidos = productosDB.map((prod) => {
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
   return productos.filter(p => p.nombre.toLowerCase().includes(termLower) || (p.descripcion && p.descripcion.toLowerCase().includes(termLower)));
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
     menuData.productosSeleccionados.forEach(producto => {
       if (producto.categoriaId) conteos[producto.categoriaId] = (conteos[producto.categoriaId] || 0) + 1;
     });
   }
   return conteos;
 }, [menuData]);

 // ✅ NUEVO: Crear categorías con conteo usando las categorías fijas
 const categoriasMenuConConteo = useMemo(() => {
   const conteos = contarProductosPorCategoria();
   return CATEGORIAS_MENU.map(cat => ({ 
     ...cat, 
     count: conteos[cat.id] || 0 
   }));
 }, [contarProductosPorCategoria]);

 if (!isLoaded || categoriasLoading || loadingDB) {
   return (
     <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4821F] mb-4"></div>
       <p className="text-gray-600">Cargando datos del menú...</p>
       {categoriasError && <p className="text-red-500 mt-2 text-sm">Error: {categoriasError}</p>}
     </div>
   );
 }

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
         
         {showSuggestions && (
           <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
             {searchSuggestions.length > 0 ? (
               searchSuggestions.map((producto) => (
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
                           {CATEGORIAS_MENU.find(c => c.id === producto.categoriaId)?.nombre || 'Categoría'}
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

     {/* Navegación principal - Tipo de comida */}
     <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
       <button className="p-2 rounded-full border border-gray-200 mx-2">
         <ChevronLeft className="h-4 w-4 text-gray-500" />
       </button>
       
       <div className="flex space-x-4 overflow-x-auto py-2 px-4">
         {['desayuno', 'almuerzo', 'cena', 'rapidas'].map((tab) => (
           <button 
             key={tab}
             className={`px-3 py-1 font-medium text-sm capitalize ${selectedTab === tab 
               ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
               : 'text-gray-700 hover:text-[#F4821F]'}`}
             onClick={() => {
               setSelectedTab(tab);
               // ✅ CAMBIO: Resetear al UUID real de Entradas en lugar del enum
               setSelectedCategoryTab('b4e792ba-b00d-4348-b9e3-f34992315c23');
             }}
           >
             {tab === 'rapidas' ? 'Comidas Rápidas' : tab}
           </button>
         ))}
       </div>
       <button className="p-2 rounded-full border border-gray-200 mx-2">
         <ChevronRight className="h-4 w-4 text-gray-500" />
       </button>
     </div>
     
     {/* ✅ NUEVA BARRA: Solo las 5 categorías del menú sin "Todas" */}
     <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
       <div className="flex space-x-4 overflow-x-auto py-2 px-4 w-full">
         {CATEGORIAS_MENU.map((categoria) => (
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

     {/* ✅ NUEVO: Mostrar productos directamente sin acordeón */}
     <div className="overflow-y-auto bg-white rounded-lg shadow-sm mx-4" style={{maxHeight: 'calc(100vh - 300px)'}}>
       <div className="overflow-hidden rounded-lg border border-gray-200">
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
             const productosFiltrados = versionedProductosSeleccionados.filter((producto) => producto.categoriaId === selectedCategoryTab);
             
             
             return productosFiltrados.map((producto) => (
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

                 {/* Acciones adicionales */}
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
                     className={`p-1 rounded-md hover:bg-gray-100 ${
                       menuData?.productosFavoritos?.some(p => p.id === producto.id) 
                         ? 'text-red-500' 
                         : 'text-gray-500'
                     }`}
                     onClick={() => handleToggleFavorite(producto)}
                     title="Agregar/quitar de favoritos"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={
                       menuData?.productosFavoritos?.some(p => p.id === producto.id) 
                         ? 'currentColor' 
                         : 'none'
                     } viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                   </button>
                 </div>
               </div>
             ));
           })()}
           
           {/* Mostrar mensaje si no hay productos en la categoría seleccionada */}
           {versionedProductosSeleccionados.filter((producto) => producto.categoriaId === selectedCategoryTab).length === 0 && versionedProductosSeleccionados.length > 0 && (
             <div className="p-8 text-center text-gray-500">
               <Soup className="h-12 w-12 mx-auto text-gray-300 mb-4" />
               <p className="text-lg font-medium mb-2">No hay productos en esta categoría</p>
               <p className="text-sm">Selecciona otra categoría o agrega productos a esta sección.</p>
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Modal para detalles del producto */}
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
                     CATEGORIAS_MENU.find(c => c.id === selectedProduct.categoriaId)?.nombre || 'No especificada'
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
                   className={`px-4 py-2 rounded-md flex-1 ${
                     menuData?.productosFavoritos?.some(p => p.id === selectedProduct.id)
                       ? 'bg-red-500 hover:bg-red-600 text-white'
                       : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                   }`}
                   onClick={() => handleToggleFavorite(selectedProduct)}
                 >
                   {menuData?.productosFavoritos?.some(p => p.id === selectedProduct.id)
                     ? 'Quitar de favoritos'
                     : 'Agregar a favoritos'
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
             .filter(p => p && p.nombre && p.nombre.trim() && p.nombre.length > 0)
             .map(p => ({
               ...p,
               nombre: p.nombre.trim(), // Eliminar espacios en blanco
               descripcion: p.descripcion ? p.descripcion.trim() : 'Sin descripción'
             }));
           
           
           return productosLimpios;
         })()}
         categorias={categoriasPostgreSQL}
         onRemoveProduct={handleRemoveFromMenu}
         onUpdateCantidad={(productoId: string, cantidad: number) => {
           const productoOriginal = menuData?.productosMenu?.find(p => p.id === productoId);
           if (productoOriginal) {
             const productoActualizado = {
               ...productoOriginal,
               stock: { ...productoOriginal.stock, currentQuantity: cantidad }
             };
             updateProductosMenu(
               menuData.productosMenu.map(p => p.id === productoId ? productoActualizado : p)
             );
             toast.success(`Cantidad de ${productoOriginal.nombre} actualizada a ${cantidad}`);
           }
         }}
       />
       <div className="flex justify-between items-center mt-6">
         <div>
           <button 
             className={`px-4 py-2 rounded-md mr-2 ${showFavorites ? 'bg-[#F4821F] text-white' : 'bg-gray-200 text-gray-800'}`}
             onClick={() => setShowFavorites(!showFavorites)}
           >
             {showFavorites ? 'Ocultar favoritos' : 'Mostrar favoritos'}
           </button>
           
           {showFavorites && (
             <div className="mt-4 border rounded-lg p-4">
               <h3 className="font-semibold mb-2">Productos favoritos</h3>
               {menuData?.productosFavoritos?.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {menuData.productosFavoritos.map(producto => (
                     <div key={producto.id} className="border rounded p-2 flex justify-between items-center">
                       <span className="font-medium">{producto.nombre}</span>
                       <div className="flex space-x-2">
                         <button 
                           className="text-[#F4821F] hover:text-[#E67812]"
                           onClick={() => addProductoToMenu(producto)}
                           title="Agregar al menú"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                           </svg>
                         </button>
                         <button 
                           className="text-red-500 hover:text-red-600"
                           onClick={() => removeProductoFromFavoritos(producto.id)}
                           title="Quitar de favoritos"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-gray-500">No hay productos favoritos</p>
               )}
             </div>
           )}
         </div>
         
         <div className="flex space-x-4">
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
                 productos: versionedProductosMenu.map(p => ({ id: p.id, nombre: p.nombre }))
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
