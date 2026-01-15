import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/Dialog/dialog';
import { Button } from '@/shared/components/ui/Button';
import { Usuario } from '@/app/dashboard/configuracion/usuarios/types/usuarios.types';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  rol: z.enum(['admin', 'staff']),
  estado: z.enum(['activo', 'inactivo'])
});

type FormData = z.infer<typeof formSchema>;

interface ModalEditarUsuarioProps {
  usuario: Usuario | null;
  abierto: boolean;
  onClose: () => void;
  onGuardar: (uid: string, data: Partial<Usuario>) => Promise<void>;
}

export default function ModalEditarUsuario({
  usuario,
  abierto,
  onClose,
  onGuardar
}: ModalEditarUsuarioProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: usuario ? {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      estado: usuario.estado === 'bloqueado' ? 'inactivo' : usuario.estado
    } : undefined
  });

  const estadoActual = watch('estado');

  const onSubmit = async (data: FormData) => {
    if (!usuario) return;

    try {
      await onGuardar(usuario.uid, data);
      onClose();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
              <input
                id="nombre"
                placeholder="Juan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="apellido" className="text-sm font-medium">Apellido</label>
              <input
                id="apellido"
                placeholder="Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('apellido')}
              />
              {errors.apellido && (
                <p className="text-sm text-red-500">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="telefono" className="text-sm font-medium">Teléfono (opcional)</label>
            <input
              id="telefono"
              type="tel"
              placeholder="+34 600 000 000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('telefono')}
            />
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rol</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="staff"
                  value="staff"
                  {...register('rol')}
                />
                <label htmlFor="staff" className="text-sm">Staff</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="admin"
                  value="admin"
                  {...register('rol')}
                />
                <label htmlFor="admin" className="text-sm">Administrador</label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Estado</label>
              <div className="text-sm text-gray-500">
                {estadoActual === 'activo' ? 'Usuario activo' : 'Usuario inactivo'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={estadoActual === 'activo'}
              onChange={(e) => setValue('estado', e.target.checked ? 'activo' : 'inactivo')}
              className="h-4 w-4"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




























