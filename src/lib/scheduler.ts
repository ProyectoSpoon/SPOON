import cron from 'node-cron';

/**
 * Servicio de programación de tareas para SPOON
 * Maneja la limpieza automática de menús diarios
 */
export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: Map<string, any> = new Map();

  private constructor() { }

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Inicializar todas las tareas programadas
   */
  initializeTasks() {
    // Limpiar menús diarios a las 10:00 PM todos los días
    this.scheduleMenuCleanup();

    console.log('🕐 Scheduler iniciado - Tareas programadas:');
    console.log('  - Limpieza de menús: Diario a las 10:00 PM');
  }

  /**
   * Programar limpieza de menús diarios
   */
  private scheduleMenuCleanup() {
    const task = cron.schedule('0 22 * * *', async () => {
      try {
        console.log('🗑️ Iniciando limpieza automática de menús...');

        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/limpiar-menus`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Limpieza completada: ${result.cleaned} menús procesados`);
        } else {
          console.error('❌ Error en limpieza automática:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Error ejecutando limpieza automática:', error);
      }
    }, {
      scheduled: false, // No iniciar automáticamente
      timezone: "America/Bogota" // Zona horaria de Colombia
    } as any);

    this.tasks.set('menu-cleanup', task);
  }

  /**
   * Iniciar todas las tareas
   */
  startAll() {
    this.tasks.forEach((task, name) => {
      task.start();
      console.log(`▶️ Tarea iniciada: ${name}`);
    });
  }

  /**
   * Detener todas las tareas
   */
  stopAll() {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`⏹️ Tarea detenida: ${name}`);
    });
  }

  /**
   * Ejecutar limpieza manualmente (para testing)
   */
  async runMenuCleanupNow() {
    try {
      console.log('🔧 Ejecutando limpieza manual...');

      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/limpiar-menus`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Limpieza manual completada: ${result.cleaned} menús procesados`);
        return result;
      } else {
        throw new Error(`Error HTTP: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error en limpieza manual:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const scheduler = SchedulerService.getInstance();
