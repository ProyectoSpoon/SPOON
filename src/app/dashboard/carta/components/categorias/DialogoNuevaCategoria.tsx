// src/app/dashboard/carta/components/categorias/DialogoNuevaCategoria.tsx
import { useState } from 'react';
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
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';

interface DialogoNuevaCategoriaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (nombre: string) => Promise<void>;
}

export function DialogoNuevaCategoria({
  open,
  onOpenChange,
  onSubmit
}: DialogoNuevaCategoriaProps) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      await onSubmit(nombre);
      setNombre('');
      setError(null);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar la categoría');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>
            Agrega una nueva categoría a tu menú. Las categorías te ayudan a organizar mejor tus productos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre de la categoría
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError(null);
                }}
                placeholder="Ej: Entradas, Platos principales, Postres..."
                className={error ? 'border-red-500' : ''}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear categoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


























