// src/utils/init-cache.ts
import { 
  menuCacheUtils, 
  MenuCrearMenuData, 
  Producto as MenuCacheProducto
} from './menuCache.utils';
import { todasLasCategoriasBase, todosLosProductosBase } from '@/data/staticMenuData';

/**
 * Función genérica para cargar datos de productos desde cualquier fuente
 * @param url URL o endpoint para cargar los datos
 * @param dataPath Ruta para acceder al array de productos dentro del objeto JSON (ej. 'menuDia', 'productos')
 * @param defaultValue Valor por defecto si no se encuentran datos
 */
const cargarDatosProductosGenerico = async (
  url: string,
  dataPath?: string,
  defaultValue: MenuCacheProducto[] = []
): Promise<MenuCacheProducto[]> => {
  try {
    console.log(`Cargando datos desde ${url}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Error al cargar datos desde ${url}: ${response.status}`);
      return defaultValue;
    }
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error(`Error al parsear respuesta de ${url}:`, parseError);
      return defaultValue;
    }
    
    // Extraer el array de productos según la ruta proporcionada o buscar automáticamente
    let productosArray: any[] = defaultValue;
    
    // Función para extraer datos anidados usando una ruta de acceso
    const extractNestedData = (obj: any, path?: string): any => {
      if (!path) return obj;
      
      // Manejar rutas anidadas como 'menuDia.productos'
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          console.warn(`No se pudo acceder a la ruta '${path}' en el objeto:`, obj);
          return null;
        }
      }
      
      return current;
    };
    
    if (Array.isArray(data)) {
      // Si la respuesta ya es un array, usarlo directamente
      productosArray = data;
      console.log(`La respuesta de ${url} ya es un array de ${data.length} elementos`);
    } else if (data && typeof data === 'object') {
      if (dataPath) {
        // Si se proporciona una ruta específica, intentar extraer los datos
        const extractedData = extractNestedData(data, dataPath);
        
        if (Array.isArray(extractedData)) {
          productosArray = extractedData;
          console.log(`Extraído array de ${extractedData.length} productos usando la ruta '${dataPath}'`);
        } else if (extractedData && typeof extractedData === 'object') {
          // Si el resultado no es un array pero es un objeto, buscar arrays dentro de él
          const nestedArrays = Object.entries(extractedData)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, value: value as any[] }));
          
          if (nestedArrays.length > 0) {
            productosArray = nestedArrays[0].value;
            console.log(`Usando array anidado de la propiedad '${nestedArrays[0].key}' dentro de '${dataPath}'`);
          } else {
            console.warn(`La ruta '${dataPath}' no contiene un array ni tiene propiedades que sean arrays`);
          }
        } else {
          console.warn(`La ruta '${dataPath}' no apunta a un array o un objeto en la respuesta de ${url}`);
        }
      } else {
        // Buscar automáticamente cualquier propiedad que contenga un array
        // Primero buscar en el nivel superior
        const topLevelArrays = Object.entries(data)
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, value: value as any[], depth: 1 }));
        
        // Si no hay arrays en el nivel superior, buscar un nivel más profundo
        let arrayProps = topLevelArrays;
        
        if (arrayProps.length === 0) {
          // Buscar arrays anidados un nivel más profundo
          for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              const nestedArrays = Object.entries(value)
                .filter(([_, nestedValue]) => Array.isArray(nestedValue))
                .map(([nestedKey, nestedValue]) => ({ 
                  key: `${key}.${nestedKey}`, 
                  value: nestedValue as any[],
                  depth: 2
                }));
              
              arrayProps = [...arrayProps, ...nestedArrays];
            }
          }
        }
        
        if (arrayProps.length > 0) {
          // Ordenar por profundidad (preferir arrays menos anidados)
          arrayProps.sort((a, b) => a.depth - b.depth);
          
          productosArray = arrayProps[0].value;
          console.log(`Usando array de productos de la propiedad '${arrayProps[0].key}' en ${url}`);
        }
      }
    }
    
    // Verificar que el resultado sea un array
    if (!Array.isArray(productosArray)) {
      console.warn(`No se encontró un array de productos en la respuesta de ${url}`);
      return defaultValue;
    }
    
    // Transformar cada producto para asegurar que cumpla con la estructura de MenuCacheProducto
    const productosTransformados = productosArray
      .filter(producto => producto && typeof producto === 'object')
      .map(producto => {
        // Asegurar que el producto tenga la estructura correcta
        const productoNormalizado = {
          id: producto.id || producto.id_producto || '',
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          categoriaId: producto.categoriaId || producto.id_categoria || '',
          currentVersion: producto.currentVersion || 1,
          priceHistory: Array.isArray(producto.priceHistory) ? producto.priceHistory : [],
          versions: Array.isArray(producto.versions) ? producto.versions : [],
          stock: producto.stock || {
            currentQuantity: 0,
            minQuantity: 0,
            maxQuantity: 0,
            status: 'out_of_stock',
            lastUpdated: new Date()
          },
          status: producto.status || 'active',
          metadata: producto.metadata || {
            createdAt: new Date(),
            createdBy: 'system',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          },
          imagen: producto.imagen || producto.imagen_url || '',
          esFavorito: producto.esFavorito || false,
          esEspecial: producto.esEspecial || false
        };
        
        return convertirFechasEnProducto(productoNormalizado);
      });
    
    console.log(`Datos cargados desde ${url}: ${productosTransformados.length} productos válidos`);
    return productosTransformados;
  } catch (error) {
    console.error(`Error al cargar datos desde ${url}:`, error);
    return defaultValue;
  }
};

