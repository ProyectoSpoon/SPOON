# MENU-DEL-DIA: Documentación Técnica Detallada

## Índice
1. [Introducción](#introducción)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Datos](#flujo-de-datos)
5. [Sistema de Caché](#sistema-de-caché)
6. [Modelos de Datos](#modelos-de-datos)
7. [Interacciones de Usuario](#interacciones-de-usuario)
8. [Integración con Backend](#integración-con-backend)
9. [Optimizaciones y Rendimiento](#optimizaciones-y-rendimiento)
10. [Consideraciones Técnicas](#consideraciones-técnicas)

## Introducción

El módulo "Menú del Día" es una parte fundamental del dashboard de Spoon, diseñado para permitir a los administradores de restaurantes gestionar eficientemente el menú diario. Este módulo permite seleccionar productos por categorías, agregarlos al menú del día, gestionar cantidades y publicar el menú para que esté disponible para los clientes.

La implementación utiliza React con Next.js, aprovechando características modernas como hooks personalizados, almacenamiento en caché local, y una arquitectura basada en componentes para garantizar un rendimiento óptimo y una experiencia de usuario fluida.

## Estructura de Archivos

El módulo "Menú del Día" está organizado en una estructura de archivos completa que abarca múltiples directorios y componentes. A continuación se detalla cada archivo involucrado:

```
src/
├── app/                                     # Directorio principal de la aplicación Next.js
│   └── dashboard/                           # Módulo de dashboard
│       ├── layout.tsx                       # Layout principal del dashboard
│       └── carta/                           # Módulo de gestión de carta/menú
│           ├── layout.tsx                   # Layout específico para la sección de carta
│           ├── menu-dia/                    # Módulo específico de Menú del Día
│           │   └── page.tsx                 # Página principal del Menú del Día
│           ├── components/                  # Componentes compartidos del módulo carta
│           │   ├── menu-diario/             # Componentes para visualización del menú
│           │   │   ├── MenuDiario.tsx       # Versión original del componente
│           │   │   ├── MenuDiarioContainer.tsx # Contenedor para el menú diario
│           │   │   ├── MenuDiarioRediseno.tsx # Versión rediseñada del componente
│           │   │   └── PlaceholderMenuDiario.tsx # Componente de carga
│           │   ├── busqueda/                # Componentes de búsqueda
│           │   │   ├── BusquedaAvanzada.tsx # Componente de búsqueda avanzada
│           │   │   └── ResultadoBusqueda.tsx # Componente para mostrar resultados
│           │   ├── categorias/              # Componentes para gestión de categorías
│           │   │   ├── DialogoHorarios.tsx  # Modal para configurar horarios
│           │   │   ├── DialogoNuevaCategoria.tsx # Modal para crear categoría
│           │   │   ├── ItemCategoria.tsx    # Componente para un ítem de categoría
│           │   │   ├── ListaCategorias.tsx  # Lista de categorías (versión original)
│           │   │   └── ListaCategoriasRediseno.tsx # Lista rediseñada
│           │   ├── detalles-producto/       # Componentes para detalles de producto
│           │   │   ├── FormularioProducto.tsx # Formulario de edición de producto
│           │   │   └── selector-imagen/     # Componentes para selección de imágenes
│           │   ├── layout/                  # Componentes de layout
│           │   │   ├── ColumnaLayout.tsx    # Layout de columnas
│           │   │   └── MenuLayout.tsx       # Layout específico del menú
│           │   ├── modal-programacion/      # Componentes para programación
│           │   │   └── ModalProgramacion.tsx # Modal de programación
│           │   ├── productos/               # Componentes para gestión de productos
│           │   │   ├── DialogoNuevoProducto.tsx # Modal para crear producto
│           │   │   ├── DialogoSelectorProducto.tsx # Modal para seleccionar producto
│           │   │   ├── ItemProducto.tsx     # Componente para un ítem de producto
│           │   │   ├── ListaProductos.tsx   # Lista de productos (versión original)
│           │   │   ├── ListaProductosRediseno.tsx # Lista rediseñada
│           │   │   └── SelectorProducto.tsx # Selector de productos
│           │   ├── tabla-combinaciones/     # Componentes para combinaciones
│           │   │   └── TablaCombinaciones.tsx # Tabla de combinaciones
│           │   ├── tabla-combinaciones-menu/ # Componentes para combinaciones de menú
│           │   │   └── TablaCombinacionesMenu.tsx # Tabla de combinaciones de menú
│           │   ├── tarjetas-combinaciones/  # Componentes para tarjetas de combinaciones
│           │   │   └── TarjetasCombinaciones.tsx # Tarjetas de combinaciones
│           │   ├── toolbar/                 # Componentes de barra de herramientas
│           │   └── ui/                      # Componentes UI específicos
│           ├── constants/                   # Constantes para el módulo carta
│           │   ├── categorias.ts            # Constantes de categorías
│           │   ├── imagenes.constants.ts    # Constantes de imágenes
│           │   ├── menu.constants.ts        # Constantes del menú
│           │   └── validaciones.constants.ts # Constantes de validación
│           ├── hooks/                       # Hooks específicos del módulo carta
│           │   ├── useCategorias.ts         # Hook para gestión de categorías
│           │   ├── useCombinaciones.ts      # Hook para gestión de combinaciones
│           │   ├── useCombinacionesMenu.ts  # Hook para combinaciones de menú
│           │   ├── useHorarios.ts           # Hook para gestión de horarios
│           │   ├── useMenuPermissions.ts    # Hook para permisos del menú
│           │   ├── useProductFilters.ts     # Hook para filtros de productos
│           │   ├── useProductHistory.ts     # Hook para historial de productos
│           │   ├── useProductos.ts          # Hook para gestión de productos
│           │   └── useSubidaImagen.ts       # Hook para subida de imágenes
│           ├── services/                    # Servicios específicos del módulo carta
│           │   ├── favoritos.service.ts     # Servicio para gestión de favoritos
│           │   ├── menu.service.ts          # Servicio para gestión del menú
│           │   └── role-manager.service.ts  # Servicio para gestión de roles
│           ├── store/                       # Estado global del módulo carta
│           │   ├── categoriasStore.ts       # Store para categorías
│           │   ├── menuStore.ts             # Store para el menú
│           │   └── productosStore.ts        # Store para productos
│           ├── styles/                      # Estilos específicos del módulo carta
│           │   ├── columnas.css             # Estilos para columnas
│           │   ├── dialogos.css             # Estilos para diálogos
│           │   └── formularios.css          # Estilos para formularios
│           ├── types/                       # Tipos específicos del módulo carta
│           │   ├── menu.types.ts            # Tipos para el menú
│           │   ├── permissions.types.ts     # Tipos para permisos
│           │   └── product-versioning.types.ts # Tipos para versionado de productos
│           └── utils/                       # Utilidades específicas del módulo carta
│               ├── exportacion.tsx          # Utilidades para exportación
│               ├── filtros.ts               # Utilidades para filtros
│               ├── horarios.ts              # Utilidades para horarios
│               ├── menu-cache.utils.ts      # Utilidades específicas de caché del menú
│               ├── ordenamiento.ts          # Utilidades para ordenamiento
│               ├── precio.ts                # Utilidades para precios
│               ├── procesadoImagenes.ts     # Utilidades para procesado de imágenes
│               └── validaciones.ts          # Utilidades para validaciones
├── components/                              # Componentes globales de la aplicación
│   ├── CacheInitializer.tsx                # Inicializador de caché
│   ├── database-provider.tsx               # Proveedor de base de datos
│   ├── ForceReloadButton.tsx               # Botón para forzar recarga
│   ├── providers.tsx                       # Proveedores de contexto
│   └── ReloadProductsButton.tsx            # Botón para recargar productos
├── context/                                # Contextos globales
│   └── menuContext.tsx                     # Contexto para el menú (si existe)
├── hooks/                                  # Hooks globales
│   ├── useMenuCache.ts                     # Hook para gestión de caché del menú
│   └── useMenuData.ts                      # Hook para datos del menú (si existe)
├── services/                               # Servicios globales
│   └── json-data.service.ts                # Servicio para cargar datos JSON
├── shared/                                 # Componentes y utilidades compartidas
│   ├── components/                         # Componentes UI compartidos
│   │   └── ui/                             # Componentes UI básicos
│   │       ├── Button/                     # Componente de botón
│   │       │   └── button.tsx              # Implementación del botón
│   │       ├── Card/                       # Componente de tarjeta
│   │       │   └── card.tsx                # Implementación de la tarjeta
│   │       ├── Dialog/                     # Componente de diálogo
│   │       │   └── dialog.tsx              # Implementación del diálogo
│   │       └── Toast/                      # Componente de notificación
│   │           └── toast.tsx               # Implementación de la notificación
│   └── types/                              # Tipos compartidos
│       └── menu.types.ts                   # Tipos compartidos para menú
├── styles/                                 # Estilos globales
│   └── scrollbar-hide.css                  # Estilos para ocultar scrollbar
├── test-data/                              # Datos de prueba
│   ├── categorias.json                     # Datos de categorías
│   ├── productos.json                      # Datos de productos
│   ├── combinaciones.json                  # Datos de combinaciones
│   ├── combinacion_productos.json          # Relación entre combinaciones y productos
│   ├── menus.json                          # Datos de menús
│   └── programaciones.json                 # Datos de programaciones
└── utils/                                  # Utilidades globales
    └── menuCache.utils.ts                  # Utilidades para el caché del menú
```

## Componentes Principales

### 1. MenuDiaPage (src/app/dashboard/carta/menu-dia/page.tsx)

Este es el componente principal que orquesta toda la funcionalidad del Menú del Día.

**Responsabilidades:**
- Inicializar y gestionar el estado del menú utilizando el hook `useMenuCache`
- Manejar la selección de categorías y productos
- Coordinar la comunicación entre los componentes hijos
- Gestionar el tiempo de caché y notificaciones
- Implementar la búsqueda de productos

**Estado Local:**
```typescript
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
```

**Funciones Principales:**
```typescript
// Manejador para cuando se selecciona una categoría
const handleCategoriaSeleccionada = (categoriaId: string) => {
  updateSeleccion(categoriaId, null);
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
```

**Efectos:**
```typescript
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
```

**Estructura de la UI:**
- Encabezado con título y buscador
- Barra de pestañas para filtrar por categorías
- Sección de acordeón para mostrar productos por categoría
- Sección "Menú del Día" que muestra los productos seleccionados
- Indicador de tiempo de caché
- Botones de acción (Mantener Menú, Publicar Menú)

### 2. MenuDiarioRediseno (src/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno.tsx)

Este componente se encarga de mostrar los productos seleccionados para el menú del día, organizados por categorías.

**Props:**
```typescript
interface MenuDiarioRedisenoProps {
  productos: VersionedProduct[];
  onRemoveProduct?: (productId: string) => void;
  onUpdateCantidad?: (productId: string, cantidad: number) => void;
}
```

**Estado Local:**
```typescript
// Estados para el modal y las cantidades
const [cantidades, setCantidades] = useState<Record<string, number>>({});
const [modalProducto, setModalProducto] = useState<VersionedProduct | null>(null);
const [cantidadModal, setCantidadModal] = useState<number>(0);
```

**Funciones Principales:**
```typescript
// Función para abrir el modal de cantidad
const abrirModalCantidad = (producto: VersionedProduct) => {
  setModalProducto(producto);
  setCantidadModal(getCantidad(producto));
};

// Función para cerrar el modal de cantidad
const cerrarModalCantidad = () => {
  setModalProducto(null);
};

// Función para guardar la cantidad desde el modal
const guardarCantidadModal = () => {
  if (modalProducto && onUpdateCantidad) {
    setCantidades(prev => ({
      ...prev,
      [modalProducto.id]: cantidadModal
    }));
    
    onUpdateCantidad(modalProducto.id, cantidadModal);
    toast.success(`Cantidad de ${modalProducto.nombre} actualizada a ${cantidadModal}`);
    cerrarModalCantidad();
  }
};

// Función para obtener la cantidad actual de un producto
const getCantidad = (producto: VersionedProduct): number => {
  // Si ya tenemos una cantidad en el estado, usarla
  if (cantidades[producto.id] !== undefined) {
    return cantidades[producto.id];
  }
  
  // Si el producto tiene una cantidad definida, usarla
  if (producto.stock?.currentQuantity !== undefined) {
    // Inicializar el estado con este valor
    setCantidades(prev => ({
      ...prev,
      [producto.id]: producto.stock!.currentQuantity
    }));
    return producto.stock.currentQuantity;
  }
  
  // Valor por defecto
  return 0;
};
```

**Estructura de la UI:**
- Grid de 5 columnas, una para cada categoría (Entradas, Principio, Proteína, Acompañamientos, Bebida)
- Cada columna muestra los productos de esa categoría
- Botones para eliminar productos
- Control de cantidad para productos de la categoría "Proteína"
- Modal para editar la cantidad de proteína

### 3. ListaProductosRediseno (src/app/dashboard/carta/components/productos/ListaProductosRediseno.tsx)

Este componente muestra la lista de productos disponibles para ser agregados al menú del día.

**Props:**
```typescript
interface ListaProductosRedisenoProps {
  restauranteId: string;
  categoriaId?: string;
  subcategoriaId?: string | null;
  onProductSelect?: (product: VersionedProduct) => void;
  onAddToMenu?: (product: VersionedProduct) => void;
  onRemoveFromMenu?: (productId: string) => void;
  productosSeleccionados?: VersionedProduct[];
  productosMenu?: VersionedProduct[]; // Productos que ya están en el menú
}
```

**Estado Local:**
```typescript
const [cargando, setCargando] = useState(false);
const [modalProductos, setModalProductos] = useState(false);
const [productoSeleccionado, setProductoSeleccionado] = useState<VersionedProduct | null>(null);
const [modalDetalleProducto, setModalDetalleProducto] = useState(false);
const [productosJSON, setProductosJSON] = useState<VersionedProduct[]>([]);
const [cargandoProductos, setCargandoProductos] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
```

**Funciones Principales:**
```typescript
// Manejar clic en un producto
const handleProductClick = (producto: VersionedProduct) => {
  setProductoSeleccionado(producto);
  setModalDetalleProducto(true);
};

// Verificar si un producto está en el menú
const isProductInMenu = (productoId: string) => {
  return productosMenu.some(p => p.id === productoId);
};

// Manejar el toggle del checkbox para agregar/quitar producto del menú
const handleToggleProductoMenu = (producto: VersionedProduct, e?: React.MouseEvent) => {
  if (e) e.stopPropagation(); // Evitar que se abra el modal de detalle
  
  const isInMenu = isProductInMenu(producto.id);
  
  if (isInMenu) {
    // Si ya está en el menú, quitarlo
    if (onRemoveFromMenu) {
      onRemoveFromMenu(producto.id);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    } else {
      toast.error('No se pudo eliminar el producto del menú');
    }
  } else {
    // Si no está en el menú, agregarlo
    if (onAddToMenu) {
      onAddToMenu(producto);
      toast.success(`${producto.nombre} agregado al menú del día`);
    } else {
      toast.error('No se pudo agregar el producto al menú');
    }
  }
};
```

**Efectos:**
```typescript
// Cargar productos desde los archivos JSON o usar los hardcodeados
useEffect(() => {
  const cargarProductos = async () => {
    console.log('Cargando productos para categoría:', categoriaId);
    
    if (!categoriaId) {
      console.log('No hay categoría seleccionada, no se cargarán productos');
      return;
    }
    
    setCargandoProductos(true);
    try {
      // Limpiar caché para forzar recarga
      localStorage.removeItem('menu_productos');
      console.log('Caché de productos eliminado para forzar recarga');
      
      // Cargar productos específicos de la categoría
      console.log('Intentando cargar productos de categoría ' + categoriaId + '...');
      const productos = await jsonDataService.getProductosByCategoria(categoriaId);
      console.log('Productos cargados desde JSON:', productos);
      console.log('Total de productos cargados:', productos.length);
      
      // Lógica para cargar y filtrar productos...
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Lógica de manejo de errores...
    } finally {
      setCargandoProductos(false);
    }
  };

  cargarProductos();
}, [categoriaId]);
```

**Estructura de la UI:**
- Tabla con columnas para imagen, nombre, agregar al menú y acciones
- Checkbox para agregar/quitar productos del menú
- Modal para ver detalles del producto
- Indicador de carga mientras se cargan los productos

## Flujo de Datos

El flujo de datos en el módulo "Menú del Día" sigue un patrón unidireccional, donde:

1. **Inicialización:**
   - Al cargar la página, se inicializa el hook `useMenuCache`
   - Se verifica si hay datos en caché y se cargan si existen
   - Se establece el submenú activo como 'menu-dia'
   - Se inicia el temporizador para el tiempo de caché

2. **Carga de Datos:**
   - Los productos se cargan desde archivos JSON utilizando el servicio `jsonDataService`
   - Se filtran los productos por categoría
   - Los productos cargados se almacenan en el estado local del componente

3. **Interacción del Usuario:**
   - El usuario puede seleccionar una categoría para ver sus productos
   - Al hacer clic en el toggle de un producto, se agrega o elimina del menú
   - Para productos de tipo "Proteína", se puede editar la cantidad
   - Los cambios se reflejan inmediatamente en la UI

4. **Persistencia:**
   - Todos los cambios se guardan automáticamente en el caché local (localStorage)
   - El caché tiene un tiempo de expiración de 60 minutos
   - Si el caché expira, se reinician los datos del menú

5. **Publicación:**
   - Al hacer clic en "Publicar Menú", los datos se enviarían al backend (no implementado en el código actual)

## Sistema de Caché

El sistema de caché es una parte fundamental del módulo "Menú del Día", permitiendo persistir los datos entre sesiones y mejorar la experiencia del usuario.

### Hook useMenuCache (src/hooks/useMenuCache.ts)

Este hook personalizado encapsula toda la lógica relacionada con el caché del menú.

**Estado Principal:**
```typescript
// Estado para controlar si el caché está habilitado o deshabilitado
const [isCacheEnabled, setIsCacheEnabled] = useState<boolean>(true);

// Estado inicial vacío
const initialState: MenuCrearMenuData = {
  categorias: [],
  productosSeleccionados: [],
  productosMenu: [],
  productosFavoritos: [],
  productosEspeciales: [],
  categoriaSeleccionada: null,
  subcategoriaSeleccionada: null,
  submenuActivo: 'menu-dia'
};

// Estado para almacenar los datos del menú
const [menuData, setMenuData] = useState<MenuCrearMenuData>(initialState);

// Estado para controlar si los datos se han cargado desde el caché
const [isLoaded, setIsLoaded] = useState(false);

// Estado para controlar si hay cambios sin guardar
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```

**Funciones Principales:**
```typescript
// Carga los datos del menú desde el caché
const loadFromCache = () => {
  if (!isCacheEnabled) {
    console.log('Caché deshabilitado, usando estado inicial');
    setMenuData(initialState);
    setIsLoaded(true);
    return;
  }
  
  const cachedData = menuCacheUtils.get();
  if (cachedData) {
    console.log('Cargando datos del menú desde caché');
    setMenuData(cachedData);
  } else {
    console.log('No hay datos en caché, usando estado inicial');
    setMenuData(initialState);
  }
  setIsLoaded(true);
};

// Guarda los datos del menú en el caché
const saveToCache = () => {
  if (!isCacheEnabled) {
    console.log('Caché deshabilitado, no se guardarán datos');
    return;
  }
  
  console.log('Guardando datos del menú en caché');
  menuCacheUtils.set(menuData);
};

// Agrega un producto al menú del día
const addProductoToMenu = (producto: Producto) => {
  // Verificar si el producto ya está en el menú
  const exists = menuData.productosMenu.some(p => p.id === producto.id);
  if (!exists) {
    setMenuData(prev => ({
      ...prev,
      productosMenu: [...prev.productosMenu, producto]
    }));
    setHasUnsavedChanges(true);
  } else {
    console.log('El producto ya está en el menú');
  }
};

// Elimina un producto del menú del día
const removeProductoFromMenu = (productoId: string) => {
  setMenuData(prev => ({
    ...prev,
    productosMenu: prev.productosMenu.filter(p => p.id !== productoId)
  }));
  setHasUnsavedChanges(true);
};
```

**Efectos:**
```typescript
// Cargar datos del caché al montar el componente
useEffect(() => {
  if (isCacheEnabled) {
    loadFromCache();
  } else {
    setMenuData(initialState);
    setIsLoaded(true);
  }
}, [isCacheEnabled]);

// Guardar en caché cuando hay cambios
useEffect(() => {
  if (isLoaded && hasUnsavedChanges && isCacheEnabled) {
    // Usar un timeout para evitar múltiples guardados en ciclos rápidos
    const timeoutId = setTimeout(() => {
      saveToCache();
      setHasUnsavedChanges(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }
}, [hasUnsavedChanges, isLoaded, isCacheEnabled]);
```

### Utilidades de Caché (src/utils/menuCache.utils.ts)

Este archivo contiene funciones de utilidad para interactuar con el localStorage de manera segura y estructurada.

**Constantes:**
```typescript
const MENU_CACHE_KEY = 'menu_crear_menu';
const MENU_CACHE_TIME = 1000 * 60 * 30; // 30 minutos
```

**Funciones Principales:**
```typescript
// Guarda los datos del menú en el caché
set: (data: MenuCrearMenuData) => {
  try {
    // Verificar si los datos son diferentes a los que ya están en caché
    const currentCache = safeLocalStorage.getItem(MENU_CACHE_KEY);
    if (currentCache) {
      const { data: cachedData } = JSON.parse(currentCache);
      // Comparar solo los IDs de los productos para evitar comparaciones profundas
      const areProductosMenuEqual = 
        JSON.stringify(data.productosMenu.map(p => p.id).sort()) === 
        JSON.stringify(cachedData.productosMenu.map((p: any) => p.id).sort());
      
      if (areProductosMenuEqual) {
        console.log('Los datos son iguales a los que ya están en caché, omitiendo guardado');
        return;
      }
    }
    
    console.log('Guardando en caché del menú:', data);
    
    // Asegurarse de que las fechas se serializan correctamente
    const dataToCache = JSON.parse(JSON.stringify(data));
    
    safeLocalStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
      data: dataToCache,
      timestamp: Date.now()
    }));
    
    console.log('Datos guardados en caché del menú correctamente');
  } catch (error) {
    console.error('Error al guardar en caché del menú:', error);
  }
},

// Obtiene los datos del menú del caché
get: (): MenuCrearMenuData | null => {
  try {
    const cached = safeLocalStorage.getItem(MENU_CACHE_KEY);
    if (!cached) {
      console.log('No hay datos en caché del menú');
      return null;
    }
    
    const { data, timestamp }: CacheData = JSON.parse(cached);
    console.log('Datos encontrados en caché del menú, timestamp:', new Date(timestamp));
    
    if (Date.now() - timestamp > MENU_CACHE_TIME) {
      console.log('Caché del menú expirado');
      safeLocalStorage.removeItem(MENU_CACHE_KEY);
      return null;
    }
    
    // Convertir las cadenas de fecha de nuevo a objetos Date
    const parsedData = data;
    
    // Convertir fechas en productos
    const convertirFechasEnProductos = (productos: Producto[]) => {
      if (productos) {
        productos.forEach(producto => {
          if (producto.metadata) {
            producto.metadata.createdAt = new Date(producto.metadata.createdAt);
            producto.metadata.lastModified = new Date(producto.metadata.lastModified);
          }
          if (producto.stock) {
            producto.stock.lastUpdated = new Date(producto.stock.lastUpdated);
          }
        });
      }
    };
    
    // Convertir fechas en todos los arrays de productos
    convertirFechasEnProductos(parsedData.productosSeleccionados);
    convertirFechasEnProductos(parsedData.productosMenu);
    convertirFechasEnProductos(parsedData.productosFavoritos);
    convertirFechasEnProductos(parsedData.productosEspeciales);
    
    console.log('Datos recuperados de caché del menú:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error al obtener datos de caché del menú:', error);
    return null;
  }
},

// Obtiene el tiempo restante de validez del caché en minutos
getRemainingTime: (): number => {
  try {
    const cached = safeLocalStorage.getItem(MENU_CACHE_KEY);
    if (!cached) {
      return 0;
    }
    
    const { timestamp }: CacheData = JSON.parse(cached);
    const remainingMs = MENU_CACHE_TIME - (Date.now() - timestamp);
    
    return remainingMs > 0 ? Math.floor(remainingMs / (1000 * 60)) : 0;
  } catch (error) {
    console.error('Error al obtener tiempo restante del caché:', error);
    return 0;
  }
}
```

## Modelos de Datos

### MenuCrearMenuData (src/utils/menuCache.utils.ts)

Este es el modelo principal que representa el estado completo del menú.

```typescript
export interface MenuCrearMenuData {
  categorias: Categoria[];
  productosSeleccionados: Producto[];
  productosMenu: Producto[];
  productosFavoritos: Producto[];
  productosEspeciales: Producto[];
  categoriaSeleccionada: string | null;
  subcategoriaSeleccionada: string | null;
  submenuActivo: 'menu-dia' | 'favoritos' | 'especiales';
}
```

### Producto (src/utils/menuCache.utils.ts)

Representa un producto individual en el sistema.

```typescript
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  currentVersion: number;
  priceHistory: any[];
  versions: any[];
  stock: ProductoStock;
  status: string;
  metadata: ProductoMetadata;
  imagen?: string;
  esFavorito?: boolean;
  esEspecial?: boolean;
}

export interface ProductoStock {
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  status: string;
  lastUpdated: Date;
  alerts?: {
    lowStock: boolean;
    overStock: boolean;
    thresholds: { low: number; high: number };
  };
}

export interface ProductoMetadata {
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  lastModifiedBy: string;
}
```

### VersionedProduct (src/app/dashboard/carta/types/product-versioning.types.ts)

Una versión extendida del modelo Producto que incluye información de versionado.

```typescript
export interface VersionedProduct {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  currentVersion: number;
  priceHistory: PriceHistory[];
  versions: ProductVersion[];
  stock: ProductStock;
  status: 'active' | 'draft' | 'archived' | 'discontinued';
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    lastModifiedBy: string;
    publishHistory?: {
      publishedAt: Date;
      publishedBy: string;
      version: number;
    }[];
  };
  categoryPath?: string[];
  tags?: string[];
  seasonality?: {
    startDate?: Date;
    endDate?: Date;
    isAvailable: boolean;
  };
  imagen?: string;
  esFavorito?: boolean;
  esEspecial?: boolean;
}
```

## Interacciones de Usuario

El módulo "Menú del Día" ofrece varias interacciones clave para el usuario:

### 1. Navegación por Categorías

- **Pestañas de Categorías**: Permiten filtrar productos por categoría (Todas, Entradas, Principio, Proteína, Acompañamientos, Bebida)
- **Acordeón de Categorías**: Permite expandir/colapsar categorías para ver los productos

### 2. Gestión de Productos

- **Agregar al Menú**: Mediante un toggle en cada producto
- **Eliminar del Menú**: Botón de eliminar en cada producto del menú
- **Ver Detalles**: Al hacer clic en un producto se abre un modal con detalles
- **Editar Cantidad**: Para productos de tipo "Proteína", se puede editar la cantidad disponible

### 3. Búsqueda de Productos

- **Buscador**: Permite buscar productos por nombre o descripción
- **Sugerencias**: Muestra sugerencias mientras se escribe

### 4. Acciones del Menú

- **Mantener Menú**: Guarda el menú actual sin publicarlo
- **Publicar Menú**: Publica el menú para que esté disponible para los clientes

### 5. Indicadores Visuales

- **Tiempo de Caché**: Muestra el tiempo restante de validez del caché
- **Notificaciones**: Informa sobre acciones exitosas o errores
- **Iconos por Categoría**: Cada categoría tiene un icono distintivo

## Integración con Backend

Aunque el módulo está diseñado para integrarse con un backend, actualmente utiliza datos simulados y almacenamiento local.

### Servicio JSON (src/services/json-data.service.ts)

Este servicio simula la carga de datos desde un backend utilizando archivos JSON locales.

```typescript
async getProductos() {
  try {
    console.log('jsonDataService: Intentando cargar productos desde /test-data/productos.json');
    const response = await fetch('/test-data/productos.json');
    console.log('jsonDataService: Respuesta recibida:', response);
    
    if (!response.ok) {
      console.error(`jsonDataService: Error al cargar productos: ${response.status}`);
      throw new Error(`Error al cargar productos: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('jsonDataService: Datos de productos cargados:', data);
    
    if (!data || data.length === 0) {
      console.warn('jsonDataService: No se encontraron productos en el archivo JSON');
    }
    
    // Transformar los datos al formato esperado por la aplicación
    const productosTransformados = data.map((prod: any) => {
      // Transformación de datos...
    });
    
    console.log(`jsonDataService: Total de productos transformados: ${productosTransformados.length}`);
    
    return productosTransformados;
  } catch (error) {
    console.error('Error al cargar productos desde JSON:', error);
    throw error;
  }
}
```

### Puntos de Integración Futuros

El código está preparado para integrarse con un backend real en el futuro:

1. **Carga de Datos**: Reemplazar las llamadas a archivos JSON por llamadas a API REST
2. **Persistencia**: Implementar la sincronización con el backend al guardar cambios
3. **Autenticación**: Agregar tokens de autenticación a las peticiones
4. **Tiempo Real**: Implementar WebSockets para actualizaciones en tiempo real
5. **Validación**: Agregar validación de datos en el servidor

## Optimizaciones y Rendimiento

El módulo "Menú del Día" implementa varias optimizaciones para garantizar un rendimiento óptimo:

### 1. Caché Local

El uso de localStorage para almacenar los datos del menú permite:
- Reducir las llamadas al servidor
- Mejorar la velocidad de carga inicial
- Proporcionar una experiencia offline básica
- Mantener el estado entre recargas de página

```typescript
// Implementación de caché con tiempo de expiración
const MENU_CACHE_TIME = 1000 * 60 * 30; // 30 minutos

// Verificación de expiración
if (Date.now() - timestamp > MENU_CACHE_TIME) {
  console.log('Caché del menú expirado');
  safeLocalStorage.removeItem(MENU_CACHE_KEY);
  return null;
}
```

### 2. Renderizado Condicional

El componente utiliza renderizado condicional para mostrar solo los elementos necesarios:

```typescript
{expandedCategory === categoria.id && (
  <div className="px-4 py-3 bg-gray-50">
    <ListaProductosRediseno 
      // Props...
    />
  </div>
)}
```

### 3. Memoización de Datos

Se implementa una comparación eficiente para evitar guardados innecesarios:

```typescript
// Comparar solo los IDs de los productos para evitar comparaciones profundas
const areProductosMenuEqual = 
  JSON.stringify(data.productosMenu.map(p => p.id).sort()) === 
  JSON.stringify(cachedData.productosMenu.map((p: any) => p.id).sort());

if (areProductosMenuEqual) {
  console.log('Los datos son iguales a los que ya están en caché, omitiendo guardado');
  return;
}
```

### 4. Debouncing

Se implementa un debounce para evitar múltiples guardados en ciclos rápidos:

```typescript
// Guardar en caché cuando hay cambios
useEffect(() => {
  if (isLoaded && hasUnsavedChanges && isCacheEnabled) {
    // Usar un timeout para evitar múltiples guardados en ciclos rápidos
    const timeoutId = setTimeout(() => {
      saveToCache();
      setHasUnsavedChanges(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }
}, [hasUnsavedChanges, isLoaded, isCacheEnabled]);
```

### 5. Carga Progresiva

Los productos se cargan por categoría, lo que reduce la cantidad de datos iniciales:

```typescript
// Cargar productos específicos de la categoría
console.log('Intentando cargar productos de categoría ' + categoriaId + '...');
const productos = await jsonDataService.getProductosByCategoria(categoriaId);
```

## Consideraciones Técnicas

### 1. Manejo de Fechas

El sistema maneja cuidadosamente la serialización y deserialización de fechas:

```typescript
// Convertir fechas en productos
const convertirFechasEnProductos = (productos: Producto[]) => {
  if (productos) {
    productos.forEach(producto => {
      if (producto.metadata) {
        producto.metadata.createdAt = new Date(producto.metadata.createdAt);
        producto.metadata.lastModified = new Date(producto.metadata.lastModified);
      }
      if (producto.stock) {
        producto.stock.lastUpdated = new Date(producto.stock.lastUpdated);
      }
    });
  }
};
```

### 2. Seguridad en localStorage

Se implementa un acceso seguro a localStorage para evitar errores en entornos SSR:

```typescript
// Función segura para acceder a localStorage (solo en el cliente)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};
```

### 3. Conversión de Tipos

El sistema implementa funciones de conversión entre tipos de datos:

```typescript
// Función para convertir un Producto a VersionedProduct
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
```

### 4. Manejo de Errores

El sistema implementa un manejo de errores robusto:

```typescript
try {
  // Operaciones...
} catch (error) {
  console.error('Error al cargar productos desde JSON:', error);
  // Lógica de manejo de errores...
} finally {
  setCargandoProductos(false);
}
```

### 5. Compatibilidad con Next.js

El código está diseñado para funcionar correctamente con Next.js:

- Uso de 'use client' para componentes del lado del cliente
- Manejo seguro de localStorage para evitar errores en SSR
- Uso de Image de Next.js para optimización de imágenes

```typescript
'use client';

import Image from 'next/image';

// Componente...
```

### 6. Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

- Separación clara de responsabilidades
- Uso de interfaces para definir contratos
- Componentes modulares y reutilizables
- Hooks personalizados para encapsular lógica
