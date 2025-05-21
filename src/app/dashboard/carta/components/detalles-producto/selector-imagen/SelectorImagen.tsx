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

// src/app/dashboard/carta/components/detalles-producto/selector-imagen/GaleriaSpoon.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
        <Button variant="outline" size="icon">
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
              transition-all duration-200 hover:ring-2 hover:ring-primary
              ${imagenSeleccionada === imagen.url ? 'ring-2 ring-primary' : ''}
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

// src/app/dashboard/carta/components/detalles-producto/selector-imagen/SubidorImagen.tsx
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubidorImagenProps {
  onUpload: (imageUrl: string) => void;
  imagenPrevia?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSIONS = { width: 400, height: 300 };

export function SubidorImagen({ onUpload, imagenPrevia }: SubidorImagenProps) {
  const [arrastrandoArchivo, setArrastrandoArchivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(imagenPrevia || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validarImagen = async (file: File): Promise<boolean> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato de archivo no soportado. Use JPG, PNG o WebP.');
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError('La imagen no debe superar los 5MB.');
      return false;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
          setError(`La imagen debe ser al menos de ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} píxeles.`);
          resolve(false);
        }
        resolve(true);
      };
    });
  };

  const procesarArchivo = async (file: File) => {
    setError(null);
    
    if (await validarImagen(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrandoArchivo(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await procesarArchivo(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await procesarArchivo(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${arrastrandoArchivo ? 'border-primary bg-primary/5' : 'border-neutral-200'}
          ${preview ? 'border-solid' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrandoArchivo(true);
        }}
        onDragLeave={() => setArrastrandoArchivo(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-48 object-contain mx-auto rounded"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-600">
              Arrastra y suelta una imagen aquí o
            </p>
            <Button
              variant="link"
              className="mt-1"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              selecciona un archivo
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
        />
      </div>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información de requisitos */}
      <div className="text-sm text-neutral-500 space-y-1">
        <p>Requisitos de la imagen:</p>
        <ul className="list-disc list-inside pl-4">
          <li>Formatos soportados: JPG, PNG, WebP</li>
          <li>Tamaño máximo: 5MB</li>
          <li>Dimensiones mínimas: {MIN_DIMENSIONS.width}x{MIN_DIMENSIONS.height}px</li>
          <li>Preferiblemente en formato horizontal</li>
        </ul>
      </div>
    </div>
  );
}