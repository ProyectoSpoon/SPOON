import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@zod/resolver';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/RadioGroup';
import { Switch } from '@/shared/components/ui/Switch';
import { Usuario } from '../../types/usuarios.types';

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
    values: usuario ? {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      estado: usuario.estado
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
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                {...register('nombre')}
                error={errors.nombre?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                {...register('apellido')}
                error={errors.apellido?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+34 600 000 000"
              {...register('telefono')}
              error={errors.telefono?.message}
            />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <RadioGroup
              defaultValue={usuario.rol}
              onValueChange={(value) => setValue('rol', value as 'admin' | 'staff')}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Estado</Label>
              <div className="text-sm text-muted-foreground">
                {estadoActual === 'activo' ? 'Usuario activo' : 'Usuario inactivo'}
              </div>
            </div>
            <Switch
              checked={estadoActual === 'activo'}
              onCheckedChange={(checked) => 
                setValue('estado', checked ? 'activo' : 'inactivo')
              }
            />
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}