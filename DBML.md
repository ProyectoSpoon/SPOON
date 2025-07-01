# SPOON Database Schema - DBML
## Database Markup Language Definition

### Project Definition
```dbml
Project SPOON {
  database_type: 'PostgreSQL'
  Note: '''
    Sistema Operativo para Restaurantes Independientes
    Diseño completo de base de datos normalizada (3FN)
    Optimizado para escalabilidad y rendimiento
  '''
}
```

---

## Schema Definitions

### AUTH Schema - Authentication & Users

```dbml
// Enums for Auth Schema
Enum auth_role_enum {
  super_admin [note: 'Administrador del sistema SPOON']
  admin [note: 'Administrador del restaurante']
  owner [note: 'Dueño del restaurante']
  manager [note: 'Gerente del restaurante']
  staff [note: 'Personal del restaurante']
  waiter [note: 'Mesero']
  kitchen [note: 'Personal de cocina']
  cashier [note: 'Cajero']
}

Enum user_status_enum {
  active [note: 'Usuario activo']
  inactive [note: 'Usuario inactivo']
  suspended [note: 'Usuario suspendido']
  pending [note: 'Pendiente de verificación']
  locked [note: 'Cuenta bloqueada']
}

// Users Table
Table auth.users {
  id uuid [primary key, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  phone varchar(20)
  role auth_role_enum [not null, default: 'staff']
  status user_status_enum [not null, default: 'active']
  email_verified boolean [default: false]
  phone_verified boolean [default: false]
  two_factor_enabled boolean [default: false]
  two_factor_secret varchar(32)
  failed_login_attempts integer [default: 0]
  last_failed_login timestamptz
  account_locked_until timestamptz
  password_reset_token varchar(255)
  password_reset_expires timestamptz
  email_verification_token varchar(255)
  email_verification_expires timestamptz
  last_login timestamptz
  login_count integer [default: 0]
  preferences jsonb [default: '{}']
  metadata jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  Note: 'Tabla principal de usuarios del sistema con autenticación completa'
}

// User Sessions Table
Table auth.user_sessions {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > auth.users.id]
  session_token varchar(500) [unique, not null]
  refresh_token varchar(500)
  device_info jsonb [default: '{}']
  ip_address inet
  user_agent text
  location_info jsonb [default: '{}']
  is_active boolean [default: true]
  expires_at timestamptz [not null]
  last_activity timestamptz [default: `CURRENT_TIMESTAMP`]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Gestión de sesiones activas de usuarios'
}

// Permissions Table
Table auth.permissions {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(100) [unique, not null]
  description text
  resource varchar(100) [not null]
  action varchar(50) [not null]
  conditions jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Definición de permisos granulares del sistema'
}

// Role Permissions Table
Table auth.role_permissions {
  id uuid [primary key, default: `gen_random_uuid()`]
  role auth_role_enum [not null]
  permission_id uuid [not null, ref: > auth.permissions.id]
  granted_at timestamptz [default: `CURRENT_TIMESTAMP`]
  granted_by uuid [ref: > auth.users.id]

  indexes {
    (role, permission_id) [unique]
  }

  Note: 'Asignación de permisos por rol'
}
```

### RESTAURANT Schema - Restaurant Data

