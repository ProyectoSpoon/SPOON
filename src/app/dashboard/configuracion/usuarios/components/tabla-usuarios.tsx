'use client'

import React from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import { Button } from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Usuario } from '../types/usuarios.types';

interface TablaUsuariosProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onEditar?: (usuario: Usuario) => void;
  onEliminar?: (uid: string) => void;
}

export default function TablaUsuarios({ 
  usuarios, 
  isLoading,
  onEditar,
  onEliminar 
}: TablaUsuariosProps) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DataTable.Root>
      <DataTable.Header>
        <DataTable.Row>
          <DataTable.HeaderCell>Usuario</DataTable.HeaderCell>
          <DataTable.HeaderCell>Email</DataTable.HeaderCell>
          <DataTable.HeaderCell>Rol</DataTable.HeaderCell>
          <DataTable.HeaderCell>Estado</DataTable.HeaderCell>
          <DataTable.HeaderCell>Último acceso</DataTable.HeaderCell>
          <DataTable.HeaderCell align="right">Acciones</DataTable.HeaderCell>
        </DataTable.Row>
      </DataTable.Header>
      <DataTable.Body>
        {usuarios.length === 0 ? (
          <DataTable.Row>
            <DataTable.Cell colSpan={6} align="center" className="h-48 text-muted-foreground">
              No hay usuarios registrados
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          usuarios.map((usuario) => (
            <DataTable.Row key={usuario.uid}>
              <DataTable.Cell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {false ? (
                <img
                  src=""
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                      <span className="text-primary text-sm">
                        {usuario.nombre[0]}
                        {usuario.apellido[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{`${usuario.nombre} ${usuario.apellido}`}</p>
                    <p className="text-sm text-muted-foreground">{usuario.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              </DataTable.Cell>
              <DataTable.Cell>{usuario.email}</DataTable.Cell>
              <DataTable.Cell>
                <span className={`px-2 py-1 rounded text-xs ${usuario.rol === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {usuario.rol === 'admin' ? 'Administrador' : 'Staff'}
                </span>
              </DataTable.Cell>
              <DataTable.Cell>
                <span className={`px-2 py-1 rounded text-xs ${usuario.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </DataTable.Cell>
              <DataTable.Cell>
                {usuario.ultimoAcceso ? (
                  format(usuario.ultimoAcceso instanceof Date ? usuario.ultimoAcceso : new Date(usuario.ultimoAcceso), 'PPp', { locale: es })
                ) : (
                  'Nunca'
                )}
              </DataTable.Cell>
              <DataTable.Cell align="right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => onEditar?.(usuario)}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => onEliminar?.(usuario.uid)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}
      </DataTable.Body>
    </DataTable.Root>
  );
}



























