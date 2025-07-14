import React from 'react';
import { toast } from 'sonner';
import { convertToVersionedProduct } from '../utils/menu-dia.utils';

const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas' },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios' },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas' },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos' },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas' }
];

interface FavoritesSectionProps {
  showFavorites: boolean;
  favoritos: any[];
  favoritosLoading: boolean;
  handleAgregarAlMenu: (producto: any) => void;
  removeFavorito: (id: string) => Promise<void>;
}

export function FavoritesSection({ showFavorites, favoritos, favoritosLoading, handleAgregarAlMenu, removeFavorito }: FavoritesSectionProps) {
  if (!showFavorites) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-4">
      <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
        ❤️ Productos Favoritos del Restaurante
        {favoritosLoading && <span className="ml-2 text-xs">(Cargando...)</span>}
      </h3>
      {favoritos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {favoritos.map((favorito: any) => (
            <div key={favorito.id} className="bg-white border border-yellow-200 rounded-lg p-3 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-800 block truncate">
                  {favorito.product_name || 'Producto sin nombre'}
                </span>
                <span className="text-xs text-gray-500">
                  {CATEGORIAS_MENU.find((c: any) => c.id === favorito.category_id)?.nombre || 'Categoría'}
                </span>
                <span className="text-xs text-gray-400 block">
                  Agregado por: {favorito.created_by_name || 'Usuario desconocido'}
                </span>
              </div>
              <div className="flex space-x-2 ml-2">
                <button
                  className="text-spoon-primary hover:text-spoon-primary-dark p-1"
                  onClick={() => {
                    console.log('➕ Agregando favorito al menú:', favorito.product_name);
                    const producto = convertToVersionedProduct({
                      id: favorito.product_id,
                      nombre: favorito.product_name || '',
                      descripcion: favorito.product_description || '',
                      precio: favorito.product_price || 0,
                      categoriaId: favorito.category_id || '',
                      imagen: favorito.product_image,
                      currentVersion: 1.0,
                      stock: { currentQuantity: 0, minQuantity: 0, maxQuantity: 0, status: 'in_stock', lastUpdated: new Date() },
                      status: 'active',
                      priceHistory: [],
                      versions: [],
                      metadata: { createdAt: new Date(), createdBy: 'unknown', lastModified: new Date(), lastModifiedBy: 'unknown' },
                      esFavorito: true,
                      esEspecial: false
                    });
                    handleAgregarAlMenu(producto);
                  }}
                  title="Agregar al menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  className="text-red-500 hover:text-red-600 p-1"
                  onClick={async () => {
                    console.log('❌ Eliminando favorito desde la sección:', favorito.product_name);
                    try {
                      await removeFavorito(favorito.product_id);
                      toast.success(`${favorito.product_name} eliminado de favoritos del restaurante`);
                    } catch (error) {
                      toast.error('Error al eliminar favorito');
                    }
                  }}
                  title="Quitar de favoritos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-yellow-700 text-sm">No hay productos en favoritos del restaurante</p>
          <p className="text-yellow-600 text-xs mt-1">Haz clic en el ❤️ de cualquier producto para agregarlo a favoritos</p>
        </div>
      )}
    </div>
  );
}
