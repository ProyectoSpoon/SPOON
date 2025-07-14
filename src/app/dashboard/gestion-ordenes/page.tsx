'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useNotifications } from '@/shared/Context/notification-context';
import { 
  ChefHat, 
  RefreshCw,
  CreditCard,
  Clock,
  DollarSign
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

const GestionOrdenesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addNotification } = useNotifications();

  // Cargar órdenes activas (solo las que están pendientes de cobro)
  const loadOrders = async () => {
    try {
      // Solo cargar órdenes que están listas para cobrar
      const response = await fetch('/api/orders?status=ready,served');
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

  // Procesar pago de mesa
  const handlePayment = async (orderId: string, tableNumber: string) => {
    if (!confirm(`¿Confirmar pago de Mesa ${tableNumber}?`)) return;
    
    try {
      // Marcar orden como completada
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Pago procesado',
          message: `Mesa ${tableNumber} pagada exitosamente`,
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo procesar el pago',
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
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcular métricas
  const totalVentas = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const promedioMesa = orders.length > 0 ? totalVentas / orders.length : 0;
  const ultimaOrden = orders.length > 0 
    ? new Date(orders[orders.length - 1].created_at).toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '--:--';

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-3 text-gray-600">Cargando órdenes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* KPIs Rápidos */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">Mesas Activas</div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">Total Pendiente</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalVentas)}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">Promedio Mesa</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(promedioMesa)}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">Última Orden</div>
            <div className="text-2xl font-bold text-gray-900">{ultimaOrden}</div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Mesas para Cobrar
            </h1>
            <p className="text-sm text-gray-500">Órdenes activas - Cliente dice mesa y cobras</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={refreshOrders}
              variant="outline"
              disabled={refreshing}
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                Total: {formatCurrency(totalVentas)}
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <hr className="border-gray-200" />

        {/* Grid de mesas - Enfoque en número de mesa */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              
              {/* Número de mesa prominente */}
              <div className="bg-gray-900 text-white text-center py-4 rounded-t-lg">
                <div className="text-2xl font-bold">MESA</div>
                <div className="text-4xl font-bold">{order.table_number}</div>
              </div>

              {/* Detalles del pedido */}
              <div className="p-4 space-y-3">
                
                {/* Hora del pedido y número de orden */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.created_at).toLocaleTimeString('es-CO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span>#{order.order_number}</span>
                </div>

                {/* Items pedidos */}
                <div className="space-y-2">
                  <div className="text-sm font-bold text-gray-700 border-b pb-1">
                    Productos consumidos:
                  </div>
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-900">
                        <span className="font-bold">{item.quantity}x</span> {item.item_name}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.total_price || (item.unit_price * item.quantity))}
                      </span>
                    </div>
                  ))}

                  {/* Notas especiales si las hay */}
                  {(order.notes || order.special_instructions) && (
                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                      <span className="font-bold text-yellow-800">Notas:</span>
                      <span className="text-yellow-700 ml-1">
                        {order.notes || order.special_instructions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total prominente */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      TOTAL:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Botón de cobrar */}
                <Button
                  onClick={() => handlePayment(order.id, order.table_number)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  COBRAR MESA {order.table_number}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white p-8 border border-gray-100 rounded-lg shadow-sm max-w-md mx-auto">
              <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No hay mesas pendientes de cobro
              </h3>
              <p className="text-gray-500 text-sm">
                Las órdenes aparecerán aquí cuando estén listas para servir
              </p>
            </div>
          </div>
        )}

        {/* Resumen rápido */}
        {orders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-blue-800">Resumen del servicio</h3>
                <p className="text-blue-700 text-sm">
                  {orders.length} mesa{orders.length > 1 ? 's' : ''} activa{orders.length > 1 ? 's' : ''} por cobrar
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">
                  {formatCurrency(totalVentas)}
                </div>
                <div className="text-sm text-blue-600">Pendiente de cobro</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GestionOrdenesPage;