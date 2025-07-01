// src/data/staticMenuData.ts
import categoriasJson from '@/test-data/cargainicial/categorias.json';
import subcategoriasJson from '@/test-data/cargainicial/subcategorias.json';
import entradasJson from '@/test-data/cargainicial/productos/entradas.json';
import principiosJson from '@/test-data/cargainicial/productos/principios.json';
import proteinasJson from '@/test-data/cargainicial/productos/proteinas.json';
import acompañamientosJson from '@/test-data/cargainicial/productos/acompañamientos.json';
import bebidasJson from '@/test-data/cargainicial/productos/bebidas.json';
import { Categoria, Producto, ProductoStock, ProductoMetadata } from '@/utils/menuCache.utils';

/**
 * Transforma los datos de categorías del formato JSON al formato utilizado por la aplicación
 */
const transformarCategorias = (): Categoria[] => {
  return categoriasJson.map((cat: any) => ({
    id: cat.id_categoria,
    nombre: cat.nombre,
    tipo: 'principal',
  }));
};

/**
 * Transforma los datos de subcategorías del formato JSON al formato utilizado por la aplicación
 */
const transformarSubcategorias = (): Categoria[] => {
  return subcategoriasJson.map((subcat: any) => ({
    id: subcat.id_subcategoria,
    nombre: subcat.nombre,
    tipo: 'subcategoria',
    parentId: subcat.id_categoria_padre,
  }));
};

/**
 * Transforma un producto del formato JSON al formato utilizado por la aplicación
 */
const transformarProducto = (prod: any): Producto => {
  const esDisponible = prod.estado_disponible === true || prod.estado_disponible === 'true' || prod.estado_disponible === 1;
  const stockActual = parseInt(String(prod.stock_actual), 10) || 0;
  const stockMinimo = parseInt(String(prod.stock_minimo), 10) || 0;

  const stockStatusLogic = (): ProductoStock['status'] => {
    if (!esDisponible) return 'out_of_stock';
    if (stockActual <= 0) return 'out_of_stock';
    if (stockActual <= stockMinimo) return 'low_stock';
    return 'in_stock';
  };
  const currentStockStatus = stockStatusLogic();

  return {
    id: String(prod.id_producto),
    nombre: String(prod.nombre),
    descripcion: String(prod.descripcion),
    categoriaId: String(prod.id_categoria),
    imagen: String(prod.imagen_url || '/images/placeholder.jpg'),
    precio: Number(prod.precio || 0),
    currentVersion: parseInt(String(prod.currentVersion), 10) || 1,
    priceHistory: prod.priceHistory || [],
    versions: prod.versions || [],
    status: esDisponible ? 'active' : 'archived',
    stock: {
      currentQuantity: stockActual,
      minQuantity: stockMinimo,
      maxQuantity: parseInt(String(prod.stock_maximo), 10) || 100,
      status: currentStockStatus,
      lastUpdated: prod.fecha_actualizacion ? new Date(prod.fecha_actualizacion) : new Date(),
      alerts: {
        lowStock: currentStockStatus === 'low_stock',
        overStock: false, 
        thresholds: { low: stockMinimo, high: parseInt(String(prod.stock_maximo), 10) || 100 }
      }
    },
    metadata: {
      createdAt: prod.fecha_creacion ? new Date(prod.fecha_creacion) : new Date(),
      createdBy: String(prod.createdBy || "system_init"),
      lastModified: prod.fecha_actualizacion ? new Date(prod.fecha_actualizacion) : new Date(),
      lastModifiedBy: String(prod.lastModifiedBy || "system_init")
    },
  };
};

/**
 * Transforma los datos de productos por categoría
 */
const transformarProductosPorCategoria = (): Producto[] => {
  // Transformar cada categoría de productos
  const entradas = Array.isArray(entradasJson) ? entradasJson.map(transformarProducto) : [];
  const principios = Array.isArray(principiosJson) ? principiosJson.map(transformarProducto) : [];
  const proteinas = Array.isArray(proteinasJson) ? proteinasJson.map(transformarProducto) : [];
  const acompañamientos = Array.isArray(acompañamientosJson) ? acompañamientosJson.map(transformarProducto) : [];
  const bebidas = Array.isArray(bebidasJson) ? bebidasJson.map(transformarProducto) : [];

  // Combinar todos los productos
  return [
    ...entradas,
    ...principios,
    ...proteinas,
    ...acompañamientos,
    ...bebidas
  ];
};

// Transformar los datos una sola vez al importar el módulo
const todasLasCategoriasBase: Categoria[] = [...transformarCategorias(), ...transformarSubcategorias()];
const todosLosProductosBase: Producto[] = transformarProductosPorCategoria();

// Exportar los datos transformados
export { todasLasCategoriasBase, todosLosProductosBase };
