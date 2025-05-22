import { useState, useEffect } from 'react';
import { cacheUtils } from '@/utils/cache.utils';
import type { Plato, Producto, Categoria } from '../types/ventasdia.types';

export const useVentasDia = () => {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [productosAdicionales, setProductosAdicionales] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductosDesdeCache = () => {
      try {
        const productosCache = cacheUtils.get();
        
        if (!productosCache || !Array.isArray(productosCache)) {
          setPlatos([]);
          setError('No hay productos disponibles. Por favor, genera el menú del día.');
          return;
        }

        // Crear lista de categorías únicas
        const categoriasUnicas = new Map<string, Categoria>();
        productosCache.forEach(producto => {
          if (producto.categoriaId && !categoriasUnicas.has(producto.categoriaId)) {
            categoriasUnicas.set(producto.categoriaId, {
              id: producto.categoriaId,
              nombre: getCategoryName(producto.categoriaId)
            });
          }
        });
        setCategorias(Array.from(categoriasUnicas.values()));

        // Convertir productos a formato plato
        const productos: Plato[] = productosCache.map(producto => {
          const cantidadProducto = typeof producto.cantidad === 'number' ? producto.cantidad : 20;
          return {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            disponibles: cantidadProducto,
            estado: cantidadProducto === 0 ? 'agotado' : 'disponible',
            categoriaId: producto.categoriaId || ''
          };
        });

        // Convertir productos a formato adicional para la lista de productos adicionales
        const adicionales: Producto[] = productosCache
          .filter(p => ['bebida', 'acompanamiento'].includes(p.categoriaId))
          .map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            categoriaId: producto.categoriaId || '',
            disponible: producto.cantidad > 0
          }));

        // Separar productos principales
        const principales = productos.filter(p => 
          ['entrada', 'principio', 'proteina'].includes(p.categoriaId)
        );
        
        setPlatos(principales);
        setProductosAdicionales(adicionales);
        setError(null);

      } catch (err) {
        console.error('Error al cargar productos:', err);
        setPlatos([]);
        setError('Error al cargar el menú. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };

    cargarProductosDesdeCache();
    const interval = setInterval(cargarProductosDesdeCache, 5000);
    return () => clearInterval(interval);
  }, []);

  // Función auxiliar para obtener un nombre amigable para las categorías
  const getCategoryName = (categoryId: string): string => {
    const categoryNames: Record<string, string> = {
      'entrada': 'Entradas',
      'principio': 'Principios',
      'proteina': 'Proteínas',
      'bebida': 'Bebidas',
      'acompanamiento': 'Acompañamientos',
      'postre': 'Postres'
    };
    
    return categoryNames[categoryId] || categoryId;
  };

  const registrarVenta = async (
    platoId: string, 
    cantidad: number = 1, 
    adicionales: Array<{ productoId: string, cantidad: number }> = []
  ) => {
    try {
      // Actualizar estado local
      setPlatos(platosActuales => 
        platosActuales.map(plato => {
          if (plato.id === platoId) {
            const nuevaCantidad = Math.max(0, plato.disponibles - cantidad);
            return {
              ...plato,
              disponibles: nuevaCantidad,
              estado: nuevaCantidad <= 0 ? 'agotado' : 'disponible'
            };
          }
          return plato;
        })
      );

      // Actualizar producto en el caché
      const productosActuales = cacheUtils.get();
      if (Array.isArray(productosActuales)) {
        const productosActualizados = productosActuales.map(producto => {
          if (producto.id === platoId) {
            const nuevaCantidad = Math.max(0, (producto.cantidad || 0) - cantidad);
            return {
              ...producto,
              cantidad: nuevaCantidad
            };
          }
          // Actualizar cantidades de adicionales
          if (adicionales.some(a => a.productoId === producto.id)) {
            const adicional = adicionales.find(a => a.productoId === producto.id);
            const nuevaCantidad = Math.max(0, (producto.cantidad || 0) - (adicional?.cantidad || 0));
            return {
              ...producto,
              cantidad: nuevaCantidad
            };
          }
          return producto;
        });

        cacheUtils.set(productosActualizados);
      }

      return true;
    } catch (err) {
      console.error('Error al registrar venta:', err);
      return false;
    }
  };

  return {
    platos,
    productosAdicionales,
    loading,
    error,
    registrarVenta,
    categorias
  };
};
