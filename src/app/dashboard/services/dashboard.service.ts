// src/app/dashboard/services/dashboard.service.ts
import { DashboardMetrics, EstadoMenu, PlatoTop, NotificacionDashboard, VentaDiaria } from '../types/dashboard.types';

export class DashboardService {
  static async getMetricas(): Promise<DashboardMetrics> {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ventasHoy: 125750,
      platosVendidos: 89,
      ticketPromedio: 14125,
      comparacionAyer: 8.5,
      tendencia: 'up'
    };
  }

  static async getEstadoMenu(): Promise<EstadoMenu> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      menuPublicado: true,
      combinacionesActivas: 12,
      productosAgotados: 2,
      programacionCompleta: 85,
      ultimaActualizacion: new Date()
    };
  }

  static async getPlatosTop(): Promise<PlatoTop[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      { id: '1', nombre: 'Bandeja Paisa', ventas: 15, porcentaje: 18 },
      { id: '2', nombre: 'Sancocho', ventas: 12, porcentaje: 14 },
      { id: '3', nombre: 'Ajiaco', ventas: 10, porcentaje: 12 },
      { id: '4', nombre: 'Cazuela de Mariscos', ventas: 8, porcentaje: 10 },
      { id: '5', nombre: 'Lechona', ventas: 6, porcentaje: 7 }
    ];
  }

  static async getNotificaciones(): Promise<NotificacionDashboard[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: '1',
        tipo: 'warning',
        mensaje: 'Pollo agotado - actualizar menú',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        leida: false
      },
      {
        id: '2',
        tipo: 'success',
        mensaje: 'Meta de ventas del día alcanzada!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        leida: false
      },
      {
        id: '3',
        tipo: 'info',
        mensaje: 'Nuevo cliente registrado',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        leida: true
      }
    ];
  }

  static async getVentasUltimos7Dias(): Promise<VentaDiaria[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const fechas = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (6 - i));
      return fecha.toISOString().split('T')[0];
    });

    return fechas.map(fecha => ({
      fecha,
      ventas: Math.floor(Math.random() * 200000) + 80000
    }));
  }
}
