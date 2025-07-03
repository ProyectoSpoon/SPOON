import { register, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Métricas específicas para el flujo de menú del restaurante en SPOON
 * Monitorea: carga de datos, operaciones de menú, combinaciones y cache
 */

// Métricas específicas del flujo de menú
export const menuMetricas = {
  // Operaciones de menú del día
  operacionesMenu: new Counter({
    name: 'spoon_menu_operaciones_total',
    help: 'Total de operaciones de menú por restaurante',
    labelNames: ['operacion', 'restaurante_id', 'estado', 'categoria']
  }),

  // Tiempo de carga de datos (categorías, productos, etc.)
  tiempoCargaDatos: new Histogram({
    name: 'spoon_carga_datos_segundos',
    help: 'Tiempo de carga de categorías y productos',
    labelNames: ['componente', 'operacion', 'fuente'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 15]
  }),

  // Productos en menú activo por restaurante
  productosMenuActivo: new Gauge({
    name: 'spoon_productos_menu_activo',
    help: 'Número de productos en menú del día por categoría',
    labelNames: ['restaurante_id', 'categoria', 'tipo_menu']
  }),

  // Combinaciones creadas
  combinacionesCreadas: new Counter({
    name: 'spoon_combinaciones_creadas_total',
    help: 'Total de combinaciones creadas por restaurante',
    labelNames: ['restaurante_id', 'tipo_combinacion', 'estado']
  }),

  // Tiempo de publicación de menú
  tiempoPublicacionMenu: new Histogram({
    name: 'spoon_publicacion_menu_segundos',
    help: 'Tiempo que toma publicar un menú completo',
    labelNames: ['restaurante_id', 'cantidad_productos'],
    buckets: [0.5, 1, 2, 5, 10, 20, 30]
  }),

  // Errores específicos del menú
  erroresMenu: new Counter({
    name: 'spoon_menu_errores_total',
    help: 'Errores específicos en operaciones de menú',
    labelNames: ['tipo_error', 'componente', 'operacion', 'restaurante_id']
  }),

  // Favoritos agregados/removidos
  operacionesFavoritos: new Counter({
    name: 'spoon_favoritos_operaciones_total',
    help: 'Operaciones de favoritos (agregar/quitar)',
    labelNames: ['operacion', 'restaurante_id', 'producto_categoria']
  }),

  // Programación semanal
  programacionSemanal: new Counter({
    name: 'spoon_programacion_semanal_total',
    help: 'Programaciones semanales creadas/modificadas',
    labelNames: ['operacion', 'restaurante_id', 'dia_semana']
  })
};

// Registrar todas las métricas
Object.values(menuMetricas).forEach(metric => {
  register.registerMetric(metric);
});

// Funciones helper para uso fácil
export const registrarOperacionMenu = (
  operacion: string,
  restauranteId: string = 'desconocido',
  estado: 'exitoso' | 'error' | 'pendiente' = 'exitoso',
  categoria?: string
) => {
  menuMetricas.operacionesMenu.inc({
    operacion,
    restaurante_id: restauranteId,
    estado,
    categoria: categoria || 'general'
  });
};

export const registrarTiempoCarga = (
  componente: string,
  operacion: string,
  tiempoSegundos: number,
  fuente: 'api' | 'cache' | 'local' = 'api'
) => {
  menuMetricas.tiempoCargaDatos.observe(
    { componente, operacion, fuente },
    tiempoSegundos
  );
};

export const actualizarProductosMenu = (
  restauranteId: string,
  categoria: string,
  cantidad: number,
  tipoMenu: 'dia' | 'semanal' | 'especial' = 'dia'
) => {
  menuMetricas.productosMenuActivo.set(
    { restaurante_id: restauranteId, categoria, tipo_menu: tipoMenu },
    cantidad
  );
};

export const registrarErrorMenu = (
  tipoError: string,
  componente: string,
  operacion: string,
  restauranteId: string = 'desconocido'
) => {
  menuMetricas.erroresMenu.inc({
    tipo_error: tipoError,
    componente,
    operacion,
    restaurante_id: restauranteId
  });
};

// Exportar para uso en otros módulos
export default menuMetricas;
