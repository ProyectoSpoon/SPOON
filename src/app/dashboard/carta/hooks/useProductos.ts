import { useState, useCallback } from 'react';
import { 
  VersionedProduct, 
  ProductVersion, 
  ProductStock, 
  PriceHistory 
} from '@/app/dashboard/carta/types/product-versioning.types';
import { productosAPI } from '@/services/api.service';

interface UseProductosProps {
  restauranteId: string;
  categoriaId?: string;
}

export function useProductos({ restauranteId, categoriaId }: UseProductosProps) {
  const [productos, setProductos] = useState<VersionedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener productos
  const obtenerProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Cargando productos desde PostgreSQL API...');
      
      const response = await productosAPI.getProductos({
        categoriaId,
        restauranteId
      });
      
      console.log('Productos cargados desde API:', response.data);
      console.log('Total de productos cargados:', response.count);
      
      setProductos(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = 'Error al cargar los productos';
      setError(errorMsg);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId, categoriaId]);

  // Agregar producto
  const agregarProducto = useCallback(async (
    producto: any, 
    imagen?: File
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creando producto en PostgreSQL API:', producto);
      
      let imagenUrl = '';
      if (imagen) {
        // TODO: Implementar subida de imagen real
        imagenUrl = `/imagenes/productos/${Date.now()}.jpg`;
        console.log('Imagen simulada:', imagenUrl);
      }
      
      const response = await productosAPI.createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio || 0,
        categoriaId: producto.categoriaId,
        subcategoriaId: producto.subcategoriaId,
        imagen: imagenUrl,
        stockInicial: producto.stockInicial || 0,
        stockMinimo: producto.stockMinimo || 5,
        stockMaximo: producto.stockMaximo || 100,
        restauranteId
      });
      
      console.log('Producto creado exitosamente:', response.data);
      
      // Actualizar el estado local
      setProductos(prev => [...prev, response.data]);
      return response.data;
  
    } catch (err) {
      setError('Error al crear el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  // Actualizar producto
  const actualizarProducto = useCallback(async (
    id: string, 
    datos: any, 
    imagen?: File
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      let imagenUrl: string | undefined;
      
      // Simulación de actualizar producto con archivos JSON
      console.log('Simulando actualizar producto en archivos JSON:', { id, datos });
      
      if (imagen) {
        // Simulamos la URL de la imagen
        imagenUrl = `/imagenes/productos/${id}.jpg`;
        console.log('Imagen simulada:', imagenUrl);
      }
      
      // En una implementación real, aquí se actualizaría el archivo JSON
      console.log('Producto actualizado (simulación):', { id, ...datos });
  
      // Actualizar estado local
      setProductos(prev =>
        prev.map(prod =>
          prod.id === id
            ? {
                ...prod,
                ...datos,
                ...(imagenUrl && { imagen: imagenUrl }),
                metadata: {
                  ...prod.metadata,
                  lastModified: new Date(),
                  lastModifiedBy: 'current-user'
                }
              }
            : prod
        )
      );
    } catch (err) {
      setError('Error al actualizar el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  // Eliminar producto
  const eliminarProducto = useCallback(async (id: string, imagenUrl?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de eliminar producto con archivos JSON
      console.log('Simulando eliminar producto en archivos JSON:', id);
      
      // En una implementación real, aquí se actualizaría el archivo JSON
      console.log('Producto eliminado (simulación):', id);
  
      // Actualizar estado local
      setProductos(prev => prev.filter(prod => prod.id !== id));
  
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); 

  return {
    productos,
    loading,
    error,
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
  };
}
