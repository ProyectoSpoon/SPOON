import { query } from '@/lib/database';

export interface ProductoPostgres {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  slug: string;
  current_price: number;
  base_price: number;
  cost_price?: number;
  profit_margin?: number;
  sku?: string;
  barcode?: string;
  image_url?: string;
  gallery_images?: any;
  preparation_time?: number;
  cooking_instructions?: string;
  allergens?: any;
  nutritional_info?: any;
  ingredients?: any;
  customization_options?: any;
  tags?: any;
  status: 'active' | 'draft' | 'archived' | 'discontinued';
  is_featured?: boolean;
  is_favorite?: boolean;
  is_special?: boolean;
  is_seasonal?: boolean;
  seasonal_start?: Date;
  seasonal_end?: Date;
  availability_schedule?: any;
  sort_order?: number;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface CategoriaPostgres {
  id: string;
  restaurant_id: string;
  parent_id?: string;
  name: string;
  description?: string;
  slug: string;
  category_type: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active: boolean;
  availability_schedule?: any;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface MenuDiaPostgres {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  menu_date: Date;
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  published_by?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface MenuCombinacionPostgres {
  id: string;
  daily_menu_id: string;
  entrada_id?: string;
  principio_id?: string;
  proteina_id?: string;
  bebida_id?: string;
  name?: string;
  description?: string;
  base_price?: number;
  final_price?: number;
  current_quantity?: number;
  max_quantity?: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Servicio actualizado para la gestión del menú en PostgreSQL
 * Compatible con el nuevo schema de la base de datos
 */
export class MenuServicePostgres {
  
  // ========= RESTAURANTES =========
  
  /**
   * Obtiene el restaurante por defecto activo
   */
  static async getRestaurantePorDefecto(): Promise<string | null> {
    try {
      const result = await query(
        'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1',
        ['active']
      );
      
      return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
      console.error('Error al obtener restaurante por defecto:', error);
      throw error;
    }
  }

  // ========= CATEGORÍAS =========

  /**
   * Obtiene todas las categorías de un restaurante
   */
  static async getCategorias(restauranteId: string): Promise<CategoriaPostgres[]> {
    try {
      const result = await query(
        `SELECT * FROM menu.categories 
         WHERE restaurant_id = $1 AND is_active = true
         ORDER BY parent_id NULLS FIRST, sort_order ASC, name ASC`,
        [restauranteId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getCategoriaById(id: string, restauranteId: string): Promise<CategoriaPostgres | null> {
    try {
      const result = await query(
        'SELECT * FROM menu.categories WHERE id = $1 AND restaurant_id = $2',
        [id, restauranteId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error);
      throw error;
    }
  }

  // ========= PRODUCTOS =========

  /**
   * Obtiene todos los productos de un restaurante
   */
  static async getProductos(restauranteId: string, categoriaId?: string): Promise<ProductoPostgres[]> {
    try {
      let sql = `
        SELECT p.*, c.name as categoria_nombre
        FROM menu.products p
        LEFT JOIN menu.categories c ON p.category_id = c.id
        WHERE p.restaurant_id = $1 AND p.status = 'active'
      `;
      
      const params: any[] = [restauranteId];
      
      if (categoriaId) {
        sql += ' AND p.category_id = $2';
        params.push(categoriaId);
      }
      
      sql += ' ORDER BY c.name, p.name';
      
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
  static async getProductoById(id: string, restauranteId: string): Promise<ProductoPostgres | null> {
    try {
      const result = await query(
        `SELECT p.*, c.name as categoria_nombre
         FROM menu.products p
         LEFT JOIN menu.categories c ON p.category_id = c.id
         WHERE p.id = $1 AND p.restaurant_id = $2`,
        [id, restauranteId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene productos por categoría
   */
  static async getProductosPorCategoria(restauranteId: string): Promise<Record<string, ProductoPostgres[]>> {
    try {
      const productos = await this.getProductos(restauranteId);
      const categorias = await this.getCategorias(restauranteId);
      
      const productosPorCategoria: Record<string, ProductoPostgres[]> = {};
      
      categorias.forEach(categoria => {
        productosPorCategoria[categoria.name.toLowerCase()] = productos.filter(
          producto => producto.category_id === categoria.id
        );
      });
      
      return productosPorCategoria;
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      throw error;
    }
  }

  // ========= MENÚ DEL DÍA =========

  /**
   * Obtiene el menú del día para una fecha específica
   */
  static async getMenuDia(fecha: Date, restauranteId: string): Promise<MenuDiaPostgres | null> {
    try {
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      const result = await query(
        `SELECT * FROM menu.daily_menus 
         WHERE menu_date = $1 AND restaurant_id = $2 
         AND status IN ('draft', 'published')
         ORDER BY created_at DESC LIMIT 1`,
        [fechaFormateada, restauranteId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener menú del día:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo menú del día
   */
  static async createMenuDia(
    restauranteId: string, 
    nombre: string, 
    descripcion: string = '',
    fecha: Date = new Date(),
    creadoPor?: string
  ): Promise<MenuDiaPostgres> {
    try {
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      const result = await query(
        `INSERT INTO menu.daily_menus (
          restaurant_id, name, description, menu_date, status, created_by
        ) VALUES ($1, $2, $3, $4, 'draft', $5) 
        RETURNING *`,
        [restauranteId, nombre, descripcion, fechaFormateada, creadoPor]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear menú del día:', error);
      throw error;
    }
  }

  /**
   * Obtiene las combinaciones de un menú del día
   */
  static async getCombinacionesMenu(menuId: string): Promise<MenuCombinacionPostgres[]> {
    try {
      const result = await query(
        'SELECT * FROM menu.menu_combinations WHERE daily_menu_id = $1 ORDER BY created_at',
        [menuId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener combinaciones del menú:', error);
      throw error;
    }
  }

  /**
   * Agrega una combinación al menú del día
   */
  static async addCombinacionMenu(
    menuId: string,
    entrada_id?: string,
    principio_id?: string,
    proteina_id?: string,
    bebida_id?: string,
    nombre?: string,
    descripcion?: string,
    precio?: number,
    cantidad?: number
  ): Promise<MenuCombinacionPostgres> {
    try {
      const result = await query(
        `INSERT INTO menu.menu_combinations (
          daily_menu_id, entrada_id, principio_id, proteina_id, bebida_id,
          name, description, base_price, current_quantity, is_available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) 
        RETURNING *`,
        [menuId, entrada_id, principio_id, proteina_id, bebida_id, 
         nombre, descripcion, precio, cantidad]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al agregar combinación al menú:', error);
      throw error;
    }
  }

  /**
   * Elimina todas las combinaciones de un menú
   */
  static async limpiarCombinacionesMenu(menuId: string): Promise<void> {
    try {
      await query(
        'DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1',
        [menuId]
      );
    } catch (error) {
      console.error('Error al limpiar combinaciones del menú:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un menú del día
   */
  static async updateEstadoMenu(
    menuId: string, 
    estado: 'draft' | 'published' | 'archived',
    publicadoPor?: string
  ): Promise<void> {
    try {
      const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
      const params = [menuId, estado];
      
      if (estado === 'published' && publicadoPor) {
        updateFields.push('published_at = CURRENT_TIMESTAMP', 'published_by = $3');
        params.push(publicadoPor);
      }
      
      await query(
        `UPDATE menu.daily_menus SET ${updateFields.join(', ')} WHERE id = $1`,
        params
      );
    } catch (error) {
      console.error('Error al actualizar estado del menú:', error);
      throw error;
    }
  }

  // ========= FAVORITOS =========

  /**
   * Obtiene los productos favoritos de un restaurante
   */
  static async getFavoritos(restauranteId: string): Promise<any[]> {
    try {
      const result = await query(
        `SELECT 
          rf.id,
          rf.restaurant_id,
          rf.product_id,
          rf.created_by,
          rf.created_at,
          p.name as product_name,
          p.description as product_description,
          p.image_url as product_image,
          p.current_price as product_price,
          p.category_id,
          c.name as category_name
        FROM restaurant.favorite_products rf
        JOIN menu.products p ON rf.product_id = p.id
        LEFT JOIN menu.categories c ON p.category_id = c.id
        WHERE rf.restaurant_id = $1 AND p.status = 'active'
        ORDER BY rf.created_at DESC`,
        [restauranteId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw error;
    }
  }

  /**
   * Verifica si un producto es favorito
   */
  static async esFavorito(restauranteId: string, productoId: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM restaurant.favorite_products WHERE restaurant_id = $1 AND product_id = $2',
        [restauranteId, productoId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      throw error;
    }
  }

  /**
   * Agrega un producto a favoritos
   */
  static async addFavorito(
    restauranteId: string, 
    productoId: string, 
    creadoPor?: string
  ): Promise<boolean> {
    try {
      await query(
        `INSERT INTO restaurant.favorite_products (restaurant_id, product_id, created_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (restaurant_id, product_id) DO NOTHING`,
        [restauranteId, productoId, creadoPor]
      );
      
      return true;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      return false;
    }
  }

  /**
   * Elimina un producto de favoritos
   */
  static async removeFavorito(restauranteId: string, productoId: string): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM restaurant.favorite_products WHERE restaurant_id = $1 AND product_id = $2',
        [restauranteId, productoId]
      );
      
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      return false;
    }
  }

  // ========= UTILIDADES =========

  /**
   * Obtiene estadísticas del menú
   */
  static async getEstadisticasMenu(restauranteId: string): Promise<{
    totalProductos: number;
    totalCategorias: number;
    totalFavoritos: number;
    menusPublicados: number;
  }> {
    try {
      const [productosResult, categoriasResult, favoritosResult, menusResult] = await Promise.all([
        query('SELECT COUNT(*) as total FROM menu.products WHERE restaurant_id = $1 AND status = $2', [restauranteId, 'active']),
        query('SELECT COUNT(*) as total FROM menu.categories WHERE restaurant_id = $1 AND is_active = true', [restauranteId]),
        query('SELECT COUNT(*) as total FROM restaurant.favorite_products WHERE restaurant_id = $1', [restauranteId]),
        query('SELECT COUNT(*) as total FROM menu.daily_menus WHERE restaurant_id = $1 AND status = $2', [restauranteId, 'published'])
      ]);
      
      return {
        totalProductos: parseInt(productosResult.rows[0].total),
        totalCategorias: parseInt(categoriasResult.rows[0].total),
        totalFavoritos: parseInt(favoritosResult.rows[0].total),
        menusPublicados: parseInt(menusResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del menú:', error);
      throw error;
    }
  }
}