import { useState, useEffect } from 'react';
import type { PeriodoTiempo } from '../types/estadisticas.types';

export const useAnalisisVentas = (periodo: PeriodoTiempo) => {
  const [datos, setDatos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carga de datos de análisis de ventas
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando análisis de ventas (simulación):', periodo);
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo según el período
      const datosEjemplo = {
        hoy: {
          ventasTotal: 850000,
          ordenes: 45,
          ticketPromedio: 18888,
          crecimiento: 12.5,
          grafico: [
            { hora: '09:00', ventas: 50000 },
            { hora: '12:00', ventas: 120000 },
            { hora: '15:00', ventas: 80000 },
            { hora: '18:00', ventas: 200000 },
            { hora: '21:00', ventas: 400000 }
          ]
        },
        semana: {
          ventasTotal: 5250000,
          ordenes: 280,
          ticketPromedio: 18750,
          crecimiento: 8.3,
          grafico: [
            { dia: 'Lun', ventas: 650000 },
            { dia: 'Mar', ventas: 720000 },
            { dia: 'Mie', ventas: 680000 },
            { dia: 'Jue', ventas: 850000 },
            { dia: 'Vie', ventas: 950000 },
            { dia: 'Sab', ventas: 1200000 },
            { dia: 'Dom', ventas: 1200000 }
          ]
        },
        mes: {
          ventasTotal: 22500000,
          ordenes: 1200,
          ticketPromedio: 18750,
          crecimiento: 15.2,
          grafico: [
            { semana: 'Sem 1', ventas: 5000000 },
            { semana: 'Sem 2', ventas: 5500000 },
            { semana: 'Sem 3', ventas: 6000000 },
            { semana: 'Sem 4', ventas: 6000000 }
          ]
        },
        año: {
          ventasTotal: 270000000,
          ordenes: 14400,
          ticketPromedio: 18750,
          crecimiento: 22.1,
          grafico: [
            { mes: 'Ene', ventas: 20000000 },
            { mes: 'Feb', ventas: 21000000 },
            { mes: 'Mar', ventas: 22000000 },
            { mes: 'Abr', ventas: 23000000 },
            { mes: 'May', ventas: 24000000 },
            { mes: 'Jun', ventas: 25000000 },
            { mes: 'Jul', ventas: 23000000 },
            { mes: 'Ago', ventas: 22000000 },
            { mes: 'Sep', ventas: 21000000 },
            { mes: 'Oct', ventas: 22000000 },
            { mes: 'Nov', ventas: 23000000 },
            { mes: 'Dic', ventas: 23000000 }
          ]
        }
      };
      
      const datosPeriodo = (datosEjemplo as any)[periodo] || datosEjemplo.hoy;
      setDatos(datosPeriodo);
      console.log('Análisis de ventas cargado (simulación):', datosPeriodo);
      
    } catch (error) {
      console.error('Error al cargar análisis de ventas:', error);
      setError('Error al cargar los datos de análisis');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambie el período
  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  return {
    datos,
    loading,
    error,
    recargar: cargarDatos
  };
};