```dbml
// Enums for Restaurant Schema
Enum price_range_enum {
  budget
  medium
  expensive
  luxury
}

Enum restaurant_status_enum {
  active
  inactive
  suspended
  pending_approval
}

// Restaurants Table
Table restaurant.restaurants {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(200) [not null]
  slug varchar(200) [unique, not null]
  description text
  address text
  city varchar(100)
  state varchar(100)
  country varchar(100) [default: 'Colombia']
  postal_code varchar(20)
  latitude decimal(10,8)
  longitude decimal(11,8)
  phone varchar(20)
  email varchar(255)
  website varchar(255)
  logo_url varchar(500)
  cover_image_url varchar(500)
  cuisine_type varchar(100)
  price_range price_range_enum [default: 'medium']
  capacity integer
  owner_id uuid [not null, ref: > auth.users.id]
  status restaurant_status_enum [default: 'active']
  tax_id varchar(50)
  business_license varchar(100)
  health_permit varchar(100)
  settings jsonb [default: '{}']
  social_media jsonb [default: '{}']
  delivery_settings jsonb [default: '{}']
  payment_settings jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  Note: 'Información principal de restaurantes'
}

// Restaurant Users Table
Table restaurant.restaurant_users {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  user_id uuid [not null, ref: > auth.users.id]
  role auth_role_enum [not null]
  permissions jsonb [default: '{}']
  is_active boolean [default: true]
  hired_date date
  salary decimal(10,2)
  commission_rate decimal(5,2)
  schedule jsonb [default: '{}']
  emergency_contact jsonb [default: '{}']
  notes text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, user_id) [unique]
  }

  Note: 'Relación entre usuarios y restaurantes con roles específicos'
}

// Business Hours Table
Table restaurant.business_hours {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  day_of_week integer [not null, note: '0=Domingo, 6=Sábado']
  open_time time
  close_time time
  is_closed boolean [default: false]
  is_24_hours boolean [default: false]
  break_start_time time
  break_end_time time
  notes text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]

  indexes {
    (restaurant_id, day_of_week) [unique]
  }

  Note: 'Horarios comerciales regulares por día de la semana'
}

// Special Hours Table
Table restaurant.special_hours {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  date date [not null]
  open_time time
  close_time time
  is_closed boolean [default: false]
  reason varchar(200)
  notes text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  indexes {
    (restaurant_id, date) [unique]
  }

  Note: 'Horarios especiales para fechas específicas'
}
```

### MENU Schema - Menu Management

