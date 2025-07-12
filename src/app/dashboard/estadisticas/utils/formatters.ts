/**
 * Formateadores para valores monetarios, porcentajes y fechas
 */

/**
 * Formatea un valor numérico como moneda en pesos colombianos
 * @param valor - Valor numérico a formatear
 * @param decimales - Número de decimales a mostrar (por defecto 0)
 */
export const formatearMoneda = (valor: number, decimales: number = 0): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(valor);
  };
  
  /**
   * Formatea un valor decimal como porcentaje
   * @param valor - Valor decimal a formatear (ej: 0.15 para 15%)
   * @param decimales - Número de decimales a mostrar (por defecto 1)
   */
  export const formatearPorcentaje = (valor: number, decimales: number = 1): string => {
    return `${(valor * 100).toFixed(decimales)}%`;
  };
  
  /**
   * Formatea una fecha en formato corto
   * @param fecha - Fecha a formatear
   */
  export const formatearFechaCorta = (fecha: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(fecha);
  };
  
  /**
   * Formatea una hora en formato 12 horas
   * @param hora - String de hora en formato 24h (ej: "14:30")
   */
  export const formatearHora12h = (hora: string): string => {
    const [horas, minutos] = hora.split(':').map(Number);
    const periodo = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas % 12 || 12;
    return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  };
  
  /**
   * Formatea un número grande con sufijos K, M, B
   * @param numero - Número a formatear
   */
  export const formatearNumeroGrande = (numero: number): string => {
    if (numero >= 1e9) {
      return `${(numero / 1e9).toFixed(1)}B`;
    }
    if (numero >= 1e6) {
      return `${(numero / 1e6).toFixed(1)}M`;
    }
    if (numero >= 1e3) {
      return `${(numero / 1e3).toFixed(1)}K`;
    }
    return numero.toString();
  };
  
  /**
   * Formatea un periodo de tiempo para mostrar
   * @param periodo - Periodo de tiempo a formatear
   */
  export const formatearPeriodo = (inicio: Date, fin: Date): string => {
    const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'long' });
    const formatoCorto = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
    
    if (inicio.getMonth() === fin.getMonth() && inicio.getFullYear() === fin.getFullYear()) {
      return formatoMes.format(inicio);
    }
    
    return `${formatoCorto.format(inicio)} - ${formatoCorto.format(fin)}`;
  };
