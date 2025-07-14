'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CombinacionFavorita {
  id: string;
  name: string;
  description: string;
  base_price: number;
  special_price?: number;
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
}

export default function FavoritosPage(): JSX.Element {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<CombinacionFavorita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/combinaciones/favoritos');
        
        if (!response.ok) {
          throw new Error('Error al obtener favoritos');
        }
        
        const data = await response.json();
        setFavoritos(data.favoritos || []);
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        setError('Error al cargar favoritos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritos();
  }, []);

  const handleRemoveFavorito = async (id: string) => {
    try {
      const response = await fetch('/api/combinaciones/favoritos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          combinacionId: id,
          esFavorito: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al remover favorito');
      }
      
      setFavoritos(prev => prev.filter(f => f.id !== id));
      toast.success('Combinación removida de favoritos');
    } catch (error) {
      console.error('Error al remover favorito:', error);
      toast.error('Error al remover favorito');
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
          <Star className="h-6 w-6 text-yellow-500 mr-2 fill-current" />
          <h1 className="text-2xl font-bold text-gray-800">
            Platos Favoritos
          </h1>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No hay platos favoritos
          </h3>
          <p className="text-gray-500 mb-6">
            Marca combinaciones como favoritas para verlas aquí
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
          {favoritos.map((favorito) => (
            <div
              key={favorito.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header de la tarjeta */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {favorito.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {favorito.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {favorito.menu_name}
                      </span>
                      <span className="ml-2">
                        {new Date(favorito.menu_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorito(favorito.id)}
                    className="text-yellow-500 hover:text-yellow-600 transition-colors"
                    title="Remover de favoritos"
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Contenido de la combinación */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Entrada */}
                  {favorito.entrada_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Entrada:</span>
                      <span className="text-gray-800">{favorito.entrada_nombre}</span>
                    </div>
                  )}

                  {/* Principio */}
                  {favorito.principio_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Principio:</span>
                      <span className="text-gray-800">{favorito.principio_nombre}</span>
                    </div>
                  )}

                  {/* Proteína */}
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 w-20">Proteína:</span>
                    <span className="text-gray-800">{favorito.proteina_nombre}</span>
                  </div>

                  {/* Bebida */}
                  {favorito.bebida_nombre && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">Bebida:</span>
                      <span className="text-gray-800">{favorito.bebida_nombre}</span>
                    </div>
                  )}

                  {/* Acompañamientos */}
                  {favorito.acompanamientos.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Acompañamientos:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {favorito.acompanamientos.map((acomp, index) => (
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
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {favorito.special_price ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          ${favorito.special_price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${favorito.base_price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">
                        ${favorito.base_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        favorito.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {favorito.is_available ? 'Disponible' : 'No disponible'}
                    </span>
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



























