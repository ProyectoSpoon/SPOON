import { register, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Métricas específicas para las APIs de SPOON
 * Monitorea: tiempo de respuesta, errores HTTP, throughput, conexiones
 */

export const apiMetricas = {
  // Requests HTTP por endpoint
  requestsHttp: new Counter({
    name: 'spoon_http_requests_total',
    help: 'Total de requests HTTP por endpoint',
    labelNames: ['method', 'endpoint', 'status_code', 'user_agent']
  }),

  // Tiempo de respuesta de APIs
  tiempoRespuestaApi: new Histogram({
    name: 'spoon_api_response_time_seconds',
    help: 'Tiempo de respuesta de APIs en segundos',
    labelNames: ['endpoint', 'method', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 7, 10]
  }),

  // Errores de API por tipo
  erroresApi: new Counter({
    name: 'spoon_api_errors_total',
    help: 'Total de errores de API por tipo',
    labelNames: ['endpoint', 'error_type', 'status_code', 'error_message']
  }),

  // Conexiones activas a la base de datos
  conexionesBD: new Gauge({
    name: 'spoon_database_connections_active',
    help: 'Conexiones activas a la base de datos',
    labelNames: ['database', 'pool_name']
  }),

  // Tiempo de consultas a la base de datos
  tiempoConsultasBD: new Histogram({
    name: 'spoon_database_query_duration_seconds',
    help: 'Tiempo de ejecución de consultas a la base de datos',
    labelNames: ['query_type', 'table', 'operation'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  // Throughput de la API
  throughputApi: new Gauge({
    name: 'spoon_api_throughput_requests_per_second',
    help: 'Throughput de la API en requests por segundo',
    labelNames: ['endpoint', 'period']
  }),

  // Tamaño de payload de requests/responses
  tamanoPayload: new Histogram({
    name: 'spoon_api_payload_size_bytes',
    help: 'Tamaño de payload en bytes',
    labelNames: ['endpoint', 'direction', 'content_type'],
    buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]
  }),

  // Rate limiting
  rateLimiting: new Counter({
    name: 'spoon_api_rate_limit_hits_total',
    help: 'Hits de rate limiting por endpoint',
    labelNames: ['endpoint', 'user_id', 'limit_type']
  })
};

// Registrar todas las métricas
Object.values(apiMetricas).forEach(metric => {
  register.registerMetric(metric as any);
});

// Funciones helper para uso fácil
export const registrarRequestHttp = (
  method: string,
  endpoint: string,
  statusCode: number,
  userAgent: string = 'unknown'
) => {
  apiMetricas.requestsHttp.inc({
    method: method.toUpperCase(),
    endpoint,
    status_code: statusCode.toString(),
    user_agent: userAgent
  });
};

export const registrarTiempoRespuesta = (
  endpoint: string,
  method: string,
  statusCode: number,
  tiempoSegundos: number
) => {
  apiMetricas.tiempoRespuestaApi.observe(
    {
      endpoint,
      method: method.toUpperCase(),
      status_code: statusCode.toString()
    },
    tiempoSegundos
  );
};

export const registrarErrorApi = (
  endpoint: string,
  errorType: string,
  statusCode: number,
  errorMessage: string = 'unknown'
) => {
  apiMetricas.erroresApi.inc({
    endpoint,
    error_type: errorType,
    status_code: statusCode.toString(),
    error_message: errorMessage.substring(0, 100) // Limitar longitud
  });
};

export const actualizarConexionesBD = (
  cantidad: number,
  database: string = 'spoon_db',
  poolName: string = 'default'
) => {
  apiMetricas.conexionesBD.set(
    { database, pool_name: poolName },
    cantidad
  );
};

export const registrarConsultaBD = (
  tiempoSegundos: number,
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  operation: string = 'unknown'
) => {
  apiMetricas.tiempoConsultasBD.observe(
    {
      query_type: queryType,
      table,
      operation
    },
    tiempoSegundos
  );
};

export const actualizarThroughput = (
  requestsPerSecond: number,
  endpoint: string,
  period: 'minute' | 'hour' | 'day' = 'minute'
) => {
  apiMetricas.throughputApi.set(
    { endpoint, period },
    requestsPerSecond
  );
};

export const registrarTamanoPayload = (
  tamanoBytes: number,
  endpoint: string,
  direction: 'request' | 'response',
  contentType: string = 'application/json'
) => {
  apiMetricas.tamanoPayload.observe(
    {
      endpoint,
      direction,
      content_type: contentType
    },
    tamanoBytes
  );
};

export const registrarRateLimit = (
  endpoint: string,
  userId: string = 'anonymous',
  limitType: 'per_minute' | 'per_hour' | 'per_day' = 'per_minute'
) => {
  apiMetricas.rateLimiting.inc({
    endpoint,
    user_id: userId,
    limit_type: limitType
  });
};

// Función para medir tiempo de API automáticamente
export const medirTiempoApi = (endpoint: string, method: string) => {
  const inicioTiempo = Date.now();
  
  return {
    finalizar: (statusCode: number) => {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoRespuesta(endpoint, method, statusCode, tiempoSegundos);
      return tiempoSegundos;
    }
  };
};

// Función para medir tiempo de consulta BD automáticamente
export const medirConsultaBD = (
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  operation: string = 'unknown'
) => {
  const inicioTiempo = Date.now();
  
  return {
    finalizar: () => {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarConsultaBD(tiempoSegundos, queryType, table, operation);
      return tiempoSegundos;
    }
  };
};

// Exportar para uso en otros módulos
export default apiMetricas;