```dbml
// Enums for Menu Schema
Enum category_type_enum {
  entrada [note: 'CAT_001']
  principio [note: 'CAT_002']
  proteina [note: 'CAT_003']
  acompanamiento [note: 'CAT_004']
  bebida [note: 'CAT_005']
  postre
  aperitivo
  especial
}

Enum product_status_enum {
  active [note: 'Producto activo']
  inactive [note: 'Producto inactivo']
  draft [note: 'Borrador']
  archived [note: 'Archivado']
  discontinued [note: 'Descontinuado']
  out_of_stock [note: 'Sin stock']
}

Enum version_status_enum {
  draft
  published
  archived
}

Enum stock_movement_enum {
  purchase [note: 'Compra']
  sale [note: 'Venta']
  adjustment [note: 'Ajuste']
  waste [note: 'Desperdicio']
  transfer [note: 'Transferencia']
  return [note: 'Devolución']
  production [note: 'Producción']
  consumption [note: 'Consumo']
}

Enum daily_menu_status_enum {
  draft [note: 'Borrador']
  published [note: 'Publicado']
  archived [note: 'Archivado']
  cancelled [note: 'Cancelado']
}

// Categories Table
Table menu.categories {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  name varchar(100) [not null]
  description text
  slug varchar(100) [not null]
  parent_id uuid [ref: > menu.categories.id]
  category_type category_type_enum [not null]
  icon varchar(100)
  color varchar(7) [note: 'Código hexadecimal']
  image_url varchar(500)
  sort_order integer [default: 0]
  is_active boolean [default: true]
  availability_schedule jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, slug) [unique]
  }

  Note: 'Categorías de productos del menú con jerarquía'
}

// Products Table
Table menu.products {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  category_id uuid [not null, ref: > menu.categories.id]
  name varchar(200) [not null]
  description text
  slug varchar(200) [not null]
  current_version integer [default: 1]
  base_price decimal(10,2) [not null]
  current_price decimal(10,2) [not null]
  cost_price decimal(10,2)
  profit_margin decimal(5,2)
  sku varchar(100)
  barcode varchar(100)
  image_url varchar(500)
  gallery_images jsonb [default: '[]']
  preparation_time integer [note: 'en minutos']
  cooking_instructions text
  allergens jsonb [default: '[]']
  nutritional_info jsonb [default: '{}']
  ingredients jsonb [default: '[]']
  customization_options jsonb [default: '{}']
  tags jsonb [default: '[]']
  status product_status_enum [default: 'active']
  is_featured boolean [default: false]
  is_favorite boolean [default: false]
  is_special boolean [default: false]
  is_seasonal boolean [default: false]
  seasonal_start date
  seasonal_end date
  availability_schedule jsonb [default: '{}']
  sort_order integer [default: 0]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, slug) [unique]
  }

  Note: 'Productos del menú con versionado y configuraciones avanzadas'
}

// Product Versions Table
Table menu.product_versions {
  id uuid [primary key, default: `gen_random_uuid()`]
  product_id uuid [not null, ref: > menu.products.id]
  version_number integer [not null]
  changes jsonb [not null]
  change_reason text
  status version_status_enum [default: 'draft']
  published_at timestamptz
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [not null, ref: > auth.users.id]
  approved_by uuid [ref: > auth.users.id]
  approved_at timestamptz

  indexes {
    (product_id, version_number) [unique]
  }

  Note: 'Historial de versiones de productos'
}

// Product Price History Table
Table menu.product_price_history {
  id uuid [primary key, default: `gen_random_uuid()`]
  product_id uuid [not null, ref: > menu.products.id]
  old_price decimal(10,2)
  new_price decimal(10,2) [not null]
  change_reason text
  effective_date timestamptz [default: `CURRENT_TIMESTAMP`]
  expiration_date timestamptz
  created_by uuid [not null, ref: > auth.users.id]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Historial de cambios de precios'
}

// Product Stock Table
Table menu.product_stock {
  id uuid [primary key, default: `gen_random_uuid()`]
  product_id uuid [not null, ref: > menu.products.id]
  current_quantity decimal(10,2) [default: 0]
  reserved_quantity decimal(10,2) [default: 0]
  available_quantity decimal(10,2) [note: 'Calculado: current_quantity - reserved_quantity']
  min_quantity decimal(10,2) [default: 0]
  max_quantity decimal(10,2) [default: 1000]
  reorder_point decimal(10,2) [default: 0]
  unit_of_measure varchar(20) [default: 'unit']
  location varchar(100)
  batch_number varchar(100)
  expiration_date date
  supplier_info jsonb [default: '{}']
  last_updated timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    product_id [unique]
  }

  Note: 'Control de inventario por producto'
}

// Stock Movements Table
Table menu.stock_movements {
  id uuid [primary key, default: `gen_random_uuid()`]
  product_id uuid [not null, ref: > menu.products.id]
  movement_type stock_movement_enum [not null]
  quantity decimal(10,2) [not null]
  unit_cost decimal(10,2)
  total_cost decimal(10,2)
  reason text
  reference_number varchar(100)
  supplier_id uuid
  batch_number varchar(100)
  expiration_date date
  notes text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [not null, ref: > auth.users.id]

  Note: 'Movimientos de inventario con trazabilidad completa'
}

// Daily Menus Table
Table menu.daily_menus {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  menu_date date [not null]
  name varchar(200)
  description text
  status daily_menu_status_enum [default: 'draft']
  total_combinations integer [default: 0]
  estimated_cost decimal(10,2)
  target_profit_margin decimal(5,2)
  published_at timestamptz
  published_by uuid [ref: > auth.users.id]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [not null, ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, menu_date) [unique]
  }

  Note: 'Menús diarios publicables en apps móviles'
}

// Menu Combinations Table
Table menu.menu_combinations {
  id uuid [primary key, default: `gen_random_uuid()`]
  daily_menu_id uuid [not null, ref: > menu.daily_menus.id]
  name varchar(200)
  description text
  entrada_id uuid [ref: > menu.products.id]
  principio_id uuid [ref: > menu.products.id]
  proteina_id uuid [not null, ref: > menu.products.id]
  bebida_id uuid [ref: > menu.products.id]
  base_price decimal(10,2) [not null]
  special_price decimal(10,2)
  estimated_cost decimal(10,2)
  profit_margin decimal(5,2)
  max_daily_quantity integer
  current_quantity integer [default: 0]
  sold_quantity integer [default: 0]
  is_available boolean [default: true]
  is_featured boolean [default: false]
  availability_start time
  availability_end time
  sort_order integer [default: 0]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Combinaciones del menú del día (entrada + principio + proteína + bebida)'
}

// Combination Sides Table
Table menu.combination_sides {
  id uuid [primary key, default: `gen_random_uuid()`]
  combination_id uuid [not null, ref: > menu.menu_combinations.id]
  product_id uuid [not null, ref: > menu.products.id]
  quantity decimal(10,2) [default: 1]
  is_required boolean [default: false]
  additional_cost decimal(10,2) [default: 0]
  sort_order integer [default: 0]

  indexes {
    (combination_id, product_id) [unique]
  }

  Note: 'Acompañamientos adicionales para combinaciones'
}
```

