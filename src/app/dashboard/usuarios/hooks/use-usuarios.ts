// src/app/dashboard/usuarios/hooks/use-usuarios.ts
'use client'

import { useState, useEffect } from 'react';
;
;
import { auth, db } from '@/firebase/config';
import { Usuario } from '../types/usuarios.types';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query para obtener usuarios, excluyendo el usuario actual
    const currentUserUid = auth.currentUser?.uid;
    const q = query(
      collection(db, 'usuarios'),
      orderBy('fechaCreacion', 'desc')
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usuariosData = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id,
        })) as Usuario[];
        
        setUsuarios(usuariosData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar los usuarios');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCrearUsuario = async (data: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: 'admin' | 'staff';
    telefono?: string;
  }) => {
    try {
      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // 2. Crear documento del usuario en Firestore
      await addDoc(collection(db, 'usuarios'), {
        uid: userCredential.user.uid,
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol,
        telefono: data.telefono || null,
        estado: 'activo',
        fechaCreacion: Timestamp.now(),
        ultimoAcceso: null,
      });

      setModalAbierto(false);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error('Error al crear el usuario');
    }
  };

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