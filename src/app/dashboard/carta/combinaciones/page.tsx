'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, TableIcon, GridIcon, Star, Badge } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { TablaCombinaciones } from '../components/tabla-combinaciones/TablaCombinaciones';
import { TarjetasCombinaciones } from '../components/tarjetas-combinaciones/TarjetasCombinaciones';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import { MenuCombinacion } from '../types/menu.types';
import { toast } from 'sonner';
import { RESTAURANTE_ID } from '../constants/categorias';

interface CombinacionDB {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  precioEspecial?: number | null;
  esFavorito: boolean;
  esEspecial: boolean;
  disponible: boolean;
  cantidadMaxima: number;
  cantidadActual: number;
  cantidadVendida: number;
  fechaCreacion: string;
  entrada?: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
  } | null;
  principio?: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
  } | null;
  proteina?: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
  } | null;
  bebida?: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
  } | null;
}

export default function CombinacionesPage(): JSX.Element {
  const [vistaTabla, setVistaTabla] = useState(true);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(false);
  const [combinaciones, setCombinaciones] = useState<MenuCombinacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuDelDia, setMenuDelDia] = useState<any>(null);

  // Cargar combinaciones desde PostgreSQL
  useEffect(() => {
    const fetchCombinaciones = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Cargando combinaciones desde PostgreSQL...');
        const response = await fetch('/api/menu-dia/combinaciones');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Error al cargar combinaciones');
        }
        
        console.log('Datos recibidos:', data);
        
        // Transformar datos de PostgreSQL al formato esperado por el frontend
        const combinacionesFormateadas: MenuCombinacion[] = data.combinaciones.map((comb: CombinacionDB) => ({
          id: comb.id,
          nombre: comb.nombre,
          descripcion: comb.descripcion,
          productos: [], // Mantener para compatibilidad con componentes existentes
          entrada: comb.entrada ? {
            id: comb.entrada.id,
            nombre: comb.entrada.nombre,
            descripcion: comb.entrada.descripcion,
            precio: comb.entrada.precio,
            categoriaId: 'b4e792ba-b00d-4348-b9e3-f34992315c23' // ID real de Entradas
          } : undefined,
          principio: comb.principio ? {
            id: comb.principio.id,
            nombre: comb.principio.nombre,
            descripcion: comb.principio.descripcion,
            precio: comb.principio.precio,
            categoriaId: '2d4c3ea8-843e-4312-821e-54d1c4e79dce' // ID real de Principios
          } : undefined,
          proteina: comb.proteina ? {
            id: comb.proteina.id,
            nombre: comb.proteina.nombre,
            descripcion: comb.proteina.descripcion,
            precio: comb.proteina.precio,
            categoriaId: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3' // ID real de Proteínas
          } : undefined,
          acompanamiento: [], // Se puede extender si se agregan acompañamientos
          bebida: comb.bebida ? {
            id: comb.bebida.id,
            nombre: comb.bebida.nombre,
            descripcion: comb.bebida.descripcion,
            precio: comb.bebida.precio,
            categoriaId: '6feba136-57dc-4448-8357-6f5533177cfd' // ID real de Bebidas
          } : undefined,
          favorito: comb.esFavorito,
          especial: comb.esEspecial,
          cantidad: comb.cantidadActual,
          precioBase: comb.precioBase,
          precioEspecial: comb.precioEspecial,
          programacion: [], // Se puede extender si se necesita programación
          fechaCreacion: comb.fechaCreacion
        }));
        
        setCombinaciones(combinacionesFormateadas);
        setMenuDelDia(data.menuDelDia);
        
        console.log(`✅ Cargadas ${combinacionesFormateadas.length} combinaciones`);
        
      } catch (error) {
        console.error('Error al cargar combinaciones:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Error desconocido al cargar las combinaciones'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCombinaciones();
  }, []);

  // Filtrar combinaciones
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

  const handleCambiarVista = (): void => {
    setVistaTabla(!vistaTabla);
    console.log('Cambiando vista a:', vistaTabla ? 'Tarjetas' : 'Tabla');
  };

  const handleToggleFavorito = async (id: string) => {
    try {
      const combinacion = combinaciones.find(c => c.id === id);
      if (!combinacion) return;
      
      const nuevoEstado = !combinacion.favorito;
      
      const response = await fetch('/api/menu-dia/combinaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          accion: 'toggle_favorito',
          datos: { esFavorito: nuevoEstado }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar favorito');
      }
      
      setCombinaciones(prevCombinaciones => 
        prevCombinaciones.map(combinacion => 
          combinacion.id === id 
            ? { ...combinacion, favorito: nuevoEstado }
            : combinacion
        )
      );
      
      toast.success(`Combinación ${nuevoEstado ? 'agregada a' : 'removida de'} favoritos`);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      toast.error('Error al actualizar favorito');
    }
  };

  const handleToggleEspecial = async (id: string) => {
    try {
      const combinacion = combinaciones.find(c => c.id === id);
      if (!combinacion) return;
      
      const nuevoEstado = !combinacion.especial;
      let precioEspecial = null;
      
      if (nuevoEstado) {
        const precioInput = prompt('Ingrese el precio especial:', combinacion.precioBase?.toString() || '0');
        if (!precioInput || isNaN(Number(precioInput))) {
          toast.error('Precio especial inválido');
          return;
        }
        precioEspecial = Number(precioInput);
        
        if (precioEspecial >= (combinacion.precioBase || 0)) {
          toast.error('El precio especial debe ser menor al precio base');
          return;
        }
      }
      
      const response = await fetch('/api/menu-dia/combinaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          accion: 'toggle_especial',
          datos: { 
            esEspecial: nuevoEstado,
            precioEspecial: precioEspecial
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar especial');
      }
      
      setCombinaciones(prevCombinaciones => 
        prevCombinaciones.map(combinacion => {
          if (combinacion.id !== id) return combinacion;
          return { 
            ...combinacion, 
            especial: nuevoEstado,
            precioEspecial: precioEspecial
          };
        })
      );
      
      toast.success(`Combinación ${nuevoEstado ? 'marcada' : 'desmarcada'} como especial`);
    } catch (error) {
      console.error('Error al actualizar especial:', error);
      toast.error('Error al actualizar especial');
    }
  };

  const handleUpdateCantidad = async (id: string, cantidad: number) => {
    try {
      const response = await fetch('/api/menu-dia/combinaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          accion: 'actualizar_cantidad',
          datos: { cantidad }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar cantidad');
      }
      
      setCombinaciones(prevCombinaciones => 
        prevCombinaciones.map(combinacion => 
          combinacion.id === id 
            ? { ...combinacion, cantidad }
            : combinacion
        )
      );
      
      toast.success('Cantidad actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
        <span className="ml-2 text-gray-600">Cargando combinaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <br />
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Intentar de nuevo
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
              Combinaciones de Menú
            </h1>
            {menuDelDia && (
              <p className="text-sm text-gray-600 mt-1">
                {menuDelDia.nombre} - {new Date(menuDelDia.fecha).toLocaleDateString('es-CO')}
              </p>
            )}
          </div>
          
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
              Favoritos ({combinaciones.filter(c => c.favorito).length})
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
              Especiales ({combinaciones.filter(c => c.especial).length})
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">
              {combinacionesFiltradas.length} de {combinaciones.length} combinaciones
            </span>
            <Button 
              onClick={handleCambiarVista}
              variant="outline"
              className="bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)] transition-colors duration-200 px-6 py-2"
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
        {combinacionesFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {mostrarFavoritos || mostrarEspeciales 
                ? 'No hay combinaciones que coincidan con los filtros seleccionados'
                : 'No hay combinaciones disponibles'
              }
            </p>
            {(mostrarFavoritos || mostrarEspeciales) && (
              <Button 
                onClick={() => {
                  setMostrarFavoritos(false);
                  setMostrarEspeciales(false);
                }}
                variant="outline"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {vistaTabla ? (
              <TablaCombinaciones 
                combinaciones={combinacionesFiltradas} 
                isLoading={false}
                onToggleFavorito={handleToggleFavorito}
                onToggleEspecial={handleToggleEspecial}
                onUpdateCantidad={handleUpdateCantidad}
              />
            ) : (
              <TarjetasCombinaciones 
                combinaciones={combinacionesFiltradas} 
                isLoading={false}
                onToggleFavorito={handleToggleFavorito}
                onToggleEspecial={handleToggleEspecial}
                onUpdateCantidad={handleUpdateCantidad}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}