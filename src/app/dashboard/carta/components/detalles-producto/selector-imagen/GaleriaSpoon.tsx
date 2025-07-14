// src/app/dashboard/carta/components/detalles-producto/selector-imagen/GaleriaSpoon.tsx
import { useState } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Search, Filter } from 'lucide-react';

interface GaleriaSpoonProps {
  onSelect: (imageUrl: string) => void;
  imagenSeleccionada?: string;
}

// Simulación de imágenes de la galería
const MOCK_IMAGES = [
  { id: '1', url: '/api/placeholder/400/300', categoria: 'comida', tags: ['pizza', 'italiano'] },
  { id: '2', url: '/api/placeholder/400/300', categoria: 'bebidas', tags: ['coctel', 'bebidas'] },
  { id: '3', url: '/api/placeholder/400/300', categoria: 'postres', tags: ['pastel', 'dulce'] },
  // Añadir más imágenes según necesites
];

export function GaleriaSpoon({ onSelect, imagenSeleccionada }: GaleriaSpoonProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);

  const imagenesFiltradas = MOCK_IMAGES.filter(img => {
    const matchBusqueda = img.tags.some(tag => 
      tag.toLowerCase().includes(busqueda.toLowerCase())
    );
    const matchCategoria = !categoria || img.categoria === categoria;
    return matchBusqueda && matchCategoria;
  });

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por etiquetas..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
        {imagenesFiltradas.map((imagen) => (
          <div
            key={imagen.id}
            className={`
              relative aspect-square rounded-lg overflow-hidden cursor-pointer
              transition-all duration-200 hover:ring-2 hover:ring-blue-500
              ${imagenSeleccionada === imagen.url ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => onSelect(imagen.url)}
          >
            <img
              src={imagen.url}
              alt={`Galería ${imagen.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex flex-wrap gap-1">
                  {imagen.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {imagenesFiltradas.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No se encontraron imágenes que coincidan con tu búsqueda
        </div>
      )}
    </div>
  );
}


























