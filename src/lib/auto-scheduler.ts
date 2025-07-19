import { scheduler } from './scheduler';

/**
 * Auto-inicialización del scheduler
 * Se ejecuta automáticamente cuando se importa este módulo
 */
let schedulerInitialized = false;

export const initializeSchedulerOnce = () => {
  // Solo ejecutar en el servidor (no en el cliente)
  if (typeof window !== 'undefined') {
    return;
  }

  // Solo inicializar una vez
  if (schedulerInitialized) {
    return;
  }

  try {
    console.log('🚀 Inicializando scheduler automático...');
    
    // Inicializar tareas
    scheduler.initializeTasks();
    
    // Arrancar todas las tareas
    scheduler.startAll();
    
    schedulerInitialized = true;
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
