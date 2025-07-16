'use client';

import { useState, useEffect } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';
import { Loader2, Badge, Percent, ArrowLeft, Edit3 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CombinacionEspecial {
  id: string;
  name: string;
  description: string;
  base_price: number;
  special_price: number;
  is_available: boolean;
  menu_date: string;
  menu_name: string;
  entrada_nombre?: string;
  entrada_imagen?: string;
  principio_nombre?: string;
  principio_imagen?: string;
  proteina_nombre: string;
  proteina_imagen?: string;
  bebida_nombre?: string;
  bebida_imagen?: string;
  acompanamientos: Array<{
    id: string;
    nombre: string;
    imagen?: string;
    cantidad: number;
  }>;
  descuento_porcentaje: number;
}

export default function EspecialesPage(): JSX.Element {
  const router = useRouter();
  const [especiales, setEspeciales] = useState<CombinacionEspecial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEspeciales = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/combinaciones/especiales');
        
        if (!response.ok) {
          throw new Error('Error al obtener especiales');
        }
        
        const data = await response.json();
        setEspeciales(data.especiales || []);
      } catch (error) {
        console.error('Error al cargar especiales:', error);
        setError('Error al cargar platos especiales');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEspeciales();
  }, []);

  const handleRemoveEspecial = async (id: string) => {
    try {
      const response = await fetch('/api/combinaciones/especiales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          esEspecial: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al remover especial');
      }
      
      setEspeciales(prev => prev.filter(e => e.id !== id));
      toast.success('Combinación removida de especiales');
    } catch (error) {
      console.error('Error al remover especial:', error);
      toast.error('Error al remover especial');
    }
  };

  const handleEditPrecio = async (id: string, precioActual: number) => {
    const nuevoPrecio = prompt('Ingrese el nuevo precio especial:', precioActual.toString());
    
    if (!nuevoPrecio || isNaN(Number(nuevoPrecio))) {
      toast.error('Precio inválido');
      return;
    }

    const precio = Number(nuevoPrecio);
    const especial = especiales.find(e => e.id === id);
    
    if (!especial) return;
    
    if (precio >= especial.base_price) {
      toast.error('El precio especial debe ser menor al precio base');
      return;
    }

    try {
      const response = await fetch('/api/combinaciones/especiales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          esEspecial: true,
          precioEspecial: precio
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar precio');
      }
      
      setEspeciales(prev => prev.map(e => 
        e.id === id 
          ? { 
              ...e, 
              special_price: precio,
              descuento_porcentaje: Math.round(((e.base_price - precio) / e.base_price) * 100)
            }
          : e
      ));
      
      toast.success('Precio especial actualizado');
    } catch (error) {
      console.error('Error al actualizar precio:', error);
      toast.error('Error al actualizar precio');
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
    <div className="px-6 py-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center">
          <Badge className="h-6 w-6 text-orange-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Platos Especiales
          </h1>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : especiales.length === 0 ? (
        <div className="text-center py-12">
          <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No hay platos especiales
          </h3>
          <p className="text-gray-500 mb-6">
            Marca combinaciones como especiales con precios promocionales
          </p>
          <Button
            onClick={() => router.push('/dashboard/carta/combinaciones')}
            className="bg-spoon-primary hover:bg-spoon-primary-dark text-white"
          >
            Ver Combinaciones
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especiales.map((especial) => (
            <div
              key={especial.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              {/* Badge de descuento */}
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <Percent className="h-3 w-3 mr-1" />
                  {especial.descuento_porcentaje}% OFF
                </div>
              </div>

              {/* Header de la tarjeta */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-12">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {especial.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {especial.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {especial.menu_name}
                      </span>
                      <span className="ml-2">
                        {new Date(especial.menu_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleEditPrecio(especial.id, especial.special_price)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Editar precio especial"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveEspecial(especial.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Remover de especiales"
                    >
                      <Badge className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido de la combinación */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Entrada */}
                  {especial.entrada_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Entrada:</span>
                      <span className="text-gray-800">{especial.entrada_nombre}</span>
                    </div>
                  )}

                  {/* Principio */}
                  {especial.principio_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Principio:</span>
                      <span className="text-gray-800">{especial.principio_nombre}</span>
                    </div>
                  )}

                  {/* Proteína */}
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 w-20">Proteína:</span>
                    <span className="text-gray-800">{especial.proteina_nombre}</span>
                  </div>

                  {/* Bebida */}
                  {especial.bebida_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Bebida:</span>
                      <span className="text-gray-800">{especial.bebida_nombre}</span>
                    </div>
                  )}

                  {/* Acompañamientos */}
                  {especial.acompanamientos.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Acompañamientos:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {especial.acompanamientos.map((acomp) => (
                          <span
                            key={acomp.id}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {acomp.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Precio y estado */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {/* Precios */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">
                        ${especial.special_price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${especial.base_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        Ahorras ${(especial.base_price - especial.special_price).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        especial.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {especial.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                    <div className="text-xs text-gray-500">
                      Oferta especial
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



























