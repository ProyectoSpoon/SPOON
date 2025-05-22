// Define los tipos para usuarios en la aplicación

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'staff';
  telefono?: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
}

export interface NuevoUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'admin' | 'staff';
  telefono?: string;
}
