// src/hooks/use-config-sync.ts
import { useConfigStore } from '@/app/config-restaurante/store/config-store';
import { useAuth } from '@/context/postgres-authcontext';

/**
 * Hook para sincronizar el store de configuración después de guardar datos
 * Solución mínima para actualizar el % de progreso sin romper funcionalidad existente
 */
export const useConfigSync = () => {
  const { sincronizarConBD } = useConfigStore();
  const { user } = useAuth();

  /**
   * Sincroniza el store con la base de datos después de un guardado exitoso
   * Debe llamarse SOLO después de que la API confirme el guardado exitoso
   */
  const syncAfterSave = async () => {
    if (user?.restaurantId) {
      try {
        await sincronizarConBD(user.restaurantId);
        console.log('✅ Store sincronizado después del guardado');
      } catch (error) {
        console.error('❌ Error sincronizando store:', error);
        // No lanzar error para no romper el flujo existente
      }
    }
  };

  return { syncAfterSave };
};
