import { useState, useCallback } from 'react';
import { 
  VersionedProduct, 
  ProductVersion, 
  ProductStock, 
  PriceHistory 
} from '@/app/dashboard/carta/types/product-versioning.types';
import { jsonDataService } from '@/services/json-data.service';

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
      let productosData: VersionedProduct[] = [];
      
      // Usar el servicio JSON para cargar productos
      console.log('Cargando productos desde archivos JSON...');
      try {
        const productosJson = await jsonDataService.getProductos();
        console.log('Productos cargados desde JSON:', productosJson);
        
        // Filtrar por categoría si es necesario
        const productosFiltrados = categoriaId 
          ? productosJson.filter((p: any) => p.categoriaId === categoriaId)
          : productosJson;
        
        productosData = productosFiltrados;
        console.log('Total de productos cargados:', productosData.length);
      } catch (jsonError) {
        console.error('Error al cargar productos desde JSON:', jsonError);
        throw jsonError;
      }
      
      console.log('Productos procesados:', productosData);
      setProductos(productosData);
      return productosData;
    } catch (err) {
      setError('Error al cargar los productos');
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
      // Simulación de agregar producto con archivos JSON
      console.log('Simulando agregar producto en archivos JSON:', producto);
      
      // Generar un ID único para el nuevo producto
      const nuevoId = `PROD_${Date.now()}`;
      let imagenUrl = '';
      
      if (imagen) {
        // Simulamos la URL de la imagen
        imagenUrl = `/imagenes/productos/${nuevoId}.jpg`;
        console.log('Imagen simulada:', imagenUrl);
      }
      
      // Crear el nuevo producto
      const nuevoProducto: VersionedProduct = {
        id: nuevoId,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        currentPrice: producto.precio || 0,
        categoriaId: producto.categoriaId,
        imagen: imagenUrl,
        currentVersion: 1,
        priceHistory: [],
        versions: [],
        status: 'active',
        stock: {
          currentQuantity: 0,
          minQuantity: 0,
          maxQuantity: 100,
          status: 'in_stock',
          lastUpdated: new Date(),
          alerts: {
            lowStock: false,
            overStock: false,
            thresholds: {
              low: 10,
              high: 90
            }
          }
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'current-user',
          lastModified: new Date(),
          lastModifiedBy: 'current-user'
        }
      };
      
      // En una implementación real, aquí se guardaría en el archivo JSON
      console.log('Nuevo producto creado (simulación):', nuevoProducto);
      
      // Actualizar el estado local
      setProductos(prev => [...prev, nuevoProducto]);
      return nuevoProducto;
  
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
