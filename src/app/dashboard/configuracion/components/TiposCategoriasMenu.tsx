'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ConfiguracionCategorias } from '../../configuracion/categorias/components/ConfiguracionCategorias';
import { TipoRestaurante } from '../../configuracion/categorias/types/tipos';

export default function TiposCategoriasMenu() {
  const [tiposRestaurante, setTiposRestaurante] = useState<TipoRestaurante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar los tipos de restaurante desde el archivo JSON
  useEffect(() => {
    const cargarTiposRestaurante = async () => {
      try {
        setIsLoading(true);
        
        // Cargar tipos de restaurante
        const responseTipos = await fetch('/api/configuracion/tipos-restaurante');
        if (!responseTipos.ok) {
          throw new Error('Error al cargar los tipos de restaurante');
        }
        const dataTipos = await responseTipos.json();
        
        // Cargar categorías para cada tipo
        const tiposConCategorias = await Promise.all(
          dataTipos.tiposRestaurante.map(async (tipo: TipoRestaurante) => {
            try {
              const responseCategorias = await fetch(`/api/configuracion/categorias/${tipo.id}`);
              if (!responseCategorias.ok) {
                console.warn(`No se encontraron categorías para el tipo ${tipo.id}`);
                return { ...tipo, categorias: [] };
              }
              const dataCategorias = await responseCategorias.json();
              return { ...tipo, categorias: dataCategorias.categorias };
            } catch (error) {
              console.error(`Error al cargar categorías para el tipo ${tipo.id}:`, error);
              return { ...tipo, categorias: [] };
            }
          })
        );
        
        setTiposRestaurante(tiposConCategorias);
        setError(null);
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        setError('Error al cargar la configuración. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarTiposRestaurante();
  }, []);

  const handleSaveConfig = async (tiposActualizados: TipoRestaurante[]) => {
    try {
      setIsLoading(true);
      
      // Guardar cada tipo de restaurante y sus categorías
      await Promise.all(
        tiposActualizados.map(async (tipo) => {
          // Guardar tipo de restaurante
          const responseTipo = await fetch(`/api/configuracion/tipos-restaurante/${tipo.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tipo }),
          });
          
          if (!responseTipo.ok) {
            throw new Error(`Error al guardar el tipo de restaurante ${tipo.id}`);
          }
          
          // Guardar categorías del tipo
          const responseCategorias = await fetch(`/api/configuracion/categorias/${tipo.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categorias: tipo.categorias }),
          });
          
          if (!responseCategorias.ok) {
            throw new Error(`Error al guardar las categorías del tipo ${tipo.id}`);
          }
        })
      );
      
      setTiposRestaurante(tiposActualizados);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportTemplate = async (tipoId: string) => {
    try {
      setIsLoading(true);
      
      // Cargar plantilla para el tipo seleccionado
      const response = await fetch(`/api/configuracion/plantillas/${tipoId}`);
      if (!response.ok) {
        throw new Error(`No se encontró plantilla para el tipo ${tipoId}`);
      }
      
      const data = await response.json();
      
      // Actualizar el tipo de restaurante con la plantilla
      const tiposActualizados = tiposRestaurante.map(tipo => 
        tipo.id === tipoId ? { ...tipo, categorias: data.plantilla.categorias } : tipo
      );
      
      setTiposRestaurante(tiposActualizados);
      toast.success(`Plantilla para ${tipoId} importada correctamente`);
    } catch (error) {
      console.error('Error al importar plantilla:', error);
      toast.error('Error al importar plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Tipos de Restaurante y Categorías de Menú</h2>
      
      <ConfiguracionCategorias
        tiposRestaurante={tiposRestaurante}
        onSave={handleSaveConfig}
        onImportTemplate={handleImportTemplate}
      />
    </div>
  );
}
