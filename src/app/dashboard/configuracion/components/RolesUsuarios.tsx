'use client';

import { useState, useEffect } from 'react'; 
import { toast } from 'sonner';
import { Save, Loader2, Plus, Trash2, Edit, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/Dialog';
// Eliminamos la importación de los componentes de tabla que no existen
import { Badge } from '@/shared/components/ui/Badge';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface UsuariosRolesData {
  usuarios: Usuario[];
  roles: Rol[];
}

export default function RolesUsuarios() {
  const [data, setData] = useState<UsuariosRolesData>({ usuarios: [], roles: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRolDialog, setShowRolDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentRol, setCurrentRol] = useState<Rol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos de usuarios y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/configuracion/usuarios-roles');
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos de usuarios y roles');
        }
        
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos de usuarios y roles');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Guardar datos de usuarios y roles
  const handleSave = async () => {
  try {
    setIsSaving(true);
    
    const response = await fetch('/api/configuracion/usuarios-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'guardar_todos',
        data: data
      }), // ← Ahora sí está correcto
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar los datos de usuarios y roles');
    }
    
    toast.success('Datos guardados correctamente');
  } catch (error) {
    console.error('Error al guardar datos:', error);
    toast.error('Error al guardar los datos de usuarios y roles');
  } finally {
    setIsSaving(false);
  }
};
  // Abrir diálogo para crear/editar usuario
  const handleEditUser = (usuario?: Usuario) => {
    if (usuario) {
      setCurrentUser(usuario);
    } else {
      setCurrentUser({
        id: `user_${Date.now()}`,
        nombre: '',
        email: '',
        rol: data.roles.length > 0 ? data.roles[0].id : '',
        activo: true
      });
    }
    setShowUserDialog(true);
  };

  
  // Guardar usuario
  const handleSaveUser = () => {
    if (!currentUser) return;
    
    if (!currentUser.nombre.trim() || !currentUser.email.trim()) {
      toast.error('Nombre y email son campos obligatorios');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentUser.email)) {
      toast.error('El formato del email no es válido');
      return;
    }
    
    setData(prev => {
      const isNew = !prev.usuarios.some(u => u.id === currentUser.id);
      
      if (isNew) {
        return {
          ...prev,
          usuarios: [...prev.usuarios, currentUser]
        };
      } else {
        return {
          ...prev,
          usuarios: prev.usuarios.map(u => 
            u.id === currentUser.id ? currentUser : u
          )
        };
      }
    });
    
    setShowUserDialog(false);
    toast.success(`Usuario ${currentUser.nombre} ${currentUser.id.includes('user_') ? 'creado' : 'actualizado'} correctamente`);
  };

  // Guardar rol
  const handleSaveRol = () => {
    if (!currentRol) return;
    
    if (!currentRol.nombre.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    
    setData(prev => {
      const isNew = !prev.roles.some(r => r.id === currentRol.id);
      
      if (isNew) {
        return {
          ...prev,
          roles: [...prev.roles, currentRol]
        };
      } else {
        return {
          ...prev,
          roles: prev.roles.map(r => 
            r.id === currentRol.id ? currentRol : r
          )
        };
      }
    });
    
    setShowRolDialog(false);
    toast.success(`Rol ${currentRol.nombre} ${currentRol.id.includes('rol_') ? 'creado' : 'actualizado'} correctamente`);
  };

  // Eliminar usuario
  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      setData(prev => ({
        ...prev,
        usuarios: prev.usuarios.filter(u => u.id !== id)
      }));
      
      toast.success('Usuario eliminado correctamente');
    }
  };



  // Cambiar estado activo de usuario
  const handleToggleUserActive = (id: string) => {
    setData(prev => ({
      ...prev,
      usuarios: prev.usuarios.map(u => 
        u.id === id ? { ...u, activo: !u.activo } : u
      )
    }));
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = data.usuarios.filter(usuario => 
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.roles.find(r => r.id === usuario.rol)?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Roles y Usuarios</h2>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#F4821F] hover:bg-[#E67812] text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Sección de Usuarios */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Usuarios</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button 
              onClick={() => handleEditUser()}
              className="bg-[#F4821F] hover:bg-[#E67812] text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.roles.find(r => r.id === usuario.rol)?.nombre || 'Sin rol'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleUserActive(usuario.id)}
                        >
                          {usuario.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(usuario.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Roles */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Roles</h3>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios Asignados</th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.roles.length > 0 ? (
                data.roles.map((rol) => {
                  const usuariosConRol = data.usuarios.filter(u => u.rol === rol.id).length;
                  
                  return (
                    <tr key={rol.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rol.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rol.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuariosConRol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
             
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron roles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diálogo para crear/editar usuario */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser?.id.includes('user_') ? 'Crear Usuario' : 'Editar Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={currentUser?.nombre || ''}
                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                placeholder="Nombre completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={currentUser?.rol || ''}
                onValueChange={(value) => setCurrentUser(prev => prev ? { ...prev, rol: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {data.roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                checked={currentUser?.activo || false}
                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, activo: e.target.checked } : null)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="activo">Usuario activo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} className="bg-[#F4821F] hover:bg-[#E67812] text-white">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear/editar rol */}
      <Dialog open={showRolDialog} onOpenChange={setShowRolDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRol?.id.includes('rol_') ? 'Crear Rol' : 'Editar Rol'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreRol">Nombre del Rol</Label>
              <Input
                id="nombreRol"
                value={currentRol?.nombre || ''}
                onChange={(e) => setCurrentRol(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                placeholder="Nombre del rol"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcionRol">Descripción</Label>
              <Input
                id="descripcionRol"
                value={currentRol?.descripcion || ''}
                onChange={(e) => setCurrentRol(prev => prev ? { ...prev, descripcion: e.target.value } : null)}
                placeholder="Descripción del rol"
              />
            </div>
            
            {/* Aquí se podrían agregar checkboxes para los permisos */}
            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="border rounded-md p-4 space-y-2">
                <p className="text-sm text-gray-500">
                  La gestión detallada de permisos se implementará en una versión futura.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRolDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRol} className="bg-[#F4821F] hover:bg-[#E67812] text-white">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
