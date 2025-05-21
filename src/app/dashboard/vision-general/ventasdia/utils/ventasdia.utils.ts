export const calcularTotal = (
    precioBase: number, 
    adicionalesSeleccionados: string[], 
    adicionales: { id: string; precio: number; }[]
  ): number => {
    const precioAdicionales = adicionalesSeleccionados.reduce((total, adicionalId) => {
      const adicional = adicionales.find(a => a.id === adicionalId);
      return total + (adicional?.precio || 0);
    }, 0);
  
    return precioBase + precioAdicionales;
  };
  
  export const formatearPrecio = (precio: number): string => {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  export const obtenerColorInventario = (cantidad: number): string => {
    if (cantidad === 0) return 'text-red-600';
    if (cantidad <= 10) return 'text-amber-600';
    return 'text-green-600';
  };