/**
 * Funciones de cálculos estadísticos para el análisis de datos
 */

/**
 * Calcula el crecimiento porcentual entre dos valores
 * @param valorActual - Valor actual
 * @param valorAnterior - Valor anterior
 */
export const calcularCrecimiento = (valorActual: number, valorAnterior: number): number => {
    if (valorAnterior === 0) return 0;
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  };
  
  /**
   * Calcula el promedio de un array de números
   * @param valores - Array de números
   */
  export const calcularPromedio = (valores: number[]): number => {
    if (valores.length === 0) return 0;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  };
  
  /**
   * Calcula la mediana de un array de números
   * @param valores - Array de números
   */
  export const calcularMediana = (valores: number[]): number => {
    if (valores.length === 0) return 0;
    
    const ordenados = [...valores].sort((a, b) => a - b);
    const medio = Math.floor(ordenados.length / 2);
    
    if (ordenados.length % 2 === 0) {
      return (ordenados[medio - 1] + ordenados[medio]) / 2;
    }
    return ordenados[medio];
  };
  
  /**
   * Calcula el margen de ganancia
   * @param precio - Precio de venta
   * @param costo - Costo del producto
   */
  export const calcularMargen = (precio: number, costo: number): number => {
    if (precio === 0) return 0;
    return ((precio - costo) / precio) * 100;
  };
  
  /**
   * Calcula el ranking de elementos basado en una propiedad numérica
   * @param items - Array de items a rankear
   * @param propiedad - Propiedad numérica para rankear
   */
  export const calcularRanking = <T>(
    items: T[], 
    propiedad: keyof T
  ): Array<T & { ranking: number }> => {
    return [...items]
      .sort((a, b) => (b[propiedad] as number) - (a[propiedad] as number))
      .map((item, index) => ({ ...item, ranking: index + 1 }));
  };
  
  /**
   * Identifica valores atípicos usando el método IQR
   * @param valores - Array de números
   * @param multiplicador - Multiplicador para el rango (por defecto 1.5)
   */
  export const identificarAtipicos = (
    valores: number[], 
    multiplicador: number = 1.5
  ): number[] => {
    const ordenados = [...valores].sort((a, b) => a - b);
    const q1 = ordenados[Math.floor(ordenados.length * 0.25)];
    const q3 = ordenados[Math.floor(ordenados.length * 0.75)];
    const iqr = q3 - q1;
    
    const min = q1 - multiplicador * iqr;
    const max = q3 + multiplicador * iqr;
    
    return valores.filter(v => v < min || v > max);
  };
  
  /**
   * Agrupa y suma valores por una propiedad
   * @param datos - Array de objetos
   * @param propiedadGrupo - Propiedad para agrupar
   * @param propiedadSuma - Propiedad para sumar
   */
  export const agruparYSumar = <T extends Record<string, any>>(
    datos: T[],
    propiedadGrupo: keyof T,
    propiedadSuma: keyof T
  ): Record<string, number> => {
    return datos.reduce((acc, item) => {
      const grupo = item[propiedadGrupo] as string;
      const valor = item[propiedadSuma] as number;
      acc[grupo] = (acc[grupo] || 0) + valor;
      return acc;
    }, {} as Record<string, number>);
  };
  
  /**
   * Calcula la tendencia usando regresión lineal simple
   * @param datos - Array de puntos [x, y]
   */
  export const calcularTendencia = (datos: [number, number][]): {
    pendiente: number;
    intercepto: number;
  } => {
    const n = datos.length;
    if (n < 2) return { pendiente: 0, intercepto: 0 };
  
    const sumX = datos.reduce((sum, [x]) => sum + x, 0);
    const sumY = datos.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = datos.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumXX = datos.reduce((sum, [x]) => sum + x * x, 0);
  
    const pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;
  
    return { pendiente, intercepto };
  };
