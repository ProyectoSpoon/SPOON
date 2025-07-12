'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  User,
  Activity,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  user_name: string;
  user_email: string;
  restaurant_name: string;
  ip_address: string;
  created_at: string;
}

const actionIcons = {
  order_created: CheckCircle,
  order_status_changed: Activity,
  order_cancelled: AlertCircle,
  order_completed: CheckCircle,
  product_added: Info,
  product_updated: Settings,
  user_login: User,
  default: Activity
};

const actionColors = {
  order_created: 'bg-green-100 text-green-800',
  order_status_changed: 'bg-blue-100 text-blue-800',
  order_cancelled: 'bg-red-100 text-red-800',
  order_completed: 'bg-purple-100 text-purple-800',
  product_added: 'bg-cyan-100 text-cyan-800',
  product_updated: 'bg-yellow-100 text-yellow-800',
  user_login: 'bg-indigo-100 text-indigo-800',
  default: 'bg-gray-100 text-gray-800'
};

const actionLabels = {
  order_created: 'Orden Creada',
  order_status_changed: 'Estado Cambiado',
  order_cancelled: 'Orden Cancelada',
  order_completed: 'Orden Completada',
  product_added: 'Producto Agregado',
  product_updated: 'Producto Actualizado',
  user_login: 'Inicio de Sesión',
  default: 'Acción'
};

const AuditoriaPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    userId: ''
  });

  // Cargar logs de auditoría
  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.userId) params.append('user_id', filters.userId);
      
      params.append('limit', '100');

      const response = await fetch(`/api/audit?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error al cargar logs de auditoría:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar logs
  const refreshLogs = async () => {
    setRefreshing(true);
    await loadAuditLogs();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: '',
      userId: ''
    });
  };

  // Exportar logs (funcionalidad básica)
  const exportLogs = () => {
    const csvContent = [
      'Fecha,Usuario,Acción,Entidad,Detalles,IP',
      ...logs.map(log => 
        `"${new Date(log.created_at).toLocaleString()}","${log.user_name}","${log.action}","${log.entity_type}","${JSON.stringify(log.details).replace(/"/g, '""')}","${log.ip_address}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando logs de auditoría...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Auditoría del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Registro completo de actividades y cambios en el sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={refreshLogs}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las acciones</option>
              <option value="order_created">Orden Creada</option>
              <option value="order_status_changed">Estado Cambiado</option>
              <option value="order_cancelled">Orden Cancelada</option>
              <option value="order_completed">Orden Completada</option>
              <option value="product_added">Producto Agregado</option>
              <option value="user_login">Inicio de Sesión</option>
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total de Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Órdenes Creadas</p>
              <p className="text-2xl font-bold">
                {logs.filter(log => log.action === 'order_created').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Cambios de Estado</p>
              <p className="text-2xl font-bold">
                {logs.filter(log => log.action === 'order_status_changed').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Usuarios Únicos</p>
              <p className="text-2xl font-bold">
                {new Set(logs.map(log => log.user_email)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de logs */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No hay logs de auditoría
            </h3>
            <p className="text-gray-500">
              Los logs aparecerán aquí cuando se realicen acciones en el sistema
            </p>
          </Card>
        ) : (
          logs.map((log) => {
            const IconComponent = actionIcons[log.action] || actionIcons.default;
            const colorClass = actionColors[log.action] || actionColors.default;
            const actionLabel = actionLabels[log.action] || log.action;

            return (
              <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {actionLabel}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {log.entity_type}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{log.user_name} ({log.user_email})</span>
                      </div>
                      
                      {log.entity_id && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="h-3 w-3" />
                          <span>ID: {log.entity_id}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info className="h-3 w-3" />
                        <span>IP: {log.ip_address}</span>
                      </div>
                    </div>
                    
                    {Object.keys(log.details).length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium text-gray-700 mb-1">Detalles:</p>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuditoriaPage;
