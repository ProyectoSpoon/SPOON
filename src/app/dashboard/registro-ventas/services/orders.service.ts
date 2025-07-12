// src/app/dashboard/registro-ventas/services/orders.service.ts
import { Order, OrderItem, CreateOrderRequest, OrderStatus } from '../types/orders.types';

export class OrdersService {
  private static BASE_URL = '/api/orders';

  /**
   * Crear nueva orden
   */
  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          order_type: data.order_type || 'dine_in',
          status: 'pending',
          subtotal: data.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
          total_amount: data.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
          payment_status: 'pending'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createOrder:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes activas (no completadas)
   */
  static async getActiveOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${this.BASE_URL}?status=pending,preparing,ready`);
      
      if (!response.ok) {
        throw new Error('Error al obtener órdenes activas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getActiveOrders:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes por estado
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const response = await fetch(`${this.BASE_URL}?status=${status}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes ${status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getOrdersByStatus:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de orden
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const updateData: any = { status };
      
      // Agregar timestamps según el estado
      if (status === 'delivered') {
        updateData.served_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const response = await fetch(`${this.BASE_URL}/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado de orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateOrderStatus:', error);
      throw error;
    }
  }

  /**
   * Marcar orden como entregada
   */
  static async markAsDelivered(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'delivered');
  }

  /**
   * Completar orden (registrar pago)
   */
  static async completeOrder(orderId: string, paymentData: {
    payment_method: string;
    tip_amount?: number;
    payment_reference?: string;
  }): Promise<Order> {
    try {
      const response = await fetch(`${this.BASE_URL}/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          completed_at: new Date().toISOString(),
          payment_status: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error('Error al completar orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en completeOrder:', error);
      throw error;
    }
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await fetch(`${this.BASE_URL}/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Error al cancelar orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en cancelOrder:', error);
      throw error;
    }
  }

  /**
   * Obtener items de una orden
   */
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${orderId}/items`);
      
      if (!response.ok) {
        throw new Error('Error al obtener items de orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getOrderItems:', error);
      throw error;
    }
  }
}
