// src/app/dashboard/carta/utils/precio.ts
export const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  };
  
  export const calcularPrecioConOpciones = (
    precioBase: number,
    opcionesSeleccionadas: { precio?: number }[]
  ): number => {
    return opcionesSeleccionadas.reduce(
      (total, opcion) => total + (opcion.precio || 0),
      precioBase
    );
  };