import { useState, useEffect } from 'react';
import type { PeriodoTiempo } from '../types/estadisticas.types';

export const useRendimientoMenu = (periodo: PeriodoTiempo) => {
  const [datos, setDatos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carga de datos de rendimiento del menú
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando rendimiento del menú (simulación):', periodo);
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo
      const datosEjemplo = {
        platosMasVendidos: [
          {
            id: 'plato_1',
            nombre: 'Hamburguesa Clásica',
            categoria: 'Hamburguesas',
            cantidadVendida: 156,
            ingresos: 2340000,
            margen: 65,
            tendencia: 'up'
          },
          {
            id: 'plato_2',
            nombre: 'Pizza Margherita',
            categoria: 'Pizzas',
            cantidadVendida: 134,
            ingresos: 2010000,
            margen: 70,
            tendencia: 'up'
          },
          {
            id: 'plato_3',
            nombre: 'Ensalada César',
            categoria: 'Ensaladas',
            cantidadVendida: 89,
            ingresos: 1068000,
            margen: 75,
            tendencia: 'down'
          },
          {
            id: 'plato_4',
            nombre: 'Pasta Carbonara',
            categoria: 'Pastas',
            cantidadVendida: 78,
            ingresos: 1170000,
            margen: 68,
            tendencia: 'stable'
          },
          {
            id: 'plato_5',
            nombre: 'Pollo a la Plancha',
            categoria: 'Carnes',
            cantidadVendida: 67,
            ingresos: 1340000,
            margen: 60,
            tendencia: 'up'
          }
        ],
        categorias: [
          {
            nombre: 'Hamburguesas',
            ventasTotal: 3500000,
            cantidadPlatos: 8,
            margenPromedio: 65,
            crecimiento: 12.5
          },
          {
            nombre: 'Pizzas',
            ventasTotal: 3200000,
            cantidadPlatos: 6,
            margenPromedio: 70,
            crecimiento: 8.3
          },
          {
            nombre: 'Ensaladas',
            ventasTotal: 1800000,
            cantidadPlatos: 5,
            margenPromedio: 75,
            crecimiento: -2.1
          },
          {
            nombre: 'Pastas',
            ventasTotal: 2100000,
            cantidadPlatos: 7,
            margenPromedio: 68,
            crecimiento: 5.7
          }
        ],
        resumen: {
          totalPlatos: 26,
          platosActivos: 24,
          margenPromedio: 67,
          ingresoTotal: 10600000,
          platoMasRentable: 'Ensalada César',
          categoriaLider: 'Hamburguesas'
        }
      };
      
      setDatos(datosEjemplo);
      console.log('Rendimiento del menú cargado (simulación):', datosEjemplo);
      
    } catch (error) {
      console.error('Error al cargar rendimiento del menú:', error);
      setError('Error al cargar los datos del menú');
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
