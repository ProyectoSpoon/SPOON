import { useState, useEffect } from 'react';
;
import { db } from '@/firebase/config';
import type { PeriodoTiempo } from '../types/estadisticas.types';
import { ventasService } from '@/services/ventas.service';

interface RendimientoMenu {
  plato: string;
  categoria: string;
  cantidadVendida: number;
  ingresos: number;
  costoUnitario: number;
  margenBruto: number;
  ranking: number;
}

interface DatosRendimiento {
  rendimientoPlatos: RendimientoMenu[];
  rendimientoCategorias: {
    categoria: string;
    totalVentas: number;
    totalIngresos: number;
    margenPromedio: number;
  }[];
  mejoresPlatos: RendimientoMenu[];
  peoresPlatos: RendimientoMenu[];
}

export const useRendimientoMenu = (periodo: PeriodoTiempo) => {
  const [datos, setDatos] = useState<DatosRendimiento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarRendimiento = async () => {
      try {
        setCargando(true);
        setError(null);

        // Determinar fechas de inicio y fin según el periodo
        const fechaFin = new Date();
        let fechaInicio = new Date();
        
        switch (periodo) {
          case 'semana':
            fechaInicio.setDate(fechaInicio.getDate() - 7);
            break;
          case 'mes':
            fechaInicio.setMonth(fechaInicio.getMonth() - 1);
            break;
          case 'trimestre':
            fechaInicio.setMonth(fechaInicio.getMonth() - 3);
            break;
          case 'año':
            fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
            break;
          default:
            fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Default a un mes
        }

        // Obtener restauranteId (deberías tenerlo de algún contexto o prop)
        // Por ahora usamos un ID de ejemplo
        const restauranteId = "restaurant-example-id";

        console.log(`Cargando datos de rendimiento: ${periodo}`, { fechaInicio, fechaFin });

        try {
          // Obtener estadísticas de ventas
          const estadisticas = await ventasService.getEstadisticas(
            restauranteId,
            fechaInicio,
            fechaFin
          );

          console.log('Estadísticas obtenidas:', estadisticas);

          // Transformar datos al formato esperado
          const rendimientoPlatos = estadisticas.productosMasVendidos.map((producto, index) => ({
            plato: producto.nombre,
            categoria: "Categoría", // Idealmente obtener de algún lado
            cantidadVendida: producto.cantidad,
            ingresos: producto.total,
            costoUnitario: producto.total / producto.cantidad * 0.6, // Estimado
            margenBruto: 0.4, // Estimado
            ranking: index + 1
          }));

          const rendimientoCategorias = estadisticas.ventasPorCategoria.map(categoria => ({
            categoria: categoria.categoriaId,
            totalVentas: categoria.cantidad,
            totalIngresos: categoria.total,
            margenPromedio: 0.35 // Estimado
          }));

          // Ordenar por margen para obtener mejores y peores
          const platosPorMargen = [...rendimientoPlatos].sort((a, b) => b.margenBruto - a.margenBruto);

          setDatos({
            rendimientoPlatos,
            rendimientoCategorias,
            mejoresPlatos: platosPorMargen.slice(0, 5),
            peoresPlatos: [...platosPorMargen].reverse().slice(0, 5)
          });
        } catch (error) {
          console.error('Error al obtener datos reales, usando datos de ejemplo:', error);
          
          // Si hay error, usamos datos de ejemplo como fallback
          setDatos({
            rendimientoPlatos: [
              {
                plato: "Hamburguesa Clásica",
                categoria: "Hamburguesas",
                cantidadVendida: 150,
                ingresos: 2250000,
                costoUnitario: 8000,
                margenBruto: 0.45,
                ranking: 1
              },
              {
                plato: "Pasta Carbonara",
                categoria: "Pastas",
                cantidadVendida: 120,
                ingresos: 1800000,
                costoUnitario: 7000,
                margenBruto: 0.42,
                ranking: 2
              },
              {
                plato: "Pizza Margarita",
                categoria: "Pizzas",
                cantidadVendida: 180,
                ingresos: 2700000,
                costoUnitario: 9000,
                margenBruto: 0.40,
                ranking: 3
              },
            ],
            rendimientoCategorias: [
              {
                categoria: "Hamburguesas",
                totalVentas: 450,
                totalIngresos: 6750000,
                margenPromedio: 0.42
              },
              {
                categoria: "Pastas",
                totalVentas: 320,
                totalIngresos: 4800000,
                margenPromedio: 0.38
              },
              {
                categoria: "Pizzas",
                totalVentas: 380,
                totalIngresos: 5700000,
                margenPromedio: 0.40
              },
            ],
            mejoresPlatos: [
              {
                plato: "Hamburguesa Clásica",
                categoria: "Hamburguesas",
                cantidadVendida: 150,
                ingresos: 2250000,
                costoUnitario: 8000,
                margenBruto: 0.45,
                ranking: 1
              },
            ],
            peoresPlatos: [
              {
                plato: "Ensalada César",
                categoria: "Ensaladas",
                cantidadVendida: 90,
                ingresos: 1080000,
                costoUnitario: 6000,
                margenBruto: 0.30,
                ranking: 5
              },
            ]
          });
        }
      } catch (error) {
        console.error('Error al cargar rendimiento:', error);
        setError('Error al cargar los datos de rendimiento');
      } finally {
        setCargando(false);
      }
    };

    cargarRendimiento();
  }, [periodo]);

  return { datos, cargando, error };
};
