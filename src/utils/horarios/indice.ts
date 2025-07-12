// /shared/hooks/horarios/indice.ts
export * from './usar-gestor-horarios';
export * from './usar-festivos';


// Re-exportaciones con alias para mantener compatibilidad
export { GestorZonaHoraria as TimezoneHandler } from './gestor-zona-horaria';
export { utilidadesHorarios as horariosUtils } from './utilidades-horarios';
