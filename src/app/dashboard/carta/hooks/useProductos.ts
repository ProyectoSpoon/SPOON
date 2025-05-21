import { useState, useCallback } from 'react';
import { COLLECTIONS } from '@/firebase/types/collections.types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  orderBy, 
  limit, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';
;
import { db, storage } from '@/firebase/config';
import { 
  VersionedProduct, 
  ProductVersion, 
  ProductStock, 
  PriceHistory 
} from '@/app/dashboard/carta/types/product-versioning.types';
import { jsonDataService } from '@/services/json-data.service';

// Bandera para determinar si usar los archivos JSON o Firebase
const USE_JSON_FILES = true;

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
      
      if (USE_JSON_FILES) {
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
      } else {
        // Usar Firebase para cargar productos
        console.log('Cargando productos desde Firebase...');
        const productosRef = collection(db, COLLECTIONS.PRODUCTOS);
        let q = query(
          productosRef,
          where('restauranteId', '==', restauranteId)
        );
        
        if (categoriaId) {
          q = query(q, where('categoriaId', '==', categoriaId));
        }
        
        console.log('Obteniendo productos con:', {
          restauranteId,
          categoriaId,
          query: 'Consulta a Firebase'
        });

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const producto: any = {
            id: docSnap.id,
            nombre: data.nombre,
            descripcion: data.descripcion,
            categoriaId: data.categoriaId,
            imagen: data.imagen,
            currentVersion: 1,
            priceHistory: [],
            versions: [],
            status: data.estado === 'disponible' ? 'active' : 'archived',
            stock: {
              currentQuantity: data.stock?.actual || 0,
              minQuantity: data.stock?.minimo || 0,
              maxQuantity: data.stock?.maximo || 100,
              status: data.estado === 'disponible' ? 'in_stock' : 'out_of_stock',
              lastUpdated: data.metadata?.lastModified?.toDate() || new Date(),
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
              createdAt: data.metadata?.createdAt?.toDate() || new Date(),
              createdBy: data.metadata?.createdBy || '',
              lastModified: data.metadata?.lastModified?.toDate() || new Date(),
              lastModifiedBy: data.metadata?.lastModifiedBy || ''
            },
            restauranteId: data.restauranteId as any
          };
          productosData.push(producto);
        }
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
      let nuevoProducto: VersionedProduct;
      
      if (USE_JSON_FILES) {
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
        // Usar una aserción de tipo para evitar errores de TypeScript
        nuevoProducto = {
          id: nuevoId,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
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
        } as VersionedProduct;
        
        // Añadir restauranteId después de la aserción de tipo
        (nuevoProducto as any).restauranteId = restauranteId;
        
        // En una implementación real, aquí se guardaría en el archivo JSON
        console.log('Nuevo producto creado (simulación):', nuevoProducto);
      } else {
        // Usar Firebase para agregar producto
        const batch = writeBatch(db);
        const productoRef = doc(collection(db, COLLECTIONS.PRODUCTOS));
        const timestamp = serverTimestamp();
        let imagenUrl: string | undefined;
    
        if (imagen) {
          const storageRef = ref(storage, `productos/${restauranteId}/${productoRef.id}/${imagen.name}`);
          await uploadBytes(storageRef, imagen);
          imagenUrl = await getDownloadURL(storageRef);
        }
    
        // Preparar datos según la estructura de IProducto
        const productoData = {
          id: productoRef.id,
          restauranteId,
          categoriaId: producto.categoriaId,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen: imagenUrl || '',
          stock: {
            actual: 0,
            minimo: 0,
            unidad: 'unidad'
          },
          estado: 'disponible',
          metadata: {
            createdAt: timestamp,
            lastModified: timestamp,
            createdBy: 'current-user',
            lastModifiedBy: 'current-user'
          }
        };
    
        batch.set(productoRef, productoData);
        await batch.commit();
    
        // Convertir a formato VersionedProduct para el estado local
        nuevoProducto = {
          id: productoRef.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoriaId: producto.categoriaId,
          imagen: imagenUrl || '',
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
        } as VersionedProduct;
        
        // Añadir restauranteId después de la aserción de tipo
        (nuevoProducto as any).restauranteId = restauranteId;
      }
      
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
      
      if (USE_JSON_FILES) {
        // Simulación de actualizar producto con archivos JSON
        console.log('Simulando actualizar producto en archivos JSON:', { id, datos });
        
        if (imagen) {
          // Simulamos la URL de la imagen
          imagenUrl = `/imagenes/productos/${id}.jpg`;
          console.log('Imagen simulada:', imagenUrl);
        }
        
        // En una implementación real, aquí se actualizaría el archivo JSON
        console.log('Producto actualizado (simulación):', { id, ...datos });
      } else {
        // Usar Firebase para actualizar producto
        const batch = writeBatch(db);
        const productoRef = doc(db, COLLECTIONS.PRODUCTOS, id);
    
        if (imagen) {
          const storageRef = ref(storage, `productos/${restauranteId}/${id}/${imagen.name}`);
          await uploadBytes(storageRef, imagen);
          imagenUrl = await getDownloadURL(storageRef);
        }
    
        // Preparar datos para Firestore según IProducto
        const actualizacion = {
          ...(datos.nombre && { nombre: datos.nombre }),
          ...(datos.descripcion && { descripcion: datos.descripcion }),
          ...(datos.categoriaId && { categoriaId: datos.categoriaId }),
          ...(imagenUrl && { imagen: imagenUrl }),
          ...(datos.stock && {
            stock: {
              actual: datos.stock.currentQuantity,
              minimo: datos.stock.minQuantity,
              unidad: 'unidad'
            }
          }),
          metadata: {
            lastModified: serverTimestamp(),
            lastModifiedBy: 'current-user'
          }
        };
    
        batch.update(productoRef, actualizacion);
        await batch.commit();
      }
  
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
      if (USE_JSON_FILES) {
        // Simulación de eliminar producto con archivos JSON
        console.log('Simulando eliminar producto en archivos JSON:', id);
        
        // En una implementación real, aquí se actualizaría el archivo JSON
        console.log('Producto eliminado (simulación):', id);
      } else {
        // Usar Firebase para eliminar producto
        const batch = writeBatch(db);
        
        // Eliminar imagen si existe
        if (imagenUrl) {
          const imageRef = ref(storage, imagenUrl);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error al eliminar imagen:', error);
            // Continuamos aunque falle la eliminación de la imagen
          }
        }
    
        // Actualizar estado en Firestore (soft delete)
        const productoRef = doc(db, COLLECTIONS.PRODUCTOS, id);
        batch.update(productoRef, { 
          estado: 'inactivo',
          metadata: {
            lastModified: serverTimestamp(),
            lastModifiedBy: 'current-user'
          }
        });
    
        await batch.commit();
      }
  
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
