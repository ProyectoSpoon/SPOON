import { NextRequest, NextResponse } from 'next/server';
import { register } from 'prom-client';

// Importar nuestras métricas para que se registren automáticamente
import '../../../../monitoreo/metricas/menu-metricas';
import '../../../../monitoreo/metricas/cache-metricas';
import '../../../../monitoreo/metricas/api-metricas';

/**
 * Endpoint para exponer métricas de Prometheus
 * URL: /api/metrics
 */

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las métricas registradas
    const metrics = await register.metrics();
    
    // Retornar las métricas en formato Prometheus
    return new Response(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
    
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al obtener métricas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS si es necesario
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