### SALES Schema - Sales & Transactions

```dbml
// Enums for Sales Schema
Enum order_type_enum {
  dine_in
  takeout
  delivery
  pickup
}

Enum order_status_enum {
  pending [note: 'Pendiente']
  confirmed [note: 'Confirmado']
  preparing [note: 'En preparación']
  ready [note: 'Listo']
  served [note: 'Servido']
  completed [note: 'Completado']
  cancelled [note: 'Cancelado']
}

Enum payment_method_enum {
  cash [note: 'Efectivo']
  card [note: 'Tarjeta']
  transfer [note: 'Transferencia']
  digital_wallet [note: 'Billetera digital']
  credit [note: 'Crédito']
}

Enum payment_status_enum {
  pending
  paid
  partial
  refunded
  failed
}

Enum order_item_status_enum {
  pending
  preparing
  ready
  served
  cancelled
}

// Orders Table
Table sales.orders {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  order_number varchar(50) [not null]
  customer_name varchar(200)
  customer_phone varchar(20)
  customer_email varchar(255)
  table_number varchar(20)
  order_type order_type_enum [not null]
  status order_status_enum [default: 'pending']
  subtotal decimal(10,2) [not null]
  tax_amount decimal(10,2) [default: 0]
  discount_amount decimal(10,2) [default: 0]
  tip_amount decimal(10,2) [default: 0]
  total_amount decimal(10,2) [not null]
  payment_method payment_method_enum
  payment_status payment_status_enum [default: 'pending']
  payment_reference varchar(100)
  notes text
  special_instructions text
  estimated_preparation_time integer
  actual_preparation_time integer
  delivery_address text
  delivery_fee decimal(10,2) [default: 0]
  delivery_time timestamptz
  served_at timestamptz
  completed_at timestamptz
  cancelled_at timestamptz
  cancellation_reason text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  created_by uuid [not null, ref: > auth.users.id]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, order_number) [unique]
  }

  Note: 'Órdenes de venta con seguimiento completo'
}

// Order Items Table
Table sales.order_items {
  id uuid [primary key, default: `gen_random_uuid()`]
  order_id uuid [not null, ref: > sales.orders.id]
  product_id uuid [ref: > menu.products.id]
  combination_id uuid [ref: > menu.menu_combinations.id]
  item_name varchar(200) [not null]
  item_description text
  quantity decimal(10,2) [not null]
  unit_price decimal(10,2) [not null]
  total_price decimal(10,2) [not null]
  customizations jsonb [default: '{}']
  special_instructions text
  status order_item_status_enum [default: 'pending']
  prepared_at timestamptz
  served_at timestamptz
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Items individuales de cada orden con seguimiento de estado'
}

// Daily Sales Summary Table
Table sales.daily_sales_summary {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  sales_date date [not null]
  total_orders integer [default: 0]
  total_items integer [default: 0]
  gross_sales decimal(12,2) [default: 0]
  net_sales decimal(12,2) [default: 0]
  tax_collected decimal(10,2) [default: 0]
  tips_collected decimal(10,2) [default: 0]
  discounts_given decimal(10,2) [default: 0]
  refunds_given decimal(10,2) [default: 0]
  cash_sales decimal(10,2) [default: 0]
  card_sales decimal(10,2) [default: 0]
  digital_sales decimal(10,2) [default: 0]
  average_order_value decimal(10,2) [default: 0]
  peak_hour_start time
  peak_hour_end time
  top_selling_items jsonb [default: '[]']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]

  indexes {
    (restaurant_id, sales_date) [unique]
  }

  Note: 'Resumen diario de ventas con métricas clave'
}
```

### AUDIT Schema - Auditing & Logs

