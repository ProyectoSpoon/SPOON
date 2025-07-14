'use client'

import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from "@/shared/components/ui/Card";
import { DataTable } from "@/shared/components/ui/Table";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";

export default function RolesPage() {
  const roles = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: [
        'Gestionar usuarios',
        'Gestionar roles',
        'Configurar restaurante',
        'Gestionar menú',
        'Ver estadísticas'
      ]
    },
    {
      nombre: 'Staff',
      descripcion: 'Acceso limitado a operaciones básicas',
      permisos: [
        'Ver menú',
        'Gestionar pedidos',
        'Ver estadísticas básicas'
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los roles y permisos de los usuarios
          </p>
        </div>
      </div>

      {/* Lista de Roles */}
      <div className="grid gap-6">
        {roles.map((rol) => (
          <Card key={rol.nombre} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">{rol.nombre}</h3>
                </div>
                <Button variant="outline" size="sm">
                  Editar Rol
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {rol.descripcion}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Permisos asignados</h4>
                <div className="flex flex-wrap gap-2">
                  {rol.permisos.map((permiso) => (
                    <span key={permiso} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {permiso}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabla de Usuarios por Rol */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Usuarios por Rol</h3>
          <div className="border rounded-lg">
            <DataTable.Root>
              <DataTable.Header>
                <DataTable.Row>
                  <DataTable.HeaderCell>Usuario</DataTable.HeaderCell>
                  <DataTable.HeaderCell>Rol Actual</DataTable.HeaderCell>
                  <DataTable.HeaderCell>Asignado el</DataTable.HeaderCell>
                  <DataTable.HeaderCell>Acciones</DataTable.HeaderCell>
                </DataTable.Row>
              </DataTable.Header>
              <DataTable.Body>
                <DataTable.Row>
                  <DataTable.Cell colSpan={4} align="center" className="h-32 text-muted-foreground">
                    No hay datos para mostrar
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable.Body>
            </DataTable.Root>
          </div>
        </div>
      </Card>
    </div>
  );
}


























