'use client';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { ColorPicker } from './ColorPicker';
import { IconSelector } from './IconSelector';

interface FormularioEdicionProps {
  modoEdicion: {
    tipo: boolean;
    categoria: boolean;
    subcategoria: boolean;
    id: string | null;
  };
  nuevoElemento: {
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
  };
  onChangeNombre: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDescripcion: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIcono: (icono: string) => void;
  onChangeColor: (color: string) => void;
  onCancelar: () => void;
  onGuardar: () => void;
}

export function FormularioEdicion({
  modoEdicion,
  nuevoElemento,
  onChangeNombre,
  onChangeDescripcion,
  onChangeIcono,
  onChangeColor,
  onCancelar,
  onGuardar
}: FormularioEdicionProps) {
  if (!(modoEdicion.tipo || modoEdicion.categoria || modoEdicion.subcategoria)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {modoEdicion.tipo && (modoEdicion.id ? 'Editar Tipo de Restaurante' : 'Nuevo Tipo de Restaurante')}
            {modoEdicion.categoria && (modoEdicion.id ? 'Editar Categoría' : 'Nueva Categoría')}
            {modoEdicion.subcategoria && (modoEdicion.id ? 'Editar Subcategoría' : 'Nueva Subcategoría')}
          </CardTitle>
          <CardDescription>
            {modoEdicion.tipo && 'Configura los detalles del tipo de restaurante'}
            {modoEdicion.categoria && 'Configura los detalles de la categoría'}
            {modoEdicion.subcategoria && 'Configura los detalles de la subcategoría'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="nombre"
              value={nuevoElemento.nombre}
              onChange={onChangeNombre}
              placeholder="Ingrese un nombre"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </label>
            <Input
              id="descripcion"
              value={nuevoElemento.descripcion}
              onChange={onChangeDescripcion}
              placeholder="Ingrese una descripción (opcional)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Color
            </label>
            <ColorPicker 
              selectedColor={nuevoElemento.color} 
              onSelectColor={onChangeColor} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Icono
            </label>
            <IconSelector 
              selectedIcon={nuevoElemento.icono} 
              onSelectIcon={onChangeIcono} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onCancelar}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-[#F4821F] hover:bg-[#E67812] text-white"
            onClick={onGuardar}
          >
            Guardar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