```dbml
// Enums for Audit Schema
Enum log_severity_enum {
  debug
  info
  warning
  error
  critical
}

Enum publication_action_enum {
  publish
  unpublish
  update
  schedule
}

// Activity Logs Table
Table audit.activity_logs {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [ref: > restaurant.restaurants.id]
  user_id uuid [ref: > auth.users.id]
  action varchar(100) [not null]
  resource_type varchar(100) [not null]
  resource_id uuid
  old_values jsonb
  new_values jsonb
  ip_address inet
  user_agent text
  session_id uuid
  severity log_severity_enum [default: 'info']
  description text
  metadata jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Log completo de actividades del sistema'
}

// Menu Publication Logs Table
Table audit.menu_publication_logs {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  daily_menu_id uuid [not null, ref: > menu.daily_menus.id]
  action publication_action_enum [not null]
  published_by uuid [not null, ref: > auth.users.id]
  publication_channel varchar(50)
  total_combinations integer
  success boolean [default: true]
  error_message text
  metadata jsonb [default: '{}']
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Trazabilidad de publicaciones de menú'
}
```

### CONFIG Schema - System Configuration

```dbml
// Enums for Config Schema
Enum setting_type_enum {
  string
  number
  boolean
  json
  array
}

// System Settings Table
Table config.system_settings {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [ref: > restaurant.restaurants.id]
  setting_key varchar(100) [not null]
  setting_value jsonb [not null]
  setting_type setting_type_enum [not null]
  description text
  is_public boolean [default: false]
  is_encrypted boolean [default: false]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_at timestamptz [default: `CURRENT_TIMESTAMP`]
  updated_by uuid [ref: > auth.users.id]

  indexes {
    (restaurant_id, setting_key) [unique]
  }

  Note: 'Configuraciones del sistema por restaurante'
}
```

---

## Views for Mobile Apps & Reporting

```dbml
// Public Menu View for Mobile Apps
Table public_menu_view {
  restaurant_id uuid
  restaurant_name varchar(200)
  restaurant_slug varchar(200)
  daily_menu_id uuid
  menu_date date
  menu_name varchar(200)
  menu_description text
  combination_id uuid
  combination_name varchar(200)
  combination_description text
  base_price decimal(10,2)
  special_price decimal(10,2)
  is_available boolean
  availability_start time
  availability_end time
  entrada_name varchar(200)
  entrada_description text
  entrada_image varchar(500)
  principio_name varchar(200)
  principio_description text
  principio_image varchar(500)
  proteina_name varchar(200)
  proteina_description text
  proteina_image varchar(500)
  bebida_name varchar(200)
  bebida_description text
  bebida_image varchar(500)
  acompañamientos json

  Note: 'Vista pública del menú para apps móviles'
}

// Sales Dashboard View
Table sales_dashboard_view {
  restaurant_id uuid
  restaurant_name varchar(200)
  sales_date date
  total_orders integer
  gross_sales decimal(12,2)
  net_sales decimal(12,2)
  average_order_value decimal(10,2)
  cash_sales decimal(10,2)
  card_sales decimal(10,2)
  digital_sales decimal(10,2)
  previous_day_sales decimal(12,2)
  growth_percentage decimal(5,2)
  weekly_average decimal(12,2)

  Note: 'Dashboard de ventas con métricas comparativas'
}

// Top Selling Products View
Table top_selling_products_view {
  restaurant_id uuid
  restaurant_name varchar(200)
  product_id uuid
  product_name varchar(200)
  category_name varchar(100)
  times_ordered integer
  total_quantity_sold decimal(10,2)
  total_revenue decimal(12,2)
  average_price decimal(10,2)
  sales_rank integer

  Note: 'Productos más vendidos con ranking'
}

// Critical Stock View
Table critical_stock_view {
  restaurant_id uuid
  restaurant_name varchar(200)
  product_id uuid
  product_name varchar(200)
  category_name varchar(100)
  current_quantity decimal(10,2)
  min_quantity decimal(10,2)
  max_quantity decimal(10,2)
  available_quantity decimal(10,2)
  reserved_quantity decimal(10,2)
  stock_status varchar(20)
  last_updated timestamptz
  days_remaining decimal(5,1)

  Note: 'Vista de stock crítico con alertas'
}
```

---

## Indexes & Constraints

```dbml
// Key Indexes for Performance
TableGroup "Authentication Indexes" {
  auth.users
  auth.user_sessions
  auth.permissions
  auth.role_permissions
}

TableGroup "Restaurant Indexes" {
  restaurant.restaurants
  restaurant.restaurant_users
  restaurant.business_hours
  restaurant.special_hours
}

TableGroup "Menu Indexes" {
  menu.categories
  menu.products
  menu.product_versions
  menu.product_price_history
  menu.product_stock
  menu.stock_movements
  menu.daily_menus
  menu.menu_combinations
  menu.combination_sides
}

TableGroup "Sales Indexes" {
  sales.orders
  sales.order_items
  sales.daily_sales_summary
}

TableGroup "Audit Indexes" {
  audit.activity_logs
  audit.menu_publication_logs
}

TableGroup "Config Indexes" {
  config.system_settings
}
```

