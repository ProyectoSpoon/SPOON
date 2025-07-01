// src/app/dashboard/carta/components/detalles-producto/selector-imagen/types.ts
export interface ImagenGaleria {
  id: string;
  url: string;
  thumbnail: string;
  categoria: string;
  tags: string[];
  dimensiones: {
    ancho: number;
    alto: number;
  };
  tamaño: number;
  formato: string;
  fechaSubida: string;
  favorito: boolean;
}

export interface FiltrosGaleria {
  categoria: string | null;
  orientacion: 'todas' | 'horizontal' | 'vertical' | 'cuadrada';
  ordenar: 'recientes' | 'antiguos' | 'alfabetico' | 'tamaño';
  favoritos: boolean;
}
