import React from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/AlertDialog';
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
    <AlertDialog open={abierto} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar al usuario{' '}
            <span className="font-medium text-foreground">
              {usuario.nombre} {usuario.apellido}
            </span>
            ? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmar}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}