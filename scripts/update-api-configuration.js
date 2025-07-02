#!/usr/bin/env node

/**
 * Script para actualizar configuraciones de APIs para nueva estructura de BD
 * SPOON Database v2.0 - Migración a esquemas y UUIDs
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'blue') {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`${colors[color]}[${timestamp}]${colors.reset} ${message}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Configuraciones de archivos a actualizar
const fileUpdates = [
    {
        path: 'src/config/database.ts',
        description: 'Configuración principal de base de datos',
        updates: [
            {
                search: /user: process\.env\.POSTGRES_USER \|\| 'spoon_admin'/g,
                replace: "user: process.env.DB_USER || 'postgres'"
            },
            {
                search: /database: process\.env\.POSTGRES_DATABASE \|\| 'spoon'/g,
                replace: "database: process.env.DB_NAME || 'spoon_db'"
            },
            {
                search: /password: process\.env\.POSTGRES_PASSWORD \|\| 'Carlos0412\*'/g,
                replace: "password: process.env.DB_PASSWORD || (process.env.DB_PASSWORD_FILE ? require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : 'password')"
            }
        ]
    },
    {
        path: 'src/lib/database.ts',
        description: 'Funciones de base de datos',
        updates: [
            {
                search: /user: process\.env\.DB_USER \|\| 'postgres'/g,
                replace: "user: process.env.DB_USER || 'postgres'"
            },
            {
                search: /database: process\.env\.DB_NAME \|\| 'spoon_db'/g,
                replace: "database: process.env.DB_NAME || 'spoon_db'"
            },
            {
                search: /password: process\.env\.DB_PASSWORD \|\| 'password'/g,
                replace: "password: process.env.DB_PASSWORD || (process.env.DB_PASSWORD_FILE ? require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : 'password')"
            }
        ]
    }
];

// Mapeo de consultas SQL antiguas a nuevas
const sqlMappings = [
    // Productos
    {
        old: /SELECT \* FROM productos/g,
        new: 'SELECT * FROM menu.products'
    },
    {
        old: /FROM productos p/g,
        new: 'FROM menu.products p'
    },
    {
        old: /JOIN productos/g,
        new: 'JOIN menu.products'
    },
    {
        old: /LEFT JOIN productos/g,
        new: 'LEFT JOIN menu.products'
    },
    {
        old: /INSERT INTO productos/g,
        new: 'INSERT INTO menu.products'
    },
    {
        old: /UPDATE productos/g,
        new: 'UPDATE menu.products'
    },
    {
        old: /DELETE FROM productos/g,
        new: 'DELETE FROM menu.products'
    },
    
    // Categorías
    {
        old: /SELECT \* FROM categorias/g,
        new: 'SELECT * FROM menu.categories'
    },
    {
        old: /FROM categorias c/g,
        new: 'FROM menu.categories c'
    },
    {
        old: /JOIN categorias/g,
        new: 'JOIN menu.categories'
    },
    {
        old: /LEFT JOIN categorias/g,
        new: 'LEFT JOIN menu.categories'
    },
    {
        old: /INSERT INTO categorias/g,
        new: 'INSERT INTO menu.categories'
    },
    {
        old: /UPDATE categorias/g,
        new: 'UPDATE menu.categories'
    },
    
    // Combinaciones
    {
        old: /SELECT \* FROM combinaciones/g,
        new: 'SELECT * FROM menu.menu_combinations'
    },
    {
        old: /FROM combinaciones/g,
        new: 'FROM menu.menu_combinations'
    },
    {
        old: /JOIN combinaciones/g,
        new: 'JOIN menu.menu_combinations'
    },
    {
        old: /INSERT INTO combinaciones/g,
        new: 'INSERT INTO menu.menu_combinations'
    },
    {
        old: /UPDATE combinaciones/g,
        new: 'UPDATE menu.menu_combinations'
    },
    
    // Restaurantes
    {
        old: /SELECT \* FROM restaurantes/g,
        new: 'SELECT * FROM restaurant.restaurants'
    },
    {
        old: /FROM restaurantes/g,
        new: 'FROM restaurant.restaurants'
    },
    {
        old: /JOIN restaurantes/g,
        new: 'JOIN restaurant.restaurants'
    },
    {
        old: /INSERT INTO restaurantes/g,
        new: 'INSERT INTO restaurant.restaurants'
    },
    {
        old: /UPDATE restaurantes/g,
        new: 'UPDATE restaurant.restaurants'
    },
    
    // Campos renombrados
    {
        old: /\.nombre/g,
        new: '.name'
    },
    {
        old: /\.descripcion/g,
        new: '.description'
    },
    {
        old: /\.precio_actual/g,
        new: '.current_price'
    },
    {
        old: /\.estado/g,
        new: '.status'
    },
    {
        old: /\.activo/g,
        new: '.is_active'
    },
    {
        old: /\.categoria_id/g,
        new: '.category_id'
    },
    {
        old: /\.restaurante_id/g,
        new: '.restaurant_id'
    }
];

// Función para leer archivo
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            warning(`Archivo no encontrado: ${filePath}`);
            return null;
        }
        throw err;
    }
}

// Función para escribir archivo
function writeFile(filePath, content) {
    try {
        // Crear directorio si no existe
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (err) {
        error(`Error escribiendo archivo ${filePath}: ${err.message}`);
        return false;
    }
}

// Función para crear backup de archivo
function createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    try {
        const content = readFile(filePath);
        if (content !== null) {
            writeFile(backupPath, content);
            log(`Backup creado: ${backupPath}`, 'cyan');
            return backupPath;
        }
    } catch (err) {
        error(`Error creando backup de ${filePath}: ${err.message}`);
    }
    return null;
}

// Función para actualizar configuraciones específicas de archivos
function updateFileConfigurations() {
    log('Actualizando configuraciones de archivos específicos...', 'blue');
    
    for (const fileConfig of fileUpdates) {
        log(`Procesando: ${fileConfig.description}`, 'cyan');
        
        const content = readFile(fileConfig.path);
        if (content === null) {
            continue;
        }
        
        // Crear backup
        createBackup(fileConfig.path);
        
        let updatedContent = content;
        let changesCount = 0;
        
        // Aplicar actualizaciones
        for (const update of fileConfig.updates) {
            const matches = updatedContent.match(update.search);
            if (matches) {
                updatedContent = updatedContent.replace(update.search, update.replace);
                changesCount += matches.length;
            }
        }
        
        if (changesCount > 0) {
            if (writeFile(fileConfig.path, updatedContent)) {
                success(`${fileConfig.path} actualizado (${changesCount} cambios)`);
            }
        } else {
            log(`${fileConfig.path} - No se requieren cambios`, 'yellow');
        }
    }
}

// Función para actualizar consultas SQL en archivos de API
function updateSqlQueries() {
    log('Actualizando consultas SQL en APIs...', 'blue');
    
    const apiDir = 'src/app/api';
    
    if (!fs.existsSync(apiDir)) {
        warning(`Directorio de APIs no encontrado: ${apiDir}`);
        return;
    }
    
    // Buscar archivos route.ts recursivamente
    function findRouteFiles(dir) {
        const files = [];
        
        function scan(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item === 'route.ts') {
                    files.push(fullPath);
                }
            }
        }
        
        scan(dir);
        return files;
    }
    
    const routeFiles = findRouteFiles(apiDir);
    log(`Encontrados ${routeFiles.length} archivos de rutas`, 'cyan');
    
    for (const filePath of routeFiles) {
        const content = readFile(filePath);
        if (content === null) {
            continue;
        }
        
        // Crear backup
        createBackup(filePath);
        
        let updatedContent = content;
        let changesCount = 0;
        
        // Aplicar mapeos SQL
        for (const mapping of sqlMappings) {
            const matches = updatedContent.match(mapping.old);
            if (matches) {
                updatedContent = updatedContent.replace(mapping.old, mapping.new);
                changesCount += matches.length;
            }
        }
        
        if (changesCount > 0) {
            if (writeFile(filePath, updatedContent)) {
                success(`${filePath} actualizado (${changesCount} cambios SQL)`);
            }
        } else {
            log(`${filePath} - No se requieren cambios SQL`, 'yellow');
        }
    }
}

// Función para crear nuevos tipos TypeScript
function createNewTypes() {
    log('Creando nuevos tipos TypeScript...', 'blue');
    
    const typesContent = `// Tipos para nueva estructura de base de datos SPOON v2.0
// Generado automáticamente - No editar manualmente

// ===================================================================
// TIPOS DE AUTENTICACIÓN
// ===================================================================

export type AuthRole = 
  | 'super_admin'
  | 'admin'
  | 'owner'
  | 'manager'
  | 'staff'
  | 'waiter'
  | 'kitchen'
  | 'cashier';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending'
  | 'locked';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: AuthRole;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  failed_login_attempts: number;
  last_failed_login?: string;
  account_locked_until?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  email_verification_token?: string;
  email_verification_expires?: string;
  last_login?: string;
  login_count: number;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  device_info: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  location_info: Record<string, any>;
  is_active: boolean;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

// ===================================================================
// TIPOS DE RESTAURANTE
// ===================================================================

export type PriceRange = 'budget' | 'medium' | 'expensive' | 'luxury';
export type RestaurantStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  cuisine_type?: string;
  price_range: PriceRange;
  capacity?: number;
  owner_id: string;
  status: RestaurantStatus;
  tax_id?: string;
  business_license?: string;
  health_permit?: string;
  settings: Record<string, any>;
  social_media: Record<string, any>;
  delivery_settings: Record<string, any>;
  payment_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface BusinessHours {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0=Domingo, 6=Sábado
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  is_24_hours: boolean;
  break_start_time?: string;
  break_end_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// TIPOS DE MENÚ
// ===================================================================

export type CategoryType = 
  | 'entrada'
  | 'principio'
  | 'proteina'
  | 'acompanamiento'
  | 'bebida'
  | 'postre'
  | 'aperitivo'
  | 'especial';

export type ProductStatus = 
  | 'active'
  | 'inactive'
  | 'draft'
  | 'archived'
  | 'discontinued'
  | 'out_of_stock';

export type DailyMenuStatus = 
  | 'draft'
  | 'published'
  | 'archived'
  | 'cancelled';

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  category_type: CategoryType;
  icon?: string;
  color?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  availability_schedule: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  slug: string;
  current_version: number;
  base_price: number;
  current_price: number;
  cost_price?: number;
  profit_margin?: number;
  sku?: string;
  barcode?: string;
  image_url?: string;
  gallery_images: string[];
  preparation_time?: number;
  cooking_instructions?: string;
  allergens: string[];
  nutritional_info: Record<string, any>;
  ingredients: any[];
  customization_options: Record<string, any>;
  tags: string[];
  status: ProductStatus;
  is_featured: boolean;
  is_favorite: boolean;
  is_special: boolean;
  is_seasonal: boolean;
  seasonal_start?: string;
  seasonal_end?: string;
  availability_schedule: Record<string, any>;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProductStock {
  id: string;
  product_id: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_quantity: number;
  max_quantity: number;
  reorder_point: number;
  unit_of_measure: string;
  location?: string;
  batch_number?: string;
  expiration_date?: string;
  supplier_info: Record<string, any>;
  last_updated: string;
  updated_by?: string;
}

export interface DailyMenu {
  id: string;
  restaurant_id: string;
  menu_date: string;
  name?: string;
  description?: string;
  status: DailyMenuStatus;
  total_combinations: number;
  estimated_cost?: number;
  target_profit_margin?: number;
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface MenuCombination {
  id: string;
  daily_menu_id: string;
  name?: string;
  description?: string;
  entrada_id?: string;
  principio_id?: string;
  proteina_id: string;
  bebida_id?: string;
  base_price: number;
  special_price?: number;
  estimated_cost?: number;
  profit_margin?: number;
  max_daily_quantity?: number;
  current_quantity: number;
  sold_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  availability_start?: string;
  availability_end?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// TIPOS DE VENTAS
// ===================================================================

export type OrderType = 'dine_in' | 'takeout' | 'delivery' | 'pickup';
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'transfer'
  | 'digital_wallet'
  | 'credit';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string;
  notes?: string;
  special_instructions?: string;
  estimated_preparation_time?: number;
  actual_preparation_time?: number;
  delivery_address?: string;
  delivery_fee: number;
  delivery_time?: string;
  served_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// ===================================================================
// TIPOS DE RESPUESTA DE API
// ===================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================================================================
// TIPOS DE VISTA (Para reporting)
// ===================================================================

export interface PublicMenuView {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  daily_menu_id: string;
  menu_date: string;
  menu_name?: string;
  menu_description?: string;
  combination_id: string;
  combination_name?: string;
  combination_description?: string;
  base_price: number;
  special_price?: number;
  is_available: boolean;
  availability_start?: string;
  availability_end?: string;
  entrada_name?: string;
  entrada_description?: string;
  entrada_image?: string;
  principio_name?: string;
  principio_description?: string;
  principio_image?: string;
  proteina_name: string;
  proteina_description?: string;
  proteina_image?: string;
  bebida_name?: string;
  bebida_description?: string;
  bebida_image?: string;
  acompañamientos: Array<{
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    quantity: number;
    additional_cost: number;
  }>;
}

export interface SalesDashboardView {
  restaurant_id: string;
  restaurant_name: string;
  sales_date: string;
  total_orders: number;
  gross_sales: number;
  net_sales: number;
  average_order_value: number;
  cash_sales: number;
  card_sales: number;
  digital_sales: number;
  previous_day_sales?: number;
  growth_percentage?: number;
  weekly_average: number;
}

export interface CriticalStockView {
  restaurant_id: string;
  restaurant_name: string;
  product_id: string;
  product_name: string;
  category_name: string;
  current_quantity: number;
  min_quantity: number;
  max_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  stock_status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OVERSTOCK' | 'NORMAL';
  last_updated: string;
}
`;

    const typesPath = 'src/types/database.ts';
    
    if (writeFile(typesPath, typesContent)) {
        success(`Nuevos tipos TypeScript creados: ${typesPath}`);
    }
}

// Función para crear archivo de configuración actualizado
function createUpdatedConfig() {
    log('Creando configuración actualizada...', 'blue');
    
    const configContent = `// Configuración actualizada para SPOON Database v2.0
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
  return query.replace(new RegExp(\`\\\\b\${table}\\\\b\`, 'g'), mappedTable);
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
`;

    const configPath = 'src/config/database-v2.ts';
    
    if (writeFile(configPath, configContent)) {
        success(`Configuración actualizada creada: ${configPath}`);
    }
}

// Función para crear script de verificación
function createVerificationScript() {
    log('Creando script de verificación...', 'blue');
    
    const verificationContent = `#!/usr/bin/env node

/**
 * Script de verificación post-migración
 * Verifica que las APIs funcionen correctamente con la nueva estructura
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Endpoints a verificar
const endpoints = [
  { path: '/api/health', method: 'GET', description: 'Health check' },
  { path: '/api/categorias', method: 'GET', description: 'Categorías' },
  { path: '/api/productos', method: 'GET', description: 'Productos' },
  { path: '/api/menu-dia', method: 'GET', description: 'Menú del día' },
  { path: '/api/combinaciones', method: 'GET', description: 'Combinaciones' }
];

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const options = {
      method,
      timeout: 5000
    };
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(5000);
    req.end();
  });
}

async function verifyEndpoint(endpoint) {
  const url = \`\${BASE_URL}\${endpoint.path}\`;
  
  try {
    console.log(\`🔍 Verificando: \${endpoint.description} (\${endpoint.method} \${endpoint.path})\`);
    
    const response = await makeRequest(url, endpoint.method);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(\`✅ \${endpoint.description}: OK (\${response.status})\`);
      return true;
    } else {
      console.log(\`❌ \${endpoint.description}: Error \${response.status}\`);
      console.log(\`   Response: \${response.data.substring(0, 200)}...\`);
      return false;
    }
  } catch (error) {
    console.log(\`❌ \${endpoint.description}: \${error.message}\`);
    return false;
  }
}

async function runVerification() {
  console.log('=== VERIFICACIÓN POST-MIGRACIÓN ===\\n');
  console.log(\`Base URL: \${BASE_URL}\\n\`);
  
  let successCount = 0;
  let totalCount = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await verifyEndpoint(endpoint);
    if (success) successCount++;
    console.log(''); // Línea en blanco
  }
  
  console.log('=== RESUMEN ===');
  console.log(\`Exitosos: \${successCount}/\${totalCount}\`);
  console.log(\`Fallidos: \${totalCount - successCount}/\${totalCount}\`);
  
  if (successCount === totalCount) {
    console.log('\\n🎉 ¡Todas las verificaciones pasaron exitosamente!');
    process.exit(0);
  } else {
    console.log('\\n❌ Algunas verificaciones fallaron. Revisar configuración.');
    process.exit(1);
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  runVerification().catch(console.error);
}

module.exports = { verifyEndpoint, runVerification };
`;

    const verificationPath = 'scripts/verify-migration.js';
    
    if (writeFile(verificationPath, verificationContent)) {
        success(`Script de verificación creado: ${verificationPath}`);
    }
}

// Función principal
async function main() {
    console.log('=== ACTUALIZACIÓN DE CONFIGURACIÓN DE APIs ===\n');
    console.log('SPOON Database v2.0 - Migración a esquemas y UUIDs\n');
    
    try {
        // Actualizar configuraciones de archivos
        updateFileConfigurations();
        console.log('');
        
        // Actualizar consultas SQL
        updateSqlQueries();
        console.log('');
        
        // Crear nuevos tipos
        createNewTypes();
        console.log('');
        
        // Crear configuración actualizada
        createUpdatedConfig();
        console.log('');
        
        // Crear script de verificación
        createVerificationScript();
        console.log('');
        
        success('=== ACTUALIZACIÓN COMPLETADA ===');
        console.log('\nPróximos pasos:');
        console.log('1. Revisar archivos actualizados');
        console.log('2. Ejecutar migración de base de datos');
        console.log('3. Ejecutar script de verificación');
        console.log('4. Probar APIs manualmente');
        
        console.log('\nComandos útiles:');
        console.log('- Migración: bash scripts/safe-migration.sh');
        console.log('- Verificación: node scripts/verify-migration.js');
        console.log('- Rollback: bash backups/rollback_TIMESTAMP.sh');
        
    } catch (error) {
        error(`Error durante la actualización: ${error.message}`);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    updateFileConfigurations,
    updateSqlQueries,
    createNewTypes,
    createUpdatedConfig,
    createVerificationScript
};