---

## Business Logic Constraints

```dbml
// Key Business Rules
Note business_rules {
  '''
  BUSINESS CONSTRAINTS:
  
  1. Horarios de Negocio:
     - open_time < close_time OR is_closed = true
     - day_of_week BETWEEN 0 AND 6
  
  2. Precios:
     - base_price > 0 AND current_price > 0
     - special_price <= base_price (cuando aplique)
  
  3. Stock:
     - current_quantity >= 0 AND reserved_quantity >= 0
     - available_quantity = current_quantity - reserved_quantity
  
  4. Menús Diarios:
     - menu_date >= CURRENT_DATE (no menús pasados)
     - Solo un menú por restaurante por fecha
  
  5. Órdenes:
     - total_amount > 0 AND subtotal > 0
     - total_amount = subtotal + tax_amount - discount_amount + tip_amount
  
  6. Combinaciones:
     - proteina_id es obligatorio
     - entrada_id, principio_id, bebida_id son opcionales
  
  7. Usuarios:
     - email único por usuario
     - password_hash requerido
     - failed_login_attempts <= 5 antes de bloqueo
  
  8. Restaurantes:
     - slug único por restaurante
     - owner_id requerido
     - latitude BETWEEN -90 AND 90
     - longitude BETWEEN -180 AND 180
  '''
}
```

---

## Relationship Patterns

```dbml
// Core Entity Relationships - One to Many
Ref: auth.users.id < restaurant.restaurants.owner_id
Ref: restaurant.restaurants.id < restaurant.restaurant_users.restaurant_id
Ref: auth.users.id < restaurant.restaurant_users.user_id

// Menu Relationships - Hierarchical
Ref: restaurant.restaurants.id < menu.categories.restaurant_id
Ref: menu.categories.id < menu.products.category_id
Ref: menu.products.id - menu.product_stock.product_id
Ref: menu.products.id < menu.product_versions.product_id
Ref: menu.products.id < menu.product_price_history.product_id
Ref: menu.products.id < menu.stock_movements.product_id

// Daily Menu Relationships - Composition
Ref: restaurant.restaurants.id < menu.daily_menus.restaurant_id
Ref: menu.daily_menus.id < menu.menu_combinations.daily_menu_id
Ref: menu.products.id < menu.menu_combinations.entrada_id
Ref: menu.products.id < menu.menu_combinations.principio_id
Ref: menu.products.id < menu.menu_combinations.proteina_id
Ref: menu.products.id < menu.menu_combinations.bebida_id
Ref: menu.menu_combinations.id < menu.combination_sides.combination_id
Ref: menu.products.id < menu.combination_sides.product_id

// Sales Relationships - Transactional
Ref: restaurant.restaurants.id < sales.orders.restaurant_id
Ref: restaurant.restaurants.id < sales.daily_sales_summary.restaurant_id
Ref: sales.orders.id < sales.order_items.order_id
Ref: menu.products.id < sales.order_items.product_id
Ref: menu.menu_combinations.id < sales.order_items.combination_id

// Audit Relationships - Logging
Ref: restaurant.restaurants.id < audit.activity_logs.restaurant_id
Ref: auth.users.id < audit.activity_logs.user_id
Ref: restaurant.restaurants.id < audit.menu_publication_logs.restaurant_id
Ref: menu.daily_menus.id < audit.menu_publication_logs.daily_menu_id
Ref: auth.users.id < audit.menu_publication_logs.published_by

// Configuration Relationships
Ref: restaurant.restaurants.id < config.system_settings.restaurant_id
Ref: auth.users.id < config.system_settings.updated_by

// Authentication Relationships
Ref: auth.permissions.id < auth.role_permissions.permission_id
Ref: auth.users.id < auth.role_permissions.granted_by
Ref: auth.users.id < auth.user_sessions.user_id

// Business Hours Relationships
Ref: restaurant.restaurants.id < restaurant.business_hours.restaurant_id
Ref: restaurant.restaurants.id < restaurant.special_hours.restaurant_id

// User Management Relationships
Ref: auth.users.id < restaurant.restaurant_users.created_by
Ref: auth.users.id < menu.categories.created_by
Ref: auth.users.id < menu.categories.updated_by
Ref: auth.users.id < menu.products.created_by
Ref: auth.users.id < menu.products.updated_by
Ref: auth.users.id < menu.product_versions.created_by
Ref: auth.users.id < menu.product_versions.approved_by
Ref: auth.users.id < menu.product_price_history.created_by
Ref: auth.users.id < menu.product_stock.updated_by
Ref: auth.users.id < menu.stock_movements.created_by
Ref: auth.users.id < menu.daily_menus.created_by
Ref: auth.users.id < menu.daily_menus.updated_by
Ref: auth.users.id < menu.daily_menus.published_by
Ref: auth.users.id < sales.orders.created_by
Ref: auth.users.id < sales.orders.updated_by
```

