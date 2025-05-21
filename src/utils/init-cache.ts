// src/utils/init-cache.ts
import { cacheUtils } from './cache.utils';

// Claves para almacenar diferentes tipos de datos en localStorage
const CACHE_KEYS = {
  PRODUCTOS: 'menu_productos',
  CATEGORIAS: 'menu_categorias',
  SUBCATEGORIAS: 'menu_subcategorias',
  MENU_DIA: 'menu_dia',
  COMBINACIONES: 'menu_combinaciones',
  ESPECIALES: 'menu_especiales',
  FAVORITOS: 'menu_favoritos',
  PROGRAMACION: 'menu_programacion'
};

/**
 * Inicializa el caché con datos de los archivos JSON
 * Esta función se debe llamar al iniciar la aplicación
 */
export const initializeCache = async () => {
  try {
    console.log('Inicializando caché con datos de archivos JSON...');
    
    // 1. Cargar categorías
    await cargarCategorias();
    
    // 2. Cargar subcategorías
    await cargarSubcategorias();
    
    // 3. Cargar productos
    await cargarProductos();
    
    // 4. Cargar menú del día
    await cargarMenuDia();
    
    // 5. Cargar combinaciones
    await cargarCombinaciones();
    
    // 6. Cargar especiales
    await cargarEspeciales();
    
    // 7. Cargar favoritos
    await cargarFavoritos();
    
    // 8. Cargar programación
    await cargarProgramacion();
    
    console.log('Inicialización del caché completada');
  } catch (error) {
    console.error('Error al inicializar el caché:', error);
  }
};

/**
 * Carga las categorías desde el archivo JSON
 */
const cargarCategorias = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.CATEGORIAS);
    if (cachedData) {
      console.log('Categorías ya están en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/categorias.json');
    if (!response.ok) {
      throw new Error(`Error al cargar categorías: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.CATEGORIAS, JSON.stringify(data));
    
    console.log('Categorías cargadas:', data.length);
    return data;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return [];
  }
};

/**
 * Carga las subcategorías desde el archivo JSON
 */
const cargarSubcategorias = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.SUBCATEGORIAS);
    if (cachedData) {
      console.log('Subcategorías ya están en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/subcategorias.json');
    if (!response.ok) {
      throw new Error(`Error al cargar subcategorías: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.SUBCATEGORIAS, JSON.stringify(data));
    
    console.log('Subcategorías cargadas:', data.length);
    return data;
  } catch (error) {
    console.error('Error al cargar subcategorías:', error);
    return [];
  }
};

/**
 * Carga los productos desde el archivo JSON
 */
