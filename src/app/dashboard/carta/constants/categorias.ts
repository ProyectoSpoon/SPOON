// app/dashboard/carta/constants/categorias.ts
// Constantes actualizadas con los UUIDs reales de PostgreSQL

export const CategoriaMenu = {
  ENTRADA: 'b4e792ba-b00d-4348-b9e3-f34992315c23',
  PRINCIPIO: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', 
  PROTEINA: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3',
  ACOMPANAMIENTO: 'a272bc20-464c-443f-9283-4b5e7bfb71cf',
  BEBIDA: '6feba136-57dc-4448-8357-6f5533177cfd'
} as const;

export const CategoriaNombres = {
  [CategoriaMenu.ENTRADA]: 'Entradas',
  [CategoriaMenu.PRINCIPIO]: 'Principios',
  [CategoriaMenu.PROTEINA]: 'Proteinas',
  [CategoriaMenu.ACOMPANAMIENTO]: 'Acompañamientos',
  [CategoriaMenu.BEBIDA]: 'Bebidas'
} as const;

export const CategoriaColores = {
  [CategoriaMenu.ENTRADA]: '#FF6B35',
  [CategoriaMenu.PRINCIPIO]: '#4ECDC4',
  [CategoriaMenu.PROTEINA]: '#45B7D1',
  [CategoriaMenu.ACOMPANAMIENTO]: '#FFEAA7',
  [CategoriaMenu.BEBIDA]: '#96CEB4'
} as const;

// Tipos para TypeScript
export type CategoriaId = typeof CategoriaMenu[keyof typeof CategoriaMenu];

// ID del restaurante real
export const RESTAURANTE_ID = '4073a4ad-b275-4e17-b197-844881f0319e';