---

## Future Extensions

```dbml
// Future Schema: Customers
Table customers.customer_profiles {
  id uuid [primary key, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  phone varchar(20)
  first_name varchar(100)
  last_name varchar(100)
  birth_date date
  preferences jsonb [default: '{}']
  loyalty_points integer [default: 0]
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Perfiles de clientes para pedidos online'
}

Table customers.delivery_addresses {
  id uuid [primary key, default: `gen_random_uuid()`]
  customer_id uuid [not null, ref: > customers.customer_profiles.id]
  address_line_1 text [not null]
  address_line_2 text
  city varchar(100)
  postal_code varchar(20)
  latitude decimal(10,8)
  longitude decimal(11,8)
  is_default boolean [default: false]
  delivery_instructions text

  Note: 'Direcciones de entrega por cliente'
}

// Future Schema: Inventory
Table inventory.suppliers {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(200) [not null]
  contact_person varchar(200)
  email varchar(255)
  phone varchar(20)
  address text
  payment_terms jsonb [default: '{}']
  rating decimal(3,2)
  is_active boolean [default: true]

  Note: 'Proveedores para gestión de inventario'
}

Table inventory.purchase_orders {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  supplier_id uuid [not null, ref: > inventory.suppliers.id]
  order_number varchar(50) [not null]
  status varchar(20) [default: 'draft']
  subtotal decimal(10,2)
  tax_amount decimal(10,2)
  total_amount decimal(10,2)
  expected_delivery_date date
  actual_delivery_date date
  created_by uuid [not null, ref: > auth.users.id]

  Note: 'Órdenes de compra a proveedores'
}

// Future Schema: Loyalty
Table loyalty.loyalty_programs {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  name varchar(200) [not null]
  description text
  points_per_dollar decimal(5,2) [default: 1.00]
  redemption_rate decimal(5,2) [default: 0.01]
  is_active boolean [default: true]

  Note: 'Programas de fidelización por restaurante'
}

Table loyalty.point_transactions {
  id uuid [primary key, default: `gen_random_uuid()`]
  customer_id uuid [not null, ref: > customers.customer_profiles.id]
  order_id uuid [ref: > sales.orders.id]
  transaction_type varchar(20) [not null]
  points integer [not null]
  description text
  created_at timestamptz [default: `CURRENT_TIMESTAMP`]

  Note: 'Transacciones de puntos de fidelidad'
}

// Future Schema: Reports
Table reports.custom_reports {
  id uuid [primary key, default: `gen_random_uuid()`]
  restaurant_id uuid [not null, ref: > restaurant.restaurants.id]
  name varchar(200) [not null]
  description text
  query_template text [not null]
  parameters jsonb [default: '{}']
  schedule jsonb [default: '{}']
  recipients jsonb [default: '[]']
  is_active boolean [default: true]
  created_by uuid [not null, ref: > auth.users.id]

  Note: 'Reportes personalizados por restaurante'
}
```

---

## Performance Optimization Notes

