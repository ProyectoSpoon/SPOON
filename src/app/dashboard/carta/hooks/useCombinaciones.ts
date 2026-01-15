import { useState, useEffect, useCallback, useRef } from 'react';
import { Producto, MenuCombinacion, CategoriaMenu } from '../types/menu.types';
// REMOVED: import { favoritosService } from '../services/favoritos.service'; - FILE DELETED
import { combinacionesService } from '@/services/combinaciones.service';
import { combinacionesServicePostgres } from '@/services/postgres/combinaciones.service';
import { favoritosServicePostgres } from '@/services/postgres/favoritos.service';
import { toast } from 'sonner';

// Determina si usar PostgreSQL o Firebase
const USE_POSTGRES = true; // DEPRECATED: Always true now.


interface UseCombinacionesProps {
  productos: Producto[];
  restauranteId: string;
}

export function useCombinaciones({ productos, restauranteId }: UseCombinacionesProps) {
  const [combinaciones, setCombinaciones] = useState<MenuCombinacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  // Usamos un ref para evitar regenerar combinaciones innecesariamente
  const combinacionesGeneradas = useRef(false);

  // Seleccionamos el servicio adecuado según la configuración
  // Seleccionamos el servicio adecuado (PostgreSQL Only)
  const combService = combinacionesServicePostgres;
  const favService = favoritosServicePostgres;

  // Carga datos guardados de la base de datos
  const cargarDatosGuardados = useCallback(async () => {
    try {
      setLoadingFavoritos(true);

      // 1. Cargar favoritos con manejo de errores mejorado
      let favoritos: Record<string, any>[] = [];
      try {
        favoritos = await favService.getFavoritos(restauranteId);
      } catch (err) {
        console.error('Error al cargar favoritos:', err);
        // Continuamos con un array vacío en caso de error
      }

      const favoritosIds = new Set(favoritos.map(f => {
        // Para PostgreSQL usamos combinacion_id
        return (f as any).combinacion_id;
      }));

      // 2. Cargar combinaciones persistidas con manejo de errores mejorado
      let combinacionesGuardadas: Record<string, any>[] = [];
      try {
        combinacionesGuardadas = await combService.getCombinaciones(restauranteId);
        console.log('Combinaciones cargadas desde la base de datos:', combinacionesGuardadas);
      } catch (err) {
        console.error('Error al cargar combinaciones:', err);
        // Continuamos con un array vacío en caso de error
      }

      const mapaCombinaciones = new Map();

      combinacionesGuardadas.forEach(combo => {
        if (!combo) return; // Ignorar entradas nulas o indefinidas

        // Adaptamos la estructura según el origen de datos
        const comboId = combo.combinacionId || combo.id;
        if (!comboId) return; // Ignorar si no hay ID válido

        // Aseguramos que la programación sea un array y convertimos las fechas a objetos Date si son timestamps
        let programacion = combo.programacion || [];
        if (programacion && Array.isArray(programacion)) {
          programacion = programacion.map(prog => {
            if (!prog) return null; // Ignorar entradas nulas

            try {
              return {
                ...prog,
                // Si la fecha es un timestamp (objeto con seconds y nanoseconds) la convertimos a Date
                fecha: prog.fecha instanceof Date ?
                  prog.fecha :
                  (prog.fecha?.toDate ? prog.fecha.toDate() : new Date(prog.fecha))
              };
            } catch (e) {
              console.error('Error al procesar fecha de programación:', e);
              // En caso de error, crear un objeto con la fecha actual
              return {
                ...prog,
                fecha: new Date()
              };
            }
          }).filter(Boolean); // Eliminar entradas nulas
        }

        mapaCombinaciones.set(comboId, {
          cantidad: combo.cantidad || 0,
          especial: combo.especial || false,
          programacion: programacion
        });

        if (programacion.length > 0) {
          console.log(`Programación cargada para combo ${comboId}:`, programacion);
        }
      });

      // 3. Actualizar el estado con los datos recuperados
      setCombinaciones(prevCombinaciones =>
        prevCombinaciones.map(combinacion => {
          const datosGuardados = mapaCombinaciones.get(combinacion.id);

          return {
            ...combinacion,
            favorito: favoritosIds.has(combinacion.id),
            cantidad: datosGuardados?.cantidad || combinacion.cantidad || 0,
            especial: datosGuardados?.especial || combinacion.especial || false,
            programacion: datosGuardados?.programacion || combinacion.programacion || []
          };
        })
      );

      console.log('Datos de combinaciones cargados desde PostgreSQL');

    } catch (error) {
      console.error('Error al cargar datos guardados:', error);
      toast.error('No se pudieron cargar algunos datos guardados');
    } finally {
      setLoadingFavoritos(false);
    }
  }, [restauranteId]);

  const toggleFavorito = useCallback(async (id: string) => {
    try {
      // Actualizar estado local
      setCombinaciones(prevCombinaciones => {
        const nuevasCombinaciones = prevCombinaciones.map(combinacion =>
          combinacion.id === id
            ? { ...combinacion, favorito: !combinacion.favorito }
            : combinacion
        );

        // Persistir la combinación actualizada
        const combinacionActualizada = nuevasCombinaciones.find(c => c.id === id);
        if (combinacionActualizada) {
          // Actualizar en el servicio de favoritos
          favService.toggleFavorito(restauranteId, id).catch(err =>
            console.error('Error al togglear favorito en el servicio:', err)
          );

          // Persistir en la base de datos
          combService.guardarCombinacion(
            restauranteId,
            combinacionActualizada
          ).catch(err =>
            console.error(`Error al guardar favorito en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err)
          );
        }

        return nuevasCombinaciones;
      });
    } catch (error) {
      console.error('Error al togglear favorito:', error);
      toast.error('No se pudo actualizar el favorito');
    }
  }, [restauranteId]);

  const toggleEspecial = useCallback((id: string) => {
    setCombinaciones(prevCombinaciones => {
      const nuevasCombinaciones = prevCombinaciones.map(combinacion => {
        if (combinacion.id !== id) return combinacion;

        let combinacionActualizada;

        if (!combinacion.especial) {
          combinacionActualizada = {
            ...combinacion,
            especial: true,
            disponibilidadEspecial: {
              desde: new Date(),
              hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          };
        } else {
          combinacionActualizada = {
            ...combinacion,
            especial: false,
            disponibilidadEspecial: undefined
          };
        }

        // Persistir en la base de datos
        combService.guardarCombinacion(
          restauranteId,
          combinacionActualizada
        ).catch(err =>
          console.error(`Error al guardar estado especial en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err)
        );

        return combinacionActualizada;
      });

      return nuevasCombinaciones;
    });
  }, [restauranteId]);

  const filtrarProductosPorCategoria = useCallback((categoria: string): Producto[] => {
    return productos.filter(producto => producto.categoriaId === categoria);
  }, [productos]);

  const generarCombinaciones = useCallback(() => {
    // Si ya generamos combinaciones, no lo hacemos de nuevo
    if (combinacionesGeneradas.current) {
      console.log('Combinaciones ya generadas, omitiendo regeneración');
      return;
    }

    setLoading(true);
    console.log('Iniciando generación de combinaciones...');

    try {
      const entradas = filtrarProductosPorCategoria(CategoriaMenu.ENTRADA);
      const principios = filtrarProductosPorCategoria(CategoriaMenu.PRINCIPIO);
      const proteinas = filtrarProductosPorCategoria(CategoriaMenu.PROTEINA);
      const acompanamientos = filtrarProductosPorCategoria(CategoriaMenu.ACOMPANAMIENTO);
      const bebidas = filtrarProductosPorCategoria(CategoriaMenu.BEBIDA);

      if (!entradas.length || !principios.length || !proteinas.length ||
        !acompanamientos.length || !bebidas.length) {
        throw new Error('Faltan productos en algunas categorías');
      }

      console.log('Productos encontrados por categoría:');
      console.log(`Entradas: ${entradas.length}`);
      console.log(`Principios: ${principios.length}`);
      console.log(`Proteínas: ${proteinas.length}`);
      console.log(`Acompañamientos: ${acompanamientos.length}`);
      console.log(`Bebidas: ${bebidas.length}`);

      const nuevasCombinaciones: MenuCombinacion[] = [];
      let idCombinacion = 1;

      // Combinar cada entrada con todas las proteínas y principios disponibles
      entradas.forEach(entrada => {
        principios.forEach(principio => {
          proteinas.forEach(proteina => {
            // Seleccionar un acompañamiento y una bebida únicos para cada combinación
            // Usamos el índice de la combinación para seleccionar diferentes acompañamientos y bebidas
            const acompIndex = (idCombinacion - 1) % acompanamientos.length;
            const bebidaIndex = (idCombinacion - 1) % bebidas.length;

            nuevasCombinaciones.push({
              id: `menu-${idCombinacion++}`,
              entrada,
              principio,
              proteina,
              acompanamiento: [acompanamientos[acompIndex]], // Un solo acompañamiento único
              bebida: bebidas[bebidaIndex], // Una bebida única
              favorito: false,
              especial: false
            });
          });
        });
      });

      console.log(`Total de combinaciones generadas: ${nuevasCombinaciones.length}`);
      setCombinaciones(nuevasCombinaciones);
      setError(null);

      // Marcar que ya generamos combinaciones
      combinacionesGeneradas.current = true;

      // Cargar estado de favoritos después de generar combinaciones
      setTimeout(() => {
        cargarDatosGuardados();
      }, 0);
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error al generar combinaciones';
      setError(mensajeError);
      console.error('Error en generarCombinaciones:', mensajeError);
    } finally {
      setLoading(false);
    }
  }, [productos, filtrarProductosPorCategoria, cargarDatosGuardados, restauranteId]);

  // Método para actualizar la cantidad de una combinación
  const actualizarCantidad = useCallback((id: string, cantidad: number) => {
    setCombinaciones(prevCombinaciones => {
      const nuevasCombinaciones = prevCombinaciones.map(combinacion =>
        combinacion.id === id
          ? { ...combinacion, cantidad }
          : combinacion
      );

      // Persistir la combinación actualizada
      const combinacionActualizada = nuevasCombinaciones.find(c => c.id === id);
      if (combinacionActualizada) {
        // Persistir en la base de datos
        combService.guardarCombinacion(
          restauranteId,
          combinacionActualizada
        ).catch(err =>
          console.error(`Error al guardar cantidad en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err)
        );
      }

      return nuevasCombinaciones;
    });
  }, [restauranteId]);

  // Método para agregar programación a una combinación
  const agregarProgramacion = useCallback(async (id: string, programacion: { fecha: Date, cantidadProgramada: number }) => {
    try {
      // Primero buscamos la combinación actual para hacer la actualización correcta
      const combinacionActual = combinaciones.find(c => c.id === id);
      if (!combinacionActual) {
        throw new Error(`No se encontró la combinación con ID ${id}`);
      }

      // Creamos la nueva programación
      const nuevaProgramacion = combinacionActual.programacion
        ? [...combinacionActual.programacion, programacion]
        : [programacion];

      // Creamos la combinación actualizada
      const combinacionActualizada = {
        ...combinacionActual,
        programacion: nuevaProgramacion
      };

      // Primero actualizamos el estado local para mejorar la experiencia del usuario
      setCombinaciones(prevCombinaciones =>
        prevCombinaciones.map(combinacion =>
          combinacion.id === id
            ? { ...combinacion, programacion: nuevaProgramacion }
            : combinacion
        )
      );

      // Luego intentamos persistir
      try {
        // Persistir en la base de datos
        await combService.guardarCombinacion(restauranteId, combinacionActualizada);
        console.log(`Programación guardada exitosamente en ${USE_POSTGRES ? 'PostgreSQL' : 'Firebase'}`);
      } catch (dbError) {
        console.error(`Error al guardar programación:`, dbError);
        // Si falla la persistencia, intentamos nuevamente en segundo plano
        setTimeout(() => {
          combService.guardarCombinacion(restauranteId, combinacionActualizada)
            .catch(retryError => console.error('Error en segundo intento de guardar programación:', retryError));
        }, 5000);
      }
    } catch (err) {
      console.error(`Error general al programar combinación en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err);
      toast.error('Error al guardar la programación. Intente nuevamente.');
    }
  }, [restauranteId, combinaciones, combService]);

  // Método para editar una programación existente
  const editarProgramacion = useCallback(async (id: string, index: number, programacion: { fecha: Date, cantidadProgramada: number }) => {
    try {
      // Primero buscamos la combinación actual
      const combinacionActual = combinaciones.find(c => c.id === id);
      if (!combinacionActual || !combinacionActual.programacion) {
        throw new Error(`No se encontró la combinación con ID ${id} o no tiene programaciones`);
      }

      // Creamos la nueva programación actualizada
      const nuevaProgramacion = [...combinacionActual.programacion];
      nuevaProgramacion[index] = programacion;

      // Creamos la combinación actualizada
      const combinacionActualizada = {
        ...combinacionActual,
        programacion: nuevaProgramacion
      };

      // Primero actualizamos el estado local para mejorar la experiencia del usuario
      setCombinaciones(prevCombinaciones =>
        prevCombinaciones.map(combinacion =>
          combinacion.id === id
            ? { ...combinacion, programacion: nuevaProgramacion }
            : combinacion
        )
      );

      // Luego intentamos persistir
      try {
        // Persistir en la base de datos
        await combService.guardarCombinacion(restauranteId, combinacionActualizada);
        console.log(`Programación editada exitosamente en ${USE_POSTGRES ? 'PostgreSQL' : 'Firebase'}`);
      } catch (dbError) {
        console.error(`Error al editar programación:`, dbError);
        // Si falla la persistencia, intentamos nuevamente en segundo plano
        setTimeout(() => {
          combService.guardarCombinacion(restauranteId, combinacionActualizada)
            .catch(retryError => console.error('Error en segundo intento de editar programación:', retryError));
        }, 5000);
      }
    } catch (err) {
      console.error(`Error general al editar programación en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err);
      toast.error('Error al actualizar la programación. Intente nuevamente.');
    }
  }, [restauranteId, combinaciones, combService]);

  // Método para eliminar una programación
  const eliminarProgramacion = useCallback(async (id: string, index: number) => {
    try {
      // Primero buscamos la combinación actual
      const combinacionActual = combinaciones.find(c => c.id === id);
      if (!combinacionActual || !combinacionActual.programacion) {
        throw new Error(`No se encontró la combinación con ID ${id} o no tiene programaciones`);
      }

      // Creamos la nueva programación sin el elemento eliminado
      const nuevaProgramacion = combinacionActual.programacion.filter((_, idx) => idx !== index);

      // Creamos la combinación actualizada
      const combinacionActualizada = {
        ...combinacionActual,
        programacion: nuevaProgramacion
      };

      // Primero actualizamos el estado local para mejorar la experiencia del usuario
      setCombinaciones(prevCombinaciones =>
        prevCombinaciones.map(combinacion =>
          combinacion.id === id
            ? { ...combinacion, programacion: nuevaProgramacion }
            : combinacion
        )
      );

      // Luego intentamos persistir
      try {
        // Persistir en la base de datos
        await combService.guardarCombinacion(restauranteId, combinacionActualizada);
        console.log(`Programación eliminada exitosamente en ${USE_POSTGRES ? 'PostgreSQL' : 'Firebase'}`);
      } catch (dbError) {
        console.error(`Error al eliminar programación:`, dbError);
        // Si falla la persistencia, intentamos nuevamente en segundo plano
        setTimeout(() => {
          combService.guardarCombinacion(restauranteId, combinacionActualizada)
            .catch(retryError => console.error('Error en segundo intento de eliminar programación:', retryError));
        }, 5000);
      }
    } catch (err) {
      console.error(`Error general al eliminar programación en ${USE_POSTGRES ? 'PostgreSQL' : 'Firestore'}:`, err);
      toast.error('Error al eliminar la programación. Intente nuevamente.');
    }
  }, [restauranteId, combinaciones, combService]);

  // Efecto para generar combinaciones solo una vez
  useEffect(() => {
    if (productos.length > 0 && !combinacionesGeneradas.current) {
      generarCombinaciones();
    }
  }, [productos.length, generarCombinaciones]);

  // Efecto para cargar los datos guardados después de generar combinaciones
  useEffect(() => {
    if (combinaciones.length > 0 && !loading && combinacionesGeneradas.current) {
      cargarDatosGuardados();
    }
  }, [combinaciones.length, loading, cargarDatosGuardados]);

  return {
    combinaciones,
    loading: loading || loadingFavoritos,
    error,
    regenerarCombinaciones: generarCombinaciones,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad,
    agregarProgramacion,
    editarProgramacion,
    eliminarProgramacion,
    cargarDatosGuardados
  };
}
