import { 
    guardarHorarioInicial as fbGuardarHorarioInicial,
    obtenerHorarios as fbObtenerHorarios,
    actualizarHorarios as fbActualizarHorarios
  } from '@/lib/firebase/horarios';
  import { HorariosSemanales } from '@/app/dashboard/horario-comercial/types/horarios.types';
  
  /**
   * Guarda los horarios en la configuración inicial y valida los datos
   */
  export const guardarConfiguracionInicial = async (
    idRestaurante: string,
    horarios: HorariosSemanales
  ): Promise<{ exito: boolean; error?: string }> => {
    try {
      // Validar que todos los días tengan al menos un horario
      for (const dia of Object.keys(horarios)) {
        if (!horarios[dia] || horarios[dia].length === 0) {
          return {
            exito: false,
            error: `El día ${dia} debe tener al menos un horario configurado`
          };
        }
  
        // Validar cada rango horario
        for (const rango of horarios[dia]) {
          if (!rango.horaApertura || !rango.horaCierre) {
            return {
              exito: false,
              error: `Horarios incompletos en ${dia}`
            };
          }
        }
      }
  
      // Si pasa las validaciones, guardar en Firebase
      const guardado = await fbGuardarHorarioInicial(idRestaurante, horarios);
      
      if (!guardado) {
        return {
          exito: false,
          error: 'Error al guardar los horarios'
        };
      }
  
      return { exito: true };
  
    } catch (error) {
      console.error('Error en el servicio de horarios:', error);
      return {
        exito: false,
        error: 'Error inesperado al guardar los horarios'
      };
    }
  };
  
  /**
   * Obtiene los horarios con lógica adicional de negocio
   */
  export const obtenerHorariosActuales = async (idRestaurante: string) => {
    try {
      const horarios = await fbObtenerHorarios(idRestaurante);
      
      if (!horarios) {
        return null;
      }
  
      // Aquí podrías añadir lógica adicional como:
      // - Formatear fechas
      // - Filtrar días festivos pasados
      // - Calcular próximos horarios especiales
      // etc.
  
      return horarios;
  
    } catch (error) {
      console.error('Error al obtener horarios actuales:', error);
      return null;
    }
  };
  
  /**
   * Actualiza los horarios desde el dashboard con validaciones
   */
  export const actualizarHorariosRestaurante = async (
    idRestaurante: string,
    horarios: HorariosSemanales
  ) => {
    try {
      // Validaciones adicionales que puedas necesitar
      const actualizado = await fbActualizarHorarios(idRestaurante, {
        horarioRegular: horarios
      });
  
      return actualizado;
    } catch (error) {
      console.error('Error al actualizar horarios:', error);
      return false;
    }
  };