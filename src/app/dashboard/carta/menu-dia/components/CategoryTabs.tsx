import React from 'react';

// ✅ CORREGIDO: IDs reales de la base de datos PostgreSQL
const CATEGORIAS_MENU = [
  { id: '494fbac6-59ed-42af-af24-039298ba16b6', nombre: 'Entradas' },    // Real de BD
  { id: 'de7f4731-3eb3-4d41-b830-d35e5125f4a3', nombre: 'Principios' }, // Real de BD  
  { id: '299b1ba0-0678-4e0e-ba53-90e5d95e5543', nombre: 'Proteínas' },  // Real de BD
  { id: '8b0751ae-1332-409e-a710-f229be0b9758', nombre: 'Acompañamientos' }, // Real de BD
  { id: 'c77ffc73-b65a-4f03-adb1-810443e61799', nombre: 'Bebidas' },    // Real de BD
  { id: 'eac729e6-e216-4e45-9d6f-2698c757b096', nombre: 'ALMUERZOS' }   // Real de BD
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
            className={`px-3 py-1 text-sm whitespace-nowrap ${selectedCategoryTab === categoria.id
              ? 'text-spoon-primary border-b-2 border-spoon-primary'
              : 'text-gray-700 hover:text-spoon-primary'}`}
            onClick={() => {
              console.log('📂 Categoría seleccionada:', categoria.nombre, 'ID:', categoria.id); // Debug
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
