import { useState, useEffect, useCallback } from 'react';
import { cacheUtils } from '@/utils/cache.utils';
import { toast } from 'sonner';
import { combinacionesService } from '@/services/combinaciones.service';
import { ventasService } from '@/services/ventas.service';

// Tipos
export interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: TipoProducto;
  categoriaId: string;
  disponible: boolean;
  cantidad?: number;
  esCombo?: boolean;
  componentes?: ItemMenuSimple[];
  destacado?: boolean;
}

export interface ItemMenuSimple {
  id: string;
  nombre: string;
  categoriaId: string;
}

export interface ItemCarrito {
  producto: ItemMenu;
  cantidad: number;
}

export type TipoProducto = 'combo' | 'entrada' | 'principio' | 'proteina' | 'acompanamiento' | 'bebida' | 'utensilio';

// Precios por defecto para cada tipo de producto
const PRECIOS_POR_DEFECTO: Record<string, number> = {
  'entrada': 8000,
  'principio': 10000,
  'proteina': 15000,
  'acompanamiento': 5000,
  'bebida': 3000,
  'utensilio': 1000,
  'default': 5000
};

export const useMenuVentas = () => {
  const [productos, setProductos] = useState<ItemMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener precio por defecto según categoría
  const getPrecioDefecto = (categoriaId: string): number => {
    return PRECIOS_POR_DEFECTO[categoriaId] || PRECIOS_POR_DEFECTO.default;
  };

  // Función para cargar productos y combinaciones desde el caché
  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar datos del caché
      const datosCache = cacheUtils.get();
      
      if (!datosCache || !Array.isArray(datosCache)) {
        setError('No hay productos disponibles en el menú del día.');
        return [];
      }
      
      // Mapear productos básicos
      const productosBasicos = datosCache.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        // Usar precio del producto si existe, o un precio por defecto según categoría
        precio: producto.precio !== undefined ? producto.precio : getPrecioDefecto(producto.categoriaId),
        categoriaId: producto.categoriaId || '',
        tipo: mapearCategoria(producto.categoriaId),
        disponible: producto.cantidad > 0,
        cantidad: producto.cantidad || 0, // Asegurar que cantidad siempre tenga un valor
        esCombo: false,
        destacado: false
      }));
      
      // Generar combinaciones basadas en el mismo algoritmo que usa el módulo de carta
      const combos = generarCombinaciones(productosBasicos);
      
      const todosProductos = [...productosBasicos, ...combos];
      setProductos(todosProductos);
      
      return todosProductos;
    } catch (err) {
      console.error('Error al cargar productos:', err);
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al cargar el menú';
      setError(mensaje);
      toast.error(mensaje);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Mapear categoría a tipo de producto
  const mapearCategoria = (categoriaId: string = ''): TipoProducto => {
    const mapaCategorias: Record<string, TipoProducto> = {
      'entrada': 'entrada',
      'principio': 'principio',
      'proteina': 'proteina',
      'acompanamiento': 'acompanamiento',
      'bebida': 'bebida',
      'recipiente': 'utensilio'
    };
    
    return mapaCategorias[categoriaId] || 'acompanamiento';
  };

  // Función para generar combinaciones basadas en los productos
  const generarCombinaciones = (productosCache: ItemMenu[]): ItemMenu[] => {
    try {
      // Filtrar productos por categoría
      const entradas = productosCache.filter(p => p.categoriaId === 'entrada');
      const principios = productosCache.filter(p => p.categoriaId === 'principio');
      const proteinas = productosCache.filter(p => p.categoriaId === 'proteina');
      const acompanamientos = productosCache.filter(p => p.categoriaId === 'acompanamiento');
      const bebidas = productosCache.filter(p => p.categoriaId === 'bebida');
      
      // Verificar si hay suficientes productos para formar combos
      if (!entradas.length || !principios.length || !proteinas.length || 
          !acompanamientos.length || !bebidas.length) {
        console.warn('No hay suficientes productos para generar combinaciones');
        return [];
      }
      
      const combos: ItemMenu[] = [];
      let idCombo = 1;
      
      // Generar combinaciones de principio + proteína
      principios.forEach(principio => {
        proteinas.forEach(proteina => {
          // Asegurarse de que los objetos existan
          const entrada = entradas[0];
          if (!entrada || !principio || !proteina) return;
          
          // Verificar disponibilidad
          const entradaDisponible = (entrada.cantidad || 0) > 0;
          const principioDisponible = (principio.cantidad || 0) > 0;
          const proteinaDisponible = (proteina.cantidad || 0) > 0;
          const acompanamientoDisponible = acompanamientos.some(a => (a.cantidad || 0) > 0);
          const bebidaDisponible = bebidas[0] ? (bebidas[0].cantidad || 0) > 0 : false;
          
          // Calcular máxima cantidad disponible
          const cantidadEntrada = entrada.cantidad || 0;
          const cantidadPrincipio = principio.cantidad || 0;
          const cantidadProteina = proteina.cantidad || 0;
          const cantidadBebida = bebidas[0] ? (bebidas[0].cantidad || 0) : 0;
          
          // La cantidad disponible es el mínimo entre todos los componentes
          const cantidadDisponible = Math.min(
            cantidadEntrada,
            cantidadPrincipio,
            cantidadProteina,
            cantidadBebida
          );
          
          // Calcular precio
          const precioTotal = entrada.precio + 
                              principio.precio + 
                              proteina.precio + 
                              (bebidas[0]?.precio || 0);
          
          const estaDisponible = entradaDisponible && 
                                principioDisponible && 
                                proteinaDisponible && 
                                acompanamientoDisponible && 
                                bebidaDisponible;
          
          // Crear el combo
          const combo: ItemMenu = {
            id: `combo-${idCombo++}`,
            nombre: `${principio.nombre} con ${proteina.nombre}`,
            descripcion: `Combo que incluye: ${entrada.nombre}, ${principio.nombre}, ${proteina.nombre} y ${bebidas[0]?.nombre || 'Bebida'}`,
            precio: precioTotal,
            tipo: 'combo',
            categoriaId: 'combo',
            disponible: estaDisponible,
            cantidad: cantidadDisponible,
            esCombo: true,
            destacado: Math.random() > 0.7, // Algunos combos destacados al azar
            componentes: [
              { id: entrada.id, nombre: entrada.nombre, categoriaId: 'entrada' },
              { id: principio.id, nombre: principio.nombre, categoriaId: 'principio' },
              { id: proteina.id, nombre: proteina.nombre, categoriaId: 'proteina' },
              bebidas[0] ? { id: bebidas[0].id, nombre: bebidas[0].nombre, categoriaId: 'bebida' } : 
                          { id: 'bebida-default', nombre: 'Bebida', categoriaId: 'bebida' }
            ]
          };
          
          combos.push(combo);
        });
      });
      
      return combos;
    } catch (err) {
      console.error('Error al generar combinaciones:', err);
      return [];
    }
  };

  // Registrar una venta 
  const registrarVenta = async (carrito: ItemCarrito[]) => {
    try {
      // Restaurante ID de prueba - en producción debería venir de un contexto o prop
      const RESTAURANTE_ID = 'rest-test-001';
      
      // 1. Actualizar caché
      const productosCache = cacheUtils.get();
      
      if (!Array.isArray(productosCache)) {
        throw new Error('No se puede actualizar el inventario');
      }
      
      // Crear un mapa para contar cuántas unidades vender de cada producto
      const cantidadAVender = new Map<string, number>();
      
      // Procesar cada ítem del carrito
      carrito.forEach(item => {
        if (item.producto.esCombo && item.producto.componentes) {
          // Si es combo, procesar cada componente
          item.producto.componentes.forEach(componente => {
            const cantidadActual = cantidadAVender.get(componente.id) || 0;
            cantidadAVender.set(componente.id, cantidadActual + item.cantidad);
          });
        } else {
          // Si es producto individual
          const cantidadActual = cantidadAVender.get(item.producto.id) || 0;
          cantidadAVender.set(item.producto.id, cantidadActual + item.cantidad);
        }
      });
      
      // Actualizar el caché con las nuevas cantidades
      const productosActualizados = productosCache.map(producto => {
        const cantidadVendida = cantidadAVender.get(producto.id) || 0;
        
        if (cantidadVendida > 0) {
          const nuevaCantidad = Math.max(0, (producto.cantidad || 0) - cantidadVendida);
          return {
            ...producto,
            cantidad: nuevaCantidad
          };
        }
        
        return producto;
      });
      
      // Guardar en caché
      cacheUtils.set(productosActualizados);
      
      // 2. Registrar venta en Firebase
      await ventasService.registrarVentaDesdeCarrito(
        RESTAURANTE_ID,
        carrito
      );
      
      // 3. Si hay combos, actualizar estadísticas
      const combos = carrito.filter(item => item.producto.esCombo);
      if (combos.length > 0) {
        for (const combo of combos) {
          if (combo.producto.id.startsWith('combo-')) {
            try {
              await combinacionesService.registrarVentaCombinacion(
                RESTAURANTE_ID,
                combo.producto.id,
                combo.cantidad
              );
            } catch (err) {
              console.error('Error al registrar estadísticas de combo:', err);
              // No bloqueamos el proceso por este error
            }
          }
        }
      }
      
      // 4. Actualizar productos locales
      await cargarProductos();
      
      return true;
    } catch (error) {
      console.error('Error al registrar venta:', error);
      toast.error('Error al registrar la venta');
      return false;
    }
  };

  // Cargar productos al inicializar
  useEffect(() => {
    cargarProductos();
    
    // Actualizar periódicamente
    const intervalo = setInterval(() => {
      cargarProductos();
    }, 30000); // Cada 30 segundos
    
    return () => clearInterval(intervalo);
  }, [cargarProductos]);

  return {
    productos,
    loading,
    error,
    registrarVenta,
    recargar: cargarProductos
  };
};
