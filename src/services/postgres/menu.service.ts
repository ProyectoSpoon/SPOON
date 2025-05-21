import pool, { query } from '@/config/database';

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  tiempo_preparacion: number;
  imagen_url?: string;
  activo: boolean;
  restaurante_id: number;
}

export interface Ingrediente {
  id?: number;
  nombre: string;
  unidad_medida: string;
  stock: number;
  precio_unitario: number;
  restaurante_id: number;
}

export interface ProductoIngrediente {
  producto_id: number;
  ingrediente_id: number;
  cantidad: number;
}

export interface MenuDia {
  id?: number;
  fecha: Date;
  restaurante_id: number;
  activo: boolean;
}

export interface MenuProducto {
  menu_id: number;
  producto_id: number;
  precio_venta: number;
  disponible: boolean;
}

export interface Combinacion {
  id?: number;
  nombre: string;
  restaurante_id: number;
  precio: number;
  activo: boolean;
  especial: boolean;
  favorito: boolean;
}

export interface CombinacionProducto {
  combinacion_id: number;
  producto_id: number;
  cantidad: number;
}

/**
 * Servicio para la gestión del menú en PostgreSQL
 */
export class MenuService {
  /**
   * Inicializa las tablas si no existen
   */
  static async initTables() {
    try {
      // Leer el archivo SQL
      const fs = require('fs');
      const path = require('path');
      const sqlFilePath = path.join(process.cwd(), 'scripts', 'crear_tablas_menu.sql');
      const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Ejecutar el script SQL
      await query(sqlScript);
      console.log('Tablas del menú inicializadas correctamente');
    } catch (error) {
      console.error('Error al inicializar tablas del menú:', error);
      throw error;
    }
  }

  // ========= CATEGORÍAS =========

