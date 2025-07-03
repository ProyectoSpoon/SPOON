import { register, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Métricas específicas para el sistema de cache de SPOON
 * Monitorea: operaciones de cache, hit/miss rates, tiempos de vida, tamaños
 */

export const cacheMetricas = {
  // Operaciones de cache (hit/miss/save/clear)
  operacionesCache: new Counter({
    name: 'spoon_cache_operaciones_total',
    help: 'Total de operaciones de cache por tipo',
    labelNames: ['operacion', 'resultado', 'tipo_cache', 'componente']
  }),

  // Tiempo de vida del cache
  tiempoVidaCache: new Histogram({
    name: 'spoon_cache_tiempo_vida_minutos',
    help: 'Tiempo que permanece válido el cache antes de expirar',
    labelNames: ['tipo_cache', 'componente'],
    buckets: [1, 5, 10, 15, 20, 25, 30, 45, 60]
  }),

  // Tamaño del cache en localStorage
  tamanoCache: new Gauge({
    name: 'spoon_cache_tamano_bytes',
    help: 'Tamaño actual del cache en localStorage',
    labelNames: ['tipo_cache', 'componente']
  }),

  // Hit rate del cache
  hitRateCache: new Gauge({
    name: 'spoon_cache_hit_rate_porcentaje',
    help: 'Porcentaje de aciertos del cache',
    labelNames: ['tipo_cache', 'periodo']
  }),

  // Tiempo de acceso al cache
  tiempoAccesoCache: new Histogram({
    name: 'spoon_cache_acceso_milisegundos',
    help: 'Tiempo de acceso a operaciones de cache',
    labelNames: ['operacion', 'tipo_cache'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500]
  }),

  // Errores de cache
  erroresCache: new Counter({
    name: 'spoon_cache_errores_total',
    help: 'Errores en operaciones de cache',
    labelNames: ['tipo_error', 'operacion', 'componente']
  }),

  // Invalidaciones de cache
  invalidacionesCache: new Counter({
    name: 'spoon_cache_invalidaciones_total',
    help: 'Invalidaciones de cache (manuales y automáticas)',
    labelNames: ['motivo', 'tipo_cache', 'componente']
  }),

  // Eficiencia del cache (datos guardados vs datos cargados)
  eficienciaCache: new Gauge({
    name: 'spoon_cache_eficiencia_porcentaje',
    help: 'Eficiencia del cache (datos reutilizados vs nuevos)',
    labelNames: ['componente', 'periodo']
  })
};

// Registrar todas las métricas
Object.values(cacheMetricas).forEach(metric => {
  register.registerMetric(metric);
});

// Funciones helper para uso fácil
export const registrarOperacionCache = (
  operacion: 'hit' | 'miss' | 'save' | 'clear' | 'get' | 'set',
  resultado: 'exitoso' | 'error' | 'expirado' | 'no_encontrado',
  tipoCache: string = 'menu',
  componente: string = 'general'
) => {
  cacheMetricas.operacionesCache.inc({
    operacion,
    resultado,
    tipo_cache: tipoCache,
    componente
  });
};

export const registrarTiempoAccesoCache = (
  operacion: 'read' | 'write' | 'delete',
  tiempoMs: number,
  tipoCache: string = 'menu'
) => {
  cacheMetricas.tiempoAccesoCache.observe(
    { operacion, tipo_cache: tipoCache },
    tiempoMs
  );
};

export const actualizarTamanoCache = (
  tamanoBytes: number,
  tipoCache: string = 'menu',
  componente: string = 'localStorage'
) => {
  cacheMetricas.tamanoCache.set(
    { tipo_cache: tipoCache, componente },
    tamanoBytes
  );
};

export const registrarErrorCache = (
  tipoError: string,
  operacion: string,
  componente: string = 'general'
) => {
  cacheMetricas.erroresCache.inc({
    tipo_error: tipoError,
    operacion,
    componente
  });
};

export const registrarInvalidacionCache = (
  motivo: 'expiracion' | 'manual' | 'error' | 'actualizacion',
  tipoCache: string = 'menu',
  componente: string = 'general'
) => {
  cacheMetricas.invalidacionesCache.inc({
    motivo,
    tipo_cache: tipoCache,
    componente
  });
};

export const actualizarHitRate = (
  porcentaje: number,
  tipoCache: string = 'menu',
  periodo: 'hora' | 'dia' | 'semana' = 'hora'
) => {
  cacheMetricas.hitRateCache.set(
    { tipo_cache: tipoCache, periodo },
    porcentaje
  );
};

export const actualizarEficienciaCache = (
  porcentaje: number,
  componente: string = 'menu',
  periodo: 'hora' | 'dia' | 'semana' = 'hora'
) => {
  cacheMetricas.eficienciaCache.set(
    { componente, periodo },
    porcentaje
  );
};

// Función para medir tiempo de operación de cache
export const medirOperacionCache = (
  operacion: 'read' | 'write' | 'delete',
  tipoCache: string = 'menu'
) => {
  const inicioTiempo = Date.now();
  
  return {
    finalizar: () => {
      const tiempoMs = Date.now() - inicioTiempo;
      registrarTiempoAccesoCache(operacion, tiempoMs, tipoCache);
      return tiempoMs;
    }
  };
};

// Exportar para uso en otros módulos
export default cacheMetricas;
