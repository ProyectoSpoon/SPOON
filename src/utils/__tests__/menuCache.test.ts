/**
 * @jest-environment jsdom
 */

import { menuCacheUtils, MenuCrearMenuData, Categoria, Producto } from '../menuCache.utils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('menuCacheUtils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Clear mock calls
    jest.clearAllMocks();
  });

  // Sample data for testing
  const sampleCategoria: Categoria = {
    id: 'cat1',
    nombre: 'Categoría de Prueba',
    tipo: 'principal',
  };

  const sampleProducto: Producto = {
    id: 'prod1',
    nombre: 'Producto de Prueba',
    descripcion: 'Descripción de prueba',
    precio: 10000,
    currentPrice: 10000,
    categoriaId: 'cat1',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 10,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'test',
      lastModified: new Date(),
      lastModifiedBy: 'test',
    },
  };

  const sampleProductoFavorito: Producto = {
    ...sampleProducto,
    id: 'prod2',
    nombre: 'Producto Favorito',
    esFavorito: true,
  };

  const sampleProductoEspecial: Producto = {
    ...sampleProducto,
    id: 'prod3',
    nombre: 'Producto Especial',
    esEspecial: true,
  };

  const sampleMenuData: MenuCrearMenuData = {
    categorias: [sampleCategoria],
    productosSeleccionados: [sampleProducto],
    productosMenu: [sampleProducto],
    productosFavoritos: [sampleProductoFavorito],
    productosEspeciales: [sampleProductoEspecial],
    categoriaSeleccionada: 'cat1',
    subcategoriaSeleccionada: null,
    submenuActivo: 'menu-dia'
  };

  test('set should store data in localStorage', () => {
    menuCacheUtils.set(sampleMenuData);
    
    // Verify localStorage.setItem was called
    expect(localStorageMock.getItem('menu_crear_menu')).not.toBeNull();
    
    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith(
      'Guardando en caché del menú:',
      expect.anything()
    );
    expect(console.log).toHaveBeenCalledWith(
      'Datos guardados en caché del menú correctamente'
    );
  });

  test('get should retrieve data from localStorage', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Then get the data
    const retrievedData = menuCacheUtils.get();
    
    // Verify data was retrieved correctly
    expect(retrievedData).not.toBeNull();
    expect(retrievedData?.categorias[0].id).toBe(sampleCategoria.id);
    expect(retrievedData?.productosSeleccionados[0].id).toBe(sampleProducto.id);
    expect(retrievedData?.productosMenu[0].id).toBe(sampleProducto.id);
    expect(retrievedData?.productosFavoritos[0].id).toBe(sampleProductoFavorito.id);
    expect(retrievedData?.productosEspeciales[0].id).toBe(sampleProductoEspecial.id);
    expect(retrievedData?.submenuActivo).toBe('menu-dia');
    
    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith(
      'Datos encontrados en caché del menú, timestamp:',
      expect.anything()
    );
    expect(console.log).toHaveBeenCalledWith(
      'Datos recuperados de caché del menú:',
      expect.anything()
    );
  });

  test('get should return null if no data in localStorage', () => {
    const retrievedData = menuCacheUtils.get();
    
    // Verify null was returned
    expect(retrievedData).toBeNull();
    
    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith('No hay datos en caché del menú');
  });

  test('clear should remove data from localStorage', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Then clear the data
    menuCacheUtils.clear();
    
    // Verify data was cleared
    expect(localStorageMock.getItem('menu_crear_menu')).toBeNull();
    
    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith('Limpiando caché del menú');
  });

  test('update should update only specified fields', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Create new category
    const newCategoria: Categoria = {
      id: 'cat2',
      nombre: 'Nueva Categoría',
      tipo: 'principal',
    };
    
    // Update only categories
    menuCacheUtils.update({
      categorias: [newCategoria],
    });
    
    // Get updated data
    const updatedData = menuCacheUtils.get();
    
    // Verify only categories were updated
    expect(updatedData?.categorias.length).toBe(1);
    expect(updatedData?.categorias[0].id).toBe(newCategoria.id);
    
    // Verify other fields remained the same
    expect(updatedData?.productosSeleccionados.length).toBe(1);
    expect(updatedData?.productosSeleccionados[0].id).toBe(sampleProducto.id);
    expect(updatedData?.productosMenu.length).toBe(1);
    expect(updatedData?.productosMenu[0].id).toBe(sampleProducto.id);
    expect(updatedData?.productosFavoritos.length).toBe(1);
    expect(updatedData?.productosFavoritos[0].id).toBe(sampleProductoFavorito.id);
    expect(updatedData?.productosEspeciales.length).toBe(1);
    expect(updatedData?.productosEspeciales[0].id).toBe(sampleProductoEspecial.id);
  });

  test('updateProductosFavoritos should update only favoritos', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Create new favorito
    const newFavorito: Producto = {
      ...sampleProducto,
      id: 'prod4',
      nombre: 'Nuevo Favorito',
      esFavorito: true,
    };
    
    // Update only favoritos
    menuCacheUtils.updateProductosFavoritos([newFavorito]);
    
    // Get updated data
    const updatedData = menuCacheUtils.get();
    
    // Verify only favoritos were updated
    expect(updatedData?.productosFavoritos.length).toBe(1);
    expect(updatedData?.productosFavoritos[0].id).toBe(newFavorito.id);
    
    // Verify other fields remained the same
    expect(updatedData?.productosMenu.length).toBe(1);
    expect(updatedData?.productosMenu[0].id).toBe(sampleProducto.id);
    expect(updatedData?.productosEspeciales.length).toBe(1);
    expect(updatedData?.productosEspeciales[0].id).toBe(sampleProductoEspecial.id);
  });

  test('updateProductosEspeciales should update only especiales', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Create new especial
    const newEspecial: Producto = {
      ...sampleProducto,
      id: 'prod5',
      nombre: 'Nuevo Especial',
      esEspecial: true,
    };
    
    // Update only especiales
    menuCacheUtils.updateProductosEspeciales([newEspecial]);
    
    // Get updated data
    const updatedData = menuCacheUtils.get();
    
    // Verify only especiales were updated
    expect(updatedData?.productosEspeciales.length).toBe(1);
    expect(updatedData?.productosEspeciales[0].id).toBe(newEspecial.id);
    
    // Verify other fields remained the same
    expect(updatedData?.productosMenu.length).toBe(1);
    expect(updatedData?.productosMenu[0].id).toBe(sampleProducto.id);
    expect(updatedData?.productosFavoritos.length).toBe(1);
    expect(updatedData?.productosFavoritos[0].id).toBe(sampleProductoFavorito.id);
  });

  test('updateSubmenuActivo should update active submenu', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Clear console logs
    jest.clearAllMocks();
    
    // Update submenu activo
    menuCacheUtils.updateSubmenuActivo('favoritos');
    
    // Get updated data
    const updatedData = menuCacheUtils.get();
    
    // Verify submenu activo was updated
    expect(updatedData?.submenuActivo).toBe('favoritos');
    
    // Verify other fields remained the same
    expect(updatedData?.productosMenu.length).toBe(1);
    expect(updatedData?.productosMenu[0].id).toBe(sampleProducto.id);
    expect(updatedData?.productosFavoritos.length).toBe(1);
    expect(updatedData?.productosFavoritos[0].id).toBe(sampleProductoFavorito.id);
    expect(updatedData?.productosEspeciales.length).toBe(1);
    expect(updatedData?.productosEspeciales[0].id).toBe(sampleProductoEspecial.id);
  });

  test('hasCache should return true if valid cache exists', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Check if cache exists
    const hasCache = menuCacheUtils.hasCache();
    
    // Verify cache exists
    expect(hasCache).toBe(true);
  });

  test('hasCache should return false if no cache exists', () => {
    // Check if cache exists without setting data
    const hasCache = menuCacheUtils.hasCache();
    
    // Verify cache does not exist
    expect(hasCache).toBe(false);
  });

  test('getRemainingTime should return remaining time in minutes', () => {
    // First set the data
    menuCacheUtils.set(sampleMenuData);
    
    // Get remaining time
    const remainingTime = menuCacheUtils.getRemainingTime();
    
    // Verify remaining time is a number and is close to 30 minutes
    expect(typeof remainingTime).toBe('number');
    expect(remainingTime).toBeGreaterThan(0);
    expect(remainingTime).toBeLessThanOrEqual(30);
  });

  test('getRemainingTime should return 0 if no cache exists', () => {
    // Get remaining time without setting data
    const remainingTime = menuCacheUtils.getRemainingTime();
    
    // Verify remaining time is 0
    expect(remainingTime).toBe(0);
  });
});
