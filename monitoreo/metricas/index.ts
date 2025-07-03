/**
 * Índice principal de métricas de SPOON
 * Exporta todas las métricas y funciones helper
 */

// Importar todas las métricas
export * from './menu-metricas';
export * from './cache-metricas';
export * from './api-metricas';

// Importar métricas por defecto
import menuMetricas from './menu-metricas';
import cacheMetricas from './cache-metricas';
import apiMetricas from './api-metricas';

// Exportar colección completa de métricas
export const todasLasMetricas = {
  menu: menuMetricas,
  cache: cacheMetricas,
  api: apiMetricas
};

// Re-exportar funciones helper más usadas
export {
  // Métricas de menú
  registrarOperacionMenu,
  registrarTiempoCarga,
  actualizarProductosMenu,
  registrarErrorMenu
} from './menu-metricas';

export {
  // Métricas de cache
  registrarOperacionCache,
  registrarTiempoAccesoCache,
  actualizarTamanoCache,
  medirOperacionCache
} from './cache-metricas';

export {
  // Métricas de API
  registrarRequestHttp,
  registrarTiempoRespuesta,
  registrarErrorApi,
  medirTiempoApi,
  medirConsultaBD
} from './api-metricas';

// Función helper para inicializar todas las métricas
export const inicializarMetricas = () => {
  console.log('🚀 Métricas de SPOON inicializadas');
  console.log('📊 Métricas disponibles:');
  console.log('  - Menú: operaciones, tiempos de carga, productos activos');
  console.log('  - Cache: hit/miss rates, tamaños, tiempos de acceso');
  console.log('  - API: requests HTTP, errores, tiempos de respuesta');
  
  return todasLasMetricas;
};

// Exportar por defecto
export default todasLasMetricas;