```dbml
Note performance_indexes {
  '''
  ÍNDICES CRÍTICOS PARA RENDIMIENTO:
  
  1. Autenticación (< 50ms):
     - auth.users(email) - Login frecuente
     - auth.user_sessions(session_token) - Validación de sesión
     - auth.user_sessions(user_id, is_active) - Sesiones activas
  
  2. Menús (< 100ms):
     - menu.products(restaurant_id, category_id, status) - Listado de productos
     - menu.daily_menus(restaurant_id, menu_date, status) - Menú del día
     - menu.menu_combinations(daily_menu_id, is_available) - Combinaciones disponibles
  
  3. Ventas (< 200ms):
     - sales.orders(restaurant_id, created_at) - Órdenes por fecha
     - sales.orders(status, payment_status) - Órdenes pendientes
     - sales.daily_sales_summary(restaurant_id, sales_date) - Resúmenes diarios
  
  4. Stock (< 100ms):
     - menu.product_stock(product_id) - Stock por producto
     - menu.stock_movements(product_id, created_at) - Movimientos recientes
  
  5. Auditoría (< 500ms):
     - audit.activity_logs(restaurant_id, created_at) - Logs por fecha
     - audit.activity_logs(user_id, action) - Acciones por usuario
  
  ÍNDICES PARCIALES:
  - menu.products WHERE status = 'active' - Solo productos activos
  - menu.daily_menus WHERE status = 'published' - Solo menús publicados
  - sales.orders WHERE status IN ('pending', 'confirmed', 'preparing') - Órdenes activas
  
  ÍNDICES JSONB:
  - menu.products USING GIN (tags) - Búsqueda por etiquetas
  - menu.products USING GIN (to_tsvector('spanish', name || ' ' || description)) - Búsqueda de texto
  '''
}
```

---

## Security & Compliance Notes

```dbml
Note security_features {
  '''
  CARACTERÍSTICAS DE SEGURIDAD:
  
  1. Row Level Security (RLS):
     - Usuarios solo acceden a sus restaurantes
     - Datos aislados por restaurant_id
     - Políticas automáticas por rol
  
  2. Encriptación:
     - Contraseñas con bcrypt
     - Tokens de sesión seguros
     - Datos sensibles con pgcrypto
  
  3. Auditoría Completa:
     - Todos los cambios registrados
     - IP y user agent capturados
     - Trazabilidad de publicaciones
  
  4. Validaciones:
     - Constraints de integridad
     - Triggers de validación
     - Enums para valores controlados
  
  5. Acceso Controlado:
     - Permisos granulares
     - Roles diferenciados
     - Sesiones con expiración
  
  CUMPLIMIENTO:
  - GDPR: Derecho al olvido implementable
  - PCI DSS: No almacenamiento de datos de tarjetas
  - SOX: Auditoría completa de transacciones
  '''
}
```

---

## Scalability Considerations

```dbml
Note scalability_design {
  '''
  DISEÑO PARA ESCALABILIDAD:
  
  1. Particionado:
     - audit.activity_logs por fecha (mensual)
     - sales.orders por restaurant_id (hash)
     - sales.daily_sales_summary por fecha (rango)
  
  2. Replicación:
     - Read replicas para reportes
     - Write master para transacciones
     - Failover automático
  
  3. Caché:
     - Redis para sesiones
     - Memcached para consultas frecuentes
     - CDN para imágenes
  
  4. Archivado:
     - Datos > 2 años a almacenamiento frío
     - Compresión automática
     - Políticas de retención
  
  MÉTRICAS OBJETIVO:
  - 1000+ restaurantes concurrentes
  - 10,000+ órdenes por hora
  - 99.9% uptime
  - < 100ms tiempo de respuesta promedio
  '''
}
```

---

## Migration Strategy

```dbml
Note migration_phases {
  '''
  FASES DE MIGRACIÓN:
  
  FASE 1 - Core (Semanas 1-2):
  - auth schema completo
  - restaurant schema básico
  - menu schema esencial
  
  FASE 2 - Operations (Semanas 3-4):
  - sales schema completo
  - audit schema básico
  - config schema
  
  FASE 3 - Advanced (Semanas 5-6):
  - Vistas especializadas
  - Índices de rendimiento
  - Triggers automáticos
  
  FASE 4 - Extensions (Semanas 7-8):
  - customers schema
  - inventory schema
  - loyalty schema
  
  ROLLBACK PLAN:
  - Scripts de reversión por fase
  - Backup antes de cada migración
  - Validación de integridad post-migración
  '''
}
```
