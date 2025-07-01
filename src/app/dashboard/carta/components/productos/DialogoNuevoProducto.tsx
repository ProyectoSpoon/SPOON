import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';

interface ProductoNuevo {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoriaId: string;
}

interface ProductoExistente extends ProductoNuevo {
  id: string;
}

interface ErroresForm {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  imagen?: string;
}

interface DialogoNuevoProductoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (producto: ProductoNuevo | ProductoExistente) => void;
  categoriaId: string;
  productoEditar?: ProductoExistente;
}

const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SIZE_ERROR: 'La imagen no debe superar los 5MB',
  TYPE_ERROR: 'Formato no soportado. Use JPG, PNG o WebP'
};

export function DialogoNuevoProducto({
  open,
  onOpenChange,
  onSubmit,
  categoriaId,
  productoEditar
}: DialogoNuevoProductoProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [producto, setProducto] = useState<ProductoNuevo>({
    nombre: productoEditar?.nombre || '',
    descripcion: productoEditar?.descripcion || '',
    precio: productoEditar?.precio || 0,
    imagen: productoEditar?.imagen,
    categoriaId,
  });

  const [errores, setErrores] = useState<ErroresForm>({});
  const [modoImagen, setModoImagen] = useState<'galeria' | 'subir'>('subir');
  const [imagenPreview, setImagenPreview] = useState<string | null>(
    productoEditar?.imagen || null
  );

  const validarForm = (): boolean => {
    const nuevosErrores: ErroresForm = {};

    if (!producto.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!producto.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (producto.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (validarForm()) {
      const productoFinal = productoEditar
        ? { ...producto, id: productoEditar.id }
        : producto;
      
      onSubmit(productoFinal);
      limpiarFormulario();
      onOpenChange(false);
    }
  };

  const limpiarFormulario = (): void => {
    setProducto({
      nombre: '',
      descripcion: '',
      precio: 0,
      imagen: undefined,
      categoriaId,
    });
    setImagenPreview(null);
    setErrores({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (file: File): void => {
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      setErrores(prev => ({ ...prev, imagen: IMAGE_CONFIG.SIZE_ERROR }));
      return;
    }

    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      setErrores(prev => ({ ...prev, imagen: IMAGE_CONFIG.TYPE_ERROR }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagenPreview(base64String);
      setProducto(prev => ({ ...prev, imagen: base64String }));
      setErrores(prev => ({ ...prev, imagen: undefined }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          limpiarFormulario();
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {productoEditar ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription>
            Complete los detalles del producto a continuación
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">
                  Nombre del producto
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={producto.nombre}
                  onChange={(e) => {
                    setProducto(prev => ({ ...prev, nombre: e.target.value }));
                    setErrores(prev => ({ ...prev, nombre: '' }));
                  }}
                  className={errores.nombre ? 'border-red-500' : ''}
                  placeholder="Ej: Pizza Margarita"
                />
                {errores.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">
                  Descripción
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  value={producto.descripcion}
                  onChange={(e) => {
                    setProducto(prev => ({ ...prev, descripcion: e.target.value }));
                    setErrores(prev => ({ ...prev, descripcion: '' }));
                  }}
                  className={errores.descripcion ? 'border-red-500' : ''}
                  placeholder="Describe tu producto..."
                  rows={3}
                />
                {errores.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{errores.descripcion}</p>
                )}
              </div>

              <div>
                <Label htmlFor="precio">
                  Precio
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={producto.precio}
                  onChange={(e) => {
                    setProducto(prev => ({ ...prev, precio: parseFloat(e.target.value) }));
                    setErrores(prev => ({ ...prev, precio: '' }));
                  }}
                  className={errores.precio ? 'border-red-500' : ''}
                />
                {errores.precio && (
                  <p className="text-red-500 text-sm mt-1">{errores.precio}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Imagen del producto</Label>
                <Tabs 
                  value={modoImagen} 
                  onValueChange={(v) => setModoImagen(v as 'galeria' | 'subir')}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="galeria">Galería Spoon</TabsTrigger>
                    <TabsTrigger value="subir">Subir imagen</TabsTrigger>
                  </TabsList>
                  <TabsContent value="galeria" className="border rounded-lg p-4">
                    <div className="text-center text-neutral-500">
                      Galería de imágenes en desarrollo
                    </div>
                  </TabsContent>
                  <TabsContent value="subir" className="border rounded-lg p-4">
                    <div 
                      className="border-2 border-dashed rounded-lg p-4 text-center relative"
                    >
                      {imagenPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagenPreview}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setImagenPreview(null);
                              setProducto(prev => ({ ...prev, imagen: undefined }));
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
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer focus:outline-none"
                          onClick={handleImageClick}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleImageClick(e as any);
                            }
                          }}
                        >
                          <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                          <p className="text-sm text-neutral-600 mt-2">
                            Arrastra y suelta o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-neutral-500">
                            PNG, JPG hasta 5MB
                          </p>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={IMAGE_CONFIG.ALLOWED_TYPES.join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                limpiarFormulario();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {productoEditar ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
