// src/app/dashboard/carta/menu-dia/utils/menu-dia.utils.ts

import type { 
  Producto, 
  ProductoFavorito, 
  Categoria,
  CATEGORIAS_MENU_CONFIG 
} from '../types/menu-dia.types';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

/**
 * Utilidades específicas del módulo Menu del Día
 * Todo autocontenido dentro del módulo
 */

// ========= CONVERSIONES DE PRODUCTOS =========

/**
 * Convierte un Producto a VersionedProduct para compatibilidad
 */
export function convertToVersionedProduct(producto: Producto): VersionedProduct {
  const stockStatus = producto.stock?.status as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined || 'out_of_stock';
  const stockData = producto.stock || { 
    currentQuantity: 0, 
    minQuantity: 0, 
    maxQuantity: 0, 
    status: 'out_of_stock', 
    lastUpdated: new Date() 
  };

  return {
    id: producto.id,
    nombre: producto.nombre,
    // ✅ FIX: Asegurar que descripcion siempre sea string
    descripcion: producto.descripcion ?? '', // Usar coalescencia nula para convertir undefined a string vacío
    currentPrice: producto.precio || 0,
    categoriaId: producto.categoriaId,
    currentVersion: typeof producto.currentVersion === 'number' 
      ? producto.currentVersion 
      : (typeof producto.currentVersion === 'string' ? parseFloat(producto.currentVersion) : 1.0),
    priceHistory: Array.isArray(producto.priceHistory) ? producto.priceHistory : [],
    versions: Array.isArray(producto.versions) ? producto.versions : [],
    stock: {
      ...stockData,
      status: stockStatus,
    },
    status: producto.status as 'active' | 'draft' | 'archived' | 'discontinued' || 'active',
    metadata: producto.metadata || { 
      createdAt: new Date(), 
      createdBy: 'unknown', 
      lastModified: new Date(), 
      lastModifiedBy: 'unknown' 
    },
    // ✅ FIX: Asegurar que imagen sea opcional pero no undefined cuando se pasa
    imagen: producto.imagen || undefined,
    esFavorito: producto.esFavorito,
    esEspecial: producto.esEspecial
  };
}

/**
 * Convierte un VersionedProduct a Producto
 */
