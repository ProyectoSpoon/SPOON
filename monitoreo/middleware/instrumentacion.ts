import { 
  registrarOperacionMenu, 
  registrarTiempoCarga, 
  registrarErrorMenu 
} from '../metricas/menu-metricas';
import { 
  registrarOperacionCache, 
  medirOperacionCache 
} from '../metricas/cache-metricas';
import { 
  registrarRequestHttp, 
  registrarTiempoRespuesta, 
  registrarErrorApi,
  medirTiempoApi 
} from '../metricas/api-metricas';

/**
 * Middleware y decoradores para instrumentar automáticamente las funciones de SPOON
 */

// Tipos para el middleware
export interface OpcionesInstrumentacion {
  componente: string;
  operacion: string;
  restauranteId?: string;
  categoria?: string;
  registrarErrores?: boolean;
}

/**
 * Decorador para instrumentar operaciones de menú automáticamente
 */
export function instrumentarOperacionMenu(opciones: OpcionesInstrumentacion) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const metodoOriginal = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const inicioTiempo = Date.now();
      const restauranteId = opciones.restauranteId || args[0]?.restauranteId || 'desconocido';
      
      try {
        // Ejecutar el método original
        const resultado = await metodoOriginal.apply(this, args);
        
        // Registrar éxito
        const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
        registrarTiempoCarga(
          opciones.componente,
          opciones.operacion,
          tiempoSegundos,
          'api'
        );
        
        registrarOperacionMenu(
          opciones.operacion,
          restauranteId,
          'exitoso',
          opciones.categoria
        );
        
        return resultado;
        
      } catch (error) {
        // Registrar error
        const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
        registrarTiempoCarga(
          opciones.componente,
          opciones.operacion,
          tiempoSegundos,
          'api'
        );
        
        registrarOperacionMenu(
          opciones.operacion,
          restauranteId,
          'error',
          opciones.categoria
        );
        
        if (opciones.registrarErrores !== false) {
          registrarErrorMenu(
            error instanceof Error ? error.name : 'UnknownError',
            opciones.componente,
            opciones.operacion,
            restauranteId
          );
        }
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Decorador para instrumentar operaciones de cache
 */
export function instrumentarOperacionCache(
  operacion: 'read' | 'write' | 'delete',
  tipoCache: string = 'menu'
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const metodoOriginal = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const medicion = medirOperacionCache(operacion, tipoCache);
      
      try {
        const resultado = await metodoOriginal.apply(this, args);
        
        // Determinar el resultado basado en el valor retornado
        let resultadoCache: 'exitoso' | 'error' | 'expirado' | 'no_encontrado' = 'exitoso';
        
        if (operacion === 'read') {
          resultadoCache = resultado ? 'exitoso' : 'no_encontrado';
        }
        
        registrarOperacionCache(
          operacion === 'read' ? 'get' : operacion === 'write' ? 'set' : 'clear',
          resultadoCache,
          tipoCache
        );
        
        medicion.finalizar();
        return resultado;
        
      } catch (error) {
        registrarOperacionCache(
          operacion === 'read' ? 'get' : operacion === 'write' ? 'set' : 'clear',
          'error',
          tipoCache
        );
        
        medicion.finalizar();
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Decorador para instrumentar APIs HTTP
 */
export function instrumentarAPI(endpoint: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const metodoOriginal = descriptor.value;
    
    descriptor.value = async function (request: Request, ...args: any[]) {
      const method = request.method;
      const medicion = medirTiempoApi(endpoint, method);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      try {
        const resultado = await metodoOriginal.apply(this, [request, ...args]);
        
        // Determinar status code de la respuesta
        let statusCode = 200;
        if (resultado && typeof resultado === 'object' && 'status' in resultado) {
          statusCode = resultado.status;
        }
        
        // Registrar métricas
        registrarRequestHttp(method, endpoint, statusCode, userAgent);
        medicion.finalizar(statusCode);
        
        return resultado;
        
      } catch (error) {
        const statusCode = error instanceof Error && 'status' in error 
          ? (error as any).status 
          : 500;
        
        registrarRequestHttp(method, endpoint, statusCode, userAgent);
        registrarErrorApi(
          endpoint,
          error instanceof Error ? error.name : 'UnknownError',
          statusCode,
          error instanceof Error ? error.message : 'Error desconocido'
        );
        medicion.finalizar(statusCode);
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Función helper para medir tiempo manualmente
 */
export function medirTiempo(
  componente: string,
  operacion: string,
  restauranteId?: string,
  categoria?: string
) {
  const inicioTiempo = Date.now();
  
  return {
    finalizar: () => {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga(componente, operacion, tiempoSegundos, 'api');
      return tiempoSegundos;
    },
    
    registrarExito: () => {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga(componente, operacion, tiempoSegundos, 'api');
      registrarOperacionMenu(
        operacion,
        restauranteId || 'desconocido',
        'exitoso',
        categoria
      );
      return tiempoSegundos;
    },
    
    registrarError: (error?: Error) => {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga(componente, operacion, tiempoSegundos, 'api');
      registrarOperacionMenu(
        operacion,
        restauranteId || 'desconocido',
        'error',
        categoria
      );
      
      if (error) {
        registrarErrorMenu(
          error.name,
          componente,
          operacion,
          restauranteId || 'desconocido'
        );
      }
      
      return tiempoSegundos;
    }
  };
}

/**
 * Middleware para Next.js API routes
 */
export function crearMiddlewareMetricas(endpoint: string) {
  return async function (request: Request, response: any, next?: Function) {
    const method = request.method || 'GET';
    const medicion = medirTiempoApi(endpoint, method);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      // Si hay función next (Express-style), llamarla
      if (next) {
        await next();
      }
      
      // Obtener status code de la respuesta
      const statusCode = response.status || 200;
      
      // Registrar métricas
      registrarRequestHttp(method, endpoint, statusCode, userAgent);
      medicion.finalizar(statusCode);
      
    } catch (error) {
      const statusCode = error instanceof Error && 'status' in error 
        ? (error as any).status 
        : 500;
      
      registrarRequestHttp(method, endpoint, statusCode, userAgent);
      registrarErrorApi(
        endpoint,
        error instanceof Error ? error.name : 'UnknownError',
        statusCode,
        error instanceof Error ? error.message : 'Error desconocido'
      );
      medicion.finalizar(statusCode);
      
      throw error;
    }
  };
}

// Los tipos ya están exportados arriba