/**
 * Carga los datos de sesión del menú del día desde la API
 */
const cargarDatosMenuDia = async (): Promise<MenuCacheProducto[]> => {
  try {
    console.log('Cargando datos del menú del día...');
    // Intentar cargar usando la ruta específica 'menuDia'
    const productos = await cargarDatosProductosGenerico('/api/menu-dia', 'menuDia', []);
    
    if (productos.length === 0) {
      console.log('No se encontraron productos en la ruta menuDia, intentando sin ruta específica...');
      // Si no se encontraron productos, intentar sin especificar una ruta
      return cargarDatosProductosGenerico('/api/menu-dia', undefined, []);
    }
    
    return productos;
  } catch (error) {
    console.error('Error al cargar menú del día:', error);
    return [];
  }
};

/**
 * Convierte las fechas de string a Date en un producto
 */
const convertirFechasEnProducto = (producto: any): MenuCacheProducto => {
  // Convertir fechas en stock
  if (producto.stock && producto.stock.lastUpdated) {
    producto.stock.lastUpdated = new Date(producto.stock.lastUpdated);
  }
  
  // Convertir fechas en metadata
  if (producto.metadata) {
    if (producto.metadata.createdAt) {
      producto.metadata.createdAt = new Date(producto.metadata.createdAt);
    }
    if (producto.metadata.lastModified) {
      producto.metadata.lastModified = new Date(producto.metadata.lastModified);
    }
  }
  
  return producto as MenuCacheProducto;
};

/**
 * Carga los datos de productos favoritos
 */
const cargarFavoritos = async (): Promise<MenuCacheProducto[]> => {
  try {
    // Importar directamente el archivo JSON
    const favoritosData = (await import('@/test-data/favoritos/favoritos.json')).default;
    
    // Verificar y transformar los datos
    if (!Array.isArray(favoritosData)) {
      console.warn('Los datos de favoritos no son un array');
      return [];
    }
    
    // Convertir fechas de string a Date y asegurar estructura correcta
    const favoritosConvertidos = favoritosData.map(producto => {
      return convertirFechasEnProducto(producto);
    }).filter(Boolean) as MenuCacheProducto[];
    
    console.log(`Favoritos cargados: ${favoritosConvertidos.length} productos`);
    return favoritosConvertidos;
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
    // Intentar cargar desde la URL como fallback
    return cargarDatosProductosGenerico('/src/test-data/favoritos/favoritos.json', undefined, []);
  }
};

/**
 * Carga los datos de productos especiales
 */
