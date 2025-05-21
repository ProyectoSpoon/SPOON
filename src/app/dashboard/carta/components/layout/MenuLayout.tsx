// src/app/dashboard/carta/components/layout/MenuLayout.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  VideoIcon, 
  FileQuestion,
  GitFork,
  Clock
} from "lucide-react";
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Button } from "@/shared/components/ui/Button";
import { Alert, AlertDescription } from "@/shared/components/ui/Alert";
import { toast } from "sonner";
import { ErrorBoundary } from "@/shared/components/ui/ErrorBoundary/error-boundary";
import { ListaCategorias } from "../categorias/ListaCategorias";
import ListaProductos from "../productos/ListaProductos";
import { MenuDiario } from "../menu-diario/MenuDiario";
import { DialogoNuevaCategoria } from "../categorias/DialogoNuevaCategoria";
import { DialogoNuevoProducto } from "../productos/DialogoNuevoProducto";
import { useMenuCache } from "@/hooks/useMenuCache";
import { Categoria, Producto, menuCacheUtils } from "@/utils/menuCache.utils";
import { cacheUtils } from "@/utils/cache.utils";
import { CategoriaMenu } from "@/app/dashboard/carta/types/menu.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";

// Interfaces para productos
interface ProductoNuevo {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoriaId: string;
}

interface ProductoExistente extends ProductoNuevo {
  id: string;
}

interface MenuLayoutProps {
  isLoading: boolean;
  error: string | null;
  categorias: any[];
  productos: VersionedProduct[];
  restauranteId: string;
  onCategoriaCreated?: (newCategoria: any) => void;
}