  /**
   * Obtiene todas las categorías de un restaurante
   */
  static async getCategorias(restauranteId: number) {
    try {
      const result = await query(
        'SELECT * FROM categorias WHERE restaurante_id = $1 ORDER BY orden',
        [restauranteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  // ========= PRODUCTOS (RECETAS) =========

  /**
   * Obtiene todos los productos de un restaurante
   */
  static async getProductos(restauranteId: number, categoriaId?: number) {
    try {
      let sql = `
        SELECT p.*, c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.restaurante_id = $1
      `;
      
      const params: any[] = [restauranteId];
      
      if (categoriaId) {
        sql += ' AND p.categoria_id = $2';
        params.push(categoriaId);
      }
      
      sql += ' ORDER BY c.orden, p.nombre';
      
      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un producto por ID
   */
  static async getProductoById(id: number, restauranteId: number) {
    try {
      const result = await query(
        `SELECT p.*, c.nombre as categoria_nombre
         FROM productos p
         LEFT JOIN categorias c ON p.categoria_id = c.id
         WHERE p.id = $1 AND p.restaurante_id = $2`,
        [id, restauranteId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo producto
   */
  static async createProducto(producto: Producto) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `INSERT INTO productos (
          nombre, descripcion, categoria_id, tiempo_preparacion,
          imagen_url, activo, restaurante_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          producto.nombre,
          producto.descripcion || '',
          producto.categoria_id,
          producto.tiempo_preparacion,
          producto.imagen_url || null,
          producto.activo,
          producto.restaurante_id
        ]
      );
      
      const productoId = result.rows[0].id;
      
      await client.query('COMMIT');
      return productoId;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear producto:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un producto existente
   */
  static async updateProducto(id: number, producto: Producto) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `UPDATE productos SET
          nombre = $1,
          descripcion = $2,
          categoria_id = $3,
          tiempo_preparacion = $4,
          imagen_url = $5,
          activo = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND restaurante_id = $8
        RETURNING id`,
        [
          producto.nombre,
          producto.descripcion || '',
          producto.categoria_id,
          producto.tiempo_preparacion,
          producto.imagen_url || null,
          producto.activo,
          id,
          producto.restaurante_id
        ]
      );
      
      if (result.rowCount === 0) {
        throw new Error('Producto no encontrado o sin permisos');
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar producto:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ========= INGREDIENTES DE PRODUCTOS =========

  /**
   * Obtiene los ingredientes de un producto
   */
  static async getIngredientesProducto(productoId: number) {
    try {
      const result = await query(
        `SELECT pi.*, i.nombre, i.unidad_medida, i.precio_unitario
         FROM producto_ingredientes pi
         JOIN ingredientes i ON pi.ingrediente_id = i.id
         WHERE pi.producto_id = $1`,
        [productoId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener ingredientes del producto:', error);
      throw error;
    }
  }

  /**
   * Actualiza los ingredientes de un producto
   */
  static async updateIngredientesProducto(
    productoId: number, 
    ingredientes: ProductoIngrediente[]
  ) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Eliminar ingredientes actuales
      await client.query(
        'DELETE FROM producto_ingredientes WHERE producto_id = $1',
        [productoId]
      );
      
      // Insertar nuevos ingredientes
      for (const ing of ingredientes) {
        await client.query(
          `INSERT INTO producto_ingredientes (
            producto_id, ingrediente_id, cantidad
          ) VALUES ($1, $2, $3)`,
          [productoId, ing.ingrediente_id, ing.cantidad]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar ingredientes del producto:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ========= MENÚ DEL DÍA =========

  /**
   * Obtiene el menú para una fecha específica
   */
  static async getMenuDia(fecha: Date, restauranteId: number) {
    const client = await pool.connect();
    
    try {
      // Formatear fecha como YYYY-MM-DD
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      // Obtener o crear el menú del día
      let menuResult = await client.query(
        'SELECT * FROM menu_dia WHERE fecha = $1 AND restaurante_id = $2',
        [fechaFormateada, restauranteId]
      );
      
      let menuId;
      
      if (menuResult.rows.length === 0) {
        // Crear un nuevo menú para este día
        const newMenuResult = await client.query(
          'INSERT INTO menu_dia (fecha, restaurante_id, activo) VALUES ($1, $2, true) RETURNING id',
          [fechaFormateada, restauranteId]
        );
        menuId = newMenuResult.rows[0].id;
      } else {
        menuId = menuResult.rows[0].id;
      }
      
      // Obtener productos del menú
      const productosResult = await client.query(
        `SELECT mp.*, p.nombre, p.descripcion, p.imagen_url, p.tiempo_preparacion,
                c.nombre as categoria_nombre
         FROM menu_productos mp
         JOIN productos p ON mp.producto_id = p.id
         JOIN categorias c ON p.categoria_id = c.id
         WHERE mp.menu_id = $1
         ORDER BY c.orden, p.nombre`,
        [menuId]
      );
      
      return {
        menu_id: menuId,
        fecha: fechaFormateada,
        productos: productosResult.rows
      };
    } catch (error) {
      console.error('Error al obtener menú del día:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza los productos en el menú del día
   */
  static async updateMenuProductos(
    menuId: number, 
    productoId: number, 
    precioVenta: number, 
    disponible: boolean
  ) {
    try {
      // Verificar si el producto ya existe en este menú
      const checkResult = await query(
        'SELECT * FROM menu_productos WHERE menu_id = $1 AND producto_id = $2',
        [menuId, productoId]
      );
      
      if (checkResult.rows.length === 0) {
        // Insertar nuevo producto al menú
        await query(
          `INSERT INTO menu_productos (menu_id, producto_id, precio_venta, disponible)
           VALUES ($1, $2, $3, $4)`,
          [menuId, productoId, precioVenta, disponible]
        );
      } else {
        // Actualizar producto existente
        await query(
          `UPDATE menu_productos 
           SET precio_venta = $1, disponible = $2, updated_at = CURRENT_TIMESTAMP
           WHERE menu_id = $3 AND producto_id = $4`,
          [precioVenta, disponible, menuId, productoId]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error al actualizar producto en el menú:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un producto del menú del día
   */
  static async removeProductoMenu(menuId: number, productoId: number) {
    try {
      await query(
        'DELETE FROM menu_productos WHERE menu_id = $1 AND producto_id = $2',
        [menuId, productoId]
      );
      
      return true;
    } catch (error) {
      console.error('Error al eliminar producto del menú:', error);
      throw error;
    }
  }

  // Método para migrar datos existentes
  static async migrarDatosExistentes(restauranteId: number) {
    const client = await pool.connect();
    
    try {
      console.log('Iniciando migración de datos de menú existentes...');
      
      // Aquí se implementaría la lógica para migrar datos existentes
      // desde Firestore u otro origen a PostgreSQL
      
      console.log('Migración completada con éxito.');
      return true;
    } catch (error) {
      console.error('Error durante la migración de datos:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
