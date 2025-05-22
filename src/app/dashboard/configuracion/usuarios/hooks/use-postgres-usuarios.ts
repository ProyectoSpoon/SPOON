'use client'

import { useState, useEffect } from 'react';
import { NuevoUsuario, Usuario } from '@/app/dashboard/usuarios/types/usuarios.types';
import { useToast } from '@/shared/Hooks/useToast';

export function usePostgresUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar usuarios al montar el componente usando la API Route
  useEffect(() => {
    async function cargarUsuarios() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/usuarios');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convertir las fechas de string a Date objects
        const usuariosConFechas = data.map((usuario: any) => ({
          ...usuario,
          fechaCreacion: new Date(usuario.fechaCreacion),
          ultimoAcceso: usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso) : undefined
        }));
        
        setUsuarios(usuariosConFechas);
        setError(null);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('Error al cargar los usuarios');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los usuarios',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }

    cargarUsuarios();
  }, [toast]);

  const handleCrearUsuario = async (data: NuevoUsuario) => {
    try {
      setIsLoading(true);
      
      // Llamar a la API para crear el usuario
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear usuario');
      }
      
      const nuevoUsuario = await response.json();
      
      // Convertir las fechas
      nuevoUsuario.fechaCreacion = new Date(nuevoUsuario.fechaCreacion);
      if (nuevoUsuario.ultimoAcceso) {
        nuevoUsuario.ultimoAcceso = new Date(nuevoUsuario.ultimoAcceso);
      }
      
      // Actualizar la lista de usuarios
      setUsuarios(prevUsuarios => [nuevoUsuario, ...prevUsuarios]);
      
      // Mostrar mensaje de éxito
      toast({
        title: 'Usuario creado',
        description: `El usuario ${data.nombre} ${data.apellido} ha sido creado exitosamente`,
        variant: 'default'
      });
      
      // Cerrar el modal
      setModalAbierto(false);
      
      return nuevoUsuario;
    } catch (err) {
      console.error('Error al crear usuario:', err);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo crear el usuario',
        variant: 'destructive'
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios según el término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    usuarios: filteredUsuarios,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    modalAbierto,
    setModalAbierto,
    handleCrearUsuario
  };
}
