/**
 * Type definitions for horarios module
 * 
 * This file provides TypeScript type definitions for the horarios (schedules) functionality
 * used throughout the Spoon Restaurant application.
 */

declare module 'horarios' {
  /**
   * Represents a day of the week
   */
  export type Dia = 
    | 'lunes' 
    | 'martes' 
    | 'miercoles' 
    | 'jueves' 
    | 'viernes' 
    | 'sabado' 
    | 'domingo';

  /**
   * Represents a time range with start and end times
   */
  export interface RangoHorario {
    /** Start time in HH:mm format */
    inicio: string;
    /** End time in HH:mm format */
    fin: string;
  }

  /**
   * Represents an exception for specific dates in the schedule
   */
  export interface FechaExcepcion {
    /** Specific date of the exception */
    fecha: Date;
    /** Specific time ranges for this date, if different from normal schedule */
    rangos?: RangoHorario[];
    /** Indicates if the establishment is closed on this date */
    cerrado: boolean;
  }

  /**
   * Configures the operating schedule
   * Can be applied at restaurant level or specific category
   */
  export interface Horario {
    /** Days of the week when this schedule applies */
    dias: Dia[];
    /** Time ranges for the specified days */
    rangos: RangoHorario[];
    /** List of exceptions for specific dates */
    excepciones?: FechaExcepcion[];
    /** Schedule status (active/inactive) */
    activo: boolean;
  }

  /**
   * Utility functions for working with schedules
   */
  export interface HorariosUtils {
    /**
     * Checks if a business is open at a specific date and time
     */
    estaAbierto(horario: Horario, fecha?: Date): boolean;
    
    /**
     * Gets the next opening time from a given date
     */
    proximaApertura(horario: Horario, fecha?: Date): Date | null;
    
    /**
     * Formats a time range for display
     */
    formatearRango(rango: RangoHorario): string;
  }
}
