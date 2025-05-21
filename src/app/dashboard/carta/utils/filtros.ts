// src/app/dashboard/carta/utils/filtros.ts
interface FiltrosProducto {
    busqueda?: string;
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    alergenos?: string[];
    disponible?: boolean;
    estado?: 'activo' | 'inactivo';
  }
  
  export const filtrarProductos = (
    productos: Producto[],
    filtros: FiltrosProducto
  ): Producto[] => {
    return productos.filter(producto => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const coincide = producto.nombre.toLowerCase().includes(busquedaLower) ||
          producto.descripcion.toLowerCase().includes(busquedaLower);
        if (!coincide) return false;
      }
  
      // Filtro por categoría
      if (filtros.categoria && producto.categoriaId !== filtros.categoria) {
        return false;
      }
  
      // Filtro por rango de precios
      if (filtros.precioMin !== undefined && producto.precio < filtros.precioMin) {
        return false;
      }
      if (filtros.precioMax !== undefined && producto.precio > filtros.precioMax) {
        return false;
      }
  
      // Filtro por alérgenos
      if (filtros.alergenos?.length) {
        const tieneAlergenos = filtros.alergenos.some(
          alergeno => producto.alergenos?.includes(alergeno)
        );
        if (!tieneAlergenos) return false;
      }
  
      // Filtro por disponibilidad
      if (filtros.disponible !== undefined && producto.disponible !== filtros.disponible) {
        return false;
      }
  
      // Filtro por estado
      if (filtros.estado && producto.estado !== filtros.estado) {
        return false;
      }
  
      return true;
    });
  };