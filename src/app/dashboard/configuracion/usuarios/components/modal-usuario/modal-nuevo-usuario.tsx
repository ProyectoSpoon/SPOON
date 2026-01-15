'use client'

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
  DialogDescription
} from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/RadioGroup';
import { Usuario } from '@/app/dashboard/configuracion/usuarios/types/usuarios.types';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['admin', 'staff']),
  telefono: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ModalNuevoUsuarioProps {
  abierto: boolean;
  onClose: () => void;
  onCrear: (data: FormData) => Promise<any>;
}

export default function ModalNuevoUsuario({
  abierto,
  onClose,
  onCrear
}: ModalNuevoUsuarioProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rol: 'staff',
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Llamar al servicio de creación
      await onCrear(data);

      // Limpiar el formulario y cerrar el modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      // No cerramos el modal en caso de error para permitir corregir los datos
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Ingresa los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                {...register('nombre')}
              />
              {errors.nombre && (
                <span className="text-sm text-destructive">
                  {errors.nombre.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                {...register('apellido')}
              />
              {errors.apellido && (
                <span className="text-sm text-destructive">
                  {errors.apellido.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-sm text-destructive">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              {...register('password')}
            />
            {errors.password && (
              <span className="text-sm text-destructive">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+34 600 000 000"
              {...register('telefono')}
            />
            {errors.telefono && (
              <span className="text-sm text-destructive">
                {errors.telefono.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <RadioGroup
              value={watch('rol')}
              onValueChange={(value) => setValue('rol', value as 'admin' | 'staff')}
              defaultValue="staff"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="staff" id="staff" />
                <Label htmlFor="staff">Staff</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Administrador</Label>
              </div>
            </RadioGroup>
            {errors.rol && (
              <span className="text-sm text-destructive">
                {errors.rol.message}
              </span>
            )}
          </div>

          <DialogFooter>
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
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


























