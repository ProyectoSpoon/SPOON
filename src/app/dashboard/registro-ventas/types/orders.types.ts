// src/app/dashboard/registro-ventas/types/orders.types.ts
export type OrderStatus = 
  | 'pending'     // Pendiente  
  | 'preparing'   // En preparación
  | 'ready'       // Lista para servir
  | 'delivered'   // Entregada
  | 'cancelled';  // Cancelada

export type OrderType = 
  | 'dine_in'     // Para comer aquí
  | 'takeout'     // Para llevar
  | 'delivery';   // Domicilio

export type PaymentMethod = 
  | 'cash'        // Efectivo
  | 'card'        // Tarjeta
  | 'transfer'    // Transferencia
  | 'digital';    // Pago digital

export type PaymentStatus = 
  | 'pending'     // Pendiente
  | 'completed'   // Completado
  | 'failed';     // Fallido

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;           // ✅ Mesa
  order_type: OrderType;
  status: OrderStatus;            // ✅ Estado de la orden
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  tip_amount?: number;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  payment_reference?: string;
  notes?: string;
  special_instructions?: string;
  estimated_preparation_time?: number;  // en minutos
  actual_preparation_time?: number;
  served_at?: Date;              // ✅ Hora de entrega
  completed_at?: Date;           // ✅ Completada
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  combination_id?: string;        // ✅ Para combinaciones del menú
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: Date;
}

export interface CreateOrderRequest {
  table_number?: string;
  customer_name?: string;
  order_type: OrderType;
  items: Array<{
    product_id?: string;
    combination_id?: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }>;
  notes?: string;
  special_instructions?: string;
}
