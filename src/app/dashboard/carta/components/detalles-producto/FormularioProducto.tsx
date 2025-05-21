// src/app/dashboard/carta/components/detalles-producto/FormularioProducto.tsx
import { useState, useEffect } from 'react';
import { Clock, Save, Trash, ImagePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Switch } from '@/shared/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';
import { cn } from '@/lib/utils';

// Importamos los componentes personalizados con error handling
import { Input, Textarea } from '@/app/dashboard/carta/components/ui/form-fields';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/Alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/Alert-Dialog/Alert-dialog';

interface ProductoDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoriaId: string;
  restriccionEdad: boolean;
  estado: 'activo' | 'inactivo';
  esCombo: boolean;
  tiempoPreparacion?: number;
  alergenos?: string[];
  informacionNutricional?: {
    calorias?: number;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
  };
}

interface FormularioProductoProps {
  productoId: string | null;
  onSave: (producto: ProductoDetalle) => void;
  onDelete: (id: string) => void;
}

export function FormularioProducto({
  productoId,
  onSave,
  onDelete,
}: FormularioProductoProps) {
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('detalles');

  // Simular carga de datos del producto
  useEffect(() => {
    if (productoId) {
      // Aquí iría la llamada a tu API
      setProducto({
        id: productoId,
        nombre: 'Pizza Margarita',
        descripcion: 'Pizza tradicional italiana con salsa de tomate, mozzarella y albahaca',
        precio: 12.99,
        categoriaId: '1',
        restriccionEdad: false,
        estado: 'activo',
        esCombo: false,
        tiempoPreparacion: 20,
        alergenos: ['Gluten', 'Lácteos'],
        informacionNutricional: {
          calorias: 266,
          proteinas: 11,
          carbohidratos: 33,
          grasas: 9,
        },
      });
      setImagenPreview('/ruta-imagen-ejemplo.jpg');
    }
  }, [productoId]);

  const handleSave = async () => {
    if (!producto) return;

    const nuevosErrores: Record<string, string> = {};
    if (!producto.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    if (!producto.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }
    if (producto.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);
    try {
      await onSave(producto);
      setEditando(false);
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  if (!producto) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500">
          Selecciona un producto para ver sus detalles
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con acciones */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Detalles del producto</h2>
          <p className="text-sm text-neutral-500">
            {editando ? 'Editando producto' : 'Visualizando producto'}
          </p>
        </div>
        <div className="flex space-x-2">
          {editando ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={guardando}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setConfirmarEliminar(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <Button onClick={() => setEditando(true)}>
                Editar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="detalles">Detalles básicos</TabsTrigger>
            <TabsTrigger value="adicional">Información adicional</TabsTrigger>
            <TabsTrigger value="nutricion">Información nutricional</TabsTrigger>
          </TabsList>

          <TabsContent value="detalles" className="space-y-4">
            {/* Imagen del producto */}
            <div className="space-y-2">
              <Label>Imagen del producto</Label>
              <div className="border rounded-lg p-4">
                {imagenPreview ? (
                  <div className="relative">
                    <img
                      src={imagenPreview}
                      alt={producto.nombre}
                      className="w-full h-48 object-cover rounded"
                    />
                    {editando && (
                      <Button
                        variant="secondary"
                        className="absolute bottom-2 right-2"
                        onClick={() => {/* Lógica para cambiar imagen */}}
                      >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Cambiar imagen
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-neutral-100 rounded">
                    <p className="text-neutral-500">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del producto</Label>
                <Input
                  id="nombre"
                  value={producto.nombre}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    nombre: e.target.value
                  }))}
                  disabled={!editando}
                  error={errores.nombre}
                />
                {errores.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={producto.descripcion}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    descripcion: e.target.value
                  }))}
                  disabled={!editando}
                  error={errores.descripcion}
                  rows={4}
                />
                {errores.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{errores.descripcion}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={producto.precio}
                    onChange={(e) => editando && setProducto(prev => ({
                      ...prev!,
                      precio: parseFloat(e.target.value)
                    }))}
                    disabled={!editando}
                    error={errores.precio}
                  />
                  {errores.precio && (
                    <p className="text-red-500 text-sm mt-1">{errores.precio}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tiempoPreparacion">Tiempo de preparación (min)</Label>
                  <Input
                    id="tiempoPreparacion"
                    type="number"
                    value={producto.tiempoPreparacion || ''}
                    onChange={(e) => editando && setProducto(prev => ({
                      ...prev!,
                      tiempoPreparacion: parseInt(e.target.value)
                    }))}
                    disabled={!editando}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Restricción de edad</Label>
                    <p className="text-sm text-neutral-500">
                      Activa si este producto tiene restricción de edad
                    </p>
                  </div>
                  <Switch
                    checked={producto.restriccionEdad}
                    onCheckedChange={(checked) => editando && setProducto(prev => ({
                      ...prev!,
                      restriccionEdad: checked
                    }))}
                    disabled={!editando}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Es un combo</Label>
                    <p className="text-sm text-neutral-500">
                      Activa si este producto es un combo o menú especial
                    </p>
                  </div>
                  <Switch
                    checked={producto.esCombo}
                    onCheckedChange={(checked) => editando && setProducto(prev => ({
                      ...prev!,
                      esCombo: checked
                    }))}
                    disabled={!editando}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adicional" className="space-y-4">
            {/* Alérgenos */}
            <div className="space-y-2">
              <Label>Alérgenos</Label>
              <div className="flex flex-wrap gap-2">
                {producto.alergenos?.map((alergeno) => (
                  <div
                    key={alergeno}
                    className="bg-neutral-100 px-3 py-1 rounded-full text-sm"
                  >
                    {alergeno}
                  </div>
                ))}
                {editando && (
                  <Button variant="outline" className="rounded-full">
                    + Agregar
                  </Button>
                )}
              </div>
            </div>

            {/* Otros detalles adicionales aquí */}
          </TabsContent>

          <TabsContent value="nutricion" className="space-y-4">
            {/* Información nutricional */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calorias">Calorías (kcal)</Label>
                <Input
                  id="calorias"
                  type="number"
                  value={producto.informacionNutricional?.calorias || ''}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    informacionNutricional: {
                      ...prev!.informacionNutricional!,
                      calorias: parseInt(e.target.value)
                    }
                  }))}
                  disabled={!editando}
                />
              </div>

              <div>
                <Label htmlFor="proteinas">Proteínas (g)</Label>
                <Input
                  id="proteinas"
                  type="number"
                  value={producto.informacionNutricional?.proteinas || ''}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    informacionNutricional: {
                      ...prev!.informacionNutricional!,
                      proteinas: parseInt(e.target.value)
                    }
                  }))}
                  disabled={!editando}
                />
              </div>

              <div>
                <Label htmlFor="carbohidratos">Carbohidratos (g)</Label>
                <Input
                  id="carbohidratos"
                  type="number"
                  value={producto.informacionNutricional?.carbohidratos || ''}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    informacionNutricional: {
                      ...prev!.informacionNutricional!,
                      carbohidratos: parseInt(e.target.value)
                    }
                  }))}
                  disabled={!editando}
                />
              </div>

              <div>
                <Label htmlFor="grasas">Grasas (g)</Label>
                <Input
                  id="grasas"
                  type="number"
                  value={producto.informacionNutricional?.grasas || ''}
                  onChange={(e) => editando && setProducto(prev => ({
                    ...prev!,
                    informacionNutricional: {
                      ...prev!.informacionNutricional!,
                      grasas: parseInt(e.target.value)
                    }
                  }))}
                  disabled={!editando}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmarEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(producto.id);
                setConfirmarEliminar(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alertas de estado */}
      {editando && !producto.estado && (
        <Alert className="mt-4" variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Producto inactivo</AlertTitle>
          <AlertDescription>
            Este producto está marcado como inactivo y no será visible para los clientes.
          </AlertDescription>
        </Alert>
      )}

      {editando && producto.restriccionEdad && (
        <Alert className="mt-4" variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restricción de edad</AlertTitle>
          <AlertDescription>
            Este producto tiene restricción de edad y solo podrá ser pedido por clientes mayores de edad.
          </AlertDescription>
        </Alert>
      )}

      {/* Footer con información adicional */}
      <div className="border-t p-4 bg-neutral-50">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Última actualización: hace 2 horas</span>
          </div>
          <div>
            ID: {producto.id}
          </div>
        </div>
      </div>
    </div>
  );
}
