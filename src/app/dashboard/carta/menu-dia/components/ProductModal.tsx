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

interface ProductModalProps {
  showProductModal: boolean;
  selectedProduct: VersionedProduct | null;
  setShowProductModal: (show: boolean) => void;
  handleAgregarAlMenu: (producto: VersionedProduct) => void;
  handleToggleFavorite: (producto: VersionedProduct) => void;
  isFavorito: (id: string) => boolean;
  favoritosLoading: boolean;
}

export function ProductModal({ 
  showProductModal, selectedProduct, setShowProductModal, handleAgregarAlMenu, 
  handleToggleFavorite, isFavorito, favoritosLoading 
}: ProductModalProps) {
  if (!showProductModal || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{selectedProduct.nombre}</h2>
          <button
            onClick={() => setShowProductModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-center items-center">
            {selectedProduct.imagen ? (
              <img
                src={selectedProduct.imagen}
                alt={selectedProduct.nombre}
                className="max-h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="h-64 w-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <Soup className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Detalles</h3>
            <p className="text-gray-700 mb-4">{selectedProduct.descripcion}</p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{
                  CATEGORIAS_MENU.find((c: any) => c.id === selectedProduct.categoriaId)?.nombre || 'No especificada'
                }</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  selectedProduct.stock.status === 'in_stock' ? 'text-green-600' :
                  selectedProduct.stock.status === 'low_stock' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {selectedProduct.stock.status === 'in_stock' ? 'Disponible' :
                   selectedProduct.stock.status === 'low_stock' ? 'Stock bajo' :
                   'No disponible'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad disponible:</span>
                <span className="font-medium">{selectedProduct.stock.currentQuantity}</span>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                className="px-4 py-2 bg-spoon-primary hover:bg-spoon-primary-dark text-white rounded-md flex-1"
                onClick={() => {
                  handleAgregarAlMenu(selectedProduct);
                  setShowProductModal(false);
                }}
              >
                Agregar al menú
              </button>

              <button
                className={`px-4 py-2 rounded-md flex-1 transition-colors ${
                  isFavorito(selectedProduct.id)
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                onClick={() => handleToggleFavorite(selectedProduct)}
                disabled={favoritosLoading}
              >
                {isFavorito(selectedProduct.id)
                  ? '❤️ Quitar de favoritos del restaurante'
                  : '🤍 Agregar a favoritos del restaurante'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
