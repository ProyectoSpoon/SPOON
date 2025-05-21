// src/context/configuracioncontext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase/config';
;
import { useAuth } from '@/context/authcontext'; // Asumiendo que tienes un contexto de autenticación

interface ConfiguracionTarjeta {
  id: string;
  titulo: string;
  estado: EstadoTarjeta;
  camposCompletados: number;
  camposTotales: number;
  ruta: string;
  datos: Record<string, any>;
}

interface ConfiguracionContextType {
  tarjetas: ConfiguracionTarjeta[];
  progreso: number;
  actualizarTarjeta: (id: string, datos: Partial<ConfiguracionTarjeta>) => void;
  puedeAvanzar: boolean;
  guardarProgreso: () => Promise<void>;
  cargarConfiguracion: () => Promise<void>;
}

export const ConfiguracionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tarjetas, setTarjetas] = useState<ConfiguracionTarjeta[]>([
    {
      id: 'info-legal',
      titulo: 'Información Legal',
      estado: 'pendiente',
      camposCompletados: 0,
      camposTotales: 5,
      ruta: '/config-restaurante/info-legal',
      datos: {}
    },
    {
      id: 'info-restaurante',
      titulo: 'Información del Restaurante',
      estado: 'pendiente',
      camposCompletados: 0,
      camposTotales: 8,
      ruta: '/config-restaurante/info-restaurante',
      datos: {}
    },
    // Añade más tarjetas según necesites
  ]);

  const [progreso, setProgreso] = useState(0);

  const cargarConfiguracion = async () => {
    if (!user?.uid) return;

    try {
      const configRef = doc(db, 'restaurantes', user.uid, 'configuracion', 'general');
      const docSnap = await getDoc(configRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTarjetas(prevTarjetas => 
          prevTarjetas.map(tarjeta => ({
            ...tarjeta,
            ...data.tarjetas?.find((t: ConfiguracionTarjeta) => t.id === tarjeta.id)
          }))
        );
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
    }
  };

  const guardarProgreso = async () => {
    if (!user?.uid) return;

    try {
      const configRef = doc(db, 'restaurantes', user.uid, 'configuracion', 'general');
      await setDoc(configRef, {
        tarjetas,
        progreso,
        ultimaActualizacion: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
      throw error;
    }
  };

  const actualizarTarjeta = async (id: string, nuevosDatos: Partial<ConfiguracionTarjeta>) => {
    setTarjetas(prev => prev.map(tarjeta => 
      tarjeta.id === id ? { ...tarjeta, ...nuevosDatos } : tarjeta
    ));

    // Guardamos automáticamente después de cada actualización
    try {
      await guardarProgreso();
    } catch (error) {
      console.error('Error al guardar la actualización:', error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      cargarConfiguracion();
    }
  }, [user?.uid]);

  useEffect(() => {
    const calcularProgreso = () => {
      const tarjetasCompletas = tarjetas.filter(t => t.estado === 'completo').length;
      setProgreso((tarjetasCompletas / tarjetas.length) * 100);
    };

    calcularProgreso();
  }, [tarjetas]);

  const value = {
    tarjetas,
    progreso,
    actualizarTarjeta,
    puedeAvanzar: progreso === 100,
    guardarProgreso,
    cargarConfiguracion
  };

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (context === undefined) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
  }
  return context;
};