import { scheduler } from './scheduler';

/**
 * Auto-inicialización del scheduler
 * Se ejecuta automáticamente cuando se importa este módulo
 */
// Extend globalThis to include our scheduler flag
const globalWithScheduler = globalThis as unknown as {
  __schedulerInitialized: boolean;
};

export const initializeSchedulerOnce = () => {
  // Solo ejecutar en el servidor (no en el cliente)
  if (typeof window !== 'undefined') {
    return;
  }

  // Solo inicializar una vez (check global state)
  if (globalWithScheduler.__schedulerInitialized) {
    return;
  }

  try {
    console.log('🚀 Inicializando scheduler automático...');

    // Inicializar tareas
    scheduler.initializeTasks();

    // Arrancar todas las tareas
    scheduler.startAll();

    globalWithScheduler.__schedulerInitialized = true;
    console.log('✅ Scheduler automático iniciado exitosamente');

    // Log de confirmación
    console.log('📅 Tareas programadas:');
    console.log('  - Limpieza de menús diarios: 10:00 PM (Colombia)');

  } catch (error) {
    console.error('❌ Error iniciando scheduler automático:', error);
  }
};

// Auto-ejecutar la inicialización cuando se importe este módulo
initializeSchedulerOnce();
