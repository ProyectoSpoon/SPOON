// src/app/dashboard/carta/constants/categorias.ts

export interface CategoriaBase {
    id: string;
    nombre: string;
    
    orden: number;
  }
  
  export const CATEGORIAS_FIJAS: CategoriaBase[] = [
    {
      id: 'entrada',
      nombre: 'Entrada',
      orden: 1
    },
    {
      id: 'principio',
      nombre: 'Principio',
      orden: 2
    },
    {
      id: 'proteina',
      nombre: 'Proteína',
      orden: 3
    },
    {
      id: 'acompanamientos',
      nombre: 'Acompañamientos',
      orden: 4
    },
    {
      id: 'bebida',
      nombre: 'Bebida',
      orden: 5
    }
  ];