const cargarEspeciales = async (): Promise<MenuCacheProducto[]> => {
  try {
    // Importar directamente el archivo JSON
    const especialesData = (await import('@/test-data/especiales/especiales.json')).default;
    
    // Verificar y transformar los datos
    if (!Array.isArray(especialesData)) {
      console.warn('Los datos de especiales no son un array');
      return [];
    }
    
    // Convertir fechas de string a Date y asegurar estructura correcta
    const especialesConvertidos = especialesData.map(producto => {
      return convertirFechasEnProducto(producto);
    }).filter(Boolean) as MenuCacheProducto[];
    
    console.log(`Especiales cargados: ${especialesConvertidos.length} productos`);
    return especialesConvertidos;
  } catch (error) {
    console.error('Error al cargar especiales:', error);
    // Intentar cargar desde la URL como fallback
    return cargarDatosProductosGenerico('/src/test-data/especiales/especiales.json', undefined, []);
  }
};

/**
 * Inicializa el caché del menú con los datos de sesión
 */
export const initializeCoreMenuCache = async () => {
  try {
    console.log("Iniciando inicialización del caché de sesión 'menu_crear_menu'...");

    // Verificar si ya existe un caché válido
    const existingCoreMenuData = menuCacheUtils.get();
    if (existingCoreMenuData) {
      console.log("'menu_crear_menu' ya existe y es válido. Omitiendo inicialización.");
      return;
    }
    
    console.log("'menu_crear_menu' no encontrado o expirado. Inicializando con datos de sesión.");

    // Cargar datos de sesión en paralelo
    const [
      productosParaMenuDia,
      productosParaFavoritos,
      productosParaEspeciales
    ] = await Promise.all([
      cargarDatosMenuDia(),
      cargarFavoritos(),
      cargarEspeciales()
    ]);

    // Crear datos de sesión iniciales
    // Nota: categorias y productosSeleccionados se cargan directamente desde staticMenuData.ts
    const sessionData: MenuCrearMenuData = {
      // Estos arrays vacíos serán reemplazados por los datos importados en useMenuCache
      categorias: [],
      productosSeleccionados: [],
      
      // Datos de sesión - asegurar que siempre sean arrays
      productosMenu: Array.isArray(productosParaMenuDia) ? productosParaMenuDia : [],
      productosFavoritos: Array.isArray(productosParaFavoritos) ? productosParaFavoritos : [],
      productosEspeciales: Array.isArray(productosParaEspeciales) ? productosParaEspeciales : [],
      categoriaSeleccionada: null,
      subcategoriaSeleccionada: null,
      submenuActivo: 'menu-dia'
    };

    // Verificación final de integridad de datos
    Object.entries(sessionData).forEach(([key, value]) => {
      // Verificar que las propiedades que deben ser arrays lo sean
      if (['productosMenu', 'productosFavoritos', 'productosEspeciales', 'categorias', 'productosSeleccionados'].includes(key)) {
        if (!Array.isArray(value)) {
          console.warn(`La propiedad ${key} no es un array. Corrigiendo...`);
          (sessionData as any)[key] = [];
        }
      }
    });

    // Guardar en caché
    menuCacheUtils.set(sessionData);
    console.log("Caché de sesión 'menu_crear_menu' inicializado correctamente.");

  } catch (error) {
    console.error("Error al inicializar caché de sesión 'menu_crear_menu':", error);
  }
};

/**
 * Fuerza la inicialización del caché del menú
 */
export const forceInitializeCoreMenuCache = async () => {
  console.log("Forzando la inicialización del caché de sesión 'menu_crear_menu'...");
  
  // Limpiar caché
  menuCacheUtils.clear();
  console.log("Caché de sesión 'menu_crear_menu' limpiado.");
  
  // Inicializar caché
  await initializeCoreMenuCache();
  
  console.log("Caché de sesión 'menu_crear_menu' reinicializado. Recargando la página...");
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

export { 
  initializeCoreMenuCache as initializeCache,
  forceInitializeCoreMenuCache as forceInitializeCache
};
