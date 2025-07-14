import React from 'react';
import { Soup } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas' },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios' },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas' },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos' },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas' }
];

interface ProductTableProps {
  versionedProductosSeleccionados: VersionedProduct[];
  selectedCategoryTab: string;
  handleAgregarAlMenu: (producto: VersionedProduct) => void;
  handleViewProductDetails: (producto: VersionedProduct) => void;
  handleToggleFavorite: (producto: VersionedProduct) => void;
  isFavorito: (id: string) => boolean;
  favoritosLoading: boolean;
}

export function ProductTable({ 
  versionedProductosSeleccionados, selectedCategoryTab, handleAgregarAlMenu, 
  handleViewProductDetails, handleToggleFavorite, isFavorito, favoritosLoading 
}: ProductTableProps) {
  const productosFiltrados = versionedProductosSeleccionados.filter(
    (producto: VersionedProduct) => producto.categoriaId === selectedCategoryTab
  );

  return (
    <div className="bg-white rounded-lg shadow-sm mx-4">
      <div className="overflow-hidden rounded-lg border border-gray-200" style={{height: '320px', overflow: 'auto'}}>
        {/* Encabezados de la tabla */}
        <div className="grid grid-cols-12 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
          <div className="col-span-2 p-3 text-center">IMAGEN</div>
          <div className="col-span-5 p-3">PRODUCTO</div>
          <div className="col-span-3 p-3 text-center">AGREGAR A MENU DÍA</div>
          <div className="col-span-2 p-3 text-center">ACCIONES</div>
        </div>

        {/* Contenido de la tabla */}
        <div className="divide-y divide-gray-200">
          {productosFiltrados.map((producto: VersionedProduct) => (
            <div key={producto.id} className="grid grid-cols-12 items-center py-2 hover:bg-gray-50">
              {/* Imagen */}
              <div className="col-span-2 flex justify-center">
                <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Soup className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Información del producto */}
              <div className="col-span-5 px-3">
                <div className="font-medium text-sm text-gray-800">{producto.nombre}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</div>
              </div>

              {/* Botón de agregar al menú */}
              <div className="col-span-3 flex justify-center">
                <button
                  className="px-3 py-1 bg-spoon-primary hover:bg-spoon-primary-dark text-white text-xs rounded-md"
                  onClick={() => handleAgregarAlMenu(producto)}
                >
                  Agregar
                </button>
              </div>

              {/* Acciones */}
              <div className="col-span-2 flex justify-center space-x-2">
                <button
                  className="p-1 rounded-md hover:bg-gray-100"
                  onClick={() => handleViewProductDetails(producto)}
                  title="Ver detalles"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${
                    isFavorito(producto.id)
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                  onClick={() => handleToggleFavorite(producto)}
                  title={isFavorito(producto.id)
                    ? "Quitar de favoritos del restaurante"
                    : "Agregar a favoritos del restaurante"
                  }
                  disabled={favoritosLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={
                    isFavorito(producto.id)
                      ? 'currentColor'
                      : 'none'
                  } viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Mensaje si no hay productos en la categoría */}
          {productosFiltrados.length === 0 && versionedProductosSeleccionados.length > 0 && (
            <div className="p-8 text-center text-gray-500">
              <Soup className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">No hay productos en esta categoría</p>
              <p className="text-sm">Selecciona otra categoría o agrega productos a esta sección.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
