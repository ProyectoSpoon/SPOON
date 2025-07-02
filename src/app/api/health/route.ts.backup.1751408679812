import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    const healthStatus = {
      success: true,
      timestamp: new Date().toISOString(),
      service: 'SPOON Dashboard API',
      version: '1.0.0',
      database: {
        connected: dbConnected,
        type: 'PostgreSQL'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus = {
      success: false,
      timestamp: new Date().toISOString(),
      service: 'SPOON Dashboard API',
      version: '1.0.0',
      database: {
        connected: false,
        type: 'PostgreSQL',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}
