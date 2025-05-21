// src/app/dashboard/carta/utils/ordenamiento.ts
import type { Producto, Categoria } from '../types/menu.types';

export const ordenarProductos = (
  productos: Producto[],
  criterio: 'nombre' | 'precio' | 'createdAt' | 'updatedAt' = 'nombre',
  orden: 'asc' | 'desc' = 'asc'
): Producto[] => {
  return [...productos].sort((a, b) => {
    let comparacion = 0;
    switch (criterio) {
      case 'nombre':
        comparacion = a.nombre.localeCompare(b.nombre);
        break;
      case 'precio':
        comparacion = a.precio - b.precio;
        break;
      case 'createdAt':
        comparacion = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'updatedAt':
        comparacion = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
    }
    return orden === 'asc' ? comparacion : -comparacion;
  });
};

export const reordenarCategorias = async (
  categorias: Categoria[],
  categoriaId: string,
  nuevaPosicion: number
): Promise<Categoria[]> => {
  const categoriasOrdenadas = [...categorias];
  const indiceActual = categoriasOrdenadas.findIndex(cat => cat.id === categoriaId);
  
  if (indiceActual === -1) return categoriasOrdenadas;
  
  const [categoriaMovida] = categoriasOrdenadas.splice(indiceActual, 1);
  categoriasOrdenadas.splice(nuevaPosicion, 0, categoriaMovida);
  
  return categoriasOrdenadas.map((cat, index) => ({
    ...cat,
    orden: index
  }));
};