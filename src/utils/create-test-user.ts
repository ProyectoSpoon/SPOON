// src/utils/create-test-user.ts

/**
 * Utilidad para crear un usuario de prueba para el sistema
 * Este archivo se puede ejecutar directamente con ts-node
 */

import { menuCacheUtils, Categoria, Producto } from './menuCache.utils';

/**
 * Crea un usuario de prueba con datos predefinidos
 */
export function createTestUser() {
  // Categorías de prueba
  const categorias: Categoria[] = [
    {
      id: 'menu-dia',
      nombre: 'MENÚ DEL DÍA',
      tipo: 'principal',
    },
    {
      id: 'favoritos',
      nombre: 'PLATOS FAVORITOS',
      tipo: 'principal',
    },
    {
      id: 'especiales',
      nombre: 'PLATOS ESPECIALES',
      tipo: 'principal',
    },
    {
      id: 'entrada',
      nombre: 'Entrada',
      tipo: 'subcategoria',
      parentId: 'menu-dia',
    },
    {
      id: 'principio',
      nombre: 'Principio',
      tipo: 'subcategoria',
      parentId: 'menu-dia',
    },
    {
      id: 'proteina',
      nombre: 'Proteína',
      tipo: 'subcategoria',
      parentId: 'menu-dia',
    },
    {
      id: 'acompanamiento',
      nombre: 'Acompañamiento',
      tipo: 'subcategoria',
      parentId: 'menu-dia',
    },
    {
      id: 'bebida',
      nombre: 'Bebida',
      tipo: 'subcategoria',
      parentId: 'menu-dia',
    },
  ];

  // Función para crear un producto base
  const createBaseProducto = (
    id: string,
    nombre: string,
    descripcion: string,
    categoriaId: string
  ): Producto => ({
    id,
    nombre,
    descripcion,
    precio: Math.floor(Math.random() * 20000) + 5000, // Precio aleatorio entre 5000 y 25000
    categoriaId,
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: Math.floor(Math.random() * 50) + 10,
      minQuantity: 5,
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
    }
  });

  // Productos para el menú del día
  const productosMenu: Producto[] = [
    createBaseProducto('e1', 'Sopa de Guineo', 'Sopa tradicional con plátano verde', 'entrada'),
    createBaseProducto('p1', 'Frijoles', 'Frijoles rojos cocinados con platano y costilla', 'principio'),
    createBaseProducto('pr1', 'Pechuga a la Plancha', 'Pechuga de pollo a la plancha con especias', 'proteina'),
    createBaseProducto('ac1', 'Arroz Blanco', 'Arroz blanco cocido al vapor', 'acompanamiento'),
    createBaseProducto('b1', 'Jugo de Mora', 'Jugo en Agua de Mora', 'bebida'),
  ];

  // Productos favoritos
  const productosFavoritos: Producto[] = [
    {
      ...createBaseProducto('f1', 'Bandeja Paisa', 'Plato típico con frijoles, arroz, carne molida, chicharrón, huevo y aguacate', 'favoritos'),
      esFavorito: true
    },
    {
      ...createBaseProducto('f2', 'Ajiaco Santafereño', 'Sopa con tres tipos de papa, pollo, mazorca y guascas', 'favoritos'),
      esFavorito: true
    },
    {
      ...createBaseProducto('f3', 'Sancocho de Gallina', 'Sopa con gallina, yuca, plátano, papa y mazorca', 'favoritos'),
      esFavorito: true
    },
  ];

  // Productos especiales
  const productosEspeciales: Producto[] = [
    {
      ...createBaseProducto('e1', 'Paella Valenciana', 'Arroz con azafrán, mariscos, pollo y verduras', 'especiales'),
      esEspecial: true
    },
    {
      ...createBaseProducto('e2', 'Lomo al Trapo', 'Lomo de res cocinado en sal y envuelto en tela', 'especiales'),
      esEspecial: true
    },
    {
      ...createBaseProducto('e3', 'Cazuela de Mariscos', 'Sopa cremosa con variedad de mariscos', 'especiales'),
      esEspecial: true
    },
  ];

  // Guardar datos en el caché
  menuCacheUtils.set({
    categorias,
    productosSeleccionados: [],
    productosMenu,
    productosFavoritos,
    productosEspeciales,
    categoriaSeleccionada: 'menu-dia',
    subcategoriaSeleccionada: null,
    submenuActivo: 'menu-dia'
  });

  console.log('Usuario de prueba creado con éxito');
  console.log('- Categorías:', categorias.length);
  console.log('- Productos en Menú del Día:', productosMenu.length);
  console.log('- Productos Favoritos:', productosFavoritos.length);
  console.log('- Productos Especiales:', productosEspeciales.length);

  return {
    categorias,
    productosMenu,
    productosFavoritos,
    productosEspeciales
  };
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  createTestUser();
}
