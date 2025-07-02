// Configuración actualizada para SPOON Database v2.0
// Este archivo contiene las configuraciones necesarias para la nueva estructura

export const DATABASE_CONFIG = {
  // Esquemas de la base de datos
  SCHEMAS: {
    AUTH: 'auth',
    RESTAURANT: 'restaurant', 
    MENU: 'menu',
    SALES: 'sales',
    AUDIT: 'audit',
    CONFIG: 'config'
  },
  
  // Mapeo de tablas antiguas a nuevas
  TABLE_MAPPING: {
    'productos': 'menu.products',
    'categorias': 'menu.categories',
    'combinaciones': 'menu.menu_combinations',
    'restaurantes': 'restaurant.restaurants',
    'menus': 'menu.daily_menus',
    'menu_productos': 'menu.menu_combinations',
    'combinacion_productos': 'menu.combination_sides'
  },
  
  // Mapeo de campos renombrados
  FIELD_MAPPING: {
    'nombre': 'name',
    'descripcion': 'description',
    'precio_actual': 'current_price',
    'estado': 'status',
    'activo': 'is_active',
    'categoria_id': 'category_id',
    'restaurante_id': 'restaurant_id'
  },
  
  // Configuración de conexión
  CONNECTION: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'spoon_db',
    password: process.env.DB_PASSWORD || 
      (process.env.DB_PASSWORD_FILE ? 
        require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : 
        'password')
  }
};

// Función helper para construir consultas con esquemas
export function buildQuery(table: string, query: string): string {
  const mappedTable = DATABASE_CONFIG.TABLE_MAPPING[table] || table;
  return query.replace(new RegExp(`\\b${table}\\b`, 'g'), mappedTable);
}

// Función helper para mapear campos
export function mapFields(data: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const mappedKey = DATABASE_CONFIG.FIELD_MAPPING[key] || key;
    mapped[mappedKey] = value;
  }
  
  return mapped;
}

// Función helper para obtener ID de restaurante por defecto
export async function getDefaultRestaurantId(): Promise<string> {
  const { query } = await import('../lib/database');
  const result = await query('SELECT id FROM restaurant.restaurants WHERE slug = $1 LIMIT 1', ['spoon-demo']);
  return result.rows[0]?.id || null;
}

// Función helper para validar UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
