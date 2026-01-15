// /shared/hooks/horarios/indice.ts
export * from '@/shared/Hooks/horarios/use-gestor-horarios';
export * from '@/shared/Hooks/horarios/use-festivos';


// Re-exportaciones con alias para mantener compatibilidad
export { GestorZonaHoraria as TimezoneHandler } from './gestor-zona-horaria';
export { utilidadesHorarios as horariosUtils } from './utilidades-horarios';
