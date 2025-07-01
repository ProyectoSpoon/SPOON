// src/context/configuracioncontext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConfiguracionRestaurante {
  id?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  descripcion?: string;
  horarios: {
    [key: string]: {
      abierto: boolean;
      apertura: string;
      cierre: string;
    };
  };
  configuracionPagos: {
    efectivo: boolean;
    tarjeta: boolean;
    transferencia: boolean;
  };
  configuracionDelivery: {
    activo: boolean;
    radioKm: number;
    costoMinimo: number;
    tiempoEstimado: number;
  };
  configuracionNotificaciones: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  tema: {
    colorPrimario: string;
    colorSecundario: string;
    logo?: string;
  };
}

interface ConfiguracionContextType {
  configuracion: ConfiguracionRestaurante | null;
  loading: boolean;
  error: string | null;
  actualizarConfiguracion: (config: Partial<ConfiguracionRestaurante>) => Promise<void>;
  cargarConfiguracion: () => Promise<void>;
}

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (context === undefined) {
    throw new Error('useConfiguracion debe ser usado dentro de un ConfiguracionProvider');
  }
  return context;
};

export const ConfiguracionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Simulando carga de configuración...');
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configuración de ejemplo
      const configEjemplo: ConfiguracionRestaurante = {
        id: 'rest_1',
        nombre: 'Restaurante SPOON',
        direccion: 'Calle Principal 123, Ciudad',
        telefono: '+57 300 123 4567',
        email: 'contacto@spoon.com',
        descripcion: 'El mejor restaurante de la ciudad',
        horarios: {
          lunes: { abierto: true, apertura: '08:00', cierre: '22:00' },
          martes: { abierto: true, apertura: '08:00', cierre: '22:00' },
          miercoles: { abierto: true, apertura: '08:00', cierre: '22:00' },
          jueves: { abierto: true, apertura: '08:00', cierre: '22:00' },
          viernes: { abierto: true, apertura: '08:00', cierre: '23:00' },
          sabado: { abierto: true, apertura: '09:00', cierre: '23:00' },
          domingo: { abierto: false, apertura: '09:00', cierre: '21:00' }
        },
        configuracionPagos: {
          efectivo: true,
          tarjeta: true,
          transferencia: true
        },
        configuracionDelivery: {
          activo: true,
          radioKm: 5,
          costoMinimo: 15000,
          tiempoEstimado: 30
        },
        configuracionNotificaciones: {
          email: true,
          sms: false,
          push: true
        },
        tema: {
          colorPrimario: '#F4821F',
          colorSecundario: '#2D3748'
        }
      };
      
      setConfiguracion(configEjemplo);
      console.log('Configuración cargada (simulación):', configEjemplo);
      
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const actualizarConfiguracion = async (configActualizada: Partial<ConfiguracionRestaurante>) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Simulando actualización de configuración:', configActualizada);
      
      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConfiguracion(prev => prev ? { ...prev, ...configActualizada } : null);
      console.log('Configuración actualizada (simulación)');
      
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      setError('Error al actualizar la configuración');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const value: ConfiguracionContextType = {
    configuracion,
    loading,
    error,
    actualizarConfiguracion,
    cargarConfiguracion
  };

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
};
