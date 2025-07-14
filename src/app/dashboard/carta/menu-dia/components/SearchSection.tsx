import React from 'react';
import { Search, Soup } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

const CATEGORIAS_MENU = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas' },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios' },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas' },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos' },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas' }
];

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchSuggestions: VersionedProduct[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSelectSuggestion: (producto: VersionedProduct) => void;
  handleAgregarAlMenu: (producto: VersionedProduct) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  favoritos: any[];
  favoritosLoading: boolean;
}

// ✅ OPTIMIZACIÓN 1: Componente memoizado para sugerencias individuales
const SuggestionItem = React.memo(({ 
  producto, 
  handleSelectSuggestion, 
  handleAgregarAlMenu, 
  setShowSuggestions 
}: {
  producto: VersionedProduct;
  handleSelectSuggestion: (producto: VersionedProduct) => void;
  handleAgregarAlMenu: (producto: VersionedProduct) => void;
  setShowSuggestions: (show: boolean) => void;
}) => {
  // ✅ OPTIMIZACIÓN 2: Callbacks memoizados
  const onSelect = React.useCallback(() => {
    handleSelectSuggestion(producto);
  }, [handleSelectSuggestion, producto]);

  const onAgregar = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleAgregarAlMenu(producto);
    setShowSuggestions(false);
  }, [handleAgregarAlMenu, producto, setShowSuggestions]);

  // ✅ OPTIMIZACIÓN 3: Memoizar cálculos
  const categoria = React.useMemo(() => 
    CATEGORIAS_MENU.find((c: any) => c.id === producto.categoriaId)?.nombre || 'Categoría',
    [producto.categoriaId]
  );

  const statusColor = React.useMemo(() => {
    switch (producto.stock.status) {
      case 'in_stock': return 'text-green-600';
      case 'low_stock': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  }, [producto.stock.status]);

  const statusText = React.useMemo(() => {
    switch (producto.stock.status) {
      case 'in_stock': return 'Disponible';
      case 'low_stock': return 'Stock bajo';
      default: return 'No disponible';
    }
  }, [producto.stock.status]);

  return (
    <div
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Soup className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {producto.nombre}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {categoria}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {producto.descripcion}
          </p>

          <div className="mt-2 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className={statusColor}>{statusText}</span>
            </div>
            <button
              className="text-xs bg-spoon-primary hover:bg-spoon-primary-dark text-white px-2 py-1 rounded transition-colors"
              onClick={onAgregar}
            >
              Agregar al menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SuggestionItem.displayName = 'SuggestionItem';

// ✅ OPTIMIZACIÓN 4: Componente principal memoizado
export const SearchSection = React.memo(({ 
  searchTerm, setSearchTerm, searchSuggestions, showSuggestions, setShowSuggestions,
  handleSelectSuggestion, handleAgregarAlMenu, showFavorites, setShowFavorites,
  favoritos, favoritosLoading
}: SearchSectionProps) => {
  // ✅ OPTIMIZACIÓN 5: Debounce input para reducir renders
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 200); // Debounce de 200ms
    
    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  // ✅ OPTIMIZACIÓN 6: Callbacks memoizados
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  const toggleFavorites = React.useCallback(() => {
    setShowFavorites(!showFavorites);
  }, [setShowFavorites, showFavorites]);

  // ✅ OPTIMIZACIÓN 7: Memoizar contador de favoritos
  const favoritosCount = React.useMemo(() => favoritos.length, [favoritos.length]);

  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-4">
      <button
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
          showFavorites
            ? 'bg-spoon-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={toggleFavorites}
        disabled={favoritosLoading}
      >
        {showFavorites ? '❤️ Ocultar favoritos' : '🤍 Mostrar favoritos'}
        {favoritosCount > 0 && (
          <span className={`absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
            showFavorites
              ? 'bg-white text-spoon-primary'
              : 'bg-red-500 text-white'
          }`}>
            {favoritosCount}
          </span>
        )}
      </button>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar producto"
          value={localSearchTerm}
          onChange={handleInputChange}
          className="pl-3 pr-10 py-2 border border-gray-200 rounded-md w-64 text-sm transition-colors focus:border-spoon-primary focus:ring-1 focus:ring-spoon-primary"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map((producto: VersionedProduct) => (
                <SuggestionItem
                  key={producto.id}
                  producto={producto}
                  handleSelectSuggestion={handleSelectSuggestion}
                  handleAgregarAlMenu={handleAgregarAlMenu}
                  setShowSuggestions={setShowSuggestions}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SearchSection.displayName = 'SearchSection';
