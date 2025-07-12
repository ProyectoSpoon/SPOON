'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useNotifications } from '@/shared/Context/notification-context';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  Package,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  order_number: string;
  table_number: string;
  customer_name?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  order_type: 'dine_in' | 'takeout' | 'delivery';
  subtotal: number;
  total_amount: number;
  items: OrderItem[];
  notes?: string;
  special_instructions?: string;
  created_at: string;
  estimated_preparation_time?: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800', 
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  preparing: 'Preparando',
  ready: 'Lista',
  served: 'Servida',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

const nextStatusMap = {
  pending: 'confirmed',
  confirmed: 'preparing', 
  preparing: 'ready',
  ready: 'served',
  served: 'completed'
};

const GestionOrdenesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const { addNotification } = useNotifications();

  // Cargar órdenes
  const loadOrders = async () => {
    try {
      const statusFilter = filter === 'active' 
        ? 'pending,confirmed,preparing,ready' 
        : filter === 'completed'
        ? 'served,completed,cancelled'
        : '';
        
      const url = statusFilter 
        ? `/api/orders?status=${statusFilter}`
        : '/api/orders';
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cambiar estado de orden
  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Estado actualizado',
          message: `Orden cambiada a: ${statusLabels[newStatus]}`,
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cambiar el estado de la orden',
      });
    }
  };

  // Cancelar orden (sin API específica por ahora)
  const cancelOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return;
    
    const reason = prompt('Motivo de cancelación (opcional):') || 'Cancelada por el sistema';
    
    try {
      // Usar la API general de cambio de estado
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        addNotification({
          type: 'warning',
          title: 'Orden cancelada',
          message: `La orden ha sido cancelada: ${reason}`,
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Error al cancelar orden:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cancelar la orden',
      });
    }
  };

  // Refrescar órdenes
  const refreshOrders = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // Detectar nuevas órdenes
  useEffect(() => {
    let previousOrderCount = 0;
    
    const checkForNewOrders = () => {
      if (orders.length > previousOrderCount && previousOrderCount > 0) {
        const newOrdersCount = orders.length - previousOrderCount;
        addNotification({
          type: 'info',
          title: `${newOrdersCount} nueva${newOrdersCount > 1 ? 's' : ''} orden${newOrdersCount > 1 ? 'es' : ''}`,
          message: `Se ${newOrdersCount > 1 ? 'han' : 'ha'} recibido ${newOrdersCount} orden${newOrdersCount > 1 ? 'es' : ''} nueva${newOrdersCount > 1 ? 's' : ''}`,
        });
      }
      previousOrderCount = orders.length;
    };

    checkForNewOrders();
  }, [orders, addNotification]);

  // Filtrar órdenes por estado
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const groupedOrders = {
    pending: orders.filter(o => o.status === 'pending'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready')
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando órdenes...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Gestión de Órdenes
          </h1>
          <p className="text-gray-600 mt-1">
            Administra el estado de las comandas en tiempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={refreshOrders}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('active')}
          variant={filter === 'active' ? 'default' : 'outline'}
        >
          Órdenes Activas ({activeOrders.length})
        </Button>
        <Button
          onClick={() => setFilter('completed')}
          variant={filter === 'completed' ? 'default' : 'outline'}
        >
          Completadas
        </Button>
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
        >
          Todas
        </Button>
      </div>

      {/* Grid de órdenes por estado (solo para activas) */}
      {filter === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedOrders).map(([status, statusOrders]) => (
            <div key={status} className="space-y-4">
              <h2 className="font-semibold text-lg capitalize flex items-center gap-2">
                {status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                {status === 'confirmed' && <Package className="h-5 w-5 text-blue-500" />}
                {status === 'preparing' && <ChefHat className="h-5 w-5 text-orange-500" />}
                {status === 'ready' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {statusLabels[status]} ({statusOrders.length})
              </h2>
              
              <div className="space-y-3">
                {statusOrders.map((order) => (
                  <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      {/* Header de la orden */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">#{order.order_number}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            Mesa {order.table_number}
                          </div>
                        </div>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>

                      {/* Items de la orden */}
                      <div className="space-y-1">
                        {order.items?.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.item_name}
                            {item.special_instructions && (
                              <p className="text-xs text-gray-500 ml-4">
                                📝 {item.special_instructions}
                              </p>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{order.items.length - 3} items más...
                          </p>
                        )}
                      </div>

                      {/* Notas especiales */}
                      {(order.notes || order.special_instructions) && (
                        <div className="bg-yellow-50 p-2 rounded text-sm">
                          <p className="font-medium text-yellow-800">Notas:</p>
                          <p className="text-yellow-700">
                            {order.notes || order.special_instructions}
                          </p>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">
                          Total: ${order.total_amount?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2 pt-2">
                        {nextStatusMap[order.status] && (
                          <Button
                            onClick={() => changeOrderStatus(order.id, nextStatusMap[order.status])}
                            size="sm"
                            className="flex-1"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {statusLabels[nextStatusMap[order.status]]}
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => cancelOrder(order.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista simple para otras vistas */}
      {filter !== 'active' && (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">#{order.order_number}</h3>
                  <p className="text-sm text-gray-600">
                    Mesa {order.table_number} • {order.items?.length} items • 
                    ${order.total_amount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No hay órdenes {filter === 'active' ? 'activas' : filter === 'completed' ? 'completadas' : ''}
          </h3>
          <p className="text-gray-500">
            Las órdenes aparecerán aquí cuando se creen desde el registro de ventas
          </p>
        </div>
      )}
    </div>
  );
};

export default GestionOrdenesPage;
