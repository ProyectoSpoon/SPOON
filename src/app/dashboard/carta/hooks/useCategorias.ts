// src/app/dashboard/carta/hooks/useCategorias.ts
import { useState, useCallback } from 'react';
;
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/types/collections.types';
import { ICategoriaMenu } from '@/firebase/types/collections.types';
import { jsonDataService } from '@/services/json-data.service';

// Bandera para determinar si usar los archivos JSON o Firebase
const USE_JSON_FILES = true;

// Definición de la interfaz Categoria sin extender de ICategoriaMenu para evitar conflictos
interface Categoria {
  id: string;
  nombre: string;
  tipo: string;
  orden: number;
  descripcion?: string;
  horarios?: {
    inicio: string;
    fin: string;
    dias: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  activo: boolean;
  restauranteId: string;
}

interface UseCategoriasProps {
  restauranteId: string;
}

export function useCategorias({ restauranteId }: UseCategoriasProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('RestauranteId usado:', restauranteId);
      
      let categoriasData: Categoria[] = [];
      
      if (USE_JSON_FILES) {
        // Usar el servicio JSON para cargar categorías
        console.log('Cargando categorías desde archivos JSON...');
        try {
          // Cargar categorías principales
          const categoriasJson = await jsonDataService.getCategorias();
          console.log('Categorías cargadas desde JSON:', categoriasJson);
          
          // Cargar subcategorías
          const subcategoriasJson = await jsonDataService.getSubcategorias();
          console.log('Subcategorías cargadas desde JSON:', subcategoriasJson);
          
          // Combinar categorías y subcategorías
          categoriasData = [
            ...categoriasJson,
            ...subcategoriasJson
          ];
          
          console.log('Total de categorías y subcategorías cargadas:', categoriasData.length);
        } catch (jsonError) {
          console.error('Error al cargar categorías desde JSON:', jsonError);
          throw jsonError;
        }
      } else {
        // Usar Firebase para cargar categorías
        console.log('Cargando categorías desde Firebase...');
        const categoriasRef = collection(db, COLLECTIONS.CATEGORIAS_MENU);
        const q = query(
          categoriasRef, 
          where('restauranteId', '==', restauranteId),
          where('disponible', '==', true)
        );
        
        console.log('Query creada, intentando obtener documentos...');
        const querySnapshot = await getDocs(q);
        console.log('Documentos encontrados:', querySnapshot.size);
        
        categoriasData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre,
            tipo: data.tipo,
            orden: data.orden,
            restauranteId: data.restauranteId,
            activo: data.disponible,
            descripcion: data.descripcion || '',
            horarios: data.horarios || null,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as Categoria;
        });
      }
      
      // Mantener el ordenamiento
      const categoriasOrdenadas = categoriasData.sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return a.nombre.localeCompare(b.nombre);
      });
      
      console.log('Categorías ordenadas:', categoriasOrdenadas);
      setCategorias(categoriasOrdenadas);
      return categoriasOrdenadas;
    } catch (err) {
      const errorMsg = 'Error al cargar las categorías';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  const agregarCategoria = useCallback(async (datos: Omit<Categoria, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      let nuevaCategoria: Categoria;
      
      if (USE_JSON_FILES) {
        // Simulación de agregar categoría con archivos JSON
        console.log('Simulando agregar categoría en archivos JSON:', datos);
        
        // Generar un ID único para la nueva categoría
        const nuevoId = `CAT_${Date.now()}`;
        
        // Crear la nueva categoría
        nuevaCategoria = {
          id: nuevoId,
          ...datos,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          restauranteId
        };
        
        // En una implementación real, aquí se guardaría en el archivo JSON
        console.log('Nueva categoría creada (simulación):', nuevaCategoria);
      } else {
        // Usar Firebase para agregar categoría
        // Preparar datos para Firestore siguiendo ICategoriaMenu
        const categoriaData = {
          nombre: datos.nombre,
          tipo: datos.tipo,
          restauranteId,
          orden: datos.orden || (categorias.length + 1) * 10,
          disponible: true, // En lugar de activo
          descripcion: datos.descripcion || '',
          horarios: datos.horarios || null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
    
        const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIAS_MENU), categoriaData);
        
        // Transformar de vuelta a nuestro formato local
        nuevaCategoria = {
          id: docRef.id,
          ...datos,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          restauranteId
        };
      }
      
      // Actualizar el estado local
      setCategorias(prev => {
        const nuevasCategorias = [...prev, nuevaCategoria];
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return nuevaCategoria;
    } catch (err) {
      const errorMsg = 'Error al crear la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categorias.length, restauranteId]);

  const actualizarCategoria = useCallback(async (id: string, datos: Partial<Categoria>) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_JSON_FILES) {
        // Simulación de actualizar categoría con archivos JSON
        console.log('Simulando actualizar categoría en archivos JSON:', { id, datos });
        
        // En una implementación real, aquí se actualizaría el archivo JSON
        console.log('Categoría actualizada (simulación):', { id, ...datos });
      } else {
        // Usar Firebase para actualizar categoría
        const docRef = doc(db, COLLECTIONS.CATEGORIAS_MENU, id);
        
        // Preparar datos para Firestore
        const datosActualizados = {
          ...datos,
          disponible: datos.activo, // Mapear activo a disponible
          updatedAt: new Date()
        };
    
        // Eliminar campos que no queremos enviar a Firestore
        delete datosActualizados.activo; // Eliminamos porque ya lo mapeamos a disponible
        delete datosActualizados.id; // No necesitamos enviar el id
    
        await updateDoc(docRef, datosActualizados);
      }
  
      // Actualizar estado local
      setCategorias(prev => {
        const nuevasCategorias = prev.map(cat => 
          cat.id === id 
            ? { 
                ...cat, 
                ...datos, 
                updatedAt: new Date() 
              } 
            : cat
        );
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return { id, ...datos, updatedAt: new Date() };
    } catch (err) {
      const errorMsg = 'Error al actualizar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_JSON_FILES) {
        // Simulación de eliminar categoría con archivos JSON
        console.log('Simulando eliminar categoría en archivos JSON:', id);
        
        // En una implementación real, aquí se actualizaría el archivo JSON
        console.log('Categoría eliminada (simulación):', id);
      } else {
        // Usar Firebase para eliminar categoría
        const docRef = doc(db, COLLECTIONS.CATEGORIAS_MENU, id);
        // Soft delete - marcar como no disponible en lugar de eliminar
        await updateDoc(docRef, {
          disponible: false,
          updatedAt: new Date()
        });
      }
  
      // Actualizar estado local
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      const errorMsg = 'Error al eliminar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorias,
    loading,
    error,
    obtenerCategorias,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria
  };
}
