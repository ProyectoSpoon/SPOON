import { useState } from 'react';

interface ItemInventario {
  id: string;
  nombre: string;
  cantidad: number;
  minimo: number;
  categoria: string;
}

export const useInventario = (restauranteId: string = 'rest-test-001') => {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular carga de inventario
  const cargarInventario = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando inventario (simulación):', restauranteId);
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo
      const inventarioEjemplo = [
        {
          id: 'inv_1',
          nombre: 'Hamburguesas',
          cantidad: 50,
          minimo: 10,
          categoria: 'Carnes'
        },
        {
          id: 'inv_2',
          nombre: 'Papas Fritas',
          cantidad: 25,
          minimo: 15,
          categoria: 'Acompañamientos'
        },
        {
          id: 'inv_3',
          nombre: 'Bebidas',
          cantidad: 100,
          minimo: 20,
          categoria: 'Bebidas'
        }
      ];
      
      setInventario(inventarioEjemplo);
      console.log('Inventario cargado (simulación):', inventarioEjemplo);
      
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setError('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Simular actualización de inventario
  const actualizarInventario = async (id: string, nuevaCantidad: number) => {
    try {
      console.log('Actualizando inventario (simulación):', { id, nuevaCantidad });
      
      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setInventario(prev => 
        prev.map((item: any) => 
          item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
      
      console.log('Inventario actualizado (simulación)');
      
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      setError('Error al actualizar el inventario');
    }
  };

  return {
    inventario,
    loading,
    actualizando,
    error,
    cargarInventario,
    actualizarInventario
  };
};
