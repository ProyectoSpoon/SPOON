import { useState, useEffect } from 'react';
import type { Producto } from '@/app/dashboard/carta/types/menu.types';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';
import type { MenuCombinacion, ProgramacionSemanal } from '../types/programacion.types';

// Clave para almacenar la programación semanal en localStorage
const PROGRAMACION_SEMANAL_KEY = 'programacion_semanal';
const PLANTILLAS_KEY = 'plantillas_programacion';

const DIAS_SEMANA = {
  'Lunes': { index: 0 },
  'Martes': { index: 1 },
  'Miércoles': { index: 2 },
  'Jueves': { index: 3 },
  'Viernes': { index: 4 },
  'Sábado': { index: 5 },
  'Domingo': { index: 6 }
} as const;

type DiaSemana = keyof typeof DIAS_SEMANA;

// Interfaz para las plantillas
interface PlantillaProgramacion {
  id: string;
  nombre: string;
  programacion: Record<DiaSemana, MenuCombinacion[]>;
  fechaCreacion: Date;
}

// Datos de prueba
const COMBINACIONES_MOCK: MenuCombinacion[] = [
  {
    id: '1',
    entrada: { 
      id: 'e1', 
      nombre: 'Sopa de Guineo', 
      descripcion: 'Sopa tradicional', 
      precio: 8000, 
      categoriaId: CategoriaMenu.ENTRADA 
    },
    principio: { 
      id: 'p1', 
      nombre: 'Frijoles', 
      descripcion: 'Frijoles rojos', 
      precio: 5000, 
      categoriaId: CategoriaMenu.PRINCIPIO 
    },
    proteina: { 
      id: 'pr1', 
      nombre: 'Pechuga a la Plancha', 
      descripcion: 'Pechuga de pollo', 
      precio: 12000, 
      categoriaId: CategoriaMenu.PROTEINA 
    },
    acompanamiento: [
      { 
        id: 'a1', 
        nombre: 'Arroz', 
        descripcion: 'Arroz blanco', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      },
      { 
        id: 'a2', 
        nombre: 'Ensalada', 
        descripcion: 'Ensalada fresca', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      }
    ],
    bebida: { 
      id: 'b1', 
      nombre: 'Limonada', 
      descripcion: 'Limonada natural', 
      precio: 3000, 
      categoriaId: CategoriaMenu.BEBIDA 
    },
    especial: false,
    cantidad: 20
  },
  {
    id: '2',
    entrada: { 
      id: 'e2', 
      nombre: 'Crema de Tomate', 
      descripcion: 'Crema casera', 
      precio: 7000, 
      categoriaId: CategoriaMenu.ENTRADA 
    },
    principio: { 
      id: 'p2', 
      nombre: 'Lentejas', 
      descripcion: 'Lentejas guisadas', 
      precio: 5000, 
      categoriaId: CategoriaMenu.PRINCIPIO 
    },
    proteina: { 
      id: 'pr2', 
      nombre: 'Pescado Frito', 
      descripcion: 'Filete de pescado', 
      precio: 15000, 
      categoriaId: CategoriaMenu.PROTEINA 
    },
    acompanamiento: [
      { 
        id: 'a1', 
        nombre: 'Arroz', 
        descripcion: 'Arroz blanco', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      },
      { 
        id: 'a3', 
        nombre: 'Patacón', 
        descripcion: 'Patacón pisado', 
        precio: 2500, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      }
    ],
    bebida: { 
      id: 'b2', 
      nombre: 'Jugo de Mora', 
      descripcion: 'Jugo natural', 
      precio: 3000, 
      categoriaId: CategoriaMenu.BEBIDA 
    },
    especial: true,
    cantidad: 15,
    precioEspecial: 25000
  },
  {
    id: '3',
    nombre: 'Combo Ejecutivo',
    entrada: { 
      id: 'e3', 
      nombre: 'Crema de Champiñones', 
      descripcion: 'Crema especial', 
      precio: 9000, 
      categoriaId: CategoriaMenu.ENTRADA 
    },
    principio: { 
      id: 'p3', 
      nombre: 'Garbanzos', 
      descripcion: 'Garbanzos guisados', 
      precio: 5500, 
      categoriaId: CategoriaMenu.PRINCIPIO 
    },
    proteina: { 
      id: 'pr3', 
      nombre: 'Lomo de Cerdo', 
      descripcion: 'Lomo de cerdo a la parrilla', 
      precio: 14000, 
      categoriaId: CategoriaMenu.PROTEINA 
    },
    acompanamiento: [
      { 
        id: 'a1', 
        nombre: 'Arroz', 
        descripcion: 'Arroz blanco', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      },
      { 
        id: 'a4', 
        nombre: 'Papa Criolla', 
        descripcion: 'Papa criolla al horno', 
        precio: 3000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      }
    ],
    bebida: { 
      id: 'b3', 
      nombre: 'Jugo de Maracuyá', 
      descripcion: 'Jugo natural', 
      precio: 3500, 
      categoriaId: CategoriaMenu.BEBIDA 
    },
    especial: true,
    favorito: true,
    cantidad: 10,
    precioEspecial: 28000
  }
];

