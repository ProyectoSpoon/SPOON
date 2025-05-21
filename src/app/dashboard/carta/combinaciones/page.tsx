'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, TableIcon, GridIcon, Star, Badge } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { TablaCombinaciones } from '../components/tabla-combinaciones/TablaCombinaciones';
import { TarjetasCombinaciones } from '../components/tarjetas-combinaciones/TarjetasCombinaciones';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import { useCombinaciones } from '../hooks/useCombinaciones';
import { Producto, MenuCombinacion, CategoriaMenu } from '../types/menu.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cacheUtils } from '@/utils/cache.utils';
import { combinacionesService } from '@/services/combinaciones.service';

// ID de restaurante de prueba
const RESTAURANTE_ID_PRUEBA = 'rest-test-001';

export default function CombinacionesPage(): JSX.Element {
  const router = useRouter();
  const [vistaTabla, setVistaTabla] = useState(true);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(false);
  const [combinaciones, setCombinaciones] = useState<MenuCombinacion[]>([]);

  const initializeProducts = (): Producto[] => {
    try {
      // En el servidor, no tenemos acceso a localStorage
      if (typeof window === 'undefined') {
        console.log('Ejecutando en el servidor, no hay acceso a localStorage');
        return [];
      }
      
      // Primero intentar cargar combinaciones generadas directamente
      const combinacionesGuardadas = window.localStorage.getItem('combinacionesGeneradas');
      if (combinacionesGuardadas) {
        console.log('Combinaciones encontradas en localStorage');
        // Si hay combinaciones, no necesitamos productos
        // Estableceremos las combinaciones directamente más adelante
        return [];
      }
      
      // Si no hay combinaciones, intentar cargar productos del caché
      const cachedData = cacheUtils.get();
      if (cachedData) {
        console.log('Productos encontrados en caché');
        return cachedData;
      }

      // Finalmente, intentar cargar productos de localStorage
      const productosGuardados = window.localStorage.getItem('productosParaCombinar');
      if (!productosGuardados) {
        console.log('No se encontraron productos en localStorage');
        return [];
      }

      console.log('Productos encontrados en localStorage');
      const productosParseados = JSON.parse(productosGuardados);
      window.localStorage.removeItem('productosParaCombinar');
      return productosParseados;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  };

  // Inicializar productos y combinaciones
  const [productos, setProductos] = useState<Producto[]>(initializeProducts);
  
  // Cargar combinaciones desde el archivo JSON
  useEffect(() => {
    const fetchCombinaciones = async () => {
      try {
        setIsLoading(true);
        
        // Hacer la petición a la API
        const response = await fetch('/api/combinaciones');
        
        if (!response.ok) {
          throw new Error('Error al obtener las combinaciones');
        }
        
        const data = await response.json();
        
        if (data.combinaciones && Array.isArray(data.combinaciones)) {
          console.log('Combinaciones cargadas desde el archivo JSON:', data.combinaciones.length);
          
          // Transformar las combinaciones al formato esperado
          const combinacionesFormateadas = data.combinaciones.map((comb: any, index: number) => {
            // Extraer productos por categoría
            const productos = comb.productos || [];
            const entrada = productos.find((p: any) => p.categoriaId === 'CAT_001');
            const principio = productos.find((p: any) => p.categoriaId === 'CAT_002');
            const proteina = productos.find((p: any) => p.categoriaId === 'CAT_003');
            const acompanamiento = productos.filter((p: any) => p.categoriaId === 'CAT_004');
            const bebida = productos.find((p: any) => p.categoriaId === 'CAT_005');
            
            return {
              id: comb.id || `COMB_${index + 1}`,
              nombre: comb.nombre || `Combinación ${index + 1}`,
              productos: comb.productos || [],
              entrada: entrada,
              principio: principio,
              proteina: proteina,
              acompanamiento: acompanamiento,
              bebida: bebida,
              favorito: comb.esFavorito || false,
              especial: comb.esEspecial || false,
              cantidad: comb.cantidad || 1,
              programacion: comb.programacion || [],
              fechaCreacion: comb.fechaCreacion || new Date().toISOString()
            };
          });
          
          setCombinaciones(combinacionesFormateadas);
          setIsLoading(false);
        } else {
          throw new Error('Formato de combinaciones inválido');
        }
      } catch (error) {
        console.error('Error al cargar combinaciones desde el archivo JSON:', error);
        setError('Error al cargar combinaciones. Por favor, verifica que el archivo exista en la ruta correcta.');
        setIsLoading(false);
      }
    };
    
    fetchCombinaciones();
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    combinaciones: combinacionesIniciales, 
    loading: loadingCombinaciones, 
    error: errorCombinaciones,
    regenerarCombinaciones,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad,
    agregarProgramacion,
    editarProgramacion,
    eliminarProgramacion
  } = useCombinaciones({ 
    productos, 
    restauranteId: RESTAURANTE_ID_PRUEBA 
  });

  useEffect(() => {
    // Solo establecer combinaciones desde el hook si no tenemos combinaciones cargadas desde el archivo JSON
    if (combinaciones.length === 0 && combinacionesIniciales.length > 0) {
      setCombinaciones(combinacionesIniciales);
    }
  }, [combinacionesIniciales, combinaciones.length]);

  const combinacionesFiltradas = useMemo(() => {
    let resultado = [...combinaciones];
    
    if (mostrarFavoritos) {
      resultado = resultado.filter(c => c.favorito);
    }
    
    if (mostrarEspeciales) {
      resultado = resultado.filter(c => c.especial);
    }
    
    return resultado;
  }, [combinaciones, mostrarFavoritos, mostrarEspeciales]);

  const validarProductos = () => {
    // Si ya tenemos combinaciones cargadas desde el archivo JSON, no necesitamos validar productos
    if (combinaciones.length > 0) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Solo validamos productos si no hay combinaciones cargadas desde el archivo JSON
      if (productos.length === 0) {
        // No lanzamos error, simplemente mostramos un mensaje informativo
        console.log('No se encontraron productos para generar combinaciones. Usando combinaciones del archivo JSON.');
        return;
      }

      const categorias = new Set(productos.map(p => p.categoriaId));
      const categoriasRequeridas = [
        CategoriaMenu.ENTRADA,
        CategoriaMenu.PRINCIPIO,
        CategoriaMenu.PROTEINA,
        CategoriaMenu.ACOMPANAMIENTO,
        CategoriaMenu.BEBIDA
      ];
      const categoriasFaltantes = categoriasRequeridas.filter(cat => !categorias.has(cat));

      if (categoriasFaltantes.length > 0) {
        console.warn(`Faltan productos de las categorías: ${categoriasFaltantes.join(', ')}. Usando combinaciones del archivo JSON.`);
      }

      if (!cacheUtils.get()) {
        cacheUtils.set(productos);
      }
    } catch (err) {
      console.error('Error al validar productos:', err);
      // No redirigimos ni mostramos error, ya que estamos usando combinaciones del archivo JSON
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validarProductos();
  }, [productos, router]);

  const handleCambiarVista = (): void => {
    setVistaTabla(!vistaTabla);
    console.log('Cambiando vista a:', vistaTabla ? 'Tarjetas' : 'Tabla');
  };

  const handleToggleFavorito = (id: string) => {
    toggleFavorito(id);
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => 
        combinacion.id === id 
          ? { ...combinacion, favorito: !combinacion.favorito }
          : combinacion
      )
    );
    toast.success('Estado de favorito actualizado');
  };

  const handleToggleEspecial = (id: string) => {
    toggleEspecial(id);
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id !== id) return combinacion;
        return { 
          ...combinacion, 
          especial: !combinacion.especial 
        };
      })
    );
    toast.success('Estado especial actualizado');
  };

  const handleUpdateCantidad = (id: string, cantidad: number) => {
    // Actualizar la cantidad usando el método del hook
    actualizarCantidad(id, cantidad);
    
    // Actualizar también el estado local para reflejar el cambio inmediatamente
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => 
        combinacion.id === id 
          ? { ...combinacion, cantidad }
          : combinacion
      )
    );
  };


  if (isLoading || loadingCombinaciones) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
            Combinaciones de Menú
          </h1>
          
          {/* Indicador de caché */}
          <CacheTimer variant="compact" />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              variant="outline"
              className={`transition-all duration-200 ${
                mostrarFavoritos 
                  ? "bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)]" 
                  : "border-[var(--spoon-primary)] text-[var(--spoon-primary)] hover:bg-[var(--spoon-primary-light)]"
              }`}
              onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
            >
              <Star className={`h-4 w-4 mr-2 ${mostrarFavoritos ? "fill-current" : ""}`} />
              Favoritos
            </Button>
            <Button 
              variant="outline"
              className={`transition-all duration-200 ${
                mostrarEspeciales 
                  ? "bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)]" 
                  : "border-[var(--spoon-primary)] text-[var(--spoon-primary)] hover:bg-[var(--spoon-primary-light)]"
              }`}
              onClick={() => setMostrarEspeciales(!mostrarEspeciales)}
            >
              <Badge className="h-4 w-4 mr-2" />
              Platos Especiales
            </Button>
          </div>

          {/* Botón de cambio de vista */}
          <div className="flex gap-4 items-center">
            <Button 
              onClick={handleCambiarVista}
              variant="outline"
              className="bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)] transition-colors duration-200 px-6 py-2 mx-4"
              type="button"
            >
              {vistaTabla ? (
                <>
                  <GridIcon className="h-4 w-4 mr-2" />
                  Vista Tarjetas
                </>
              ) : (
                <>
                  <TableIcon className="h-4 w-4 mr-2" />
                  Vista Tabla
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div key={vistaTabla ? 'tabla' : 'tarjetas'}>
        {vistaTabla ? (
          <TablaCombinaciones 
            combinaciones={combinacionesFiltradas} 
            isLoading={loadingCombinaciones}
            onToggleFavorito={handleToggleFavorito}
            onToggleEspecial={handleToggleEspecial}
            onUpdateCantidad={handleUpdateCantidad}
          />
        ) : (
          <TarjetasCombinaciones 
            combinaciones={combinacionesFiltradas} 
            isLoading={loadingCombinaciones}
            onToggleFavorito={handleToggleFavorito}
            onToggleEspecial={handleToggleEspecial}
            onUpdateCantidad={handleUpdateCantidad}
          />
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

    </div>
  );
}
