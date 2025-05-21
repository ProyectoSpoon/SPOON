import { db } from "@/firebase/config";
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  DocumentReference,
  orderBy,
  limit,
  startAfter,
  FieldPath
} from "firebase/firestore";
import { ItemCarrito } from "@/app/dashboard/registro-ventas/hooks/useMenuVentas";

/**
 * Tipo que define la estructura de una venta registrada
 */
export interface Venta {
  id?: string;
  restauranteId: string;
  fecha: Date;
  productos: {
    id: string;
    nombre: string;
    categoriaId: string;
    precio: number;
    cantidad: number;
    esCombo?: boolean;
  }[];
  total: number;
  metodoPago?: string;
  usuario?: string;
  notas?: string;
  createdAt?: Date;
}

/**
 * Servicio para el registro y consulta de ventas
 */
export const ventasService = {
  /**
   * Registra una nueva venta en la base de datos
   * @param venta Datos de la venta a registrar
   */
  async registrarVenta(venta: Venta): Promise<string> {
    try {
      const ventasRef = collection(db, 'ventas');
      
      const docRef = await addDoc(ventasRef, {
        ...venta,
        createdAt: serverTimestamp(),
        fecha: Timestamp.fromDate(venta.fecha || new Date())
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error al registrar venta:', error);
      throw error;
    }
  },

  /**
   * Registra una venta desde el carrito de compras
   * @param restauranteId ID del restaurante
   * @param carrito Items en el carrito
   * @param metodoPago Método de pago utilizado (opcional)
   * @param usuario Usuario que registra la venta (opcional)
   * @param notas Notas adicionales (opcional)
   */
  async registrarVentaDesdeCarrito(
    restauranteId: string,
    carrito: ItemCarrito[],
    metodoPago?: string,
    usuario?: string,
    notas?: string
  ): Promise<string> {
    try {
      // Calcular el total
      const total = carrito.reduce((sum, item) => 
        sum + (item.producto.precio * item.cantidad), 0);
      
      // Convertir carrito a formato de productos
      const productos = carrito.map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        categoriaId: item.producto.categoriaId,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        esCombo: item.producto.esCombo || false
      }));
      
      // Crear objeto de venta
      const venta: Venta = {
        restauranteId,
        fecha: new Date(),
        productos,
        total,
        metodoPago,
        usuario,
        notas
      };
      
      // Registrar la venta
      return await this.registrarVenta(venta);
    } catch (error) {
      console.error('Error al registrar venta desde carrito:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de ventas para un restaurante
   * @param restauranteId ID del restaurante
   * @param fechaInicio Fecha de inicio del periodo (opcional)
   * @param fechaFin Fecha de fin del periodo (opcional)
   * @param limite Número máximo de resultados a devolver (opcional)
   */
  async getVentas(
    restauranteId: string,
    fechaInicio?: Date,
    fechaFin?: Date,
    limite?: number
  ): Promise<Venta[]> {
    try {
      const ventasRef = collection(db, 'ventas');
      let q = query(
        ventasRef,
        where('restauranteId', '==', restauranteId),
        orderBy('fecha', 'desc')
      );
      
      if (fechaInicio) {
        q = query(q, where('fecha', '>=', Timestamp.fromDate(fechaInicio)));
      }
      
      if (fechaFin) {
        q = query(q, where('fecha', '<=', Timestamp.fromDate(fechaFin)));
      }
      
      if (limite) {
        q = query(q, limit(limite));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          restauranteId: data.restauranteId,
          fecha: data.fecha?.toDate() || new Date(),
          productos: data.productos || [],
          total: data.total || 0,
          metodoPago: data.metodoPago,
          usuario: data.usuario,
          notas: data.notas,
          createdAt: data.createdAt?.toDate()
        };
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de ventas para un periodo
   * @param restauranteId ID del restaurante
   * @param fechaInicio Fecha de inicio del periodo
   * @param fechaFin Fecha de fin del periodo
   */
  async getEstadisticas(
    restauranteId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{
    totalVentas: number;
    cantidadVentas: number;
    productosMasVendidos: { 
      id: string; 
      nombre: string; 
      cantidad: number; 
      total: number;
    }[];
    ventasPorCategoria: {
      categoriaId: string;
      total: number;
      cantidad: number;
    }[];
    promedioPorVenta: number;
    ventasPorDia: {
      fecha: Date;
      total: number;
      cantidad: number;
    }[];
  }> {
    try {
      const ventas = await this.getVentas(restauranteId, fechaInicio, fechaFin);
      
      // Total y cantidad de ventas
      const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
      const cantidadVentas = ventas.length;
      
      // Productos más vendidos
      const productosMap = new Map<string, { 
        id: string; 
        nombre: string; 
        cantidad: number; 
        total: number;
      }>();
      
      // Ventas por categoría
      const categoriaMap = new Map<string, {
        categoriaId: string;
        total: number;
        cantidad: number;
      }>();
      
      // Ventas por día
      const ventasPorDiaMap = new Map<string, {
        fecha: Date;
        total: number;
        cantidad: number;
      }>();
      
      // Procesar todas las ventas
      ventas.forEach(venta => {
        // Procesar productos
        venta.productos.forEach(producto => {
          // Actualizar productos
          const productoActual = productosMap.get(producto.id) || { 
            id: producto.id, 
            nombre: producto.nombre, 
            cantidad: 0, 
            total: 0 
          };
          
          productosMap.set(producto.id, {
            ...productoActual,
            cantidad: productoActual.cantidad + producto.cantidad,
            total: productoActual.total + (producto.precio * producto.cantidad)
          });
          
          // Actualizar categorías
          const categoriaActual = categoriaMap.get(producto.categoriaId) || {
            categoriaId: producto.categoriaId,
            total: 0,
            cantidad: 0
          };
          
          categoriaMap.set(producto.categoriaId, {
            ...categoriaActual,
            total: categoriaActual.total + (producto.precio * producto.cantidad),
            cantidad: categoriaActual.cantidad + producto.cantidad
          });
        });
        
        // Procesar ventas por día
        const fechaStr = venta.fecha.toISOString().split('T')[0];
        const diaActual = ventasPorDiaMap.get(fechaStr) || {
          fecha: new Date(venta.fecha),
          total: 0,
          cantidad: 0
        };
        
        ventasPorDiaMap.set(fechaStr, {
          ...diaActual,
          total: diaActual.total + venta.total,
          cantidad: diaActual.cantidad + 1
        });
      });
      
      // Convertir a arrays y ordenar
      const productosMasVendidos = Array.from(productosMap.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);
      
      const ventasPorCategoria = Array.from(categoriaMap.values());
      
      const ventasPorDia = Array.from(ventasPorDiaMap.values())
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      
      // Calcular promedio
      const promedioPorVenta = cantidadVentas > 0 
        ? totalVentas / cantidadVentas 
        : 0;
      
      return {
        totalVentas,
        cantidadVentas,
        productosMasVendidos,
        ventasPorCategoria,
        promedioPorVenta,
        ventasPorDia
      };
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
};
