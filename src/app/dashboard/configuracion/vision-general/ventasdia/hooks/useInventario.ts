import { useState } from 'react';
import { db } from '@/firebase/config';
;

export const useInventario = (restauranteId: string = 'rest-test-001') => {
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualizar cantidad inicial para todos los platos
  const actualizarCantidadInicial = async (cantidad: number) => {
    setActualizando(true);
    try {
      const ventaDiaRef = doc(db, 'ventasDia', restauranteId);
      await updateDoc(ventaDiaRef, {
        'platos': {
          cantidadInicial: cantidad,
          cantidadDisponible: cantidad
        }
      });
      setActualizando(false);
      return true;
    } catch (err) {
      setError('Error al actualizar cantidades');
      setActualizando(false);
      return false;
    }
  };

  // Marcar plato como agotado
  const marcarComoAgotado = async (platoId: string) => {
    setActualizando(true);
    try {
      const ventaDiaRef = doc(db, 'ventasDia', restauranteId);
      // Aquí iría la lógica específica para marcar como agotado
      setActualizando(false);
      return true;
    } catch (err) {
      setError('Error al marcar como agotado');
      setActualizando(false);
      return false;
    }
  };

  // Reponer inventario
  const reponerInventario = async (platoId: string, cantidad: number) => {
    setActualizando(true);
    try {
      const ventaDiaRef = doc(db, 'ventasDia', restauranteId);
      // Aquí iría la lógica específica para reponer inventario
      setActualizando(false);
      return true;
    } catch (err) {
      setError('Error al reponer inventario');
      setActualizando(false);
      return false;
    }
  };

  return {
    actualizando,
    error,
    actualizarCantidadInicial,
    marcarComoAgotado,
    reponerInventario
  };
};