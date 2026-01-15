import { useState, useCallback } from 'react';
import { Festivo, ConfiguracionFestivos } from '@/shared/types/horarios/tipos-festivos';

export const useFestivos = (restauranteId?: string) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionFestivos>({
    pais: 'CO',
    zonaHoraria: 'America/Bogota',
    festivosNacionales: [],
    festivosLocales: [],
    festivosPersonalizados: []
  });
  const [festivos, setFestivos] = useState<any[]>([]); // Keep for legacy compatibility if needed

  const cargarFestivos = useCallback(async (year: number) => {
    setCargando(true);
    try {
      // Mock data matching the expected structure
      const mockFestivosNacionales: Festivo[] = [
        {
          id: '1',
          fecha: new Date(year, 0, 1),
          tipo: 'nacional',
          descripcion: 'Año Nuevo'
        },
        {
          id: '2',
          fecha: new Date(year, 11, 25),
          tipo: 'nacional',
          descripcion: 'Navidad'
        }
      ];

      setConfiguracion(prev => ({
        ...prev,
        festivosNacionales: mockFestivosNacionales
      }));

      // Also set the legacy state
      setFestivos(mockFestivosNacionales.map(f => ({
        fecha: f.fecha.toISOString().split('T')[0],
        nombre: f.descripcion
      })));

    } catch (err) {
      console.error(err);
      setError('Error al cargar festivos');
    } finally {
      setCargando(false);
    }
  }, []);

  const agregarFestivo = useCallback(async (festivo: any) => {
    try {
      const newFestivo: Festivo = {
        id: Math.random().toString(36).substr(2, 9),
        fecha: festivo.fecha,
        tipo: 'personalizado',
        descripcion: festivo.descripcion || festivo.nombre || 'Evento',
        afectaHorario: festivo.afectaHorario
      };

      setConfiguracion(prev => ({
        ...prev,
        festivosPersonalizados: [...prev.festivosPersonalizados, newFestivo]
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, []);

  const esFestivo = (fecha: Date): boolean => {
    // Simple check against all loaded festivos
    const allEvents = [
      ...configuracion.festivosNacionales,
      ...configuracion.festivosLocales,
      ...configuracion.festivosPersonalizados
    ];

    return allEvents.some(f =>
      f.fecha.getDate() === fecha.getDate() &&
      f.fecha.getMonth() === fecha.getMonth()
    );
  };

  return {
    configuracion,
    cargando,
    error,
    cargarFestivos,
    agregarFestivo,
    festivos,
    esFestivo
  };
};

export const usarFestivos = useFestivos;
