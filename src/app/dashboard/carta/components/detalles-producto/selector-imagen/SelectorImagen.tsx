// src/app/dashboard/carta/components/detalles-producto/selector-imagen/SelectorImagen.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';
import { GaleriaSpoon } from './GaleriaSpoon';
import { SubidorImagen } from './SubidorImagen';

interface SelectorImagenProps {
  onImageSelect: (imageUrl: string) => void;
  imagenActual?: string;
}

export function SelectorImagen({ onImageSelect, imagenActual }: SelectorImagenProps) {
  const [tab, setTab] = useState<'galeria' | 'subir'>('galeria');

  return (
    <div className="bg-white rounded-lg border p-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'galeria' | 'subir')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="galeria">Galería Spoon</TabsTrigger>
          <TabsTrigger value="subir">Subir imagen</TabsTrigger>
        </TabsList>
        <TabsContent value="galeria">
          <GaleriaSpoon 
            onSelect={onImageSelect}
            imagenSeleccionada={imagenActual}
          />
        </TabsContent>
        <TabsContent value="subir">
          <SubidorImagen 
            onUpload={onImageSelect}
            imagenPrevia={imagenActual}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


























