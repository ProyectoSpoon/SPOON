// src/services/json-data.service.ts

/**
 * Servicio para cargar datos desde archivos JSON locales
 * Este servicio se utiliza como una alternativa temporal a la base de datos
 * para facilitar el desarrollo y las pruebas
 */
export const jsonDataService = {
  /**
   * Carga las categorías desde el archivo JSON
   * @returns Promesa con las categorías
   */
  async getCategorias() {
    try {
      const response = await fetch('/test-data/categorias.json');
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      const data = await response.json();
      return data.map((cat: any) => ({
        id: cat.id_categoria,
        nombre: cat.nombre,
        tipo: 'principal',
        orden: cat.orden,
        activo: cat.estado,
        restauranteId: 'test-restaurant'
      }));
    } catch (error) {
      console.error('Error al cargar categorías desde JSON:', error);
      throw error;
    }
  },

  /**
   * Carga las subcategorías desde el archivo JSON
   * @returns Promesa con las subcategorías
   */
  async getSubcategorias() {
    try {
      const response = await fetch('/test-data/subcategorias.json');
      if (!response.ok) {
        throw new Error(`Error al cargar subcategorías: ${response.status}`);
      }
      const data = await response.json();
      return data.map((subcat: any) => ({
        id: subcat.id_subcategoria,
        nombre: subcat.nombre,
        tipo: 'subcategoria',
        parentId: subcat.id_categoria_padre,
        orden: subcat.orden,
        activo: subcat.estado,
        restauranteId: 'test-restaurant'
      }));
    } catch (error) {
      console.error('Error al cargar subcategorías desde JSON:', error);
      throw error;
    }
  },

  /**
   * Carga los productos para una categoría específica
   * @param categoriaId ID de la categoría
   * @returns Promesa con los productos filtrados por categoría
   */
async getProductosByCategoria(categoriaId: string) {
  try {
    console.log(`Intentando obtener productos para categoría ${categoriaId}`);
    
    // Definir tipos para el correcto manejo de datos
    type StockStatus = 'in_stock' | 'out_of_stock' | 'low_stock';
    type ProductStatus = 'active' | 'draft' | 'archived' | 'discontinued';
    
    // Primero intentamos cargar todos los productos
    console.log(`Cargando todos los productos disponibles...`);
    let allProducts = [];
    
    try {
      const response = await fetch('/test-data/productos.json');
      if (response.ok) {
        allProducts = await response.json();
        console.log(`Cargados ${allProducts.length} productos totales`);
      } else {
        console.error(`Error al cargar productos.json: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error al cargar productos.json:`, error);
    }
    
    if (allProducts.length === 0) {
      console.warn(`No se pudieron cargar los productos desde productos.json`);
      return [];
    }
    
    // Filtrar los productos por la categoría solicitada
    console.log(`Filtrando productos para categoría ${categoriaId}...`);
    
    // Verificar diferentes formatos posibles de ID de categoría
    const filteredProducts = allProducts.filter((prod: any) => {
      // Registrar cada producto para depuración
      console.log(`Evaluando producto: ${prod.nombre}, categoría: ${prod.id_categoria || prod.categoriaId}`);
      
      // Comprobar coincidencia con diferentes formatos de ID de categoría
      return (
        prod.id_categoria === categoriaId || 
        prod.categoriaId === categoriaId ||
        // Intentar otras variantes posibles
        String(prod.id_categoria).toLowerCase() === String(categoriaId).toLowerCase()
      );
    });
    
    console.log(`Se encontraron ${filteredProducts.length} productos para categoría ${categoriaId}`);
    
    // Registrar los productos encontrados para depuración
    if (filteredProducts.length > 0) {
      console.log("Productos encontrados:");
      filteredProducts.forEach((p: any, index: number) => {
        console.log(`${index + 1}. ${p.nombre} (ID: ${p.id_producto}, Categoría: ${p.id_categoria || p.categoriaId})`);
      });
    } else {
      console.warn(`No se encontraron productos para la categoría ${categoriaId}`);
    }
    
    // Transformar los datos al formato esperado por la aplicación
    const productosTransformados = filteredProducts.map((prod: any) => {
      // Determinar el estado del stock
      let stockStatus: StockStatus = 'out_of_stock';
      if (prod.estado_disponible) {
        stockStatus = (prod.stock_actual <= prod.stock_minimo) ? 'low_stock' : 'in_stock';
      }
      
      // Determinar el estado del producto
      const productStatus: ProductStatus = prod.estado_disponible ? 'active' : 'archived';
      
      return {
        id: prod.id_producto,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        descripcion_corta: prod.descripcion_corta || "",
        categoriaId: prod.id_categoria || categoriaId, // Usar el ID de categoría correcto
        subcategoriaId: prod.id_subcategoria || null,
        imagen: prod.imagen_url || "/images/placeholder.jpg",
        imagen_miniatura: prod.imagen_miniatura_url || "/images/placeholder.jpg",
        estado_disponible: prod.estado_disponible,
        currentVersion: 1,
        currentPrice: 0,
        priceHistory: [],
        versions: [],
        status: productStatus,
        stock: {
          currentQuantity: prod.stock_actual || 0,
          minQuantity: prod.stock_minimo || 0,
          maxQuantity: 100,
          status: stockStatus,
          lastUpdated: new Date(prod.fecha_actualizacion || new Date()),
          alerts: {
            lowStock: stockStatus === 'low_stock',
            overStock: false,
            thresholds: {
              low: 10,
              high: 90
            }
          }
        },
        metadata: {
          createdAt: new Date(prod.fecha_creacion || new Date()),
          createdBy: "system",
          lastModified: new Date(prod.fecha_actualizacion || new Date()),
          lastModifiedBy: "system"
        },
        restauranteId: 'test-restaurant'
      };
    });
    
    console.log(`Transformación completada. Retornando ${productosTransformados.length} productos.`);
    return productosTransformados;
    
  } catch (error) {
    console.error(`Error global en getProductosByCategoria:`, error);
    return [];
  }
}
,
  /**
   * Carga los productos desde el archivo JSON
   * @returns Promesa con los productos
   */
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
        console.log(`jsonDataService: Transformando producto ${prod.id_producto}, categoría: ${prod.id_categoria}`);
        
        return {
          id: prod.id_producto,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          descripcion_corta: prod.descripcion_corta,
          categoriaId: prod.id_categoria, // Transformar id_categoria a categoriaId
          id_categoria: prod.id_categoria, // Mantener también el campo original para depuración
          subcategoriaId: prod.id_subcategoria,
          imagen: prod.imagen_url,
          imagen_miniatura: prod.imagen_miniatura_url,
          estado_disponible: prod.estado_disponible,
          currentVersion: 1,
          currentPrice: 0, // No usamos precios en este sistema
          priceHistory: [],
          versions: [],
          status: prod.estado_disponible ? 'active' : 'archived',
          stock: {
            currentQuantity: prod.stock_actual,
            minQuantity: prod.stock_minimo,
            maxQuantity: 100,
            status: prod.estado_disponible ? 'in_stock' : 'out_of_stock',
            lastUpdated: new Date(prod.fecha_actualizacion),
            alerts: {
              lowStock: false,
              overStock: false,
              thresholds: {
                low: 10,
                high: 90
              }
            }
          },
          metadata: {
            createdAt: new Date(prod.fecha_creacion),
            createdBy: 'system',
            lastModified: new Date(prod.fecha_actualizacion),
            lastModifiedBy: 'system'
          },
          restauranteId: 'test-restaurant'
        };
      });
      
      console.log(`jsonDataService: Total de productos transformados: ${productosTransformados.length}`);
      
      return productosTransformados;
    } catch (error) {
      console.error('Error al cargar productos desde JSON:', error);
      throw error;
    }
  },

  /**
   * Carga las combinaciones desde el archivo JSON
   * @returns Promesa con las combinaciones
   */
  async getCombinaciones() {
    try {
      const response = await fetch('/test-data/combinaciones.json');
      if (!response.ok) {
        throw new Error(`Error al cargar combinaciones: ${response.status}`);
      }
      const data = await response.json();
      
      // También necesitamos cargar los productos para relacionarlos con las combinaciones
      const productos = await this.getProductos();
      
      // Y necesitamos cargar la relación entre combinaciones y productos
      const comboProdResponse = await fetch('/test-data/combinacion_productos.json');
      if (!comboProdResponse.ok) {
        throw new Error(`Error al cargar relación combinación-productos: ${comboProdResponse.status}`);
      }
      const comboProductos = await comboProdResponse.json();
      
      // Agrupar productos por combinación
      const productosPorCombinacion = comboProductos.reduce((acc: any, rel: any) => {
        if (!acc[rel.id_combinacion]) {
          acc[rel.id_combinacion] = {};
        }
        
        // Encontrar el producto correspondiente
        const producto = productos.find((p: any) => p.id === rel.id_producto);
        if (producto) {
          acc[rel.id_combinacion][rel.tipo_categoria] = producto;
        }
        
        return acc;
      }, {});
      
      // Cargar programaciones
      const progResponse = await fetch('/test-data/programaciones.json');
      if (!progResponse.ok) {
        throw new Error(`Error al cargar programaciones: ${progResponse.status}`);
      }
      const programaciones = await progResponse.json();
      
      // Agrupar programaciones por combinación
      const programacionesPorCombinacion = programaciones.reduce((acc: any, prog: any) => {
        if (!acc[prog.id_combinacion]) {
          acc[prog.id_combinacion] = [];
        }
        
        acc[prog.id_combinacion].push({
          fecha: new Date(prog.fecha_programada),
          cantidadProgramada: prog.cantidad
        });
        
        return acc;
      }, {});
      
      // Construir las combinaciones completas
      return data.map((comb: any) => {
        const productos = productosPorCombinacion[comb.id_combinacion] || {};
        return {
          id: comb.id_combinacion,
          nombre: comb.nombre,
          favorito: comb.es_favorito,
          especial: comb.es_especial,
          cantidad: 0,
          entrada: productos.entrada || null,
          principio: productos.principio || null,
          proteina: productos.proteina || null,
          acompanamiento: productos.acompanamiento ? [productos.acompanamiento] : [],
          bebida: productos.bebida || null,
          programacion: programacionesPorCombinacion[comb.id_combinacion] || []
        };
      });
    } catch (error) {
      console.error('Error al cargar combinaciones desde JSON:', error);
      throw error;
    }
  },

  /**
   * Guarda una combinación (simulado, no hace nada realmente)
   * @param restauranteId ID del restaurante
   * @param combinacion Combinación a guardar
   */
  async guardarCombinacion(restauranteId: string, combinacion: any) {
    console.log('Simulando guardar combinación:', combinacion);
    // En una implementación real, aquí se guardaría en la base de datos
    return Promise.resolve();
  },

  /**
   * Guarda múltiples combinaciones (simulado, no hace nada realmente)
   * @param restauranteId ID del restaurante
   * @param combinaciones Combinaciones a guardar
   */
  async guardarCombinaciones(restauranteId: string, combinaciones: any[]) {
    console.log('Simulando guardar combinaciones:', combinaciones);
    // En una implementación real, aquí se guardarían en la base de datos
    return Promise.resolve();
  },

  /**
   * Obtiene los favoritos (simulado, devuelve un array vacío)
   * @param restauranteId ID del restaurante
   */
  async getFavoritos(restauranteId: string) {
    // En una implementación real, aquí se cargarían los favoritos desde la base de datos
    return [];
  },

  /**
   * Marca o desmarca un favorito (simulado, no hace nada realmente)
   * @param restauranteId ID del restaurante
   * @param combinacionId ID de la combinación
   */
  async toggleFavorito(restauranteId: string, combinacionId: string) {
    console.log('Simulando toggle favorito:', { restauranteId, combinacionId });
    // En una implementación real, aquí se actualizaría la base de datos
    return Promise.resolve();
  }
};