export function convertToProducto(versionedProduct: VersionedProduct): Producto {
  return {
    id: versionedProduct.id,
    nombre: versionedProduct.nombre,
    // ✅ FIX: Manejar descripcion correctamente (puede ser undefined en Producto)
    descripcion: versionedProduct.descripcion || undefined,
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
}

// ========= VALIDACIÓN Y LIMPIEZA =========

/**
 * Limpia y valida strings
 */
export function cleanString(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }
  
  if (typeof str !== 'string') {
    return String(str);
  }
  
  // Normalizar espacios
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Valida un producto antes de procesarlo
 */
export function validateProduct(producto: any): producto is Producto {
  if (!producto || typeof producto !== 'object') {
    console.warn('⚠️ Producto no es un objeto válido:', producto);
    return false;
  }

  if (!producto.id || typeof producto.id !== 'string' || producto.id.trim() === '') {
    console.warn('⚠️ Producto sin ID válido:', producto);
    return false;
  }

  if (!producto.nombre || typeof producto.nombre !== 'string' || producto.nombre.trim() === '') {
    console.warn('⚠️ Producto sin nombre válido:', producto);
    return false;
  }

  if (!producto.categoriaId || typeof producto.categoriaId !== 'string' || producto.categoriaId.trim() === '') {
    console.warn('⚠️ Producto sin categoriaId válido:', producto);
    return false;
  }

  return true;
}

/**
 * Valida y limpia una lista de productos
 */
export function validarYLimpiarProductos(productos: any[]): Producto[] {
  if (!Array.isArray(productos)) {
    console.warn('⚠️ Productos no es un array, devolviendo array vacío');
    return [];
  }

  return productos
    .filter(validateProduct)
    .map(producto => ({
      ...producto,
      nombre: cleanString(producto.nombre),
      // ✅ FIX: Solo limpiar descripcion si existe
      descripcion: producto.descripcion ? cleanString(producto.descripcion) : undefined
    }));
}

// ========= CATEGORÍAS =========

/**
 * Obtiene el icono para una categoría según su nombre
 */
export function getIconForCategory(nombreCategoria: string): string {
  const nombre = cleanString(nombreCategoria).toLowerCase();
  
  if (nombre.includes('entrada')) {
    return '🍲';
  } else if (nombre.includes('principio')) {
    return '🍽️';
  } else if (nombre.includes('proteina') || nombre.includes('proteína')) {
    return '🥩';
  } else if (nombre.includes('acompañamiento') || nombre.includes('acompanamiento')) {
    return '🥗';
  } else if (nombre.includes('bebida')) {
    return '☕';
  } else {
    return '🍽️';
  }
}

/**
 * Obtiene el color para una categoría según su nombre
 */
export function getColorForCategory(nombreCategoria: string): string {
  const nombre = cleanString(nombreCategoria).toLowerCase();
  
  if (nombre.includes('entrada')) {
    return 'text-orange-500';
  } else if (nombre.includes('principio')) {
    return 'text-yellow-500';
  } else if (nombre.includes('proteina') || nombre.includes('proteína')) {
    return 'text-red-500';
  } else if (nombre.includes('acompañamiento') || nombre.includes('acompanamiento')) {
    return 'text-green-500';
  } else if (nombre.includes('bebida')) {
    return 'text-blue-500';
  } else {
    return 'text-gray-500';
  }
}

/**
 * Verifica si una categoría es de proteínas
 */
export function esCategoriaPoteinas(categoriaId: string, categorias: Categoria[]): boolean {
  const categoria = categorias.find(cat => cat.id === categoriaId);
  const nombreCategoria = cleanString(categoria?.nombre || '');
  return nombreCategoria.toLowerCase().includes('proteina') || nombreCategoria.toLowerCase().includes('proteína');
}

// ========= FAVORITOS =========

/**
 * Convierte ProductoFavorito a Producto para compatibilidad
 */
export function favoritoToProducto(favorito: ProductoFavorito): Producto {
  return {
    id: favorito.product_id,
    nombre: favorito.product_name || 'Producto sin nombre',
    // ✅ FIX: Manejar descripcion opcional correctamente
    descripcion: favorito.product_description || undefined,
    precio: 0, // No tenemos precio en favoritos
    categoriaId: favorito.category_id || '',
    currentVersion: 1.0,
    stock: {
      currentQuantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      status: 'in_stock',
      lastUpdated: new Date()
    },
    status: 'active',
    priceHistory: [],
    versions: [],
    metadata: {
      createdAt: favorito.created_at,
      createdBy: favorito.user_id,
      lastModified: favorito.updated_at,
      lastModifiedBy: favorito.user_id
    },
    imagen: favorito.product_image,
    esFavorito: true,
    esEspecial: false
  };
}

// ========= FILTROS Y BÚSQUEDA =========

/**
 * Filtra productos por término de búsqueda
 */
export function filtrarProductosPorTermino(
  term: string, 
  productos: Producto[]
): Producto[] {
  if (!term.trim()) return productos;
  
  const termLower = term.toLowerCase();
  return productos.filter(p => 
    p.nombre.toLowerCase().includes(termLower) || 
    (p.descripcion && p.descripcion.toLowerCase().includes(termLower))
  );
}

/**
 * Filtra productos por categoría
 */
export function filtrarProductosPorCategoria(
  categoriaId: string,
  productos: Producto[]
): Producto[] {
  if (!categoriaId) return productos;
  return productos.filter(p => p.categoriaId === categoriaId);
}

// ========= ORDENAMIENTO =========

/**
 * Ordena categorías según el orden predefinido
 */
export function ordenarCategorias(categorias: Categoria[]): Categoria[] {
  const orden = [
    'b4e792ba-b00d-4348-b9e3-f34992315c23', // Entradas
    '2d4c3ea8-843e-4312-821e-54d1c4e79dce', // Principios
    '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', // Proteínas
    'a272bc20-464c-443f-9283-4b5e7bfb71cf', // Acompañamientos
    '6feba136-57dc-4448-8357-6f5533177cfd'  // Bebidas
  ];

  return orden
    .map(id => categorias.find(cat => cat.id === id))
    .filter((cat): cat is Categoria => cat !== undefined);
}

// ========= FORMATEO =========

/**
 * Formatea precio en formato colombiano
 */
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
}

/**
 * Formatea fecha relativa (ej: "hace 2 horas")
 */
export function formatearFechaRelativa(fecha: Date): string {
  const ahora = new Date();
  const diff = ahora.getTime() - fecha.getTime();
  const segundos = Math.floor(diff / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) {
    return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  } else if (horas > 0) {
    return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  } else if (minutos > 0) {
    return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  } else {
    return 'hace un momento';
  }
}

// ========= DEBUGGING =========

/**
 * Log formateado para debugging del módulo
 */
export function debugLog(categoria: string, mensaje: string, data?: any): void {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `🔍 [MenuDia-${categoria}] ${timestamp}:`;
  
  if (data) {
    console.log(prefix, mensaje, data);
  } else {
    console.log(prefix, mensaje);
  }
}

/**
 * Valida configuración del módulo
 */
export function validarConfiguracion(config: {
  userId?: string;
  restauranteId?: string;
}): boolean {
  if (!config.userId) {
    console.error('❌ userId es requerido para el módulo menu-dia');
    return false;
  }

  // restauranteId es opcional por ahora
  return true;
}
