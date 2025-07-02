// Tipos para nueva estructura de base de datos SPOON v2.0
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
