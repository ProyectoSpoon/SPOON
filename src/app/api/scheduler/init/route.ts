import { NextResponse } from 'next/server';
import { scheduler } from '@/lib/scheduler';

/**
 * Endpoint para inicializar el scheduler automático
 * Se llama automáticamente al iniciar la aplicación
 */
export async function POST(request: Request) {
  try {
    // Verificar que solo se ejecute en servidor
    if (typeof window !== 'undefined') {
      return NextResponse.json({ error: 'Solo disponible en servidor' }, { status: 400 });
    }

    // Verificar autorización (opcional)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Inicializar y arrancar el scheduler
    scheduler.initializeTasks();
    scheduler.startAll();

    console.log('🚀 Scheduler automático iniciado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Scheduler iniciado correctamente',
      tasks: ['menu-cleanup'],
      schedule: 'Diario a las 10:00 PM (Colombia)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error iniciando scheduler:', error);
    return NextResponse.json(
      { error: 'Error iniciando scheduler automático' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para verificar estado del scheduler
 */
export async function GET(request: Request) {
  try {
    return NextResponse.json({
      status: 'active',
      message: 'Scheduler automático configurado',
      tasks: {
        'menu-cleanup': {
          description: 'Limpieza diaria de menús',
          schedule: '0 22 * * * (10:00 PM Colombia)',
          nextRun: 'Calculado automáticamente por node-cron'
        }
      },
      timezone: 'America/Bogota',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error consultando scheduler:', error);
    return NextResponse.json(
      { error: 'Error consultando estado del scheduler' },
      { status: 500 }
    );
  }
}