const cargarProductos = async () => {
  try {
    // Siempre cargar los datos frescos del archivo JSON
    console.log('Cargando productos desde el archivo JSON...');
    
    const response = await fetch('/test-data/productos.json');
    if (!response.ok) {
      throw new Error(`Error al cargar productos: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformar los datos al formato esperado por la aplicación
    const productosFormateados = data.map((prod: any) => ({
      id: prod.id_producto,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      descripcion_corta: prod.descripcion_corta,
      categoriaId: prod.id_categoria,
      subcategoriaId: prod.id_subcategoria,
      imagen: prod.imagen_url,
      imagen_miniatura: prod.imagen_miniatura_url,
      estado_disponible: prod.estado_disponible,
      cantidad: prod.stock_actual || 50, // Asignar un valor por defecto si no existe
      precio: Math.floor(Math.random() * 10000) + 5000, // Precio aleatorio entre 5000 y 15000
      currentVersion: 1,
      status: prod.estado_disponible ? 'active' : 'archived'
    }));
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.PRODUCTOS, JSON.stringify(productosFormateados));
    
    // También guardar en el caché de combinaciones para compatibilidad
    cacheUtils.set(productosFormateados);
    
    console.log('Productos cargados:', productosFormateados.length);
    return productosFormateados;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
};

/**
 * Carga el menú del día desde el archivo JSON
 */
const cargarMenuDia = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.MENU_DIA);
    if (cachedData) {
      console.log('Menú del día ya está en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/menu-dia/menu-dia.json');
    if (!response.ok) {
      throw new Error(`Error al cargar menú del día: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.MENU_DIA, JSON.stringify(data));
    
    console.log('Menú del día cargado');
    return data;
  } catch (error) {
    console.error('Error al cargar menú del día:', error);
    return null;
  }
};

/**
 * Carga las combinaciones desde el archivo JSON
 */
const cargarCombinaciones = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.COMBINACIONES);
    if (cachedData) {
      console.log('Combinaciones ya están en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/combinaciones.json');
    if (!response.ok) {
      throw new Error(`Error al cargar combinaciones: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.COMBINACIONES, JSON.stringify(data));
    
    console.log('Combinaciones cargadas:', data.length);
    return data;
  } catch (error) {
    console.error('Error al cargar combinaciones:', error);
    return [];
  }
};

/**
 * Carga los especiales desde el archivo JSON
 */
const cargarEspeciales = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.ESPECIALES);
    if (cachedData) {
      console.log('Especiales ya están en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/especiales/especiales.json');
    if (!response.ok) {
      throw new Error(`Error al cargar especiales: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.ESPECIALES, JSON.stringify(data));
    
    console.log('Especiales cargados:', data.length);
    return data;
  } catch (error) {
    console.error('Error al cargar especiales:', error);
    return [];
  }
};

/**
 * Carga los favoritos desde el archivo JSON
 */
const cargarFavoritos = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.FAVORITOS);
    if (cachedData) {
      console.log('Favoritos ya están en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/favoritos/favoritos.json');
    if (!response.ok) {
      throw new Error(`Error al cargar favoritos: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.FAVORITOS, JSON.stringify(data));
    
    console.log('Favoritos cargados:', data.length);
    return data;
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
    return [];
  }
};

/**
 * Carga la programación desde el archivo JSON
 */
const cargarProgramacion = async () => {
  try {
    // Verificar si ya hay datos en el caché
    const cachedData = localStorage.getItem(CACHE_KEYS.PROGRAMACION);
    if (cachedData) {
      console.log('Programación ya está en caché');
      return JSON.parse(cachedData);
    }
    
    const response = await fetch('/test-data/programacion-semanal/programacion-actual.json');
    if (!response.ok) {
      throw new Error(`Error al cargar programación: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem(CACHE_KEYS.PROGRAMACION, JSON.stringify(data));
    
    console.log('Programación cargada');
    return data;
  } catch (error) {
    console.error('Error al cargar programación:', error);
    return null;
  }
};

/**
 * Fuerza la inicialización del caché limpiando los datos actuales
 */
export const forceInitializeCache = async () => {
  console.log('Forzando la inicialización del caché...');
  
  // Limpiar el caché actual
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    console.log(`Caché '${key}' eliminado`);
  });
  
  // Limpiar el caché de combinaciones
  cacheUtils.clear();
  console.log('Caché de combinaciones limpiado');
  
  // Inicializar con nuevos datos
  await initializeCache();
  
  // Recargar la página para aplicar los cambios
  console.log('Caché inicializado correctamente. Recargando la página...');
  window.location.reload();
  
  return true;
};

/**
 * Función para recargar los productos sin afectar el resto del caché
 */
export const reloadProductos = async () => {
  console.log('Recargando productos desde el archivo JSON...');
  
  try {
    // Eliminar productos del caché
    localStorage.removeItem(CACHE_KEYS.PRODUCTOS);
    console.log('Caché de productos eliminado');
    
    // Cargar productos frescos
    const productos = await cargarProductos();
    console.log(`${productos.length} productos cargados correctamente`);
    
    return true;
  } catch (error) {
    console.error('Error al recargar productos:', error);
    return false;
  }
};
