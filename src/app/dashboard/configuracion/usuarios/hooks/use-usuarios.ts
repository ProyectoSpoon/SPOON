import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Usuario } from '../types/usuarios.types';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carga de usuarios
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando usuarios (simulación)...');
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo
      const usuariosEjemplo: Usuario[] = [
        {
          uid: 'user_1',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@spoon.com',
          telefono: '+57 300 123 4567',
          rol: 'admin',
          estado: 'activo',
          fechaCreacion: new Date('2024-01-15'),
          ultimoAcceso: new Date('2024-12-30')
        },
        {
          uid: 'user_2',
          nombre: 'María',
          apellido: 'García',
          email: 'maria@spoon.com',
          telefono: '+57 301 234 5678',
          rol: 'staff',
          estado: 'activo',
          fechaCreacion: new Date('2024-02-20'),
          ultimoAcceso: new Date('2024-12-29')
        },
        {
          uid: 'user_3',
          nombre: 'Carlos',
          apellido: 'López',
          email: 'carlos@spoon.com',
          telefono: '+57 302 345 6789',
          rol: 'staff',
          estado: 'inactivo',
          fechaCreacion: new Date('2024-03-10'),
          ultimoAcceso: new Date('2024-12-15')
        }
      ];
      
      setUsuarios(usuariosEjemplo);
      console.log('Usuarios cargados (simulación):', usuariosEjemplo);
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular creación de usuario
  const crearUsuario = useCallback(async (datosUsuario: Omit<Usuario, 'uid' | 'fechaCreacion' | 'ultimoAcceso'>) => {
    try {
      console.log('Creando usuario (simulación):', datosUsuario);
      
      // Simular delay de creación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nuevoUsuario: Usuario = {
        ...datosUsuario,
        uid: `user_${Date.now()}`,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date()
      };
      
      setUsuarios(prev => [...prev, nuevoUsuario]);
      toast.success('Usuario creado exitosamente');
      
      console.log('Usuario creado (simulación):', nuevoUsuario);
      return nuevoUsuario;
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear el usuario');
      throw error;
    }
  }, []);

  // Simular actualización de usuario
  const actualizarUsuario = useCallback(async (uid: string, datosActualizacion: Partial<Usuario>) => {
    try {
      console.log('Actualizando usuario (simulación):', { uid, datosActualizacion });
      
      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.uid === uid 
            ? { ...usuario, ...datosActualizacion }
            : usuario
        )
      );
      
      toast.success('Usuario actualizado exitosamente');
      console.log('Usuario actualizado (simulación)');
      
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario');
      throw error;
    }
  }, []);

  // Simular eliminación de usuario
  const eliminarUsuario = useCallback(async (uid: string) => {
    try {
      console.log('Eliminando usuario (simulación):', uid);
      
      // Simular delay de eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsuarios(prev => prev.filter(usuario => usuario.uid !== uid));
      toast.success('Usuario eliminado exitosamente');
      
      console.log('Usuario eliminado (simulación)');
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario');
      throw error;
    }
  }, []);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    error,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
  };
}
