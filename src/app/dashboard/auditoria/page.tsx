'use client';

import React, { useState, useEffect } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';

// Tipos TypeScript
type AccionTipo = 'order_created' | 'order_status_changed' | 'order_cancelled' | 'order_completed' | 'product_added' | 'product_updated' | 'user_login';
type PeriodoTipo = 'hoy' | 'ayer' | 'semana' | 'mes';
type EntidadTipo = 'order' | 'product' | 'user' | 'category' | 'menu';

interface AuditLog {
  id: string;
  action: AccionTipo;
  entity_type: EntidadTipo;
  entity_id?: string;
  details: Record<string, any>;
  user_name: string;
  user_email: string;
  restaurant_name: string;
  ip_address: string;
  created_at: string;
}

interface KPI {
  titulo: string;
  valor: string;
  subtitulo: string;
}

interface ActividadHoraria {
  hora: string;
  acciones: number;
}

const AuditoriaPage = () => {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Auditoría', 'Registro de actividades del sistema');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoTipo>('hoy');
  const [accionFiltro, setAccionFiltro] = useState<AccionTipo | 'todas'>('todas');
  const [loading, setLoading] = useState(true);

  // KPIs de auditoría
  const kpisAuditoria: KPI[] = [
    {
      titulo: "Total Logs",
      valor: "1,247",
      subtitulo: "registros hoy"
    },
    {
      titulo: "Órdenes Creadas",
      valor: "127",
      subtitulo: "nuevas órdenes"
    },
    {
      titulo: "Cambios Estado",
      valor: "89",
      subtitulo: "modificaciones"
    },
    {
      titulo: "Usuarios Activos",
      valor: "24",
      subtitulo: "únicos"
    },
    {
      titulo: "Productos Editados",
      valor: "15",
      subtitulo: "actualizaciones"
    },
    {
      titulo: "Hora Pico",
      valor: "14:30",
      subtitulo: "mayor actividad"
    },
    {
      titulo: "IP Únicas",
      valor: "18",
      subtitulo: "direcciones"
    },
    {
      titulo: "Alertas",
      valor: "3",
      subtitulo: "requieren atención"
    }
  ];

  // Datos simulados de logs
  const logsSimulados: AuditLog[] = [
    {
      id: '1',
      action: 'order_created',
      entity_type: 'order',
      entity_id: 'ORD-001',
      details: { table: 5, total: 45000, items: 3 },
      user_name: 'Carlos Ruiz',
      user_email: 'carlos@spoon.com',
      restaurant_name: 'Spoon Restaurant',
      ip_address: '192.168.1.105',
      created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2', 
      action: 'order_status_changed',
      entity_type: 'order',
      entity_id: 'ORD-002',
      details: { from: 'pending', to: 'preparing' },
      user_name: 'Ana García',
      user_email: 'ana@spoon.com',
      restaurant_name: 'Spoon Restaurant',
      ip_address: '192.168.1.102',
      created_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '3',
      action: 'product_updated',
      entity_type: 'product',
      entity_id: 'PROD-123',
      details: { field: 'price', old_value: 25000, new_value: 28000 },
      user_name: 'Miguel Torres',
      user_email: 'miguel@spoon.com',
      restaurant_name: 'Spoon Restaurant',
      ip_address: '192.168.1.108',
      created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '4',
      action: 'user_login',
      entity_type: 'user',
      entity_id: 'USER-456',
      details: { device: 'mobile', browser: 'chrome' },
      user_name: 'Laura Pérez',
      user_email: 'laura@spoon.com',
      restaurant_name: 'Spoon Restaurant',
      ip_address: '192.168.1.110',
      created_at: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: '5',
      action: 'order_completed',
      entity_type: 'order',
      entity_id: 'ORD-003',
      details: { duration: 1800, satisfaction: 'high' },
      user_name: 'Carlos Ruiz',
      user_email: 'carlos@spoon.com',
      restaurant_name: 'Spoon Restaurant',
      ip_address: '192.168.1.105',
      created_at: new Date(Date.now() - 1500000).toISOString()
    }
  ];

  // Actividad por hora (simulada)
  const actividadHoraria: ActividadHoraria[] = [
    { hora: '8:00', acciones: 12 },
    { hora: '9:00', acciones: 28 },
    { hora: '10:00', acciones: 35 },
    { hora: '11:00', acciones: 52 },
    { hora: '12:00', acciones: 78 },
    { hora: '13:00', acciones: 95 },
    { hora: '14:00', acciones: 88 },
    { hora: '15:00', acciones: 65 },
    { hora: '16:00', acciones: 45 },
    { hora: '17:00', acciones: 38 },
    { hora: '18:00', acciones: 62 },
    { hora: '19:00', acciones: 85 }
  ];

  // Distribución de acciones
  const distribucionAcciones = [
    { name: "Órdenes", value: 45, color: "#3b82f6" },
    { name: "Productos", value: 25, color: "#22c55e" },
    { name: "Usuarios", value: 15, color: "#f59e0b" },
    { name: "Sistema", value: 10, color: "#ef4444" },
    { name: "Otros", value: 5, color: "#6b7280" }
  ];

  const getAccionColor = (action: AccionTipo): string => {
    const colors = {
      order_created: '#22c55e',
      order_status_changed: '#3b82f6',
      order_cancelled: '#ef4444',
      order_completed: '#8b5cf6',
      product_added: '#06b6d4',
      product_updated: '#f59e0b',
      user_login: '#6366f1'
    };
    return colors[action] || '#6b7280';
  };

  const getAccionTexto = (action: AccionTipo): string => {
    const textos = {
      order_created: 'Orden Creada',
      order_status_changed: 'Estado Cambiado',
      order_cancelled: 'Orden Cancelada',
      order_completed: 'Orden Completada',
      product_added: 'Producto Agregado',
      product_updated: 'Producto Actualizado',
      user_login: 'Inicio Sesión'
    };
    return textos[action] || action;
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar logs según filtros activos
  const logsFiltrados = logs.filter(log => {
    if (accionFiltro !== 'todas' && log.action !== accionFiltro) return false;
    return true;
  });

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setLogs(logsSimulados);
      setLoading(false);
    }, 1000);
  }, [periodoSeleccionado]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando logs de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpisAuditoria.map((kpi, index) => (
          <div key={index} className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">
              {kpi.titulo}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {kpi.valor}
            </div>
            {kpi.subtitulo && (
              <div className="text-xs text-gray-400">
                {kpi.subtitulo}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filtros simples */}
      <div className="flex gap-2 mb-4">
        {(['hoy', 'ayer', 'semana', 'mes'] as PeriodoTipo[]).map((periodo) => (
          <button
            key={periodo}
            onClick={() => setPeriodoSeleccionado(periodo)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              periodoSeleccionado === periodo
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </button>
        ))}
        
        <div className="ml-4 flex gap-2">
          <select
            value={accionFiltro}
            onChange={(e) => setAccionFiltro(e.target.value as AccionTipo | 'todas')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
          >
            <option value="todas">Todas las acciones</option>
            <option value="order_created">Órdenes creadas</option>
            <option value="order_status_changed">Cambios de estado</option>
            <option value="product_updated">Productos actualizados</option>
            <option value="user_login">Inicios de sesión</option>
          </select>
        </div>
      </div>

      {/* Línea divisoria principal */}
      <div className="mb-4">
        <hr className="border-gray-200" />
      </div>

      <div className="grid grid-cols-12 gap-3">

        {/* Actividad por Hora */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Actividad por hora</h3>
            
            <div className="relative h-32">
              <svg width="100%" height="100%" viewBox="0 0 500 120">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i} 
                    x1="50" 
                    y1={15 + i * 20} 
                    x2="450" 
                    y2={15 + i * 20} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Línea de actividad */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={actividadHoraria.map((item, i) => 
                    `${60 + i * 30},${100 - (item.acciones * 0.8)}`
                  ).join(' ')}
                />
                
                {/* Puntos */}
                {actividadHoraria.map((item, i) => (
                  <circle 
                    key={i} 
                    cx={60 + i * 30} 
                    cy={100 - (item.acciones * 0.8)} 
                    r="3" 
                    fill="#3b82f6"
                  />
                ))}
                
                {/* Labels */}
                {actividadHoraria.map((item, i) => (
                  <text 
                    key={i} 
                    x={60 + i * 30} 
                    y="115" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-500"
                  >
                    {item.hora}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Distribución de Acciones */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Distribución de acciones</h3>
            
            <div className="space-y-2">
              {distribucionAcciones.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600 text-right">{item.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.value * 2}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs text-gray-500">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Lista de Logs de Auditoría */}
        <div className="col-span-12">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Registro de actividad ({logsFiltrados.length} logs)</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logsFiltrados.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No hay logs disponibles</div>
                  <div className="text-xs mt-1">Ajusta los filtros para ver más resultados</div>
                </div>
              ) : (
                logsFiltrados.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div 
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getAccionColor(log.action) }}
                    ></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {getAccionTexto(log.action)}
                          </span>
                          <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">
                            {log.entity_type}
                          </span>
                          {log.entity_id && (
                            <span className="text-xs text-gray-500">
                              #{log.entity_id}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatearFecha(log.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{log.user_name}</span>
                        <span className="mx-2">•</span>
                        <span>{log.ip_address}</span>
                      </div>
                      
                      {Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {JSON.stringify(log.details, null, 0).slice(0, 100)}
                          {JSON.stringify(log.details).length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Resumen de Seguridad */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h3 className="font-bold text-blue-800">Estado de Seguridad</h3>
            <p className="text-sm text-blue-700">
              <strong>Sistema seguro</strong>: No se detectaron actividades sospechosas. 
              Última verificación: {new Date().toLocaleTimeString()}. 
              <strong>Recomendación</strong>: Revisar logs de acceso cada 24 horas.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuditoriaPage;
