'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Trash2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de notificaciones
type TipoNotificacion = 'alerta' | 'recomendacion' | 'info';
type EstadoNotificacion = 'leida' | 'no_leida';

interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  tiempo: string;
  estado: EstadoNotificacion;
}

// Datos de ejemplo - Esto vendría de Firebase
const notificacionesIniciales: Notificacion[] = [
  {
    id: '1',
    tipo: 'alerta',
    mensaje: 'Las ventas de la hamburguesa clásica han disminuido un 30% este mes.',
    tiempo: 'Hace 2 horas',
    estado: 'no_leida'
  },
  {
    id: '2',
    tipo: 'recomendacion',
    mensaje: 'La pizza margherita tiene un alto potencial de ventas. Considera destacarla en el menú.',
    tiempo: 'Hace 5 horas',
    estado: 'no_leida'
  },
  {
    id: '3',
    tipo: 'info',
    mensaje: 'El menú de postres no se ha actualizado en los últimos 30 días.',
    tiempo: 'Hace 1 día',
    estado: 'leida'
  },
  {
    id: '4',
    tipo: 'alerta',
    mensaje: '3 platos no han tenido ventas en la última semana.',
    tiempo: 'Hace 2 días',
    estado: 'leida'
  },
  {
    id: '5',
    tipo: 'recomendacion',
    mensaje: 'Los platos vegetarianos están mostrando una tendencia al alza.',
    tiempo: 'Hace 3 días',
    estado: 'no_leida'
  }
];

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(notificacionesIniciales);
  const [filtroActual, setFiltroActual] = useState<'todas' | 'no_leidas' | 'importantes'>('todas');

  const getIconoNotificacion = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'alerta':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'recomendacion':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorFondo = (tipo: TipoNotificacion, estado: EstadoNotificacion) => {
    if (estado === 'leida') return 'bg-gray-50';
    
    switch (tipo) {
      case 'alerta':
        return 'bg-red-50';
      case 'recomendacion':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
    }
  };

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => prev.map(notif => 
      notif.id === id ? { ...notif, estado: 'leida' } : notif
    ));
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificacionesFiltradas = () => {
    switch (filtroActual) {
      case 'no_leidas':
        return notificaciones.filter(n => n.estado === 'no_leida');
      case 'importantes':
        return notificaciones.filter(n => n.tipo === 'alerta');
      default:
        return notificaciones;
    }
  };

  const contadorNoLeidas = notificaciones.filter(n => n.estado === 'no_leida').length;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[#F4821F]" />
          <h1 className="text-2xl font-bold text-neutral-800">Notificaciones</h1>
          {contadorNoLeidas > 0 && (
            <span className="px-2 py-1 text-sm font-medium bg-[#F4821F] text-white rounded-full">
              {contadorNoLeidas}
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        {(['todas', 'no_leidas', 'importantes'] as const).map((filtro) => (
          <button
            key={filtro}
            onClick={() => setFiltroActual(filtro)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${filtroActual === filtro
                ? 'bg-[#F4821F] text-white'
                : 'bg-white text-neutral-600 hover:bg-[#FFF9F2]'}
            `}
          >
            {filtro.charAt(0).toUpperCase() + filtro.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        <AnimatePresence>
          {getNotificacionesFiltradas().map((notificacion) => (
            <motion.div
              key={notificacion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`
                p-4 transition-all duration-200
                ${getColorFondo(notificacion.tipo, notificacion.estado)}
                ${notificacion.estado === 'leida' ? 'opacity-70' : ''}
              `}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getIconoNotificacion(notificacion.tipo)}
                    <div>
                      <p className="text-neutral-800">{notificacion.mensaje}</p>
                      <p className="text-sm text-neutral-500 mt-1">{notificacion.tiempo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notificacion.estado === 'no_leida' && (
                      <button
                        onClick={() => marcarComoLeida(notificacion.id)}
                        className="p-1 hover:bg-white rounded-full transition-colors"
                        title="Marcar como leída"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => eliminarNotificacion(notificacion.id)}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="h-5 w-5 text-neutral-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {getNotificacionesFiltradas().length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No hay notificaciones para mostrar
          </div>
        )}
      </div>
    </div>
  );
}