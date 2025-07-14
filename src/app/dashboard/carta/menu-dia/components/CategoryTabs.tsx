import React from 'react';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas', enum: CategoriaMenu.ENTRADA },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios', enum: CategoriaMenu.PRINCIPIO },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas', enum: CategoriaMenu.PROTEINA },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos', enum: CategoriaMenu.ACOMPANAMIENTO },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas', enum: CategoriaMenu.BEBIDA }
];

interface CategoryTabsProps {
  selectedCategoryTab: string;
  setSelectedCategoryTab: (id: string) => void;
  handleCategoriaSeleccionada: (id: string) => void;
}

export function CategoryTabs({ selectedCategoryTab, setSelectedCategoryTab, handleCategoriaSeleccionada }: CategoryTabsProps) {
  return (
    <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
      <div className="flex space-x-4 overflow-x-auto py-2 px-4 w-full">
        {CATEGORIAS_MENU.map((categoria: any) => (
          <button
            key={categoria.id}
            className={`px-3 py-1 text-sm ${selectedCategoryTab === categoria.id
              ? 'text-spoon-primary border-b-2 border-spoon-primary'
              : 'text-gray-700 hover:text-spoon-primary'}`}
            onClick={() => {
              setSelectedCategoryTab(categoria.id);
              handleCategoriaSeleccionada(categoria.id);
            }}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