export function MenuLayout({ 
  isLoading: initialLoading, 
  error: initialError, 
  categorias: categoriasIniciales, 
  productos: productosIniciales,
  restauranteId,
  onCategoriaCreated
}: MenuLayoutProps) {
  const router = useRouter();
  
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
    hasCache,
    getCacheRemainingTime
  } = useMenuCache();

  // Estados locales para diálogos
  const [dialogoNuevaCategoria, setDialogoNuevaCategoria] = useState(false);
  const [dialogoNuevoProducto, setDialogoNuevoProducto] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [dialogoNuevo, setDialogoNuevo] = useState(false);
  const [productoParaEditar, setProductoParaEditar] = useState<VersionedProduct | null>(null);
  const [productoParaEliminar, setProductoParaEliminar] = useState<string | null>(null);
  const [cacheRemainingTime, setCacheRemainingTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || !isLoaded);
  const [error, setError] = useState<string | null>(initialError);

  // Actualizar el tiempo restante del caché cada minuto
  useEffect(() => {
    const updateRemainingTime = () => {
      setCacheRemainingTime(getCacheRemainingTime());
    };
    
    // Actualizar inmediatamente
    updateRemainingTime();
    
    // Configurar intervalo para actualizar cada minuto
    const interval = setInterval(updateRemainingTime, 60000);
    
    return () => clearInterval(interval);
  }, [getCacheRemainingTime]);

  // Actualizar estado de carga
  useEffect(() => {
    setIsLoading(initialLoading || !isLoaded);
  }, [initialLoading, isLoaded]);

  // Inicializar categorías si no hay en caché
  useEffect(() => {
    if (isLoaded && menuData.categorias.length === 0 && categoriasIniciales.length > 0) {
      updateCategorias(categoriasIniciales as Categoria[]);
    }
  }, [isLoaded, menuData.categorias.length, categoriasIniciales, updateCategorias]);

  // Handlers
  const handleGenerarCombinaciones = () => {
    console.log('=== Iniciando generación de combinaciones ===');
    console.log('Productos disponibles:', menuData.productosSeleccionados);

    // Mapeo de subcategorías a tipos de productos
    const mapeoSubcategorias = {
      'SUBCAT_001': CategoriaMenu.ENTRADA,      // Entrada
      'SUBCAT_002': CategoriaMenu.PRINCIPIO,    // Principio
      'SUBCAT_003': CategoriaMenu.PROTEINA,     // Proteina
      'SUBCAT_004': CategoriaMenu.ACOMPANAMIENTO, // Acompañamientos
      'SUBCAT_005': CategoriaMenu.BEBIDA        // Bebidas
    };

    // Clasificar productos por tipo según su categoriaId (que contiene el ID de subcategoría)
    const entradas = menuData.productosSeleccionados.filter(p => p.categoriaId === 'SUBCAT_001');
    const principios = menuData.productosSeleccionados.filter(p => p.categoriaId === 'SUBCAT_002');
    const proteinas = menuData.productosSeleccionados.filter(p => p.categoriaId === 'SUBCAT_003');
    const acompanamientos = menuData.productosSeleccionados.filter(p => p.categoriaId === 'SUBCAT_004');
    const bebidas = menuData.productosSeleccionados.filter(p => p.categoriaId === 'SUBCAT_005');

    console.log('Productos filtrados:', {
      entradas,
      principios,
      proteinas,
      acompanamientos,
      bebidas
    });

    // Validaciones
    if (entradas.length === 0) {
      toast.error("Necesitas seleccionar al menos una entrada");
      return;
    }
    if (principios.length === 0) {
      toast.error("Necesitas seleccionar al menos un principio");
      return;
    }
    if (proteinas.length === 0) {
      toast.error("Necesitas seleccionar al menos una proteína");
      return;
    }
    if (acompanamientos.length === 0) {
      toast.error("Necesitas seleccionar al menos un acompañamiento");
      return;
    }
    if (bebidas.length === 0) {
      toast.error("Necesitas seleccionar al menos una bebida");
      return;
    }

    try {
      toast.success("Generando combinaciones...");
      
      // Convertir productos al formato esperado por la página de combinaciones
      const productosConvertidos = menuData.productosSeleccionados.map(p => {
        // Obtener la categoría correspondiente según el ID de subcategoría
        const categoriaMenu = mapeoSubcategorias[p.categoriaId as keyof typeof mapeoSubcategorias];
        
        if (!categoriaMenu) {
          console.error(`No se encontró categoría para el ID: ${p.categoriaId}`);
          return null;
        }
        
        // Crear un nuevo producto con la categoría correcta
        return {
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: 0, // Precio no es relevante para las combinaciones
          categoriaId: categoriaMenu, // Usar el valor de CategoriaMenu
          imagen: p.imagen || '/images/placeholder.jpg',
          disponible: true,
          createdAt: p.metadata?.createdAt || new Date(),
          updatedAt: p.metadata?.lastModified || new Date(),
          // Agregar propiedades adicionales que puedan ser necesarias
          stock: {
            currentQuantity: 10,
            minQuantity: 5,
            maxQuantity: 100,
            status: 'in_stock',
            lastUpdated: new Date()
          },
          informacionNutricional: {},
          restricciones: {},
          opciones: []
        };
      }).filter(p => p !== null) as any[]; // Filtrar productos nulos
      
      console.log('Productos convertidos para combinaciones:', productosConvertidos);
      
      // Generar combinaciones directamente
      const combinaciones: any[] = [];
      let idCombinacion = 1;
      
      // Filtrar productos por categoría
      const entradasConvertidas = productosConvertidos.filter(p => p.categoriaId === CategoriaMenu.ENTRADA);
      const principiosConvertidos = productosConvertidos.filter(p => p.categoriaId === CategoriaMenu.PRINCIPIO);
      const proteinasConvertidas = productosConvertidos.filter(p => p.categoriaId === CategoriaMenu.PROTEINA);
      const acompanamientosConvertidos = productosConvertidos.filter(p => p.categoriaId === CategoriaMenu.ACOMPANAMIENTO);
      const bebidasConvertidas = productosConvertidos.filter(p => p.categoriaId === CategoriaMenu.BEBIDA);
      
      // Generar todas las combinaciones posibles
      entradasConvertidas.forEach(entrada => {
        principiosConvertidos.forEach(principio => {
          proteinasConvertidas.forEach(proteina => {
            // Seleccionar un acompañamiento y una bebida únicos para cada combinación
            const acompIndex = (idCombinacion - 1) % acompanamientosConvertidos.length;
            const bebidaIndex = (idCombinacion - 1) % bebidasConvertidas.length;
            
            combinaciones.push({
              id: `menu-${idCombinacion++}`,
              nombre: `${principio.nombre} con ${proteina.nombre}`,
              entrada: entrada,
              principio: principio,
              proteina: proteina,
              acompanamiento: [acompanamientosConvertidos[acompIndex]], // Un solo acompañamiento único
              bebida: bebidasConvertidas[bebidaIndex], // Una bebida única
              favorito: false,
              especial: false,
              cantidad: 0,
              programacion: []
            });
          });
        });
      });
      
      console.log(`Total de combinaciones generadas: ${combinaciones.length}`);
      console.log('Primera combinación generada:', combinaciones[0]);
      
      // Guardar las combinaciones en el caché
      localStorage.setItem('combinacionesGeneradas', JSON.stringify(combinaciones));
      
      // Navegar a la página de combinaciones
      router.push('/dashboard/carta/combinaciones');
    } catch (error) {
      console.error('Error en handleGenerarCombinaciones:', error);
      toast.error("Error al procesar los productos");
    }
  };

  // Handlers de Categorías y Productos
  const handleSelectCategoria = (id: string) => {
    updateSeleccion(id, null);
  };

  const handleSelectSubcategoria = (id: string, parentId: string) => {
    updateSeleccion(parentId, id);
  };

  const handleAddCategoria = (categoria: Categoria) => {
    updateCategorias([...menuData.categorias, categoria]);
    toast.success(`${categoria.tipo === 'principal' ? 'Categoría' : 'Subcategoría'} agregada exitosamente`);
  };

  const handleDeleteCategoria = (id: string) => {
    // Eliminar la categoría y todas sus subcategorías
    const nuevasCategorias = menuData.categorias.filter(cat => cat.id !== id && cat.parentId !== id);
    updateCategorias(nuevasCategorias);
    
    // Si la categoría eliminada era la seleccionada, deseleccionarla
    if (menuData.categoriaSeleccionada === id) {
      updateSeleccion(null, null);
    }
  };

  const handleDeleteSubcategoria = (id: string, parentId: string) => {
    // Eliminar solo la subcategoría
    const nuevasCategorias = menuData.categorias.filter(cat => cat.id !== id);
    updateCategorias(nuevasCategorias);
    
    // Si la subcategoría eliminada era la seleccionada, deseleccionarla
    if (menuData.subcategoriaSeleccionada === id) {
      updateSeleccion(menuData.categoriaSeleccionada, null);
    }
  };

  const handleNuevoProducto = (producto: ProductoNuevo | ProductoExistente) => {
    const nuevoProducto: Producto = {
      id: 'id' in producto ? producto.id : Date.now().toString(),
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoriaId: menuData.subcategoriaSeleccionada || '',
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      stock: {
        currentQuantity: 0,
        minQuantity: 0,
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      },
      imagen: producto.imagen
    };
    updateProductosSeleccionados([...menuData.productosSeleccionados, nuevoProducto]);
    setDialogoNuevo(false);
  };

  const handleEditarProducto = (productoEditado: Producto) => {
    const nuevosProductos = menuData.productosSeleccionados.map(p => 
      p.id === productoEditado.id ? productoEditado : p
    );
    updateProductosSeleccionados(nuevosProductos);
    setProductoParaEditar(null);
  };

  const handleEliminarProducto = (id: string) => {
    setProductoParaEliminar(id);
    setDialogoEliminar(true);
  };

  const confirmarEliminacion = () => {
    if (productoParaEliminar) {
      const nuevosProductos = menuData.productosSeleccionados.filter(p => p.id !== productoParaEliminar);
      updateProductosSeleccionados(nuevosProductos);
      setDialogoEliminar(false);
      setProductoParaEliminar(null);
    }
  };

  // Nuevo handler para agregar productos a la columna de productos
  const handleAgregarProducto = (producto: VersionedProduct) => {
    console.log('=== handleAgregarProducto ===');
    console.log('Producto recibido:', producto);

    // Convertir VersionedProduct a Producto
    const productoParaAgregar: Producto = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoriaId: producto.categoriaId,
      currentVersion: producto.currentVersion,
      priceHistory: producto.priceHistory,
      versions: producto.versions,
      stock: producto.stock,
      status: producto.status,
      metadata: producto.metadata,
      imagen: producto.imagen
    };

    // Verificar si ya existe un producto con el mismo ID y categoría
    const yaExiste = menuData.productosSeleccionados.some(
      p => p.id === producto.id && p.categoriaId === producto.categoriaId
    );
    
    if (!yaExiste) {
      console.log('Agregando producto a la lista de productos seleccionados:', productoParaAgregar);
      
      // Crear una nueva lista con el producto agregado
      const nuevosProductos = [...menuData.productosSeleccionados, productoParaAgregar];
      console.log('Nueva lista de productos seleccionados:', nuevosProductos);
      
      // Actualizar el estado y guardar en caché
      updateProductosSeleccionados(nuevosProductos);
      toast.success(`${producto.nombre} agregado a la lista de productos`);
      
      // Forzar la actualización del caché
      menuCacheUtils.updateProductosSeleccionados(nuevosProductos);
    } else {
      console.log('El producto ya existe en la lista de productos seleccionados');
      toast.error("Este producto ya está en la lista de productos");
    }
  };

  // Nuevo handler para agregar productos al menú del día
  const handleAgregarAlMenu = (producto: VersionedProduct) => {
    console.log('=== handleAgregarAlMenu ===');
    console.log('Producto recibido:', producto);

    // Convertir VersionedProduct a Producto
    const productoParaAgregar: Producto = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoriaId: producto.categoriaId,
      currentVersion: producto.currentVersion,
      priceHistory: producto.priceHistory,
      versions: producto.versions,
      stock: producto.stock,
      status: producto.status,
      metadata: producto.metadata,
      imagen: producto.imagen
    };

    addProductoToMenu(productoParaAgregar);
  };

  // Renderizado condicional para estado de carga
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  // Renderizado principal
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full bg-white">
        {error && <div>Error en el componente MenuLayout: {error}</div>}
        
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="border-b bg-white shadow-sm">
            <div className="flex justify-between items-center py-3 px-6">
              <h1 className="text-base font-medium text-[#4B5563]">
                Menú/Carta
              </h1>
              <div className="flex items-center gap-3">
                {/* Indicador de caché */}
                {hasCache() && (
                  <div className="flex items-center border rounded-lg px-3 py-1 bg-white">
                    <Clock className="h-3 w-3 mr-2 text-[#F4821F]" />
                    <div className="text-xs text-gray-700">
                      Tiempo restante caché: <span className="font-semibold">{Math.floor(cacheRemainingTime / 60)}m {cacheRemainingTime % 60}s</span>
                    </div>
                  </div>
                )}
                <Button variant="ghost" className="text-[#6B7280] hover:text-[#4B5563] hover:bg-[#F4F4F5] text-xs h-8">
                  <VideoIcon className="h-3 w-3 mr-1" />
                  Ver tutorial
                </Button>
                <Button variant="ghost" className="text-[#6B7280] hover:text-[#4B5563] hover:bg-[#F4F4F5] text-xs h-8">
                  <FileQuestion className="h-3 w-3 mr-1" />
                  Guía de recomendaciones
                </Button>
                <Button 
                  onClick={handleGenerarCombinaciones}
                  className="bg-[#F4821F] hover:bg-[#CC6A10] text-white transition-colors flex items-center gap-1 text-xs h-8"
                >
                  <GitFork className="h-3 w-3" />
                  Generar Combinaciones
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[250px_320px_1fr] h-full">
            {/* Columna Categorías */}
            <div className="border-r border-[#E5E5E5] bg-[#FAFAFA]">
              <div className="py-2 px-4 border-b border-[#E5E5E5] bg-white">
                <h2 className="text-[#1F2937] font-medium text-center text-sm">Categorías</h2>
              </div>
              <div className="px-3 py-2">
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <ListaCategorias
                    categorias={menuData.categorias}
                    categoriaSeleccionada={menuData.categoriaSeleccionada}
                    subcategoriaSeleccionada={menuData.subcategoriaSeleccionada}
                    onSelectCategoria={handleSelectCategoria}
                    onSelectSubcategoria={handleSelectSubcategoria}
                    onAddCategoria={handleAddCategoria}
                    onDeleteCategoria={handleDeleteCategoria}
                    onDeleteSubcategoria={handleDeleteSubcategoria}
                  />
                )}
              </div>
            </div>
            
            {/* Columna Productos */}
            <div className="border-r border-[#E5E5E5] bg-white">
              <div className="py-2 px-4 border-b border-[#E5E5E5]">
                <h2 className="text-[#1F2937] font-medium text-center text-sm">Productos</h2>
              </div>
              <div className="px-3 py-2">
                <ListaProductos
                  restauranteId={restauranteId}
                  categoriaId={menuData.categoriaSeleccionada || undefined}
                  subcategoriaId={menuData.subcategoriaSeleccionada || undefined}
                  onProductSelect={handleAgregarProducto}
                  onAddToMenu={handleAgregarAlMenu}
                  productosSeleccionados={menuData.productosSeleccionados as VersionedProduct[]}
                />
              </div>
            </div>

            {/* Columna Menú del Día */}
            <div className="bg-white">
              <div className="border-b border-[#E5E5E5]">
                <h2 className="text-[#1F2937] font-medium text-center py-2 text-sm whitespace-nowrap">Menú del Día</h2>
                <div className="grid grid-cols-[220px_1fr_50px] border-t border-[#E5E5E5]">
                  <div className="text-xs text-[#6B7280] text-center border-r border-[#E5E5E5] py-2 bg-[#FFF4E6]">
                    Producto
                  </div>
                  <div className="text-xs text-[#6B7280] text-center py-2 bg-[#F4F4F5]">
                    Descripción
                  </div>
                  <div className="text-xs text-[#6B7280] text-center py-2 bg-[#F4F4F5]">
                    Acción
                  </div>
                </div>
              </div>
              <div className="px-3 py-2">
                <MenuDiario 
                  productos={menuData.productosMenu as VersionedProduct[]} 
                  onRemoveProduct={removeProductoFromMenu}
                />
              </div>
            </div>
          </div>

          {/* Diálogos */}
          {dialogoNuevoProducto && (
            <DialogoNuevoProducto
              open={dialogoNuevoProducto}
              onOpenChange={setDialogoNuevoProducto}
              onSubmit={handleNuevoProducto}
              categoriaId={menuData.subcategoriaSeleccionada || ''}
            />
          )}

          {/* Diálogo de Confirmación de Eliminación */}
          <Dialog 
            open={dialogoEliminar} 
            onOpenChange={setDialogoEliminar}
          >
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción eliminará el producto del catálogo. No afectará a los menús existentes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogoEliminar(false)}
                  className="bg-white hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarEliminacion}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </ErrorBoundary>
  );
}
