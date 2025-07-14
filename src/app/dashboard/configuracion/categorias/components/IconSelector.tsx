'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/Popover';
import { Input } from '@/shared/components/ui/Input';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

// Lista de iconos disponibles (nombres de los iconos de Lucide)
const ICONOS_DISPONIBLES = [
  'utensils', 'coffee', 'beer', 'wine', 'pizza', 'sandwich', 'salad', 
  'soup', 'beef', 'fish', 'egg', 'cookie', 'cake', 'icecream', 'fruit', 
  'carrot', 'cheese', 'bread', 'milk', 'cocktail', 'drumstick', 'popcorn',
  'restaurant', 'chef', 'menu', 'store', 'shop', 'home', 'building', 
  'star', 'heart', 'circle', 'square', 'triangle', 'hexagon', 'diamond',
  'sun', 'moon', 'cloud', 'umbrella', 'flame', 'droplet', 'leaf',
  'car', 'truck', 'bus', 'bicycle', 'train', 'plane', 'ship',
  'phone', 'laptop', 'tv', 'smartphone', 'camera', 'music', 'video',
  'book', 'file', 'folder', 'mail', 'message', 'bell', 'calendar',
  'map', 'compass', 'globe', 'flag', 'tag', 'gift', 'award',
  'users', 'user', 'userPlus', 'userMinus', 'userCheck', 'userX',
  'settings', 'tool', 'wrench', 'key', 'lock', 'unlock', 'shield',
  'activity', 'barChart', 'pieChart', 'lineChart', 'trendingUp', 'trendingDown',
  'dollar', 'percent', 'creditCard', 'shoppingCart', 'shoppingBag', 'tag',
  'check', 'x', 'plus', 'minus', 'info', 'alert', 'helpCircle',
  'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'chevronUp', 'chevronDown'
];

export function IconSelector({ selectedIcon, onSelectIcon }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar iconos según el término de búsqueda
  const iconosFiltrados = searchTerm.trim() === ''
    ? ICONOS_DISPONIBLES
    : ICONOS_DISPONIBLES.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Renderizar el icono seleccionado
  const renderSelectedIcon = () => {
    // Intentar obtener el componente de icono de Lucide
    const IconComponent = (LucideIcons as any)[
      selectedIcon.charAt(0).toUpperCase() + selectedIcon.slice(1)
    ];

    if (IconComponent) {
      return <IconComponent className="h-5 w-5" />;
    }

    // Si no se encuentra el icono, mostrar un texto
    return <span>{selectedIcon.charAt(0).toUpperCase()}</span>;
  };

  // Renderizar un icono de la lista
  const renderIcon = (iconName: string) => {
    // Intentar obtener el componente de icono de Lucide
    const IconComponent = (LucideIcons as any)[
      iconName.charAt(0).toUpperCase() + iconName.slice(1)
    ];

    if (IconComponent) {
      return <IconComponent className="h-5 w-5" />;
    }

    // Si no se encuentra el icono, mostrar un texto
    return <span>{iconName.charAt(0).toUpperCase()}</span>;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between items-center"
        >
          <span>Icono</span>
          <div className="w-6 h-6 flex items-center justify-center">
            {renderSelectedIcon()}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar icono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="h-64 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2">
              {iconosFiltrados.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  className={`w-8 h-8 rounded flex items-center justify-center border ${
                    iconName === selectedIcon 
                      ? 'border-spoon-primary bg-spoon-primary-light' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSelectIcon(iconName);
                    setIsOpen(false);
                  }}
                  title={iconName}
                >
                  {renderIcon(iconName)}
                </button>
              ))}
              
              {iconosFiltrados.length === 0 && (
                <div className="col-span-6 py-4 text-center text-gray-500 text-sm">
                  No se encontraron iconos
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}



























