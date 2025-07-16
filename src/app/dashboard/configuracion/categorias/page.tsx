'use client';

import { useState, useEffect } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';
import { Loader2 } from 'lucide-react';
import { ConfiguracionCategorias } from './components/ConfiguracionCategorias';
import { TipoRestaurante } from './types/tipos';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';

export default function CategoriasConfiguracionPage() {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Configuración de Categorías', 'Gestión de categorías de productos');
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
      
      // En una implementación real, aquí se enviarían los datos al servidor
      // Para esta demo, simulamos una operación exitosa
      console.log('Guardando configuración:', tiposActualizados);
      
      // Simular tiempo de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-spoon-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)]">
          Configuración de Categorías
        </h1>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Recargar
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <ConfiguracionCategorias
        tiposRestaurante={tiposRestaurante}
        onSave={handleSaveConfig}
        onImportTemplate={handleImportTemplate}
      />
    </div>
  );
}


























