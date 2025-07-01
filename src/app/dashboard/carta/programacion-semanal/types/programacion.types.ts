import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: CategoriaMenu;
}

export interface MenuCombinacion {
  id: string;
  entrada: Producto;
  principio: Producto;
  proteina: Producto;
  acompanamiento: Producto[];
  bebida: Producto;
  nombre?: string;
  descripcion?: string;
  precioEspecial?: number;
  cantidad?: number;
  estado?: 'disponible' | 'agotado';
  favorito?: boolean;
  especial?: boolean;
  disponibilidadEspecial?: {
    desde: Date;
    hasta: Date;
  };
}

export interface ProgramacionDia {
  fecha: Date;
  combinaciones: MenuCombinacion[];
  cache?: {
    expira: Date;
    duracion: number;
  };
}

export interface CombinacionProgramada {
  id: string;
  nombre: string;
  descripcion?: string;
  combinacion: MenuCombinacion;
  fecha: Date;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
  prediccionVentas: {
    minimo: number;
    maximo: number;
  };
  tendencia: 'up' | 'down' | 'stable';
}

export interface ProgramacionSemanal {
  dias: Record<string, ProgramacionDia>;
  activa: boolean;
  fechaInicio: Date;
  fechaFin: Date;
}
