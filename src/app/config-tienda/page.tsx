'use client';
import { useState } from 'react';
import { ChevronLeft, Info, X, Check } from 'lucide-react';
import { CATEGORIAS } from './types/categorias.tipos';
import { usarConfiguracionTienda } from './hooks/usarConfiguracionTienda';

const ConfiguracionTiendaPage = () => {
  // Inicializamos el hook pasándole las categorías
  const {
    datosTienda,
    categoriaActiva,
    subcategoriasSeleccionadas,
    actualizarDatosTienda,
    toggleCategoria,
    toggleSubcategoria,
    eliminarCategoria,
    formularioValido,
    obtenerSubcategoriasPorCategoria,
    esCategoriaSeleccionada,
    esSubcategoriaSeleccionada
  } = usarConfiguracionTienda(CATEGORIAS);

  // Función para manejar el cambio de inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    actualizarDatosTienda(e.target.name as any, e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b">
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5 mr-2" />
            <span className="text-lg font-medium">Crea tu tienda</span>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Formulario */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Cuéntanos más sobre tu tienda
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre de tu tienda"
                value={datosTienda.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección de tienda principal"
                value={datosTienda.direccion}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                name="ciudad"
                value={datosTienda.ciudad}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Ciudad</option>
                <option value="bogota">Bogotá</option>
                <option value="medellin">Medellín</option>
                <option value="cali">Cali</option>
              </select>
              
              <input
                type="date"
                name="fechaInicio"
                value={datosTienda.fechaInicio}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="¿En qué fecha iniciaste tu operación?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="number"
                name="puntosVenta"
                placeholder="¿Cuántos puntos de venta o de distribución tienes?"
                value={datosTienda.puntosVenta}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                name="empleados"
                placeholder="¿Cuántos empleados tienes?"
                value={datosTienda.empleados}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Selector de categorías */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-medium text-gray-900">¿Qué productos vendes?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIAS.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => toggleCategoria(categoria.id)}
                    className={`
                      relative p-4 border rounded-lg flex items-center space-x-3 transition-all
                      ${categoria.id === categoriaActiva 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : esCategoriaSeleccionada(categoria.id)
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-2xl">{categoria.icono}</span>
                    <span className="text-sm font-medium text-gray-700">{categoria.nombre}</span>
                    {esCategoriaSeleccionada(categoria.id) && (
                      <Check className="w-4 h-4 text-emerald-500 absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Subcategorías */}
              {categoriaActiva && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">
                    Subcategorías de {CATEGORIAS.find(c => c.id === categoriaActiva)?.nombre}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {obtenerSubcategoriasPorCategoria(categoriaActiva).map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubcategoria(categoriaActiva, sub.id)}
                        className={`
                          relative p-3 border rounded-lg text-left transition-all
                          ${esSubcategoriaSeleccionada(categoriaActiva, sub.id)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <h5 className="text-xs font-medium text-gray-800">{sub.nombre}</h5>
                        <p className="text-xs text-gray-500 mt-1">
                          {sub.productos.slice(0, 2).join(', ')}
                          {sub.productos.length > 2 && '...'}
                        </p>
                        {esSubcategoriaSeleccionada(categoriaActiva, sub.id) && (
                          <Check className="w-4 h-4 text-emerald-500 absolute top-2 right-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabla de selecciones */}
              {subcategoriasSeleccionadas.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Productos seleccionados
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Categoría
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Subcategoría
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subcategoriasSeleccionadas.map((seleccion) => (
                          <tr key={`${seleccion.categoriaId}-${seleccion.subcategoriaId}`}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {seleccion.categoriaNombre}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {seleccion.subcategoriaNombre}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => toggleSubcategoria(seleccion.categoriaId, seleccion.subcategoriaId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón continuar */}
          <div className="flex justify-end pt-6">
            <button
              type="button"
              disabled={!formularioValido}
              className={`
                px-6 py-2.5 rounded-lg text-white font-medium transition-colors
                ${formularioValido
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionTiendaPage;