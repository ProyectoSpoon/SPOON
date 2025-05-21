// src/app/dashboard/usuarios/page.tsx
'use client'

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import TablaUsuarios from './components/tabla-usuarios';
import BarraBusqueda from './components/barra-busqueda';
import ModalNuevoUsuario from './components/modal-usuario/modal-nuevo-usuario';
import { usePostgresUsuarios } from './hooks/use-postgres-usuarios';

export default function UsuariosPage() {
  const {
    usuarios,
    isLoading,
    searchTerm,
    setSearchTerm,
    modalAbierto,
    setModalAbierto,
    handleCrearUsuario
  } = usePostgresUsuarios();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios de tu restaurante
          </p>
        </div>
        <Button 
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Lista de Usuarios</h2>
          <BarraBusqueda
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
          />
        </div>
        
        <TablaUsuarios 
          usuarios={usuarios}
          isLoading={isLoading}
        />
      </div>

      <ModalNuevoUsuario
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onCrear={handleCrearUsuario}
      />
    </div>
  );
}
