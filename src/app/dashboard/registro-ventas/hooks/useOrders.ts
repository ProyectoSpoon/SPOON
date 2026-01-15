// src/app/dashboard/registro-ventas/hooks/useOrders.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order, CreateOrderRequest, OrderStatus } from '../types/orders.types';
import { OrdersService } from '../services/orders.service';
import { toast } from 'sonner';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar órdenes activas
  const loadActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersData = await OrdersService.getActiveOrders();
      setActiveOrders(ordersData);
      setOrders(ordersData);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar órdenes';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva orden
  const createOrder = useCallback(async (data: CreateOrderRequest): Promise<Order | null> => {
    try {
      setLoading(true);

      const nuevaOrder = await OrdersService.createOrder(data);

      // Actualizar estado local
      setOrders(prev => [...prev, nuevaOrder]);
      setActiveOrders(prev => [...prev, nuevaOrder]);

      toast.success(`Orden creada para Mesa ${data.table_number || 'S/N'}`);
      return nuevaOrder;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear orden';
      setError(mensaje);
      toast.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderActualizada = await OrdersService.updateOrderStatus(orderId, newStatus);

      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === orderId ? orderActualizada : o));
      setActiveOrders(prev =>
        newStatus === 'delivered' || newStatus === 'cancelled'
          ? prev.filter(o => o.id !== orderId)
          : prev.map(o => o.id === orderId ? orderActualizada : o)
      );

      const mensajes: Record<OrderStatus, string> = {
        pending: 'Orden pendiente creada',
        preparing: 'Orden enviada a cocina',
        ready: 'Orden lista para servir',
        delivered: 'Orden entregada al cliente',
        cancelled: 'Orden cancelada'
      };

      toast.success(mensajes[newStatus] || 'Orden actualizada');
      return orderActualizada;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar orden';
      setError(mensaje);
      toast.error(mensaje);
      return null;
    }
  }, []);

  // Completar orden (registrar pago)
  const completeOrder = useCallback(async (orderId: string, paymentData: {
    payment_method: string;
    tip_amount?: number;
    payment_reference?: string;
  }) => {
    try {
      const orderCompletada = await OrdersService.completeOrder(orderId, paymentData);

      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === orderId ? orderCompletada : o));
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));

      toast.success('💰 Pago registrado exitosamente');
      return orderCompletada;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al completar orden';
      setError(mensaje);
      toast.error(mensaje);
      return null;
    }
  }, []);

  // Marcar como entregada
  const markAsDelivered = useCallback(async (orderId: string) => {
    return updateOrderStatus(orderId, 'delivered');
  }, [updateOrderStatus]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      await OrdersService.cancelOrder(orderId, reason);

      // Actualizar estado local
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'cancelled' as OrderStatus, cancellation_reason: reason }
          : o
      ));
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));

      toast.success('Orden cancelada');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cancelar orden';
      setError(mensaje);
      toast.error(mensaje);
    }
  }, []);

  // Obtener órdenes por estado
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  }, [orders]);

  // Cargar al montar el componente
  useEffect(() => {
    loadActiveOrders();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadActiveOrders, 30000);
    return () => clearInterval(interval);
  }, [loadActiveOrders]);

  return {
    // Estado
    orders,
    activeOrders,
    loading,
    error,

    // Acciones
    createOrder,
    updateOrderStatus,
    markAsDelivered,
    completeOrder,
    cancelOrder,
    loadActiveOrders,

    // Utilidades
    getOrdersByStatus,

    // Estadísticas rápidas
    statistics: {
      pending: getOrdersByStatus('pending').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      total: activeOrders.length
    }
  };
};
