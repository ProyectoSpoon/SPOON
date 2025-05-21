'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/Popover';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

// Colores predefinidos para el selector
const COLORES_PREDEFINIDOS = [
  '#F4821F', // Naranja (color principal de Spoon)
  '#E74C3C', // Rojo
  '#3498DB', // Azul
  '#2ECC71', // Verde
  '#9B59B6', // Púrpura
  '#F1C40F', // Amarillo
  '#1ABC9C', // Turquesa
  '#34495E', // Azul oscuro
  '#7F8C8D', // Gris
  '#D35400', // Naranja oscuro
  '#C0392B', // Rojo oscuro
  '#2980B9', // Azul oscuro
  '#27AE60', // Verde oscuro
  '#8E44AD', // Púrpura oscuro
  '#F39C12', // Amarillo oscuro
  '#16A085', // Turquesa oscuro
  '#2C3E50', // Azul muy oscuro
  '#BDC3C7', // Gris claro
];

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onSelectColor(color);
  };

  const handleSelectPredefinedColor = (color: string) => {
    onSelectColor(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between items-center"
        >
          <span>Color</span>
          <div 
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Color personalizado</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={handleColorChange}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleColorChange}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Colores predefinidos</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORES_PREDEFINIDOS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border ${
                    color === selectedColor ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleSelectPredefinedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
