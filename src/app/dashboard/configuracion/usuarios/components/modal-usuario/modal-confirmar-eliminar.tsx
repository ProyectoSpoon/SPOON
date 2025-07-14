import React from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog/dialog';
import { Button } from '@/shared/components/ui/Button';
import { Usuario } from '../../types/usuarios.types';

interface ModalConfirmarEliminarProps {
  usuario: Usuario | null;
  abierto: boolean;
  onClose: () => void;
  onConfirmar: (uid: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ModalConfirmarEliminar({
  usuario,
  abierto,
  onClose,
  onConfirmar,
  isLoading
}: ModalConfirmarEliminarProps) {
  if (!usuario) return null;

  const handleConfirmar = async () => {
    try {
      await onConfirmar(usuario.uid);
      onClose();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar al usuario{' '}
            <span className="font-medium">
              {usuario.nombre} {usuario.apellido}
            </span>
            ? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




