// Función segura para acceder a localStorage (solo en el cliente)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export const useCombinacionesProgramacion = () => {
  const [combinacionesDisponibles, setCombinacionesDisponibles] = useState<MenuCombinacion[]>([]);
  const [programacionSemanal, setProgramacionSemanal] = useState<Record<DiaSemana, MenuCombinacion[]>>(() => {
    // Intentar cargar desde localStorage
    const savedData = safeLocalStorage.getItem(PROGRAMACION_SEMANAL_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error al cargar programación desde localStorage:', error);
      }
    }
    
    // Si no hay datos guardados, inicializar con un objeto vacío
    return Object.keys(DIAS_SEMANA).reduce((acc, dia) => ({
      ...acc,
      [dia]: []
    }), {}) as Record<DiaSemana, MenuCombinacion[]>;
  });
  
  const [plantillas, setPlantillas] = useState<PlantillaProgramacion[]>(() => {
    // Intentar cargar plantillas desde localStorage
    const savedPlantillas = safeLocalStorage.getItem(PLANTILLAS_KEY);
    if (savedPlantillas) {
      try {
        return JSON.parse(savedPlantillas);
      } catch (error) {
        console.error('Error al cargar plantillas desde localStorage:', error);
      }
    }
    
    return [];
  });
  
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('Lunes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guardar programación en localStorage cuando cambia
  useEffect(() => {
    if (!loading) {
      try {
        safeLocalStorage.setItem(PROGRAMACION_SEMANAL_KEY, JSON.stringify(programacionSemanal));
      } catch (error) {
        console.error('Error al guardar programación en localStorage:', error);
        setError('Error al guardar programación');
      }
    }
  }, [programacionSemanal, loading]);

  // Guardar plantillas en localStorage cuando cambian
  useEffect(() => {
    if (!loading) {
      try {
        safeLocalStorage.setItem(PLANTILLAS_KEY, JSON.stringify(plantillas));
      } catch (error) {
        console.error('Error al guardar plantillas en localStorage:', error);
        setError('Error al guardar plantillas');
      }
    }
  }, [plantillas, loading]);

  // Simular carga inicial de datos
  useEffect(() => {
    const cargarDatos = () => {
      setTimeout(() => {
        setCombinacionesDisponibles(COMBINACIONES_MOCK);
        setLoading(false);
      }, 1000); // Simular delay de red
    };

    cargarDatos();
  }, []);

  // Agregar una combinación a un día específico
  const agregarCombinacionAlDia = (dia: DiaSemana, combinacion: MenuCombinacion) => {
    setProgramacionSemanal(prev => ({
      ...prev,
      [dia]: [...prev[dia], combinacion]
    }));
  };

  // Remover una combinación de un día específico
  const removerCombinacionDelDia = (dia: DiaSemana, combinacionId: string) => {
    setProgramacionSemanal(prev => ({
      ...prev,
      [dia]: prev[dia].filter(c => c.id !== combinacionId)
    }));
  };

  // Copiar las combinaciones de un día a otro
  const copiarDia = (fromDia: DiaSemana, toDia: DiaSemana) => {
    setProgramacionSemanal(prev => ({
      ...prev,
      [toDia]: [...prev[fromDia]]
    }));
  };

  // Guardar la programación actual como plantilla
  const guardarPlantilla = (nombre: string) => {
    const nuevaPlantilla: PlantillaProgramacion = {
      id: `plantilla_${Date.now()}`,
      nombre,
      programacion: { ...programacionSemanal },
      fechaCreacion: new Date()
    };
    
    setPlantillas(prev => [...prev, nuevaPlantilla]);
    return nuevaPlantilla.id;
  };

  // Cargar una plantilla
  const cargarPlantilla = (plantillaId: string) => {
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (plantilla) {
      setProgramacionSemanal(plantilla.programacion);
      return true;
    }
    return false;
  };

  // Eliminar una plantilla
  const eliminarPlantilla = (plantillaId: string) => {
    setPlantillas(prev => prev.filter(p => p.id !== plantillaId));
  };

  // Programar automáticamente la semana (simulado)
  const programarAutomaticamente = () => {
    // En una implementación real, esto podría usar algoritmos de IA o reglas de negocio
    // para sugerir combinaciones basadas en historial de ventas, popularidad, etc.
    
    // Para esta demo, simplemente asignamos combinaciones aleatorias a cada día
    const nuevaProgramacion = { ...programacionSemanal };
    
    Object.keys(DIAS_SEMANA).forEach(dia => {
      // Asignar 2-4 combinaciones aleatorias a cada día
      const numCombinaciones = Math.floor(Math.random() * 3) + 2;
      const combinacionesAleatorias = [];
      
      for (let i = 0; i < numCombinaciones; i++) {
        const randomIndex = Math.floor(Math.random() * combinacionesDisponibles.length);
        combinacionesAleatorias.push(combinacionesDisponibles[randomIndex]);
      }
      
      nuevaProgramacion[dia as DiaSemana] = combinacionesAleatorias;
    });
    
    setProgramacionSemanal(nuevaProgramacion);
  };

  // Manejar el evento de soltar una combinación en un día
  const handleDrop = (dia: DiaSemana, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const combinacion = JSON.parse(e.dataTransfer.getData('combinacion')) as MenuCombinacion;
      agregarCombinacionAlDia(dia, combinacion);
    } catch (error) {
      console.error('Error al soltar combinación:', error);
      setError('Error al agregar combinación');
    }
  };

  return {
    combinacionesDisponibles,
    programacionSemanal,
    plantillas,
    diaSeleccionado,
    setDiaSeleccionado,
    loading,
    error,
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    copiarDia,
    guardarPlantilla,
    cargarPlantilla,
    eliminarPlantilla,
    programarAutomaticamente,
    handleDrop,
    diasSemana: Object.keys(DIAS_SEMANA) as DiaSemana[]
  };
};
